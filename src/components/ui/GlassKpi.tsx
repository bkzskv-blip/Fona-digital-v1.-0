import React, { ReactNode, useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface GlassKpiProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  category?: "patients" | "medical" | "rdv" | "finance" | "default";
  icon: ReactNode;
  sparklineData?: number[];
  onClick?: () => void;
  onRemove?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

export const GlassKpi: React.FC<GlassKpiProps> = ({
  title,
  value,
  unit,
  change,
  trend = "up",
  category = "default",
  icon,
  sparklineData = [12, 19, 15, 25, 22, 30, 28, 38],
  onClick,
  onRemove,
  onMoveLeft,
  onMoveRight,
}) => {
  const { animationMode, formatNumber } = useApp();
  const numericTarget = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, "")) || 0;
  const isNumeric = typeof value === "number" || (!isNaN(numericTarget) && numericTarget > 0);

  // Animated increment counter
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    if (!isNumeric) return;
    if (animationMode === "disabled") {
      setDisplayValue(numericTarget);
      return;
    }

    const duration = animationMode === "reduced" ? 300 : 900;
    const startTimestamp = performance.now();
    let frameId: number;

    const step = (timestamp: number) => {
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easeProgress * numericTarget);
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [numericTarget, animationMode, isNumeric]);

  const categoryConfig = {
    patients: {
      iconBg: "bg-blue-500/15 border-blue-400/30 text-[#4F7DF3]",
      stroke: "#4F7DF3",
      halo: "bg-blue-500/10",
      hoverBorder: "group-hover:border-[#4F7DF3]/40",
      glow: "hover:shadow-[0_16px_40px_rgba(79,125,243,0.22)]",
      gradientId: "sparkline-pat",
    },
    medical: {
      iconBg: "bg-cyan-500/15 border-cyan-400/30 text-[#55D9FF]",
      stroke: "#55D9FF",
      halo: "bg-cyan-500/10",
      hoverBorder: "group-hover:border-cyan-400/40",
      glow: "hover:shadow-[0_16px_40px_rgba(85,217,255,0.22)]",
      gradientId: "sparkline-med",
    },
    rdv: {
      iconBg: "bg-violet-500/15 border-violet-400/30 text-[#8B7CFF]",
      stroke: "#8B7CFF",
      halo: "bg-violet-500/10",
      hoverBorder: "group-hover:border-violet-400/40",
      glow: "hover:shadow-[0_16px_40px_rgba(139,124,255,0.22)]",
      gradientId: "sparkline-rdv",
    },
    finance: {
      iconBg: "bg-[#D9B45B]/15 border-[#D9B45B]/30 text-[#D9B45B]",
      stroke: "#D9B45B",
      halo: "bg-[#D9B45B]/10",
      hoverBorder: "group-hover:border-[#D9B45B]/40",
      glow: "hover:shadow-[0_16px_40px_rgba(217,180,91,0.25)]",
      gradientId: "sparkline-fin",
    },
    default: {
      iconBg: "bg-teal-500/15 border-teal-400/30 text-[#20B8A6]",
      stroke: "#20B8A6",
      halo: "bg-teal-500/10",
      hoverBorder: "group-hover:border-teal-400/40",
      glow: "hover:shadow-[0_16px_40px_rgba(32,184,166,0.22)]",
      gradientId: "sparkline-def",
    },
  }[category];

  // SVG sparkline path
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 110;
  const height = 36;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Closed polygon for liquid area under sparkline
  const firstPointX = 0;
  const lastPointX = width;
  const areaPoints = `${points} ${lastPointX},${height} ${firstPointX},${height}`;

  return (
    <div
      onClick={onClick}
      className={`glass-surface glass-level-2 glass-interactive rounded-2xl p-5 border border-[var(--border)] ${categoryConfig.hoverBorder} ${categoryConfig.glow} ${
        onClick ? "cursor-pointer" : ""
      } flex flex-col justify-between relative overflow-hidden group select-none`}
    >
      {/* 1. Halo lumineux d'ambiance FONA spécifique à la catégorie */}
      <div
        className={`absolute -top-10 -right-10 w-36 h-36 ${categoryConfig.halo} rounded-full blur-3xl pointer-events-none group-hover:scale-130 transition-transform duration-500`}
        aria-hidden="true"
      />

      {/* 2. Reflet spéculaire 120° biseauté (Liquid Glass 2.0) */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden -z-0 opacity-70 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/18 dark:from-white/10 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* 3. En-tête : Titre, Commandes & Icône Flottante */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] line-clamp-1 flex-1">
          {title}
        </span>

        {/* Boutons d'action au survol (réorganisation / retrait) */}
        <div className="flex items-center gap-1">
          {(onMoveLeft || onMoveRight || onRemove) && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-[var(--surface-solid)]/90 backdrop-blur-md rounded-lg p-0.5 border border-[var(--border)] mr-1">
              {onMoveLeft && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveLeft();
                  }}
                  className="p-1 rounded hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  title="Déplacer à gauche"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}
              {onMoveRight && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveRight();
                  }}
                  className="p-1 rounded hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  title="Déplacer à droite"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="p-1 rounded hover:bg-rose-500/15 text-rose-500 cursor-pointer"
                  title="Masquer cet indicateur"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Icône Flottante dans son écrin de verre accentué */}
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${categoryConfig.iconBg} shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_16px_rgba(85,217,255,0.25)]`}
          >
            {icon}
          </div>
        </div>
      </div>

      {/* 4. Valeur Principale du KPI avec compte progressif fluide */}
      <div className="relative z-10 flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight font-mono tabular-nums">
          {isNumeric && typeof value === "number"
            ? formatNumber(displayValue)
            : value}
        </span>
        {unit && <span className="text-xs font-bold text-[var(--text-secondary)] font-sans">{unit}</span>}
      </div>

      {/* 5. Tendance & Sparkline Liquide Dynamique */}
      <div className="relative z-10 flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[var(--border)]">
        {change ? (
          <div className="flex items-center gap-1.5 text-xs">
            {trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />}
            {trend === "neutral" && <Minus className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />}
            <span
              className={`font-bold tabular-nums ${
                trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trend === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {change}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">vs mois dernier</span>
          </div>
        ) : (
          <span className="text-[11px] text-[var(--text-muted)]">Données en direct</span>
        )}

        {/* Mini Sparkline avec dégradé liquide de remplissage */}
        <div className="w-[88px] h-[26px] opacity-85 group-hover:opacity-100 transition-opacity shrink-0">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={categoryConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={categoryConfig.stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={categoryConfig.stroke} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <polygon fill={`url(#${categoryConfig.gradientId})`} points={areaPoints} />
            <polyline
              fill="none"
              stroke={categoryConfig.stroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
