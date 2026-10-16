import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2, Check } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "gold" | "danger" | "ghost" | "cyan" | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  success?: boolean;
  successText?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  success = false,
  successText,
  className = "",
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-5 py-2.5 text-base rounded-2xl gap-2.5",
  }[size];

  // Micro-interactions physiques Liquid Glass FONA (Hover 140ms, Press 90ms)
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-[#1261A0] to-[#4F7DF3] hover:from-[#1670b8] hover:to-[#5c88f7] text-white border border-cyan-400/40 shadow-[0_4px_16px_rgba(18,97,160,0.25),inset_0_1px_0_rgba(255,255,255,0.30)]",
    secondary:
      "glass-btn-secondary bg-white/[0.08] dark:bg-white/[0.08] text-[var(--text-primary)] border border-[var(--border)] backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:border-cyan-400/40",
    gold:
      "bg-gradient-to-r from-[#D9B45B] to-[#F2D27E] hover:brightness-105 text-[#071A33] font-bold border border-amber-300/60 shadow-[0_4px_18px_rgba(217,180,91,0.35),inset_0_1px_0_rgba(255,255,255,0.45)]",
    cyan:
      "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 border border-cyan-400/45 shadow-[0_4px_16px_rgba(85,217,255,0.2),inset_0_1px_0_rgba(255,255,255,0.25)]",
    subtle:
      "glass-btn-subtle bg-white/[0.04] dark:bg-white/[0.04] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] shadow-xs",
    danger:
      "bg-rose-500/18 hover:bg-rose-500/28 text-rose-600 dark:text-rose-300 border border-rose-500/35 shadow-[0_4px_14px_rgba(244,63,94,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]",
    ghost:
      "bg-transparent hover:bg-white/[0.06] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent",
  }[variant];

  // Success Feedback State (Micro-animation 140ms avec halo émeraude)
  if (success) {
    return (
      <button
        disabled={true}
        className={`fona-btn-interactive inline-flex items-center justify-center font-medium select-none bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.3)] ${sizeStyles} ${className}`}
        {...props}
      >
        <Check className="w-4 h-4 text-emerald-400 animate-fona-check-pop" />
        <span>{successText || children}</span>
      </button>
    );
  }

  return (
    <button
      disabled={disabled || loading}
      className={`fona-btn-interactive fona-sheen-target inline-flex items-center justify-center font-medium select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0 transition-transform duration-150 group-hover:scale-105">{icon}</span>
      )}
      <span className="truncate">{children}</span>
    </button>
  );
};
