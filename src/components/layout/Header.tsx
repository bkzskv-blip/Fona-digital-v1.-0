import React, { useState, useEffect } from "react";
import {
  Search,
  Menu,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronDown,
  UserCheck,
  Bell,
  Printer,
  Shield,
  HelpCircle,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Check,
  Lock,
  LogOut,
  Clock,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassAvatar } from "../ui/GlassAvatar";
import { ROLE_LABELS, canAccessModule, getDefaultTabForRole } from "../../services/rbacService";
import { UserProfileModal } from "../modals/UserProfileModal";
import { SwitchAccountModal } from "../modals/SwitchAccountModal";
import { User, UserCheck as UserIcon } from "lucide-react";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const {
    activeTab,
    currentSite,
    isOffline,
    toggleOfflineMode,
    isSyncing,
    syncAllSites,
    users,
    currentUser,
    setCurrentUser,
    setActiveTab,
    setIsGlobalSearchOpen,
    syncEvents,
    themeMode,
    resolvedTheme,
    setThemeMode,
    lockSession,
    logout,
    logAudit,
    showToast,
    regionalSettings,
    formatTime,
    formatDate,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSwitchAccountModalOpen, setIsSwitchAccountModalOpen] = useState(false);
  const [headerNow, setHeaderNow] = useState(new Date());
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setHeaderNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSyncWithFeedback = async () => {
    await syncAllSites();
    setJustSynced(true);
    setTimeout(() => setJustSynced(false), 2200);
  };

  const pendingEventsCount = syncEvents.filter((e) => e.status === "queued").length;

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: "Tableau de Bord", subtitle: "Vue d'activité en direct" },
    patients: { title: "Patients", subtitle: "Dossiers permanents et chronologie" },
    consultations: { title: "Consultations", subtitle: "Examens, diagnostics & ordonnances" },
    care: { title: "Soins", subtitle: "Actes infirmiers et constantes" },
    appointments: { title: "Rendez-vous", subtitle: "Agenda et planning" },
    maternite: { title: "Maternité", subtitle: "Suivi obstétrical & CPN" },
    laboratory: { title: "Laboratoire", subtitle: "Analyses biologiques" },
    imaging: { title: "Imagerie", subtitle: "Radiologie et échographie" },
    cashier: { title: "Caisse", subtitle: "Facturation et encaissements" },
    reports: { title: "Rapports", subtitle: "Statistiques et activité" },
    admin: { title: "Administration", subtitle: "Configuration et sécurité" },
  };

  const currentTabInfo = tabTitles[activeTab] || {
    title: "FONA Digital",
    subtitle: "Dossier Médical Informatisé",
  };

  return (
    <header className="h-20 bg-[var(--header-bg)] backdrop-blur-2xl border-b border-[var(--border)] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors duration-220 relative">
      {/* Reflet spéculaire zénithal biseauté Header */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/15 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 dark:via-cyan-400/10 to-transparent pointer-events-none" />

      {/* Left Title and Mobile Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight truncate">
            {currentTabInfo.title}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] truncate hidden sm:block">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-lg hidden md:block">
        <div
          onClick={() => setIsGlobalSearchOpen(true)}
          className="relative w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border)] hover:border-cyan-400/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2.5 text-xs truncate">
            <Search className="w-4 h-4 text-[#55D9FF] shrink-0" />
            <span className="truncate">Rechercher un patient, une consultation, un rendez-vous...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[var(--surface)] text-[10px] font-mono font-medium text-[var(--text-secondary)] border border-[var(--border)] shrink-0">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right Actions: Theme Switcher, Multi-Site, Offline Toggle, Sync, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Theme Switcher Pill (Clair / Sombre / Système) */}
        <div
          className="flex items-center bg-[var(--surface-subtle)] p-0.5 rounded-xl border border-[var(--border)] shadow-xs"
          title="Changer de thème (Clair / Sombre / Système)"
        >
          <button
            onClick={() => setThemeMode("light")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              themeMode === "light"
                ? "bg-white text-amber-600 shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10"
            }`}
            title="Mode Clair (Médical Lumineux Glass)"
            aria-label="Mode Clair"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setThemeMode("dark")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              themeMode === "dark"
                ? "bg-[#091f3a] text-cyan-400 shadow-sm border border-cyan-400/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10"
            }`}
            title="Mode Sombre (Dark Medical Glass)"
            aria-label="Mode Sombre"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setThemeMode("system")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              themeMode === "system"
                ? "bg-[#4F7DF3] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10"
            }`}
            title={`Mode Système (${resolvedTheme === "dark" ? "Sombre actif" : "Clair actif"})`}
            aria-label="Mode Système"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bamako Live Clock & Date Badge */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs font-mono"
          title={`Fuseau horaire officiel : ${regionalSettings.timezone} (GMT / UTC+00:00)`}
        >
          <Clock className="w-3.5 h-3.5 text-[#55D9FF]" />
          <span className="font-bold text-[var(--text-primary)]">
            {formatTime(headerNow)}
          </span>
          <span className="text-[var(--text-muted)]">&middot;</span>
          <span className="text-[11px] text-[var(--text-secondary)]">
            {formatDate(headerNow)}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-400/20">
            {regionalSettings.timezone.split("/")[1] || "Bamako"}
          </span>
        </div>

        {/* Center / Clinic Name Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="truncate">{currentSite.name}</span>
        </div>

        {/* Offline / Online Mode Toggle Simulator */}
        <button
          onClick={toggleOfflineMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isOffline
              ? "bg-amber-500/15 border-amber-500/30 text-amber-500 dark:text-amber-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          }`}
          title={isOffline ? "Mode hors connexion sécurisé (cliquez pour reconnecter)" : "Connecté au serveur principal"}
        >
          {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isOffline ? "Hors-ligne" : "Connecté"}</span>
        </button>

        {/* Sync Button with subtle Liquid Glass ripple & status pulse */}
        <div className="relative">
          {isSyncing && (
            <div className="absolute inset-0 rounded-xl bg-cyan-400/35 animate-fona-sync-pulse pointer-events-none" />
          )}
          <button
            onClick={handleSyncWithFeedback}
            disabled={isSyncing}
            className={`fona-btn-interactive relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer disabled:opacity-75 ${
              justSynced
                ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-600 dark:text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.35)]"
                : isSyncing
                ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-400/30"
                : "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-400/25 text-[#1261A0] dark:text-[#55D9FF]"
            }`}
            title="Synchronisation locale et serveur FONA Digital"
          >
            {justSynced ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-fona-check-pop" />
            ) : (
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-cyan-300" : ""}`} />
            )}
            {pendingEventsCount > 0 && !justSynced && (
              <span className="px-1 py-0.2 rounded-full bg-cyan-400 text-[#071A33] text-[9px] font-bold animate-pulse">
                {pendingEventsCount}
              </span>
            )}
          </button>
        </div>

        {/* User Account Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="fona-btn-interactive flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border)] transition-all cursor-pointer"
          >
            <GlassAvatar role={currentUser.role} name={currentUser.fullName} size="sm" />
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-[var(--text-primary)] max-w-[110px] truncate">
                {currentUser.fullName.split(" ")[0]}
              </span>
              <span className="text-[10px] text-[#B48B2E] dark:text-[#D9B45B] font-semibold truncate">
                {ROLE_LABELS[currentUser.role].split("/")[0]}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-2xl p-2 z-50 animate-fona-modal">
              {/* User Identity Info */}
              <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">{currentUser.fullName}</div>
                <div className="text-[11px] text-[var(--text-secondary)] truncate">{currentUser.email}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-[#1261A0] dark:text-cyan-300 border border-blue-400/30">
                    {ROLE_LABELS[currentUser.role]}
                  </span>
                  {currentUser.department && (
                    <span className="text-[9px] text-[var(--text-muted)] truncate">{currentUser.department}</span>
                  )}
                </div>
              </div>

              {/* Centralized Account Actions Only (Requirement 2 & 6) */}
              <div className="space-y-1 pt-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-[#1261A0] dark:text-[#55D9FF] shrink-0" />
                  <span>Profil</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsSwitchAccountModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Changer de compte</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    lockSession();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Verrouiller</span>
                </button>

                <div className="pt-1 border-t border-[var(--border)]">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 flex items-center gap-2.5 cursor-pointer font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Multi-Stage Authenticated Account Switching Modal (Requirement 3) */}
      <SwitchAccountModal
        isOpen={isSwitchAccountModalOpen}
        onClose={() => setIsSwitchAccountModalOpen(false)}
      />
    </header>
  );
};
