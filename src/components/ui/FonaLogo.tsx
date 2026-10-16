import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export type LogoVariant = "full" | "compact" | "icon" | "secondary" | "official";
export type LogoTheme = "auto" | "light" | "dark";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface FonaLogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  size?: LogoSize;
  className?: string;
  onClick?: () => void;
  showSlogan?: boolean;
}

export const FonaLogo: React.FC<FonaLogoProps> = ({
  variant = "full",
  theme = "auto",
  size = "md",
  className = "",
  onClick,
  showSlogan = true,
}) => {
  const { brandSettings, resolvedTheme } = useApp();
  const [imageError, setImageError] = useState(false);

  // Compute effective theme: auto follows resolvedTheme from context
  const activeTheme: "light" | "dark" = theme === "auto" ? resolvedTheme : theme;
  const isLight = activeTheme === "light";

  // Determine which visual logo to show:
  // - "secondary" or "official" displays the official logo (img1: cross with caduceus serpent)
  // - "full", "compact", "icon" display the user-selected principal logo
  // (per user instruction: img2 logo secondaire is the primary of the application)
  const isOfficialEmblem = variant === "secondary" || variant === "official";

  const targetLogoSrc = isOfficialEmblem
    ? brandSettings.secondaryLogo || "/fona_logo_officiel.jpg"
    : brandSettings.activePrimaryChoice === "official_cross"
    ? brandSettings.secondaryLogo || "/fona_logo_officiel.jpg"
    : brandSettings.primaryLogo || "/fona_logo_principal.jpg";

  const targetIconSrc = isOfficialEmblem
    ? brandSettings.secondaryIconLogo || "/favicon.jpg"
    : brandSettings.iconLogo || "/favicon.jpg";

  // Dimension mapping
  const sizeMap = {
    xs: {
      height: "h-6",
      maxHeightPx: 24,
      iconSize: 22,
      textClass: "text-xs font-bold",
      subClass: "text-[9px]",
    },
    sm: {
      height: "h-8",
      maxHeightPx: 32,
      iconSize: 28,
      textClass: "text-sm font-bold",
      subClass: "text-[10px]",
    },
    md: {
      height: "h-11",
      maxHeightPx: 44,
      iconSize: 38,
      textClass: "text-base font-extrabold",
      subClass: "text-xs",
    },
    lg: {
      height: "h-14",
      maxHeightPx: 56,
      iconSize: 48,
      textClass: "text-xl font-black",
      subClass: "text-xs font-medium",
    },
    xl: {
      height: "h-20",
      maxHeightPx: 80,
      iconSize: 64,
      textClass: "text-2xl font-black",
      subClass: "text-sm font-medium",
    },
  }[size];

  // High-fidelity SVG Fallback in case image is missing or loading
  const renderSvgFallback = (type: "principal" | "cross") => {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl overflow-hidden shrink-0 border transition-all ${
          isLight
            ? "border-amber-500/30 shadow-[0_2px_12px_rgba(217,180,91,0.2)]"
            : "border-white/20 shadow-[0_4px_16px_rgba(217,180,91,0.25)]"
        }`}
        style={{
          width: sizeMap.iconSize,
          height: sizeMap.iconSize,
          background: isLight
            ? "linear-gradient(135deg, #F0F4F9 0%, #FFFFFF 100%)"
            : "linear-gradient(135deg, #071A33 0%, #0d274c 100%)",
        }}
      >
        <svg viewBox="0 0 40 40" fill="none" className="w-[84%] h-[84%]">
          <defs>
            <linearGradient id="goldMeshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F7E2A9" />
              <stop offset="50%" stopColor="#D9B45B" />
              <stop offset="100%" stopColor="#9C772A" />
            </linearGradient>
            <linearGradient id="cyanAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#55D9FF" />
              <stop offset="100%" stopColor="#4F7DF3" />
            </linearGradient>
          </defs>
          {type === "principal" ? (
            /* Heart-figure embracing cross (img2 secondary design used as principal) */
            <g>
              {/* Silhouette head dot */}
              <circle cx="18" cy="10" r="3.2" fill="url(#goldMeshGrad)" />
              {/* Heart shaped embracing curve */}
              <path
                d="M17 14C11 16 9 22 13 28C16 32 20 34 22 35C24 34 32 29 33 22C34 16 28 13 23 16"
                stroke="url(#goldMeshGrad)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Central Medical Cross */}
              <path
                d="M23 19V27M19 23H27"
                stroke="url(#goldMeshGrad)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </g>
          ) : (
            /* Official Cross with caduceus snake (img1) */
            <g>
              {/* Golden Cross */}
              <path
                d="M20 7V33M7 20H33"
                stroke="url(#goldMeshGrad)"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
              {/* Caduceus Snake */}
              <path
                d="M16 12C20 10 24 14 20 18C16 22 24 26 20 30"
                stroke={isLight ? "#1261A0" : "#FFFFFF"}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="17" cy="11" r="1.4" fill={isLight ? "#1261A0" : "#FFFFFF"} />
            </g>
          )}
        </svg>
      </div>
    );
  };

  // 1. ICON ONLY VARIANT
  if (variant === "icon") {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 cursor-pointer select-none transition-transform duration-200 hover:scale-105 ${className}`}
        onClick={onClick}
        title={`${brandSettings.organizationName} — ${brandSettings.shortName}`}
      >
        {!imageError ? (
          <div
            className={`relative flex items-center justify-center rounded-xl overflow-hidden p-0.5 transition-all ${
              isLight
                ? "shadow-[0_2px_10px_rgba(217,180,91,0.18)] border border-amber-500/30 bg-white/95"
                : "shadow-[0_4px_16px_rgba(217,180,91,0.2)] border border-amber-400/30 bg-[#071A33]/80"
            }`}
            style={{ width: sizeMap.iconSize, height: sizeMap.iconSize }}
          >
            <img
              src={targetIconSrc}
              alt="FONA Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          renderSvgFallback(isOfficialEmblem ? "cross" : "principal")
        )}
      </div>
    );
  }

  // 2. COMPACT VARIANT (Horizontal lockup with badge + text)
  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center gap-3 cursor-pointer select-none transition-opacity duration-200 hover:opacity-95 ${className}`}
        onClick={onClick}
        title={`${brandSettings.organizationName} — ${brandSettings.slogan}`}
      >
        {/* Emblem Badge */}
        {!imageError ? (
          <div
            className={`relative shrink-0 rounded-xl overflow-hidden p-0.5 transition-all ${
              isLight
                ? "shadow-[0_2px_10px_rgba(217,180,91,0.18)] border border-amber-500/30 bg-white/95"
                : "shadow-[0_4px_14px_rgba(217,180,91,0.25)] border border-amber-400/30 bg-[#071A33]/90"
            }`}
            style={{ width: sizeMap.iconSize, height: sizeMap.iconSize }}
          >
            <img
              src={targetIconSrc}
              alt="FONA"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          renderSvgFallback(isOfficialEmblem ? "cross" : "principal")
        )}

        {/* Brand Text */}
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`tracking-tight font-black bg-gradient-to-r ${
                isLight
                  ? "from-[#B48B2E] via-[#D9B45B] to-[#9C772A]"
                  : "from-[#F2D27E] via-[#D9B45B] to-[#F2D27E]"
              } bg-clip-text text-transparent ${sizeMap.textClass}`}
            >
              FONA
            </span>
            <span
              className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${
                isLight
                  ? "bg-blue-600/10 border border-blue-600/20 text-[#1261A0]"
                  : "bg-cyan-500/10 border border-cyan-400/20 text-[#55D9FF]"
              }`}
            >
              DIGITAL
            </span>
          </div>
          <span
            className={`text-[10px] font-semibold tracking-wider mt-1 uppercase ${
              isLight ? "text-slate-600" : "text-slate-300"
            }`}
          >
            Cabinet Médical
          </span>
        </div>
      </div>
    );
  }

  // 3. FULL OR OFFICIAL / SECONDARY VARIANT
  return (
    <div
      className={`inline-flex flex-col cursor-pointer select-none transition-all duration-200 hover:brightness-105 ${className}`}
      onClick={onClick}
    >
      <div className="relative flex items-center">
        {!imageError ? (
          <div
            className={`relative rounded-xl overflow-hidden transition-all ${
              isLight
                ? "bg-white/95 p-1.5 border border-slate-200/90 shadow-[0_4px_16px_rgba(7,26,51,0.06)]"
                : "bg-[#071a33]/60 backdrop-blur-md border border-white/10 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
            }`}
          >
            <img
              src={targetLogoSrc}
              alt={isOfficialEmblem ? "Logo Officiel FONA" : "Logo Principal FONA"}
              referrerPolicy="no-referrer"
              className={`${sizeMap.height} w-auto object-contain rounded-lg drop-shadow-md`}
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          /* High-end vector lockup fallback */
          <div className="flex items-center gap-3">
            {renderSvgFallback(isOfficialEmblem ? "cross" : "principal")}
            <div className="flex flex-col leading-tight">
              <span
                className={`text-xl font-black tracking-tight ${
                  isLight ? "text-[#B48B2E]" : "text-[#D9B45B]"
                }`}
              >
                FONA
              </span>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isLight ? "text-slate-600" : "text-slate-300"
                }`}
              >
                CABINET MÉDICAL
              </span>
            </div>
          </div>
        )}
      </div>

      {showSlogan && size !== "xs" && size !== "sm" && (
        <span
          className={`italic font-serif font-medium mt-1.5 tracking-tight ${
            isLight ? "text-amber-800" : "text-amber-300/90"
          } ${sizeMap.subClass}`}
        >
          {brandSettings.slogan}
        </span>
      )}
    </div>
  );
};
