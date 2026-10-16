import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck,
  Plus,
  Stethoscope,
  HeartHandshake,
  Baby,
  Printer,
  X,
  CheckCircle,
  ExternalLink,
  Receipt,
  TestTube2,
  ScanLine,
  Activity,
  Heart,
  Syringe,
  Sparkles,
  CreditCard,
  Edit2,
  Save,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Patient, VisitType, VitalSign, Diagnosis, PrescriptionItem, CareProduct, LabTestItem } from "../../types";
import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassInput, GlassSelect, GlassTextarea } from "../ui/GlassFormControls";
import { GlassModal } from "../ui/GlassModal";
import { hasPermission, hasUserPermission, isClinicalDataRestrictedForUser } from "../../services/rbacService";

export const PatientsView: React.FC = () => {
  const {
    patients,
    addPatient,
    updatePatient,
    visits,
    addVisit,
    consultations,
    addConsultation,
    cares,
    addCare,
    appointments,
    addAppointment,
    labRequests,
    addLabRequest,
    imagingRequests,
    addImagingRequest,
    invoices,
    addInvoice,
    addPayment,
    getPatientTimeline,
    currentUser,
    currentSite,
    selectedPatientId,
    setSelectedPatientId,
    setActiveTab,
    setPrintableDoc,
    showToast,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatPhone,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [bloodFilter, setBloodFilter] = useState("all");
  const [patientViewTab, setPatientViewTab] = useState<"TIMELINE" | "CONSULTATIONS" | "VITALS" | "FINANCE" | "INFO">("TIMELINE");
  const [timelineTypeFilter, setTimelineTypeFilter] = useState<string>("ALL");

  // Create Patient Modal State (Streamlined & Progressive)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showOptionalMedicalFields, setShowOptionalMedicalFields] = useState(false);
  const [estimatedAgeInput, setEstimatedAgeInput] = useState("");

  const [patientForm, setPatientForm] = useState({
    firstName: "",
    lastName: "",
    sex: "FEMALE" as "MALE" | "FEMALE",
    birthDate: "",
    phone: "",
    address: "",
    bloodGroup: "O+" as Patient["bloodGroup"],
    allergies: "",
    medicalHistory: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  // Duplicate warning state
  const [duplicateMatch, setDuplicateMatch] = useState<Patient | null>(null);

  // Direct In-Context Action Modals for Selected Patient
  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);
  const [isQuickConsultationOpen, setIsQuickConsultationOpen] = useState(false);
  const [isQuickCareOpen, setIsQuickCareOpen] = useState(false);
  const [isQuickExamOpen, setIsQuickExamOpen] = useState(false);
  const [isQuickAppointmentOpen, setIsQuickAppointmentOpen] = useState(false);
  const [isQuickBillingOpen, setIsQuickBillingOpen] = useState(false);

  // State: New Visit
  const [visitType, setVisitType] = useState<VisitType>("CONSULTATION");
  const [visitNotes, setVisitNotes] = useState("");
  const [visitPriority, setVisitPriority] = useState<"NORMALE" | "URGENTE">("NORMALE");

  // State: Direct Quick Consultation
  const [consultMotif, setConsultMotif] = useState("");
  const [consultExam, setConsultExam] = useState("Examen clinique standard, état général satisfaisant.");
  const [consultDiagnosis, setConsultDiagnosis] = useState("");
  const [consultPrescription, setConsultPrescription] = useState("");
  const [consultTemp, setConsultTemp] = useState("37.0");
  const [consultSysBP, setConsultSysBP] = useState("120");
  const [consultDiaBP, setConsultDiaBP] = useState("80");
  const [consultPulse, setConsultPulse] = useState("72");
  const [consultSpo2, setConsultSpo2] = useState("98");

  // State: Direct Quick Care
  const [quickCareType, setQuickCareType] = useState("Pansement stérile & Soin de plaie");
  const [quickCareObservations, setQuickCareObservations] = useState("Soin réalisé sous règles d'asepsie strictes.");
  const [quickCareSource, setQuickCareSource] = useState<"FONA" | "PATIENT">("FONA");

  // State: Direct Quick Lab / Imaging Exam
  const [examCategory, setExamCategory] = useState<"LAB" | "IMAGING">("LAB");
  const [labPreset, setLabPreset] = useState("NFS_CRP_PALU");
  const [imagingModality, setImagingModality] = useState<"RADIOLOGIE" | "ECHOGRAPHIE">("ECHOGRAPHIE");
  const [imagingExamName, setImagingExamName] = useState("Échographie Abdomino-pelvienne");
  const [examIndication, setExamIndication] = useState("Bilan systématique / Orientation diagnostique");

  // State: Direct Quick Appointment
  const [rdvDate, setRdvDate] = useState(new Date().toISOString().split("T")[0]);
  const [rdvTime, setRdvTime] = useState("10:00");
  const [rdvMotif, setRdvMotif] = useState("Contrôle médical post-traitement");

  // State: Direct Quick Billing
  const [billingPrestation, setBillingPrestation] = useState("CONSULTATION_GENERALE");
  const [billingAmount, setBillingAmount] = useState("15000");
  const [billingPaymentMethod, setBillingPaymentMethod] = useState<"ESPECES" | "MOBILE_MONEY" | "CARTE">("MOBILE_MONEY");
  const [billingPaidNow, setBillingPaidNow] = useState(true);

  // Selected patient entity
  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0] || null;
  }, [patients, selectedPatientId]);

  // Timeline for selected patient
  const patientTimeline = useMemo(() => {
    if (!selectedPatient) return [];
    return getPatientTimeline(selectedPatient.id);
  }, [selectedPatient, getPatientTimeline]);

  // Filtered timeline events by type
  const filteredTimeline = useMemo(() => {
    if (timelineTypeFilter === "ALL") return patientTimeline;
    return patientTimeline.filter((ev) => ev.type === timelineTypeFilter);
  }, [patientTimeline, timelineTypeFilter]);

  // Invoices for selected patient
  const patientInvoices = useMemo(() => {
    if (!selectedPatient) return [];
    return invoices.filter((i) => i.patientId === selectedPatient.id);
  }, [selectedPatient, invoices]);

  // Total balance due
  const totalPatientBalance = useMemo(() => {
    return patientInvoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);
  }, [patientInvoices]);

  // Consultations for selected patient
  const patientConsultations = useMemo(() => {
    if (!selectedPatient) return [];
    return consultations.filter((c) => c.patientId === selectedPatient.id);
  }, [selectedPatient, consultations]);

  // Filtered patients search
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery);

      const matchBlood = bloodFilter === "all" || p.bloodGroup === bloodFilter;
      return matchSearch && matchBlood;
    });
  }, [patients, searchQuery, bloodFilter]);

  // Quick Age Calculator: Given age in years, calculate approximate birthDate
  const handleApplyAgeCalculator = (ageStr: string) => {
    setEstimatedAgeInput(ageStr);
    const age = parseInt(ageStr, 10);
    if (!isNaN(age) && age >= 0 && age <= 125) {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - age;
      setPatientForm((prev) => ({
        ...prev,
        birthDate: `${birthYear}-01-01`,
      }));
    }
  };

  // Anti-duplication check & validation
  const handleCheckDuplicatesAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientForm.firstName.trim() || !patientForm.lastName.trim()) {
      showToast("WARNING", "Champs Incomplets", "Le prénom et le nom sont obligatoires.");
      return;
    }

    // Check if phone or exact name matches existing patient
    const existing = patients.find(
      (p) =>
        (patientForm.phone && p.phone === patientForm.phone.trim()) ||
        (p.lastName.toLowerCase() === patientForm.lastName.trim().toLowerCase() &&
          p.firstName.toLowerCase() === patientForm.firstName.trim().toLowerCase())
    );

    if (existing && !duplicateMatch) {
      setDuplicateMatch(existing);
      return;
    }

    submitCreatePatient();
  };

  const submitCreatePatient = () => {
    const created = addPatient({
      siteId: currentSite.id,
      firstName: patientForm.firstName.trim(),
      lastName: patientForm.lastName.trim(),
      sex: patientForm.sex,
      birthDate: patientForm.birthDate || "1995-01-01",
      phone: patientForm.phone.trim(),
      address: patientForm.address.trim() || "Bamako",
      profession: "Non renseigné",
      bloodGroup: patientForm.bloodGroup,
      allergies: patientForm.allergies ? patientForm.allergies.split(",").map((s) => s.trim()) : [],
      medicalHistory: patientForm.medicalHistory ? patientForm.medicalHistory.split(",").map((s) => s.trim()) : [],
      surgicalHistory: [],
      emergencyContactName: patientForm.emergencyContactName.trim(),
      emergencyContactPhone: patientForm.emergencyContactPhone.trim(),
    });

    setIsCreateModalOpen(false);
    setDuplicateMatch(null);
    setSelectedPatientId(created.id);
    resetForm();
    showToast("SUCCESS", "Dossier Créé", `${created.lastName.toUpperCase()} ${created.firstName} (${created.patientCode})`);
  };

  const resetForm = () => {
    setPatientForm({
      firstName: "",
      lastName: "",
      sex: "FEMALE",
      birthDate: "",
      phone: "",
      address: "",
      bloodGroup: "O+",
      allergies: "",
      medicalHistory: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    });
    setEstimatedAgeInput("");
    setShowOptionalMedicalFields(false);
    setDuplicateMatch(null);
  };

  // Direct Admission / Visit creation
  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const queuePrefix = visitType === "CONSULTATION" ? "A" : visitType === "SOIN" ? "S" : "M";
    const queueNum = `${queuePrefix}-${Math.floor(10 + Math.random() * 89)}`;

    addVisit({
      patientId: selectedPatient.id,
      siteId: currentSite.id,
      type: visitType,
      status: "EN_COURS",
      queueNumber: queueNum,
      priority: visitPriority,
      createdById: currentUser.id,
      createdByName: currentUser.fullName,
      notes: visitNotes || `Admission directe dossier patient ${selectedPatient.patientCode}`,
    });

    setIsNewVisitModalOpen(false);
    setVisitNotes("");
    showToast("SUCCESS", "Ticket Généré", `Ticket ${queueNum} créé pour ${selectedPatient.firstName}`);
  };

  // Direct Quick Consultation from Dossier
  const handleExecuteQuickConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (!consultMotif.trim()) {
      showToast("WARNING", "Motif requis", "Veuillez préciser le motif de consultation.");
      return;
    }

    const vitalsRecord: VitalSign = {
      id: `vit-${Date.now()}`,
      measuredAt: new Date().toISOString(),
      measuredBy: currentUser.fullName,
      temperature: parseFloat(consultTemp) || 37.0,
      systolicBP: parseFloat(consultSysBP) || 120,
      diastolicBP: parseFloat(consultDiaBP) || 80,
      heartRate: parseFloat(consultPulse) || 72,
      oxygenSaturation: parseFloat(consultSpo2) || 98,
    };

    const parsedRx: PrescriptionItem[] = consultPrescription.trim()
      ? consultPrescription.split(";").map((p, idx) => ({
          id: `rx-${Date.now()}-${idx}`,
          medication: p.trim(),
          dosage: "Selon prescription",
          frequency: "Selon avis médical",
          duration: "5 jours",
          instructions: "Prise orale après repas",
        }))
      : [];

    const newCons = addConsultation({
      visitId: `vis-direct-${Date.now()}`,
      patientId: selectedPatient.id,
      siteId: currentSite.id,
      practitionerId: currentUser.id,
      practitionerName: currentUser.fullName,
      motif: consultMotif,
      historyOfIllness: "Consultation directe enregistrée depuis le dossier patient.",
      clinicalExam: consultExam,
      vitalSigns: [vitalsRecord],
      diagnoses: [
        {
          id: `diag-${Date.now()}`,
          label: consultDiagnosis.trim() || "Examen clinique / Pathologie courante",
          isPrimary: true,
          startDate: new Date().toISOString().split("T")[0],
        },
      ],
      carePlan: "Traitement médicamenteux et repos.",
      prescriberName: `${currentUser.fullName} — CM FONA`,
      prescriptions: parsedRx,
      conclusion: "Consultation validée avec succès.",
    });

    setIsQuickConsultationOpen(false);
    setConsultMotif("");
    setConsultDiagnosis("");
    setConsultPrescription("");

    if (parsedRx.length > 0) {
      setPrintableDoc({
        type: "PRESCRIPTION",
        title: `ORDONNANCE MÉDICALE — ${newCons.consultationCode}`,
        patient: selectedPatient,
        data: newCons,
      });
    }
  };

  // Direct Quick Nursing Care
  const handleExecuteQuickCare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const defaultProduct: CareProduct = {
      name: quickCareType.includes("Pansement")
        ? "Kit Pansement stérile + Sérum phy"
        : quickCareType.includes("Injection")
        ? "Seringue 5ml + Aiguille IM/IV"
        : "Tubulure + Sérum Ringer 500ml",
      source: quickCareSource,
      quantity: "1 kit",
    };

    const newCare = addCare({
      visitId: `vis-care-${Date.now()}`,
      patientId: selectedPatient.id,
      siteId: currentSite.id,
      nurseId: currentUser.id,
      nurseName: currentUser.fullName,
      careType: quickCareType,
      productsUsed: [defaultProduct],
      observations: quickCareObservations,
    });

    setIsQuickCareOpen(false);
    showToast("SUCCESS", "Soin Enregistré", `${quickCareType} administré avec succès.`);
  };

  // Direct Quick Lab / Imaging Order
  const handleExecuteQuickExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (examCategory === "LAB") {
      let tests: LabTestItem[] = [];
      if (labPreset === "NFS_CRP_PALU") {
        tests = [
          { id: `t-${Date.now()}-1`, testName: "Goutte Épaisse & TDR Paludisme", category: "PARASITOLOGIE", referenceRange: "Négatif", unit: "qualitatif" },
          { id: `t-${Date.now()}-2`, testName: "Hémoglobine & NFS", category: "HEMATOLOGIE", referenceRange: "12.0 - 16.0", unit: "g/dL" },
          { id: `t-${Date.now()}-3`, testName: "CRP (Protéine C-Réactive)", category: "BIOCHIMIE", referenceRange: "< 5.0", unit: "mg/L" },
        ];
      } else {
        tests = [
          { id: `t-${Date.now()}-4`, testName: "Glycémie à jeun", category: "BIOCHIMIE", referenceRange: "0.70 - 1.10", unit: "g/L" },
          { id: `t-${Date.now()}-5`, testName: "Créatininémie", category: "BIOCHIMIE", referenceRange: "6.0 - 12.0", unit: "mg/L" },
        ];
      }

      addLabRequest({
        visitId: `vis-lab-${Date.now()}`,
        patientId: selectedPatient.id,
        siteId: currentSite.id,
        requesterName: currentUser.fullName,
        priority: "NORMALE",
        status: "DEMANDE",
        clinicalNotes: examIndication,
        tests,
      });
      showToast("SUCCESS", "Bilan Labo Prescrit", "Demande transmise au laboratoire d'analyses.");
    } else {
      addImagingRequest({
        visitId: `vis-img-${Date.now()}`,
        patientId: selectedPatient.id,
        siteId: currentSite.id,
        requesterName: currentUser.fullName,
        modality: imagingModality,
        examName: imagingExamName,
        indication: examIndication,
        findings: "",
        conclusion: "",
        status: "DEMANDE",
      });
      showToast("SUCCESS", "Examen Imagerie Prescrit", `${imagingExamName} commandé.`);
    }

    setIsQuickExamOpen(false);
  };

  // Direct Quick Appointment
  const handleExecuteQuickAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    addAppointment({
      patientId: selectedPatient.id,
      practitionerId: currentUser.id,
      practitionerName: currentUser.fullName,
      siteId: currentSite.id,
      date: rdvDate,
      timeSlot: rdvTime,
      durationMinutes: 30,
      motif: rdvMotif,
      status: "PREVU",
      reminderOffsetMinutes: 30,
      reminderSent: false,
    });

    setIsQuickAppointmentOpen(false);
    showToast("SUCCESS", "Rendez-vous Fixé", `Prévu le ${rdvDate} à ${rdvTime}`);
  };

  // Direct Quick Invoice & Payment
  const handleExecuteQuickBilling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const amount = parseFloat(billingAmount) || 15000;
    const desc =
      billingPrestation === "CONSULTATION_GENERALE"
        ? "Consultation Médecine Générale"
        : billingPrestation === "SOIN_PANSEMENT"
        ? "Acte de Soin Infirmier / Pansement"
        : billingPrestation === "BILAN_LABO"
        ? "Examens Biologiques / Laboratoire"
        : "Prestation Clinique FONA";

    const createdInvoice = addInvoice({
      visitId: `vis-inv-${Date.now()}`,
      patientId: selectedPatient.id,
      siteId: currentSite.id,
      items: [{ id: `it-${Date.now()}`, description: desc, quantity: 1, unitPrice: amount, total: amount }],
      totalAmount: amount,
      paidAmount: billingPaidNow ? amount : 0,
    });

    if (billingPaidNow) {
      const payment = addPayment(createdInvoice.id, amount, billingPaymentMethod);
      setPrintableDoc({
        type: "RECEIPT",
        title: `REÇU DE CAISSE EXPRESS — ${payment.receiptCode}`,
        patient: selectedPatient,
        data: payment,
      });
    }

    setIsQuickBillingOpen(false);
  };

  const canWritePatient = hasUserPermission(currentUser, "PATIENT_WRITE");
  const canWriteConsultation = hasUserPermission(currentUser, "CONSULTATION_WRITE");
  const canWriteCare = hasUserPermission(currentUser, "CARE_WRITE");
  const canWritePayment = hasUserPermission(currentUser, "PAYMENT_WRITE");
  const isClinicalRestricted = isClinicalDataRestrictedForUser(currentUser);

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, n° dossier, téléphone..."
            className="w-full bg-[var(--surface-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] rounded-xl border border-[var(--border)] pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#55D9FF] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="bg-[var(--surface-subtle)] text-xs text-[var(--text-secondary)] rounded-xl border border-[var(--border)] px-3 py-2.5 focus:outline-none"
          >
            <option value="all">Tous groupes sanguins</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
              <option key={g} value={g}>
                Groupe {g}
              </option>
            ))}
          </select>

          {canWritePatient && (
            <GlassButton
              variant="gold"
              size="md"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
            >
              Nouveau Dossier Patient
            </GlassButton>
          )}
        </div>
      </div>

      {/* Main Grid: Patients Directory (5 Cols) + Integrated Dossier Central (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Patients List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] px-1">
            <span>Dossiers Permanents ({filteredPatients.length})</span>
            <span>Sélection rapide</span>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {filteredPatients.map((pat) => {
              const isSelected = pat.id === selectedPatient?.id;
              return (
                <div
                  key={pat.id}
                  onClick={() => setSelectedPatientId(pat.id)}
                  className={`fona-btn-interactive p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "fona-patient-item-active bg-[var(--surface-active)] border-[var(--border-active)] shadow-[0_0_20px_rgba(85,217,255,0.18)] ring-1 ring-[#55D9FF]/40 pl-5"
                      : "bg-[var(--surface-card)] hover:bg-[var(--surface-subtle)] border-[var(--border)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#071A33] border border-cyan-400/30 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {pat.lastName.charAt(0)}
                        {pat.firstName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                          <span>{pat.lastName.toUpperCase()} {pat.firstName}</span>
                          {pat.bloodGroup && (
                            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                              {pat.bloodGroup}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{pat.patientCode}</span>
                          <span>·</span>
                          <span>{pat.phone || "Sans tél"}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-[#55D9FF] translate-x-1" : "text-slate-400"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Complete Interactive Patient File (Dossier Médical Central avec transformation fluide) */}
        <div className="lg:col-span-7">
          {selectedPatient ? (
            <GlassCard key={selectedPatient.id} className="animate-fona-dossier-open p-6 space-y-5">
              {/* Header: Patient Identity Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1261A0] to-[#071A33] border border-cyan-400/40 text-cyan-300 font-bold text-base flex items-center justify-center shadow-lg">
                      {selectedPatient.lastName.charAt(0)}
                      {selectedPatient.firstName.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#071A33] border border-[#D9B45B] text-[#D9B45B] flex items-center justify-center shadow-xs">
                      <FolderOpen className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                        {selectedPatient.lastName.toUpperCase()} {selectedPatient.firstName}
                      </h2>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30">
                        {selectedPatient.patientCode}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2 flex-wrap mt-0.5">
                      <span>{selectedPatient.sex === "FEMALE" ? "Femme" : "Homme"}</span>
                      <span>·</span>
                      <span>Né(e) le {selectedPatient.birthDate || "Inconnu"}</span>
                      <span>·</span>
                      <span>Tél : {selectedPatient.phone || "Non renseigné"}</span>
                      {totalPatientBalance > 0 && (
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 ml-1">
                          Solde Dû : {formatCurrency(totalPatientBalance)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Print Dossier */}
                <GlassButton
                  variant="secondary"
                  size="sm"
                  icon={<Printer className="w-3.5 h-3.5 text-[#D9B45B]" />}
                  onClick={() =>
                    setPrintableDoc({
                      type: "PATIENT_FOLDER",
                      title: `DOSSIER MÉDICAL PERMANENT — ${selectedPatient.patientCode}`,
                      patient: selectedPatient,
                      data: { timeline: patientTimeline },
                    })
                  }
                >
                  Imprimer Dossier
                </GlassButton>
              </div>

              {/* ACTION BAR DIRECTE (0 CLIC DE REDIRECTION INUTILE) */}
              <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D9B45B]" />
                    Actions Médicales Directes pour ce Patient
                  </span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">Sans changer d'écran</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {canWriteConsultation && (
                    <button
                      onClick={() => setIsQuickConsultationOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#1261A0] text-white hover:bg-blue-600 shadow-sm transition-all cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>+ Consultation</span>
                    </button>
                  )}

                  {canWriteCare && (
                    <button
                      onClick={() => setIsQuickCareOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-500 shadow-sm transition-all cursor-pointer"
                    >
                      <Syringe className="w-3.5 h-3.5" />
                      <span>+ Soin</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsQuickExamOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 shadow-sm transition-all cursor-pointer"
                  >
                    <TestTube2 className="w-3.5 h-3.5" />
                    <span>+ Bilan / Imagerie</span>
                  </button>

                  <button
                    onClick={() => setIsQuickAppointmentOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-all cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>+ Rendez-vous</span>
                  </button>

                  {canWritePayment && (
                    <button
                      onClick={() => setIsQuickBillingOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#D9B45B] text-[#071A33] hover:bg-amber-400 shadow-sm transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>+ Facturer / Payer</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsNewVisitModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 text-[var(--text-primary)] hover:bg-white/15 border border-[var(--border)] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ticket Passage</span>
                  </button>
                </div>
              </div>

              {/* Dossier Tabs: Timeline / Consultations / Vitals / Finance / Info */}
              <div className="flex bg-[var(--surface-subtle)] p-1 rounded-xl border border-[var(--border)] overflow-x-auto">
                <button
                  onClick={() => setPatientViewTab("TIMELINE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    patientViewTab === "TIMELINE"
                      ? "bg-[#1261A0] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Timeline ({patientTimeline.length})
                </button>
                <button
                  onClick={() => setPatientViewTab("CONSULTATIONS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    patientViewTab === "CONSULTATIONS"
                      ? "bg-[#1261A0] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Consultations ({patientConsultations.length})
                </button>
                <button
                  onClick={() => setPatientViewTab("FINANCE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    patientViewTab === "FINANCE"
                      ? "bg-[#1261A0] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Factures ({patientInvoices.length})
                </button>
                <button
                  onClick={() => setPatientViewTab("INFO")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    patientViewTab === "INFO"
                      ? "bg-[#1261A0] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Antécédents & Fiche
                </button>
              </div>

              {/* SUBTAB 1: UNIFIED MEDICAL TIMELINE */}
              {patientViewTab === "TIMELINE" && (
                <div className="space-y-4">
                  {/* Quick Filters for Timeline */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
                    <span className="text-[var(--text-muted)] font-medium mr-1">Filtrer :</span>
                    {["ALL", "CONSULTATION", "CARE", "LAB", "IMAGING", "PAYMENT", "APPOINTMENT"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimelineTypeFilter(t)}
                        className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                          timelineTypeFilter === t
                            ? "bg-cyan-500/20 text-[#55D9FF] border border-cyan-400/40"
                            : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {t === "ALL" ? "Tous" : t}
                      </button>
                    ))}
                  </div>

                  {filteredTimeline.length === 0 ? (
                    <div className="py-10 text-center text-xs text-[var(--text-muted)]">
                      Aucun événement correspondant dans la chronologie de ce patient.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
                      {filteredTimeline.map((ev, index) => {
                        const badgeStyle = {
                          CONSULTATION: "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-400/30",
                          CARE: "bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-400/30",
                          CPN: "bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-400/30",
                          DELIVERY: "bg-pink-500/15 text-pink-600 dark:text-pink-300 border-pink-400/30",
                          LAB: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/30",
                          IMAGING: "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-400/30",
                          PAYMENT: "bg-[#D9B45B]/15 text-amber-700 dark:text-[#D9B45B] border-[#D9B45B]/30",
                          APPOINTMENT: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-400/30",
                        }[ev.type];

                        return (
                          <div
                            key={ev.id}
                            className="relative group animate-fona-timeline-enter"
                            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                          >
                            <div
                              className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-[var(--background)] border-2 border-[#55D9FF] ${
                                index === 0 ? "animate-fona-dot-ripple ring-2 ring-cyan-400/40" : ""
                              }`}
                            />
                            <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-card)] border border-[var(--border)] transition-all space-y-1.5">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${badgeStyle}`}>
                                    {ev.type}
                                  </span>
                                  <span className="text-xs font-bold text-[var(--text-primary)]">
                                    {ev.title}
                                  </span>
                                </div>
                                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                                  {formatDateTime(ev.occurredAt)}
                                </span>
                              </div>
                              {ev.description && (
                                <p className="text-xs text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                                  {ev.description}
                                </p>
                              )}
                              {ev.author && (
                                <div className="text-[10px] text-[var(--text-muted)] italic">
                                  Intervenant : {ev.author}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 2: CONSULTATIONS & PRESCRIPTIONS (Principe du moindre privilège) */}
              {patientViewTab === "CONSULTATIONS" && (
                <div className="space-y-3">
                  {isClinicalRestricted && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300">Principe du Moindre Privilège FONA Digital :</span>
                        <p className="mt-0.5 text-amber-200/80 leading-relaxed text-[11px]">
                          Votre profil Accueil/Caisse a accès aux informations administratives du passage pour la facturation, mais les diagnostics médicaux et ordonnances détaillées sont masqués pour respecter le secret médical.
                        </p>
                      </div>
                    </div>
                  )}

                  {patientConsultations.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                      Aucune consultation archivée.
                    </div>
                  ) : (
                    patientConsultations.map((cons) => (
                      <div
                        key={cons.id}
                        className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-xs">
                              {cons.consultationCode}
                            </span>
                            <span className="text-xs text-[var(--text-secondary)] font-semibold">
                              {cons.practitionerName}
                            </span>
                          </div>
                          <span className="text-[11px] text-[var(--text-muted)] font-mono">
                            {formatDate(cons.createdAt)}
                          </span>
                        </div>

                        {isClinicalRestricted ? (
                          <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)] italic flex items-center justify-between">
                            <span>Acte médical validé • Données cliniques confidentielles</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">Pris en charge</span>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs font-bold text-[var(--text-primary)]">
                              Motif : {cons.motif}
                            </div>

                            {cons.diagnoses && cons.diagnoses.length > 0 && (
                              <div className="text-xs text-slate-300">
                                <span className="text-[var(--text-muted)]">Diagnostic : </span>
                                <span className="font-medium text-[var(--text-primary)]">
                                  {cons.diagnoses.map((d) => d.label).join(", ")}
                                </span>
                              </div>
                            )}

                            {cons.prescriptions && cons.prescriptions.length > 0 && (
                              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                                <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                                  {cons.prescriptions.length} médicament(s) prescrit(s)
                                </div>
                                <button
                                  onClick={() =>
                                    setPrintableDoc({
                                      type: "PRESCRIPTION",
                                      title: `ORDONNANCE MÉDICALE — ${cons.consultationCode}`,
                                      patient: selectedPatient,
                                      data: cons,
                                    })
                                  }
                                  className="text-xs font-bold text-[#1261A0] dark:text-[#55D9FF] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  Imprimer Ordonnance
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SUBTAB 3: FINANCE & INVOICES */}
              {patientViewTab === "FINANCE" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-600 dark:text-amber-300 font-semibold block">
                        Situation Financière du Patient
                      </span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        Reste à recouvrer : {formatCurrency(totalPatientBalance)}
                      </span>
                    </div>
                    {totalPatientBalance > 0 && (
                      <GlassButton
                        variant="gold"
                        size="sm"
                        icon={<CreditCard className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setBillingAmount(totalPatientBalance.toString());
                          setIsQuickBillingOpen(true);
                        }}
                      >
                        Encaisser le Solde
                      </GlassButton>
                    )}
                  </div>

                  {patientInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-[var(--text-primary)]">{inv.invoiceCode}</div>
                        <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {inv.items.map((i) => i.description).join(", ")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[var(--text-primary)]">{formatCurrency(inv.totalAmount)}</div>
                        <div className={`text-[10px] font-bold ${inv.balance === 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          {inv.balance === 0 ? "Payé" : `Reste: ${formatCurrency(inv.balance)}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SUBTAB 4: MEDICAL BACKGROUND & INFO */}
              {patientViewTab === "INFO" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-rose-500 block">Allergies Signalées</span>
                    <p className="text-[var(--text-primary)] font-medium">
                      {selectedPatient.allergies.length > 0 ? selectedPatient.allergies.join(", ") : "Aucune allergie connue."}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block">Antécédents Médicaux Majeurs</span>
                    <p className="text-[var(--text-primary)] font-medium">
                      {selectedPatient.medicalHistory.length > 0 ? selectedPatient.medicalHistory.join(", ") : "Aucun antécédent particulier."}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Contact d'Urgence</span>
                    <p className="text-[var(--text-primary)] font-medium">
                      {selectedPatient.emergencyContactName || "Non renseigné"} {selectedPatient.emergencyContactPhone ? `(${selectedPatient.emergencyContactPhone})` : ""}
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          ) : (
            <div className="py-20 text-center glass-surface rounded-2xl border border-[var(--border)] p-8">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">Aucun patient sélectionné</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mt-1">
                Choisissez un dossier dans la liste à gauche ou cliquez sur "Nouveau Dossier Patient" pour enregistrer un nouvel arrivant.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: STREAMLINED PATIENT CREATION (AUDIT : CHAMPS ESSENTIELS D'ABORD) */}
      <GlassModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Création d'un Dossier Patient Permanent"
        subtitle="Saisie accélérée en 10 secondes — Champs essentiels d'accueil"
        icon={<UserPlus className="w-5 h-5 text-[#D9B45B]" />}
        maxWidth="lg"
      >
        {duplicateMatch ? (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-3 text-amber-500 dark:text-amber-300">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Correspondance Détectée (Anti-Doublon FONA)</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Un patient correspondant au même nom ou téléphone existe déjà dans la base centrale.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-1">
              <div className="text-xs font-bold text-[var(--text-primary)]">
                {duplicateMatch.lastName.toUpperCase()} {duplicateMatch.firstName}
              </div>
              <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                <span className="font-mono text-cyan-600 dark:text-cyan-300 font-bold">{duplicateMatch.patientCode}</span>
                <span>·</span>
                <span>Tél : {duplicateMatch.phone}</span>
                <span>·</span>
                <span>Groupe : {duplicateMatch.bloodGroup}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <GlassButton
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedPatientId(duplicateMatch.id);
                  setIsCreateModalOpen(false);
                  resetForm();
                  showToast("INFO", "Dossier Existant Ouvert", `Code : ${duplicateMatch.patientCode}`);
                }}
              >
                Ouvrir le dossier existant
              </GlassButton>

              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => submitCreatePatient()}
              >
                Créer quand même
              </GlassButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCheckDuplicatesAndSubmit} className="space-y-4">
            {/* Essential Block: Names & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <GlassInput
                label="Nom de famille *"
                placeholder="Ex: TRAORE"
                value={patientForm.lastName}
                onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                required
              />

              <GlassInput
                label="Prénom(s) *"
                placeholder="Ex: Fatoumata"
                value={patientForm.firstName}
                onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                required
              />
            </div>

            {/* Sex & Age / Birthdate with Rapid Age Helper */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
              <div className="sm:col-span-4">
                <GlassSelect
                  label="Sexe *"
                  value={patientForm.sex}
                  onChange={(e) => setPatientForm({ ...patientForm, sex: e.target.value as any })}
                  options={[
                    { value: "FEMALE", label: "Féminin" },
                    { value: "MALE", label: "Masculin" },
                  ]}
                />
              </div>

              <div className="sm:col-span-5">
                <GlassInput
                  label="Date de Naissance *"
                  type="date"
                  value={patientForm.birthDate}
                  onChange={(e) => setPatientForm({ ...patientForm, birthDate: e.target.value })}
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <GlassInput
                  label="Ou Âge estimé"
                  placeholder="Ex: 32"
                  type="number"
                  value={estimatedAgeInput}
                  onChange={(e) => handleApplyAgeCalculator(e.target.value)}
                  unit="ans"
                />
              </div>
            </div>

            {/* Contact & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <GlassInput
                label="Numéro de Téléphone *"
                placeholder="Ex: +223 76 12 34 56"
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                required
              />

              <GlassInput
                label="Quartier / Adresse"
                placeholder="Ex: Sirakoro Méguétana, Bamako"
                value={patientForm.address}
                onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
              />
            </div>

            {/* Collapsible Section for Secondary Medical Info */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowOptionalMedicalFields(!showOptionalMedicalFields)}
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                {showOptionalMedicalFields ? "− Masquer les informations médicales optionnelles" : "+ Ajouter informations médicales & contact d'urgence (Optionnel)"}
              </button>

              {showOptionalMedicalFields && (
                <div className="mt-3 p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-3.5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <GlassSelect
                      label="Groupe Sanguin"
                      value={patientForm.bloodGroup}
                      onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value as any })}
                      options={[
                        { value: "O+", label: "O+" },
                        { value: "O-", label: "O-" },
                        { value: "A+", label: "A+" },
                        { value: "A-", label: "A-" },
                        { value: "B+", label: "B+" },
                        { value: "B-", label: "B-" },
                        { value: "AB+", label: "AB+" },
                        { value: "AB-", label: "AB-" },
                      ]}
                    />

                    <GlassInput
                      label="Allergies (Séparées par virgule)"
                      placeholder="Ex: Pénicilline, AINS..."
                      value={patientForm.allergies}
                      onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
                    />
                  </div>

                  <GlassInput
                    label="Antécédents Médicaux Notables"
                    placeholder="Ex: HTA, Diabète Type 2, Asthme..."
                    value={patientForm.medicalHistory}
                    onChange={(e) => setPatientForm({ ...patientForm, medicalHistory: e.target.value })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <GlassInput
                      label="Contact Urgence (Nom)"
                      placeholder="Ex: Amadou Diallo (Époux)"
                      value={patientForm.emergencyContactName}
                      onChange={(e) => setPatientForm({ ...patientForm, emergencyContactName: e.target.value })}
                    />

                    <GlassInput
                      label="Tél Contact Urgence"
                      placeholder="Ex: +223 66 00 11 22"
                      value={patientForm.emergencyContactPhone}
                      onChange={(e) => setPatientForm({ ...patientForm, emergencyContactPhone: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
              <GlassButton
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Annuler
              </GlassButton>
              <GlassButton type="submit" variant="gold" size="md">
                Enregistrer Patient
              </GlassButton>
            </div>
          </form>
        )}
      </GlassModal>

      {/* MODAL 2: DIRECT QUICK CONSULTATION (SANS NAVIGATION) */}
      {selectedPatient && (
        <GlassModal
          isOpen={isQuickConsultationOpen}
          onClose={() => setIsQuickConsultationOpen(false)}
          title={`Consultation Directe : ${selectedPatient.lastName.toUpperCase()} ${selectedPatient.firstName}`}
          subtitle={`Dossier ${selectedPatient.patientCode} — Saisie clinique et ordonnance en 1 clic`}
          icon={<Stethoscope className="w-5 h-5 text-cyan-400" />}
          maxWidth="2xl"
        >
          <form onSubmit={handleExecuteQuickConsultation} className="space-y-4">
            {/* Quick Motif chips */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5">
                Motif de consultation *
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  "Fièvre & Céphalées",
                  "Paludisme suspecté",
                  "Toux & Rhinorrhée",
                  "Bilan Hypertension (HTA)",
                  "Douleur abdominale",
                  "Consultation de routine",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setConsultMotif(preset)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <GlassInput
                placeholder="Précisez le motif..."
                value={consultMotif}
                onChange={(e) => setConsultMotif(e.target.value)}
                required
              />
            </div>

            {/* Quick Vitals row */}
            <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Constantes Vitales
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setConsultTemp("37.0");
                    setConsultSysBP("120");
                    setConsultDiaBP("80");
                    setConsultPulse("72");
                    setConsultSpo2("98");
                  }}
                  className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Valeurs normales par défaut
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                <GlassInput label="T°" value={consultTemp} onChange={(e) => setConsultTemp(e.target.value)} unit="°C" />
                <GlassInput label="TA Sys" value={consultSysBP} onChange={(e) => setConsultSysBP(e.target.value)} unit="mmHg" />
                <GlassInput label="TA Dia" value={consultDiaBP} onChange={(e) => setConsultDiaBP(e.target.value)} unit="mmHg" />
                <GlassInput label="Pouls" value={consultPulse} onChange={(e) => setConsultPulse(e.target.value)} unit="bpm" />
                <GlassInput label="SpO₂" value={consultSpo2} onChange={(e) => setConsultSpo2(e.target.value)} unit="%" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <GlassInput
                label="Diagnostic retenu"
                placeholder="Ex: Paludisme simple / Accès fébrile"
                value={consultDiagnosis}
                onChange={(e) => setConsultDiagnosis(e.target.value)}
              />

              <GlassInput
                label="Prescription / Médicaments (Séparés par ;)"
                placeholder="Ex: Artéméther/Luméfantrine 20/120mg; Paracétamol 1g"
                value={consultPrescription}
                onChange={(e) => setConsultPrescription(e.target.value)}
              />
            </div>

            <GlassTextarea
              label="Observations d'examen physique"
              value={consultExam}
              onChange={(e) => setConsultExam(e.target.value)}
              rows={2}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
              <GlassButton type="button" variant="ghost" size="md" onClick={() => setIsQuickConsultationOpen(false)}>
                Annuler
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="md" icon={<CheckCircle2 className="w-4 h-4" />}>
                Valider & Générer Ordonnance
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}

      {/* MODAL 3: DIRECT QUICK CARE */}
      {selectedPatient && (
        <GlassModal
          isOpen={isQuickCareOpen}
          onClose={() => setIsQuickCareOpen(false)}
          title={`Administration Soin Infirmier : ${selectedPatient.lastName.toUpperCase()} ${selectedPatient.firstName}`}
          subtitle="Enregistrement d'acte infirmier direct sans rupture de contexte"
          icon={<Syringe className="w-5 h-5 text-teal-400" />}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteQuickCare} className="space-y-4">
            <GlassSelect
              label="Acte Infirmier *"
              value={quickCareType}
              onChange={(e) => setQuickCareType(e.target.value)}
              options={[
                { value: "Pansement stérile & Soin de plaie", label: "Pansement stérile & Soin de plaie" },
                { value: "Injection Intramusculaire (IM)", label: "Injection Intramusculaire (IM)" },
                { value: "Injection Intraveineuse directe (IV)", label: "Injection Intraveineuse directe (IV)" },
                { value: "Pose de voie veineuse & Perfusion", label: "Pose de voie veineuse & Perfusion" },
                { value: "Prélèvement sanguin / Bilan", label: "Prélèvement sanguin / Bilan" },
                { value: "Aérosolthérapie / Nébulisation", label: "Aérosolthérapie / Nébulisation" },
              ]}
            />

            <GlassSelect
              label="Origine du Produit / Dispositif *"
              value={quickCareSource}
              onChange={(e) => setQuickCareSource(e.target.value as any)}
              options={[
                { value: "FONA", label: "Matériel fourni par FONA" },
                { value: "PATIENT", label: "Matériel apporté par le Patient" },
              ]}
            />

            <GlassTextarea
              label="Observations de Soin"
              value={quickCareObservations}
              onChange={(e) => setQuickCareObservations(e.target.value)}
              rows={2}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
              <GlassButton type="button" variant="ghost" size="md" onClick={() => setIsQuickCareOpen(false)}>
                Annuler
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="md">
                Enregistrer le Soin
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}

      {/* MODAL 4: DIRECT QUICK LAB / IMAGING EXAM */}
      {selectedPatient && (
        <GlassModal
          isOpen={isQuickExamOpen}
          onClose={() => setIsQuickExamOpen(false)}
          title={`Prescription d'Examen : ${selectedPatient.lastName.toUpperCase()} ${selectedPatient.firstName}`}
          subtitle="Demande biologique ou imagerie en 1 clic"
          icon={<TestTube2 className="w-5 h-5 text-amber-400" />}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteQuickExam} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setExamCategory("LAB")}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  examCategory === "LAB" ? "bg-amber-500 text-[#071A33] shadow-sm" : "text-[var(--text-secondary)]"
                }`}
              >
                Laboratoire (Bio)
              </button>
              <button
                type="button"
                onClick={() => setExamCategory("IMAGING")}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  examCategory === "IMAGING" ? "bg-sky-500 text-white shadow-sm" : "text-[var(--text-secondary)]"
                }`}
              >
                Imagerie (Radio/Écho)
              </button>
            </div>

            {examCategory === "LAB" ? (
              <GlassSelect
                label="Pack d'Analyses Biologiques *"
                value={labPreset}
                onChange={(e) => setLabPreset(e.target.value)}
                options={[
                  { value: "NFS_CRP_PALU", label: "Pack Paludisme & Infection (GE/TDR + NFS + CRP)" },
                  { value: "METABOLIQUE", label: "Pack Métabolique (Glycémie + Créatininémie + Urée)" },
                ]}
              />
            ) : (
              <div className="space-y-3">
                <GlassSelect
                  label="Modalité d'Imagerie *"
                  value={imagingModality}
                  onChange={(e) => setImagingModality(e.target.value as any)}
                  options={[
                    { value: "ECHOGRAPHIE", label: "Échographie" },
                    { value: "RADIOLOGIE", label: "Radiologie" },
                  ]}
                />
                <GlassInput
                  label="Nom de l'Examen *"
                  value={imagingExamName}
                  onChange={(e) => setImagingExamName(e.target.value)}
                />
              </div>
            )}

            <GlassInput
              label="Indication Clinique"
              value={examIndication}
              onChange={(e) => setExamIndication(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
              <GlassButton type="button" variant="ghost" size="md" onClick={() => setIsQuickExamOpen(false)}>
                Annuler
              </GlassButton>
              <GlassButton type="submit" variant="gold" size="md">
                Confirmer Prescription
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}

      {/* MODAL 5: DIRECT QUICK APPOINTMENT */}
      {selectedPatient && (
        <GlassModal
          isOpen={isQuickAppointmentOpen}
          onClose={() => setIsQuickAppointmentOpen(false)}
          title={`Fixer Rendez-vous : ${selectedPatient.lastName.toUpperCase()} ${selectedPatient.firstName}`}
          subtitle="Planification express sans quitter le dossier médical"
          icon={<Calendar className="w-5 h-5 text-indigo-400" />}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteQuickAppointment} className="space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              <GlassInput
                label="Date *"
                type="date"
                value={rdvDate}
                onChange={(e) => setRdvDate(e.target.value)}
                required
              />

              <GlassSelect
                label="Créneau Horaire *"
                value={rdvTime}
                onChange={(e) => setRdvTime(e.target.value)}
                options={[
                  { value: "08:30", label: "08h30" },
                  { value: "09:00", label: "09h00" },
                  { value: "10:00", label: "10h00" },
                  { value: "11:30", label: "11h30" },
                  { value: "15:00", label: "15h00" },
                  { value: "16:30", label: "16h30" },
                ]}
              />
            </div>

            <GlassInput
              label="Motif du Rendez-vous *"
              value={rdvMotif}
              onChange={(e) => setRdvMotif(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
              <GlassButton type="button" variant="ghost" size="md" onClick={() => setIsQuickAppointmentOpen(false)}>
                Annuler
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="md">
                Confirmer Rendez-vous
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}

      {/* MODAL 6: DIRECT QUICK BILLING & PAYMENT */}
      {selectedPatient && (
        <GlassModal
          isOpen={isQuickBillingOpen}
          onClose={() => setIsQuickBillingOpen(false)}
          title={`Encaissement Direct : ${selectedPatient.lastName.toUpperCase()} ${selectedPatient.firstName}`}
          subtitle="Facturation et encaissement réunis en 1 seule étape avec reçu immédiat"
          icon={<CreditCard className="w-5 h-5 text-[#D9B45B]" />}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteQuickBilling} className="space-y-4">
            <GlassSelect
              label="Prestation Principale *"
              value={billingPrestation}
              onChange={(e) => {
                const val = e.target.value;
                setBillingPrestation(val);
                if (val === "CONSULTATION_GENERALE") setBillingAmount("15000");
                else if (val === "SOIN_PANSEMENT") setBillingAmount("5000");
                else if (val === "BILAN_LABO") setBillingAmount("12000");
              }}
              options={[
                { value: "CONSULTATION_GENERALE", label: "Consultation Médecine Générale (15.000 FCFA)" },
                { value: "SOIN_PANSEMENT", label: "Soin Infirmier / Pansement (5.000 FCFA)" },
                { value: "BILAN_LABO", label: "Examens Biologiques Labo (12.000 FCFA)" },
              ]}
            />

            <GlassInput
              label="Montant Total Facturé *"
              type="number"
              value={billingAmount}
              onChange={(e) => setBillingAmount(e.target.value)}
              unit="FCFA"
              required
            />

            <div className="grid grid-cols-2 gap-3.5">
              <GlassSelect
                label="Mode de Règlement *"
                value={billingPaymentMethod}
                onChange={(e) => setBillingPaymentMethod(e.target.value as any)}
                options={[
                  { value: "MOBILE_MONEY", label: "Mobile Money (Orange/Wave)" },
                  { value: "ESPECES", label: "Espèces (Guichet)" },
                  { value: "CARTE", label: "Carte Bancaire / TPE" },
                ]}
              />

              <div className="flex flex-col justify-end pb-1.5">
                <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billingPaidNow}
                    onChange={(e) => setBillingPaidNow(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1261A0]"
                  />
                  <span>Encaissé immédiatement</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
              <GlassButton type="button" variant="ghost" size="md" onClick={() => setIsQuickBillingOpen(false)}>
                Annuler
              </GlassButton>
              <GlassButton type="submit" variant="gold" size="md" icon={<Receipt className="w-4 h-4" />}>
                Valider & Émettre Reçu
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}

      {/* MODAL 7: TICKET DE PASSAGE / ADMISSION */}
      {selectedPatient && (
        <GlassModal
          isOpen={isNewVisitModalOpen}
          onClose={() => setIsNewVisitModalOpen(false)}
          title={`Ticket de Passage : ${selectedPatient.lastName.toUpperCase()} ${selectedPatient.firstName}`}
          subtitle={`Dossier permanent : ${selectedPatient.patientCode}`}
          icon={<Plus className="w-5 h-5 text-cyan-400" />}
          maxWidth="md"
        >
          <form onSubmit={handleCreateVisit} className="space-y-4">
            <GlassSelect
              label="Type de Prise en Charge *"
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as any)}
              options={[
                { value: "CONSULTATION", label: "Consultation Médicale" },
                { value: "SOIN", label: "Soin Infirmier" },
                { value: "MATERNITE", label: "Maternité / CPN" },
                { value: "LABORATOIRE", label: "Examens Laboratoire" },
                { value: "IMAGERIE", label: "Imagerie Médicale" },
                { value: "URGENCE", label: "Urgence Clinique" },
              ]}
            />

            <GlassSelect
              label="Priorité de File d'Attente"
              value={visitPriority}
              onChange={(e) => setVisitPriority(e.target.value as any)}
              options={[
                { value: "NORMALE", label: "Priorité Normale" },
                { value: "URGENTE", label: "Prise en charge Urgente" },
              ]}
            />

            <GlassTextarea
              label="Motif d'arrivée / Notes"
              placeholder="Ex: Contrôle tensionnel, toux fébrile..."
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              rows={2}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
              <GlassButton type="button" variant="ghost" size="md" onClick={() => setIsNewVisitModalOpen(false)}>
                Annuler
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="md">
                Générer Ticket File d'Attente
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}
    </div>
  );
};
