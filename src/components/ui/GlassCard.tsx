import React, { ReactNode } from "react";

export type GlassCardVariant = "standard" | "subtle" | "active" | "gold" | "clinical" | "solid";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: GlassCardVariant;
  glow?: boolean;
  specular?: boolean;
  interactive?: boolean;
  depth?: 1 | 2 | 3 | 4;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  variant = "standard",
  glow = false,
  specular = true,
  interactive = false,
  depth = 2,
  onClick,
}) => {
  const variantStyles: Record<GlassCardVariant, string> = {
    standard: "glass-surface hover:border-[var(--border-active)]",
    subtle: "glass-surface-subtle hover:border-[var(--border)]",
    active: "glass-surface-active",
    gold: "glass-gold-active",
    clinical: "glass-surface border-[var(--border)] hover:border-[var(--border-active)]",
    solid: "glass-clinical-solid",
  };

  const depthClass = {
    1: "glass-level-1",
    2: "glass-level-2",
    3: "glass-level-3",
    4: "glass-level-4",
  }[depth];

  const glowStyle = glow ? (variant === "gold" ? "glass-glow-gold" : "glass-glow-cyan") : "";
  const interactiveStyle = interactive || onClick ? "glass-interactive cursor-pointer" : "";

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl fona-surface-transition ${variantStyles[variant]} ${depthClass} ${glowStyle} ${interactiveStyle} ${className}`}
    >
      {/* Reflet spéculaire subtil (Matière réelle en verre biseauté) */}
      {specular && variant !== "solid" && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden -z-0 opacity-80"
          aria-hidden="true"
        >
          {/* Lumière spéculaire zénithale 120deg */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 dark:from-white/10 via-transparent to-transparent" />
          {/* Contre-lumière très douce biseautée au bas */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 dark:via-white/08 to-transparent" />
        </div>
      )}

      {/* Contenu de la carte */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
