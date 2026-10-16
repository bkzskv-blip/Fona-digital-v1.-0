/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { GlassToastContainer } from "./components/ui/GlassToastContainer";
import { GlobalSearchModal } from "./components/modals/GlobalSearchModal";
import { PrintDocumentModal } from "./components/modals/PrintDocumentModal";
import { AppSplashScreen } from "./components/ui/AppSplashScreen";

// Views
import { DashboardView } from "./components/views/DashboardView";
import { PatientsView } from "./components/views/PatientsView";
import { ConsultationsView } from "./components/views/ConsultationsView";
import { CareView } from "./components/views/CareView";
import { AppointmentsView } from "./components/views/AppointmentsView";
import { MaternityView } from "./components/views/MaternityView";
import { LaboratoryView } from "./components/views/LaboratoryView";
import { ImagingView } from "./components/views/ImagingView";
import { CashierView } from "./components/views/CashierView";
import { ReportsView } from "./components/views/ReportsView";
import { AdministrationView } from "./components/views/AdministrationView";
import { LoginView } from "./components/views/auth/LoginView";
import { LockScreenView } from "./components/views/auth/LockScreenView";
import { canAccessModule, getDefaultTabForRole, ROLE_LABELS } from "./services/rbacService";
import { ShieldAlert } from "lucide-react";

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, resolvedTheme, isAuthenticated, isLocked, showAppLaunchIntro } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    // Strict RBAC Verification at View Rendering Level
    if (!canAccessModule(currentUser.role, activeTab, currentUser)) {
      return (
        <div className="py-16 px-4 text-center max-w-lg mx-auto">
          <div className="glass-surface p-8 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Accès Restreint par Permissions RBAC</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Votre profil fonctionnel <span className="font-semibold text-[#D9B45B]">« {ROLE_LABELS[currentUser.role]} »</span> ne possède pas les habilitations requises pour accéder à ce module.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab(getDefaultTabForRole(currentUser.role))}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1261A0] text-white hover:bg-blue-600 shadow-md transition-all cursor-pointer"
              >
                Retourner à mon espace autorisé
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "patients":
        return <PatientsView />;
      case "consultations":
        return <ConsultationsView />;
      case "care":
        return <CareView />;
      case "appointments":
        return <AppointmentsView />;
      case "maternite":
        return <MaternityView />;
      case "laboratory":
        return <LaboratoryView />;
      case "imaging":
        return <ImagingView />;
      case "cashier":
        return <CashierView />;
      case "reports":
        return <ReportsView />;
      case "admin":
        return <AdministrationView />;
      default:
        return <DashboardView />;
    }
  };

  const isLight = resolvedTheme === "light";

  // Target Destination View (Login, Lock Screen, or Authenticated Workspace)
  const renderMainView = () => {
    if (!isAuthenticated) {
      return <LoginView />;
    }

    if (isLocked) {
      return <LockScreenView />;
    }

    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex overflow-x-hidden transition-colors duration-220 relative">
        {/* ========================================================
            LUMIÈRE AMBIANTE FONA LIQUID GLASS 2.0 (NIVEAU 0)
            Halos extrêmement doux à faible opacité (Sky, Teal, Blue, Gold)
            ======================================================== */}
        {/* 1. Lumière Sky (#55B9E8) — Haut / Zénith */}
        <div
          className={`fixed -top-24 left-1/3 -translate-x-1/2 w-[720px] h-[420px] rounded-full blur-[160px] pointer-events-none -z-10 transition-opacity duration-300 ${
            isLight ? "bg-[#55B9E8]/10" : "bg-[#55B9E8]/08"
          }`}
          aria-hidden="true"
        />

        {/* 2. Halo Teal (#20B8A6) — Centre Médical Flottant */}
        <div
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[180px] pointer-events-none -z-10 transition-opacity duration-300 ${
            isLight ? "bg-[#20B8A6]/08" : "bg-[#20B8A6]/06"
          }`}
          aria-hidden="true"
        />

        {/* 3. Lumière Bleue (#1261A0) — Base / Nadir */}
        <div
          className={`fixed -bottom-28 right-1/4 w-[680px] h-[480px] rounded-full blur-[170px] pointer-events-none -z-10 transition-opacity duration-300 ${
            isLight ? "bg-[#1261A0]/10" : "bg-[#1261A0]/12"
          }`}
          aria-hidden="true"
        />

        {/* 4. Touche FONA Gold (#D9B45B) — Élégance institutionnelle discrète */}
        <div
          className={`fixed top-1/3 -right-20 w-[420px] h-[420px] rounded-full blur-[150px] pointer-events-none -z-10 transition-opacity duration-300 ${
            isLight ? "bg-[#D9B45B]/08" : "bg-[#D9B45B]/05"
          }`}
          aria-hidden="true"
        />

        {/* Navigation Îlot Flottant Liquid Glass */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* Contenu Principal avec déport harmonieux de l'îlot flottant */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? "lg:pl-24" : "lg:pl-72"
          }`}
        >
          {/* Header Bar */}
          <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

          {/* Dynamic Page Content avec transition fluide FONA Liquid Glass */}
          <main
            key={activeTab}
            className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fona-scale-in"
          >
            {renderActiveView()}
          </main>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Target Content: rendered beneath and revealed organically via morphic dissolution */}
      <div className="w-full min-h-screen">
        {renderMainView()}
      </div>

      {/* Global Modals & Floating Overlays */}
      <AppSplashScreen />
      <GlassToastContainer />
      <GlobalSearchModal />
      <PrintDocumentModal />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
