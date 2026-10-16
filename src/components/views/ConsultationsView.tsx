import React, { useState, useMemo, useEffect } from "react";
import {
  Stethoscope,
  Heart,
  Thermometer,
  Activity,
  Wind,
  Weight,
  Ruler,
  Plus,
  Trash2,
  Printer,
  FileCheck,
  Calendar,
  AlertCircle,
  TrendingUp,
  LineChart,
  User,
  TestTube2,
  ScanLine,
  Syringe,
  CreditCard,
  Sparkles,
  Check,
  Edit3,
  History,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  FileText,
  X,
  Save,
  RotateCcw,
  FileEdit,
  Clock,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassInput, GlassSelect, GlassTextarea } from "../ui/GlassFormControls";
import { GlassEmptyState } from "../ui/GlassEmptyState";
import { PrescriptionItem, Diagnosis, VitalSign, Consultation } from "../../types";
import { canUserModifyConsultation } from "../../services/rbacService";

export const ConsultationsView: React.FC = () => {
  const {
    patients,
    visits,
    consultations,
    addConsultation,
    updateConsultationClinicalData,
    addLabRequest,
    addImagingRequest,
    addCare,
    addInvoice,
    currentUser,
    currentSite,
    selectedPatientId,
    setSelectedPatientId,
    setActiveTab: setGlobalTab,
    setPrintableDoc,
    showToast,
    formatDate,
    formatDateTime,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"NEW" | "HISTORY" | "TEMPERATURE_SHEET">("NEW");
  const [recentCreatedConsultation, setRecentCreatedConsultation] = useState<Consultation | null>(null);

  // State for Audited Clinical Modification Modal
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [editMotif, setEditMotif] = useState("");
  const [editClinicalExam, setEditClinicalExam] = useState("");
  const [editDiagnoses, setEditDiagnoses] = useState<Diagnosis[]>([]);
  const [editCarePlan, setEditCarePlan] = useState("");
  const [editConclusion, setEditConclusion] = useState("");
  const [editReason, setEditReason] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [expandedAuditIds, setExpandedAuditIds] = useState<Record<string, boolean>>({});

  // Selected Patient
  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Quick Action: Normal Vitals in 1 Click
  const handleApplyNormalVitals = () => {
    setTemperature("37.0");
    setSystolicBP("120");
    setDiastolicBP("80");
    setHeartRate("72");
    setRespiratoryRate("16");
    setOxygenSaturation("98");
    showToast("INFO", "Constantes Initialisées", "Valeurs physiologiques normales appliquées.");
  };

  // Action Rapide: Préréglages Diagnostics Fréquents en 1 Clic (Sans prescription numérique)
  const handleApplyDiagnosticPreset = (preset: "PALU" | "HTA" | "BRONCHO" | "GASTRO") => {
    if (preset === "PALU") {
      setDiagnoses([
        {
          id: `diag-${Date.now()}`,
          label: "Paludisme simple / Accès palustre confirmé",
          icdCode: "B54",
          isPrimary: true,
          startDate: new Date().toISOString().split("T")[0],
        },
      ]);
      setMotif("Accès fébrile avec frissons, céphalées intenses et courbatures");
      setCarePlan("Repos au lit, bonne hydratation. Ordonnance établie sur ordonnancier physique (CTA). Reconsulter à 48h si fièvre persistante.");
      showToast("SUCCESS", "Diagnostic Paludisme Appliqué", "Diagnostic et conduite thérapeutique pré-remplis.");
    } else if (preset === "HTA") {
      setDiagnoses([
        {
          id: `diag-${Date.now()}`,
          label: "Hypertension Artérielle Essentielle (HTA)",
          icdCode: "I10",
          isPrimary: true,
          startDate: new Date().toISOString().split("T")[0],
        },
      ]);
      setMotif("Surveillance tensionnelle / Céphalées matinales en casque");
      setCarePlan("Régime hyposodé, arrêt tabac/alcool, activité physique modérée. Traitement noté sur ordonnancier papier. Contrôle TA sous 15 jours.");
      showToast("SUCCESS", "Diagnostic HTA Appliqué", "Diagnostic HTA pré-rempli.");
    } else if (preset === "BRONCHO") {
      setDiagnoses([
        {
          id: `diag-${Date.now()}`,
          label: "Infection Respiratoire Aiguë / Broncho-pneumopathie",
          icdCode: "J20.9",
          isPrimary: true,
          startDate: new Date().toISOString().split("T")[0],
        },
      ]);
      setMotif("Toux productive, râles bronchiques et fébricule");
      setCarePlan("Surveillance respiratoire. Traitement rédigé sur carnet d'ordonnances officiel.");
      showToast("SUCCESS", "Diagnostic Broncho Appliqué", "Diagnostic respiratoire pré-rempli.");
    } else {
      setDiagnoses([
        {
          id: `diag-${Date.now()}`,
          label: "Gastro-entérite aiguë / Syndrome diarrhéique",
          icdCode: "A09",
          isPrimary: true,
          startDate: new Date().toISOString().split("T")[0],
        },
      ]);
      setMotif("Douleurs abdominales diffuses et diarrhée liquide aiguë");
      setCarePlan("SRO (Soluté de Réhydratation Orale) en abondance. Conduite et traitement prescrits sur ordonnancier physique.");
      showToast("SUCCESS", "Diagnostic Gastro Appliqué", "Diagnostic gastro-entérite pré-rempli.");
    }
  };

  // Direct Referral Actions
  const handleQuickOrderLab = () => {
    if (!activePatient) return;
    addLabRequest({
      visitId: `vis-lab-${Date.now()}`,
      patientId: activePatient.id,
      siteId: currentSite.id,
      requesterName: currentUser.fullName,
      priority: "NORMALE",
      status: "DEMANDE",
      clinicalNotes: motif ? `Bilan prescrit suite à consultation : ${motif}` : "Bilan prescrit en consultation",
      tests: [
        { id: `t-1`, testName: "Goutte Épaisse & TDR Paludisme", category: "PARASITOLOGIE", referenceRange: "Négatif", unit: "qualitatif" },
        { id: `t-2`, testName: "NFS Complète", category: "HEMATOLOGIE", referenceRange: "12-16", unit: "g/dL" },
        { id: `t-3`, testName: "CRP", category: "BIOCHIMIE", referenceRange: "< 5.0", unit: "mg/L" },
      ],
    });
    showToast("SUCCESS", "Bilan Labo Transmis", "La demande biologique a été créée pour le laboratoire.");
  };

  const handleQuickOrderImaging = () => {
    if (!activePatient) return;
    addImagingRequest({
      visitId: `vis-img-${Date.now()}`,
      patientId: activePatient.id,
      siteId: currentSite.id,
      requesterName: currentUser.fullName,
      modality: "RADIOLOGIE",
      examName: "Radiographie Pulmonaire Thorax Face",
      indication: motif || "Suspicion de foyer infectieux",
      findings: "",
      conclusion: "",
      status: "DEMANDE",
    });
    showToast("SUCCESS", "Demande Imagerie Transmise", "Radio Thorax demandée auprès du service d'imagerie.");
  };

  const handleQuickOrderCare = () => {
    if (!activePatient) return;
    addCare({
      visitId: `vis-care-${Date.now()}`,
      patientId: activePatient.id,
      siteId: currentSite.id,
      nurseId: currentUser.id,
      nurseName: "Soins Infirmiers CM FONA",
      careType: "Injection Intramusculaire / Perfusion",
      productsUsed: [{ name: "Kit injection prescrite", source: "FONA", quantity: "1" }],
      observations: `Soin prescrit par ${currentUser.fullName} suite consultation : ${motif}`,
    });
    showToast("SUCCESS", "Soin Infirmier Transmis", "Fiche de soin envoyée à l'équipe infirmière.");
  };

  const handleQuickInvoice = () => {
    if (!activePatient) return;
    addInvoice({
      visitId: `vis-inv-${Date.now()}`,
      patientId: activePatient.id,
      siteId: currentSite.id,
      items: [{ id: `it-cons`, description: "Consultation Médicale FONA", quantity: 1, unitPrice: 15000, total: 15000 }],
      totalAmount: 15000,
      paidAmount: 0,
    });
    showToast("SUCCESS", "Facture Transmise en Caisse", "Facture de 15.000 FCFA mise en attente de paiement.");
  };

  // Consultation Form State
  const [motif, setMotif] = useState("");
  const [historyOfIllness, setHistoryOfIllness] = useState("");
  const [clinicalExam, setClinicalExam] = useState("");

  // Vitals State
  const [temperature, setTemperature] = useState("37.2");
  const [systolicBP, setSystolicBP] = useState("120");
  const [diastolicBP, setDiastolicBP] = useState("80");
  const [heartRate, setHeartRate] = useState("75");
  const [respiratoryRate, setRespiratoryRate] = useState("16");
  const [oxygenSaturation, setOxygenSaturation] = useState("98");
  const [weight, setWeight] = useState("65");
  const [height, setHeight] = useState("170");

  // Auto-calculated BMI
  const calculatedBMI = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return "";
  }, [weight, height]);

  // Diagnoses List
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([
    {
      id: "diag-init",
      label: "",
      icdCode: "",
      isPrimary: true,
      startDate: new Date().toISOString().split("T")[0],
    },
  ]);

  // Examens Complémentaires & Résultats (Champ libre)
  const [complementaryExamsNotes, setComplementaryExamsNotes] = useState("");

  const [carePlan, setCarePlan] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<string | null>(null);

  const handleAddDiagnosis = () => {
    setDiagnoses([
      ...diagnoses,
      {
        id: `diag-${Date.now()}-${diagnoses.length}`,
        label: "",
        icdCode: "",
        isPrimary: false,
        startDate: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handleRemoveDiagnosis = (index: number) => {
    if (diagnoses.length <= 1) return;
    setDiagnoses(diagnoses.filter((_, idx) => idx !== index));
  };

  // Auto-restore draft from localStorage when patient changes
  useEffect(() => {
    if (!activePatient) return;
    try {
      const storageKey = `fona_draft_cons_${activePatient.id}_${currentUser.id}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft && (draft.motif || draft.clinicalExam || (draft.diagnoses && draft.diagnoses[0]?.label))) {
          if (draft.motif) setMotif(draft.motif);
          if (draft.historyOfIllness) setHistoryOfIllness(draft.historyOfIllness);
          if (draft.clinicalExam) setClinicalExam(draft.clinicalExam);
          if (draft.temperature) setTemperature(draft.temperature);
          if (draft.systolicBP) setSystolicBP(draft.systolicBP);
          if (draft.diastolicBP) setDiastolicBP(draft.diastolicBP);
          if (draft.heartRate) setHeartRate(draft.heartRate);
          if (draft.respiratoryRate) setRespiratoryRate(draft.respiratoryRate);
          if (draft.oxygenSaturation) setOxygenSaturation(draft.oxygenSaturation);
          if (draft.weight) setWeight(draft.weight);
          if (draft.height) setHeight(draft.height);
          if (draft.diagnoses && Array.isArray(draft.diagnoses)) setDiagnoses(draft.diagnoses);
          if (draft.complementaryExamsNotes) setComplementaryExamsNotes(draft.complementaryExamsNotes);
          if (draft.carePlan) setCarePlan(draft.carePlan);
          if (draft.conclusion) setConclusion(draft.conclusion);
          if (draft.savedAt) {
            setLastDraftSavedAt(new Date(draft.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
        }
      }
    } catch {
      // ignore
    }
  }, [activePatient?.id, currentUser.id]);

  // Auto-save draft whenever clinical fields change
  useEffect(() => {
    if (!activePatient) return;
    const hasData = Boolean(
      motif.trim() ||
      historyOfIllness.trim() ||
      clinicalExam.trim() ||
      complementaryExamsNotes.trim() ||
      carePlan.trim() ||
      conclusion.trim() ||
      diagnoses.some((d) => d.label.trim())
    );

    if (!hasData) return;

    const timeout = setTimeout(() => {
      try {
        const storageKey = `fona_draft_cons_${activePatient.id}_${currentUser.id}`;
        const draftPayload = {
          motif,
          historyOfIllness,
          clinicalExam,
          temperature,
          systolicBP,
          diastolicBP,
          heartRate,
          respiratoryRate,
          oxygenSaturation,
          weight,
          height,
          diagnoses,
          complementaryExamsNotes,
          carePlan,
          conclusion,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(draftPayload));
        setLastDraftSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        // storage quota fallback
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [
    motif,
    historyOfIllness,
    clinicalExam,
    temperature,
    systolicBP,
    diastolicBP,
    heartRate,
    respiratoryRate,
    oxygenSaturation,
    weight,
    height,
    diagnoses,
    complementaryExamsNotes,
    carePlan,
    conclusion,
    activePatient?.id,
    currentUser.id,
  ]);

  const handleClearDraft = () => {
    if (activePatient) {
      try {
        localStorage.removeItem(`fona_draft_cons_${activePatient.id}_${currentUser.id}`);
      } catch {}
    }
    setMotif("");
    setHistoryOfIllness("");
    setClinicalExam("");
    setComplementaryExamsNotes("");
    setCarePlan("");
    setConclusion("");
    setDiagnoses([
      {
        id: "diag-init",
        label: "",
        icdCode: "",
        isPrimary: true,
        startDate: new Date().toISOString().split("T")[0],
      },
    ]);
    setLastDraftSavedAt(null);
    showToast("INFO", "Formulaire Réinitialisé", "La saisie en cours a été effacée.");
  };

  const handleResumeConsultation = (cons: Consultation) => {
    setMotif(cons.motif || "");
    setHistoryOfIllness(cons.historyOfIllness || "");
    setClinicalExam(cons.clinicalExam || "");
    setComplementaryExamsNotes(cons.complementaryExamsNotes || "");
    setCarePlan(cons.carePlan || "");
    setConclusion(cons.conclusion || "");
    if (cons.diagnoses && cons.diagnoses.length > 0) {
      setDiagnoses(JSON.parse(JSON.stringify(cons.diagnoses)));
    }
    if (cons.vitalSigns && cons.vitalSigns.length > 0) {
      const v = cons.vitalSigns[cons.vitalSigns.length - 1];
      if (v.temperature) setTemperature(v.temperature.toString());
      if (v.systolicBP) setSystolicBP(v.systolicBP.toString());
      if (v.diastolicBP) setDiastolicBP(v.diastolicBP.toString());
      if (v.heartRate) setHeartRate(v.heartRate.toString());
      if (v.respiratoryRate) setRespiratoryRate(v.respiratoryRate.toString());
      if (v.oxygenSaturation) setOxygenSaturation(v.oxygenSaturation.toString());
      if (v.weight) setWeight(v.weight.toString());
      if (v.height) setHeight(v.height.toString());
    }
    setActiveTab("NEW");
    showToast("SUCCESS", "Acte Chargé", `Les données de ${cons.consultationCode} ont été chargées pour poursuite de l'examen.`);
  };

  const handleSaveWithStatus = (targetStatus: "BROUILLON" | "EN_COURS" | "TERMINE") => {
    if (isSubmitting) return;

    if (targetStatus === "TERMINE") {
      if (!motif.trim()) {
        showToast("WARNING", "Motif Requis", "Veuillez renseigner le motif avant de terminer la consultation.");
        return;
      }
      const hasClinicalOrDiag =
        clinicalExam.trim().length > 0 || diagnoses.some((d) => d.label.trim().length > 0);
      if (!hasClinicalOrDiag) {
        showToast(
          "WARNING",
          "Consultation Incomplète",
          "Une consultation ne peut être validée comme terminée sans examen clinique ou diagnostic. Vous pouvez l'enregistrer en brouillon ou en cours."
        );
        return;
      }
    } else {
      if (!motif.trim() && !clinicalExam.trim()) {
        showToast("WARNING", "Saisie Minimale Requise", "Renseignez au minimum le motif ou une observation pour enregistrer.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const vitalsRecord: VitalSign = {
        id: `vit-${Date.now()}`,
        measuredAt: new Date().toISOString(),
        measuredBy: currentUser.fullName,
        temperature: parseFloat(temperature) || undefined,
        systolicBP: parseFloat(systolicBP) || undefined,
        diastolicBP: parseFloat(diastolicBP) || undefined,
        heartRate: parseFloat(heartRate) || undefined,
        respiratoryRate: parseFloat(respiratoryRate) || undefined,
        oxygenSaturation: parseFloat(oxygenSaturation) || undefined,
        weight: parseFloat(weight) || undefined,
        height: parseFloat(height) || undefined,
        bmi: parseFloat(calculatedBMI) || undefined,
      };

      const validDiag = diagnoses.filter((d) => d.label.trim().length > 0);

      const newCons = addConsultation({
        visitId: `vis-curr-${Date.now()}`,
        patientId: activePatient.id,
        siteId: currentSite.id,
        practitionerId: currentUser.id,
        practitionerName: currentUser.fullName,
        motif: motif.trim() || "Consultation médicale",
        historyOfIllness,
        clinicalExam,
        vitalSigns: [vitalsRecord],
        diagnoses:
          validDiag.length > 0
            ? validDiag
            : [
                {
                  id: `d-${Date.now()}`,
                  label: targetStatus === "TERMINE" ? "Examen clinique normal" : "En cours d'exploration",
                  isPrimary: true,
                  startDate: new Date().toISOString().split("T")[0],
                },
              ],
        complementaryExamsNotes,
        carePlan,
        prescriberName: `${currentUser.fullName} — ${currentSite.name}`,
        prescriptions: [],
        conclusion:
          conclusion ||
          (targetStatus === "TERMINE"
            ? "Consultation validée. Traitement noté sur ordonnancier physique."
            : targetStatus === "EN_COURS"
            ? "Consultation médicale en cours d'exploration."
            : "Brouillon d'acte médical en attente de complément."),
        status: targetStatus,
      });

      // Clear draft on successful write
      try {
        localStorage.removeItem(`fona_draft_cons_${activePatient.id}_${currentUser.id}`);
      } catch {}
      setLastDraftSavedAt(null);

      // Reset Form fields
      setMotif("");
      setHistoryOfIllness("");
      setClinicalExam("");
      setComplementaryExamsNotes("");
      setCarePlan("");
      setConclusion("");
      setRecentCreatedConsultation(newCons);

      if (targetStatus === "BROUILLON") {
        showToast("INFO", "Brouillon Enregistré", `L'acte ${newCons.consultationCode} a été sauvegardé en brouillon.`);
      } else if (targetStatus === "EN_COURS") {
        showToast("INFO", "Consultation En Cours", `L'acte ${newCons.consultationCode} est marqué comme en cours.`);
      } else {
        showToast("SUCCESS", "Consultation Validée", `L'acte ${newCons.consultationCode} a été validé et consigné au dossier.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveWithStatus("TERMINE");
  };

  // Patient history of consultations
  const patientConsultations = useMemo(() => {
    return consultations.filter((c) => c.patientId === activePatient?.id);
  }, [consultations, activePatient]);

  return (
    <div className="space-y-6">
      {/* Patient Selector Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl glass-surface-subtle border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-[#4F7DF3] border border-blue-400/30 flex items-center justify-center font-black">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Patient sélectionné
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{activePatient.lastName.toUpperCase()} {activePatient.firstName}</span>
              <span className="font-mono text-cyan-300 text-xs">({activePatient.patientCode})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activePatient.id}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-[#081a33] text-xs text-slate-200 rounded-xl border border-white/15 px-3 py-2 focus:outline-none"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.lastName.toUpperCase()} {p.firstName} — {p.patientCode}
              </option>
            ))}
          </select>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#051426] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("NEW")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "NEW" ? "bg-[#4F7DF3] text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Nouvelle
            </button>
            <button
              onClick={() => setActiveTab("TEMPERATURE_SHEET")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "TEMPERATURE_SHEET"
                  ? "bg-[#4F7DF3] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Feuille de T°
            </button>
            <button
              onClick={() => setActiveTab("HISTORY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "HISTORY" ? "bg-[#4F7DF3] text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Historique ({patientConsultations.length})
            </button>
          </div>
        </div>
      </div>

      {/* FEUILLE DE TEMPÉRATURE INTERACTIVE (Section 22 & 33) */}
      {activeTab === "TEMPERATURE_SHEET" && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#55D9FF] border border-cyan-400/30 flex items-center justify-center">
                <LineChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Feuille de Surveillance
                </h3>
              </div>
            </div>

            <GlassButton
              variant="secondary"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Imprimer Feuille de T°
            </GlassButton>
          </div>

          {/* Interactive Medical Temperature Curve SVG */}
          <div className="p-5 rounded-2xl bg-[#051426]/90 border border-white/10">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  Température (°C)
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
                  Fréquence Cardiaque (bpm)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  SpO₂ (%)
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">Surveillance hospitalière 72h</span>
            </div>

            {/* SVG Dual-Axis Chart */}
            <div className="w-full h-64 relative">
              <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
                {/* Horizontal Grid lines */}
                <line x1="50" y1="30" x2="680" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="50" y1="80" x2="680" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="50" y1="130" x2="680" y2="130" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="50" y1="180" x2="680" y2="180" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                {/* Y-Axis Labels */}
                <text x="15" y="35" fill="#f43f5e" fontSize="10" fontFamily="monospace">40°C</text>
                <text x="15" y="85" fill="#f43f5e" fontSize="10" fontFamily="monospace">39°C</text>
                <text x="15" y="135" fill="#f43f5e" fontSize="10" fontFamily="monospace">38°C</text>
                <text x="15" y="185" fill="#f43f5e" fontSize="10" fontFamily="monospace">37°C</text>

                {/* Temperature Curve (Rose) */}
                <polyline
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="70,140 170,95 270,75 370,110 470,135 570,175 660,180"
                />

                {/* Heart Rate Curve (Cyan) */}
                <polyline
                  fill="none"
                  stroke="#55D9FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                  points="70,110 170,60 270,50 370,80 470,110 570,140 660,150"
                />

                {/* Data Points */}
                <circle cx="70" cy="140" r="4" fill="#f43f5e" />
                <circle cx="170" cy="95" r="4" fill="#f43f5e" />
                <circle cx="270" cy="75" r="4" fill="#f43f5e" />
                <circle cx="370" cy="110" r="4" fill="#f43f5e" />
                <circle cx="470" cy="135" r="4" fill="#f43f5e" />
                <circle cx="570" cy="175" r="4" fill="#f43f5e" />
                <circle cx="660" cy="180" r="4" fill="#f43f5e" />

                {/* X-Axis Time steps */}
                <text x="60" y="215" fill="#94a3b8" fontSize="10">J-2 08h</text>
                <text x="160" y="215" fill="#94a3b8" fontSize="10">J-2 18h</text>
                <text x="260" y="215" fill="#94a3b8" fontSize="10">J-1 08h</text>
                <text x="360" y="215" fill="#94a3b8" fontSize="10">J-1 18h</text>
                <text x="460" y="215" fill="#94a3b8" fontSize="10">J-0 08h</text>
                <text x="560" y="215" fill="#94a3b8" fontSize="10">J-0 14h</text>
                <text x="645" y="215" fill="#94a3b8" fontSize="10">Actuel</text>
              </svg>
            </div>
          </div>
        </GlassCard>
      )}

      {/* NEW CLINICAL CONSULTATION FORM */}
      {activeTab === "NEW" && (
        <form onSubmit={handleSubmitConsultation} className="space-y-6 animate-fona-scale-in">
          {recentCreatedConsultation && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fona-modal shadow-[0_8px_30px_rgba(52,211,153,0.25)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 animate-fona-check-pop" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-300">
                    Consultation {recentCreatedConsultation.consultationCode} Enregistrée avec Succès
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Acte clinique archivé dans le dossier permanent de {activePatient.lastName.toUpperCase()} {activePatient.firstName}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("HISTORY")}
                  className="fona-btn-interactive px-3 py-1.5 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-200 text-xs font-semibold cursor-pointer"
                >
                  Voir dans l'Historique
                </button>
                <button
                  type="button"
                  onClick={() => setRecentCreatedConsultation(null)}
                  className="fona-btn-interactive px-2 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
                  title="Fermer ce message"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Auto-Save & Draft Persistence Banner */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${lastDraftSavedAt ? "bg-emerald-400" : "bg-cyan-400"} animate-pulse`} />
              <span className="font-semibold text-[var(--text-primary)]">
                {lastDraftSavedAt
                  ? `Brouillon auto-enregistré à ${lastDraftSavedAt}`
                  : "Prêt pour saisie clinique"}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
                &middot; Sauvegarde continue anti-perte de données
              </span>
            </div>
            {lastDraftSavedAt && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-[11px] text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Effacer le brouillon</span>
              </button>
            )}
          </div>

          {/* Section 1: Vital Signs Entry Grid */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#55D9FF]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Constantes Vitales de la Séance
                </h3>
              </div>
              <button
                type="button"
                onClick={handleApplyNormalVitals}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Valeurs Normales par Défaut</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <GlassInput
                label="T° (°C)"
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                icon={<Thermometer className="w-4 h-4 text-rose-400" />}
              />
              <GlassInput
                label="TA Syst."
                type="number"
                value={systolicBP}
                onChange={(e) => setSystolicBP(e.target.value)}
                unit="mmHg"
              />
              <GlassInput
                label="TA Diast."
                type="number"
                value={diastolicBP}
                onChange={(e) => setDiastolicBP(e.target.value)}
                unit="mmHg"
              />
              <GlassInput
                label="Pouls"
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                unit="bpm"
                icon={<Heart className="w-4 h-4 text-rose-400" />}
              />
              <GlassInput
                label="SpO₂"
                type="number"
                value={oxygenSaturation}
                onChange={(e) => setOxygenSaturation(e.target.value)}
                unit="%"
              />
              <GlassInput
                label="Poids"
                type="number"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                unit="kg"
              />
              <GlassInput
                label="Taille"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                unit="cm"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  IMC
                </label>
                <div className="h-10.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-[#55D9FF] flex items-center justify-center font-mono font-bold text-sm">
                  {calculatedBMI || "—"}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Section 2: Clinical Examination (Motif, Histoire, Examen) */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Stethoscope className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Anamnèse & Examen Clinique
              </h3>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Motif de Consultation *
                </label>
                <span className="text-[11px] text-slate-400">Remplissage rapide :</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  "Paludisme suspecté / Accès fébrile",
                  "Céphalées intenses & Vertiges",
                  "Toux grasse productive & Fièvre",
                  "Contrôle & Bilan HTA",
                  "Douleurs abdominales & Vomissements",
                  "Consultation de routine / Contrôle",
                  "Certificat médical d'aptitude",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMotif(preset)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <GlassInput
                placeholder="Ex: Céphalées fébriles et toux grasse productive depuis 3 jours..."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Signes Cliniques & Examen Physique *
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setClinicalExam(
                      "Examen sans particularité : Bon état général, constantes stables, auscultation cardio-pulmonaire normale, abdomen souple et dépressible, pas d'œdème des membres inférieurs."
                    )
                  }
                  className="text-[10px] text-cyan-300 hover:underline cursor-pointer"
                >
                  + Modèle Examen Normal
                </button>
              </div>
              <GlassTextarea
                placeholder="Description libre des signes cliniques, anamnèse, symptômes exprimés par le patient, constatations physiques..."
                value={clinicalExam}
                onChange={(e) => setClinicalExam(e.target.value)}
                rows={3}
              />
            </div>
          </GlassCard>

          {/* Section 3: Diagnoses (Principal + Associés) - Saisie Rapide en Texte Libre */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#8B7CFF]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Diagnostic(s) Médical(aux)
                </h3>
              </div>
              <GlassButton
                type="button"
                variant="secondary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddDiagnosis}
              >
                + Diagnostic Associé
              </GlassButton>
            </div>

            {/* Presets rapides de diagnostics fréquents */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                Diagnostics Fréquents (Remplissage 1 Clic)
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApplyDiagnosticPreset("PALU")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 transition-colors cursor-pointer"
                >
                  Paludisme Confirmé
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDiagnosticPreset("HTA")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-teal-300 transition-colors cursor-pointer"
                >
                  HTA Essentielle
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDiagnosticPreset("BRONCHO")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 text-blue-300 transition-colors cursor-pointer"
                >
                  Infection Respiratoire
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDiagnosticPreset("GASTRO")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-purple-300 transition-colors cursor-pointer"
                >
                  Gastro-entérite
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {diagnoses.map((diag, idx) => (
                <div key={diag.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-8">
                    <GlassInput
                      label={idx === 0 ? "Diagnostic Principal (Texte libre) *" : `Diagnostic Associé #${idx}`}
                      placeholder="Ex: Paludisme simple, Rhinopharyngite aiguë, Gastrite, Bronchite..."
                      value={diag.label}
                      onChange={(e) => {
                        const updated = [...diagnoses];
                        updated[idx].label = e.target.value;
                        setDiagnoses(updated);
                      }}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <GlassInput
                      label="Code CIM-10 (Facultatif)"
                      placeholder="Ex: B54, J00, I10"
                      value={diag.icdCode || ""}
                      onChange={(e) => {
                        const updated = [...diagnoses];
                        updated[idx].icdCode = e.target.value;
                        setDiagnoses(updated);
                      }}
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end pb-1">
                    {diagnoses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDiagnosis(idx)}
                        className="text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                        title="Supprimer ce diagnostic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Section 4: Examens Complémentaires & Observations Finales / Suivi */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Examens Complémentaires, Observations & Suivi
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <GlassTextarea
                  label="Examens Complémentaires & Résultats (Champ libre)"
                  placeholder="Examens prescrits ou apportés par le patient (Ex: GE/TDR Paludisme positif, NFS: Hb à 11.2 g/dL, CRP négative, Radio pulmonaire sans foyer net...)"
                  value={complementaryExamsNotes}
                  onChange={(e) => setComplementaryExamsNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassTextarea
                  label="Conduite Thérapeutique & Recommandations de Suivi"
                  placeholder="Ex: Repos strict 48h, hydratation abondante, surveillance de la température. RDV de contrôle dans 3 jours si persistance des symptômes."
                  value={carePlan}
                  onChange={(e) => setCarePlan(e.target.value)}
                  rows={2}
                />

                <GlassTextarea
                  label="Observations Finales & Synthèse Médicale"
                  placeholder="Ex: Épisode infectieux aigu pris en charge rapidement. Traitement noté sur ordonnancier physique CM FONA. Pronostic favorable."
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-xs text-cyan-200 flex items-center justify-between">
                <span>
                  <strong>Ordonnance :</strong> Les prescriptions médicamenteuses sont rédigées sur le carnet d'ordonnances physiques de CM FONA.
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                  Praticien : {currentUser.fullName}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Section 5: Direct Referral / Inter-Service Orders */}
          <GlassCard className="p-5 space-y-3 bg-white/[0.04] border border-cyan-400/20">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D9B45B]" />
                Prescriptions Directes Inter-Services (1 Clic)
              </span>
              <span className="text-[11px] text-cyan-300">Transmission immédiate aux pôles techniques</span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleQuickOrderLab}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-600/20 hover:bg-amber-600/30 border border-amber-400/40 text-amber-300 transition-colors cursor-pointer"
              >
                <TestTube2 className="w-3.5 h-3.5" />
                <span>+ Bilan Laboratoire (NFS, Palu, CRP)</span>
              </button>

              <button
                type="button"
                onClick={handleQuickOrderImaging}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-sky-600/20 hover:bg-sky-600/30 border border-sky-400/40 text-sky-300 transition-colors cursor-pointer"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>+ Radio Thorax / Imagerie</span>
              </button>

              <button
                type="button"
                onClick={handleQuickOrderCare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-600/20 hover:bg-teal-600/30 border border-teal-400/40 text-teal-300 transition-colors cursor-pointer"
              >
                <Syringe className="w-3.5 h-3.5" />
                <span>+ Soin / Injection Infirmière</span>
              </button>

              <button
                type="button"
                onClick={handleQuickInvoice}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#D9B45B]/20 hover:bg-[#D9B45B]/30 border border-[#D9B45B]/40 text-[#D9B45B] transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>+ Transmettre Facture Caisse</span>
              </button>
            </div>
          </GlassCard>

          {/* Action Bar with Multi-Status Support (Brouillon, En cours, Terminée) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl glass-surface border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-xs text-[var(--text-secondary)] hover:text-rose-500 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Effacer la saisie en cours pour recommencer à zéro"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Effacer saisie</span>
              </button>
              {lastDraftSavedAt && (
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  &middot; Autosave {lastDraftSavedAt}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap justify-end">
              <GlassButton
                type="button"
                variant="secondary"
                size="md"
                disabled={isSubmitting}
                icon={<Save className="w-4 h-4 text-amber-500 dark:text-amber-300" />}
                onClick={() => handleSaveWithStatus("BROUILLON")}
                title="Sauvegarder l'acte en brouillon pour le compléter ultérieurement"
              >
                Sauvegarder Brouillon
              </GlassButton>

              <GlassButton
                type="button"
                variant="subtle"
                size="md"
                disabled={isSubmitting}
                icon={<Clock className="w-4 h-4 text-[#1261A0] dark:text-[#55D9FF]" />}
                onClick={() => handleSaveWithStatus("EN_COURS")}
                title="Consigner l'acte comme examen en cours d'exploration"
              >
                Marquer En cours
              </GlassButton>

              <GlassButton
                type="button"
                variant="gold"
                size="md"
                loading={isSubmitting}
                disabled={isSubmitting}
                icon={<FileCheck className="w-4.5 h-4.5 text-[#071A33]" />}
                onClick={() => handleSaveWithStatus("TERMINE")}
                title="Vérifier la complétude clinique et clore définitivement la consultation"
              >
                Valider & Terminer la Consultation
              </GlassButton>
            </div>
          </div>
        </form>
      )}

      {/* HISTORY LIST */}
      {activeTab === "HISTORY" && (
        <div className="space-y-4">
          {patientConsultations.length === 0 ? (
            <GlassEmptyState
              icon={<Stethoscope className="w-7 h-7 text-[#1261A0] dark:text-[#55D9FF]" />}
              title="Aucune consultation antérieure"
              description={`Ce patient (${activePatient.lastName.toUpperCase()} ${activePatient.firstName}) ne possède pas encore d'acte clinique consigné.`}
              actionLabel="Nouvelle Consultation"
              actionIcon={<Plus className="w-4 h-4" />}
              onAction={() => setActiveTab("NEW")}
            />
          ) : (
            patientConsultations.map((cons) => {
              const hasModifications = Boolean(cons.modificationHistory && cons.modificationHistory.length > 0);
              const isAuditExpanded = Boolean(expandedAuditIds[cons.id]);
              const canEditThis = canUserModifyConsultation(currentUser);

              const statusBadge =
                cons.status === "BROUILLON" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                    Brouillon
                  </span>
                ) : cons.status === "EN_COURS" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                    En cours
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                    Terminée
                  </span>
                );

              return (
                <GlassCard key={cons.id} className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#1261A0] dark:text-[#55D9FF] text-sm">
                        {cons.consultationCode}
                      </span>
                      {statusBadge}
                      <span className="text-xs text-[var(--text-muted)]">&middot;</span>
                      <span className="text-xs text-[var(--text-secondary)] font-semibold">{cons.practitionerName}</span>
                      
                      {hasModifications && (
                        <button
                          type="button"
                          onClick={() => setExpandedAuditIds((prev) => ({ ...prev, [cons.id]: !prev[cons.id] }))}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D9B45B]/15 text-[#D9B45B] border border-[#D9B45B]/30 flex items-center gap-1.5 hover:bg-[#D9B45B]/25 transition-colors cursor-pointer"
                          title="Cliquez pour afficher l'historique inaltérable des modifications"
                        >
                          <History className="w-3 h-3 text-[#D9B45B]" />
                          <span>Rectifié ({cons.modificationHistory!.length})</span>
                          {isAuditExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[var(--text-muted)] font-mono">
                        {formatDate(cons.createdAt)}
                      </span>

                      {cons.status !== "TERMINE" && (
                        <button
                          type="button"
                          onClick={() => handleResumeConsultation(cons)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30 transition-all cursor-pointer"
                          title="Reprendre et compléter cette consultation"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>Reprendre l'acte</span>
                        </button>
                      )}

                      {canEditThis && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingConsultation(cons);
                            setEditMotif(cons.motif);
                            setEditClinicalExam(cons.clinicalExam || "");
                            setEditDiagnoses(JSON.parse(JSON.stringify(cons.diagnoses || [])));
                            setEditCarePlan(cons.carePlan || "");
                            setEditConclusion(cons.conclusion || "");
                            setEditReason("");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-400/30 transition-all cursor-pointer"
                          title="Modifier les données cliniques sous traçabilité obligatoire FONA"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Rectifier l'acte</span>
                        </button>
                      )}

                      {cons.prescriptions && cons.prescriptions.length > 0 && (
                        <GlassButton
                          variant="secondary"
                          size="sm"
                          icon={<Printer className="w-3.5 h-3.5" />}
                          onClick={() =>
                            setPrintableDoc({
                              type: "PRESCRIPTION",
                              title: `ORDONNANCE MÉDICALE — ${cons.consultationCode}`,
                              patient: activePatient,
                              data: cons,
                            })
                          }
                        >
                          Imprimer Ordonnance
                        </GlassButton>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-bold text-[var(--text-primary)]">{cons.motif}</div>
                    
                    {/* Primary & associated diagnoses */}
                    {cons.diagnoses && cons.diagnoses.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cons.diagnoses.map((d, i) => (
                          <span
                            key={d.id || i}
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                              d.isPrimary
                                ? "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                                : "bg-white/5 text-slate-300 border border-white/10"
                            }`}
                          >
                            {d.isPrimary ? "Diagnostic principal : " : "Associé : "}
                            {d.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                      {cons.conclusion || cons.clinicalExam}
                    </p>
                  </div>

                  {/* EXPANDABLE AUDIT HISTORY PANEL (Section 7: Cas important de modification après validation) */}
                  {hasModifications && isAuditExpanded && (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-bold text-[#D9B45B] border-b border-amber-500/20 pb-2">
                        <span className="flex items-center gap-1.5">
                          <History className="w-4 h-4" />
                          Journal d'Audit Clinique & Historique des Modifications (Avant ➔ Après)
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Non-répudiation médicale certifiée</span>
                      </div>

                      <div className="space-y-2.5 divide-y divide-white/5">
                        {cons.modificationHistory!.map((mod) => (
                          <div key={mod.id} className="pt-2.5 first:pt-0 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
                              <span className="font-semibold text-white">
                                {mod.modifiedByName} <span className="text-slate-400 font-normal">({mod.modifiedByRole})</span>
                              </span>
                              <span className="font-mono text-slate-400">
                                {formatDateTime(mod.modifiedAt)}
                              </span>
                            </div>

                            <div className="text-[11px] text-amber-300/90 font-medium">
                              Motif consigné : <span className="italic font-normal text-slate-200">« {mod.reason} »</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/25 border border-white/5 space-y-1">
                              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                {mod.fieldChanged}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                                  <span className="font-bold text-[10px] block text-rose-400 uppercase">Valeur Antérieure :</span>
                                  {mod.previousValue}
                                </div>
                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                                  <span className="font-bold text-[10px] block text-emerald-400 uppercase">Nouvelle Valeur :</span>
                                  {mod.newValue}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              );
            })
          )}
        </div>
      )}

      {/* MODAL: AUDITED CLINICAL MODIFICATION (Section 7: Rectification contrôlée d'un acte validé) */}
      {editingConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-[#020b17]/80 backdrop-blur-md"
            onClick={() => !isSavingEdit && setEditingConsultation(null)}
          />

          <div className="relative w-full max-w-2xl bg-[var(--surface-elevated)] border border-amber-500/30 rounded-3xl shadow-2xl z-10 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    Rectification Clinique & Audit — {editingConsultation.consultationCode}
                  </h2>
                  <p className="text-xs text-amber-300/80">Traçabilité stricte : conservation de l'ancienne et la nouvelle valeur</p>
                </div>
              </div>
              <button
                disabled={isSavingEdit}
                onClick={() => setEditingConsultation(null)}
                className="w-8 h-8 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editReason.trim() || editReason.trim().length < 4) {
                  showToast("WARNING", "Motif Obligatoire", "Veuillez renseigner un motif clinique valable pour cette modification.");
                  return;
                }
                setIsSavingEdit(true);
                try {
                  const res = await updateConsultationClinicalData(
                    editingConsultation.id,
                    {
                      motif: editMotif,
                      clinicalExam: editClinicalExam,
                      diagnoses: editDiagnoses,
                      carePlan: editCarePlan,
                      conclusion: editConclusion,
                    },
                    editReason
                  );
                  if (res.success) {
                    setEditingConsultation(null);
                  }
                } finally {
                  setIsSavingEdit(false);
                }
              }}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              {/* Security Warning Notice */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                <span className="font-bold text-amber-300">Règle de Traçabilité FONA Digital :</span> Cette action ne supprime pas l'historique antérieur. Un enregistrement différentiel sera gravé dans le journal d'audit avec votre identifiant ({currentUser.fullName}), l'horodatage et le motif médical saisi ci-dessous.
              </div>

              {/* Mandatory Reason */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#D9B45B] block mb-1.5">
                  Motif Clinique Obligatoire de la Rectification *
                </label>
                <GlassInput
                  placeholder="Ex: Rectification suite au retour du bilan biologique (goutte épaisse négative)..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  required
                />
              </div>

              {/* Diagnoses Editor */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Diagnostics Retenus
                </label>
                <div className="space-y-2">
                  {editDiagnoses.map((d, idx) => (
                    <div key={d.id || idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 w-20 shrink-0">
                        {d.isPrimary ? "Principal :" : `Associé #${idx} :`}
                      </span>
                      <input
                        type="text"
                        value={d.label}
                        onChange={(e) => {
                          const updated = [...editDiagnoses];
                          updated[idx].label = e.target.value;
                          setEditDiagnoses(updated);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
                        placeholder="Libellé du diagnostic..."
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Motif */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Motif de Consultation
                </label>
                <GlassInput
                  value={editMotif}
                  onChange={(e) => setEditMotif(e.target.value)}
                  required
                />
              </div>

              {/* Examen Physique */}
              <GlassTextarea
                label="Examen Physique Clinique"
                value={editClinicalExam}
                onChange={(e) => setEditClinicalExam(e.target.value)}
                rows={2}
              />

              {/* Conduite thérapeutique */}
              <GlassTextarea
                label="Conduite Thérapeutique & Recommandations"
                value={editCarePlan}
                onChange={(e) => setEditCarePlan(e.target.value)}
                rows={2}
              />

              {/* Conclusion médicale */}
              <GlassTextarea
                label="Conclusion & Synthèse Médicale"
                value={editConclusion}
                onChange={(e) => setEditConclusion(e.target.value)}
                rows={2}
              />

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <GlassButton
                  type="button"
                  variant="secondary"
                  disabled={isSavingEdit}
                  onClick={() => setEditingConsultation(null)}
                >
                  Annuler
                </GlassButton>
                <GlassButton
                  type="submit"
                  variant="gold"
                  loading={isSavingEdit}
                  disabled={isSavingEdit}
                  icon={<FileCheck className="w-4 h-4" />}
                >
                  Valider la Rectification Auditée
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
