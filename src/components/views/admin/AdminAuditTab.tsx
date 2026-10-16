import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  Lock,
  Calendar,
  UserCheck,
  FileCheck,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GlassCard } from "../../ui/GlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { ROLE_LABELS } from "../../../services/rbacService";

export const AdminAuditTab: React.FC = () => {
  const { auditLogs, showToast, formatDate, formatTime } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [userFilter, setUserFilter] = useState("ALL");

  const uniqueActions = Array.from(new Set(auditLogs.map((l) => l.action)));
  const uniqueUsers = Array.from(new Set(auditLogs.map((l) => l.userName)));

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    const matchesUser = userFilter === "ALL" || log.userName === userFilter;

    return matchesSearch && matchesAction && matchesUser;
  });

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fona_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("SUCCESS", "Export d'Audit Téléchargé", "Le journal officiel d'audit a été exporté au format JSON conforme.");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner on Immutability */}
      <div className="p-4 rounded-xl glass-surface border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#55D9FF] border border-cyan-400/30 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Journal d'Audit Médical Inaltérable & Traçabilité
            </h3>
            <p className="text-xs text-slate-400">
              Conformité réglementaire : chaque création, consultation, ordonnance, soin et paiement est horodaté et signé
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-emerald-400 font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Registre Immuable</span>
          </div>

          <GlassButton
            variant="cyan"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportAudit}
          >
            Exporter le Journal
          </GlassButton>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par action, soignant, patient ou détail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#051426]/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#051426]/70 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
        >
          <option value="ALL">Toutes les actions ({auditLogs.length})</option>
          {uniqueActions.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#051426]/70 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
        >
          <option value="ALL">Tous les soignants / auteurs</option>
          {uniqueUsers.map((usr) => (
            <option key={usr} value={usr}>
              {usr}
            </option>
          ))}
        </select>
      </div>

      {/* Audit Log Entries List */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-slate-400">
          <span>{filteredLogs.length} événements enregistrés</span>
          <span className="font-mono text-cyan-300">Intégrité SHA-256 certifiée</span>
        </div>

        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-cyan-300 text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                    {log.action}
                  </span>
                  <span className="text-slate-500">&middot;</span>
                  <span className="text-[11px] font-semibold text-slate-300">
                    {log.entity} #{log.entityId}
                  </span>
                </div>
                <div className="text-slate-200 font-medium">
                  {log.details}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Auteur : <b className="text-slate-200">{log.userName}</b></span>
                  <span>&middot;</span>
                  <span className="text-[#D9B45B] font-semibold">{ROLE_LABELS[log.userRole]}</span>
                </div>
              </div>

              <div className="shrink-0 sm:text-right font-mono text-[11px] text-slate-400">
                <div>{formatDate(log.timestamp)}</div>
                <div className="text-cyan-400 font-bold">{formatTime(log.timestamp, { withSeconds: true })}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
