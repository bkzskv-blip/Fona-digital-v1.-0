import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const GlassToastContainer: React.FC = () => {
  const { toasts, dismissToast, resolvedTheme } = useApp();

  if (toasts.length === 0) return null;

  const isLight = resolvedTheme === "light";

  return (
    <div className="fixed top-5 right-5 z-[150] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const config = {
          SUCCESS: {
            border: isLight ? "border-emerald-500/40" : "border-emerald-500/35",
            bg: isLight ? "bg-white/95" : "bg-[#041c15]/95",
            textColor: isLight ? "text-emerald-900" : "text-emerald-200",
            icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
            progressBar: "bg-emerald-500",
          },
          WARNING: {
            border: isLight ? "border-amber-500/40" : "border-amber-500/35",
            bg: isLight ? "bg-white/95" : "bg-[#241703]/95",
            textColor: isLight ? "text-amber-900" : "text-amber-200",
            icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
            progressBar: "bg-amber-500",
          },
          ERROR: {
            border: isLight ? "border-rose-500/40" : "border-rose-500/35",
            bg: isLight ? "bg-white/95" : "bg-[#240810]/95",
            textColor: isLight ? "text-rose-900" : "text-rose-200",
            icon: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />,
            progressBar: "bg-rose-500",
          },
          INFO: {
            border: isLight ? "border-blue-500/40" : "border-cyan-500/35",
            bg: isLight ? "bg-white/95" : "bg-[#061c33]/95",
            textColor: isLight ? "text-[#071A33]" : "text-cyan-200",
            icon: <Info className="w-4 h-4 text-[#1261A0] dark:text-[#55D9FF] shrink-0 mt-0.5" />,
            progressBar: "bg-[#1261A0] dark:bg-[#55D9FF]",
          },
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden p-3.5 rounded-2xl border ${config.border} ${config.bg} backdrop-blur-2xl shadow-[0_14px_35px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.55)] flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-top-2 fade-in`}
          >
            {/* Specular sheen reflection */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent pointer-events-none" />

            {config.icon}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className={`text-xs font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {toast.title}
              </h4>
              <p className={`text-[11px] mt-0.5 leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-120 active:scale-95 shrink-0 cursor-pointer"
              aria-label="Fermer la notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Micro Auto-Dismiss progress line */}
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-black/5 dark:bg-white/10">
              <div
                className={`h-full ${config.progressBar} transition-all`}
                style={{
                  animation: "toastProgress 4.5s linear forwards",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
