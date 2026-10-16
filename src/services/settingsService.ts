import {
  BrandSettings,
  RegionalSettings,
  DocumentTemplateConfig,
  SecuritySettings,
  User,
  CentralizedSettings,
  SettingsCategoryKey,
} from "../types";

export type { CentralizedSettings, SettingsCategoryKey };

export const CATEGORY_METADATA: Record<
  SettingsCategoryKey,
  {
    title: string;
    subtitle: string;
    badge: string;
    isCritical: boolean;
  }
> = {
  generalBrand: {
    title: "Paramètres Généraux & Identité FONA",
    subtitle: "Nom, logos institutionnels, coordonnées et charte graphique",
    badge: "Institutionnel",
    isCritical: false,
  },
  appearanceTheme: {
    title: "Apparence & Thème",
    subtitle: "Thème cabinet par défaut, Liquid Glass 2.0, animations et densité",
    badge: "Visuel",
    isCritical: false,
  },
  regional: {
    title: "Paramètres Régionaux",
    subtitle: "Devise FCFA (XOF), fuseau horaire Africa/Bamako, dates et indicatif +223",
    badge: "Régional (Mali)",
    isCritical: false,
  },
  documentsNumbering: {
    title: "Documents & Numérotation",
    subtitle: "Gabarits d'impression, filigranes, signatures et préfixes de codes",
    badge: "Critique",
    isCritical: true,
  },
  securitySessions: {
    title: "Sécurité & Sessions",
    subtitle: "Délai d'inactivité, verrouillage, politique de mot de passe et sessions",
    badge: "Haute Sécurité",
    isCritical: true,
  },
  backupsMaintenance: {
    title: "Sauvegardes & Maintenance",
    subtitle: "Sauvegardes chiffrées, intégrité SHA-256, objectifs RPO/RTO et rétention",
    badge: "Critique",
    isCritical: true,
  },
  technicalConfig: {
    title: "Configuration Technique Réservée",
    subtitle: "Diagnostic système, point d'accès API, mode hors-ligne et niveau de log",
    badge: "Admin Restreint",
    isCritical: true,
  },
};

/**
 * Charge les paramètres centralisés depuis l'API backend
 */
export async function fetchCentralizedSettings(): Promise<CentralizedSettings | null> {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) {
      console.warn("[SettingsService] API settings non disponible, utilisation du cache local.");
      return null;
    }
    const data = await res.json();
    if (data.success && data.settings) {
      return data.settings as CentralizedSettings;
    }
  } catch (err) {
    console.warn("[SettingsService] Réseau ou serveur injoignable:", err);
  }
  return null;
}

/**
 * Sauvegarde une catégorie de paramètres sur le serveur avec vérification RBAC
 */
export async function saveCategorySettings(
  category: SettingsCategoryKey,
  updates: Record<string, any>,
  currentUser: User
): Promise<{ success: boolean; settings?: CentralizedSettings; error?: string }> {
  try {
    const res = await fetch(`/api/settings/${category}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": currentUser.id,
        "x-user-role": currentUser.role,
        "x-user-name": currentUser.fullName,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Erreur serveur HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      settings: data.settings,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Erreur de connexion au serveur",
    };
  }
}

/**
 * Réinitialise une catégorie aux paramètres de référence
 */
export async function resetCategorySettings(
  category: SettingsCategoryKey,
  currentUser: User
): Promise<{ success: boolean; settings?: CentralizedSettings; error?: string }> {
  try {
    const res = await fetch(`/api/settings/reset/${category}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": currentUser.id,
        "x-user-role": currentUser.role,
        "x-user-name": currentUser.fullName,
      },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Erreur serveur HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      settings: data.settings,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Erreur de connexion",
    };
  }
}

/**
 * Déclenche une sauvegarde serveur instantanée
 */
export async function triggerServerBackup(
  currentUser: User
): Promise<{ success: boolean; backup?: any; error?: string }> {
  try {
    const res = await fetch("/api/backups/trigger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": currentUser.id,
        "x-user-role": currentUser.role,
        "x-user-name": currentUser.fullName,
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Erreur lors de la sauvegarde" };
    }
    return { success: true, backup: data.backup };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
