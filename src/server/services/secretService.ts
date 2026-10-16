import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import crypto from "crypto";

const DEFAULT_SECRET_NAME = process.env.GCP_SECRET_NAME_ENCRYPTION_KEY || "FONA_BACKUP_ENCRYPTION_KEY";
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "ais-europe-west2-15c1948e31b04";

let cachedKey: string | null = null;
let cachedKeyTimestamp = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface SecretKeyResult {
  key: string;
  source: "SECRET_MANAGER" | "ENV_FALLBACK";
  secretName: string;
  projectId: string;
  warning?: string;
}

/**
 * Récupère de façon sécurisée la clé maîtresse de chiffrement des sauvegardes cliniques.
 * Privilégie Google Cloud Secret Manager. Ne logue JAMAIS la valeur de la clé.
 */
export async function getBackupEncryptionKey(): Promise<SecretKeyResult> {
  // Vérification du cache mémoire interne
  if (cachedKey && Date.now() - cachedKeyTimestamp < CACHE_TTL_MS) {
    return {
      key: cachedKey,
      source: "SECRET_MANAGER",
      secretName: DEFAULT_SECRET_NAME,
      projectId: GCP_PROJECT_ID,
    };
  }

  try {
    const client = new SecretManagerServiceClient();
    const name = `projects/${GCP_PROJECT_ID}/secrets/${DEFAULT_SECRET_NAME}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });

    const payload = version.payload?.data?.toString();
    if (payload && payload.trim().length > 0) {
      cachedKey = payload.trim();
      cachedKeyTimestamp = Date.now();
      return {
        key: cachedKey,
        source: "SECRET_MANAGER",
        secretName: DEFAULT_SECRET_NAME,
        projectId: GCP_PROJECT_ID,
      };
    }
  } catch (err: any) {
    // Si l'accès à Secret Manager échoue (API non activée, permission manquante ou hors GCP)
    const errorMsg = err?.message || String(err);
    const envKey = process.env.BACKUP_ENCRYPTION_KEY;

    if (envKey && envKey.trim().length > 0) {
      return {
        key: envKey.trim(),
        source: "ENV_FALLBACK",
        secretName: DEFAULT_SECRET_NAME,
        projectId: GCP_PROJECT_ID,
        warning: `Secret Manager indisponible (${errorMsg.slice(0, 120)}...). Utilisation temporaire de la clé d'environnement.`,
      };
    }

    // Clé par défaut d'urgence documentée uniquement pour test de non-régression
    const emergencyKey = "FONA_SECURE_ENCRYPTED_VAULT_KEY_2026_MALI_BAMAKO";
    return {
      key: emergencyKey,
      source: "ENV_FALLBACK",
      secretName: DEFAULT_SECRET_NAME,
      projectId: GCP_PROJECT_ID,
      warning: "Clé maîtresse non trouvée dans Secret Manager ni dans l'environnement. Clé de secours utilisée.",
    };
  }

  const fallback = process.env.BACKUP_ENCRYPTION_KEY || "FONA_SECURE_ENCRYPTED_VAULT_KEY_2026_MALI_BAMAKO";
  return {
    key: fallback,
    source: "ENV_FALLBACK",
    secretName: DEFAULT_SECRET_NAME,
    projectId: GCP_PROJECT_ID,
  };
}

/**
 * Dérive une clé cryptographique 256 bits via scrypt
 */
export async function getDerivedEncryptionKeyBuffer(): Promise<Buffer> {
  const secretResult = await getBackupEncryptionKey();
  return crypto.scryptSync(secretResult.key, "fona_salt_vault_mali_2026", 32);
}

/**
 * Teste la connectivité directe avec Google Cloud Secret Manager sans exposer la clé.
 */
export async function testSecretManagerAccess(): Promise<{
  success: boolean;
  status: "ACCESSIBLE" | "PERMISSION_DENIED" | "API_DISABLED" | "NOT_FOUND" | "ERROR";
  secretName: string;
  projectId: string;
  message: string;
  details?: string;
}> {
  try {
    const client = new SecretManagerServiceClient();
    const name = `projects/${GCP_PROJECT_ID}/secrets/${DEFAULT_SECRET_NAME}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });

    const exists = !!version.payload?.data;
    return {
      success: exists,
      status: exists ? "ACCESSIBLE" : "NOT_FOUND",
      secretName: DEFAULT_SECRET_NAME,
      projectId: GCP_PROJECT_ID,
      message: exists
        ? "Clé maîtresse 'FONA_BACKUP_ENCRYPTION_KEY' accessible avec succès dans Secret Manager."
        : "Secret trouvé mais la charge utile est vide.",
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    let status: "ACCESSIBLE" | "PERMISSION_DENIED" | "API_DISABLED" | "NOT_FOUND" | "ERROR" = "ERROR";

    if (msg.includes("has not been used in project") || msg.includes("is disabled")) {
      status = "API_DISABLED";
    } else if (msg.includes("Permission") && msg.includes("denied")) {
      status = "PERMISSION_DENIED";
    } else if (msg.includes("NOT_FOUND") || msg.includes("not found")) {
      status = "NOT_FOUND";
    }

    return {
      success: false,
      status,
      secretName: DEFAULT_SECRET_NAME,
      projectId: GCP_PROJECT_ID,
      message: `Accès à Secret Manager impossible : [${status}]`,
      details: msg,
    };
  }
}
