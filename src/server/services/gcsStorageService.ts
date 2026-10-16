import { Storage } from "@google-cloud/storage";
import crypto from "crypto";

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "ais-europe-west2-15c1948e31b04";
export const GCS_BACKUP_BUCKET = process.env.GCS_BACKUP_BUCKET || `fona-backups-${GCP_PROJECT_ID}`;
export const GCS_BACKUP_REGION = process.env.GCS_BACKUP_REGION || "europe-west2";

let storageClient: Storage | null = null;

function getStorageClient(): Storage {
  if (!storageClient) {
    storageClient = new Storage({
      projectId: GCP_PROJECT_ID,
    });
  }
  return storageClient;
}

export interface GcsUploadResult {
  success: boolean;
  bucket: string;
  objectName: string;
  gcsUri: string;
  sizeBytes: number;
  checksumSha256: string;
  md5Hash?: string;
  crc32c?: string;
  remoteVerified: boolean;
  error?: string;
}

export interface GcsDownloadResult {
  success: boolean;
  fileName: string;
  content: string;
  sizeBytes: number;
  checksumSha256: string;
  integrityVerified: boolean;
  error?: string;
}

export interface GcsConnectivityStatus {
  success: boolean;
  bucketName: string;
  region: string;
  projectId: string;
  serviceAccount: string;
  bucketExists: boolean;
  status: "OPERATIONNEL" | "BUCKET_NON_CREE" | "PERMISSION_DENIED" | "API_DISABLED" | "ERREUR";
  message: string;
  details?: string;
}

/**
 * Téléverse une archive de sauvegarde chiffrée sur Google Cloud Storage avec intégrité SHA-256 et métadonnées.
 */
export async function uploadBackupToGCS(
  fileName: string,
  contentStr: string,
  metadataInfo: {
    checksumSha256: string;
    totalRecords: number;
    encryption: string;
  }
): Promise<GcsUploadResult> {
  const objectName = `backups/${fileName}`;
  const buffer = Buffer.from(contentStr, "utf-8");
  const computedSha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_BACKUP_BUCKET);
    const file = bucket.file(objectName);

    await file.save(buffer, {
      contentType: "application/json",
      resumable: false,
      metadata: {
        contentType: "application/json",
        metadata: {
          checksumSha256: computedSha256,
          totalRecords: String(metadataInfo.totalRecords),
          encryption: metadataInfo.encryption,
          application: "FONA Digital v1.0",
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Vérification de l'objet distant créé
    const [metadata] = await file.getMetadata();
    const remoteSize = Number(metadata.size);
    const remoteSha256 = metadata.metadata?.checksumSha256 || "";
    const remoteVerified = remoteSize === buffer.length && (remoteSha256 ? remoteSha256 === computedSha256 : true);

    return {
      success: true,
      bucket: GCS_BACKUP_BUCKET,
      objectName,
      gcsUri: `gs://${GCS_BACKUP_BUCKET}/${objectName}`,
      sizeBytes: buffer.length,
      checksumSha256: computedSha256,
      md5Hash: metadata.md5Hash,
      crc32c: metadata.crc32c,
      remoteVerified,
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    return {
      success: false,
      bucket: GCS_BACKUP_BUCKET,
      objectName,
      gcsUri: `gs://${GCS_BACKUP_BUCKET}/${objectName}`,
      sizeBytes: buffer.length,
      checksumSha256: computedSha256,
      remoteVerified: false,
      error: errorMsg,
    };
  }
}

/**
 * Télécharge une archive depuis Google Cloud Storage et vérifie son intégrité SHA-256
 */
export async function downloadBackupFromGCS(fileName: string): Promise<GcsDownloadResult> {
  const objectName = fileName.startsWith("backups/") ? fileName : `backups/${fileName}`;

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_BACKUP_BUCKET);
    const file = bucket.file(objectName);

    const [exists] = await file.exists();
    if (!exists) {
      return {
        success: false,
        fileName,
        content: "",
        sizeBytes: 0,
        checksumSha256: "",
        integrityVerified: false,
        error: `L'objet '${objectName}' n'existe pas dans le bucket 'gs://${GCS_BACKUP_BUCKET}'.`,
      };
    }

    const [buffer] = await file.download();
    const content = buffer.toString("utf-8");
    const downloadedSha256 = crypto.createHash("sha256").update(buffer).digest("hex");

    // Récupérer les métadonnées pour comparer le SHA256 attendu
    const [metadata] = await file.getMetadata();
    const expectedSha256 = metadata.metadata?.checksumSha256;
    const integrityVerified = expectedSha256 ? expectedSha256 === downloadedSha256 : true;

    return {
      success: true,
      fileName,
      content,
      sizeBytes: buffer.length,
      checksumSha256: downloadedSha256,
      integrityVerified,
    };
  } catch (err: any) {
    return {
      success: false,
      fileName,
      content: "",
      sizeBytes: 0,
      checksumSha256: "",
      integrityVerified: false,
      error: err?.message || String(err),
    };
  }
}

/**
 * Liste les sauvegardes présentes sur Google Cloud Storage
 */
export async function listBackupsFromGCS(): Promise<{
  success: boolean;
  bucket: string;
  files: Array<{
    name: string;
    sizeBytes: number;
    createdAt: string;
    checksumSha256?: string;
  }>;
  error?: string;
}> {
  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_BACKUP_BUCKET);
    const [files] = await bucket.getFiles({ prefix: "backups/" });

    const formatted = files.map((f) => ({
      name: f.name.replace(/^backups\//, ""),
      sizeBytes: Number(f.metadata.size || 0),
      createdAt: f.metadata.timeCreated || new Date().toISOString(),
      checksumSha256: f.metadata.metadata?.checksumSha256 ? String(f.metadata.metadata.checksumSha256) : undefined,
    }));

    return {
      success: true,
      bucket: GCS_BACKUP_BUCKET,
      files: formatted,
    };
  } catch (err: any) {
    return {
      success: false,
      bucket: GCS_BACKUP_BUCKET,
      files: [],
      error: err?.message || String(err),
    };
  }
}

/**
 * Diagnostic de connectivité et permissions sur Google Cloud Storage
 */
export async function testGcsConnectivity(): Promise<GcsConnectivityStatus> {
  const serviceAccount =
    process.env.AUTHORIZED_SERVICE_ACCOUNT_EMAIL || `ais-sandbox@${GCP_PROJECT_ID}.iam.gserviceaccount.com`;

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_BACKUP_BUCKET);
    const [exists] = await bucket.exists();

    if (!exists) {
      return {
        success: false,
        bucketName: GCS_BACKUP_BUCKET,
        region: GCS_BACKUP_REGION,
        projectId: GCP_PROJECT_ID,
        serviceAccount,
        bucketExists: false,
        status: "BUCKET_NON_CREE",
        message: `Le bucket 'gs://${GCS_BACKUP_BUCKET}' n'existe pas encore dans le projet ${GCP_PROJECT_ID}.`,
        details: "L'administrateur du projet GCP doit créer le bucket ou accorder le rôle storage.admin pour sa création automatique.",
      };
    }

    return {
      success: true,
      bucketName: GCS_BACKUP_BUCKET,
      region: GCS_BACKUP_REGION,
      projectId: GCP_PROJECT_ID,
      serviceAccount,
      bucketExists: true,
      status: "OPERATIONNEL",
      message: `Bucket 'gs://${GCS_BACKUP_BUCKET}' accessible et opérationnel dans la région ${GCS_BACKUP_REGION}.`,
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    let status: "OPERATIONNEL" | "BUCKET_NON_CREE" | "PERMISSION_DENIED" | "API_DISABLED" | "ERREUR" = "ERREUR";

    if (msg.includes("Permission") && (msg.includes("denied") || msg.includes("403"))) {
      status = "PERMISSION_DENIED";
    } else if (msg.includes("is disabled") || msg.includes("has not been used")) {
      status = "API_DISABLED";
    }

    return {
      success: false,
      bucketName: GCS_BACKUP_BUCKET,
      region: GCS_BACKUP_REGION,
      projectId: GCP_PROJECT_ID,
      serviceAccount,
      bucketExists: false,
      status,
      message: `Connexion à Google Cloud Storage refusée : [${status}]`,
      details: msg,
    };
  }
}
