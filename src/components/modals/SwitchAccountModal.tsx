import React, { useState } from "react";
import {
  X,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Shield,
  ArrowRight,
  AlertCircle,
  Activity,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassAvatar } from "../ui/GlassAvatar";
import { ROLE_LABELS, canAccessModule, getDefaultTabForRole } from "../../services/rbacService";
import { User } from "../../types";

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    activeTab,
    setActiveTab,
    logAudit,
    showToast,
    resolvedTheme,
  } = useApp();

  // Steps: 1 = select target user, 2 = password challenge / re-auth, 3 = loading context & applying permissions
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const isLight = resolvedTheme === "light";

  const handleSelectUser = (user: User) => {
    if (user.id === currentUser.id) {
      onClose();
      return;
    }
    if (user.status === "INACTIF" || user.status === "SUSPENDU") {
      setErrorMsg(`Le compte ${user.fullName} est désactivé.`);
      return;
    }
    setSelectedUser(user);
    setPasswordInput("");
    setErrorMsg("");
    setStep(2);
  };

  const handleReauthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg("");

    if (!passwordInput.trim()) {
      setErrorMsg("Veuillez saisir le mot de passe de ce compte.");
      return;
    }

    setIsVerifying(true);

    // Verify password against user account credentials or default system standard
    const validPassword = selectedUser.password || "fona2026";
    const isCorrect = passwordInput === validPassword || passwordInput === "fona2026";

    if (!isCorrect) {
      setIsVerifying(false);
      setErrorMsg("Mot de passe incorrect pour ce professionnel de santé.");
      return;
    }

    // Step 3: Transition and Context Loading
    setStep(3);

    setTimeout(() => {
      // Apply new user context and RBAC permissions
      const target = selectedUser;
      setCurrentUser(target);

      // Navigate to authorized dashboard for the target user's role
      if (!canAccessModule(target.role, activeTab, target)) {
        setActiveTab(getDefaultTabForRole(target.role));
      }

      logAudit(
        "USER_SWITCHED",
        "User",
        target.id,
        `Changement de compte authentifié : ${currentUser.fullName} ➔ ${target.fullName} (${target.role})`
      );

      showToast(
        "SUCCESS",
        "Session Activée",
        `Vous êtes connecté en tant que ${target.fullName} (${ROLE_LABELS[target.role]}).`
      );

      setIsVerifying(false);
      setStep(1);
      setSelectedUser(null);
      setPasswordInput("");
      onClose();
    }, 650);
  };

  const handleResetModal = () => {
    setStep(1);
    setSelectedUser(null);
    setPasswordInput("");
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#020b17]/80 backdrop-blur-md"
        onClick={step !== 3 ? handleResetModal : undefined}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-[var(--border)] shadow-2xl z-10 transition-all overflow-hidden ${
          isLight
            ? "bg-white/95 text-[#071A33] shadow-[0_20px_50px_rgba(7,26,51,0.12)]"
            : "bg-[#071A33]/95 text-white shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
        }`}
      >
        {/* Specular border accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

        {/* STEP 1: SELECT ACCOUNT */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1261A0]/15 text-[#1261A0] dark:text-[#55D9FF] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Changer de Compte
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Sélectionnez le compte professionnel cible
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetModal}
                className="w-8 h-8 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Active User Banner */}
            <div className="p-3 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <GlassAvatar role={currentUser.role} name={currentUser.fullName} size="sm" />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate text-[var(--text-primary)]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-[#B48B2E] dark:text-[#D9B45B] font-semibold truncate">
                    {ROLE_LABELS[currentUser.role]} &middot; Session active
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                En cours
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* User List */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    disabled={isCurrent}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isCurrent
                        ? "opacity-50 cursor-not-allowed bg-[var(--surface-subtle)] border-transparent"
                        : "hover:bg-[var(--surface-subtle)] border-[var(--border)] hover:border-cyan-400/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GlassAvatar role={u.role} name={u.fullName} size="sm" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {u.fullName}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] truncate">
                          {ROLE_LABELS[u.role]}
                          {u.department ? ` · ${u.department}` : ""}
                        </div>
                      </div>
                    </div>

                    {!isCurrent && (
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: RE-AUTHENTICATION / PASSWORD CHALLENGE */}
        {step === 2 && selectedUser && (
          <form onSubmit={handleReauthSubmit} className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>

              <button
                type="button"
                onClick={handleResetModal}
                className="w-8 h-8 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Account Badge */}
            <div className="text-center space-y-2 py-2">
              <div className="inline-block relative">
                <GlassAvatar role={selectedUser.role} name={selectedUser.fullName} size="lg" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--text-primary)]">
                  {selectedUser.fullName}
                </h4>
                <p className="text-xs text-[#B48B2E] dark:text-[#D9B45B] font-semibold">
                  {ROLE_LABELS[selectedUser.role]}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Réauthentification médicale requise
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] block">
                Mot de passe de {selectedUser.fullName.split(" ")[0]}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Saisissez votre mot de passe..."
                  autoFocus
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] focus:border-cyan-400 focus:outline-none text-xs text-[var(--text-primary)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">
                Mot de passe de session par défaut : <span className="font-mono font-semibold">fona2026</span>
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="flex-1 py-2.5 rounded-xl bg-[#1261A0] hover:bg-blue-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <span>Ouvrir la session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CONTEXT LOADING & PERMISSION APPLICATION */}
        {step === 3 && selectedUser && (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
              <Activity className="w-7 h-7 animate-spin" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                Initialisation de la session
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Chargement des habilitations pour <strong className="text-[var(--text-primary)]">{selectedUser.fullName}</strong>...
              </p>
            </div>

            <div className="w-48 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-[#1261A0] via-cyan-400 to-[#D9B45B] rounded-full animate-pulse w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
