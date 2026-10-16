import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Radio,
  Laptop,
  Smartphone,
  LogOut,
  AlertTriangle,
  KeyRound,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GlassCard } from "../../ui/GlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { GlassInput } from "../../ui/GlassFormControls";
import { ROLE_LABELS } from "../../../services/rbacService";

export const AdminSecuritySessionsTab: React.FC = () => {
  const { sessions, terminateSession, securitySettings, updateSecuritySettings, showToast, formatTime } = useApp();

  const [sessionTimeout, setSessionTimeout] = useState(securitySettings.sessionTimeoutMinutes);
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(securitySettings.maxFailedAttempts);
  const [passwordMinLength, setPasswordMinLength] = useState(securitySettings.passwordMinLength);
  const [twoFactorAuth, setTwoFactorAuth] = useState(securitySettings.twoFactorAuthEnabled);
  const [requireSpecialChar, setRequireSpecialChar] = useState(securitySettings.requireSpecialChar);

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    updateSecuritySettings({
      sessionTimeoutMinutes: Number(sessionTimeout),
      maxFailedAttempts: Number(maxFailedAttempts),
      passwordMinLength: Number(passwordMinLength),
      twoFactorAuthEnabled: twoFactorAuth,
      requireSpecialChar,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl glass-surface border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-[#4F7DF3] border border-blue-400/30 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Sécurité, Sessions Actives & Contrôle des Accès
            </h3>
            <p className="text-xs text-slate-400">
              Surveillance en temps réel des terminaux connectés et règles d'authentification clinique
            </p>
          </div>
        </div>

        <div className="text-xs text-cyan-300 font-mono px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{sessions.length} sessions actives</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Sessions List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  Postes Connectés en Temps Réel
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">Révocation à distance</span>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => {
                const isMobile = sess.device.toLowerCase().includes("android") || sess.device.toLowerCase().includes("ipad");

                return (
                  <div
                    key={sess.id}
                    className={`p-4 rounded-xl border transition-all ${
                      sess.isCurrent
                        ? "bg-cyan-950/30 border-cyan-400/40"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                          {isMobile ? <Smartphone className="w-4 h-4 text-cyan-400" /> : <Laptop className="w-4 h-4 text-[#4F7DF3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{sess.userName}</span>
                            <span className="text-[10px] text-[#D9B45B] font-semibold">
                              ({ROLE_LABELS[sess.userRole]})
                            </span>
                            {sess.isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                                Session Actuelle
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-300 mt-0.5">{sess.device}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="font-mono">{sess.ipAddress}</span>
                            <span>&middot;</span>
                            <span>{sess.siteName}</span>
                          </div>
                        </div>
                      </div>

                      {!sess.isCurrent && (
                        <button
                          onClick={() => terminateSession(sess.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Déconnecter</span>
                        </button>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Connexion : {formatTime(sess.loginAt)}</span>
                      <span className="text-emerald-400 font-medium">Activité : {sess.lastActivityAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Security Parameters Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#D9B45B]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Politique de Sécurité FONA
              </h4>
            </div>

            <form onSubmit={handleSaveSecurity} className="space-y-4">
              <GlassInput
                label="Délai d'Inactivité de Session (Minutes)"
                type="number"
                value={sessionTimeout.toString()}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
              />

              <GlassInput
                label="Tentatives Échouées avant Verrouillage"
                type="number"
                value={maxFailedAttempts.toString()}
                onChange={(e) => setMaxFailedAttempts(Number(e.target.value))}
              />

              <GlassInput
                label="Longueur Minimale du Mot de Passe"
                type="number"
                value={passwordMinLength.toString()}
                onChange={(e) => setPasswordMinLength(Number(e.target.value))}
              />

              <div className="pt-2 space-y-3">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <span className="text-xs font-semibold text-white block">Exiger un caractère spécial</span>
                    <span className="text-[10px] text-slate-400">Au moins un symbole (!@#$%...)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireSpecialChar}
                    onChange={(e) => setRequireSpecialChar(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <span className="text-xs font-semibold text-white block">Double Authentification (2FA)</span>
                    <span className="text-[10px] text-slate-400">Code SMS ou App Authenticator pour praticiens</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end">
                <GlassButton type="submit" variant="gold" size="sm" icon={<Save className="w-4 h-4" />}>
                  Appliquer la Politique
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
