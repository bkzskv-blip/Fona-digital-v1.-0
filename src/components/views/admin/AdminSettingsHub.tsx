import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Palette,
  Globe2,
  FileText,
  Users,
  Lock,
  Database,
  Wrench,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Printer,
  Hash,
  Key,
  Laptop,
  Smartphone,
  HardDrive,
  FileJson,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Check,
  Building2,
  Phone,
  Mail,
  FileCheck2,
  Eye,
  Sliders,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GlassCard } from "../../ui/GlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { GlassInput, GlassSelect } from "../../ui/GlassFormControls";
import { FonaLogo } from "../../ui/FonaLogo";
import { SettingsCategoryKey, CATEGORY_METADATA } from "../../../services/settingsService";
import { AdminUsersTab } from "./AdminUsersTab";
import { AdminRolesPermissionsTab } from "./AdminRolesPermissionsTab";
import { ROLE_LABELS } from "../../../services/rbacService";
import { REGIONAL_PRESETS } from "../../../services/regionalService";
import { DateFormatPattern, TimeFormatPattern, WeekStartsOn } from "../../../types";

interface AdminSettingsHubProps {
  initialCategory?: SettingsCategoryKey;
}

export const AdminSettingsHub: React.FC<AdminSettingsHubProps> = ({
  initialCategory = "generalBrand",
}) => {
  const {
    currentUser,
    brandSettings,
    regionalSettings,
    documentConfig,
    securitySettings,
    centralizedSettings,
    saveCentralizedCategory,
    resetCentralizedCategory,
    isSavingCentralizedSettings,
    lastSettingsSavedAt,
    showToast,
    formatCurrency,
    formatDate,
    formatTime,
    sessions,
    terminateSession,
    backups,
    triggerManualBackup,
    exportDatabaseJson,
    restoreBackup,
    themeMode,
    resolvedTheme,
    setThemeMode,
    animationMode,
    setAnimationMode,
    respectSystemMotion,
    setRespectSystemMotion,
    logAudit,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<SettingsCategoryKey>(initialCategory);

  // Users/Roles Sub-tab selector for category 5
  const [usersSubTab, setUsersSubTab] = useState<"USERS" | "ROLES">("USERS");

  // ==========================================================
  // FORM STATES PAR CATÉGORIE (AVEC DÉTECTION IS_DIRTY)
  // ==========================================================

  // 1. General Brand
  const [brandForm, setBrandForm] = useState({
    organizationName: brandSettings.organizationName,
    shortName: brandSettings.shortName,
    slogan: brandSettings.slogan,
    clinicAddress: brandSettings.clinicAddress,
    clinicPhone: brandSettings.clinicPhone,
    clinicEmail: brandSettings.clinicEmail,
    emergencyPhone: centralizedSettings?.generalBrand?.emergencyPhone || "+223 66 73 05 16",
    directorName: centralizedSettings?.generalBrand?.directorName || "Dr. Armand Koné",
    activePrimaryChoice: brandSettings.activePrimaryChoice || "secondary_design",
  });

  // 2. Appearance & Theme
  const [appearanceForm, setAppearanceForm] = useState({
    defaultCabinetTheme: (brandSettings.defaultCabinetTheme || "system") as "system" | "dark" | "light",
    liquidGlassIntensity: (centralizedSettings?.appearanceTheme?.liquidGlassIntensity || "balanced") as "balanced" | "high" | "subtle",
    animationMode: animationMode,
    density: (centralizedSettings?.appearanceTheme?.density || "comfortable") as "comfortable" | "compact",
    contrastMode: (centralizedSettings?.appearanceTheme?.contrastMode || "standard") as "standard" | "high_contrast",
  });

  // 3. Regional
  const [regionalForm, setRegionalForm] = useState({
    country: regionalSettings.country,
    locale: regionalSettings.locale,
    language: regionalSettings.language,
    currency: regionalSettings.currency,
    currencyDisplay: regionalSettings.currencyDisplay,
    timezone: regionalSettings.timezone,
    dateFormat: regionalSettings.dateFormat,
    timeFormat: regionalSettings.timeFormat,
    weekStartsOn: regionalSettings.weekStartsOn,
    phoneCountryCode: regionalSettings.phoneCountryCode,
  });

  // 4. Documents & Numbering
  const [docsForm, setDocsForm] = useState({
    showOfficialLogo: documentConfig.showOfficialLogo,
    showInstitutionHeader: documentConfig.showInstitutionHeader,
    showWatermark: documentConfig.showWatermark,
    defaultPaperFormat: documentConfig.defaultPaperFormat,
    includePractitionerSignature: documentConfig.includePractitionerSignature,
    officialMention: documentConfig.officialMention,
    footerLegalText:
      centralizedSettings?.documentsNumbering?.footerLegalText ||
      "Document médical confidentiel délivré sous la responsabilité du praticien signataire.",
    patientIdPrefix: documentConfig.patientIdPrefix,
    consultationIdPrefix: documentConfig.consultationIdPrefix,
    invoiceIdPrefix: documentConfig.invoiceIdPrefix,
    visitIdPrefix: centralizedSettings?.documentsNumbering?.visitIdPrefix || "VIS-2026-",
    receiptIdPrefix: centralizedSettings?.documentsNumbering?.receiptIdPrefix || "REC-2026-",
  });

  // 6. Security & Sessions
  const [securityForm, setSecurityForm] = useState({
    sessionTimeoutMinutes: securitySettings.sessionTimeoutMinutes,
    maxFailedAttempts: securitySettings.maxFailedAttempts,
    passwordMinLength: securitySettings.passwordMinLength,
    requireSpecialChar: securitySettings.requireSpecialChar,
    requireNumbers: securitySettings.requireNumbers,
    twoFactorAuthEnabled: securitySettings.twoFactorAuthEnabled,
    ipWhitelistEnabled: securitySettings.ipWhitelistEnabled,
    auditLogRetentionDays: securitySettings.auditLogRetentionDays,
    enforceLockOnIdle: centralizedSettings?.securitySessions?.enforceLockOnIdle ?? true,
    idleWarningMinutes: centralizedSettings?.securitySessions?.idleWarningMinutes ?? 5,
  });

  // 7. Backups & Maintenance
  const [backupForm, setBackupForm] = useState({
    autoBackupEnabled: centralizedSettings?.backupsMaintenance?.autoBackupEnabled ?? true,
    backupFrequency: (centralizedSettings?.backupsMaintenance?.backupFrequency || "daily") as "hourly" | "daily" | "weekly",
    rpoObjectiveHours: centralizedSettings?.backupsMaintenance?.rpoObjectiveHours ?? 1,
    rtoObjectiveHours: centralizedSettings?.backupsMaintenance?.rtoObjectiveHours ?? 4,
    retentionDays: centralizedSettings?.backupsMaintenance?.retentionDays ?? 30,
    backupStorageLocation: (centralizedSettings?.backupsMaintenance?.backupStorageLocation || "secure_local_vault") as "secure_local_vault" | "hybrid_cloud",
    compressionEnabled: centralizedSettings?.backupsMaintenance?.compressionEnabled ?? true,
  });

  // 8. Technical Config
  const [techForm, setTechForm] = useState({
    serverEnvironment: (centralizedSettings?.technicalConfig?.serverEnvironment || "production") as "production" | "staging" | "development",
    apiEndpoint: centralizedSettings?.technicalConfig?.apiEndpoint || "/api",
    logLevel: (centralizedSettings?.technicalConfig?.logLevel || "info") as "info" | "warn" | "error" | "debug",
    degradedOfflineAllowed: centralizedSettings?.technicalConfig?.degradedOfflineAllowed ?? true,
    requireConfirmationForCritical: centralizedSettings?.technicalConfig?.requireConfirmationForCritical ?? true,
    syncIntervalSeconds: centralizedSettings?.technicalConfig?.syncIntervalSeconds ?? 60,
    maintenanceMode: centralizedSettings?.technicalConfig?.maintenanceMode ?? false,
  });

  // Synchronisation avec les données serveur si rechargées
  useEffect(() => {
    setBrandForm({
      organizationName: brandSettings.organizationName,
      shortName: brandSettings.shortName,
      slogan: brandSettings.slogan,
      clinicAddress: brandSettings.clinicAddress,
      clinicPhone: brandSettings.clinicPhone,
      clinicEmail: brandSettings.clinicEmail,
      emergencyPhone: centralizedSettings?.generalBrand?.emergencyPhone || "+223 66 73 05 16",
      directorName: centralizedSettings?.generalBrand?.directorName || "Dr. Armand Koné",
      activePrimaryChoice: brandSettings.activePrimaryChoice || "secondary_design",
    });
  }, [brandSettings, centralizedSettings]);

  useEffect(() => {
    setRegionalForm({
      country: regionalSettings.country,
      locale: regionalSettings.locale,
      language: regionalSettings.language,
      currency: regionalSettings.currency,
      currencyDisplay: regionalSettings.currencyDisplay,
      timezone: regionalSettings.timezone,
      dateFormat: regionalSettings.dateFormat,
      timeFormat: regionalSettings.timeFormat,
      weekStartsOn: regionalSettings.weekStartsOn,
      phoneCountryCode: regionalSettings.phoneCountryCode,
    });
  }, [regionalSettings]);

  useEffect(() => {
    setDocsForm({
      showOfficialLogo: documentConfig.showOfficialLogo,
      showInstitutionHeader: documentConfig.showInstitutionHeader,
      showWatermark: documentConfig.showWatermark,
      defaultPaperFormat: documentConfig.defaultPaperFormat,
      includePractitionerSignature: documentConfig.includePractitionerSignature,
      officialMention: documentConfig.officialMention,
      footerLegalText:
        centralizedSettings?.documentsNumbering?.footerLegalText ||
        "Document médical confidentiel délivré sous la responsabilité du praticien signataire.",
      patientIdPrefix: documentConfig.patientIdPrefix,
      consultationIdPrefix: documentConfig.consultationIdPrefix,
      invoiceIdPrefix: documentConfig.invoiceIdPrefix,
      visitIdPrefix: centralizedSettings?.documentsNumbering?.visitIdPrefix || "VIS-2026-",
      receiptIdPrefix: centralizedSettings?.documentsNumbering?.receiptIdPrefix || "REC-2026-",
    });
  }, [documentConfig, centralizedSettings]);

  useEffect(() => {
    setSecurityForm({
      sessionTimeoutMinutes: securitySettings.sessionTimeoutMinutes,
      maxFailedAttempts: securitySettings.maxFailedAttempts,
      passwordMinLength: securitySettings.passwordMinLength,
      requireSpecialChar: securitySettings.requireSpecialChar,
      requireNumbers: securitySettings.requireNumbers,
      twoFactorAuthEnabled: securitySettings.twoFactorAuthEnabled,
      ipWhitelistEnabled: securitySettings.ipWhitelistEnabled,
      auditLogRetentionDays: securitySettings.auditLogRetentionDays,
      enforceLockOnIdle: centralizedSettings?.securitySessions?.enforceLockOnIdle ?? true,
      idleWarningMinutes: centralizedSettings?.securitySessions?.idleWarningMinutes ?? 5,
    });
  }, [securitySettings, centralizedSettings]);

  // Horloge en direct Bamako
  const [liveBamakoTime, setLiveBamakoTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveBamakoTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Détection si le formulaire actif a été modifié (isDirty)
  const isDirty = (() => {
    switch (activeCategory) {
      case "generalBrand":
        return (
          brandForm.organizationName !== brandSettings.organizationName ||
          brandForm.shortName !== brandSettings.shortName ||
          brandForm.slogan !== brandSettings.slogan ||
          brandForm.clinicAddress !== brandSettings.clinicAddress ||
          brandForm.clinicPhone !== brandSettings.clinicPhone ||
          brandForm.clinicEmail !== brandSettings.clinicEmail ||
          brandForm.activePrimaryChoice !== brandSettings.activePrimaryChoice
        );
      case "appearanceTheme":
        return (
          appearanceForm.defaultCabinetTheme !== (brandSettings.defaultCabinetTheme || "system") ||
          appearanceForm.animationMode !== animationMode
        );
      case "regional":
        return (
          regionalForm.currencyDisplay !== regionalSettings.currencyDisplay ||
          regionalForm.dateFormat !== regionalSettings.dateFormat ||
          regionalForm.timeFormat !== regionalSettings.timeFormat ||
          regionalForm.timezone !== regionalSettings.timezone ||
          regionalForm.phoneCountryCode !== regionalSettings.phoneCountryCode
        );
      case "documentsNumbering":
        return (
          docsForm.showOfficialLogo !== documentConfig.showOfficialLogo ||
          docsForm.showInstitutionHeader !== documentConfig.showInstitutionHeader ||
          docsForm.showWatermark !== documentConfig.showWatermark ||
          docsForm.defaultPaperFormat !== documentConfig.defaultPaperFormat ||
          docsForm.includePractitionerSignature !== documentConfig.includePractitionerSignature ||
          docsForm.officialMention !== documentConfig.officialMention ||
          docsForm.patientIdPrefix !== documentConfig.patientIdPrefix ||
          docsForm.consultationIdPrefix !== documentConfig.consultationIdPrefix ||
          docsForm.invoiceIdPrefix !== documentConfig.invoiceIdPrefix
        );
      case "securitySessions":
        return (
          securityForm.sessionTimeoutMinutes !== securitySettings.sessionTimeoutMinutes ||
          securityForm.maxFailedAttempts !== securitySettings.maxFailedAttempts ||
          securityForm.passwordMinLength !== securitySettings.passwordMinLength ||
          securityForm.requireSpecialChar !== securitySettings.requireSpecialChar ||
          securityForm.twoFactorAuthEnabled !== securitySettings.twoFactorAuthEnabled
        );
      case "backupsMaintenance":
        return (
          backupForm.backupFrequency !== (centralizedSettings?.backupsMaintenance?.backupFrequency || "daily") ||
          backupForm.retentionDays !== (centralizedSettings?.backupsMaintenance?.retentionDays ?? 30)
        );
      case "technicalConfig":
        return (
          techForm.logLevel !== (centralizedSettings?.technicalConfig?.logLevel || "info") ||
          techForm.degradedOfflineAllowed !== (centralizedSettings?.technicalConfig?.degradedOfflineAllowed ?? true)
        );
      default:
        return false;
    }
  })();

  // Confirmation modal for critical actions
  const [criticalModal, setCriticalModal] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Save active category handler
  const handleSaveActiveCategory = async () => {
    switch (activeCategory) {
      case "generalBrand":
        await saveCentralizedCategory("generalBrand", brandForm);
        break;
      case "appearanceTheme":
        await saveCentralizedCategory("appearanceTheme", appearanceForm);
        break;
      case "regional":
        await saveCentralizedCategory("regional", regionalForm);
        break;
      case "documentsNumbering":
        await saveCentralizedCategory("documentsNumbering", docsForm);
        break;
      case "securitySessions":
        await saveCentralizedCategory("securitySessions", securityForm);
        break;
      case "backupsMaintenance":
        await saveCentralizedCategory("backupsMaintenance", backupForm);
        break;
      case "technicalConfig":
        await saveCentralizedCategory("technicalConfig", techForm);
        break;
    }
  };

  // Cancel edits handler
  const handleCancelActiveCategory = () => {
    switch (activeCategory) {
      case "generalBrand":
        setBrandForm({
          organizationName: brandSettings.organizationName,
          shortName: brandSettings.shortName,
          slogan: brandSettings.slogan,
          clinicAddress: brandSettings.clinicAddress,
          clinicPhone: brandSettings.clinicPhone,
          clinicEmail: brandSettings.clinicEmail,
          emergencyPhone: centralizedSettings?.generalBrand?.emergencyPhone || "+223 66 73 05 16",
          directorName: centralizedSettings?.generalBrand?.directorName || "Dr. Armand Koné",
          activePrimaryChoice: brandSettings.activePrimaryChoice || "secondary_design",
        });
        break;
      case "appearanceTheme":
        setAppearanceForm({
          defaultCabinetTheme: (brandSettings.defaultCabinetTheme || "system") as any,
          liquidGlassIntensity: "balanced",
          animationMode: animationMode,
          density: "comfortable",
          contrastMode: "standard",
        });
        break;
      case "regional":
        setRegionalForm({
          country: regionalSettings.country,
          locale: regionalSettings.locale,
          language: regionalSettings.language,
          currency: regionalSettings.currency,
          currencyDisplay: regionalSettings.currencyDisplay,
          timezone: regionalSettings.timezone,
          dateFormat: regionalSettings.dateFormat,
          timeFormat: regionalSettings.timeFormat,
          weekStartsOn: regionalSettings.weekStartsOn,
          phoneCountryCode: regionalSettings.phoneCountryCode,
        });
        break;
      case "documentsNumbering":
        setDocsForm({
          showOfficialLogo: documentConfig.showOfficialLogo,
          showInstitutionHeader: documentConfig.showInstitutionHeader,
          showWatermark: documentConfig.showWatermark,
          defaultPaperFormat: documentConfig.defaultPaperFormat,
          includePractitionerSignature: documentConfig.includePractitionerSignature,
          officialMention: documentConfig.officialMention,
          footerLegalText: "Document médical confidentiel délivré sous la responsabilité du praticien signataire.",
          patientIdPrefix: documentConfig.patientIdPrefix,
          consultationIdPrefix: documentConfig.consultationIdPrefix,
          invoiceIdPrefix: documentConfig.invoiceIdPrefix,
          visitIdPrefix: "VIS-2026-",
          receiptIdPrefix: "REC-2026-",
        });
        break;
      case "securitySessions":
        setSecurityForm({
          sessionTimeoutMinutes: securitySettings.sessionTimeoutMinutes,
          maxFailedAttempts: securitySettings.maxFailedAttempts,
          passwordMinLength: securitySettings.passwordMinLength,
          requireSpecialChar: securitySettings.requireSpecialChar,
          requireNumbers: securitySettings.requireNumbers,
          twoFactorAuthEnabled: securitySettings.twoFactorAuthEnabled,
          ipWhitelistEnabled: securitySettings.ipWhitelistEnabled,
          auditLogRetentionDays: securitySettings.auditLogRetentionDays,
          enforceLockOnIdle: true,
          idleWarningMinutes: 5,
        });
        break;
      case "backupsMaintenance":
        setBackupForm({
          autoBackupEnabled: true,
          backupFrequency: "daily",
          rpoObjectiveHours: 1,
          rtoObjectiveHours: 4,
          retentionDays: 30,
          backupStorageLocation: "secure_local_vault",
          compressionEnabled: true,
        });
        break;
      case "technicalConfig":
        setTechForm({
          serverEnvironment: "production",
          apiEndpoint: "/api",
          logLevel: "info",
          degradedOfflineAllowed: true,
          requireConfirmationForCritical: true,
          syncIntervalSeconds: 60,
          maintenanceMode: false,
        });
        break;
    }
    showToast("INFO", "Modifications Annulées", "Le formulaire a été réinitialisé aux valeurs enregistrées.");
  };

  // Reset category to default reference
  const handleResetActiveCategory = () => {
    setCriticalModal({
      title: `Réinitialiser "${CATEGORY_METADATA[activeCategory].title}" ?`,
      description:
        "Cette action rétablira l'ensemble des paramètres de cette catégorie aux valeurs cliniques de référence approuvées par FONA Digital. Cette opération sera tracée dans le journal d'audit.",
      onConfirm: async () => {
        setCriticalModal(null);
        await resetCentralizedCategory(activeCategory);
      },
    });
  };

  // Backup actions
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const handleTriggerBackup = async () => {
    setIsBackupRunning(true);
    await triggerManualBackup();
    setIsBackupRunning(false);
  };

  const handleDownloadBackup = () => {
    exportDatabaseJson();
  };

  // Navigation items for the 8 categories
  const categoryKeys: SettingsCategoryKey[] = [
    "generalBrand",
    "appearanceTheme",
    "regional",
    "documentsNumbering",
    "securitySessions",
    "backupsMaintenance",
    "technicalConfig",
  ];

  const currentMeta = CATEGORY_METADATA[activeCategory] || CATEGORY_METADATA.generalBrand;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================
          TOP HEADER: LE CENTRE UNIQUE DE CONFIGURATION
          ======================================================== */}
      <div className="p-5 rounded-2xl glass-surface border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative overflow-hidden">
        {/* Lueur supérieure spéculaire */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#55D9FF]/40 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1261A0]/30 to-[#55D9FF]/20 text-[#55D9FF] border border-[#55D9FF]/30 flex items-center justify-center shrink-0 shadow-lg">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Centre Unique de Paramètres FONA Digital
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#55D9FF] border border-cyan-400/30">
                Source Unique
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Configuration centralisée partagée en temps réel entre tous les postes cliniques, terminaux et documents
            </p>
          </div>
        </div>

        {/* Server & Persistence Status Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Serveur API Actif</span>
          </div>

          {lastSettingsSavedAt && (
            <div className="text-[11px] text-slate-300 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dernier sync : {lastSettingsSavedAt}</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          BARRE D'ACTION CONTEXTUELLE FLOTTANTE (CONDITIONNELLE)
          Uniquement affichée lorsque des modifications sont détectées (Requirement 6)
          ======================================================== */}
      {isDirty && (
        <div className="sticky top-24 z-30 p-3.5 rounded-xl bg-amber-950/80 backdrop-blur-xl border border-amber-400/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span>
              Modifications non enregistrées dans <strong className="text-white">{currentMeta.title}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <GlassButton
              variant="subtle"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleCancelActiveCategory}
              disabled={isSavingCentralizedSettings}
            >
              Annuler
            </GlassButton>

            <GlassButton
              variant="cyan"
              size="sm"
              icon={
                isSavingCentralizedSettings ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )
              }
              onClick={handleSaveActiveCategory}
              disabled={isSavingCentralizedSettings}
            >
              {isSavingCentralizedSettings ? "Enregistrement..." : "Enregistrer les modifications"}
            </GlassButton>
          </div>
        </div>
      )}

      {/* ========================================================
          CORPS PRINCIPAL : NAVIGATION PAR CATÉGORIE & CONTENU
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation latérale par catégories (4 colonnes) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="px-2 pb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Catégories de Paramètres</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-cyan-300">
              8 Domaines
            </span>
          </div>

          <div className="space-y-1.5">
            {/* 1. Général & Identité */}
            <button
              onClick={() => setActiveCategory("generalBrand")}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeCategory === "generalBrand"
                  ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30"
                  : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-300 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeCategory === "generalBrand"
                      ? "bg-cyan-400 text-slate-900 shadow-sm"
                      : "bg-white/5 text-[#D9B45B] group-hover:text-cyan-300"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Identité & Coordonnées</div>
                  <div className="text-[10px] text-slate-400 truncate">Nom, logos, adresses et slogan</div>
                </div>
              </div>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">
                Général
              </span>
            </button>

            {/* 2. Apparence & Thème */}
            <button
              onClick={() => setActiveCategory("appearanceTheme")}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeCategory === "appearanceTheme"
                  ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30"
                  : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-300 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeCategory === "appearanceTheme"
                      ? "bg-cyan-400 text-slate-900 shadow-sm"
                      : "bg-white/5 text-cyan-400 group-hover:text-cyan-300"
                  }`}
                >
                  <Palette className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Apparence & Thème</div>
                  <div className="text-[10px] text-slate-400 truncate">Liquid Glass, thème par défaut, UI</div>
                </div>
              </div>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">
                Visuel
              </span>
            </button>

            {/* 3. Paramètres Régionaux */}
            <button
              onClick={() => setActiveCategory("regional")}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeCategory === "regional"
                  ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30"
                  : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-300 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeCategory === "regional"
                      ? "bg-cyan-400 text-slate-900 shadow-sm"
                      : "bg-white/5 text-emerald-400 group-hover:text-cyan-300"
                  }`}
                >
                  <Globe2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Paramètres Régionaux</div>
                  <div className="text-[10px] text-slate-400 truncate">Mali (FCFA · Bamako · +223)</div>
                </div>
              </div>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                Mali
              </span>
            </button>

            {/* 4. Documents & Numérotation */}
            <button
              onClick={() => setActiveCategory("documentsNumbering")}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeCategory === "documentsNumbering"
                  ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30"
                  : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-300 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeCategory === "documentsNumbering"
                      ? "bg-cyan-400 text-slate-900 shadow-sm"
                      : "bg-white/5 text-amber-400 group-hover:text-cyan-300"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Documents & Numérotation</div>
                  <div className="text-[10px] text-slate-400 truncate">En-têtes, préfixes PAT-, CONS-, FAC-</div>
                </div>
              </div>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                Critique
              </span>
            </button>

            {/* 5. Utilisateurs, Rôles & Habilitations */}
            <button
              onClick={() => setActiveCategory("usersRoles" as any)}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                (activeCategory as string) === "usersRoles"
                  ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30"
                  : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-300 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    (activeCategory as string) === "usersRoles"
                      ? "bg-cyan-400 text-slate-900 shadow-sm"
                      : "bg-white/5 text-blue-400 group-hover:text-cyan-300"
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Utilisateurs & Permissions</div>
                  <div className="text-[10px] text-slate-400 truncate">Comptes soignants & matrice RBAC</div>
                </div>
              </div>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                RBAC
              </span>
            </button>

            {/* 6. Sécurité & Sessions */}
            <button
              onClick={() => setActiveCategory("securitySessions")}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeCategory === "securitySessions"
                  ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30"
                  : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-300 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeCategory === "securitySessions"
                      ? "bg-cyan-400 text-slate-900 shadow-sm"
                      : "bg-white/5 text-purple-400 group-hover:text-cyan-300"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Sécurité & Sessions</div>
                  <div className="text-[10px] text-slate-400 truncate">Délai inactivité, sessions actives</div>
                </div>
              </div>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                Sécurité
              </span>
            </button>

            {/* 7. Sauvegardes & Maintenance */}
            <button
              onClick={() => setActiveCategory("backupsMaintenance")}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeCategory === "backupsMaintenance"
                  ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30"
                  : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-300 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeCategory === "backupsMaintenance"
                      ? "bg-cyan-400 text-slate-900 shadow-sm"
                      : "bg-white/5 text-emerald-400 group-hover:text-cyan-300"
                  }`}
                >
                  <Database className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Sauvegardes & Continuité</div>
                  <div className="text-[10px] text-slate-400 truncate">RPO ≤ 1h, RTO ≤ 4h, archives SHA-256</div>
                </div>
              </div>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                RPO/RTO
              </span>
            </button>

            {/* 8. Configuration Technique Réservée */}
            <button
              onClick={() => setActiveCategory("technicalConfig")}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeCategory === "technicalConfig"
                  ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30"
                  : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-300 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeCategory === "technicalConfig"
                      ? "bg-cyan-400 text-slate-900 shadow-sm"
                      : "bg-white/5 text-[#D9B45B] group-hover:text-cyan-300"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Configuration Technique</div>
                  <div className="text-[10px] text-slate-400 truncate">Diagnostics, API & mode dégradé</div>
                </div>
              </div>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                Admin
              </span>
            </button>
          </div>
        </div>

        {/* Panneau de contenu de la catégorie active (8 colonnes) */}
        <div className="lg:col-span-8 space-y-6">
          {/* ========================================================
              CATÉGORIE 1: PARAMÈTRES GÉNÉRAUX ET IDENTITÉ FONA
              ======================================================== */}
          {activeCategory === "generalBrand" && (
            <div className="space-y-6">
              <GlassCard className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#D9B45B]" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Identité Institutionnelle du Cabinet Médical
                      </h3>
                      <p className="text-xs text-slate-400">
                        Ces informations figurent automatiquement sur les en-têtes d'ordonnances, reçus et courriers
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Source Globale
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassInput
                    label="Raison Sociale Complète"
                    value={brandForm.organizationName}
                    onChange={(e) => setBrandForm({ ...brandForm, organizationName: e.target.value })}
                  />
                  <GlassInput
                    label="Nom Court Institutionnel"
                    value={brandForm.shortName}
                    onChange={(e) => setBrandForm({ ...brandForm, shortName: e.target.value })}
                  />
                </div>

                <GlassInput
                  label="Devise / Slogan Médical Officiel"
                  value={brandForm.slogan}
                  onChange={(e) => setBrandForm({ ...brandForm, slogan: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassInput
                    label="Téléphone Standard Clinique"
                    value={brandForm.clinicPhone}
                    onChange={(e) => setBrandForm({ ...brandForm, clinicPhone: e.target.value })}
                  />
                  <GlassInput
                    label="Ligne d'Urgence 24h/24"
                    value={brandForm.emergencyPhone}
                    onChange={(e) => setBrandForm({ ...brandForm, emergencyPhone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassInput
                    label="Email Administratif Officiel"
                    value={brandForm.clinicEmail}
                    onChange={(e) => setBrandForm({ ...brandForm, clinicEmail: e.target.value })}
                  />
                  <GlassInput
                    label="Directeur Médical en Titre"
                    value={brandForm.directorName}
                    onChange={(e) => setBrandForm({ ...brandForm, directorName: e.target.value })}
                  />
                </div>

                <GlassInput
                  label="Adresse Postale et Géographique (Bamako)"
                  value={brandForm.clinicAddress}
                  onChange={(e) => setBrandForm({ ...brandForm, clinicAddress: e.target.value })}
                />
              </GlassCard>

              {/* Sélection du Logo Actif */}
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Système Centralisé de Logos FONA Digital
                  </h4>
                  <span className="text-[11px] text-slate-400">Non déformé · Proportions conservées</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option A: Silhouette Coeur & Croix */}
                  <div
                    onClick={() => setBrandForm({ ...brandForm, activePrimaryChoice: "secondary_design" })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      brandForm.activePrimaryChoice === "secondary_design"
                        ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(85,217,255,0.2)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Logo Principal (Silhouette Coeur)</span>
                      {brandForm.activePrimaryChoice === "secondary_design" && (
                        <Check className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <div className="h-20 bg-slate-950/60 rounded-lg flex items-center justify-center p-2 border border-white/5">
                      <img
                        src="/fona_logo_principal.jpg"
                        alt="Logo Principal FONA"
                        className="max-h-16 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Utilisé par défaut dans la barre latérale, les en-têtes d'écrans et les interfaces modernes.
                    </p>
                  </div>

                  {/* Option B: Croix avec Caducée Officiel */}
                  <div
                    onClick={() => setBrandForm({ ...brandForm, activePrimaryChoice: "official_cross" })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      brandForm.activePrimaryChoice === "official_cross"
                        ? "bg-amber-950/40 border-[#D9B45B] shadow-[0_0_20px_rgba(217,180,91,0.2)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Logo Institutionnel (Croix Caducée)</span>
                      {brandForm.activePrimaryChoice === "official_cross" && (
                        <Check className="w-4 h-4 text-[#D9B45B]" />
                      )}
                    </div>
                    <div className="h-20 bg-slate-950/60 rounded-lg flex items-center justify-center p-2 border border-white/5">
                      <img
                        src="/fona_logo_officiel.jpg"
                        alt="Logo Institutionnel FONA"
                        className="max-h-16 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Référence institutionnelle pour les tampons d'ordonnances, certificats et documents légaux.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* ========================================================
              CATÉGORIE 2: APPARENCE ET THÈME
              ======================================================== */}
          {activeCategory === "appearanceTheme" && (
            <div className="space-y-6">
              <GlassCard className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Thème Institutionnel & Rendu Liquid Glass 2.0
                      </h3>
                      <p className="text-xs text-slate-400">
                        Configuration de l'apparence par défaut du cabinet pour tous les postes soignants
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                    Visuel
                  </span>
                </div>

                {/* Thème Institutionnel par Défaut */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Thème Cabinet par Défaut (Nouvelles sessions et affichages d'accueil)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, defaultCabinetTheme: "light" })}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        appearanceForm.defaultCabinetTheme === "light"
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sun className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-bold">Mode Clair</span>
                      <span className="text-[10px] text-slate-400">Médical Lumineux Glass</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, defaultCabinetTheme: "dark" })}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        appearanceForm.defaultCabinetTheme === "dark"
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/30"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Moon className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs font-bold">Mode Sombre</span>
                      <span className="text-[10px] text-slate-400">Dark Medical Luxury</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, defaultCabinetTheme: "system" })}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        appearanceForm.defaultCabinetTheme === "system"
                          ? "bg-[#4F7DF3]/20 border-blue-400 text-blue-300 ring-2 ring-blue-400/30"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Monitor className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-bold">Mode Système</span>
                      <span className="text-[10px] text-slate-400">Synchronisé OS Client</span>
                    </button>
                  </div>
                </div>

                {/* Intensité du Liquid Glass 2.0 */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Intensité du Liquid Glass & Flou Réfractif (Backdrop Blur)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, liquidGlassIntensity: "subtle" })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        appearanceForm.liquidGlassIntensity === "subtle"
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Discret (Économie CPU)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, liquidGlassIntensity: "balanced" })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        appearanceForm.liquidGlassIntensity === "balanced"
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Équilibré (Recommandé)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, liquidGlassIntensity: "high" })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        appearanceForm.liquidGlassIntensity === "high"
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Immersion Forte
                    </button>
                  </div>
                </div>

                {/* Mode Animations */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Gestion des Animations Cliniques
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, animationMode: "full" })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        appearanceForm.animationMode === "full"
                          ? "bg-[#D9B45B]/20 border-amber-400 text-[#D9B45B]"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Animations Complètes
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, animationMode: "reduced" })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        appearanceForm.animationMode === "reduced"
                          ? "bg-[#D9B45B]/20 border-amber-400 text-[#D9B45B]"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Animations Réduites
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, animationMode: "disabled" })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        appearanceForm.animationMode === "disabled"
                          ? "bg-[#D9B45B]/20 border-amber-400 text-[#D9B45B]"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Désactivées (Instantané)
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* ========================================================
              CATÉGORIE 3: PARAMÈTRES RÉGIONAUX (MALI · FCFA · BAMAKO)
              ======================================================== */}
          {activeCategory === "regional" && (
            <div className="space-y-6">
              <GlassCard className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Globe2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Calibrage Régional · Mali & Zone FCFA
                      </h3>
                      <p className="text-xs text-slate-400">
                        Règle de localisation absolue : Devise FCFA (XOF), fuseau Africa/Bamako et indicatif +223
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Officiel Mali
                  </span>
                </div>

                {/* Préréglages en 1 clic */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold text-slate-300">Préréglage Clinique :</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const p = REGIONAL_PRESETS.mali_standard.settings;
                        setRegionalForm({ ...regionalForm, ...p });
                        showToast("INFO", "Préréglage Appliqué", "Configuration Mali Standard chargée.");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer"
                    >
                      Mali Standard (Bamako)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const p = REGIONAL_PRESETS.uemoa_standard.settings;
                        setRegionalForm({ ...regionalForm, ...p });
                        showToast("INFO", "Préréglage Appliqué", "Configuration UEMOA chargée.");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 hover:bg-cyan-500/30 transition-all cursor-pointer"
                    >
                      Zone UEMOA (XOF)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassSelect
                    label="Devise Affichée"
                    value={regionalForm.currencyDisplay}
                    onChange={(e) => setRegionalForm({ ...regionalForm, currencyDisplay: e.target.value })}
                    options={[
                      { value: "FCFA", label: "FCFA (Franc CFA BCEAO — Préféré)" },
                      { value: "XOF", label: "XOF (Code ISO International)" },
                      { value: "F CFA", label: "F CFA (Variante d'impression)" },
                    ]}
                  />

                  <GlassSelect
                    label="Fuseau Horaire Médical"
                    value={regionalForm.timezone}
                    onChange={(e) => setRegionalForm({ ...regionalForm, timezone: e.target.value })}
                    options={[
                      { value: "Africa/Bamako", label: "Africa/Bamako (GMT / UTC+00:00 — Mali)" },
                      { value: "Africa/Abidjan", label: "Africa/Abidjan (GMT / UTC+00:00)" },
                      { value: "Africa/Dakar", label: "Africa/Dakar (GMT / UTC+00:00)" },
                      { value: "UTC", label: "UTC Universel Coordonné" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <GlassSelect
                    label="Format de Date"
                    value={regionalForm.dateFormat}
                    onChange={(e) => setRegionalForm({ ...regionalForm, dateFormat: e.target.value as any })}
                    options={[
                      { value: "dd/MM/yyyy", label: "dd/MM/yyyy (27/09/2026)" },
                      { value: "yyyy-MM-dd", label: "yyyy-MM-dd (2026-09-27)" },
                      { value: "MM/dd/yyyy", label: "MM/dd/yyyy (09/27/2026)" },
                    ]}
                  />

                  <GlassSelect
                    label="Format de l'Heure"
                    value={regionalForm.timeFormat}
                    onChange={(e) => setRegionalForm({ ...regionalForm, timeFormat: e.target.value as any })}
                    options={[
                      { value: "24h", label: "Format 24 Heures (14:30 — Clinique)" },
                      { value: "12h", label: "Format 12 Heures (02:30 PM)" },
                    ]}
                  />

                  <GlassInput
                    label="Indicatif Téléphonique"
                    value={regionalForm.phoneCountryCode}
                    onChange={(e) => setRegionalForm({ ...regionalForm, phoneCountryCode: e.target.value })}
                  />
                </div>

                {/* Aperçu en direct */}
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-400/30 space-y-2 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Aperçu en Direct du Calibrage Régional :</span>
                    <span className="font-mono text-cyan-300">{formatTime(liveBamakoTime)}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300">
                    <div>
                      Montant test : <strong className="text-white">{formatCurrency(15000)}</strong>
                    </div>
                    <div>
                      Date du jour : <strong className="text-white">{formatDate(liveBamakoTime)}</strong>
                    </div>
                    <div>
                      Téléphone type : <strong className="text-white">+223 66 73 05 16</strong>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* ========================================================
              CATÉGORIE 4: DOCUMENTS ET NUMÉROTATION
              ======================================================== */}
          {activeCategory === "documentsNumbering" && (
            <div className="space-y-6">
              <GlassCard className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Gabarits de Documents & Préfixes de Numérotation
                      </h3>
                      <p className="text-xs text-slate-400">
                        Paramétrage des identifiants permanents, en-têtes d'ordonnances et reçus de caisse
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Non Rétroactif
                  </span>
                </div>

                {/* Préfixes de Numérotation Permanente */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-cyan-400" />
                    <span>Préfixes des Identifiants Permanents (Section 55 du CDC)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <GlassInput
                      label="Préfixe Dossier Patient"
                      value={docsForm.patientIdPrefix}
                      onChange={(e) => setDocsForm({ ...docsForm, patientIdPrefix: e.target.value })}
                    />
                    <GlassInput
                      label="Préfixe Consultation"
                      value={docsForm.consultationIdPrefix}
                      onChange={(e) => setDocsForm({ ...docsForm, consultationIdPrefix: e.target.value })}
                    />
                    <GlassInput
                      label="Préfixe Facturation"
                      value={docsForm.invoiceIdPrefix}
                      onChange={(e) => setDocsForm({ ...docsForm, invoiceIdPrefix: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <GlassInput
                      label="Préfixe Passage Clinique"
                      value={docsForm.visitIdPrefix}
                      onChange={(e) => setDocsForm({ ...docsForm, visitIdPrefix: e.target.value })}
                    />
                    <GlassInput
                      label="Préfixe Reçu de Caisse"
                      value={docsForm.receiptIdPrefix}
                      onChange={(e) => setDocsForm({ ...docsForm, receiptIdPrefix: e.target.value })}
                    />
                  </div>
                </div>

                {/* Options d'impression */}
                <div className="pt-3 border-t border-white/10 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>Options des Gabarits Cliniques</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <GlassSelect
                      label="Format Papier par Défaut"
                      value={docsForm.defaultPaperFormat}
                      onChange={(e) => setDocsForm({ ...docsForm, defaultPaperFormat: e.target.value as any })}
                      options={[
                        { value: "A4", label: "Format A4 Standard (Ordonnances / Bilans)" },
                        { value: "A5", label: "Format A5 Demi-page (Certificats)" },
                        { value: "TICKET_80MM", label: "Ticket Thermique 80mm (Reçus Caisse)" },
                      ]}
                    />

                    <div className="flex flex-col justify-center space-y-2 pt-2 sm:pt-4">
                      <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={docsForm.showOfficialLogo}
                          onChange={(e) => setDocsForm({ ...docsForm, showOfficialLogo: e.target.checked })}
                          className="rounded border-white/20 text-cyan-500"
                        />
                        <span>Afficher le logo officiel sur les documents</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={docsForm.showWatermark}
                          onChange={(e) => setDocsForm({ ...docsForm, showWatermark: e.target.checked })}
                          className="rounded border-white/20 text-cyan-500"
                        />
                        <span>Appliquer le filigrane de sécurité FONA</span>
                      </label>
                    </div>
                  </div>

                  <GlassInput
                    label="Mention Obligatoire en En-Tête"
                    value={docsForm.officialMention}
                    onChange={(e) => setDocsForm({ ...docsForm, officialMention: e.target.value })}
                  />

                  <GlassInput
                    label="Texte Légal de Pied de Page"
                    value={docsForm.footerLegalText}
                    onChange={(e) => setDocsForm({ ...docsForm, footerLegalText: e.target.value })}
                  />
                </div>
              </GlassCard>
            </div>
          )}

          {/* ========================================================
              CATÉGORIE 5: UTILISATEURS, RÔLES ET AUTORISATIONS
              ======================================================== */}
          {activeCategory === ("usersRoles" as any) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl glass-surface border border-white/10">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Gouvernance des Équipes & Habilitations RBAC
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#051426] p-1 rounded-lg border border-white/10 text-xs">
                  <button
                    onClick={() => setUsersSubTab("USERS")}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      usersSubTab === "USERS" ? "bg-[#4F7DF3] text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Comptes Utilisateurs
                  </button>
                  <button
                    onClick={() => setUsersSubTab("ROLES")}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      usersSubTab === "ROLES" ? "bg-[#4F7DF3] text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Matrice des Habilitations
                  </button>
                </div>
              </div>

              {usersSubTab === "USERS" ? <AdminUsersTab /> : <AdminRolesPermissionsTab />}
            </div>
          )}

          {/* ========================================================
              CATÉGORIE 6: SÉCURITÉ ET SESSIONS
              ======================================================== */}
          {activeCategory === "securitySessions" && (
            <div className="space-y-6">
              <GlassCard className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Sécurité d'Accès, Sessions & Verrouillage
                      </h3>
                      <p className="text-xs text-slate-400">
                        Protection des données médicales sensibles et contrôle des terminaux en ligne
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Critique
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <GlassInput
                    type="number"
                    label="Délai d'inactivité (minutes)"
                    value={securityForm.sessionTimeoutMinutes}
                    onChange={(e) =>
                      setSecurityForm({ ...securityForm, sessionTimeoutMinutes: parseInt(e.target.value) || 30 })
                    }
                  />

                  <GlassInput
                    type="number"
                    label="Tentatives échouées max"
                    value={securityForm.maxFailedAttempts}
                    onChange={(e) =>
                      setSecurityForm({ ...securityForm, maxFailedAttempts: parseInt(e.target.value) || 5 })
                    }
                  />

                  <GlassInput
                    type="number"
                    label="Longueur min mot de passe"
                    value={securityForm.passwordMinLength}
                    onChange={(e) =>
                      setSecurityForm({ ...securityForm, passwordMinLength: parseInt(e.target.value) || 10 })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityForm.requireSpecialChar}
                      onChange={(e) => setSecurityForm({ ...securityForm, requireSpecialChar: e.target.checked })}
                      className="rounded border-white/20 text-cyan-500"
                    />
                    <span>Exiger au moins un caractère spécial dans les mots de passe</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityForm.enforceLockOnIdle}
                      onChange={(e) => setSecurityForm({ ...securityForm, enforceLockOnIdle: e.target.checked })}
                      className="rounded border-white/20 text-cyan-500"
                    />
                    <span>Activer le verrouillage automatique en cas d'inactivité</span>
                  </label>
                </div>
              </GlassCard>

              {/* Sessions actives */}
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Sessions Actives en Temps Réel ({sessions.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Révocation à distance</span>
                </div>

                <div className="space-y-2.5">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
                          {sess.device.toLowerCase().includes("ipad") || sess.device.toLowerCase().includes("android") ? (
                            <Smartphone className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Laptop className="w-4 h-4 text-[#4F7DF3]" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{sess.userName}</span>
                            <span className="text-[10px] text-[#D9B45B]">({ROLE_LABELS[sess.userRole]})</span>
                            {sess.isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                                Session Actuelle
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {sess.device} &middot; IP : {sess.ipAddress} &middot; {sess.lastActivityAt}
                          </div>
                        </div>
                      </div>

                      {!sess.isCurrent && (
                        <button
                          onClick={() => terminateSession(sess.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                        >
                          Déconnecter
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* ========================================================
              CATÉGORIE 7: SAUVEGARDES ET MAINTENANCE
              ======================================================== */}
          {activeCategory === "backupsMaintenance" && (
            <div className="space-y-6">
              <GlassCard className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Continuité d'Activité & Politique de Sauvegarde
                      </h3>
                      <p className="text-xs text-slate-400">
                        Objectifs de tolérance clinique : RPO &le; 1h (cible légale &le; 24h) &middot; RTO &le; 4h
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    RPO/RTO Conformes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassSelect
                    label="Fréquence de Sauvegarde Automatique"
                    value={backupForm.backupFrequency}
                    onChange={(e) => setBackupForm({ ...backupForm, backupFrequency: e.target.value as any })}
                    options={[
                      { value: "hourly", label: "Toutes les heures (Recommandé en clinique)" },
                      { value: "daily", label: "Quotidienne (Chaque nuit à 03h00)" },
                      { value: "weekly", label: "Hebdomadaire (Chaque dimanche)" },
                    ]}
                  />

                  <GlassInput
                    type="number"
                    label="Rétention des Archives (Jours)"
                    value={backupForm.retentionDays}
                    onChange={(e) => setBackupForm({ ...backupForm, retentionDays: parseInt(e.target.value) || 30 })}
                  />
                </div>

                {/* Actions instantanées de sauvegarde */}
                <div className="pt-2 flex items-center gap-3 flex-wrap">
                  <GlassButton
                    variant="cyan"
                    size="sm"
                    icon={<Database className="w-4 h-4" />}
                    onClick={handleTriggerBackup}
                    disabled={isBackupRunning}
                  >
                    {isBackupRunning ? "Sauvegarde en cours..." : "Sauvegarder Maintenant"}
                  </GlassButton>

                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={<FileJson className="w-4 h-4 text-cyan-400" />}
                    onClick={handleDownloadBackup}
                  >
                    Exporter la Base Complète (JSON Chiffré)
                  </GlassButton>
                </div>
              </GlassCard>

              {/* Historique des sauvegardes */}
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Archives Validées & Historique ({backups.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Intégrité SHA-256</span>
                </div>

                <div className="space-y-2.5">
                  {backups.map((bkp) => (
                    <div
                      key={bkp.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{bkp.fileName}</span>
                          <span className="text-[10px] text-slate-400">({bkp.sizeMb} Mo)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Date : {bkp.timestamp} &middot; Durée : {bkp.durationSeconds}s &middot; Type : {bkp.type}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {bkp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* ========================================================
              CATÉGORIE 8: CONFIGURATION TECHNIQUE RÉSERVÉE
              ======================================================== */}
          {activeCategory === "technicalConfig" && (
            <div className="space-y-6">
              <GlassCard className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-5 h-5 text-[#D9B45B]" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Configuration Technique Réservée à l'Administration
                      </h3>
                      <p className="text-xs text-slate-400">
                        Paramètres d'infrastructure, niveau de log serveur et mode réseau dégradé
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-[#D9B45B] border border-amber-500/30">
                    Accès Réservé
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassInput
                    label="Point d'accès API Principal"
                    value={techForm.apiEndpoint}
                    onChange={(e) => setTechForm({ ...techForm, apiEndpoint: e.target.value })}
                  />

                  <GlassSelect
                    label="Niveau de Journalisation Serveur"
                    value={techForm.logLevel}
                    onChange={(e) => setTechForm({ ...techForm, logLevel: e.target.value as any })}
                    options={[
                      { value: "info", label: "Info (Standard clinique)" },
                      { value: "warn", label: "Avertissement (Anomalies uniquement)" },
                      { value: "error", label: "Erreur (Erreurs critiques uniquement)" },
                      { value: "debug", label: "Debug (Traçabilité détaillée)" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={techForm.degradedOfflineAllowed}
                      onChange={(e) => setTechForm({ ...techForm, degradedOfflineAllowed: e.target.checked })}
                      className="rounded border-white/20 text-cyan-500"
                    />
                    <span>Autoriser le fonctionnement en mode dégradé hors-ligne</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={techForm.requireConfirmationForCritical}
                      onChange={(e) =>
                        setTechForm({ ...techForm, requireConfirmationForCritical: e.target.checked })
                      }
                      className="rounded border-white/20 text-cyan-500"
                    />
                    <span>Exiger une confirmation explicite pour les actions sensibles</span>
                  </label>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Réinitialisation Médicale de Référence</div>
                    <div className="text-[11px] text-slate-400">
                      Rétablir les paramètres par défaut pour la catégorie active
                    </div>
                  </div>

                  <GlassButton
                    variant="subtle"
                    size="sm"
                    icon={<RotateCcw className="w-3.5 h-3.5 text-amber-400" />}
                    onClick={handleResetActiveCategory}
                  >
                    Rétablir par défaut
                  </GlassButton>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmation pour Action Critique */}
      {criticalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020b17]/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[var(--surface-elevated)] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">{criticalModal.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{criticalModal.description}</p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <GlassButton variant="subtle" size="sm" onClick={() => setCriticalModal(null)}>
                Annuler
              </GlassButton>
              <GlassButton variant="gold" size="sm" onClick={criticalModal.onConfirm}>
                Confirmer l'opération
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
