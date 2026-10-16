import React, { useState } from "react";
import {
  ScanLine,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  User,
  Radio,
  FileText,
  CreditCard,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassInput, GlassSelect, GlassTextarea } from "../ui/GlassFormControls";
import { GlassModal } from "../ui/GlassModal";
import { GlassEmptyState } from "../ui/GlassEmptyState";

export const ImagingView: React.FC = () => {
  const {
    imagingRequests,
    addImagingRequest,
    completeImagingReport,
    addInvoice,
    patients,
    currentUser,
    currentSite,
    setSelectedPatientId,
    setActiveTab,
    setPrintableDoc,
    showToast,
  } = useApp();

  const [selectedImgId, setSelectedImgId] = useState<string>(imagingRequests[0]?.id || "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Imaging Form
  const [patientId, setPatientId] = useState(patients[0]?.id || "");
  const [modality, setModality] = useState<"RADIOLOGIE" | "ECHOGRAPHIE" | "SCANNER">("RADIOLOGIE");
  const [examName, setExamName] = useState("Radiographie Pulmonaire Thorax Face");
  const [indication, setIndication] = useState("Suspicion de foyer pulmonaire fébrile");

  // Editing Active Report
  const activeImage = imagingRequests.find((i) => i.id === selectedImgId) || imagingRequests[0];
  const activePatient = activeImage ? patients.find((p) => p.id === activeImage.patientId) : null;

  const [editFindings, setEditFindings] = useState(activeImage?.findings || "");
  const [editConclusion, setEditConclusion] = useState(activeImage?.conclusion || "");

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = addImagingRequest({
      visitId: `vis-img-${Date.now()}`,
      patientId,
      siteId: currentSite.id,
      requesterName: currentUser.fullName,
      modality,
      examName,
      indication,
      findings: "",
      conclusion: "",
      status: "DEMANDE",
    });

    setIsModalOpen(false);
    setSelectedImgId(newReq.id);
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeImage) return;

    completeImagingReport(
      activeImage.id,
      editFindings,
      editConclusion,
      currentUser.fullName
    );
  };

  const handleApplyNormalImaging = () => {
    if (!activeImage) return;
    if (activeImage.modality === "RADIOLOGIE") {
      setEditFindings("Cliché thoracique de face centré et inspiré. Absence de foyer parenchymateux de condensation évolutif. Absence de pneumothorax ou d'épanchement pleural. Culs-de-sac pleuraux libres. Silhouette cardio-médiastinale dans les limites de la normale.");
      setEditConclusion("Radiographie thoracique sans anomalie pleuro-parenchymateuse décelable.");
    } else {
      setEditFindings("Foie de taille normale, contours réguliers, échostructure homogène. Vésicule biliaire alithiasique à paroi fine. Voies biliaires intrahépatiques et cholédoque non dilatés. Reins de taille et différenciation cortico-médullaire normales, sans stase urinaire ni image lithiasique. Rate de taille normale. Absence d'épanchement péritonéal décelable.");
      setEditConclusion("Examen échographique abdomino-pelvien sans anomalie morphologique décelable.");
    }
    showToast("INFO", "Compte-Rendu Normal Appliqué", "Conclusions physiologiques standard insérées.");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl glass-surface border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-[#55D9FF] border border-sky-400/30 flex items-center justify-center">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Imagerie Médicale
            </h2>
          </div>
        </div>

        <GlassButton
          variant="gold"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Prescrire Examen d'Imagerie
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Imaging Requests List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 px-1">
            Examens Prescrits ({imagingRequests.length})
          </div>

          <div className="space-y-2.5">
            {imagingRequests.length === 0 ? (
              <GlassEmptyState
                icon={<ScanLine className="w-6 h-6 text-sky-400" />}
                title="Aucun examen d'imagerie"
                description="Aucune radio, échographie ou scanner n'est en attente. Vous pouvez prescrire un nouvel acte d'imagerie médicale."
                actionLabel="Prescrire Imagerie"
                actionIcon={<Plus className="w-4 h-4" />}
                onAction={() => setIsModalOpen(true)}
              />
            ) : (
              imagingRequests.map((img) => {
                const pat = patients.find((p) => p.id === img.patientId);
                const isSelected = img.id === activeImage?.id;

                return (
                  <div
                    key={img.id}
                    onClick={() => {
                      setSelectedImgId(img.id);
                      setEditFindings(img.findings);
                      setEditConclusion(img.conclusion);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-sky-500/15 border-sky-400/40 shadow-[0_0_20px_rgba(85,217,255,0.2)]"
                        : "glass-surface-subtle hover:glass-surface border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-sky-300">{img.imagingCode}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-white/5 border border-white/10 text-slate-300">
                        {img.modality}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">{img.examName}</h4>
                    <div className="text-xs text-slate-400 mt-1">
                      {pat ? `${pat.lastName.toUpperCase()} ${pat.firstName}` : "Patient"}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span
                        className={`font-semibold ${
                          img.status === "VALIDE" ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {img.status === "VALIDE" ? "Compte rendu rédigé" : "En attente"}
                      </span>
                    </div>
                  </div>
                );
              }))}
          </div>
        </div>

        {/* Right: Imaging Report Viewer / Editor (8 Cols) */}
        <div className="lg:col-span-8">
          {activeImage && activePatient ? (
            <GlassCard className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#55D9FF] text-base">
                      {activeImage.imagingCode}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      {activeImage.modality}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{activeImage.examName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-400">
                      Patient : {activePatient.lastName.toUpperCase()} {activePatient.firstName} ({activePatient.patientCode})
                    </p>
                    <button
                      onClick={() => {
                        setSelectedPatientId(activePatient.id);
                        setActiveTab("patients");
                      }}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Dossier
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* 1-Click Normal Findings Button */}
                  <button
                    type="button"
                    onClick={handleApplyNormalImaging}
                    className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Pré-remplir les constatations et conclusions radiologiques normales"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CR Normal (1 Clic)</span>
                  </button>

                  {/* Direct Billing Button */}
                  <button
                    type="button"
                    onClick={() => {
                      addInvoice({
                        visitId: activeImage.visitId,
                        patientId: activePatient.id,
                        siteId: currentSite.id,
                        items: [
                          {
                            id: `item-img-${Date.now()}`,
                            description: `Examen imagerie (${activeImage.modality}) : ${activeImage.examName}`,
                            quantity: 1,
                            unitPrice: 20000,
                            total: 20000,
                          },
                        ],
                        totalAmount: 20000,
                        paidAmount: 0,
                      });
                      showToast("SUCCESS", "Facture Générée", "Facture d'imagerie de 20 000 FCFA créée avec succès.");
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Générer directement la facture sans passer par l'écran caisse"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Facturer (20k)</span>
                  </button>

                  {activeImage.status === "VALIDE" && (
                    <GlassButton
                      variant="primary"
                      size="sm"
                      icon={<Printer className="w-3.5 h-3.5" />}
                      onClick={() =>
                        setPrintableDoc({
                          type: "IMAGING",
                          title: `COMPTE RENDU D'IMAGERIE MÉDICALE — ${activeImage.examName}`,
                          patient: activePatient,
                          data: activeImage,
                        })
                      }
                    >
                      Imprimer Compte Rendu
                    </GlassButton>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveReport} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                    Indication Médicale
                  </span>
                  {activeImage.indication}
                </div>

                <GlassTextarea
                  label="Description & Constatations Radiologiques"
                  placeholder="Aspect du parenchyme, structures osseuses, silhouette médiastinale, épanchement..."
                  value={editFindings}
                  onChange={(e) => setEditFindings(e.target.value)}
                  rows={4}
                />

                <GlassTextarea
                  label="Conclusion Diagnostique de l'Imagerie *"
                  placeholder="Synthèse radiologique claire destinée au médecin prescripteur..."
                  value={editConclusion}
                  onChange={(e) => setEditConclusion(e.target.value)}
                  rows={2}
                  required
                />

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <GlassButton
                    type="submit"
                    variant="gold"
                    size="md"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Valider le Compte Rendu
                  </GlassButton>
                </div>
              </form>
            </GlassCard>
          ) : (
            <GlassEmptyState
              icon={<ScanLine className="w-7 h-7 text-[#1261A0] dark:text-[#55D9FF]" />}
              title="Aucun examen sélectionné"
              description="Sélectionnez un examen radiologique ou échographique à gauche pour rédiger le compte rendu et consigner les conclusions médicales."
              actionLabel="Nouvel Examen"
              actionIcon={<Plus className="w-4 h-4" />}
              onAction={() => setIsModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* CREATE IMAGING MODAL */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Prescrire un Examen d'Imagerie"
        subtitle="Radiologie, Échographie ou Scanner"
        icon={<ScanLine className="w-5 h-5" />}
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <GlassSelect
            label="Patient *"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.lastName.toUpperCase()} ${p.firstName} (${p.patientCode})`,
            }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <GlassSelect
              label="Modalité *"
              value={modality}
              onChange={(e) => {
                const val = e.target.value as any;
                setModality(val);
                if (val === "ECHOGRAPHIE") {
                  setExamName("Échographie Abdomino-Pelvienne Complète");
                } else {
                  setExamName("Radiographie Pulmonaire Thorax Face (Debout)");
                }
              }}
              options={[
                { value: "RADIOLOGIE", label: "Radiologie Numérique (Rayons X)" },
                { value: "ECHOGRAPHIE", label: "Échographie Diagnostique" },
                { value: "SCANNER", label: "Scanner / Tomodensitométrie" },
              ]}
            />

            <GlassInput
              label="Intitulé de l'Examen *"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              required
            />
          </div>

          <GlassTextarea
            label="Indication Clinique & Question Posée *"
            placeholder="Ex: Douleur fosse iliaque droite fébrile, éliminer appendicite..."
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            rows={3}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="gold" size="md">
              Créer la Demande d'Imagerie
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
