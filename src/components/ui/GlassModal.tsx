import React, { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  footer?: ReactNode;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = "xl",
  footer,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop Flouté Progressif (Multi-Layer Blur Expansion) */}
      <div
        className="fixed inset-0 bg-[#020b17]/80 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface Niveau 3 (Élévation Optique Majeure & Profondeur Organique 220ms) */}
      <div
        className={`relative w-full ${maxWidthStyles} my-8 rounded-3xl glass-level-3 bg-[var(--surface-elevated)]/98 dark:bg-[#081b30]/96 border border-[var(--border)] dark:border-white/16 shadow-[0_30px_90px_rgba(0,0,0,0.65)] z-10 flex flex-col max-h-[90vh] animate-fona-modal text-[var(--text-primary)] overflow-hidden`}
        role="dialog"
        aria-modal="true"
      >
        {/* Reflet spéculaire zénithal biseauté (Specular Sheen) */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

        {/* Header avec icône et fermeture fluide */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[var(--border)] shrink-0 bg-[var(--surface-subtle)]/30">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/25 text-[#1261A0] dark:text-[#55D9FF] flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 hover:scale-105">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer"
            aria-label="Fermer la fenêtre"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content avec défilement amorti */}
        <div className="p-6 overflow-y-auto space-y-5 text-[var(--text-primary)]">
          {children}
        </div>

        {/* Footer avec verre d'assise */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-subtle)]/50 shrink-0 rounded-b-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
