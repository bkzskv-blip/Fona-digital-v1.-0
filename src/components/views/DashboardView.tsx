import React, { useState, useMemo } from "react";
import {
  Users,
  Stethoscope,
  CalendarDays,
  Receipt,
  HeartHandshake,
  Baby,
  Activity,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Printer,
  Sparkles,
  Thermometer,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle2,
  Filter,
  TestTube2,
  FileScan,
  Plus,
  Coins,
  CreditCard,
  Smartphone,
  Banknote,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Layers,
  ArrowDownRight,
  UserPlus,
  Syringe,
  Zap,
  Search,
  CalendarPlus,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import { useApp } from "../../context/AppContext";
import { formatNumber, formatCurrency, formatDate, formatTime, formatDateTime } from "../../services/regionalService";
import { GlassKpi } from "../ui/GlassKpi";
import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { ROLE_LABELS, hasPermission } from "../../services/rbacService";
import { GlassAvatar } from "../ui/GlassAvatar";
import { DashboardWidgetId } from "../../types";
import { getDefaultWidgetsForRole } from "../../services/dashboardWidgetService";
import { hasUserPermission, isFinancialDataRestrictedForUser } from "../../services/rbacService";
import { CustomizeDashboardModal } from "../modals/CustomizeDashboardModal";
import { GlassModal } from "../ui/GlassModal";
import { GlassInput, GlassSelect, GlassTextarea } from "../ui/GlassFormControls";

// Custom Liquid Glass Tooltip for Recharts (adaptive in light & dark modes)
const CustomGlassTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isLightMode = typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "light";
    return (
      <div
        className={`rounded-xl p-3 backdrop-blur-xl shadow-2xl text-xs space-y-1.5 z-50 transition-colors ${
          isLightMode
            ? "bg-white/95 border border-slate-200/90 text-[#071A33] shadow-[0_12px_30px_rgba(7,26,51,0.12)]"
            : "bg-[#071A33]/90 border border-white/20 text-white shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
        }`}
      >
        <div
          className={`font-bold border-b pb-1 flex items-center justify-between gap-4 ${
            isLightMode ? "text-[#071A33] border-slate-200" : "text-white border-white/10"
          }`}
        >
          <span>{label}</span>
          <span className={`text-[10px] font-mono ${isLightMode ? "text-[#1261A0]" : "text-cyan-300"}`}>CM FONA</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div
            key={`item-${index}`}
            className={`flex items-center justify-between gap-4 font-mono ${
              isLightMode ? "text-slate-600" : "text-slate-300"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className={`text-[11px] font-sans ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>
                {entry.name} :
              </span>
            </div>
            <span className={`font-bold tabular-nums ${isLightMode ? "text-[#071A33]" : "text-white"}`}>
              {typeof entry.value === "number" ? formatNumber(entry.value) : entry.value}
              {entry.unit ? ` ${entry.unit}` : ""}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    currentSite,
    patients,
    visits,
    addVisit,
    updateVisitStatus,
    addPatient,
    consultations,
    appointments,
    addAppointment,
    updateAppointmentStatus,
    invoices,
    addInvoice,
    addPayment,
    cares,
    pregnancies,
    prenatalVisits,
    labRequests,
    imagingRequests,
    setActiveTab,
    selectedPatientId,
    setSelectedPatientId,
    setPrintableDoc,
    animationMode,
    showToast,
    resolvedTheme,
    regionalSettings,
  } = useApp();

  const isLight = resolvedTheme === "light";
  const chartGridStroke = isLight ? "rgba(7, 26, 51, 0.12)" : "rgba(255, 255, 255, 0.06)";
  const chartAxisStroke = isLight ? "#42546A" : "#64748B";

  // Direct In-Context Action Modals on Dashboard
  // Quick Patient Search in Direct Action Space
  const [quickPatientSearch, setQuickPatientSearch] = useState("");
  const [isQuickSearchFocused, setIsQuickSearchFocused] = useState(false);

  // Quick Patient Search Results
  const quickSearchResults = useMemo(() => {
    const q = quickPatientSearch.trim().toLowerCase();
    if (!q) return [];
    return patients
      .filter((p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.patientCode.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q))
      )
      .slice(0, 5);
  }, [patients, quickPatientSearch]);

  // Direct In-Context Action Modals on Dashboard
  const [isDirectAdmissionOpen, setIsDirectAdmissionOpen] = useState(false);
  const [admissionPatientId, setAdmissionPatientId] = useState(patients[0]?.id || "");
  const [admissionType, setAdmissionType] = useState<"CONSULTATION" | "SOIN" | "MATERNITE" | "LABORATOIRE" | "IMAGERIE" | "URGENCE">("CONSULTATION");
  const [admissionPriority, setAdmissionPriority] = useState<"NORMALE" | "URGENTE">("NORMALE");
  const [admissionNotes, setAdmissionNotes] = useState("");

  const [isExpressPatientOpen, setIsExpressPatientOpen] = useState(false);
  const [expressLastName, setExpressLastName] = useState("");
  const [expressFirstName, setExpressFirstName] = useState("");
  const [expressSex, setExpressSex] = useState<"FEMALE" | "MALE">("FEMALE");
  const [expressAge, setExpressAge] = useState("");
  const [expressPhone, setExpressPhone] = useState("");
  const [expressAddress, setExpressAddress] = useState("");
  const [expressAutoAdmit, setExpressAutoAdmit] = useState(true);
  const [expressDuplicateIgnored, setExpressDuplicateIgnored] = useState(false);

  // Real-time duplicate check for patient creation
  const potentialDuplicatePatient = useMemo(() => {
    const phoneClean = expressPhone.replace(/[\s\-\+\.]/g, "");
    const nomClean = expressLastName.trim().toLowerCase();
    const prenomClean = expressFirstName.trim().toLowerCase();

    if (!nomClean && phoneClean.length < 5) return null;

    return patients.find((p) => {
      const pPhoneClean = (p.phone || "").replace(/[\s\-\+\.]/g, "");
      const matchPhone = phoneClean.length >= 6 && pPhoneClean.length >= 6 && (pPhoneClean.includes(phoneClean) || phoneClean.includes(pPhoneClean));
      const matchName = nomClean.length >= 2 && prenomClean.length >= 2 &&
        p.lastName.toLowerCase().trim() === nomClean &&
        p.firstName.toLowerCase().trim() === prenomClean;
      return matchPhone || matchName;
    }) || null;
  }, [patients, expressLastName, expressFirstName, expressPhone]);

  // Direct Appointment Modal State
  const [isDirectAppointmentOpen, setIsDirectAppointmentOpen] = useState(false);
  const [directRdvPatientId, setDirectRdvPatientId] = useState(patients[0]?.id || "");
  const [directRdvDate, setDirectRdvDate] = useState(new Date().toISOString().split("T")[0]);
  const [directRdvTime, setDirectRdvTime] = useState("10:00");
  const [directRdvMotif, setDirectRdvMotif] = useState("Consultation de suivi médical");
  const [directRdvPractitionerId, setDirectRdvPractitionerId] = useState("usr-practitioner");

  const [isDirectPaymentOpen, setIsDirectPaymentOpen] = useState(false);
  const [directPaymentInvoiceId, setDirectPaymentInvoiceId] = useState(invoices[0]?.id || "");
  const [directPaymentAmount, setDirectPaymentAmount] = useState("");
  const [directPaymentMethod, setDirectPaymentMethod] = useState<"ESPECES" | "MOBILE_MONEY" | "CARTE">("MOBILE_MONEY");

  // Handler for Direct Admission
  const handleExecuteDirectAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === admissionPatientId) || patients[0];
    if (!pat) return;

    const queuePrefix = admissionType === "CONSULTATION" ? "A" : admissionType === "SOIN" ? "S" : "M";
    const queueNum = `${queuePrefix}-${Math.floor(10 + Math.random() * 89)}`;

    addVisit({
      patientId: pat.id,
      siteId: currentSite.id,
      type: admissionType,
      status: "EN_COURS",
      queueNumber: queueNum,
      priority: admissionPriority,
      createdById: currentUser.id,
      createdByName: currentUser.fullName,
      notes: admissionNotes || `Admission directe Dashboard FONA`,
    });

    setIsDirectAdmissionOpen(false);
    setAdmissionNotes("");
    showToast("SUCCESS", "Admission Effectuée", `Ticket ${queueNum} émis pour ${pat.lastName.toUpperCase()} ${pat.firstName}`);
  };

  // Handler for Express Patient Creation with Anti-duplication Guard
  const handleExecuteExpressPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expressLastName.trim() || !expressFirstName.trim()) {
      showToast("WARNING", "Champs requis", "Le prénom et le nom sont obligatoires.");
      return;
    }

    if (potentialDuplicatePatient && !expressDuplicateIgnored) {
      showToast("WARNING", "Doublon potentiel détecté", "Ce patient semble déjà posséder un dossier permanent. Veuillez confirmer ou ouvrir le dossier existant.");
      return;
    }

    const currentYear = new Date().getFullYear();
    const ageNum = parseInt(expressAge, 10);
    const birthYear = !isNaN(ageNum) && ageNum > 0 ? currentYear - ageNum : 1995;
    const computedBirthDate = `${birthYear}-01-01`;

    const newPat = addPatient({
      siteId: currentSite.id,
      firstName: expressFirstName.trim(),
      lastName: expressLastName.trim(),
      sex: expressSex,
      birthDate: computedBirthDate,
      phone: expressPhone.trim() || "Non renseigné",
      address: expressAddress.trim() || "Bamako",
      profession: "Non renseigné",
      bloodGroup: "O+",
      allergies: [],
      medicalHistory: [],
      surgicalHistory: [],
    });

    if (expressAutoAdmit) {
      addVisit({
        patientId: newPat.id,
        siteId: currentSite.id,
        type: "CONSULTATION",
        status: "EN_COURS",
        queueNumber: `A-${Math.floor(10 + Math.random() * 89)}`,
        priority: "NORMALE",
        createdById: currentUser.id,
        createdByName: currentUser.fullName,
        notes: "Admission automatique après création de dossier",
      });
    }

    setIsExpressPatientOpen(false);
    setExpressLastName("");
    setExpressFirstName("");
    setExpressAge("");
    setExpressPhone("");
    setExpressAddress("");
    setExpressDuplicateIgnored(false);
    setSelectedPatientId(newPat.id);
    showToast("SUCCESS", "Dossier Permanent Créé", `${newPat.lastName.toUpperCase()} ${newPat.firstName} (${newPat.patientCode})`);
  };

  const handleExecuteDirectAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === directRdvPatientId) || patients[0];
    if (!pat) return;

    const pracName = directRdvPractitionerId === "usr-practitioner" ? "Dr. Mariam Traoré" : currentUser.fullName;

    addAppointment({
      patientId: pat.id,
      practitionerId: directRdvPractitionerId,
      practitionerName: pracName,
      siteId: currentSite.id,
      date: directRdvDate,
      timeSlot: directRdvTime,
      durationMinutes: 30,
      motif: directRdvMotif,
      status: "CONFIRME",
      reminderOffsetMinutes: 30,
      reminderSent: false,
    });

    setIsDirectAppointmentOpen(false);
    showToast("SUCCESS", "Rendez-vous Programmé", `RDV fixé au ${directRdvDate} à ${directRdvTime} pour ${pat.lastName.toUpperCase()} ${pat.firstName}`);
  };

  // Handler for Direct Payment
  const handleExecuteDirectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find((i) => i.id === directPaymentInvoiceId) || invoices[0];
    if (!inv) return;

    const amount = parseFloat(directPaymentAmount) || inv.balance;
    const payment = addPayment(inv.id, amount, directPaymentMethod);

    const pat = patients.find((p) => p.id === inv.patientId);
    if (pat) {
      setPrintableDoc({
        type: "RECEIPT",
        title: `REÇU DE PAIEMENT EXPRESS — ${payment.receiptCode}`,
        patient: pat,
        data: payment,
      });
    }

    setIsDirectPaymentOpen(false);
    setDirectPaymentAmount("");
    showToast("SUCCESS", "Encaissement Enregistré", `Reçu ${payment.receiptCode} validé.`);
  };

  // Customizable Widgets State per User / Role
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [activeWidgetIds, setActiveWidgetIds] = useState<DashboardWidgetId[]>(() => {
    try {
      const saved = localStorage.getItem(`fona_dashboard_widgets_${currentUser.id}_${currentUser.role}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return getDefaultWidgetsForRole(currentUser.role);
  });

  const handleSaveWidgetPreferences = (newWidgetIds: DashboardWidgetId[]) => {
    setActiveWidgetIds(newWidgetIds);
    try {
      localStorage.setItem(
        `fona_dashboard_widgets_${currentUser.id}_${currentUser.role}`,
        JSON.stringify(newWidgetIds)
      );
      showToast("SUCCESS", "Tableau de Bord Mis à Jour", `${newWidgetIds.length} indicateur(s) configuré(s).`);
    } catch (e) {
      console.error(e);
    }
  };

  // Analytics Period Filter: "7d" | "30d" | "today" | "month"
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"7d" | "30d" | "today" | "month">("7d");
  const [analyticsViewTab, setAnalyticsViewTab] = useState<"overview" | "intake" | "consultations" | "revenue" | "vitals">("overview");
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState<string>(patients[0]?.id || "pat-001");

  const isAnimated = animationMode !== "disabled";
  const canViewFinance = !isFinancialDataRestrictedForUser(currentUser);

  // Core Counts
  const totalPatientsCount = patients.length;
  const activeVisitsCount = visits.filter((v) => v.status === "EN_COURS").length;
  const todayConsultationsCount = consultations.length;
  const upcomingAppointmentsCount = appointments.filter((a) => a.status === "PREVU" || a.status === "CONFIRME").length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalBalanceDue = invoices.reduce((acc, inv) => acc + inv.balance, 0);
  const unpaidInvoicesCount = invoices.filter((i) => i.status !== "PAYE").length;
  const pendingCaresCount = cares.length;
  const activePregnanciesCount = pregnancies.filter((p) => p.status === "EN_COURS").length;
  const pendingLabsCount = labRequests.filter((l) => l.status === "DEMANDE" || l.status === "EN_COURS").length;
  const pendingImagingCount = imagingRequests.filter((img) => img.status === "DEMANDE").length;

  const cpnVisitsCount = prenatalVisits.length || 6;
  const urgentLabsCount = labRequests.filter((l) => l.priority === "URGENTE" && l.status !== "VALIDE").length || 2;
  const avgWaitTimeMinutes = 18;
  const collectionRate = totalBilled > 0 ? Math.round((totalRevenue / totalBilled) * 100) : 88;

  const handleRemoveWidget = (widgetId: DashboardWidgetId) => {
    if (activeWidgetIds.length <= 1) return;
    const updated = activeWidgetIds.filter((id) => id !== widgetId);
    handleSaveWidgetPreferences(updated);
  };

  const handleMoveWidget = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activeWidgetIds.length) return;
    const updated = [...activeWidgetIds];
    const [item] = updated.splice(index, 1);
    updated.splice(newIndex, 0, item);
    handleSaveWidgetPreferences(updated);
  };

  // =========================================================================
  // 1. RECHARTS DATASETS: DAILY PATIENT INTAKE (FLUX JOURNALIER DES ADMISSIONS)
  // =========================================================================
  const dailyPatientIntakeData = useMemo(() => {
    if (analyticsPeriod === "today") {
      return [
        { label: "08h00", admissions: 4, sortis: 1, enAttente: 3, urgences: 1 },
        { label: "09h00", admissions: 9, sortis: 4, enAttente: 8, urgences: 0 },
        { label: "10h00", admissions: 14, sortis: 8, enAttente: 12, urgences: 2 },
        { label: "11h00", admissions: 18, sortis: 13, enAttente: 15, urgences: 1 },
        { label: "12h00", admissions: 11, sortis: 14, enAttente: 9, urgences: 0 },
        { label: "13h00", admissions: 8, sortis: 10, enAttente: 7, urgences: 0 },
        { label: "14h00", admissions: 15, sortis: 11, enAttente: 11, urgences: 1 },
        { label: "15h00", admissions: 19, sortis: 16, enAttente: 14, urgences: 2 },
        { label: "16h00", admissions: 16, sortis: 17, enAttente: 10, urgences: 0 },
        { label: "17h00", admissions: 9, sortis: 12, enAttente: 5, urgences: 0 },
        { label: "18h00", admissions: 5, sortis: 7, enAttente: 3, urgences: 0 },
      ];
    }

    if (analyticsPeriod === "30d" || analyticsPeriod === "month") {
      return [
        { label: "Semaine 1", admissions: 84, sortis: 78, enAttente: 18, urgences: 6 },
        { label: "Semaine 2", admissions: 102, sortis: 95, enAttente: 22, urgences: 9 },
        { label: "Semaine 3", admissions: 118, sortis: 110, enAttente: 26, urgences: 11 },
        { label: "Semaine 4", admissions: 96, sortis: 92, enAttente: 20, urgences: 7 },
      ];
    }

    // Default: 7 derniers jours
    return [
      { label: "Lun 22/09", admissions: 24, sortis: 22, enAttente: 6, urgences: 2 },
      { label: "Mar 23/09", admissions: 28, sortis: 26, enAttente: 8, urgences: 3 },
      { label: "Mer 24/09", admissions: 34, sortis: 31, enAttente: 11, urgences: 1 },
      { label: "Jeu 25/09", admissions: 31, sortis: 29, enAttente: 9, urgences: 4 },
      { label: "Ven 26/09", admissions: 38, sortis: 35, enAttente: 12, urgences: 3 },
      { label: "Sam 27/09", admissions: 26, sortis: 25, enAttente: 5, urgences: 2 },
      { label: "Dim 28/09", admissions: 18, sortis: 17, enAttente: 4, urgences: 1 },
    ];
  }, [analyticsPeriod]);

  // Breakdown of patient arrivals by medical reason
  const intakeByReasonData = useMemo(() => {
    return [
      { name: "Consultations Générales", value: 45, color: "#55D9FF" },
      { name: "Maternité & CPN", value: 22, color: "#8B7CFF" },
      { name: "Soins & Injections", value: 18, color: "#20B8A6" },
      { name: "Examens Biologiques (Lab)", value: 10, color: "#4F7DF3" },
      { name: "Urgences & Triage", value: 5, color: "#EF4444" },
    ];
  }, []);

  // =========================================================================
  // 2. RECHARTS DATASETS: CONSULTATION TRENDS & CLINICAL DIAGNOSTICS
  // =========================================================================
  const consultationTrendsData = useMemo(() => {
    if (analyticsPeriod === "today") {
      return [
        { label: "08h-10h", consultations: 8, prescriptions: 7, orientationExam: 3 },
        { label: "10h-12h", consultations: 16, prescriptions: 14, orientationExam: 7 },
        { label: "12h-14h", consultations: 7, prescriptions: 6, orientationExam: 2 },
        { label: "14h-16h", consultations: 15, prescriptions: 13, orientationExam: 6 },
        { label: "16h-18h", consultations: 10, prescriptions: 9, orientationExam: 4 },
      ];
    }

    if (analyticsPeriod === "30d" || analyticsPeriod === "month") {
      return [
        { label: "Semaine 1", consultations: 68, prescriptions: 61, orientationExam: 28 },
        { label: "Semaine 2", consultations: 82, prescriptions: 74, orientationExam: 36 },
        { label: "Semaine 3", consultations: 95, prescriptions: 87, orientationExam: 41 },
        { label: "Semaine 4", consultations: 76, prescriptions: 69, orientationExam: 31 },
      ];
    }

    // Default: 7 days
    return [
      { label: "Lun", consultations: 18, prescriptions: 16, orientationExam: 7, moyenne: 18 },
      { label: "Mar", consultations: 22, prescriptions: 20, orientationExam: 9, moyenne: 20 },
      { label: "Mer", consultations: 27, prescriptions: 24, orientationExam: 12, moyenne: 22 },
      { label: "Jeu", consultations: 24, prescriptions: 22, orientationExam: 10, moyenne: 23 },
      { label: "Ven", consultations: 30, prescriptions: 27, orientationExam: 14, moyenne: 24 },
      { label: "Sam", consultations: 20, prescriptions: 18, orientationExam: 8, moyenne: 24 },
      { label: "Dim", consultations: 14, prescriptions: 13, orientationExam: 5, moyenne: 22 },
    ];
  }, [analyticsPeriod]);

  // Clinical Top Pathologies / Diagnostics Distribution
  const topDiagnosticsData = useMemo(() => {
    return [
      { name: "Paludisme Simple / Accès Fébriles", count: 48, percentage: 34, color: "#EF4444" },
      { name: "Hypertension Artérielle (HTA)", count: 29, percentage: 21, color: "#F59E0B" },
      { name: "Infections Respiratoires Aiguës", count: 24, percentage: 17, color: "#55D9FF" },
      { name: "Gastro-entérites & Parasitoses", count: 21, percentage: 15, color: "#10B981" },
      { name: "Suivi Prénatal & CPN Physiologique", count: 18, percentage: 13, color: "#8B7CFF" },
    ];
  }, []);

  // =========================================================================
  // 3. RECHARTS DATASETS: REVENUE & FINANCIAL METRICS (RECETTES & ENCAISSEMENTS)
  // =========================================================================
  const revenueMetricsData = useMemo(() => {
    if (analyticsPeriod === "today") {
      return [
        { label: "08h-10h", facture: 110000, encaisse: 95000, solde: 15000, cumul: 95000 },
        { label: "10h-12h", facture: 230000, encaisse: 215000, solde: 15000, cumul: 310000 },
        { label: "12h-14h", facture: 130000, encaisse: 120000, solde: 10000, cumul: 430000 },
        { label: "14h-16h", facture: 280000, encaisse: 260000, solde: 20000, cumul: 690000 },
        { label: "16h-18h", facture: 190000, encaisse: 175000, solde: 15000, cumul: 865000 },
      ];
    }

    if (analyticsPeriod === "30d" || analyticsPeriod === "month") {
      return [
        { label: "Semaine 1", facture: 1250000, encaisse: 1120000, solde: 130000, cumul: 1120000 },
        { label: "Semaine 2", facture: 1480000, encaisse: 1350000, solde: 130000, cumul: 2470000 },
        { label: "Semaine 3", facture: 1690000, encaisse: 1520000, solde: 170000, cumul: 3990000 },
        { label: "Semaine 4", facture: 1390000, encaisse: 1270000, solde: 120000, cumul: 5260000 },
      ];
    }

    // Default: 7 days
    return [
      { label: "Lun", facture: 320000, encaisse: 290000, solde: 30000, cumul: 290000 },
      { label: "Mar", facture: 390000, encaisse: 360000, solde: 30000, cumul: 650000 },
      { label: "Mer", facture: 460000, encaisse: 420000, solde: 40000, cumul: 1070000 },
      { label: "Jeu", facture: 410000, encaisse: 380000, solde: 30000, cumul: 1450000 },
      { label: "Ven", facture: 530000, encaisse: 485000, solde: 45000, cumul: 1935000 },
      { label: "Sam", facture: 350000, encaisse: 325000, solde: 25000, cumul: 2260000 },
      { label: "Dim", facture: 210000, encaisse: 195000, solde: 15000, cumul: 2455000 },
    ];
  }, [analyticsPeriod]);

  // Payment Methods Distribution (Espèces / Mobile Money / Carte)
  const paymentMethodsDistribution = useMemo(() => {
    return [
      { name: "Mobile Money (Wave / Orange Money)", value: 52, amount: 1276000, color: "#55D9FF" },
      { name: "Espèces (Caisse Guichet)", value: 38, amount: 932000, color: "#10B981" },
      { name: "Carte Bancaire / TPE", value: 10, amount: 247000, color: "#8B7CFF" },
    ];
  }, []);

  // Vitals Sheet
  const currentPatientObj = patients.find((p) => p.id === selectedPatientForVitals) || patients[0];
  const vitalsLongitudinalData = useMemo(() => {
    return [
      { date: "Jour 1 08h", temp: 38.8, taSys: 145, taDia: 92, pouls: 96, spo2: 96 },
      { date: "Jour 1 14h", temp: 38.4, taSys: 138, taDia: 88, pouls: 90, spo2: 97 },
      { date: "Jour 1 20h", temp: 38.6, taSys: 140, taDia: 90, pouls: 92, spo2: 97 },
      { date: "Jour 2 08h", temp: 37.9, taSys: 132, taDia: 84, pouls: 84, spo2: 98 },
      { date: "Jour 2 14h", temp: 37.5, taSys: 128, taDia: 82, pouls: 80, spo2: 98 },
      { date: "Jour 2 20h", temp: 37.2, taSys: 125, taDia: 80, pouls: 78, spo2: 99 },
      { date: "Jour 3 08h", temp: 36.9, taSys: 120, taDia: 78, pouls: 74, spo2: 99 },
    ];
  }, [selectedPatientForVitals]);

  const handlePrintTemperatureSheet = () => {
    if (!currentPatientObj) return;
    setPrintableDoc({
      type: "TEMPERATURE",
      title: "Feuille de Température & Constantes Graphiques",
      patient: currentPatientObj,
      data: {
        measures: vitalsLongitudinalData,
        measuredBy: currentUser.fullName,
        site: "CM FONA",
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner with Liquid Glass Gradient */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0c2b54]/90 via-[#0d223d]/90 to-[#071A33]/90 border border-white/15 backdrop-blur-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.35)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <GlassAvatar
              role={currentUser.role}
              name={currentUser.fullName}
              size="lg"
              showStatus={true}
              animated={isAnimated}
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#55D9FF]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Centre Médical FONA</span>
                <span>·</span>
                <span className="text-[#D9B45B]">{ROLE_LABELS[currentUser.role]}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currentUser.fullName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <GlassButton
              variant="subtle"
              size="md"
              icon={<SlidersHorizontal className="w-4 h-4 text-[#D9B45B]" />}
              onClick={() => setIsCustomizeModalOpen(true)}
              title="Personnaliser mes KPI"
            >
              <span className="hidden sm:inline">Personnaliser</span> KPI
            </GlassButton>

            <GlassButton
              variant="primary"
              size="md"
              icon={<Users className="w-4 h-4" />}
              onClick={() => setActiveTab("patients")}
            >
              Dossiers Patients
            </GlassButton>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ESPACE ACTIONS DIRECTES CLINIQUES & ACCUEIL (RÉORGANISÉ SELON LE RÔLE)    */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-lg space-y-4 relative z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-[#D9B45B]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Actions Directes Cliniques & Accueil
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Opérations prioritaires adaptées au profil <span className="font-semibold text-[#D9B45B]">{ROLE_LABELS[currentUser.role]}</span>
              </p>
            </div>
          </div>

          {/* Recherche Rapide Patient Interactive (0 Clic Navigation) */}
          <div className="relative w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher patient (nom, tél, PAT)..."
                value={quickPatientSearch}
                onChange={(e) => setQuickPatientSearch(e.target.value)}
                onFocus={() => setIsQuickSearchFocused(true)}
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-[var(--surface-subtle)] border border-[var(--border)] focus:border-[#55D9FF] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none transition-colors"
              />
              {quickPatientSearch && (
                <button
                  type="button"
                  onClick={() => setQuickPatientSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Live Search Results Flyout */}
            {quickPatientSearch.trim().length > 0 && isQuickSearchFocused && (
              <div
                className="absolute left-0 right-0 top-full mt-1.5 p-2 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-active)] shadow-2xl z-50 space-y-1 max-h-72 overflow-y-auto"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] px-2 py-1 flex items-center justify-between">
                  <span>Résultats ({quickSearchResults.length})</span>
                  <span className="font-normal">Actions directes 1-clic</span>
                </div>
                {quickSearchResults.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[var(--text-secondary)]">
                    Aucun patient trouvé.{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpressPatientOpen(true);
                        setExpressLastName(quickPatientSearch);
                        setQuickPatientSearch("");
                      }}
                      className="text-[#1261A0] dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                    >
                      Créer ce dossier ?
                    </button>
                  </div>
                ) : (
                  quickSearchResults.map((pat) => (
                    <div
                      key={pat.id}
                      className="p-2 rounded-xl hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {pat.lastName.toUpperCase()} {pat.firstName}
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)] font-mono flex items-center gap-2">
                          <span className="text-[#1261A0] dark:text-cyan-300 font-bold">{pat.patientCode}</span>
                          <span>·</span>
                          <span>{pat.phone || "Sans tel"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 flex-wrap">
                        {/* 1-Click New Passage */}
                        <button
                          type="button"
                          onClick={() => {
                            setAdmissionPatientId(pat.id);
                            setIsDirectAdmissionOpen(true);
                            setQuickPatientSearch("");
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#1261A0] text-white hover:bg-blue-600 transition-colors cursor-pointer"
                          title="Enregistrer un nouveau passage pour ce patient"
                        >
                          + Passage
                        </button>

                        {/* 1-Click Consult */}
                        {(currentUser.role === "PRACTITIONER" || currentUser.role === "ADMIN") && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(pat.id);
                              setActiveTab("consultations");
                              setQuickPatientSearch("");
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-violet-600 text-white hover:bg-violet-500 transition-colors cursor-pointer"
                            title="Ouvrir consultation"
                          >
                            Consulter
                          </button>
                        )}

                        {/* 1-Click Care */}
                        {(currentUser.role === "NURSE" || currentUser.role === "PRACTITIONER" || currentUser.role === "ADMIN") && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(pat.id);
                              setActiveTab("care");
                              setQuickPatientSearch("");
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-teal-600 text-white hover:bg-teal-500 transition-colors cursor-pointer"
                            title="Administrer soin"
                          >
                            Soin
                          </button>
                        )}

                        {/* 1-Click CPN */}
                        {(currentUser.role === "MIDWIFE" || currentUser.role === "ADMIN") && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(pat.id);
                              setActiveTab("maternite");
                              setQuickPatientSearch("");
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-600 text-white hover:bg-purple-500 transition-colors cursor-pointer"
                            title="Ouvrir suivi maternité / CPN"
                          >
                            CPN
                          </button>
                        )}

                        {/* 1-Click Cashier */}
                        {(currentUser.role === "RECEPTION_CAISSE" || currentUser.role === "ADMIN") && canViewFinance && (
                          <button
                            type="button"
                            onClick={() => {
                              const inv = invoices.find((i) => i.patientId === pat.id && i.balance > 0);
                              if (inv) {
                                setDirectPaymentInvoiceId(inv.id);
                                setDirectPaymentAmount(inv.balance.toString());
                              } else {
                                setDirectPaymentAmount("15000");
                              }
                              setIsDirectPaymentOpen(true);
                              setQuickPatientSearch("");
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                            title="Encaisser"
                          >
                            Caisse
                          </button>
                        )}

                        {/* 1-Click Dossier */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPatientId(pat.id);
                            setActiveTab("patients");
                            setQuickPatientSearch("");
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-medium bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-active)] transition-colors cursor-pointer"
                          title="Voir le dossier complet"
                        >
                          Dossier →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'Action Prioritaires Contextuels (Adaptés aux Habilitations) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Action 1: Nouveau Passage (Admission de patient déjà connu) */}
          <button
            onClick={() => {
              if (patients.length > 0 && !admissionPatientId) {
                setAdmissionPatientId(patients[0].id);
              }
              setIsDirectAdmissionOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#1261A0] text-white hover:bg-blue-600 shadow-sm transition-all cursor-pointer"
            title="Générer un ticket de file d'attente pour un patient déjà enregistré"
          >
            <Plus className="w-4 h-4 text-cyan-300" />
            <span>+ Nouveau Passage</span>
          </button>

          {/* Action 2: Nouveau Patient (Création de dossier avec vérification anti-doublon) */}
          <button
            onClick={() => {
              setExpressLastName("");
              setExpressFirstName("");
              setExpressPhone("");
              setExpressAge("");
              setExpressDuplicateIgnored(false);
              setIsExpressPatientOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#D9B45B] text-[#071A33] hover:bg-amber-400 shadow-sm transition-all cursor-pointer"
            title="Créer un nouveau dossier permanent (vérification anti-doublon intégrée)"
          >
            <UserPlus className="w-4 h-4 text-[#071A33]" />
            <span>+ Nouveau Patient</span>
          </button>

          {/* Action 3: Nouvelle Consultation (Médecins / Praticiens / Admin) */}
          {(currentUser.role === "PRACTITIONER" || currentUser.role === "ADMIN") && (
            <button
              onClick={() => {
                if (patients.length > 0 && !selectedPatientId) {
                  setSelectedPatientId(patients[0].id);
                }
                setActiveTab("consultations");
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 shadow-sm transition-all cursor-pointer"
              title="Ouvrir le formulaire clinique de consultation"
            >
              <Stethoscope className="w-4 h-4" />
              <span>+ Consultation</span>
            </button>
          )}

          {/* Action 4: Nouveau Soin (Infirmiers / Praticiens / Admin) */}
          {(currentUser.role === "NURSE" || currentUser.role === "PRACTITIONER" || currentUser.role === "ADMIN") && (
            <button
              onClick={() => {
                if (patients.length > 0 && !selectedPatientId) {
                  setSelectedPatientId(patients[0].id);
                }
                setActiveTab("care");
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-500 shadow-sm transition-all cursor-pointer"
              title="Enregistrer un soin infirmier administré"
            >
              <Syringe className="w-4 h-4" />
              <span>+ Soin Infirmier</span>
            </button>
          )}

          {/* Action 5: Maternité & CPN (Sages-Femmes / Praticiens / Admin) */}
          {(currentUser.role === "MIDWIFE" || currentUser.role === "PRACTITIONER" || currentUser.role === "ADMIN") && (
            <button
              onClick={() => {
                if (patients.length > 0 && !selectedPatientId) {
                  const femalePat = patients.find((p) => p.sex === "FEMALE") || patients[0];
                  setSelectedPatientId(femalePat.id);
                }
                setActiveTab("maternite");
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 shadow-sm transition-all cursor-pointer"
              title="Accéder aux dossiers de grossesses et consultations prénatales"
            >
              <Baby className="w-4 h-4" />
              <span>+ Maternité / CPN</span>
            </button>
          )}

          {/* Action 6: Programmer un Rendez-vous */}
          {(currentUser.role === "RECEPTION_CAISSE" || currentUser.role === "PRACTITIONER" || currentUser.role === "MIDWIFE" || currentUser.role === "ADMIN") && (
            <button
              onClick={() => {
                if (patients.length > 0 && !directRdvPatientId) {
                  setDirectRdvPatientId(patients[0].id);
                }
                setIsDirectAppointmentOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-all cursor-pointer"
              title="Fixer un rendez-vous médical rapide"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>+ Prendre RDV</span>
            </button>
          )}

          {/* Action 7: Encaissement Rapide de Caisse */}
          {(currentUser.role === "RECEPTION_CAISSE" || currentUser.role === "ADMIN") && canViewFinance && (
            <button
              onClick={() => {
                if (invoices.length > 0) {
                  const unpaid = invoices.find((i) => i.balance > 0) || invoices[0];
                  setDirectPaymentInvoiceId(unpaid.id);
                  setDirectPaymentAmount(unpaid.balance > 0 ? unpaid.balance.toString() : "15000");
                }
                setIsDirectPaymentOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
              title="Encaisser un règlement de prestation"
            >
              <CreditCard className="w-4 h-4" />
              <span>+ Encaissement Caisse</span>
            </button>
          )}
        </div>
      </div>

      {/* Customizable KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {activeWidgetIds.map((widgetId, index) => {
          const commonProps = {
            onRemove: activeWidgetIds.length > 1 ? () => handleRemoveWidget(widgetId) : undefined,
            onMoveLeft: index > 0 ? () => handleMoveWidget(index, "left") : undefined,
            onMoveRight: index < activeWidgetIds.length - 1 ? () => handleMoveWidget(index, "right") : undefined,
          };

          switch (widgetId) {
            case "total_patients":
              return (
                <GlassKpi
                  key={widgetId}
                  title="Patients Enregistrés"
                  value={totalPatientsCount}
                  unit="dossiers"
                  change="+12.4%"
                  trend="up"
                  category="patients"
                  icon={<Users className="w-5 h-5 text-[#4F7DF3]" />}
                  sparklineData={[18, 22, 25, 29, 34, 38, 42, 48]}
                  onClick={() => setActiveTab("patients")}
                  {...commonProps}
                />
              );

            case "today_consultations":
              return (
                <GlassKpi
                  key={widgetId}
                  title="Consultations Médicales"
                  value={todayConsultationsCount}
                  unit="actes"
                  change="+8.1%"
                  trend="up"
                  category="medical"
                  icon={<Stethoscope className="w-5 h-5 text-[#55D9FF]" />}
                  sparklineData={[10, 14, 12, 18, 16, 22, 20, 26]}
                  onClick={() => setActiveTab("consultations")}
                  {...commonProps}
                />
              );

            case "active_visits":
              return (
                <GlassKpi
                  key={widgetId}
                  title="Passages en Cours"
                  value={activeVisitsCount}
                  unit="patients"
                  change={`${visits.length} aujourd'hui`}
                  trend="neutral"
                  category="patients"
                  icon={<Activity className="w-5 h-5 text-cyan-400" />}
                  sparklineData={[3, 5, 8, 12, 9, 14, 11, 7]}
                  onClick={() => setActiveTab("cashier")}
                  {...commonProps}
                />
              );

            case "upcoming_appointments":
              return (
                <GlassKpi
                  key={widgetId}
                  title="Rendez-vous Confirmés"
                  value={upcomingAppointmentsCount}
                  unit="RDV"
                  change="+4.5%"
                  trend="up"
                  category="rdv"
                  icon={<CalendarDays className="w-5 h-5 text-[#D9B45B]" />}
                  sparklineData={[5, 8, 6, 10, 9, 12, 11, 15]}
                  onClick={() => setActiveTab("appointments")}
                  {...commonProps}
                />
              );

            case "total_revenue":
              if (!canViewFinance) return null;
              return (
                <GlassKpi
                  key={widgetId}
                  title="Recettes Encaissées"
                  value={totalRevenue}
                  unit={regionalSettings.currencyDisplay}
                  change="+15.2%"
                  trend="up"
                  category="finance"
                  icon={<Receipt className="w-5 h-5 text-emerald-400" />}
                  sparklineData={[120, 180, 240, 310, 420, 560, 680, 865]}
                  onClick={() => setActiveTab("cashier")}
                  {...commonProps}
                />
              );

            case "pending_cares":
              return (
                <GlassKpi
                  key={widgetId}
                  title="Soins & Pansements"
                  value={pendingCaresCount}
                  unit="soins"
                  change="Actifs"
                  trend="neutral"
                  category="medical"
                  icon={<HeartHandshake className="w-5 h-5 text-teal-400" />}
                  sparklineData={[4, 6, 5, 8, 7, 10, 8, 11]}
                  onClick={() => setActiveTab("care")}
                  {...commonProps}
                />
              );

            case "active_pregnancies":
              return (
                <GlassKpi
                  key={widgetId}
                  title="Grossesses en Suivi"
                  value={activePregnanciesCount}
                  unit="patientes"
                  change="+3 ce mois"
                  trend="up"
                  category="default"
                  icon={<Baby className="w-5 h-5 text-violet-400" />}
                  sparklineData={[12, 14, 15, 18, 19, 22, 24, 28]}
                  onClick={() => setActiveTab("maternite")}
                  {...commonProps}
                />
              );

            case "daily_collection_rate":
              if (!canViewFinance) return null;
              return (
                <GlassKpi
                  key={widgetId}
                  title="Taux de Recouvrement"
                  value={`${collectionRate}%`}
                  unit="collecte"
                  change="Objectif ≥ 85%"
                  trend="up"
                  category="finance"
                  icon={<Receipt className="w-5 h-5 text-emerald-500" />}
                  sparklineData={[70, 75, 78, 80, 82, 84, 85, 88]}
                  onClick={() => setActiveTab("cashier")}
                  {...commonProps}
                />
              );

            default:
              return null;
          }
        })}

        {activeWidgetIds.length < 10 && (
          <div
            onClick={() => setIsCustomizeModalOpen(true)}
            className="rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[#1261A0] dark:hover:border-cyan-400 p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-[var(--text-secondary)] hover:text-[#1261A0] dark:hover:text-cyan-300 min-h-[140px] group select-none shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-solid)] border border-[var(--border)] group-hover:border-[#1261A0] dark:group-hover:border-cyan-400 flex items-center justify-center transition-transform group-hover:scale-110 text-[var(--text-secondary)] group-hover:text-[#1261A0] dark:group-hover:text-cyan-300">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Ajouter un KPI</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUMMARY ANALYTICS DASHBOARD (TABLEAU DE BORD ANALYTIQUE DE SYNTHÈSE)      */}
      {/* Visualizes: 1) Daily Patient Intake  2) Consultation Trends  3) Revenue    */}
      {/* ========================================================================= */}
      <GlassCard className="p-6 space-y-6 border border-cyan-500/20 shadow-2xl">
        {/* Header with Title, Period Selector & Tab Switcher */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1261A0] to-[#55D9FF] p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full rounded-[14px] bg-[#071A33] flex items-center justify-center text-cyan-300">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  Synthèse Analytique
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#1261A0] dark:text-[#55D9FF] border border-cyan-400/30">
                  Activité CM FONA
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Period Filter Buttons */}
            <div className="flex items-center bg-[var(--surface-subtle)] p-1 rounded-xl border border-[var(--border)] text-xs font-semibold">
              <button
                onClick={() => setAnalyticsPeriod("today")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  analyticsPeriod === "today"
                    ? "bg-[#4F7DF3] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setAnalyticsPeriod("7d")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  analyticsPeriod === "7d"
                    ? "bg-[#4F7DF3] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                7 Jours
              </button>
              <button
                onClick={() => setAnalyticsPeriod("30d")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  analyticsPeriod === "30d"
                    ? "bg-[#4F7DF3] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                30 Jours
              </button>
              <button
                onClick={() => setAnalyticsPeriod("month")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  analyticsPeriod === "month"
                    ? "bg-[#4F7DF3] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Ce Mois
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[var(--surface-subtle)] p-1 rounded-xl border border-[var(--border)] text-xs">
              <button
                onClick={() => setAnalyticsViewTab("overview")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  analyticsViewTab === "overview"
                    ? "bg-[#1261A0] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Vue Globale
              </button>
              <button
                onClick={() => setAnalyticsViewTab("intake")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  analyticsViewTab === "intake"
                    ? "bg-cyan-500 text-[#071A33] font-bold shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Flux Admissions
              </button>
              <button
                onClick={() => setAnalyticsViewTab("consultations")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  analyticsViewTab === "consultations"
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Consultations
              </button>
              {canViewFinance && (
                <button
                  onClick={() => setAnalyticsViewTab("revenue")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    analyticsViewTab === "revenue"
                      ? "bg-[#D9B45B] text-[#071A33] font-bold shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Recettes
                </button>
              )}
              <button
                onClick={() => setAnalyticsViewTab("vitals")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  analyticsViewTab === "vitals"
                    ? "bg-teal-500 text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Feuille Temp.
              </button>
            </div>
          </div>
        </div>

        {/* Analytic Summary Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Admissions Moyennes / Jour</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1 tabular-nums">
                28.4 <span className="text-xs font-normal text-[var(--text-secondary)]">patients / j</span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Fluidité des admissions : 92%</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Consultations & Pathologies</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1 tabular-nums">
                22.1 <span className="text-xs font-normal text-[var(--text-secondary)]">actes / j</span>
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                <span>Diagnostic prévalent : </span>
                <span className="font-semibold text-rose-500">Paludisme (34%)</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-[#D9B45B] flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                <span>Recettes & Taux Recouvrement</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1 tabular-nums">
                {canViewFinance ? `${collectionRate}%` : "Confidentiel"}
                <span className="text-xs font-normal text-[var(--text-secondary)] ml-1">
                  ({canViewFinance ? formatCurrency(totalRevenue, regionalSettings) : ""})
                </span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <span>Wave / Mobile Money : </span>
                <span className="font-semibold">52% des paiements</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#D9B45B] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 1: VUE GLOBALE (ALL 3 CHARTS IN A SYNTHETIC HARMONIOUS LAYOUT) */}
        {/* ------------------------------------------------------------------- */}
        {analyticsViewTab === "overview" && (
          <div className="space-y-6 pt-2">
            {/* Row 1: Daily Intake Chart + Consultation Trend Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Patient Intake (AreaChart) */}
              <div className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      Flux des admissions & sorties
                    </h4>
                  </div>
                  <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                    {analyticsPeriod === "today" ? "Par Heure" : "Par Jour"}
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyPatientIntakeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#55D9FF" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#55D9FF" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="sortisGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F7DF3" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#4F7DF3" stopOpacity={0.02} />
                        </linearGradient>
                        <filter id="intakeGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#55D9FF" floodOpacity="0.4" />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                      <XAxis dataKey="label" stroke={chartAxisStroke} fontSize={10} tickLine={false} />
                      <YAxis stroke={chartAxisStroke} fontSize={10} tickLine={false} />
                      <Tooltip content={<CustomGlassTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="admissions"
                        name="Admissions"
                        unit="patients"
                        stroke="#55D9FF"
                        strokeWidth={2.5}
                        fill="url(#intakeGrad)"
                        isAnimationActive={true}
                        animationDuration={1000}
                        animationEasing="ease-out"
                        animationBegin={100}
                        activeDot={{ r: 6.5, strokeWidth: 2.5, stroke: "#ffffff", fill: "#55D9FF" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sortis"
                        name="Passages Clôturés"
                        unit="patients"
                        stroke="#4F7DF3"
                        strokeWidth={2}
                        fill="url(#sortisGrad)"
                        isAnimationActive={true}
                        animationDuration={1000}
                        animationEasing="ease-out"
                        animationBegin={220}
                        activeDot={{ r: 6, strokeWidth: 2.5, stroke: "#ffffff", fill: "#4F7DF3" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="enAttente"
                        name="En Attente"
                        unit="patients"
                        stroke="#D9B45B"
                        strokeWidth={2}
                        dot={{ r: 3.5, strokeWidth: 1.5, stroke: "#ffffff", fill: "#D9B45B" }}
                        isAnimationActive={true}
                        animationDuration={1100}
                        animationEasing="ease-out"
                        animationBegin={360}
                        activeDot={{ r: 6.5, strokeWidth: 3, stroke: "#ffffff", fill: "#D9B45B" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-300">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" /> Admissions
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-300">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Sorties
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-300">
                      <span className="w-2 h-2 rounded-full bg-[#D9B45B]" /> Attente
                    </span>
                  </div>
                  <button
                    onClick={() => setAnalyticsViewTab("intake")}
                    className="text-xs text-[#1261A0] dark:text-cyan-400 hover:underline font-bold"
                  >
                    Détails du flux →
                  </button>
                </div>
              </div>

              {/* Consultation Trends (ComposedChart) */}
              <div className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B7CFF]" />
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      Consultations & prescriptions
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-400/20">
                    Actes médicaux
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={consultationTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                      <XAxis dataKey="label" stroke={chartAxisStroke} fontSize={10} tickLine={false} />
                      <YAxis stroke={chartAxisStroke} fontSize={10} tickLine={false} />
                      <Tooltip content={<CustomGlassTooltip />} />
                      <Bar
                        dataKey="consultations"
                        name="Consultations Réalisées"
                        unit="actes"
                        fill="#8B7CFF"
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={true}
                        animationDuration={950}
                        animationEasing="ease-out"
                        animationBegin={100}
                      />
                      <Bar
                        dataKey="prescriptions"
                        name="Prescriptions / Ordonnances"
                        unit="ordonnances"
                        fill="#55D9FF"
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={true}
                        animationDuration={950}
                        animationEasing="ease-out"
                        animationBegin={220}
                      />
                      <Line
                        type="monotone"
                        dataKey="orientationExam"
                        name="Orientation Labo / Imagerie"
                        unit="demandes"
                        stroke="#EF4444"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, strokeWidth: 1.5, stroke: "#ffffff", fill: "#EF4444" }}
                        isAnimationActive={true}
                        animationDuration={1100}
                        animationEasing="ease-out"
                        animationBegin={360}
                        activeDot={{ r: 7, strokeWidth: 3, stroke: "#ffffff", fill: "#EF4444" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300">
                      <span className="w-2 h-2 rounded-full bg-[#8B7CFF]" /> Consultations
                    </span>
                    <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-300">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" /> Prescriptions
                    </span>
                    <span className="flex items-center gap-1 text-rose-500">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Examens requis
                    </span>
                  </div>
                  <button
                    onClick={() => setAnalyticsViewTab("consultations")}
                    className="text-xs text-[#1261A0] dark:text-cyan-400 hover:underline font-bold"
                  >
                    Détails cliniques →
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Revenue Metrics ComposedChart (Full Width) */}
            {canViewFinance && (
              <div className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D9B45B]" />
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      Recettes & facturation (FCFA)
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-400">Facturé : <strong className="text-white">{formatCurrency(totalBilled, regionalSettings)}</strong></span>
                    <span className="text-[#D9B45B]">Encaissé : <strong>{formatCurrency(totalRevenue, regionalSettings)}</strong></span>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={revenueMetricsData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                      <XAxis dataKey="label" stroke={chartAxisStroke} fontSize={10} tickLine={false} />
                      <YAxis
                        yAxisId="left"
                        stroke={chartAxisStroke}
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#B48B2E"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomGlassTooltip />} />
                      <Bar
                        yAxisId="left"
                        dataKey="facture"
                        name="Montant Facturé"
                        unit="FCFA"
                        fill="#4F7DF3"
                        radius={[5, 5, 0, 0]}
                        isAnimationActive={true}
                        animationDuration={950}
                        animationEasing="ease-out"
                        animationBegin={100}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="encaisse"
                        name="Recettes Encaissées"
                        unit="FCFA"
                        fill="#10B981"
                        radius={[5, 5, 0, 0]}
                        isAnimationActive={true}
                        animationDuration={950}
                        animationEasing="ease-out"
                        animationBegin={220}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="solde"
                        name="Solde Restant Dû"
                        unit="FCFA"
                        fill="#EF4444"
                        radius={[5, 5, 0, 0]}
                        isAnimationActive={true}
                        animationDuration={950}
                        animationEasing="ease-out"
                        animationBegin={340}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="cumul"
                        name="Recettes Cumulées"
                        unit="FCFA"
                        stroke="#D9B45B"
                        strokeWidth={2.5}
                        dot={{ r: 4, strokeWidth: 2, stroke: "#ffffff", fill: "#D9B45B" }}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        animationBegin={480}
                        activeDot={{ r: 7.5, strokeWidth: 3, stroke: "#ffffff", fill: "#D9B45B" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border)]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-300">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Facturé
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-300">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Encaissé
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-500">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Reste à recouvrer
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D9B45B]" /> Cumul Trésorerie
                    </span>
                  </div>
                  <button
                    onClick={() => setAnalyticsViewTab("revenue")}
                    className="text-xs text-[#1261A0] dark:text-cyan-400 hover:underline font-bold"
                  >
                    Ventilation des paiements →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 2: DÉTAIL DU FLUX D'ADMISSIONS                                 */}
        {/* ------------------------------------------------------------------- */}
        {analyticsViewTab === "intake" && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-3">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Dynamique des Admissions & Prise en Charge
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyPatientIntakeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                      <XAxis dataKey="label" stroke={chartAxisStroke} fontSize={10} tickLine={false} />
                      <YAxis stroke={chartAxisStroke} fontSize={10} tickLine={false} />
                      <Tooltip content={<CustomGlassTooltip />} />
                      <Bar dataKey="admissions" name="Admissions Totales" unit="patients" fill="#55D9FF" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={950} animationEasing="ease-out" animationBegin={100} />
                      <Bar dataKey="sortis" name="Sorties Validées" unit="patients" fill="#4F7DF3" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={950} animationEasing="ease-out" animationBegin={220} />
                      <Bar dataKey="urgences" name="Urgences Médicales" unit="patients" fill="#EF4444" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={950} animationEasing="ease-out" animationBegin={340} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Intake by Department / Reason */}
              <div className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-4">
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center justify-between">
                  <span>Répartition par Pôle Médical</span>
                  <PieChartIcon className="w-4 h-4 text-cyan-400" />
                </h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={intakeByReasonData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={1100}
                        animationEasing="ease-out"
                        animationBegin={150}
                      >
                        {intakeByReasonData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomGlassTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-xs">
                  {intakeByReasonData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] truncate max-w-[160px]">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-[var(--text-primary)]">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 3: DÉTAIL DES TENDANCES DE CONSULTATIONS                       */}
        {/* ------------------------------------------------------------------- */}
        {analyticsViewTab === "consultations" && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-3">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Volume Quotidien des Consultations & Ordonnances Médicales
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={consultationTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="consultGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B7CFF" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8B7CFF" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                      <XAxis dataKey="label" stroke={chartAxisStroke} fontSize={10} tickLine={false} />
                      <YAxis stroke={chartAxisStroke} fontSize={10} tickLine={false} />
                      <Tooltip content={<CustomGlassTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="consultations"
                        name="Consultations Médicales"
                        unit="actes"
                        stroke="#8B7CFF"
                        strokeWidth={2.5}
                        fill="url(#consultGrad)"
                        isAnimationActive={true}
                        animationDuration={1000}
                        animationEasing="ease-out"
                        animationBegin={100}
                        activeDot={{ r: 6.5, strokeWidth: 2.5, stroke: "#ffffff", fill: "#8B7CFF" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="prescriptions"
                        name="Prescriptions Validées"
                        unit="ordonnances"
                        stroke="#55D9FF"
                        strokeWidth={2}
                        dot={{ r: 3.5, strokeWidth: 1.5, stroke: "#ffffff", fill: "#55D9FF" }}
                        isAnimationActive={true}
                        animationDuration={1100}
                        animationEasing="ease-out"
                        animationBegin={260}
                        activeDot={{ r: 6.5, strokeWidth: 3, stroke: "#ffffff", fill: "#55D9FF" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pathologies & Diagnostics Prevalents */}
              <div className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-4">
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center justify-between">
                  <span>Top Pathologies Cliniques</span>
                  <Stethoscope className="w-4 h-4 text-rose-500" />
                </h4>
                <div className="space-y-3">
                  {topDiagnosticsData.map((diag, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--text-primary)] truncate max-w-[180px]">
                          {diag.name}
                        </span>
                        <span className="font-mono text-[var(--text-secondary)]">
                          {diag.count} cas ({diag.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${diag.percentage}%`, backgroundColor: diag.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-end">
                  <button
                    onClick={() => setActiveTab("consultations")}
                    className="text-xs text-[#1261A0] dark:text-cyan-400 hover:underline font-bold"
                  >
                    Ouvrir les consultations →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 4: DÉTAIL DES RECETTES & ENCAISSEMENTS                         */}
        {/* ------------------------------------------------------------------- */}
        {analyticsViewTab === "revenue" && canViewFinance && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-3">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Suivi des Facturations, Encaissements et Créances
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueMetricsData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                      <XAxis dataKey="label" stroke={chartAxisStroke} fontSize={10} tickLine={false} />
                      <YAxis
                        stroke={chartAxisStroke}
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomGlassTooltip />} />
                      <Bar dataKey="facture" name="Facturé" unit="FCFA" fill="#4F7DF3" radius={[5, 5, 0, 0]} isAnimationActive={true} animationDuration={950} animationEasing="ease-out" animationBegin={100} />
                      <Bar dataKey="encaisse" name="Encaissé" unit="FCFA" fill="#10B981" radius={[5, 5, 0, 0]} isAnimationActive={true} animationDuration={950} animationEasing="ease-out" animationBegin={220} />
                      <Bar dataKey="solde" name="Reste Dû" unit="FCFA" fill="#EF4444" radius={[5, 5, 0, 0]} isAnimationActive={true} animationDuration={950} animationEasing="ease-out" animationBegin={340} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Modes de paiement */}
              <div className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-4">
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center justify-between">
                  <span>Moyens de Paiement</span>
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                </h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodsDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={1100}
                        animationEasing="ease-out"
                        animationBegin={150}
                      >
                        {paymentMethodsDistribution.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomGlassTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-xs">
                  {paymentMethodsDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] truncate max-w-[160px]">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        {formatCurrency(item.amount, regionalSettings)} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW 5: FEUILLE DE TEMPÉRATURE & CONSTANTES CLINIQUES               */}
        {/* ------------------------------------------------------------------- */}
        {analyticsViewTab === "vitals" && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-500" />
                <span className="font-bold text-[var(--text-primary)]">
                  Suivi des constantes vitales
                </span>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedPatientForVitals}
                  onChange={(e) => setSelectedPatientForVitals(e.target.value)}
                  className="bg-[var(--glass-input-bg)] text-[var(--glass-input-text)] border border-[var(--glass-input-border)] rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer focus:border-[#1261A0] dark:focus:border-cyan-400"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName.toUpperCase()} {p.firstName} ({p.patientCode})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handlePrintTemperatureSheet}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-[#1261A0] dark:text-[#55D9FF] font-semibold text-xs transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsLongitudinalData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                  <XAxis dataKey="date" stroke={chartAxisStroke} fontSize={11} tickLine={false} />
                  <YAxis stroke={chartAxisStroke} fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomGlassTooltip />} />
                  <Line type="monotone" dataKey="temp" name="Température" unit="°C" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: "#EF4444", stroke: "#ffffff", strokeWidth: 1.5, r: 3.5 }} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" animationBegin={100} activeDot={{ r: 6.5, strokeWidth: 2.5, stroke: "#ffffff", fill: "#EF4444" }} />
                  <Line type="monotone" dataKey="taSys" name="TA Systolique" unit="mmHg" stroke="#55D9FF" strokeWidth={2} dot={{ fill: "#55D9FF", stroke: "#ffffff", strokeWidth: 1.5, r: 3.5 }} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" animationBegin={220} activeDot={{ r: 6.5, strokeWidth: 2.5, stroke: "#ffffff", fill: "#55D9FF" }} />
                  <Line type="monotone" dataKey="taDia" name="TA Diastolique" unit="mmHg" stroke="#4F7DF3" strokeWidth={2} dot={{ fill: "#4F7DF3", stroke: "#ffffff", strokeWidth: 1.5, r: 3.5 }} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" animationBegin={340} activeDot={{ r: 6.5, strokeWidth: 2.5, stroke: "#ffffff", fill: "#4F7DF3" }} />
                  <Line type="monotone" dataKey="pouls" name="Pouls" unit="bpm" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", stroke: "#ffffff", strokeWidth: 1.5, r: 3.5 }} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" animationBegin={460} activeDot={{ r: 6.5, strokeWidth: 2.5, stroke: "#ffffff", fill: "#10B981" }} />
                  <Line type="monotone" dataKey="spo2" name="SpO₂" unit="%" stroke="#D9B45B" strokeWidth={2} dot={{ fill: "#D9B45B", stroke: "#ffffff", strokeWidth: 1.5, r: 3.5 }} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" animationBegin={580} activeDot={{ r: 6.5, strokeWidth: 2.5, stroke: "#ffffff", fill: "#D9B45B" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Two Column Grid: Active Clinical Queue & Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Clinical Queue & Recent Visits */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-[#1261A0] dark:text-[#55D9FF]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                    File d'Attente & Passages du Jour
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {activeVisitsCount} patient(s) actuellement pris en charge
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab("cashier")}
                >
                  Accueil & Caisse
                </GlassButton>
              </div>
            </div>

            <div className="space-y-2.5">
              {visits.map((vis) => {
                const patient = patients.find((p) => p.id === vis.patientId);
                if (!patient) return null;

                return (
                  <div
                    key={vis.id}
                    className="p-3.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] border border-[var(--border)] transition-all flex items-center justify-between gap-4 glass-interactive"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#071A33]/90 dark:bg-[#09223f] border border-cyan-400/30 text-cyan-300 flex flex-col items-center justify-center font-mono font-bold shrink-0">
                        <span className="text-[9px] text-slate-300 uppercase">Ticket</span>
                        <span className="text-xs">{vis.queueNumber}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[var(--text-primary)] truncate flex items-center gap-2">
                          <span>{patient.lastName.toUpperCase()} {patient.firstName}</span>
                          {patient.bloodGroup && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                              {patient.bloodGroup}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                          <span className="font-mono text-[#1261A0] dark:text-cyan-300 font-bold">{vis.visitCode}</span>
                          <span>·</span>
                          <span className="text-[var(--text-primary)] font-medium">{vis.type}</span>
                          {vis.notes && (
                            <>
                              <span className="hidden sm:inline">·</span>
                              <span className="text-[var(--text-muted)] truncate hidden sm:inline">{vis.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      {/* Interactive Status Toggle Badge */}
                      <button
                        onClick={() => {
                          const newStatus = vis.status === "EN_COURS" ? "TERMINE" : "EN_COURS";
                          updateVisitStatus(vis.id, newStatus);
                          showToast("INFO", "Statut Modifié", `${vis.visitCode} marqué ${newStatus}`);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          vis.status === "EN_COURS"
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/40 hover:bg-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30"
                        }`}
                        title="Cliquer pour basculer En cours / Terminé"
                      >
                        {vis.status === "EN_COURS" ? "En cours ●" : "Terminé ✓"}
                      </button>

                      {/* Direct Action: Consulter */}
                      {vis.type === "CONSULTATION" && (
                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setActiveTab("consultations");
                          }}
                          className="px-2 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 text-xs font-bold text-blue-600 dark:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Ouvrir la consultation directement"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Consulter</span>
                        </button>
                      )}

                      {/* Direct Action: Soin */}
                      {vis.type === "SOIN" && (
                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setActiveTab("care");
                          }}
                          className="px-2 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-xs font-bold text-teal-600 dark:text-teal-300 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Administrer le soin directement"
                        >
                          <Syringe className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Soigner</span>
                        </button>
                      )}

                      {/* Direct Action: Encaisser */}
                      <button
                        onClick={() => {
                          const patientInv = invoices.find((i) => i.patientId === patient.id && i.balance > 0);
                          if (patientInv) {
                            setDirectPaymentInvoiceId(patientInv.id);
                            setDirectPaymentAmount(patientInv.balance.toString());
                          } else {
                            setDirectPaymentAmount("15000");
                          }
                          setIsDirectPaymentOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#D9B45B]/15 hover:bg-[#D9B45B]/25 border border-[#D9B45B]/30 text-xs font-bold text-amber-700 dark:text-[#D9B45B] transition-colors flex items-center gap-1 cursor-pointer"
                        title="Encaisser les frais de ce passage"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Payer</span>
                      </button>

                      {/* Dossier button */}
                      <button
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setActiveTab("patients");
                        }}
                        className="p-1.5 rounded-lg hover:bg-[var(--surface-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        title="Ouvrir le dossier médical permanent"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Column (1 Col): Today's Appointments & Key Contacts */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Rendez-vous du Jour
                </h3>
              </div>
              <button
                onClick={() => setActiveTab("appointments")}
                className="text-[11px] text-[#1261A0] dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                Agenda Complet →
              </button>
            </div>

            <div className="space-y-2.5">
              {appointments.slice(0, 4).map((rdv) => (
                <div
                  key={rdv.id}
                  className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] hover:border-[var(--border-active)] transition-all text-xs glass-interactive space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
                    <span className="text-violet-600 dark:text-violet-300 font-mono">{rdv.timeSlot}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-400/30">
                        {rdv.status}
                      </span>
                      {rdv.status !== "EFFECTUE" && (
                        <button
                          onClick={() => {
                            const newVis = addVisit({
                              patientId: rdv.patientId,
                              siteId: currentSite.id,
                              type: "CONSULTATION",
                              status: "EN_COURS",
                              queueNumber: `A-${Math.floor(10 + Math.random() * 89)}`,
                              priority: "NORMALE",
                              createdById: currentUser.id,
                              createdByName: currentUser.fullName,
                              notes: `Arrivée RDV : ${rdv.motif}`,
                            });
                            updateAppointmentStatus(rdv.id, "EFFECTUE");
                            setSelectedPatientId(rdv.patientId);
                            showToast("SUCCESS", "Patient Admis", `Ticket ${newVis.queueNumber} émis depuis le rendez-vous.`);
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 cursor-pointer"
                          title="Patient arrivé : émettre ticket de passage direct"
                        >
                          + Ticket
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="font-medium text-[var(--text-primary)] line-clamp-1">{rdv.motif}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{rdv.practitionerName}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* MODAL DIRECT 1: NOUVEAU PASSAGE RAPIDE */}
      <GlassModal
        isOpen={isDirectAdmissionOpen}
        onClose={() => setIsDirectAdmissionOpen(false)}
        title="Admission Directe / Nouveau Passage"
        subtitle="Génération d'un ticket de file d'attente pour un patient existant"
        icon={<Plus className="w-5 h-5 text-cyan-400" />}
        maxWidth="md"
      >
        <form onSubmit={handleExecuteDirectAdmission} className="space-y-4">
          <GlassSelect
            label="Sélectionner le Patient *"
            value={admissionPatientId}
            onChange={(e) => setAdmissionPatientId(e.target.value)}
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.lastName.toUpperCase()} ${p.firstName} (${p.patientCode} - ${p.phone || "sans tel"})`,
            }))}
          />

          <div className="grid grid-cols-2 gap-3.5">
            <GlassSelect
              label="Service Demandé *"
              value={admissionType}
              onChange={(e) => setAdmissionType(e.target.value as any)}
              options={[
                { value: "CONSULTATION", label: "Consultation Médicale" },
                { value: "SOIN", label: "Soin Infirmier" },
                { value: "MATERNITE", label: "Maternité / CPN" },
                { value: "LABORATOIRE", label: "Laboratoire" },
                { value: "IMAGERIE", label: "Imagerie" },
                { value: "URGENCE", label: "Urgence" },
              ]}
            />

            <GlassSelect
              label="Priorité *"
              value={admissionPriority}
              onChange={(e) => setAdmissionPriority(e.target.value as any)}
              options={[
                { value: "NORMALE", label: "Normale" },
                { value: "URGENTE", label: "Urgente" },
              ]}
            />
          </div>

          <GlassTextarea
            label="Motif d'arrivée / Notes d'accueil"
            placeholder="Ex: Céphalées, contrôle de routine..."
            value={admissionNotes}
            onChange={(e) => setAdmissionNotes(e.target.value)}
            rows={2}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <GlassButton type="button" variant="ghost" size="md" onClick={() => setIsDirectAdmissionOpen(false)}>
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="md">
              Émettre Ticket
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* MODAL DIRECT 2: NOUVEAU PATIENT (AVEC DÉTECTION ANTI-DOUBLON) */}
      <GlassModal
        isOpen={isExpressPatientOpen}
        onClose={() => setIsExpressPatientOpen(false)}
        title="Création d'un Nouveau Patient"
        subtitle="Enregistrement d'un dossier médical permanent avec détection anti-doublon"
        icon={<UserPlus className="w-5 h-5 text-[#D9B45B]" />}
        maxWidth="md"
      >
        <form onSubmit={handleExecuteExpressPatient} className="space-y-3.5">
          {/* Alerte Anti-Doublon Active FONA */}
          {potentialDuplicatePatient && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 space-y-2 animate-fona-scale-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-amber-300">
                    Patient existant potentiel identifié !
                  </div>
                  <div className="text-[11px] text-slate-200 mt-0.5">
                    <span className="font-semibold text-white">
                      {potentialDuplicatePatient.lastName.toUpperCase()} {potentialDuplicatePatient.firstName}
                    </span>{" "}
                    ({potentialDuplicatePatient.patientCode}) &middot; Tél : {potentialDuplicatePatient.phone}
                  </div>
                  <p className="text-[10px] text-amber-200/80 mt-1">
                    Règle FONA : Un patient possède un dossier unique permanent. Privilégiez un nouveau passage plutôt que la duplication du dossier.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-amber-400/20 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setAdmissionPatientId(potentialDuplicatePatient.id);
                    setIsExpressPatientOpen(false);
                    setIsDirectAdmissionOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#1261A0] text-white hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Utiliser ce patient & Nouveau passage
                </button>
                <button
                  type="button"
                  onClick={() => setExpressDuplicateIgnored(true)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
                >
                  {expressDuplicateIgnored ? "✓ Homonyme validé" : "Créer quand même (Homonyme distinct)"}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <GlassInput
              label="Nom de famille *"
              placeholder="Ex: TRAORE"
              value={expressLastName}
              onChange={(e) => {
                setExpressLastName(e.target.value);
                setExpressDuplicateIgnored(false);
              }}
              required
            />
            <GlassInput
              label="Prénom(s) *"
              placeholder="Ex: Salif"
              value={expressFirstName}
              onChange={(e) => {
                setExpressFirstName(e.target.value);
                setExpressDuplicateIgnored(false);
              }}
              required
            />
          </div>

          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-5">
              <GlassSelect
                label="Sexe *"
                value={expressSex}
                onChange={(e) => setExpressSex(e.target.value as any)}
                options={[
                  { value: "FEMALE", label: "Féminin" },
                  { value: "MALE", label: "Masculin" },
                ]}
              />
            </div>
            <div className="col-span-7">
              <GlassInput
                label="Âge (ans) ou Année *"
                placeholder="Ex: 28"
                type="number"
                value={expressAge}
                onChange={(e) => setExpressAge(e.target.value)}
                unit="ans"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GlassInput
              label="Téléphone *"
              placeholder="Ex: +223 70 00 00 00"
              value={expressPhone}
              onChange={(e) => {
                setExpressPhone(e.target.value);
                setExpressDuplicateIgnored(false);
              }}
              required
            />
            <GlassInput
              label="Quartier / Ville"
              placeholder="Ex: Bamako"
              value={expressAddress}
              onChange={(e) => setExpressAddress(e.target.value)}
            />
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={expressAutoAdmit}
                onChange={(e) => setExpressAutoAdmit(e.target.checked)}
                className="w-4 h-4 rounded text-[#1261A0]"
              />
              <span>Générer automatiquement un ticket de passage dans la file d'attente</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <GlassButton type="button" variant="ghost" size="md" onClick={() => setIsExpressPatientOpen(false)}>
              Annuler
            </GlassButton>
            <GlassButton
              type="submit"
              variant="gold"
              size="md"
              disabled={Boolean(potentialDuplicatePatient && !expressDuplicateIgnored)}
            >
              Créer Dossier Patient
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* MODAL DIRECT 3: ENCAISSEMENT RAPIDE DASHBOARD */}
      <GlassModal
        isOpen={isDirectPaymentOpen}
        onClose={() => setIsDirectPaymentOpen(false)}
        title="Encaissement Rapide de Caisse"
        subtitle="Règlement immédiat d'une facture sans quitter le tableau de bord"
        icon={<CreditCard className="w-5 h-5 text-emerald-400" />}
        maxWidth="md"
      >
        <form onSubmit={handleExecuteDirectPayment} className="space-y-4">
          <GlassSelect
            label="Sélectionner la Facture à Encaisser *"
            value={directPaymentInvoiceId}
            onChange={(e) => {
              const id = e.target.value;
              setDirectPaymentInvoiceId(id);
              const inv = invoices.find((i) => i.id === id);
              if (inv) setDirectPaymentAmount(inv.balance.toString());
            }}
            options={invoices
              .filter((i) => i.balance > 0)
              .map((i) => {
                const pat = patients.find((p) => p.id === i.patientId);
                return {
                  value: i.id,
                  label: `${i.invoiceCode} — ${pat?.lastName.toUpperCase()} ${pat?.firstName} (Reste : ${formatCurrency(i.balance, regionalSettings)})`,
                };
              })}
          />

          <div className="grid grid-cols-2 gap-3.5">
            <GlassInput
              label="Montant Reçu *"
              type="number"
              value={directPaymentAmount}
              onChange={(e) => setDirectPaymentAmount(e.target.value)}
              unit="FCFA"
              required
            />

            <GlassSelect
              label="Mode de Paiement *"
              value={directPaymentMethod}
              onChange={(e) => setDirectPaymentMethod(e.target.value as any)}
              options={[
                { value: "MOBILE_MONEY", label: "Mobile Money" },
                { value: "ESPECES", label: "Espèces (Guichet)" },
                { value: "CARTE", label: "Carte Bancaire" },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <GlassButton type="button" variant="ghost" size="md" onClick={() => setIsDirectPaymentOpen(false)}>
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="gold" size="md" icon={<Receipt className="w-4 h-4" />}>
              Valider le Paiement & Émettre Reçu
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* MODAL DIRECT 4: PROGRAMMER UN RENDEZ-VOUS RAPIDE */}
      <GlassModal
        isOpen={isDirectAppointmentOpen}
        onClose={() => setIsDirectAppointmentOpen(false)}
        title="Nouveau Rendez-vous Médical"
        subtitle="Planification rapide d'une consultation ou suivi médical"
        icon={<CalendarPlus className="w-5 h-5 text-indigo-400" />}
        maxWidth="md"
      >
        <form onSubmit={handleExecuteDirectAppointment} className="space-y-4">
          <GlassSelect
            label="Patient *"
            value={directRdvPatientId}
            onChange={(e) => setDirectRdvPatientId(e.target.value)}
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.lastName.toUpperCase()} ${p.firstName} (${p.patientCode} - ${p.phone || "sans tel"})`,
            }))}
          />

          <div className="grid grid-cols-2 gap-3.5">
            <GlassInput
              label="Date du Rendez-vous *"
              type="date"
              value={directRdvDate}
              onChange={(e) => setDirectRdvDate(e.target.value)}
              required
            />
            <GlassInput
              label="Heure *"
              type="time"
              value={directRdvTime}
              onChange={(e) => setDirectRdvTime(e.target.value)}
              required
            />
          </div>

          <GlassSelect
            label="Praticien / Soignant Assigné *"
            value={directRdvPractitionerId}
            onChange={(e) => setDirectRdvPractitionerId(e.target.value)}
            options={[
              { value: "usr-practitioner", label: "Dr. Mariam Traoré (Médecine Générale)" },
              { value: "usr-admin", label: "Dr. Armand Koné (Direction Médicale)" },
              { value: "usr-midwife", label: "Awa Bamba-Diabaté (Maternité / Sage-Femme)" },
            ]}
          />

          <GlassInput
            label="Motif du Rendez-vous *"
            placeholder="Ex: Contrôle tensionnel, consultation prénatale, pansement..."
            value={directRdvMotif}
            onChange={(e) => setDirectRdvMotif(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <GlassButton type="button" variant="ghost" size="md" onClick={() => setIsDirectAppointmentOpen(false)}>
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="md" icon={<CalendarPlus className="w-4 h-4" />}>
              Confirmer le Rendez-vous
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Customizable Dashboard KPI Modal */}
      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        userRole={currentUser.role}
        activeWidgetIds={activeWidgetIds}
        onSaveWidgets={handleSaveWidgetPreferences}
      />
    </div>
  );
};
