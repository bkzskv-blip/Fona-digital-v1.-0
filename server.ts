import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

// Routes et sécurité
import authRoutes from "./src/server/routes/authRoutes.ts";
import patientRoutes from "./src/server/routes/patientRoutes.ts";
import clinicalRoutes from "./src/server/routes/clinicalRoutes.ts";
import cashierRoutes from "./src/server/routes/cashierRoutes.ts";
import backupRoutes from "./src/server/routes/backupRoutes.ts";
import { requireAuth, requireRole, AuthRequest } from "./src/server/auth.ts";
import { seedInitialDataIfNeeded } from "./src/server/seed.ts";

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "fona-settings.json");
const AUDIT_FILE = path.join(DATA_DIR, "fona-audit-logs.json");

app.use(express.json());
app.use(cookieParser());

// Assurer l'existence du dossier de données
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial defaults if file missing
const DEFAULT_SETTINGS = {
  generalBrand: {
    organizationName: "Cabinet Médical FONA",
    shortName: "CM FONA",
    slogan: "Zéro Souci, Soins de Qualité, Kapital Vie",
    clinicAddress: "Sirakoro Méguétana, Bamako-Mali",
    clinicPhone: "+223 66 73 05 16 / +223 69 64 26 46",
    clinicEmail: "contact@cmfona.ml",
    emergencyPhone: "+223 66 73 05 16",
    directorName: "Dr. Armand Koné",
    activePrimaryChoice: "secondary_design",
    primaryLogo: "/fona_logo_principal.jpg",
    secondaryLogo: "/fona_logo_officiel.jpg",
    iconLogo: "/favicon.jpg",
    primaryColor: "#4F7DF3",
    secondaryColor: "#1261A0",
    cyanColor: "#55D9FF",
    goldColor: "#D9B45B",
  },
  appearanceTheme: {
    defaultCabinetTheme: "system",
    liquidGlassIntensity: "balanced",
    animationMode: "full",
    density: "comfortable",
    contrastMode: "standard",
  },
  regional: {
    country: "ML",
    locale: "fr-ML",
    language: "fr",
    currency: "XOF",
    currencyDisplay: "FCFA",
    timezone: "Africa/Bamako",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "24h",
    weekStartsOn: "monday",
    calendar: "gregory",
    phoneCountryCode: "+223",
    numberSeparator: "space",
  },
  documentsNumbering: {
    showOfficialLogo: true,
    showInstitutionHeader: true,
    showWatermark: true,
    defaultPaperFormat: "A4",
    includePractitionerSignature: true,
    officialMention: "Cabinet Médical FONA — Sirakoro Méguétana, Bamako-Mali — Tél : +223 66 73 05 16 / +223 69 64 26 46",
    footerLegalText: "Document médical confidentiel délivré sous la responsabilité du praticien signataire.",
    patientIdPrefix: "PAT-2026-",
    consultationIdPrefix: "CONS-2026-",
    visitIdPrefix: "VIS-2026-",
    invoiceIdPrefix: "FAC-2026-",
    receiptIdPrefix: "REC-2026-",
    labIdPrefix: "LAB-2026-",
    imagingIdPrefix: "IMG-2026-",
    nextPatientSeq: 15,
    nextConsultationSeq: 28,
    nextInvoiceSeq: 42,
  },
  securitySessions: {
    sessionTimeoutMinutes: 30,
    maxFailedAttempts: 5,
    passwordMinLength: 10,
    requireSpecialChar: true,
    requireNumbers: true,
    twoFactorAuthEnabled: false,
    ipWhitelistEnabled: true,
    auditLogRetentionDays: 365,
    enforceLockOnIdle: true,
    idleWarningMinutes: 5,
  },
  backupsMaintenance: {
    autoBackupEnabled: true,
    backupFrequency: "daily",
    lastBackupAt: "2026-10-09T03:00:00Z",
    rpoObjectiveHours: 1,
    rtoObjectiveHours: 4,
    retentionDays: 30,
    backupStorageLocation: "secure_local_vault",
    compressionEnabled: true,
  },
  technicalConfig: {
    serverEnvironment: "production",
    apiEndpoint: "/api",
    logLevel: "info",
    degradedOfflineAllowed: true,
    requireConfirmationForCritical: true,
    syncIntervalSeconds: 60,
    maintenanceMode: false,
  },
  updatedAt: new Date().toISOString(),
  updatedBy: "Système FONA",
};

// Helper: read settings
function readSettings(): typeof DEFAULT_SETTINGS {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error("[Settings] Erreur lecture fichier settings:", err);
  }
  return DEFAULT_SETTINGS;
}

// Helper: write settings
function writeSettings(data: any): boolean {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[Settings] Erreur écriture fichier settings:", err);
    return false;
  }
}

// Helper: log audit to file
function recordAuditEntry(entry: {
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}) {
  try {
    let logs: any[] = [];
    if (fs.existsSync(AUDIT_FILE)) {
      const content = fs.readFileSync(AUDIT_FILE, "utf-8");
      logs = JSON.parse(content);
    }
    const newRecord = {
      id: `audit-srv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      siteId: "site-plateau",
      ...entry,
    };
    logs.unshift(newRecord);
    if (logs.length > 2000) logs = logs.slice(0, 2000);
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (err) {
    console.error("[Audit] Erreur enregistrement audit:", err);
  }
}

// ==========================================
// API REST : MODULES MÉDICAUX CENTRALISÉS (POSTGRESQL & RBAC)
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/clinical", clinicalRoutes);
app.use("/api/cashier", cashierRoutes);
app.use("/api/backups", backupRoutes);

// ==========================================
// API REST : CENTRALISATION DES PARAMÈTRES
// ==========================================

// 1. GET /api/settings - Obtenir la source unique de vérité
app.get("/api/settings", (_req: Request, res: Response) => {
  const settings = readSettings();
  res.json({
    success: true,
    settings,
    serverTime: new Date().toISOString(),
    source: "FONA_DATABASE_STORE",
  });
});

// 2. PUT /api/settings/:category - Mise à jour d'une catégorie (Sécurisée RBAC avec requireAuth & ADMIN)
app.put("/api/settings/:category", requireAuth, requireRole(["ADMIN"]), (req: AuthRequest, res: Response) => {
  const { category } = req.params;
  const updates = req.body;
  const userRole = req.user!.role;
  const userId = req.user!.id;
  const userName = req.user!.fullName;

  const currentSettings = readSettings();
  const validCategories = [
    "generalBrand",
    "appearanceTheme",
    "regional",
    "documentsNumbering",
    "securitySessions",
    "backupsMaintenance",
    "technicalConfig",
  ];

  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      error: `Catégorie inconnue : '${category}'. Catégories autorisées : ${validCategories.join(", ")}`,
    });
  }

  if (!updates || typeof updates !== "object") {
    return res.status(400).json({
      success: false,
      error: "Payload de mise à jour invalide ou manquant.",
    });
  }

  const previousValues = (currentSettings as any)[category];
  const updatedCategory = { ...previousValues, ...updates };

  const newSettings = {
    ...currentSettings,
    [category]: updatedCategory,
    updatedAt: new Date().toISOString(),
    updatedBy: `${userName} (${userRole})`,
  };

  const written = writeSettings(newSettings);
  if (!written) {
    return res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la persistance des paramètres sur disque.",
    });
  }

  recordAuditEntry({
    userId,
    userName,
    userRole,
    action: `SETTINGS_UPDATED_${category.toUpperCase()}`,
    entity: "SystemSettings",
    entityId: category,
    details: `Mise à jour de la catégorie '${category}' par ${userName}. Clés modifiées : ${Object.keys(updates).join(", ")}.`,
  });

  return res.json({
    success: true,
    category,
    settings: newSettings,
    message: `Paramètres de la catégorie '${category}' enregistrés avec succès sur le serveur.`,
  });
});

// 3. POST /api/settings/reset/:category - Réinitialisation sécurisée d'une catégorie
app.post("/api/settings/reset/:category", requireAuth, requireRole(["ADMIN"]), (req: AuthRequest, res: Response) => {
  const { category } = req.params;
  const userRole = req.user!.role;
  const userId = req.user!.id;
  const userName = req.user!.fullName;

  const currentSettings = readSettings();
  if (!(DEFAULT_SETTINGS as any)[category]) {
    return res.status(400).json({
      success: false,
      error: `Catégorie invalide : '${category}'.`,
    });
  }

  const newSettings = {
    ...currentSettings,
    [category]: (DEFAULT_SETTINGS as any)[category],
    updatedAt: new Date().toISOString(),
    updatedBy: `${userName} (Reset aux valeurs par défaut)`,
  };

  writeSettings(newSettings);

  recordAuditEntry({
    userId,
    userName,
    userRole,
    action: `SETTINGS_RESET_${category.toUpperCase()}`,
    entity: "SystemSettings",
    entityId: category,
    details: `Réinitialisation aux valeurs médicales par défaut de '${category}'.`,
  });

  return res.json({
    success: true,
    category,
    settings: newSettings,
    message: `La catégorie '${category}' a été réinitialisée aux paramètres cliniques de référence.`,
  });
});

// 4. GET /api/audit-logs - Obtenir les logs d'audit serveur
app.get("/api/audit-logs", requireAuth, requireRole(["ADMIN"]), (_req: Request, res: Response) => {
  try {
    let logs = [];
    if (fs.existsSync(AUDIT_FILE)) {
      logs = JSON.parse(fs.readFileSync(AUDIT_FILE, "utf-8"));
    }
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: "Impossible de lire le journal d'audit." });
  }
});

// ==========================================
// SERVEUR FRONTEND VITE
// ==========================================
async function startServer() {
  // Initialisation sécurisée de la base de données
  await seedInitialDataIfNeeded();

  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[FONA Digital] Serveur full-stack actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[FONA Digital] Erreur de démarrage serveur:", err);
  process.exit(1);
});
