import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
  unit?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  icon,
  hint,
  unit,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-[var(--glass-input-bg)] text-[var(--glass-input-text)] placeholder:text-[var(--glass-input-placeholder)] text-sm rounded-xl border transition-all duration-200 py-2.5 ${
            icon ? "pl-10" : "pl-3.5"
          } ${unit ? "pr-12" : "pr-3.5"} ${
            error
              ? "border-rose-500/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20"
              : "border-[var(--glass-input-border)] focus:border-[#1261A0] dark:focus:border-[#55D9FF] focus:ring-2 focus:ring-[#1261A0]/20 dark:focus:ring-[#55D9FF]/20"
          } focus:outline-none ${className}`}
          {...props}
        />
        {unit && (
          <span className="absolute right-3.5 text-xs font-medium text-[var(--text-secondary)] pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</span>}
      {hint && !error && <span className="text-[11px] text-[var(--text-secondary)]">{hint}</span>}
    </div>
  );
};

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  error,
  hint,
  options,
  className = "",
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-[var(--glass-input-bg)] text-[var(--glass-input-text)] text-sm rounded-xl border border-[var(--glass-input-border)] py-2.5 px-3.5 transition-all duration-200 focus:border-[#1261A0] dark:focus:border-[#55D9FF] focus:ring-2 focus:ring-[#1261A0]/20 dark:focus:ring-[#55D9FF]/20 focus:outline-none cursor-pointer ${
          error ? "border-rose-500/60" : ""
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-500 dark:text-rose-400">{error}</span>}
      {hint && !error && <span className="text-[11px] text-[var(--text-secondary)]">{hint}</span>}
    </div>
  );
};

interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const GlassTextarea: React.FC<GlassTextareaProps> = ({
  label,
  error,
  hint,
  className = "",
  id,
  rows = 3,
  ...props
}) => {
  const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={areaId} className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        rows={rows}
        className={`w-full bg-[var(--glass-input-bg)] text-[var(--glass-input-text)] placeholder:text-[var(--glass-input-placeholder)] text-sm rounded-xl border transition-all duration-200 p-3.5 ${
          error
            ? "border-rose-500/60 focus:border-rose-400"
            : "border-[var(--glass-input-border)] focus:border-[#1261A0] dark:focus:border-[#55D9FF] focus:ring-2 focus:ring-[#1261A0]/20 dark:focus:ring-[#55D9FF]/20"
        } focus:outline-none resize-none ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 dark:text-rose-400">{error}</span>}
      {hint && !error && <span className="text-[11px] text-[var(--text-secondary)]">{hint}</span>}
    </div>
  );
};
