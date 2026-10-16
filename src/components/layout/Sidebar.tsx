import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Stethoscope,
  CalendarDays,
  HeartHandshake,
  Baby,
  FlaskConical,
  ScanLine,
  BarChart3,
  Network,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  Bell,
  HelpCircle,
  UserCheck,
  Lock,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { FonaLogo } from "../ui/FonaLogo";
import { GlassAvatar } from "../ui/GlassAvatar";
import {
  ROLE_LABELS,
  getAuthorizedModulesForRole,
  canAccessModule,
  NavModuleDefinition,
} from "../../services/rbacService";
import { UserProfileModal } from "../modals/UserProfileModal";
import { HelpGuideModal } from "../modals/HelpGuideModal";
import { NotificationsModal } from "../modals/NotificationsModal";
import { QuickDocumentsModal } from "../modals/QuickDocumentsModal";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  patients: Users,
  cashier: Receipt,
  consultations: Stethoscope,
  appointments: CalendarDays,
  care: HeartHandshake,
  maternite: Baby,
  laboratory: FlaskConical,
  imaging: ScanLine,
  reports: BarChart3,
  admin: ShieldCheck,
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    currentSite,
    isOffline,
    lockSession,
    logout,
    appointments,
    labRequests,
    imagingRequests,
    invoices,
    cares,
    syncEvents,
    auditLogs,
  } = useApp();

  // Modals state for common utilities
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);

  // Dynamic modules authorized and ordered specifically for the current role
  const { coreModules, adminModules } = getAuthorizedModulesForRole(
    currentUser.role,
    currentUser
  );

  // Restore last consulted module for this user if permitted
  useEffect(() => {
    try {
      const storageKey = `fona_last_module_${currentUser.id}`;
      const savedModule = localStorage.getItem(storageKey);
      if (savedModule && canAccessModule(currentUser.role, savedModule, currentUser)) {
        if (savedModule !== activeTab && activeTab === "dashboard") {
          setActiveTab(savedModule);
        }
      }
    } catch {
      // Ignore localStorage restrictions
    }
  }, [currentUser.id, currentUser.role]);

  // Handle module selection with memory
  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    try {
      localStorage.setItem(`fona_last_module_${currentUser.id}`, id);
    } catch {
      // Ignore
    }
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  // Badge calculations based on real medical & operational state
  const getBadgeForModule = (module: NavModuleDefinition) => {
    switch (module.badgeType) {
      case "appointments": {
        const count = appointments.filter(
          (a) => a.status === "CONFIRME" || a.status === "PREVU" || a.status === "EN_ATTENTE"
        ).length;
        return count > 0 ? { text: String(count), color: "bg-blue-500/20 text-[#1261A0] dark:text-[#55D9FF] border-blue-400/30" } : null;
      }
      case "cashier": {
        const unpaidCount = invoices.filter((i) => i.status !== "PAYE").length;
        return unpaidCount > 0
          ? { text: String(unpaidCount), color: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-400/30" }
          : null;
      }
      case "laboratory": {
        const pendingLabs = labRequests.filter(
          (l) => l.status === "DEMANDE" || l.status === "EN_COURS"
        ).length;
        return pendingLabs > 0
          ? { text: String(pendingLabs), color: "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-400/30" }
          : null;
      }
      case "imaging": {
        const pendingImaging = imagingRequests.filter(
          (i) => i.status === "DEMANDE" || i.status === "REALISE"
        ).length;
        return pendingImaging > 0
          ? { text: String(pendingImaging), color: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-400/30" }
          : null;
      }
      case "care": {
        return cares.length > 0
          ? { text: String(cares.length), color: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-400/30" }
          : null;
      }
      default:
        return null;
    }
  };

  // Notification count
  const pendingSyncs = syncEvents.filter((e) => e.status === "queued").length;
  const notificationsCount = (isOffline ? 1 : 0) + (pendingSyncs > 0 ? 1 : 0) + Math.min(3, auditLogs.length);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#020b17]/80 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Liquid Glass 2.0 Sidebar (Îlot Flottant) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 lg:top-3 lg:bottom-3 lg:left-3 z-40 flex flex-col glass-floating-island bg-[var(--sidebar-mobile-bg)] lg:bg-[var(--sidebar-bg)] border-r lg:border border-[var(--border)] lg:shadow-2xl transition-all duration-300 ${
          isCollapsed ? "w-20 lg:w-20" : "w-68 lg:w-68"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Lueur spéculaire supérieure sur l'îlot */}
        <div className="hidden lg:block absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 dark:via-white/20 to-transparent pointer-events-none" />

        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-[var(--border)] shrink-0 relative">
          {!isCollapsed ? (
            <FonaLogo variant="compact" size="md" onClick={() => handleSelectTab("dashboard")} />
          ) : (
            <FonaLogo variant="icon" size="sm" onClick={() => handleSelectTab("dashboard")} />
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] items-center justify-center transition-colors cursor-pointer"
            title={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Active Clinic Site Ribbon */}
        <div className="px-3.5 pt-3 pb-1 shrink-0">
          <div
            className={`rounded-xl px-3 py-2 border transition-all ${
              isCollapsed ? "text-center px-1" : ""
            } ${
              isOffline
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300"
                : "bg-cyan-500/10 border-cyan-400/20 text-[#1261A0] dark:text-[#55D9FF]"
            }`}
          >
            {!isCollapsed ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                    Site actif
                  </div>
                  <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{currentSite.name}</div>
                </div>
              </div>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-current inline-block" title={currentSite.name} />
            )}
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
          {/* SECTION 1: MODULES PRINCIPAUX & MÉTIER (DYNAMIC BY ROLE PRIORITY) */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
                <span>Navigation Métier</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-[var(--border)] text-[#B48B2E] dark:text-[#D9B45B] font-semibold">
                  {ROLE_LABELS[currentUser.role].split(" ")[0]}
                </span>
              </div>
            )}

            {coreModules.map((item) => {
              const Icon = ICON_MAP[item.id] || LayoutDashboard;
              const isActive = activeTab === item.id;
              const displayLabel = item.roleLabels?.[currentUser.role] || item.label;
              const badge = getBadgeForModule(item);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  title={isCollapsed ? displayLabel : undefined}
                  className={`fona-btn-interactive w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-220 cursor-pointer select-none group relative ${
                    isCollapsed ? "justify-center py-3 px-0" : "px-3.5 py-2.5 gap-3"
                  } ${
                    isActive
                      ? "glass-nav-active font-bold shadow-md"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"
                  } ${item.highlight && !isActive ? "border border-cyan-500/20 text-cyan-600 dark:text-cyan-300" : ""}`}
                >
                  {/* Active Indicator Glow */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#55D9FF] rounded-r-full shadow-[0_0_10px_#55D9FF]" />
                  )}

                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                      isActive
                        ? "text-[#1261A0] dark:text-[#55D9FF] drop-shadow-[0_0_8px_rgba(85,217,255,0.7)]"
                        : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                    }`}
                  />

                  {!isCollapsed && <span className="truncate">{displayLabel}</span>}

                  {/* Dynamic Badge */}
                  {badge && !isCollapsed && (
                    <span
                      className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badge.color}`}
                    >
                      {badge.text}
                    </span>
                  )}
                  {badge && isCollapsed && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* SECTION 2: ADMINISTRATION SYSTÈME (ISOLATED AT BOTTOM, ONLY FOR ADMINS) */}
          {adminModules.length > 0 && (
            <div className="pt-2 border-t border-[var(--border)] space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
                  <span>Administration</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                    Système
                  </span>
                </div>
              )}

              {adminModules.map((item) => {
                const Icon = ICON_MAP[item.id] || ShieldCheck;
                const isActive = activeTab === item.id;
                const displayLabel = item.label;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    title={isCollapsed ? displayLabel : undefined}
                    className={`fona-btn-interactive w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-220 cursor-pointer select-none group relative ${
                      isCollapsed ? "justify-center py-3 px-0" : "px-3.5 py-2.5 gap-3"
                    } ${
                      isActive
                        ? "glass-gold-active text-[var(--text-primary)] font-bold shadow-md"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#D9B45B] rounded-r-full shadow-[0_0_10px_#D9B45B]" />
                    )}

                    <Icon
                      className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                        isActive
                          ? "text-[#D9B45B] drop-shadow-[0_0_6px_rgba(217,180,91,0.7)]"
                          : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                      }`}
                    />

                    {!isCollapsed && <span className="truncate">{displayLabel}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* SECTION 3: DOCUMENTS & NOTIFICATIONS (COMMON UTILITIES) */}
          <div className="pt-2 border-t border-[var(--border)] space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Outils & Documents
              </div>
            )}

            {/* Quick Documents Modal trigger */}
            <button
              onClick={() => setIsDocumentsModalOpen(true)}
              title={isCollapsed ? "Documents Cliniques" : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none group ${
                isCollapsed ? "justify-center py-2.5 px-0" : "px-3.5 py-2 gap-3"
              } text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]`}
            >
              <FileText className="w-4 h-4 shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
              {!isCollapsed && <span className="truncate">Documents Cliniques</span>}
            </button>

            {/* Notifications Modal trigger */}
            <button
              onClick={() => setIsNotificationsModalOpen(true)}
              title={isCollapsed ? "Centre de Notifications" : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none group relative ${
                isCollapsed ? "justify-center py-2.5 px-0" : "px-3.5 py-2 gap-3"
              } text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]`}
            >
              <Bell className="w-4 h-4 shrink-0 text-[var(--text-secondary)] group-hover:text-amber-500 transition-colors" />
              {!isCollapsed && <span className="truncate">Notifications</span>}

              {notificationsCount > 0 && !isCollapsed && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/30">
                  {notificationsCount}
                </span>
              )}
              {notificationsCount > 0 && isCollapsed && (
                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Common Modals */}
      <HelpGuideModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />
      <QuickDocumentsModal
        isOpen={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
      />
    </>
  );
};
