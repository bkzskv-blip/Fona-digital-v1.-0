import React, { useState, useMemo } from "react";
import {
  Baby,
  Plus,
  Calendar,
  Heart,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  Scale,
  Activity,
  ShieldCheck,
  Printer,
  ExternalLink,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassInput, GlassSelect, GlassTextarea } from "../ui/GlassFormControls";
import { GlassModal } from "../ui/GlassModal";
import { GlassEmptyState } from "../ui/GlassEmptyState";
import { Pregnancy, PrenatalVisit, Delivery } from "../../types";

export const MaternityView: React.FC = () => {
  const {
    patients,
    pregnancies,
    prenatalVisits,
    deliveries,
    addPregnancy,
    addPrenatalVisit,
    addDelivery,
    currentUser,
    currentSite,
    selectedPatientId,
    setSelectedPatientId,
    setActiveTab: setGlobalTab,
    setPrintableDoc,
    showToast,
    formatDate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"PREGNANCIES" | "CPN" | "DELIVERIES">("PREGNANCIES");

  // Modals
  const [isPregnancyModalOpen, setIsPregnancyModalOpen] = useState(false);
  const [isCpnModalOpen, setIsCpnModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  // New Pregnancy Form
  const defaultFemaleId = useMemo(() => {
    const matched = patients.find((p) => p.id === selectedPatientId && p.sex === "FEMALE");
    if (matched) return matched.id;
    return patients.find((p) => p.sex === "FEMALE")?.id || "";
  }, [patients, selectedPatientId]);

  const [pregPatientId, setPregPatientId] = useState(defaultFemaleId);
  const [lmpDate, setLmpDate] = useState("2025-10-01");
  const [eddDate, setEddDate] = useState("2026-07-08");
  const [gravidity, setGravidity] = useState("2");
  const [parity, setParity] = useState("1");
  const [abortions, setAbortions] = useState("0");
  const [livingChildren, setLivingChildren] = useState("1");
  const [riskFactors, setRiskFactors] = useState("");

  // Auto-calculate DPA from DDR (Naegele: DDR + 280 jours)
  const handleLmpChange = (val: string) => {
    setLmpDate(val);
    if (val) {
      const lmp = new Date(val);
      if (!isNaN(lmp.getTime())) {
        const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
        setEddDate(edd.toISOString().split("T")[0]);
      }
    }
  };

  // New CPN Form
  const [cpnPregnancyId, setCpnPregnancyId] = useState(pregnancies[0]?.id || "");
  const [cpnNumber, setCpnNumber] = useState("4");
  const [gestationalAge, setGestationalAge] = useState("32");
  const [cpnWeight, setCpnWeight] = useState("68");
  const [cpnBP, setCpnBP] = useState("120/75");
  const [fundalHeight, setFundalHeight] = useState("30");
  const [fetalHeartRate, setFetalHeartRate] = useState("142");
  const [fetalMovement, setFetalMovement] = useState(true);
  const [edema, setEdema] = useState(false);
  const [cpnNotes, setCpnNotes] = useState("");

  const handleApplyNormalCpn = () => {
    setCpnBP("120/75");
    setFetalHeartRate("140");
    setFundalHeight("30");
    setFetalMovement(true);
    setEdema(false);
    setCpnNotes("Examen obstétrical physiologique normal. BCF réguliers, fœtus actif, pas d'œdème.");
    showToast("INFO", "Protocole CPN Appliqué", "Paramètres prénataux normaux initialisés.");
  };

  // New Delivery Form (Volet 1 & 2)
  const [delPregnancyId, setDelPregnancyId] = useState(pregnancies[0]?.id || "");
  const [arrivalStage, setArrivalStage] = useState("Phase active de travail, col effacé dilatation 6cm");
  const [cervicalDilation, setCervicalDilation] = useState("6");
  const [membranesStatus, setMembranesStatus] = useState<"INTACTES" | "ROMPUES">("ROMPUES");
  const [presentation, setPresentation] = useState<"CEPHALIQUE" | "SIEGE" | "TRANSVERSE">("CEPHALIQUE");
  const [deliveryType, setDeliveryType] = useState<"VOIE_BASSE" | "CESARIENNE">("VOIE_BASSE");
  const [babyGender, setBabyGender] = useState<"GARCON" | "FILLE">("GARCON");
  const [babyWeight, setBabyWeight] = useState("3400");
  const [babyHeight, setBabyHeight] = useState("50");
  const [apgar1, setApgar1] = useState("9");
  const [apgar5, setApgar5] = useState("10");
  const [placentaComplete, setPlacentaComplete] = useState(true);
  const [bloodLoss, setBloodLoss] = useState("180");
  const [complications, setComplications] = useState("Délivrance eutocique complète.");

  const handleApplyNormalDelivery = () => {
    setArrivalStage("Phase active de travail, col effacé dilatation complète à 10cm");
    setCervicalDilation("10");
    setMembranesStatus("ROMPUES");
    setPresentation("CEPHALIQUE");
    setDeliveryType("VOIE_BASSE");
    setBabyGender("GARCON");
    setBabyWeight("3350");
    setBabyHeight("50");
    setApgar1("9");
    setApgar5("10");
    setPlacentaComplete(true);
    setBloodLoss("150");
    setComplications("Accouchement eutocique par voie basse, délivrance complète spontanée, nouveau-né vigoureux.");
    showToast("INFO", "Protocole Eutocique Appliqué", "Paramètres d'accouchement standard normal initialisés.");
  };

  const handleCreatePregnancy = (e: React.FormEvent) => {
    e.preventDefault();
    addPregnancy({
      patientId: pregPatientId,
      siteId: currentSite.id,
      lmpDate,
      eddDate,
      gravidity: parseInt(gravidity) || 1,
      parity: parseInt(parity) || 0,
      abortions: parseInt(abortions) || 0,
      livingChildren: parseInt(livingChildren) || 0,
      riskFactors: riskFactors ? riskFactors.split(",").map((s) => s.trim()) : [],
      status: "EN_COURS",
      notes: "Suivi médical prénatal initialisé.",
    });
    setIsPregnancyModalOpen(false);
  };

  const handleCreateCpn = (e: React.FormEvent) => {
    e.preventDefault();
    const pregnancy = pregnancies.find((p) => p.id === cpnPregnancyId);
    if (!pregnancy) return;

    addPrenatalVisit({
      pregnancyId: pregnancy.id,
      patientId: pregnancy.patientId,
      siteId: currentSite.id,
      cpnNumber: parseInt(cpnNumber) || 1,
      date: new Date().toISOString().split("T")[0],
      gestationalAgeWeeks: parseInt(gestationalAge) || 20,
      weight: parseFloat(cpnWeight) || 60,
      bloodPressure: cpnBP,
      fundalHeightCm: parseFloat(fundalHeight) || 20,
      fetalHeartRateBpm: parseInt(fetalHeartRate) || 140,
      fetalMovement,
      edema,
      albuminuria: "NEGATIVE",
      glucosuria: "NEGATIVE",
      ironPrescribed: true,
      ultrasoundDone: false,
      notes: cpnNotes || "Examen obstétrical satisfaisant. BCF réguliers.",
      midwifeName: currentUser.fullName,
    });
    setIsCpnModalOpen(false);
  };

  const handleCreateDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const pregnancy = pregnancies.find((p) => p.id === delPregnancyId);
    if (!pregnancy) return;

    addDelivery({
      pregnancyId: pregnancy.id,
      patientId: pregnancy.patientId,
      siteId: currentSite.id,
      arrivalDateTime: new Date().toISOString(),
      laborStage: arrivalStage,
      cervicalDilationCm: parseFloat(cervicalDilation) || 5,
      membranesStatus,
      presentation,
      deliveryDateTime: new Date().toISOString(),
      deliveryType,
      babyGender,
      babyWeightGrams: parseInt(babyWeight) || 3000,
      babyHeightCm: parseInt(babyHeight) || 50,
      apgar1min: parseInt(apgar1) || 9,
      apgar5min: parseInt(apgar5) || 10,
      placentaDeliveryDateTime: new Date().toISOString(),
      placentaComplete,
      postpartumBloodLossMl: parseInt(bloodLoss) || 200,
      complications,
      midwifeName: currentUser.fullName,
    });
    setIsDeliveryModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#2a0e38]/70 via-[#181138]/70 to-[#071A33]/70 border border-violet-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-400/30 text-[#8B7CFF] flex items-center justify-center">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Pôle Maternité & Suivi Obstétrical
            </h2>
            <p className="text-xs text-violet-200/80">
              Dossiers grossesses, consultations prénatales (CPN 1 à 8) et accouchements sécurisés
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[#051426] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("PREGNANCIES")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "PREGNANCIES"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Grossesses ({pregnancies.length})
            </button>
            <button
              onClick={() => setActiveTab("CPN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "CPN"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              CPN ({prenatalVisits.length})
            </button>
            <button
              onClick={() => setActiveTab("DELIVERIES")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "DELIVERIES"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Accouchements ({deliveries.length})
            </button>
          </div>

          <GlassButton
            variant="gold"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              if (activeTab === "PREGNANCIES") setIsPregnancyModalOpen(true);
              else if (activeTab === "CPN") setIsCpnModalOpen(true);
              else setIsDeliveryModalOpen(true);
            }}
          >
            {activeTab === "PREGNANCIES"
              ? "Nouveau Dossier Grossesse"
              : activeTab === "CPN"
              ? "Nouvelle CPN"
              : "Enregistrer Naissance"}
          </GlassButton>
        </div>
      </div>

      {/* TAB 1: GROSSESSES EN COURS */}
      {activeTab === "PREGNANCIES" && (
        pregnancies.length === 0 ? (
          <GlassEmptyState
            icon={<Baby className="w-7 h-7 text-pink-400" />}
            title="Aucun suivi de grossesse actif"
            description="Aucun dossier de maternité en cours n'a été enregistré. Vous pouvez ouvrir un nouveau suivi obstétrical dès aujourd'hui."
            actionLabel="Nouveau Suivi Grossesse"
            actionIcon={<Plus className="w-4 h-4" />}
            onAction={() => setIsPregnancyModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pregnancies.map((preg) => {
            const patient = patients.find((p) => p.id === preg.patientId);
            const cpnCount = prenatalVisits.filter((c) => c.pregnancyId === preg.id).length;

            return (
              <GlassCard key={preg.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="font-mono text-xs font-bold text-violet-300">
                      {preg.pregnancyCode}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
                      {patient ? `${patient.lastName.toUpperCase()} ${patient.firstName}` : "Patiente"}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      preg.status === "EN_COURS"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                        : "bg-cyan-500/20 text-cyan-300 border-cyan-400/30"
                    }`}
                  >
                    {preg.status}
                  </span>
                </div>

                {/* Obstetric History Badges: Gravida / Parity */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Gestité</span>
                    <span className="font-mono font-bold text-white text-sm">G{preg.gravidity}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Parité</span>
                    <span className="font-mono font-bold text-white text-sm">P{preg.parity}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Avortement</span>
                    <span className="font-mono font-bold text-white text-sm">A{preg.abortions}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Vivants</span>
                    <span className="font-mono font-bold text-white text-sm">EV{preg.livingChildren}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date Dernières Règles (DDR) :</span>
                    <span className="font-mono">{formatDate(preg.lmpDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date Prévue d'Accouchement (DPA) :</span>
                    <span className="font-mono font-bold text-[#55D9FF]">{formatDate(preg.eddDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consultations CPN Réalisées :</span>
                    <span className="font-bold text-violet-300">{cpnCount} CPN enregistrée(s)</span>
                  </div>
                </div>

                {preg.riskFactors?.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                    <span className="font-bold">Facteurs de risque :</span> {preg.riskFactors.join(", ")}
                  </div>
                )}

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPatientId(preg.patientId);
                        setGlobalTab("patients");
                      }}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Dossier Patiente
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setCpnPregnancyId(preg.id);
                        setCpnNumber((cpnCount + 1).toString());
                        setIsCpnModalOpen(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-400/30 text-violet-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      CPN {cpnCount + 1}
                    </button>

                    <button
                      onClick={() => {
                        setDelPregnancyId(preg.id);
                        setIsDeliveryModalOpen(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/30 text-pink-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Baby className="w-3 h-3" />
                      Accouchement
                    </button>

                    <button
                      onClick={() => {
                        const del = deliveries.find((d) => d.pregnancyId === preg.id);
                        setPrintableDoc({
                          type: "MATERNITY",
                          title: `DOSSIER OBSTÉTRICAL & MATERNITÉ — ${preg.pregnancyCode}`,
                          patient: patient || patients[0],
                          data: { ...preg, delivery: del },
                        });
                      }}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Imprimer dossier obstétrical"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
        )
      )}

      {/* TAB 2: CONSULTATIONS PRÉNATALES (CPN) */}
      {activeTab === "CPN" && (
        prenatalVisits.length === 0 ? (
          <GlassEmptyState
            icon={<Heart className="w-7 h-7 text-violet-400" />}
            title="Aucune consultation prénatale (CPN)"
            description="Aucune consultation prénatale n'est encore consignée. Vous pouvez consigner une CPN dès maintenant."
            actionLabel="Nouvelle CPN"
            actionIcon={<Plus className="w-4 h-4" />}
            onAction={() => setIsCpnModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {prenatalVisits.map((cpn) => {
            const patient = patients.find((p) => p.id === cpn.patientId);

            return (
              <GlassCard key={cpn.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-400/30">
                      {cpn.cpnCode}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {patient ? `${patient.lastName.toUpperCase()} ${patient.firstName}` : "Patiente"}
                    </span>
                    <span className="text-xs text-slate-400">· {formatDate(cpn.date)}</span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center gap-4 flex-wrap">
                    <span>Âge gestationnel : <b className="text-cyan-300">{cpn.gestationalAgeWeeks} SA</b></span>
                    <span>Poids : <b>{cpn.weight} kg</b></span>
                    <span>TA : <b>{cpn.bloodPressure}</b></span>
                    <span>Hauteur utérine : <b>{cpn.fundalHeightCm} cm</b></span>
                    <span>BCF : <b className="text-rose-400">{cpn.fetalHeartRateBpm} bpm</b></span>
                  </div>

                  <p className="text-xs text-slate-400 italic">{cpn.notes}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block">Sage-Femme :</span>
                  <span className="text-xs font-bold text-white">{cpn.midwifeName}</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
        )
      )}

      {/* TAB 3: ACCOUCHEMENTS (Section 16 & 57-59 Volet 1 et 2) */}
      {activeTab === "DELIVERIES" && (
        deliveries.length === 0 ? (
          <GlassEmptyState
            icon={<Baby className="w-7 h-7 text-pink-400" />}
            title="Aucun accouchement consigné"
            description="Aucun dossier d'accouchement n'a été consigné. Vous pouvez enregistrer une naissance (Volet 1 & 2) dès aujourd'hui."
            actionLabel="Enregistrer Naissance"
            actionIcon={<Plus className="w-4 h-4" />}
            onAction={() => setIsDeliveryModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {deliveries.map((del) => {
            const patient = patients.find((p) => p.id === del.patientId);

            return (
              <GlassCard key={del.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="font-mono text-xs font-bold text-pink-300">
                      {del.deliveryCode}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      Accouchement — {patient ? `${patient.lastName.toUpperCase()} ${patient.firstName}` : "Patiente"}
                    </h3>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-pink-500/20 text-pink-300 border border-pink-400/30">
                    {del.deliveryType === "VOIE_BASSE" ? "Voie Basse" : "Césarienne"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Volet 1: Arrivée en salle de travail */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block">
                      Volet 1 : Arrivée en Salle de Travail
                    </span>
                    <p className="text-xs text-slate-300">{del.laborStage}</p>
                    <div className="text-xs text-slate-400 space-y-0.5">
                      <div>Dilatation cervicale : <b>{del.cervicalDilationCm} cm</b></div>
                      <div>Poches des eaux : <b>{del.membranesStatus}</b></div>
                      <div>Présentation : <b>{del.presentation}</b></div>
                    </div>
                  </div>

                  {/* Volet 2: Après accouchement & Nouveau-né */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-pink-400 block">
                      Volet 2 : Nouveau-Né & Post-Partum
                    </span>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Genre du bébé :</span>
                        <b className="text-white">{del.babyGender === "GARCON" ? "Garçon" : "Fille"}</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Poids & Taille :</span>
                        <b>{del.babyWeightGrams} g · {del.babyHeightCm} cm</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Score APGAR (1 min / 5 min) :</span>
                        <b className="text-emerald-400">{del.apgar1min} / {del.apgar5min}</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Pertes sanguines :</span>
                        <span>{del.postpartumBloodLossMl} ml</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span>Observation : {del.complications || "Suites de couches simples."}</span>
                  <span>Sage-femme : <b className="text-white">{del.midwifeName}</b></span>
                </div>
              </GlassCard>
            );
          })}
        </div>
        )
      )}

      {/* CREATE PREGNANCY MODAL */}
      <GlassModal
        isOpen={isPregnancyModalOpen}
        onClose={() => setIsPregnancyModalOpen(false)}
        title="Nouveau Dossier Obstétrical / Grossesse"
        subtitle="Historique obstétrical et calcul de la DPA"
        icon={<Baby className="w-5 h-5" />}
      >
        <form onSubmit={handleCreatePregnancy} className="space-y-4">
          <GlassSelect
            label="Patiente *"
            value={pregPatientId}
            onChange={(e) => setPregPatientId(e.target.value)}
            options={patients
              .filter((p) => p.sex === "FEMALE")
              .map((p) => ({
                value: p.id,
                label: `${p.lastName.toUpperCase()} ${p.firstName} (${p.patientCode})`,
              }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <GlassInput
              label="Date Dernières Règles (DDR) *"
              type="date"
              value={lmpDate}
              onChange={(e) => handleLmpChange(e.target.value)}
              hint="Calcul automatique du terme (+40 SA)"
              required
            />
            <GlassInput
              label="Date Prévue Accouchement (DPA - Auto) *"
              type="date"
              value={eddDate}
              onChange={(e) => setEddDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <GlassInput
              label="Gestité (G)"
              type="number"
              value={gravidity}
              onChange={(e) => setGravidity(e.target.value)}
            />
            <GlassInput
              label="Parité (P)"
              type="number"
              value={parity}
              onChange={(e) => setParity(e.target.value)}
            />
            <GlassInput
              label="Avortements (A)"
              type="number"
              value={abortions}
              onChange={(e) => setAbortions(e.target.value)}
            />
            <GlassInput
              label="Enfants Vivants"
              type="number"
              value={livingChildren}
              onChange={(e) => setLivingChildren(e.target.value)}
            />
          </div>

          <GlassInput
            label="Facteurs de Risque"
            placeholder="Ex: Césarienne antérieure, HTA gravidique, Drépanocytose..."
            value={riskFactors}
            onChange={(e) => setRiskFactors(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsPregnancyModalOpen(false)}
            >
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="gold" size="md">
              Enregistrer Dossier Grossesse
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* CREATE CPN MODAL */}
      <GlassModal
        isOpen={isCpnModalOpen}
        onClose={() => setIsCpnModalOpen(false)}
        title="Consultation Prénatale (CPN)"
        subtitle="Constantes obstétricales, hauteur utérine & BCF"
        icon={<Baby className="w-5 h-5" />}
      >
        <form onSubmit={handleCreateCpn} className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase text-slate-300">Paramètres de la CPN</span>
            <button
              type="button"
              onClick={handleApplyNormalCpn}
              className="text-xs text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Valeurs Normales (1 Clic)</span>
            </button>
          </div>

          <GlassSelect
            label="Grossesse Suivie *"
            value={cpnPregnancyId}
            onChange={(e) => setCpnPregnancyId(e.target.value)}
            options={pregnancies.map((pr) => {
              const pt = patients.find((p) => p.id === pr.patientId);
              return {
                value: pr.id,
                label: `${pr.pregnancyCode} — ${pt?.lastName.toUpperCase()} ${pt?.firstName}`,
              };
            })}
          />

          <div className="grid grid-cols-2 gap-4">
            <GlassSelect
              label="Rang de la CPN *"
              value={cpnNumber}
              onChange={(e) => setCpnNumber(e.target.value)}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
                value: n.toString(),
                label: `CPN ${n}`,
              }))}
            />
            <GlassInput
              label="Âge Gestationnel (SA) *"
              type="number"
              value={gestationalAge}
              onChange={(e) => setGestationalAge(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <GlassInput
              label="Poids (kg)"
              value={cpnWeight}
              onChange={(e) => setCpnWeight(e.target.value)}
            />
            <GlassInput
              label="Tension Artérielle"
              value={cpnBP}
              onChange={(e) => setCpnBP(e.target.value)}
            />
            <GlassInput
              label="Hauteur Utérine (cm)"
              value={fundalHeight}
              onChange={(e) => setFundalHeight(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GlassInput
              label="Bruits du Cœur Fœtal (bpm)"
              value={fetalHeartRate}
              onChange={(e) => setFetalHeartRate(e.target.value)}
            />
            <GlassSelect
              label="Mouvements Fœtaux Perçus"
              value={fetalMovement ? "true" : "false"}
              onChange={(e) => setFetalMovement(e.target.value === "true")}
              options={[
                { value: "true", label: "Oui — Bien perçus" },
                { value: "false", label: "Non perçus" },
              ]}
            />
          </div>

          <GlassTextarea
            label="Notes Cliniques CPN"
            placeholder="Ex: Pas de contractions utérines, col long fermé postérieur, supplémentation fer délivrée..."
            value={cpnNotes}
            onChange={(e) => setCpnNotes(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsCpnModalOpen(false)}
            >
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="md">
              Valider la CPN
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* CREATE DELIVERY MODAL (Section 16 & 57-59) */}
      <GlassModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        title="Enregistrement d'un Accouchement"
        subtitle="Volet 1 (Arrivée) & Volet 2 (Après-accouchement)"
        icon={<Baby className="w-5 h-5" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateDelivery} className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase text-slate-300">Paramètres de Naissance</span>
            <button
              type="button"
              onClick={handleApplyNormalDelivery}
              className="text-xs text-pink-300 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Accouchement Eutocique Normal (1 Clic)</span>
            </button>
          </div>

          <GlassSelect
            label="Dossier Obstétrical / Patiente *"
            value={delPregnancyId}
            onChange={(e) => setDelPregnancyId(e.target.value)}
            options={pregnancies.map((pr) => {
              const pt = patients.find((p) => p.id === pr.patientId);
              return {
                value: pr.id,
                label: `${pr.pregnancyCode} — ${pt?.lastName.toUpperCase()} ${pt?.firstName}`,
              };
            })}
          />

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              Volet 1 : Arrivée en Maternité & Travail
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <GlassInput
                label="Dilatation Cervicale (cm)"
                type="number"
                value={cervicalDilation}
                onChange={(e) => setCervicalDilation(e.target.value)}
              />
              <GlassSelect
                label="État des Membranes"
                value={membranesStatus}
                onChange={(e) => setMembranesStatus(e.target.value as any)}
                options={[
                  { value: "ROMPUES", label: "Rompues" },
                  { value: "INTACTES", label: "Intactes" },
                ]}
              />
              <GlassSelect
                label="Présentation"
                value={presentation}
                onChange={(e) => setPresentation(e.target.value as any)}
                options={[
                  { value: "CEPHALIQUE", label: "Céphalique" },
                  { value: "SIEGE", label: "Siège" },
                  { value: "TRANSVERSE", label: "Transverse" },
                ]}
              />
            </div>
            <GlassInput
              label="Phase de Travail"
              value={arrivalStage}
              onChange={(e) => setArrivalStage(e.target.value)}
            />
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <span className="text-xs font-bold text-pink-400 uppercase tracking-wider block">
              Volet 2 : Issue & Nouveau-né
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <GlassSelect
                label="Mode d'Accouchement"
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as any)}
                options={[
                  { value: "VOIE_BASSE", label: "Voie Basse Eutocique" },
                  { value: "CESARIENNE", label: "Césarienne" },
                ]}
              />
              <GlassSelect
                label="Genre"
                value={babyGender}
                onChange={(e) => setBabyGender(e.target.value as any)}
                options={[
                  { value: "GARCON", label: "Garçon" },
                  { value: "FILLE", label: "Fille" },
                ]}
              />
              <GlassInput
                label="Poids Naissance (g)"
                type="number"
                value={babyWeight}
                onChange={(e) => setBabyWeight(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <GlassInput
                label="Taille (cm)"
                type="number"
                value={babyHeight}
                onChange={(e) => setBabyHeight(e.target.value)}
              />
              <GlassInput
                label="APGAR 1 min"
                type="number"
                value={apgar1}
                onChange={(e) => setApgar1(e.target.value)}
              />
              <GlassInput
                label="APGAR 5 min"
                type="number"
                value={apgar5}
                onChange={(e) => setApgar5(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsDeliveryModalOpen(false)}
            >
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="gold" size="md">
              Clôturer & Enregistrer Naissance
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
