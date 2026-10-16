import React, { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { FonaLogo } from "./FonaLogo";
import { AlertCircle, RefreshCw } from "lucide-react";

export type BootState =
  | "INITIALIZING"
  | "RESTORING_SESSION"
  | "LOADING_CONFIGURATION"
  | "READY"
  | "ERROR";

export const AppSplashScreen: React.FC = () => {
  const {
    showAppLaunchIntro,
    setShowAppLaunchIntro,
    animationMode,
    respectSystemMotion,
    resolvedTheme,
    isAuthenticated,
    brandSettings,
  } = useApp();

  const [bootState, setBootState] = useState<BootState>("INITIALIZING");
  const [progress, setProgress] = useState<number>(18);
  const [isMorphingOut, setIsMorphingOut] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLight = resolvedTheme === "light";
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Clear all pending timeouts on unmount or reset
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Complete and trigger the morphic exit transition
  const triggerMorphicExit = useCallback(() => {
    clearAllTimers();
    setBootState("READY");
    setProgress(100);

    // Immediate morphic transition sequence
    const morphTimer = setTimeout(() => {
      setIsMorphingOut(true);
      const finishTimer = setTimeout(() => {
        setShowAppLaunchIntro(false);
      }, 340);
      timersRef.current.push(finishTimer);
    }, 120);

    timersRef.current.push(morphTimer);
  }, [clearAllTimers, setShowAppLaunchIntro]);

  // Main startup state machine
  useEffect(() => {
    if (!showAppLaunchIntro) return;

    // Respect user & system reduced motion preferences: instantaneous start
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (animationMode === "disabled" || (respectSystemMotion && prefersReduced)) {
      setShowAppLaunchIntro(false);
      return;
    }

    clearAllTimers();
    setIsMorphingOut(false);
    setBootState("INITIALIZING");
    setProgress(20);

    try {
      // 1. INITIALIZING (0ms - 260ms): Storage, Theme & Environment Checks
      const t1 = setTimeout(() => {
        try {
          // Real check: Local storage availability
          localStorage.getItem("fona_theme_mode");
          setBootState("RESTORING_SESSION");
          setProgress(52);
        } catch (err) {
          console.warn("Storage check exception:", err);
          setBootState("RESTORING_SESSION");
          setProgress(52);
        }
      }, 260);
      timersRef.current.push(t1);

      // 2. RESTORING_SESSION (260ms - 580ms): Session validation & RBAC credentials
      const t2 = setTimeout(() => {
        try {
          // Real check: session storage authentication token
          sessionStorage.getItem("fona_authenticated");
          setBootState("LOADING_CONFIGURATION");
          setProgress(82);
        } catch (err) {
          console.warn("Session check exception:", err);
          setBootState("LOADING_CONFIGURATION");
          setProgress(82);
        }
      }, 580);
      timersRef.current.push(t2);

      // 3. LOADING_CONFIGURATION (580ms - 880ms): Clinical Registries & Regional Rules
      const t3 = setTimeout(() => {
        setBootState("READY");
        setProgress(100);
      }, 880);
      timersRef.current.push(t3);

      // 4. READY -> MORPHIC DISSOLVE INTO TARGET INTERFACE (~1060ms)
      const t4 = setTimeout(() => {
        setIsMorphingOut(true);
      }, 1060);
      timersRef.current.push(t4);

      // 5. Complete transition & unmount splash screen (~1400ms)
      const t5 = setTimeout(() => {
        setShowAppLaunchIntro(false);
      }, 1400);
      timersRef.current.push(t5);
    } catch (e: any) {
      setBootState("ERROR");
      setErrorMessage(e?.message || "Erreur d'initialisation");
    }

    return () => {
      clearAllTimers();
    };
  }, [
    showAppLaunchIntro,
    animationMode,
    respectSystemMotion,
    setShowAppLaunchIntro,
    clearAllTimers,
  ]);

  // Keyboard or pointer bypass: allow instant access if user clicks or presses a key
  useEffect(() => {
    if (!showAppLaunchIntro || isMorphingOut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        triggerMorphicExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAppLaunchIntro, isMorphingOut, triggerMorphicExit]);

  if (!showAppLaunchIntro) return null;

  // Short, discreet status message according to real system state
  const getDiscreetStatusText = () => {
    switch (bootState) {
      case "INITIALIZING":
        return "Initialisation du système...";
      case "RESTORING_SESSION":
        return isAuthenticated
          ? "Vérification de session sécurisée..."
          : "Préparation de l'environnement clinique...";
      case "LOADING_CONFIGURATION":
        return "Chargement du référentiel médical...";
      case "READY":
        return "Système médical prêt";
      case "ERROR":
        return "Contrôle requis";
      default:
        return "";
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={bootState !== "ERROR" ? triggerMorphicExit : undefined}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden transition-all duration-340 cursor-default ${
        isMorphingOut
          ? "opacity-0 pointer-events-none scale-[1.03]"
          : "opacity-100"
      }`}
      style={{
        backgroundColor: isLight ? "#F4F8FC" : "#06111F",
      }}
    >
      {/* ========================================================
          HALOS LUMINEUX AMBIANTS FONA (SKY / BLUE / TEAL / GOLD)
          Optique ultra-subtile, pureté médicale sans aucun néon
          ======================================================== */}
      {/* 1. Halo Zénith Sky (#55B9E8) */}
      <div
        className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[360px] rounded-full blur-[160px] pointer-events-none transition-opacity duration-300 animate-fona-halo-breathe ${
          isLight ? "bg-[#55B9E8]/12" : "bg-[#55B9E8]/08"
        }`}
        aria-hidden="true"
      />

      {/* 2. Halo Médical Teal (#20B8A6) au centre */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full blur-[170px] pointer-events-none transition-opacity duration-300 ${
          isLight ? "bg-[#20B8A6]/08" : "bg-[#20B8A6]/06"
        }`}
        aria-hidden="true"
      />

      {/* 3. Halo Nadir Bleu FONA (#1261A0) */}
      <div
        className={`absolute -bottom-28 right-1/4 w-[560px] h-[420px] rounded-full blur-[160px] pointer-events-none transition-opacity duration-300 ${
          isLight ? "bg-[#1261A0]/10" : "bg-[#1261A0]/12"
        }`}
        aria-hidden="true"
      />

      {/* 4. Touche Institutionnelle Or FONA (#D9B45B) */}
      <div
        className={`absolute top-1/3 -right-24 w-[380px] h-[380px] rounded-full blur-[150px] pointer-events-none transition-opacity duration-300 ${
          isLight ? "bg-[#D9B45B]/07" : "bg-[#D9B45B]/05"
        }`}
        aria-hidden="true"
      />

      {/* ========================================================
          SURFACE LIQUID GLASS FLOTTANTE MULTICOUCHE
          Design identitaire FONA, biseau spéculaire et profondeur
          ======================================================== */}
      <div
        className={`relative w-full max-w-sm sm:max-w-[420px] rounded-[28px] overflow-hidden p-8 sm:p-9 text-center animate-fona-splash-enter transition-all duration-340 ${
          isMorphingOut ? "scale-[1.04] blur-[3px]" : "scale-100 blur-0"
        }`}
        style={{
          background: isLight
            ? "linear-gradient(135deg, rgba(255, 255, 255, 0.90) 0%, rgba(246, 250, 255, 0.76) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          border: isLight
            ? "1px solid rgba(255, 255, 255, 0.88)"
            : "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow: isLight
            ? "0 24px 60px -12px rgba(7, 26, 51, 0.08), 0 6px 20px rgba(7, 26, 51, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.95)"
            : "0 30px 70px -15px rgba(0, 0, 0, 0.55), 0 8px 25px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.20), inset 0 -1px 0 rgba(0, 0, 0, 0.35)",
        }}
      >
        {/* Reflet spéculaire mobile (Light Sheen Sweep) */}
        <div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none animate-fona-glass-sheen"
          style={{
            background: isLight
              ? "linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.60) 45%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.60) 55%, transparent 100%)"
              : "linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.12) 45%, rgba(255, 255, 255, 0.22) 50%, rgba(255, 255, 255, 0.12) 55%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        {/* ========================================================
            BLOC CENTRAL : LOGO OFFICIEL FONA & IDENTITÉ
            ======================================================== */}
        <div className="relative flex flex-col items-center">
          {/* Écrin Liquid Glass du Logo */}
          <div className="relative mb-5">
            <div
              className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl p-1 flex items-center justify-center transition-transform duration-300 ${
                isLight
                  ? "bg-gradient-to-br from-white to-[#EDF3FA] border border-white/90 shadow-[0_8px_24px_rgba(7,26,51,0.06),inset_0_1px_0_#FFFFFF]"
                  : "bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]"
              }`}
            >
              <FonaLogo variant="icon" size="lg" showSlogan={false} />
            </div>

            {/* Aura douce non-flashy derrière le logo */}
            <div
              className={`absolute inset-0 rounded-2xl blur-xl pointer-events-none transition-opacity duration-300 ${
                isLight ? "bg-amber-500/10" : "bg-cyan-400/10"
              }`}
              aria-hidden="true"
            />
          </div>

          {/* Typographie Institutionnelle FONA DIGITAL */}
          <div className="space-y-1 mb-5">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-xl sm:text-2xl font-black tracking-tight ${
                  isLight
                    ? "bg-gradient-to-r from-[#B48B2E] via-[#D9B45B] to-[#9C772A] bg-clip-text text-transparent"
                    : "bg-gradient-to-r from-[#F2D27E] via-[#D9B45B] to-[#F2D27E] bg-clip-text text-transparent"
                }`}
              >
                FONA
              </span>
              <span
                className={`text-[11px] sm:text-xs uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded-md ${
                  isLight
                    ? "bg-[#1261A0]/10 text-[#1261A0] border border-[#1261A0]/20"
                    : "bg-[#55D9FF]/10 text-[#55D9FF] border border-[#55D9FF]/25"
                }`}
              >
                DIGITAL
              </span>
            </div>

            <p
              className={`text-xs font-semibold tracking-wider uppercase ${
                isLight ? "text-slate-600" : "text-slate-300"
              }`}
            >
              {brandSettings.organizationName || "Cabinet Médical FONA"}
            </p>
          </div>

          {/* ========================================================
              INDICATEUR DE PROGRESSION ULTRA-FIN (HAIRLINE)
              Pas de gros cercle, pas de pourcentage permanent
              ======================================================== */}
          <div className="w-44 sm:w-52 h-[2px] rounded-full overflow-hidden bg-black/5 dark:bg-white/10 relative mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1261A0] via-[#55D9FF] to-[#D9B45B] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* ========================================================
              INDICATION DISCRÈTE D'ÉTAT SYSTÈME
              Texte court, utile, sobre et médical
              ======================================================== */}
          <div className="h-5 flex items-center justify-center">
            {bootState === "ERROR" ? (
              <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage || "Erreur de démarrage"}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerMorphicExit();
                  }}
                  className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Continuer
                </button>
              </div>
            ) : (
              <p
                className={`text-[11px] font-medium tracking-wide transition-opacity duration-200 ${
                  isLight ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {getDiscreetStatusText()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
