import React from "react";
import { X, Bell, CheckCircle2, AlertTriangle, Info, Clock, ShieldCheck, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs, isOffline, syncEvents, currentSite, formatTime } = useApp();

  if (!isOpen) return null;

  // Derive notifications from actual system events, audit logs, and sync events
  const pendingSyncs = syncEvents.filter((e) => e.status === "queued").length;

  const notifications = [
    ...(isOffline
      ? [
          {
            id: "notif-offline",
            type: "WARNING" as const,
            title: "Mode Hors-Connexion Actif",
            message: "Vos opérations cliniques sont enregistrées localement et seront synchronisées dès reconnexion.",
            time: "En cours",
          },
        ]
      : []),
    ...(pendingSyncs > 0
      ? [
          {
            id: "notif-sync",
            type: "INFO" as const,
            title: "Synchronisation Réseau",
            message: `${pendingSyncs} opération(s) en attente de synchronisation inter-sites.`,
            time: "Récemment",
          },
        ]
      : []),
    ...auditLogs.slice(0, 10).map((log) => ({
      id: log.id,
      type: log.action.includes("FAILED") || log.action.includes("REJECT")
        ? ("WARNING" as const)
        : log.action.includes("LOGIN") || log.action.includes("CREATE")
        ? ("INFO" as const)
        : ("SUCCESS" as const),
      title: log.action.replace(/_/g, " "),
      message: `${log.details || "Opération tracée dans le journal d'audit"} • Effectué par ${log.userName} (${log.userRole})`,
      time: formatTime(log.timestamp),
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#020b17]/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[var(--surface-elevated)] border border-[var(--border)] rounded-3xl shadow-2xl z-10 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">Centre de Notifications</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                  {notifications.length}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Alertes médicales, synchronisations et traçabilité</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-secondary)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">Aucune notification en attente</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Tous les services et synchronisations sont à jour.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border)] transition-colors flex items-start gap-3"
              >
                <div className="shrink-0 mt-0.5">
                  {item.type === "WARNING" ? (
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                  ) : item.type === "SUCCESS" ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                  ) : (
                    <Info className="w-4.5 h-4.5 text-[#55D9FF]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{item.title}</span>
                    <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--surface-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Site actif : {currentSite.name}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
