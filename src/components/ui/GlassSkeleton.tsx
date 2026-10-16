import React from "react";

export type SkeletonVariant =
  | "text"
  | "rectangular"
  | "circular"
  | "card"
  | "kpi"
  | "table-row"
  | "timeline-item";

interface GlassSkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export const GlassSkeleton: React.FC<GlassSkeletonProps> = ({
  variant = "rectangular",
  width,
  height,
  className = "",
  count = 1,
}) => {
  const renderSingleSkeleton = (key: number) => {
    switch (variant) {
      case "circular":
        return (
          <div
            key={key}
            style={{ width: width || 40, height: height || 40 }}
            className={`fona-skeleton-glass rounded-full shrink-0 ${className}`}
          />
        );

      case "text":
        return (
          <div
            key={key}
            style={{ width: width || "100%", height: height || 14 }}
            className={`fona-skeleton-glass rounded-md ${className}`}
          />
        );

      case "kpi":
        return (
          <div
            key={key}
            className={`p-5 rounded-2xl glass-surface border border-[var(--border)] space-y-3 ${className}`}
          >
            <div className="flex items-center justify-between">
              <div className="w-24 h-3.5 fona-skeleton-glass rounded-md" />
              <div className="w-8 h-8 fona-skeleton-glass rounded-xl" />
            </div>
            <div className="w-32 h-7 fona-skeleton-glass rounded-lg" />
            <div className="w-20 h-3 fona-skeleton-glass rounded-md" />
          </div>
        );

      case "card":
        return (
          <div
            key={key}
            className={`p-5 rounded-2xl glass-surface border border-[var(--border)] space-y-4 ${className}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 fona-skeleton-glass rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="w-1/3 h-4 fona-skeleton-glass rounded-md" />
                <div className="w-1/4 h-3 fona-skeleton-glass rounded-md" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="w-full h-3.5 fona-skeleton-glass rounded-md" />
              <div className="w-4/5 h-3.5 fona-skeleton-glass rounded-md" />
              <div className="w-2/3 h-3.5 fona-skeleton-glass rounded-md" />
            </div>
          </div>
        );

      case "table-row":
        return (
          <div
            key={key}
            className={`p-3.5 rounded-xl border border-[var(--border)] flex items-center justify-between gap-4 ${className}`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 fona-skeleton-glass rounded-lg shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="w-1/4 h-3.5 fona-skeleton-glass rounded-md" />
                <div className="w-1/6 h-2.5 fona-skeleton-glass rounded-md" />
              </div>
            </div>
            <div className="w-16 h-4 fona-skeleton-glass rounded-md" />
            <div className="w-20 h-6 fona-skeleton-glass rounded-lg" />
          </div>
        );

      case "timeline-item":
        return (
          <div key={key} className={`flex items-start gap-3 ${className}`}>
            <div className="w-3 h-3 rounded-full fona-skeleton-glass shrink-0 mt-1.5" />
            <div className="p-3.5 rounded-xl border border-[var(--border)] flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-24 h-4 fona-skeleton-glass rounded-md" />
                <div className="w-16 h-3 fona-skeleton-glass rounded-md" />
              </div>
              <div className="w-3/4 h-3 fona-skeleton-glass rounded-md" />
            </div>
          </div>
        );

      case "rectangular":
      default:
        return (
          <div
            key={key}
            style={{ width, height: height || 48 }}
            className={`fona-skeleton-glass rounded-xl ${className}`}
          />
        );
    }
  };

  if (count > 1) {
    return (
      <div className="space-y-2 w-full">
        {Array.from({ length: count }).map((_, i) => renderSingleSkeleton(i))}
      </div>
    );
  }

  return renderSingleSkeleton(0);
};
