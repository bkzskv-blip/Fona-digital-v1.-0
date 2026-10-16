import React, { useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Sliders,
  Building2,
  History,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { AdminOverview } from "./admin/AdminOverview";
import { AdminCabinetServicesTab } from "./admin/AdminCabinetServicesTab";
import { AdminAuditTab } from "./admin/AdminAuditTab";
import { AdminSettingsHub } from "./admin/AdminSettingsHub";
import { SettingsCategoryKey } from "../../services/settingsService";

export type AdminTabId = "OVERVIEW" | "SETTINGS" | "CABINET_SERVICES" | "AUDIT";

export const AdministrationView: React.FC = () => {
  const { auditLogs } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTabId>("OVERVIEW");
  const [selectedSettingsCategory, setSelectedSettingsCategory] = useState<SettingsCategoryKey>("generalBrand");

  const handleNavigateFromOverview = (tabId: string, category?: string) => {
    if (tabId === "SETTINGS") {
      if (category) {
        setSelectedSettingsCategory(category as SettingsCategoryKey);
      }
      setActiveTab("SETTINGS");
    } else if (tabId === "CABINET_SERVICES") {
      setActiveTab("CABINET_SERVICES");
    } else if (tabId === "AUDIT") {
      setActiveTab("AUDIT");
    } else {
      setActiveTab("OVERVIEW");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Clean Main Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl glass-surface border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-[#D9B45B] border border-amber-400/30 flex items-center justify-center shrink-0 shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Administration
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D9B45B]/20 text-[#D9B45B] border border-amber-400/30">
                Direction FONA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gouvernance, gestion des équipes soignantes et centre unique de configuration
            </p>
          </div>
        </div>

        {/* Tab Navigator (No clutter, 4 primary streamlined tabs) */}
        <div className="flex items-center gap-1.5 bg-[#051426]/90 p-1.5 rounded-xl border border-white/10 text-xs flex-wrap">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "OVERVIEW"
                ? "bg-[#4F7DF3] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Vue d'ensemble</span>
          </button>

          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "SETTINGS"
                ? "bg-gradient-to-r from-amber-500/30 to-cyan-500/30 text-white border border-cyan-400/50 shadow-[0_0_15px_rgba(85,217,255,0.2)]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#55D9FF]" />
            <span>Paramètres</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[#55D9FF] border border-cyan-400/30 font-bold">
              Centre Unique
            </span>
          </button>

          <button
            onClick={() => setActiveTab("CABINET_SERVICES")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "CABINET_SERVICES"
                ? "bg-[#4F7DF3] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Services & Tarifs</span>
          </button>

          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "AUDIT"
                ? "bg-[#4F7DF3] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Dynamic Tab Body */}
      <div className="animate-in fade-in duration-200">
        {activeTab === "OVERVIEW" && (
          <AdminOverview onNavigateTab={handleNavigateFromOverview} />
        )}
        {activeTab === "SETTINGS" && (
          <AdminSettingsHub initialCategory={selectedSettingsCategory} />
        )}
        {activeTab === "CABINET_SERVICES" && <AdminCabinetServicesTab />}
        {activeTab === "AUDIT" && <AdminAuditTab />}
      </div>
    </div>
  );
};
