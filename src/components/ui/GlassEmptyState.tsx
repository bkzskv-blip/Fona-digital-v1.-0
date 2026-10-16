import React from "react";
import { GlassCard } from "./GlassCard";
import { GlassButton } from "./GlassButton";

interface GlassEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const GlassEmptyState: React.FC<GlassEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}) => {
  return (
    <GlassCard className={`p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto ${className}`}>
      {/* Icon Capsule with Liquid Glass Depth */}
      <div className="w-14 h-14 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-inner transition-transform duration-220 hover:scale-105">
        {icon}
      </div>

      <div className="space-y-1.5 max-w-md">
        <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
          {actionLabel && onAction && (
            <GlassButton
              variant="primary"
              size="sm"
              icon={actionIcon}
              onClick={onAction}
            >
              {actionLabel}
            </GlassButton>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </GlassButton>
          )}
        </div>
      )}
    </GlassCard>
  );
};
