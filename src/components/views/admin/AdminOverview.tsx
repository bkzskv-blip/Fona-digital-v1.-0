import React from "react";
import {
  ShieldCheck,
  Users,
  Key,
  Layers,
  Sparkles,
  Building2,
  Stethoscope,
  Coins,
  FileText,
  Lock,
  Radio,
  History,
  HardDrive,
  Database,
  RefreshCw,
  Wrench,
  Globe2,
  Server,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { GlassCard } from "../../ui/GlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { useApp } from "../../../context/AppContext";

interface AdminOverviewProps {
  onNavigateTab: (tabId: string, category?: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab }) => {
  const { users, services, tariffs, sessions, backups, auditLogs } = useApp();

  const activeUsersCount = users.filter((u) => u.status === "ACTIF" || !u.status).length;
  const activeServicesCount = services.filter((s) => s.status === "ACTIF").length;
  const activeTariffsCount = tariffs.filter((t) => t.status === "ACTIF").length;

  return (
    <div className="space-y-6">
      {/* KPI Header Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl glass-surface border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Utilisateurs</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white">{activeUsersCount}</span>
            <span className="text-[10px] text-slate-400">/ {users.length} actifs</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-surface border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Services</span>
            <Stethoscope className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white">{activeServicesCount}</span>
            <span className="text-[10px] text-emerald-400">opérationnels</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-surface border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Actes / Tarifs</span>
            <Coins className="w-4 h-4 text-[#D9B45B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white">{activeTariffsCount}</span>
            <span className="text-[10px] text-amber-300">FCFA</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-surface border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Sessions</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white">{sessions.length}</span>
            <span className="text-[10px] text-purple-300">en ligne</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-surface border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Sauvegarde</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-emerald-400">RPO &le; 1h</span>
            <span className="text-[10px] text-slate-400">Valide</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-surface border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Audit Log</span>
            <History className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white">{auditLogs.length}</span>
            <span className="text-[10px] text-blue-300">actes tracés</span>
          </div>
        </div>
      </div>

      {/* 3 Tier Architecture Presentation (Section 22 & Règle d'or de gouvernance) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Centres de Gouvernance FONA Digital — Répartition Tri-Niveau
            </h3>
            <p className="text-xs text-slate-400">
              Séparation stricte entre administration quotidienne, système technique et paramètres critiques
            </p>
          </div>
          <span className="hidden sm:inline-block text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
            RBAC & Gouvernance Médicale
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* NIVEAU 1: OPÉRATIONNEL */}
          <GlassCard className="p-5 flex flex-col justify-between space-y-4 border-l-4 border-l-cyan-400">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Niveau 1
                </span>
                <span className="text-xs font-medium text-slate-400">Usage Quotidien</span>
              </div>
              <h4 className="text-base font-bold text-white mt-2">
                Administration Opérationnelle
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Gestion des comptes soignants, ouverture des spécialités médicales, catalogue des prix et mise en page des documents officiels.
              </p>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => onNavigateTab("SETTINGS", "usersRoles")}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-400/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-medium text-slate-200">Utilisateurs & Profils ({users.length})</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => onNavigateTab("CABINET_SERVICES")}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-400/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-medium text-slate-200">Services Cliniques & Tarifs ({services.length})</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => onNavigateTab("SETTINGS", "documentsNumbering")}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-400/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-medium text-slate-200">Documents, En-Têtes & Impressions</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

            <GlassButton
              variant="subtle"
              size="sm"
              className="w-full mt-2"
              onClick={() => onNavigateTab("SETTINGS", "usersRoles")}
            >
              Gérer les équipes & actes
            </GlassButton>
          </GlassCard>

          {/* NIVEAU 2: SYSTÈME */}
          <GlassCard className="p-5 flex flex-col justify-between space-y-4 border-l-4 border-l-[#4F7DF3]">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Niveau 2
                </span>
                <span className="text-xs font-medium text-slate-400">Infrastructure</span>
              </div>
              <h4 className="text-base font-bold text-white mt-2">
                Administration Système
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Contrôle de sécurité et des sessions en ligne, surveillance du stockage des radios/bilans, traçabilité et synchronisation réseau.
              </p>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => onNavigateTab("SETTINGS", "securitySessions")}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-blue-400/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-slate-200">Sécurité & Sessions Actives ({sessions.length})</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => onNavigateTab("AUDIT")}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-blue-400/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <History className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-slate-200">Journal d'Audit Inaltérable</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => onNavigateTab("SETTINGS", "backupsMaintenance")}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-blue-400/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-slate-200">Sauvegardes & Stockage Sécurisé FONA</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

            <GlassButton
              variant="subtle"
              size="sm"
              className="w-full mt-2"
              onClick={() => onNavigateTab("SETTINGS", "securitySessions")}
            >
              Surveiller le système
            </GlassButton>
          </GlassCard>

          {/* NIVEAU 3: CRITIQUE */}
          <GlassCard className="p-5 flex flex-col justify-between space-y-4 border-l-4 border-l-[#D9B45B]">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-[#D9B45B] border border-amber-400/30">
                  Niveau 3
                </span>
                <span className="text-xs font-medium text-amber-200/70">Direction & Admin Principal</span>
              </div>
              <h4 className="text-base font-bold text-white mt-2">
                Administration Critique & Marque
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Matrice granulaire des permissions RBAC, sauvegardes immuables, identité de marque FONA et diagnostic système.
              </p>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => onNavigateTab("SETTINGS", "usersRoles")}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-400/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-[#D9B45B]" />
                    <span className="text-xs font-medium text-slate-200">Matrice des Habilitations & Rôles</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D9B45B] group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => onNavigateTab("SETTINGS", "generalBrand")}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-400/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#D9B45B]" />
                    <span className="text-xs font-medium text-slate-200">Identité Visuelle & Logos FONA</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D9B45B] group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => onNavigateTab("SETTINGS", "regional")}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-400/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe2 className="w-4 h-4 text-[#55D9FF]" />
                    <span className="text-xs font-medium text-slate-200">Paramètres Régionaux (Mali · FCFA · Bamako)</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => onNavigateTab("SETTINGS", "technicalConfig")}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-400/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4 text-[#D9B45B]" />
                    <span className="text-xs font-medium text-slate-200">Maintenance & Diagnostics Système</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D9B45B] group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

            <GlassButton
              variant="gold"
              size="sm"
              className="w-full mt-2"
              onClick={() => onNavigateTab("SETTINGS", "usersRoles")}
            >
              Accéder aux contrôles stricts
            </GlassButton>
          </GlassCard>
        </div>
      </div>

      {/* Quick Security & Integrity Status */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="font-bold text-white">Intégrité Système : Conforme aux Exigences Médicales</span>
            <p className="text-emerald-200/80 text-[11px] mt-0.5">
              Règle de non-suppression active (désactivation de compte), non-rétroactivité des tarifs appliquée, et journal d'audit protégé contre la modification.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-emerald-300 shrink-0">
          Version 1.0.4 &middot; Build 2026.09.27
        </span>
      </div>
    </div>
  );
};
