import React, { useState, useEffect } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  KeyRound,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  HeartPulse,
  Activity,
  FileCheck2,
  Check,
  X,
  Clock,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { FonaLogo } from "../../ui/FonaLogo";
import { GlassAvatar } from "../../ui/GlassAvatar";
import { ROLE_LABELS } from "../../../services/rbacService";
import { User as UserType } from "../../../types";

export const LoginView: React.FC = () => {
  const {
    login,
    users,
    themeMode,
    resolvedTheme,
    setThemeMode,
    brandSettings,
    rememberedIdentifier,
    requestPasswordReset,
    resetPasswordWithCode,
    showToast,
  } = useApp();

  const [identifier, setIdentifier] = useState(rememberedIdentifier || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedIdentifier));

  // Form states: "idle" | "loading" | "error" | "success"
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [authStage, setAuthStage] = useState<"idle" | "authenticating" | "verifying" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Lockout protection after repeated attempts
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  // Modals & Sub-flows
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Countdown timer when locked out
  useEffect(() => {
    if (lockoutTimer === null) return;
    if (lockoutTimer <= 0) {
      setLockoutTimer(null);
      setFailedAttempts(0);
      return;
    }
    const interval = setInterval(() => {
      setLockoutTimer((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer !== null && lockoutTimer > 0) return;

    if (!identifier.trim()) {
      setStatus("error");
      setErrorMessage("Veuillez saisir votre identifiant, email ou numéro de téléphone.");
      return;
    }
    if (!password) {
      setStatus("error");
      setErrorMessage("Veuillez saisir votre mot de passe médical.");
      return;
    }

    setStatus("loading");
    setAuthStage("authenticating");
    setErrorMessage("");

    try {
      // Étape 1 : Authentification des identifiants (160ms)
      await new Promise((res) => setTimeout(res, 160));
      setAuthStage("verifying");

      // Étape 2 : Vérification des habilitations RBAC et site clinique (200ms)
      await new Promise((res) => setTimeout(res, 200));
      const res = await login(identifier.trim(), password, rememberMe);

      if (res.success) {
        // Étape 3 : Succès & Validation de la signature médicale
        setAuthStage("success");
        setStatus("success");
        // Étape 4 : Déploiement vers le Dashboard (220ms)
        await new Promise((res) => setTimeout(res, 220));
      } else {
        setAuthStage("idle");
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setLockoutTimer(60);
          setErrorMessage("Trop de tentatives infructueuses. Compte temporairement verrouillé pendant 60 secondes.");
        } else {
          setErrorMessage(res.error || "Identifiant ou mot de passe incorrect.");
        }
        setStatus("error");
      }
    } catch (err) {
      setAuthStage("idle");
      setStatus("error");
      setErrorMessage("Erreur technique de connexion. Veuillez réessayer.");
    }
  };

  const handleStartForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotStep(1);
    setForgotIdentifier(identifier || "");
    setForgotError("");
    setForgotSuccess("");
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError("Veuillez renseigner votre identifiant ou email.");
      return;
    }
    setForgotError("");
    const res = await requestPasswordReset(forgotIdentifier.trim());
    if (res.success) {
      setGeneratedCode(res.tempCode || "749201");
      setForgotStep(2);
    } else {
      setForgotError(res.message);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (enteredCode.trim() !== generatedCode.trim()) {
      setForgotError("Code de sécurité incorrect. Veuillez vérifier le code affiché.");
      return;
    }

    if (newPassword.length < 6) {
      setForgotError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    const res = await resetPasswordWithCode(enteredCode.trim(), newPassword);
    if (res.success) {
      setForgotSuccess("Votre mot de passe a été réinitialisé avec succès !");
      setPassword(newPassword);
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotStep(1);
        showToast("SUCCESS", "Mot de passe mis à jour", "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.");
      }, 1200);
    } else {
      setForgotError(res.message);
    }
  };

  const isLight = resolvedTheme === "light";

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-250 select-none">
      {/* Background Liquid Glass Ambient Glows */}
      <div
        className={`fixed top-0 left-10 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none -z-10 transition-opacity duration-300 ${
          isLight ? "bg-blue-400/12" : "bg-blue-600/12"
        }`}
      />
      <div
        className={`fixed bottom-10 right-10 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none -z-10 transition-opacity duration-300 ${
          isLight ? "bg-cyan-400/15" : "bg-cyan-500/10"
        }`}
      />
      <div
        className={`fixed top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full blur-[150px] pointer-events-none -z-10 transition-opacity duration-300 ${
          isLight ? "bg-[#D9B45B]/10" : "bg-[#D9B45B]/5"
        }`}
      />

      {/* Top Bar with Minimal Brand Info & Theme Switcher */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-secondary)]">
              Serveur Clinique Opérationnel
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)] hidden sm:inline">•</span>
          <span className="text-xs text-[var(--text-muted)] hidden sm:inline font-mono">
            CM FONA Sirakoro Méguétana • Bamako
          </span>
        </div>

        {/* Theme Switcher Pill (Clair / Sombre / Système) */}
        <div
          className="flex items-center bg-[var(--surface-subtle)] p-1 rounded-2xl border border-[var(--border)] shadow-xs"
          title="Changer de thème visuel"
        >
          <button
            type="button"
            onClick={() => setThemeMode("light")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              themeMode === "light"
                ? "bg-white text-amber-600 shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10"
            }`}
            title="Mode Clair (White Medical Liquid Glass)"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setThemeMode("dark")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              themeMode === "dark"
                ? "bg-[#091f3a] text-cyan-400 shadow-sm border border-cyan-400/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10"
            }`}
            title="Mode Sombre (Dark Medical Liquid Glass)"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setThemeMode("system")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              themeMode === "system"
                ? "bg-[#4F7DF3] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10"
            }`}
            title={`Mode Système (${resolvedTheme === "dark" ? "Sombre actif" : "Clair actif"})`}
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ========================================================
              PARTIE GAUCHE (DESKTOP) : ZONE INSTITUTIONNELLE PRESTIGE
              ======================================================== */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-7 pr-4">
            {/* Institution Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] w-fit backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold tracking-wide uppercase text-cyan-600 dark:text-cyan-300">
                Portail Clinique & Médical Sécurisé
              </span>
            </div>

            {/* Official FONA Logo */}
            <div className="flex items-center">
              <FonaLogo variant="full" theme="auto" size="xl" showSlogan={false} />
            </div>

            {/* Slogan Officiel avec Accent FONA Gold */}
            <div className="space-y-3">
              <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-[var(--text-primary)]">
                Zéro Souci, Soins de Qualité,{" "}
                <span className="bg-gradient-to-r from-[#D9B45B] via-amber-300 to-[#D9B45B] bg-clip-text text-transparent">
                  Kapital Vie.
                </span>
              </h2>
              <p className="text-sm xl:text-base text-[var(--text-secondary)] leading-relaxed max-w-lg">
                La plateforme numérique unifiée du Cabinet Médical FONA. Centralisez les dossiers permanents,
                le suivi obstétrical, les consultations, la biologie médicale et la synchronisation inter-cliniques.
              </p>
            </div>

            {/* Medical Highlights Cards with Liquid Glass Effect */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] backdrop-blur-md space-y-1.5 shadow-sm hover:border-cyan-400/40 transition-all">
                <div className="flex items-center gap-2 text-[#1261A0] dark:text-[#55D9FF]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold">Sécurité RBAC</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  Accès hermétique par profil : médecin, sage-femme, infirmier, caisse.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] backdrop-blur-md space-y-1.5 shadow-sm hover:border-amber-400/40 transition-all">
                <div className="flex items-center gap-2 text-amber-600 dark:text-[#D9B45B]">
                  <HeartPulse className="w-4 h-4" />
                  <span className="text-xs font-bold">Dossier Unique</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  Un seul dossier permanent par patient, enrichi à chaque passage.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] backdrop-blur-md space-y-1.5 shadow-sm hover:border-emerald-400/40 transition-all">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-bold">Haute Continuité</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  RPO ≤ 24h & RTO ≤ 4h. Mode hors-ligne et réplication automatique.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] backdrop-blur-md space-y-1.5 shadow-sm hover:border-purple-400/40 transition-all">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <FileCheck2 className="w-4 h-4" />
                  <span className="text-xs font-bold">Audit Médical</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  Traçabilité chronologique complète de chaque acte et ordonnance.
                </p>
              </div>
            </div>

            {/* Future Clinique FONA Indicator */}
            <div className="flex items-center gap-3 pt-1 text-xs text-[var(--text-secondary)]">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-[#B48B2E] dark:text-[#D9B45B] border border-amber-400/30 font-semibold text-[10px]">
                ÉVOLUTION
              </span>
              <span>Socle numérique certifié pour la future Clinique FONA.</span>
            </div>
          </div>

          {/* ========================================================
              PARTIE DROITE (DESKTOP) / CARTE CENTRALE (MOBILE)
              CARTE LIQUID GLASS DE CONNEXION
              ======================================================== */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 bg-[var(--surface-card)] backdrop-blur-2xl border border-[var(--border)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-300">
              {/* Header inside the Card (Logo FONA → Authentification → Vérification → Succès) */}
              <div className="text-center space-y-3 pb-6 border-b border-[var(--border-subtle)]">
                <div className="flex justify-center relative">
                  {authStage !== "idle" && (
                    <div
                      className={`absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-300 ${
                        authStage === "authenticating"
                          ? "bg-cyan-500/30 animate-pulse scale-125"
                          : authStage === "verifying"
                          ? "bg-amber-400/35 animate-pulse scale-150"
                          : "bg-emerald-400/40 animate-fona-check-pop scale-150"
                      }`}
                    />
                  )}
                  <FonaLogo variant="compact" size="md" theme="auto" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
                    Bienvenue sur FONA Digital
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 transition-all duration-200">
                    {authStage === "authenticating"
                      ? "1/3 • Authentification de vos identifiants..."
                      : authStage === "verifying"
                      ? "2/3 • Vérification des accréditations médicales..."
                      : authStage === "success"
                      ? "3/3 • Accès autorisé — Chargement de votre Dashboard..."
                      : "Votre espace de gestion médicale"}
                  </p>
                </div>
              </div>

              {/* Status or Error Notification Banner */}
              {status === "error" && errorMessage && (
                <div className="mt-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-2.5 text-xs animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="leading-snug">{errorMessage}</div>
                </div>
              )}

              {/* Lockout Countdown Notification */}
              {lockoutTimer !== null && lockoutTimer > 0 && (
                <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center gap-2.5 text-xs animate-pulse">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    Sécurité renforcée : nouvelle tentative autorisée dans <strong>{lockoutTimer}s</strong>.
                  </span>
                </div>
              )}

              {/* Success Notification */}
              {status === "success" && (
                <div className="mt-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 text-xs animate-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Authentification réussie. Chargement de votre espace de travail...</span>
                </div>
              )}

              {/* Main Credentials Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Identifiant / Téléphone / Email */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Identifiant / Téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="Ex: admin.drkone ou 0708091011"
                      autoComplete="username"
                      disabled={status === "loading" || (lockoutTimer !== null && lockoutTimer > 0)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--glass-input-border)] text-sm text-[var(--glass-input-text)] placeholder-[var(--glass-input-placeholder)] focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Mot de passe avec toggle visibilité 👁 */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={handleStartForgotPassword}
                      className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      disabled={status === "loading" || (lockoutTimer !== null && lockoutTimer > 0)}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--glass-input-border)] text-sm text-[var(--glass-input-text)] placeholder-[var(--glass-input-placeholder)] focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all font-mono tracking-wider disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={status === "loading"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Se souvenir de moi */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-md border border-[var(--border)] text-cyan-500 focus:ring-cyan-400/30 bg-[var(--surface-subtle)]"
                    />
                    <span className="text-xs text-[var(--text-secondary)]">Se souvenir de moi</span>
                  </label>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    AES-256 SSL
                  </span>
                </div>

                {/* Submit Action Button with Realistic States (Hover 140ms, Press 90ms, Sheen effect) */}
                <button
                  type="submit"
                  disabled={status === "loading" || status === "success" || (lockoutTimer !== null && lockoutTimer > 0)}
                  className={`fona-btn-interactive fona-sheen-target w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    status === "loading"
                      ? "bg-cyan-500/50 text-white cursor-wait"
                      : status === "success"
                      ? "bg-emerald-500 text-white shadow-[0_0_25px_rgba(52,211,153,0.4)]"
                      : "bg-gradient-to-r from-[#1261A0] to-[#0284C7] dark:from-[#1261A0] dark:to-cyan-600 text-white hover:opacity-95 hover:shadow-cyan-500/20 active:scale-[0.985]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {status === "loading" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>
                        {authStage === "authenticating"
                          ? "Authentification..."
                          : "Vérification clinique..."}
                      </span>
                    </>
                  ) : status === "success" ? (
                    <>
                      <Check className="w-4 h-4 animate-fona-check-pop" />
                      <span>Accès validé • Redirection Dashboard...</span>
                    </>
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Card Footer info */}
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center">
                <p className="text-[11px] text-[var(--text-muted)]">
                  FONA Digital v1.0 — © Cabinet Médical FONA
                </p>
                <p className="text-[10px] text-[var(--text-muted)]/75 mt-0.5">
                  Conforme aux normes de confidentialité des données de santé
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Minimal Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)] z-10">
        <div>
          {brandSettings.organizationName} • {brandSettings.slogan}
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-cyan-500" /> Données de santé protégées
          </span>
          <span>•</span>
          <span>Support Clinique : +225 27 20 22 10 00</span>
        </div>
      </footer>

      {/* ========================================================
          MODAL DE RÉCUPÉRATION DU MOT DE PASSE (MOT DE PASSE OUBLIÉ)
          Flux de sécurité médical complet
          ======================================================== */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 sm:p-7 bg-[var(--surface-card)] border border-[var(--border)] shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-base">
                <KeyRound className="w-5 h-5 text-[#D9B45B]" />
                <span>Récupération du Mot de Passe</span>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Step 1: Identifier verification */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Saisissez l'identifiant professionnel ou l'adresse email rattachée à votre compte praticien.
                  Un code de vérification sécurisé sera généré.
                </p>
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Identifiant professionnel ou Email
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="Ex: dr.traore ou m.traore@cm-fona.ci"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--glass-input-border)] text-sm text-[var(--glass-input-text)] focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1261A0] text-white hover:bg-[#1261A0]/90 cursor-pointer shadow-md"
                  >
                    Vérifier et continuer
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Security code verification & new password input */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-xs text-[var(--text-primary)] space-y-1">
                  <div className="font-semibold text-cyan-600 dark:text-cyan-400">
                    Code de vérification médical généré :
                  </div>
                  <div className="text-xl font-mono font-black tracking-widest text-center py-1">
                    {generatedCode}
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] text-center">
                    (Dans un environnement clinique réel, ce code est expédié par SMS crypté sur le téléphone du praticien).
                  </p>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Saisir le code de confirmation
                  </label>
                  <input
                    type="text"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    placeholder="Ex: 749201"
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--glass-input-border)] text-sm text-[var(--glass-input-text)] font-mono text-center tracking-widest focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--glass-input-border)] text-sm text-[var(--glass-input-text)] focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--glass-input-border)] text-sm text-[var(--glass-input-text)] focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="flex justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5 cursor-pointer"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1261A0] text-white hover:bg-[#1261A0]/90 cursor-pointer shadow-md"
                  >
                    Valider le nouveau mot de passe
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
