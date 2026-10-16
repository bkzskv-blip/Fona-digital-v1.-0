import React, { useState, useMemo } from "react";
import {
  HeartHandshake,
  Clock,
  User,
  FileCheck,
  CheckCircle2,
  Syringe,
  Printer,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassInput, GlassSelect, GlassTextarea } from "../ui/GlassFormControls";
import { GlassEmptyState } from "../ui/GlassEmptyState";

export const CareView: React.FC = () => {
  const {
    patients,
    visits,
    cares,
    addCare,
    addInvoice,
    currentUser,
    currentSite,
    selectedPatientId,
    setSelectedPatientId,
    setActiveTab: setGlobalTab,
    setPrintableDoc,
    showToast,
    formatCurrency,
    formatDateTime,
  } = useApp();

  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const patientVisits = useMemo(() => {
    return visits.filter((v) => v.patientId === activePatient.id);
  }, [visits, activePatient.id]);

  const [selectedVisitId, setSelectedVisitId] = useState<string>(
    patientVisits[0]?.id || `vis-care-${Date.now()}`
  );
  const [careType, setCareType] = useState("Pansement stérile & Soin de plaie");
  const [customCareType, setCustomCareType] = useState("");
  const [isCustomCareType, setIsCustomCareType] = useState(false);
  const [observations, setObservations] = useState("");
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [careTariff, setCareTariff] = useState("5000");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitCare = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCareType = isCustomCareType ? customCareType.trim() : careType.trim();

    if (!finalCareType) {
      showToast("WARNING", "Champs requis", "Veuillez renseigner l'acte de soin réalisé.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newCare = addCare({
        visitId: selectedVisitId || `vis-care-${Date.now()}`,
        patientId: activePatient.id,
        siteId: currentSite.id,
        nurseId: currentUser.id,
        nurseName: currentUser.fullName,
        careType: finalCareType,
        observations: observations || "Acte réalisé selon les règles d'asepsie en vigueur. Aucune complication signalée.",
      });

      // Optional Auto-Billing without extra navigation
      if (autoInvoice && parseFloat(careTariff) > 0) {
        addInvoice({
          visitId: newCare.visitId,
          patientId: activePatient.id,
          siteId: currentSite.id,
          items: [
            {
              id: `item-care-${Date.now()}`,
              description: `Acte infirmier : ${finalCareType}`,
              quantity: 1,
              unitPrice: parseFloat(careTariff),
              total: parseFloat(careTariff),
            },
          ],
          totalAmount: parseFloat(careTariff),
          paidAmount: 0,
        });
        showToast("SUCCESS", "Facture Générée", `Facture de soin créée automatiquement (${formatCurrency(parseInt(careTariff))}).`);
      }

      setObservations("");
      setCustomCareType("");
      setIsCustomCareType(false);
      setCareType("Pansement stérile & Soin de plaie");

      // Offer printing
      setPrintableDoc({
        type: "CARE",
        title: `FICHE D'ACTE & SOIN INFIRMIER — ${newCare.careCode}`,
        patient: activePatient,
        data: newCare,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl glass-surface-subtle border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#20B8A6] border border-teal-400/30 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Patient Soigné
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{activePatient.lastName.toUpperCase()} {activePatient.firstName}</span>
              <span className="font-mono text-cyan-300 text-xs">({activePatient.patientCode})</span>
            </div>
          </div>
        </div>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form: Enregistrer un Soin (7 Cols) */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Fiche d'Administration de Soin
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Horodatage automatique</span>
              </div>
            </div>

            {/* Quick Presets for Common Nursing Care */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                Protocoles de Soins Express (1 Clic)
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCareType(false);
                    setCareType("Pansement stérile & Soin de plaie");
                    setObservations("Nettoyage antiseptique et pansement occlusif stérile refait. Berges propres, pas d'écoulement purulent.");
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-teal-300 transition-colors cursor-pointer"
                >
                  Pansement Stérile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCareType(false);
                    setCareType("Injection Intramusculaire (IM)");
                    setObservations("Injection IM réalisée dans le quadrant supéro-externe fessier selon prescription. Absence d'hématome, bonne tolérance.");
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 text-blue-300 transition-colors cursor-pointer"
                >
                  Injection IM
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCareType(false);
                    setCareType("Pose de voie veineuse périphérique & Perfusion");
                    setObservations("Voie veineuse posée au pli du coude sans difficulté. Débit réglé à 30 gouttes/min, point de ponction propre.");
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-purple-300 transition-colors cursor-pointer"
                >
                  Perfusion IV
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCareType(false);
                    setCareType("Prélèvement sanguin / Bilan");
                    setObservations("Prélèvement sanguin veineux réalisé sans incident. Tubes étiquetés et transmis au laboratoire.");
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 transition-colors cursor-pointer"
                >
                  Prélèvement Bilan
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitCare} className="space-y-4">
              {/* Passage & Professionnel Info Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                    Passage Médical Associé
                  </label>
                  {patientVisits.length > 0 ? (
                    <select
                      value={selectedVisitId}
                      onChange={(e) => setSelectedVisitId(e.target.value)}
                      className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      {patientVisits.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.visitCode} — {v.type} ({v.queueNumber})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-xs text-cyan-300 font-mono py-1.5">
                      Passage automatique du jour (VIS-ACTUEL)
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                    Professionnel Auteur (Session)
                  </label>
                  <div className="text-xs font-bold text-white py-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#D9B45B]" />
                    <span>{currentUser.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({currentUser.role})</span>
                  </div>
                </div>
              </div>

              {/* Acte de Soin : Liste simple ou saisie libre */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Acte de Soin Réalisé *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCareType(!isCustomCareType)}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    {isCustomCareType ? "Choisir dans la liste prédéfinie" : "+ Saisir un acte libre"}
                  </button>
                </div>

                {isCustomCareType ? (
                  <GlassInput
                    placeholder="Saisissez librement l'acte de soin réalisé (ex: Lavage d'oreille, Pose de sonde...)"
                    value={customCareType}
                    onChange={(e) => setCustomCareType(e.target.value)}
                    required
                  />
                ) : (
                  <GlassSelect
                    value={careType}
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM") {
                        setIsCustomCareType(true);
                      } else {
                        setCareType(e.target.value);
                      }
                    }}
                    options={[
                      { value: "Pansement stérile & Soin de plaie", label: "Pansement stérile & Soin de plaie" },
                      { value: "Injection Intramusculaire (IM)", label: "Injection Intramusculaire (IM)" },
                      { value: "Injection Intraveineuse directe (IV)", label: "Injection Intraveineuse directe (IV)" },
                      { value: "Pose de voie veineuse périphérique & Perfusion", label: "Pose de voie veineuse périphérique & Perfusion" },
                      { value: "Prélèvement sanguin / Bilan", label: "Prélèvement sanguin / Bilan" },
                      { value: "Aérosolthérapie / Nébulisation", label: "Aérosolthérapie / Nébulisation" },
                      { value: "Sondage urinaire vésical", label: "Sondage urinaire vésical" },
                      { value: "Ablation de fils / agrafes", label: "Ablation de fils / agrafes" },
                      { value: "CUSTOM", label: "✏️ Autre acte (Saisie libre)..." },
                    ]}
                  />
                )}
              </div>

              {/* Observations libres du soin */}
              <GlassTextarea
                label="Observations & Constatations du Soin"
                placeholder="Aspect de la plaie, tolérance du patient, absence d'hématome, pansement propre, paramètres observés..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
              />

              {/* Facturation optionnelle intégrée */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-200">
                  <input
                    type="checkbox"
                    checked={autoInvoice}
                    onChange={(e) => setAutoInvoice(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Générer automatiquement la facture de soin à la validation</span>
                </label>

                {autoInvoice && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-300">Tarif de l'acte :</span>
                    <select
                      value={careTariff}
                      onChange={(e) => setCareTariff(e.target.value)}
                      className="bg-[#051426] border border-amber-500/30 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300 focus:outline-none"
                    >
                      <option value="3000">3 000 FCFA (Soin simple)</option>
                      <option value="5000">5 000 FCFA (Pansement / IM)</option>
                      <option value="10000">10 000 FCFA (Perfusion / VVP)</option>
                      <option value="15000">15 000 FCFA (Soin complexe)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setGlobalTab("patients");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Dossier complet du patient
                </button>

                <GlassButton
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  icon={<FileCheck className="w-4 h-4" />}
                >
                  {isSubmitting ? "Enregistrement du soin..." : "Valider & Enregistrer le Soin"}
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Historique des Soins du Patient (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
            <span>Historique Soins ({cares.filter((c) => c.patientId === activePatient.id).length})</span>
            <span>Traçabilité infirmière</span>
          </div>

          <div className="space-y-3">
            {cares.filter((c) => c.patientId === activePatient.id).length === 0 ? (
              <GlassEmptyState
                icon={<HeartHandshake className="w-6 h-6 text-teal-400" />}
                title="Aucun soin enregistré"
                description={`Aucun soin ou acte infirmier n'a été consigné pour ${activePatient.lastName.toUpperCase()} ${activePatient.firstName}. Utilisez le formulaire pour enregistrer un nouvel acte.`}
              />
            ) : (
              cares
                .filter((c) => c.patientId === activePatient.id)
                .map((care) => (
                <GlassCard key={care.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-teal-300">{care.careCode}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-mono text-[11px]">
                        {formatDateTime(care.administeredAt)}
                      </span>
                      <button
                        onClick={() =>
                          setPrintableDoc({
                            type: "CARE",
                            title: `FICHE D'ACTE & SOIN INFIRMIER — ${care.careCode}`,
                            patient: activePatient,
                            data: care,
                          })
                        }
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-teal-300 hover:text-white transition-all cursor-pointer"
                        title="Imprimer fiche de soin"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-bold text-[var(--text-primary)]">{care.careType}</div>
                  <div className="text-xs text-slate-400">Effectué par : {care.nurseName}</div>

                  {care.productsUsed && care.productsUsed.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Matériel utilisé :
                      </span>
                      <ul className="text-xs text-slate-300 space-y-0.5">
                        {care.productsUsed.map((p, i) => (
                          <li key={i} className="flex justify-between text-[11px]">
                            <span>{p.name} ({p.quantity})</span>
                            <span className="text-cyan-300 font-medium">[{p.source}]</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 italic">{care.observations}</p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setGlobalTab("patients");
                      }}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Dossier Patient
                    </button>

                    <button
                      onClick={() => {
                        addInvoice({
                          visitId: care.visitId,
                          patientId: activePatient.id,
                          siteId: currentSite.id,
                          items: [
                            {
                              id: `item-care-late-${Date.now()}`,
                              description: `Soin infirmier : ${care.careType}`,
                              quantity: 1,
                              unitPrice: 5000,
                              total: 5000,
                            },
                          ],
                          totalAmount: 5000,
                          paidAmount: 0,
                        });
                        showToast("SUCCESS", "Facture Créée", "Facture de 5 000 FCFA ajoutée à la caisse.");
                      }}
                      className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-md border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3" />
                      Facturer Acte (5k)
                    </button>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
