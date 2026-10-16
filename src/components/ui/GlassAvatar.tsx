import React from "react";
import { Role } from "../../types";

interface GlassAvatarProps {
  role?: Role;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  statusOnline?: boolean;
  animated?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const GlassAvatar: React.FC<GlassAvatarProps> = ({
  role = "PRACTITIONER",
  name,
  size = "md",
  showStatus = false,
  statusOnline = true,
  animated = true,
  isLoading = false,
  className = "",
}) => {
  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-13 h-13 text-base",
    xl: "w-16 h-16 text-xl",
  }[size];

  // Specific role visuals adhering to FONA Digital Medical Liquid Glass aesthetic
  const getRoleConfig = (userRole: Role) => {
    switch (userRole) {
      case "ADMIN":
        return {
          label: "Administration & Direction",
          gradient: "from-amber-600 via-[#D9B45B] to-yellow-300",
          border: "border-[#D9B45B]/60",
          shadow: "shadow-[0_0_20px_rgba(217,180,91,0.35)]",
          glowColor: "#D9B45B",
          badgeColor: "bg-[#D9B45B]",
          // Administrative Director: refined collar, gold tie/crest, smart glasses/lapel
          svg: (
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              {/* Silhouette Head */}
              <circle cx="20" cy="13" r="6" fill="#F2D27E" />
              {/* Hair / Head style */}
              <path d="M14 12c0-4 2.5-6 6-6s6 2 6 6c-2-1-4-1-6 0-2-1-4-1-6 0z" fill="#071A33" />
              {/* Executive Suit & Collar */}
              <path d="M10 33c0-7 4-10 10-10s10 3 10 10" fill="#0c2b54" />
              {/* Lapel & Tie */}
              <path d="M17 23l3 8 3-8" fill="#F2D27E" />
              <path d="M19 23h2l1 6-2 3-2-3 1-6z" fill="#D9B45B" />
              {/* Pocket Crest */}
              <circle cx="25" cy="27" r="1.5" fill="#F2D27E" />
            </svg>
          ),
        };

      case "PRACTITIONER":
        return {
          label: "Médecin / Praticien",
          gradient: "from-[#1261A0] via-[#4F7DF3] to-[#55D9FF]",
          border: "border-cyan-400/50",
          shadow: "shadow-[0_0_20px_rgba(85,217,255,0.35)]",
          glowColor: "#55D9FF",
          badgeColor: "bg-[#55D9FF]",
          // Doctor: White lab coat + Cyan Digital Stethoscope around neck
          svg: (
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              {/* Silhouette Head */}
              <circle cx="20" cy="13" r="6" fill="#E2E8F0" />
              {/* Dark professional hair */}
              <path d="M14 13c0-3.5 2.5-6 6-6s6 2.5 6 6c-1-1-3-1.5-6-1s-5 0-6 1z" fill="#071A33" />
              {/* White Medical Coat */}
              <path d="M9 34c0-7 4.5-10.5 11-10.5s11 3.5 11 10.5" fill="#F8FAFC" />
              {/* Inner Scrub / Blue V-Neck */}
              <path d="M17 23.5l3 5 3-5" fill="#1261A0" />
              {/* Stethoscope Tubing (Curving on shoulders) */}
              <path
                d="M15 22c0 4 2 8 5 8s5-4 5-8"
                stroke="#55D9FF"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Stethoscope Chest Piece / Bell */}
              <circle cx="20" cy="30" r="2.2" fill="#55D9FF" stroke="#FFFFFF" strokeWidth="1" />
            </svg>
          ),
        };

      case "NURSE":
        return {
          label: "Infirmier / Soins",
          gradient: "from-[#0d9488] via-[#20B8A6] to-emerald-300",
          border: "border-teal-400/50",
          shadow: "shadow-[0_0_20px_rgba(32,184,166,0.35)]",
          glowColor: "#20B8A6",
          badgeColor: "bg-[#20B8A6]",
          // Nurse: Medical Scrubs + Stethoscope + Cross badge
          svg: (
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              {/* Silhouette Head */}
              <circle cx="20" cy="13" r="6" fill="#E2E8F0" />
              {/* Short styled hair */}
              <path d="M14 12c0-3.5 3-5.5 6-5.5s6 2 6 5.5c-2-0.5-4-0.5-6 0s-4-0.5-6 0z" fill="#071A33" />
              {/* Teal Medical Scrub */}
              <path d="M9 34c0-7 4.5-10.5 11-10.5s11 3.5 11 10.5" fill="#0D9488" />
              {/* V-Neck opening */}
              <path d="M16 23.5l4 4.5 4-4.5" fill="#14B8A6" />
              {/* Stethoscope Tube */}
              <path
                d="M14.5 22.5c0 4 2.2 7.5 5.5 7.5s5.5-3.5 5.5-7.5"
                stroke="#A7F3D0"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="20" cy="30" r="2" fill="#A7F3D0" />
              {/* Medical Cross pocket emblem */}
              <rect x="25" y="27" width="4" height="1.4" fill="#FFFFFF" rx="0.5" />
              <rect x="26.3" y="25.7" width="1.4" height="4" fill="#FFFFFF" rx="0.5" />
            </svg>
          ),
        };

      case "MIDWIFE":
        return {
          label: "Sage-Femme",
          gradient: "from-pink-500 via-[#8B7CFF] to-violet-300",
          border: "border-violet-400/50",
          shadow: "shadow-[0_0_20px_rgba(139,124,255,0.35)]",
          glowColor: "#8B7CFF",
          badgeColor: "bg-[#8B7CFF]",
          // Midwife: Soft Lilac Medical Tunic + Maternal Heart Symbol
          svg: (
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              {/* Silhouette Head */}
              <circle cx="20" cy="13" r="6" fill="#F8E8EE" />
              {/* Hair with neat bun / cut */}
              <path d="M14 12c0-4 2.5-6 6-6s6 2 6 6c-2 2-4 1-6 2s-4-1-6-2z" fill="#3B0764" />
              <circle cx="20" cy="5.5" r="2.2" fill="#3B0764" />
              {/* Lilac Uniform */}
              <path d="M9 34c0-7 4.5-10.5 11-10.5s11 3.5 11 10.5" fill="#7C3AED" />
              {/* Sweetheart Neckline */}
              <path d="M16 23.5c1 2 2.5 3 4 3s3-1 4-3" fill="#A78BFA" />
              {/* Maternity Infant / Heart Emblem */}
              <path
                d="M20 28.5l-2-2a2 2 0 0 1 2.8-2.8l.2.2.2-.2a2 2 0 0 1 2.8 2.8l-2 2-.8.8-.8-.8z"
                fill="#F472B6"
              />
            </svg>
          ),
        };

      case "RECEPTION_CAISSE":
        return {
          label: "Accueil & Caisse",
          gradient: "from-blue-600 via-indigo-500 to-sky-400",
          border: "border-sky-400/50",
          shadow: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
          glowColor: "#38BDF8",
          badgeColor: "bg-sky-400",
          // Reception / Cashier: Smart Blazer + Reception Headset / ID Badge
          svg: (
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              {/* Head */}
              <circle cx="20" cy="13" r="6" fill="#E2E8F0" />
              {/* Hair */}
              <path d="M14 12c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" fill="#0F172A" />
              {/* Receptionist Headset Band */}
              <path d="M14 12c0-4 2.5-6 6-6s6 2 6 6" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" />
              {/* Headset Earpiece & Mic */}
              <circle cx="14" cy="13" r="1.5" fill="#38BDF8" />
              <path d="M14 14.5c1 2 3 3 5 3" stroke="#38BDF8" strokeWidth="1" strokeLinecap="round" />
              {/* Professional Navy Tunic */}
              <path d="M9 34c0-7 4.5-10.5 11-10.5s11 3.5 11 10.5" fill="#1E293B" />
              {/* Light Blue Shirt */}
              <path d="M17 23.5l3 5 3-5" fill="#38BDF8" />
              {/* Clinic Name Badge */}
              <rect x="23" y="27" width="5" height="3" rx="0.6" fill="#FFFFFF" />
              <line x1="24" y1="28.5" x2="27" y2="28.5" stroke="#0284C7" strokeWidth="0.8" />
            </svg>
          ),
        };

      case "LAB":
        return {
          label: "Laboratoire Biomédical",
          gradient: "from-cyan-600 via-blue-600 to-indigo-400",
          border: "border-cyan-400/50",
          shadow: "shadow-[0_0_20px_rgba(6,182,212,0.35)]",
          glowColor: "#06B6D4",
          badgeColor: "bg-cyan-400",
          // Lab biologist: White coat + Microscope test tube emblem
          svg: (
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              <circle cx="20" cy="13" r="6" fill="#E2E8F0" />
              <path d="M14 12c0-3.5 3-6 6-6s6 2.5 6 6" fill="#0F172A" />
              {/* Lab Goggles / Glasses */}
              <rect x="15" y="11" width="10" height="3" rx="1.5" fill="#06B6D4" opacity="0.6" stroke="#FFFFFF" strokeWidth="0.8" />
              <path d="M9 34c0-7 4.5-10.5 11-10.5s11 3.5 11 10.5" fill="#F8FAFC" />
              <path d="M17 23.5l3 5 3-5" fill="#0284C7" />
              {/* Test Tube in Pocket */}
              <rect x="24" y="25" width="2" height="6" rx="1" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="0.6" />
              <rect x="24" y="28" width="2" height="3" rx="1" fill="#38BDF8" />
            </svg>
          ),
        };

      case "IMAGING":
        return {
          label: "Imagerie & Radiologie",
          gradient: "from-indigo-600 via-purple-600 to-pink-400",
          border: "border-purple-400/50",
          shadow: "shadow-[0_0_20px_rgba(168,85,247,0.35)]",
          glowColor: "#A855F7",
          badgeColor: "bg-purple-400",
          // Radiologist: Dark lead apron / scan badge + ultrasound wave
          svg: (
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              <circle cx="20" cy="13" r="6" fill="#E2E8F0" />
              <path d="M14 12c0-3.5 3-5.5 6-5.5s6 2 6 5.5" fill="#1E1B4B" />
              <path d="M9 34c0-7 4.5-10.5 11-10.5s11 3.5 11 10.5" fill="#312E81" />
              <path d="M17 23.5l3 5 3-5" fill="#6366F1" />
              {/* Radiology Radiation / Wave Symbol */}
              <circle cx="20" cy="29" r="2" fill="#E0E7FF" />
              <path d="M16 29a4 4 0 0 1 8 0" stroke="#C084FC" strokeWidth="1" strokeLinecap="round" />
              <path d="M14 29a6 6 0 0 1 12 0" stroke="#C084FC" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="1 1" />
            </svg>
          ),
        };

      default:
        return {
          label: "Professionnel FONA",
          gradient: "from-[#1261A0] via-[#4F7DF3] to-[#55D9FF]",
          border: "border-cyan-400/50",
          shadow: "shadow-[0_0_15px_rgba(85,217,255,0.3)]",
          glowColor: "#55D9FF",
          badgeColor: "bg-[#55D9FF]",
          svg: (
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              <circle cx="20" cy="13" r="6" fill="#E2E8F0" />
              <path d="M9 34c0-7 4.5-10.5 11-10.5s11 3.5 11 10.5" fill="#F8FAFC" />
            </svg>
          ),
        };
    }
  };

  const config = getRoleConfig(role);

  return (
    <div
      className={`relative inline-flex shrink-0 ${sizeMap} ${className} ${
        animated ? "animate-avatar-breathe" : ""
      } group`}
      title={`${name} — ${config.label}`}
    >
      {/* Liquid Glass Avatar Frame */}
      <div
        className={`w-full h-full rounded-2xl bg-gradient-to-tr ${config.gradient} ${config.border} ${config.shadow} border p-0.5 overflow-hidden transition-all duration-300 group-hover:scale-105`}
      >
        <div className="w-full h-full rounded-[14px] bg-[#071A33]/85 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
          {/* Subtle Glass light sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />

          {/* Role-specific digital character SVG */}
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          ) : (
            <div className="w-full h-full p-0.5">{config.svg}</div>
          )}
        </div>
      </div>

      {/* Online / Active Pulse Badge */}
      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#071A33] ${
            statusOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
          }`}
        />
      )}
    </div>
  );
};
