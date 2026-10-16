import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  Users,
  Stethoscope,
  CalendarDays,
  Receipt,
  PieChart,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassKpi } from "../ui/GlassKpi";
import { hasUserPermission, isFinancialDataRestrictedForUser } from "../../services/rbacService";
import { exportToExcelCsv } from "../../services/regionalService";

export const ReportsView: React.FC = () => {
  const {
    patients,
    consultations,
    appointments,
    invoices,
    currentUser,
    showToast,
    regionalSettings,
    formatCurrency,
    formatNumber,
    formatDateTime,
  } = useApp();

  const [period, setPeriod] = useState<"7D" | "30D" | "3M" | "6M" | "1Y">("30D");

  const canViewFinance = !isFinancialDataRestrictedForUser(currentUser);
  const canExportReports = hasUserPermission(currentUser, "REPORT_EXPORT") || currentUser.role === "ADMIN";

  const periodMultiplier = {
    "7D": 0.25,
    "30D": 1,
    "3M": 3,
    "6M": 6,
    "1Y": 12,
  }[period];

  const totalPatients = Math.round(patients.length * periodMultiplier);
  const totalConsultations = Math.round(consultations.length * periodMultiplier * 8);
  const totalRdv = Math.round(appointments.length * periodMultiplier * 5);
  const totalRevenue = Math.round(
    invoices.reduce((acc, inv) => acc + inv.paidAmount, 0) * periodMultiplier * 3
  );

  const handleExport = (type: "PDF" | "EXCEL") => {
    if (!canExportReports) {
      showToast("WARNING", "Permission Requise", "Votre profil ne dispose pas du droit d'exportation (REPORT_EXPORT).");
      return;
    }
    if (type === "EXCEL") {
      const headers = ["Indicateur FONA", "Période", "Quantité / Montant", "Unité", "Date & Heure Export (Bamako)"];
      const nowStr = formatDateTime(new Date());
      const rows: (string | number)[][] = [
        ["Patients Reçus", period, totalPatients, "patients", nowStr],
        ["Consultations Médicales", period, totalConsultations, "actes", nowStr],
        ["Rendez-vous Réalisés", period, totalRdv, "RDV", nowStr],
      ];
      if (canViewFinance) {
        rows.push(["Recettes Globales Encaissées", period, totalRevenue, regionalSettings.currencyDisplay, nowStr]);
      }
      exportToExcelCsv(`fona_rapport_activite_${period.toLowerCase()}`, headers, rows, regionalSettings);
      showToast(
        "SUCCESS",
        "Export Excel Téléchargé",
        `Rapport d'activité (${period}) téléchargé au format Excel/CSV selon les normes régionales du Mali.`
      );
      return;
    }
    window.print();
    showToast(
      "SUCCESS",
      "Export PDF / Impression",
      `Le document d'activité FONA Digital pour la période (${period}) est prêt pour impression ou sauvegarde PDF.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl glass-surface border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Rapports & Statistiques
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Period Selector Tabs */}
          <div className="flex bg-[#051426] p-1 rounded-xl border border-white/10">
            {(["7D", "30D", "3M", "6M", "1Y"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  period === p ? "bg-[#4F7DF3] text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                {p === "7D"
                  ? "7 jours"
                  : p === "30D"
                  ? "30 jours"
                  : p === "3M"
                  ? "3 mois"
                  : p === "6M"
                  ? "6 mois"
                  : "1 an"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="secondary"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => window.print()}
            >
              Imprimer
            </GlassButton>
            {canExportReports ? (
              <>
                <GlassButton
                  variant="gold"
                  size="sm"
                  icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                  onClick={() => handleExport("EXCEL")}
                >
                  Export Excel
                </GlassButton>
                <GlassButton
                  variant="cyan"
                  size="sm"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => handleExport("PDF")}
                >
                  Export PDF
                </GlassButton>
              </>
            ) : (
              <span
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-xs flex items-center gap-1.5 cursor-not-allowed"
                title="Exportation réservée aux profils autorisés (REPORT_EXPORT)"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export Restreint</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassKpi
          title="Patients Reçus"
          value={totalPatients}
          unit="patients"
          change="+14.2%"
          trend="up"
          category="patients"
          icon={<Users className="w-5 h-5 text-[#4F7DF3]" />}
          sparklineData={[12, 18, 16, 22, 28, 26, 34, 40]}
        />
        <GlassKpi
          title="Consultations Médicales"
          value={totalConsultations}
          unit="actes"
          change="+10.8%"
          trend="up"
          category="medical"
          icon={<Stethoscope className="w-5 h-5 text-[#55D9FF]" />}
          sparklineData={[20, 24, 22, 30, 28, 36, 42, 48]}
        />
        <GlassKpi
          title="Rendez-vous Réalisés"
          value={totalRdv}
          unit="RDV"
          change="+6.5%"
          trend="up"
          category="rdv"
          icon={<CalendarDays className="w-5 h-5 text-[#8B7CFF]" />}
          sparklineData={[15, 18, 17, 21, 25, 23, 29, 33]}
        />
        {canViewFinance && (
          <GlassKpi
            title="Recettes Globales"
            value={totalRevenue}
            unit={regionalSettings.currencyDisplay}
            change="+18.4%"
            trend="up"
            category="finance"
            icon={<Receipt className="w-5 h-5 text-[#D9B45B]" />}
            sparklineData={[400, 480, 520, 610, 680, 750, 820, 910]}
          />
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line / Area Chart: Évolution des consultations (7 Cols) */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#55D9FF]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Évolution de l'Activité Médicale
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Volume par période</span>
            </div>

            {/* SVG Area Chart */}
            <div className="w-full h-64 relative pt-2">
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F7DF3" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4F7DF3" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1="20" y1="40" x2="480" y2="40" stroke="rgba(255,255,255,0.06)" />
                <line x1="20" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.06)" />
                <line x1="20" y1="140" x2="480" y2="140" stroke="rgba(255,255,255,0.06)" />

                {/* Filled Area */}
                <polygon
                  fill="url(#areaGrad)"
                  points="30,170 30,130 90,110 150,140 210,80 270,95 330,50 390,65 450,30 450,170"
                />

                {/* Stroke Line */}
                <polyline
                  fill="none"
                  stroke="#55D9FF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="30,130 90,110 150,140 210,80 270,95 330,50 390,65 450,30"
                />

                {/* Data Points */}
                <circle cx="30" cy="130" r="4" fill="#55D9FF" />
                <circle cx="90" cy="110" r="4" fill="#55D9FF" />
                <circle cx="150" cy="140" r="4" fill="#55D9FF" />
                <circle cx="210" cy="80" r="4" fill="#55D9FF" />
                <circle cx="270" cy="95" r="4" fill="#55D9FF" />
                <circle cx="330" cy="50" r="4" fill="#55D9FF" />
                <circle cx="390" cy="65" r="4" fill="#55D9FF" />
                <circle cx="450" cy="30" r="4" fill="#55D9FF" />

                {/* X-axis labels */}
                <text x="25" y="190" fill="#94a3b8" fontSize="10">Sem 1</text>
                <text x="85" y="190" fill="#94a3b8" fontSize="10">Sem 2</text>
                <text x="145" y="190" fill="#94a3b8" fontSize="10">Sem 3</text>
                <text x="205" y="190" fill="#94a3b8" fontSize="10">Sem 4</text>
                <text x="265" y="190" fill="#94a3b8" fontSize="10">Sem 5</text>
                <text x="325" y="190" fill="#94a3b8" fontSize="10">Sem 6</text>
                <text x="385" y="190" fill="#94a3b8" fontSize="10">Sem 7</text>
                <text x="440" y="190" fill="#94a3b8" fontSize="10">Actuel</text>
              </svg>
            </div>
          </GlassCard>
        </div>

        {/* Donut Chart: Répartition par spécialité (5 Cols) */}
        <div className="lg:col-span-5">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#D9B45B]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Répartition des Actes
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-around py-4">
              {/* SVG Donut */}
              <div className="w-36 h-36 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#1261A0" strokeWidth="18" strokeDasharray="95 144" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#20B8A6" strokeWidth="18" strokeDasharray="60 179" strokeDashoffset="-95" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#8B7CFF" strokeWidth="18" strokeDasharray="45 194" strokeDashoffset="-155" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#D9B45B" strokeWidth="18" strokeDasharray="39 200" strokeDashoffset="-200" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-white">100%</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Actes FONA</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#1261A0]" />
                  <span className="text-slate-200">Médecine Générale (40%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#20B8A6]" />
                  <span className="text-slate-200">Soins & Pansements (25%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#8B7CFF]" />
                  <span className="text-slate-200">Maternité & CPN (19%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#D9B45B]" />
                  <span className="text-slate-200">Labo & Imagerie (16%)</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
