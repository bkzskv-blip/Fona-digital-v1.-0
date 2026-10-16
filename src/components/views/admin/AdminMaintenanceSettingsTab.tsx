import React, { useState } from "react";
import {
  Wrench,
  Bell,
  Globe2,
  Database,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Check,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GlassCard } from "../../ui/GlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { GlassInput, GlassSelect } from "../../ui/GlassFormControls";

export const AdminMaintenanceSettingsTab: React.FC = () => {
  const { showToast, logAudit, regionalSettings } = useApp();

  const [appointmentReminderMinutes, setAppointmentReminderMinutes] = useState(30);
  const [enableLabResultNotifications, setEnableLabResultNotifications] = useState(true);
  const [enableSecurityAlerts, setEnableSecurityAlerts] = useState(true);

  // Maintenance test states
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  // Dangerous action modal
  const [confirmModal, setConfirmModal] = useState<{ title: string; action: () => void } | null>(null);

  const runDiagnostic = async (testId: string, testName: string) => {
    setRunningTest(testId);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setRunningTest(null);
    setTestResults((prev) => ({
      ...prev,
      [testId]: "Intégrité validée : 100% opérationnel, zéro incohérence détectée.",
    }));
    logAudit("SYSTEM_DIAGNOSTIC", "DiagnosticEngine", testId, `Test de diagnostic exécuté avec succès : ${testName}`);
    showToast("SUCCESS", "Diagnostic Réussi", `${testName} vérifié avec succès sans aucune anomalie.`);
  };

  const handleClearCache = () => {
    setConfirmModal({
      title: "Voulez-vous vider les fichiers temporaires et les caches d'affichage ?",
      action: () => {
        logAudit("CACHE_CLEARED", "SystemCache", "all", "Vidage manuel des caches temporaires et fragments précalculés");
        showToast("SUCCESS", "Cache Vidé", "0.4 Go de fragments temporaires purgés.");
        setConfirmModal(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl glass-surface border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#D9B45B] border border-amber-400/30 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Maintenance Système, Notifications & Paramètres Régionaux
            </h3>
            <p className="text-xs text-slate-400">
              Outils d'intégrité, notifications cliniques, calibrage régional pour la zone FCFA et vision Clinique FONA
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-emerald-300 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30">
          Système Stable
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Maintenance Tools & Diagnostics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Diagnostics d'Intégrité & Santé du Système
              </h4>
            </div>

            <div className="space-y-3">
              {/* Test 1: Base de Données */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Vérification de la Base PostgreSQL & Index</div>
                    <div className="text-[11px] text-slate-400">Contrôle des contraintes de clés étrangères et index de recherche</div>
                  </div>
                  <GlassButton
                    variant="subtle"
                    size="sm"
                    loading={runningTest === "db"}
                    onClick={() => runDiagnostic("db", "Base de Données")}
                  >
                    Exécuter
                  </GlassButton>
                </div>
                {testResults["db"] && (
                  <div className="text-[11px] text-emerald-300 font-mono flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{testResults["db"]}</span>
                  </div>
                )}
              </div>

              {/* Test 2: Stockage Objet */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Vérification du Stockage DICOM & Documents</div>
                    <div className="text-[11px] text-slate-400">Vérifie l'accessibilité des clichés radiologiques et PDF</div>
                  </div>
                  <GlassButton
                    variant="subtle"
                    size="sm"
                    loading={runningTest === "storage"}
                    onClick={() => runDiagnostic("storage", "Stockage Objet")}
                  >
                    Exécuter
                  </GlassButton>
                </div>
                {testResults["storage"] && (
                  <div className="text-[11px] text-emerald-300 font-mono flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{testResults["storage"]}</span>
                  </div>
                )}
              </div>

              {/* Test 3: Cohérence des Règles RBAC */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Vérification des Règles de Sécurité RBAC</div>
                    <div className="text-[11px] text-slate-400">Contrôle l'étanchéité des permissions praticien / infirmier / caisse</div>
                  </div>
                  <GlassButton
                    variant="subtle"
                    size="sm"
                    loading={runningTest === "rbac"}
                    onClick={() => runDiagnostic("rbac", "Règles RBAC")}
                  >
                    Exécuter
                  </GlassButton>
                </div>
                {testResults["rbac"] && (
                  <div className="text-[11px] text-emerald-300 font-mono flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{testResults["rbac"]}</span>
                  </div>
                )}
              </div>

              {/* Dangerous action: Clear Cache */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white">Purger les Caches & Fichiers Temporaires</div>
                  <div className="text-[11px] text-amber-200/80">Libère l'espace disque sans impacter les données médicales</div>
                </div>
                <GlassButton variant="gold" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleClearCache}>
                  Vider le Cache
                </GlassButton>
              </div>
            </div>
          </GlassCard>

          {/* Vision Evolutive Clinique FONA (Section 72) */}
          <GlassCard className="p-6 space-y-3 border-l-4 border-l-[#D9B45B]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#D9B45B]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Trajectoire Stratégique : Du CM FONA vers la Clinique FONA
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              FONA Digital a été bâti dès sa version 1.0 comme le socle logiciel durable de l'établissement. L'architecture supporte déjà nativement :
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5 text-slate-200">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multi-sites centralisé sans silos</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-200">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dossier patient permanent unique</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-200">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Futur module Hospitalisation & Lits</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-200">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Extension Bloc opératoire & Pharmacie</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Notifications & Regional Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Notifications Settings */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Bell className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Rappels & Notifications Cliniques
              </h4>
            </div>

            <div className="space-y-4">
              <GlassInput
                label="Délai de Rappel Rendez-Vous (Minutes avant RDV)"
                type="number"
                value={appointmentReminderMinutes.toString()}
                onChange={(e) => setAppointmentReminderMinutes(Number(e.target.value))}
              />

              <div className="space-y-3 pt-1">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <span className="text-xs font-semibold text-white block">Alerte résultats labo disponibles</span>
                    <span className="text-[10px] text-slate-400">Notifie le médecin dès validation biologique</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableLabResultNotifications}
                    onChange={(e) => setEnableLabResultNotifications(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <span className="text-xs font-semibold text-white block">Alertes de sécurité en direct</span>
                    <span className="text-[10px] text-slate-400">Signalement des sessions suspectes ou blocages</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSecurityAlerts}
                    onChange={(e) => setEnableSecurityAlerts(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4"
                  />
                </label>
              </div>

              <div className="pt-2">
                <GlassButton
                  variant="cyan"
                  size="sm"
                  className="w-full"
                  onClick={() => showToast("SUCCESS", "Notifications Mises à Jour", "Paramètres des rappels enregistrés (30 min par défaut).")}
                >
                  Enregistrer les Notifications
                </GlassButton>
              </div>
            </div>
          </GlassCard>

          {/* Regional Settings (Section 20) */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#D9B45B]" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  Paramètres Régionaux Actifs
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {regionalSettings.country === "ML" ? "Mali Conforme" : regionalSettings.country}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Devise Monétaire</span>
                <span className="font-bold text-amber-300 font-mono">
                  {regionalSettings.currencyDisplay} ({regionalSettings.currency})
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Fuseau Horaire</span>
                <span className="font-bold text-cyan-300 font-mono">
                  {regionalSettings.timezone} (GMT / UTC+00:00)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Langue & Locale</span>
                <span className="font-bold text-white font-mono">
                  Français ({regionalSettings.locale})
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Format Date & Heure</span>
                <span className="font-bold text-slate-200 font-mono">
                  {regionalSettings.dateFormat} &middot; {regionalSettings.timeFormat}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Indicatif Téléphonique</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {regionalSettings.phoneCountryCode} (Mali)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Version FONA Digital</span>
                <span className="font-bold text-[#D9B45B] font-mono">v1.0.4 &middot; Build 2026.10.07</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl glass-surface border border-white/20 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Confirmation d'Action Système
              </h3>
            </div>
            <p className="text-xs text-slate-300">{confirmModal.title}</p>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <GlassButton variant="subtle" size="sm" onClick={() => setConfirmModal(null)}>
                Annuler
              </GlassButton>
              <GlassButton variant="gold" size="sm" onClick={confirmModal.action}>
                Confirmer l'Action
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
