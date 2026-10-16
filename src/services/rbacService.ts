import { Role, Permission, User } from "../types";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // Dossier Patient
    "PATIENT_READ",
    "PATIENT_WRITE",
    "PATIENT_CREATE",
    "PATIENT_UPDATE",
    "PATIENT_ARCHIVE",
    "PATIENT_PRINT",
    // Consultations
    "CONSULTATION_READ",
    "CONSULTATION_WRITE",
    "CONSULTATION_CREATE",
    "CONSULTATION_UPDATE",
    "CONSULTATION_VALIDATE",
    "CONSULTATION_PRINT",
    "PRESCRIPTION_WRITE",
    // Soins & Constantes
    "CARE_READ",
    "CARE_WRITE",
    "CARE_CREATE",
    "CARE_UPDATE",
    "CARE_PRINT",
    "VITALS_WRITE",
    // Maternité & CPN
    "MATERNITY_READ",
    "MATERNITY_WRITE",
    "MATERNITY_CREATE",
    "MATERNITY_UPDATE",
    "MATERNITY_VALIDATE",
    "MATERNITY_PRINT",
    // Examens
    "LAB_READ",
    "LAB_WRITE",
    "LAB_CREATE",
    "LAB_VALIDATE",
    "LAB_PRINT",
    "IMAGING_READ",
    "IMAGING_WRITE",
    "IMAGING_CREATE",
    "IMAGING_VALIDATE",
    "IMAGING_PRINT",
    // Rendez-vous & Accueil
    "APPOINTMENT_READ",
    "APPOINTMENT_CREATE",
    "APPOINTMENT_UPDATE",
    "VISIT_CREATE",
    // Caisse & Finances
    "CAISSE_READ",
    "CAISSE_CREATE",
    "CAISSE_VALIDATE",
    "CAISSE_PRINT",
    "CAISSE_PARTIAL",
    "PAYMENT_WRITE",
    "FINANCE_READ",
    // Rapports
    "REPORT_READ",
    "REPORT_EXPORT",
    // Administration & Système
    "ADMIN_WRITE",
    "ADMIN_USER_CREATE",
    "ADMIN_USER_UPDATE",
    "ADMIN_USER_DISABLE",
    "ADMIN_PERMISSIONS_MANAGE",
    "ADMIN_SETTINGS_MANAGE",
    "ADMIN_AUDIT_READ",
    "ADMIN_BACKUP_MANAGE",
  ],
  RECEPTION_CAISSE: [
    // Accès opérationnel strict (Principe de moindre privilège)
    "PATIENT_READ",
    "PATIENT_WRITE",
    "PATIENT_CREATE",
    "PATIENT_UPDATE",
    "PATIENT_PRINT",
    "VISIT_CREATE",
    "APPOINTMENT_READ",
    "APPOINTMENT_CREATE",
    "APPOINTMENT_UPDATE",
    "CAISSE_READ",
    "CAISSE_CREATE",
    "CAISSE_VALIDATE",
    "CAISSE_PRINT",
    "CAISSE_PARTIAL",
    "PAYMENT_WRITE",
    // AUCUN accès diagnostic, consultation médicale, soins, ou finances globales
  ],
  PRACTITIONER: [
    // Prise en charge médicale complète
    "PATIENT_READ",
    "PATIENT_PRINT",
    "CONSULTATION_READ",
    "CONSULTATION_WRITE",
    "CONSULTATION_CREATE",
    "CONSULTATION_UPDATE",
    "CONSULTATION_VALIDATE",
    "CONSULTATION_PRINT",
    "PRESCRIPTION_WRITE",
    "CARE_READ",
    "CARE_WRITE",
    "VITALS_WRITE",
    "LAB_READ",
    "LAB_WRITE",
    "LAB_CREATE",
    "IMAGING_READ",
    "IMAGING_WRITE",
    "IMAGING_CREATE",
    "APPOINTMENT_READ",
    "APPOINTMENT_CREATE",
    "APPOINTMENT_UPDATE",
    "VISIT_CREATE",
    "REPORT_READ",
    // AUCUN accès aux utilisateurs, sécurité système, ou caisse
  ],
  NURSE: [
    // Soins, surveillance des constantes et administration
    "PATIENT_READ",
    "CARE_READ",
    "CARE_WRITE",
    "CARE_CREATE",
    "CARE_UPDATE",
    "CARE_PRINT",
    "VITALS_WRITE",
    "CONSULTATION_READ", // Lecture autorisée pour suivi des soins prescrits
    "APPOINTMENT_READ",
    "APPOINTMENT_CREATE",
    "VISIT_CREATE",
    // AUCUNE modification de diagnostic ni caisse ni administration
  ],
  MIDWIFE: [
    // Spécialiste maternité, obstétrique et CPN
    "PATIENT_READ",
    "PATIENT_PRINT",
    "MATERNITY_READ",
    "MATERNITY_WRITE",
    "MATERNITY_CREATE",
    "MATERNITY_UPDATE",
    "MATERNITY_VALIDATE",
    "MATERNITY_PRINT",
    "CONSULTATION_READ",
    "CARE_READ",
    "CARE_WRITE",
    "CARE_CREATE",
    "VITALS_WRITE",
    "LAB_READ",
    "LAB_WRITE",
    "LAB_CREATE",
    "IMAGING_READ",
    "IMAGING_WRITE",
    "IMAGING_CREATE",
    "APPOINTMENT_READ",
    "APPOINTMENT_CREATE",
    "APPOINTMENT_UPDATE",
    "VISIT_CREATE",
    // AUCUN accès caisse ou administration
  ],
  LAB: [
    "PATIENT_READ",
    "LAB_READ",
    "LAB_WRITE",
    "LAB_CREATE",
    "LAB_VALIDATE",
    "LAB_PRINT",
    "REPORT_READ",
  ],
  IMAGING: [
    "PATIENT_READ",
    "IMAGING_READ",
    "IMAGING_WRITE",
    "IMAGING_CREATE",
    "IMAGING_VALIDATE",
    "IMAGING_PRINT",
    "REPORT_READ",
  ],
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur Principal",
  RECEPTION_CAISSE: "Accueil & Caisse",
  PRACTITIONER: "Médecin / Praticien",
  NURSE: "Infirmier / Aide-Soignant",
  MIDWIFE: "Sage-Femme",
  LAB: "Biologiste / Laborantin",
  IMAGING: "Radiologue / Échographiste",
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasUserPermission(user: User, permission: Permission): boolean {
  // 1. Explicitly revoked permissions take precedence
  if (user.revokedPermissions?.includes(permission)) {
    return false;
  }
  // 2. Exceptional granted permissions take precedence
  if (user.exceptionalPermissions?.includes(permission)) {
    return true;
  }
  // 3. Fallback to base role permissions
  return hasPermission(user.role, permission);
}

/**
 * Vérifie si le compte a accès aux données financières globales (Chiffre d'affaires, bilan de caisse)
 * Règle de moindre privilège : seuls l'ADMIN et les utilisateurs explicitement dotés de FINANCE_READ
 */
export function isFinancialDataRestrictedForUser(user: User): boolean {
  return !hasUserPermission(user, "FINANCE_READ") && user.role !== "ADMIN";
}

/**
 * Vérifie si les données cliniques sensibles doivent être masquées ou protégées
 * Règle de moindre privilège : Accueil/Caisse n'a pas accès aux diagnostics et examens intimes
 */
export function isClinicalDataRestrictedForUser(user: User): boolean {
  if (user.role === "ADMIN") return false;
  if (hasUserPermission(user, "CONSULTATION_READ")) return false;
  return user.role === "RECEPTION_CAISSE";
}

/**
 * Vérifie si l'utilisateur est habilité à modifier une consultation validée
 * (Avec traçabilité obligatoire dans tous les cas)
 */
export function canUserModifyConsultation(user: User): boolean {
  return hasUserPermission(user, "CONSULTATION_UPDATE") || user.role === "ADMIN";
}

export function canAccessModule(role: Role, moduleId: string, user?: User): boolean {
  // If user has exceptional permissions, check them
  if (user) {
    if (user.status === "INACTIF" || user.status === "SUSPENDU") {
      return false;
    }
    if (moduleId === "admin" && hasUserPermission(user, "ADMIN_WRITE")) return true;
    if (moduleId === "cashier" && (hasUserPermission(user, "CAISSE_READ") || hasUserPermission(user, "PAYMENT_WRITE"))) return true;
    if (moduleId === "consultations" && (hasUserPermission(user, "CONSULTATION_READ") || hasUserPermission(user, "CONSULTATION_WRITE"))) return true;
    if (moduleId === "care" && (hasUserPermission(user, "CARE_READ") || hasUserPermission(user, "CARE_WRITE"))) return true;
    if (moduleId === "maternite" && (hasUserPermission(user, "MATERNITY_READ") || hasUserPermission(user, "MATERNITY_WRITE"))) return true;
  }

  switch (moduleId) {
    case "dashboard":
      return true;
    case "patients":
      return user ? hasUserPermission(user, "PATIENT_READ") : hasPermission(role, "PATIENT_READ");
    case "cashier":
      return user
        ? hasUserPermission(user, "CAISSE_READ") || hasUserPermission(user, "PAYMENT_WRITE") || user.role === "ADMIN"
        : hasPermission(role, "PAYMENT_WRITE") || role === "ADMIN";
    case "consultations":
      return user
        ? hasUserPermission(user, "CONSULTATION_READ") || hasUserPermission(user, "CONSULTATION_WRITE")
        : hasPermission(role, "CONSULTATION_READ") || hasPermission(role, "CONSULTATION_WRITE");
    case "care":
      return user
        ? hasUserPermission(user, "CARE_READ") || hasUserPermission(user, "CARE_WRITE") || user.role === "ADMIN"
        : hasPermission(role, "CARE_WRITE") || role === "ADMIN";
    case "appointments":
      return true; // Tous les soignants et l'accueil coordonnent les RDV
    case "maternite":
    case "maternity":
      return user
        ? hasUserPermission(user, "MATERNITY_READ") || hasUserPermission(user, "MATERNITY_WRITE") || user.role === "ADMIN"
        : hasPermission(role, "MATERNITY_WRITE") || role === "ADMIN";
    case "laboratory":
      return user
        ? hasUserPermission(user, "LAB_READ") || hasUserPermission(user, "LAB_WRITE") || user.role === "ADMIN"
        : hasPermission(role, "LAB_WRITE") || role === "ADMIN";
    case "imaging":
      return user
        ? hasUserPermission(user, "IMAGING_READ") || hasUserPermission(user, "IMAGING_WRITE") || user.role === "ADMIN"
        : hasPermission(role, "IMAGING_WRITE") || role === "ADMIN";
    case "reports":
      return user
        ? hasUserPermission(user, "REPORT_READ") || user.role === "ADMIN"
        : hasPermission(role, "REPORT_READ") || role === "ADMIN";
    case "admin":
      return user
        ? hasUserPermission(user, "ADMIN_WRITE")
        : hasPermission(role, "ADMIN_WRITE");
    default:
      return false;
  }
}

/**
 * Configuration Centrale de la Navigation FONA Digital
 * Règle d'or : Priorité != Permission
 * 1. La permission détermine la visibilité stricte (sécurité RBAC)
 * 2. La priorité détermine l'ordre d'affichage dans la sidebar propre à chaque rôle
 */
export interface NavModuleDefinition {
  id: string;
  label: string;
  roleLabels?: Partial<Record<Role, string>>;
  section: "core" | "admin";
  permission?: Permission;
  priority: Partial<Record<Role, number>>;
  highlight?: boolean;
  badgeType?: "appointments" | "laboratory" | "imaging" | "cashier" | "care";
}

export const NAVIGATION_MODULES: NavModuleDefinition[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    section: "core",
    priority: {
      ADMIN: 1,
      RECEPTION_CAISSE: 1,
      PRACTITIONER: 1,
      NURSE: 1,
      MIDWIFE: 1,
      LAB: 1,
      IMAGING: 1,
    },
  },
  {
    id: "patients",
    label: "Patients / Clients",
    roleLabels: {
      MIDWIFE: "Patientes / Maternité",
      NURSE: "Patients",
      LAB: "Patients",
      IMAGING: "Patients",
    },
    section: "core",
    permission: "PATIENT_READ",
    priority: {
      ADMIN: 2,
      PRACTITIONER: 2,
      RECEPTION_CAISSE: 3,
      NURSE: 2,
      MIDWIFE: 2,
      LAB: 3,
      IMAGING: 3,
    },
  },
  {
    id: "cashier",
    label: "Accueil / Caisse",
    roleLabels: {
      RECEPTION_CAISSE: "Accueil & Caisse",
    },
    section: "core",
    permission: "PAYMENT_WRITE",
    badgeType: "cashier",
    priority: {
      ADMIN: 3,
      RECEPTION_CAISSE: 2, // Priorité 2 pour Accueil/Caisse
    },
  },
  {
    id: "consultations",
    label: "Consultations",
    roleLabels: {
      PRACTITIONER: "Consultations Médicales",
    },
    section: "core",
    permission: "CONSULTATION_READ",
    priority: {
      ADMIN: 4,
      PRACTITIONER: 3, // Priorité haute pour médecin
    },
  },
  {
    id: "appointments",
    label: "Rendez-vous",
    section: "core",
    badgeType: "appointments",
    priority: {
      ADMIN: 5,
      RECEPTION_CAISSE: 4,
      PRACTITIONER: 4,
      NURSE: 4,
      MIDWIFE: 4,
    },
  },
  {
    id: "care",
    label: "Soins & Pansements",
    roleLabels: {
      NURSE: "Soins & Pansements",
      PRACTITIONER: "Soins & Actes",
      MIDWIFE: "Soins & Injections",
    },
    section: "core",
    permission: "CARE_WRITE",
    badgeType: "care",
    priority: {
      ADMIN: 6,
      NURSE: 3, // Soins = module principal après Patients pour infirmier !
      PRACTITIONER: 5,
      MIDWIFE: 5,
    },
  },
  {
    id: "maternite",
    label: "Maternité & CPN",
    roleLabels: {
      MIDWIFE: "Maternité & CPN",
    },
    section: "core",
    permission: "MATERNITY_WRITE",
    priority: {
      ADMIN: 7,
      MIDWIFE: 3, // Maternité très visible en priorité haute pour sage-femme !
    },
  },
  {
    id: "laboratory",
    label: "Laboratoire",
    roleLabels: {
      LAB: "Laboratoire & Analyses",
      MIDWIFE: "Analyses Biologiques",
    },
    section: "core",
    permission: "LAB_WRITE",
    badgeType: "laboratory",
    priority: {
      ADMIN: 8,
      LAB: 2, // Priorité 2 pour Biologiste
      PRACTITIONER: 6,
      MIDWIFE: 6,
    },
  },
  {
    id: "imaging",
    label: "Imagerie Médicale",
    roleLabels: {
      IMAGING: "Imagerie & Échographie",
      MIDWIFE: "Échographies Obstétricales",
    },
    section: "core",
    permission: "IMAGING_WRITE",
    badgeType: "imaging",
    priority: {
      ADMIN: 9,
      IMAGING: 2, // Priorité 2 pour Radiologue
      PRACTITIONER: 7,
      MIDWIFE: 7,
    },
  },
  {
    id: "reports",
    label: "Rapports & Stats",
    roleLabels: {
      PRACTITIONER: "Rapports Cliniques",
      LAB: "Rapports d'Analyses",
      IMAGING: "Comptes Rendus",
    },
    section: "core",
    permission: "REPORT_READ",
    priority: {
      ADMIN: 10,
      PRACTITIONER: 8,
      LAB: 4,
      IMAGING: 4,
    },
  },
  {
    id: "admin",
    label: "Administration Système",
    section: "admin",
    permission: "ADMIN_WRITE",
    priority: {
      ADMIN: 100, // Séparé en bas
    },
  },
];

/**
 * Récupère les modules autorisés pour un rôle donné, ordonnés par priorité propre au rôle
 */
export function getAuthorizedModulesForRole(role: Role, user?: User): {
  coreModules: NavModuleDefinition[];
  adminModules: NavModuleDefinition[];
} {
  const authorized = NAVIGATION_MODULES.filter((module) =>
    canAccessModule(role, module.id, user)
  );

  const sortByPriority = (a: NavModuleDefinition, b: NavModuleDefinition) => {
    const prioA = a.priority[role] ?? 999;
    const prioB = b.priority[role] ?? 999;
    return prioA - prioB;
  };

  const coreModules = authorized
    .filter((m) => m.section === "core")
    .sort(sortByPriority);

  const adminModules = authorized
    .filter((m) => m.section === "admin")
    .sort(sortByPriority);

  return { coreModules, adminModules };
}

/**
 * Calcule l'onglet initial recommandé pour un rôle donné (premier module par priorité)
 */
export function getDefaultTabForRole(role: Role): string {
  const { coreModules } = getAuthorizedModulesForRole(role);
  if (role === "ADMIN") return "dashboard";
  if (coreModules.length > 0) {
    // Si c'est un soignant spécifique ou accueil, son module phare
    if (role === "RECEPTION_CAISSE") return "cashier";
    if (role === "PRACTITIONER") return "consultations";
    if (role === "NURSE") return "care";
    if (role === "MIDWIFE") return "maternite";
    if (role === "LAB") return "laboratory";
    if (role === "IMAGING") return "imaging";
    return coreModules[0].id;
  }
  return "dashboard";
}

