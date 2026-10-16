import React, { useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight, LogOut, ShieldAlert, KeyRound, AlertCircle } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GlassAvatar } from "../../ui/GlassAvatar";
import { FonaLogo } from "../../ui/FonaLogo";
import { ROLE_LABELS } from "../../../services/rbacService";

export const LockScreenView: React.FC = () => {
  const { currentUser, unlockSession, logout, resolvedTheme, brandSettings } = useApp();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError(true);
      return;
    }
    const success = unlockSession(password);
    if (!success) {
      setError(true);
    }
  };

  const isLight = resolvedTheme === "light";

  return (
    <div className="min-h-screen relative flex flex-col justify-between items-center p-4 sm:p-8 bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-250 select-none">
      {/* Background Liquid Glass Ambient Glows */}
      <div
        className={`fixed top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none -z-10 transition-opacity duration-300 ${
          isLight ? "bg-blue-400/12" : "bg-blue-600/12"
        }`}
      />
      <div
        className={`fixed bottom-1/4 right-1/4 w-[550px] h-[550px] rounded-full blur-[150px] pointer-events-none -z-10 transition-opacity duration-300 ${
          isLight ? "bg-cyan-400/15" : "bg-cyan-500/10"
        }`}
      />

      {/* Top Clinic Branding */}
      <div className="w-full max-w-5xl flex justify-between items-center py-2 z-10">
        <FonaLogo variant="compact" size="sm" theme="auto" />
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Poste Médical Sécurisé</span>
        </div>
      </div>

      {/* Center Lock Card */}
      <div className="w-full max-w-sm rounded-3xl p-6 sm:p-8 bg-[var(--surface-card)] backdrop-blur-2xl border border-[var(--border)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] text-center space-y-6 z-10 animate-in zoom-in-95">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <GlassAvatar role={currentUser.role} name={currentUser.fullName} size="xl" />
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 text-white shadow-md border-2 border-[var(--surface-card)]">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">
              {currentUser.fullName}
            </h2>
            <div className="text-xs font-semibold text-[#B48B2E] dark:text-[#D9B45B] mt-0.5">
              {ROLE_LABELS[currentUser.role]}
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              {currentUser.department}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Mot de passe incorrect</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Mot de passe ou PIN..."
              autoFocus
              className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--glass-input-border)] text-sm text-[var(--glass-input-text)] placeholder-[var(--glass-input-placeholder)] focus:outline-none focus:border-cyan-400 font-mono tracking-wider"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#1261A0] to-[#0284C7] dark:from-[#1261A0] dark:to-cyan-600 text-white flex items-center justify-center gap-2 hover:opacity-95 shadow-md cursor-pointer transition-all active:scale-[0.99]"
          >
            <span>Déverrouiller le poste</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <span className="text-[10px] text-[var(--text-muted)]">Session sécurisée</span>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Changer de compte</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-[var(--text-muted)] z-10 py-2">
        <p>{brandSettings.organizationName} • {brandSettings.slogan}</p>
      </div>
    </div>
  );
};
