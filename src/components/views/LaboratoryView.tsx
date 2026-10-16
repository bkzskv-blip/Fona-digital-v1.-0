import React, { useState, useMemo } from "react";
import {
  FlaskConical,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  User,
  Search,
  Filter,
  CreditCard,
  ExternalLink,
  Sparkles,
  BookOpen,
  FileText,
  Upload,
  Check,
  X,
  AlertCircle,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassInput, GlassSelect, GlassTextarea } from "../ui/GlassFormControls";
import { GlassModal } from "../ui/GlassModal";
import { GlassEmptyState } from "../ui/GlassEmptyState";
import { LabTestItem, LabCatalogItem } from "../../types";

const LAB_CATEGORIES = [
  "HÉMATOLOGIE",
  "BIOCHIMIE",
  "PARASITOLOGIE",
  "MICROBIOLOGIE",
  "IMMUNOLOGIE",
  "SÉROLOGIE",
  "AUTRE",
];

export const LaboratoryView: React.FC = () => {
  const {
    labRequests,
    labCatalog,
    addLabCatalogItem,
    toggleLabCatalogItem,
    addLabRequest,
    updateLabTestResult,
    updateLabRequestDetails,
    validateLabRequest,
    addInvoice,
    patients,
    visits,
    currentUser,
    currentSite,
    setSelectedPatientId,
    setActiveTab,
    setPrintableDoc,
    showToast,
    formatCurrency,
    formatDateTime,
  } = useApp();

  const [selectedRequestId, setSelectedRequestId] = useState<string>(labRequests[0]?.id || "");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DEMANDE" | "EN_COURS" | "VALIDE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  // New Request Form State
  const [patientId, setPatientId] = useState(patients[0]?.id || "");
  const [selectedVisitId, setSelectedVisitId] = useState<string>("");
  const [priority, setPriority] = useState<"NORMALE" | "URGENTE">("NORMALE");
  const [clinicalNotes, setClinicalNotes] = useState("");
  
  // Custom & Catalog Test Adding in Request Form
  const [pendingTests, setPendingTests] = useState<LabTestItem[]>([
    {
      id: "init-1",
      testName: "Numération Formule Sanguine (NFS / Hémogramme)",
      category: "HÉMATOLOGIE",
      referenceRange: "Hb 12-16 g/dL, Leuco 4-10 x10^3/µL",
      unit: "g/dL",
    },
  ]);
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [customTestName, setCustomTestName] = useState("");
  const [customCategory, setCustomCategory] = useState("HÉMATOLOGIE");
  const [customUnit, setCustomUnit] = useState("");
  const [customRefRange, setCustomRefRange] = useState("");

  // New Catalog Item Form State (Admin)
  const [newCatName, setNewCatName] = useState("");
  const [newCatCode, setNewCatCode] = useState("");
  const [newCatCategory, setNewCatCategory] = useState("HÉMATOLOGIE");
  const [newCatSample, setNewCatSample] = useState("Sang veineux (EDTA)");
  const [newCatUnit, setNewCatUnit] = useState("");
  const [newCatRef, setNewCatRef] = useState("");
  const [newCatPrice, setNewCatPrice] = useState("5000");

  const canManageCatalog = currentUser.role === "ADMIN" || currentUser.role === "PRACTITIONER";

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return labRequests.filter((req) => {
      if (statusFilter !== "ALL") {
        if (statusFilter === "VALIDE") {
          if (req.status !== "VALIDE" && req.status !== "TERMINE") return false;
        } else if (req.status !== statusFilter) {
          return false;
        }
      }
      if (searchTerm.trim()) {
        const pat = patients.find((p) => p.id === req.patientId);
        const nameMatch = pat && `${pat.lastName} ${pat.firstName} ${pat.patientCode}`.toLowerCase().includes(searchTerm.toLowerCase());
        const codeMatch = req.labCode.toLowerCase().includes(searchTerm.toLowerCase());
        const testMatch = req.tests.some((t) => t.testName.toLowerCase().includes(searchTerm.toLowerCase()));
        return Boolean(nameMatch || codeMatch || testMatch);
      }
      return true;
    });
  }, [labRequests, statusFilter, searchTerm, patients]);

  const activeRequest = labRequests.find((r) => r.id === selectedRequestId) || filteredRequests[0] || labRequests[0];
  const activePatient = activeRequest ? patients.find((p) => p.id === activeRequest.patientId) : null;
  const activeVisit = activeRequest ? visits.find((v) => v.id === activeRequest.visitId) : null;

  // Selected patient visits
  const currentPatientVisits = useMemo(() => {
    return visits.filter((v) => v.patientId === patientId);
  }, [visits, patientId]);

  // Handle adding an analysis to pendingTests in creation modal
  const handleAddAnalysisToPending = () => {
    if (selectedCatalogId) {
      const catItem = labCatalog.find((c) => c.id === selectedCatalogId);
      if (catItem) {
        setPendingTests((prev) => [
          ...prev,
          {
            id: `test-${Date.now()}-${prev.length}`,
            testName: catItem.name,
            category: catItem.category,
            referenceRange: catItem.defaultReferenceRange || "Normal",
            unit: catItem.defaultUnit || "",
          },
        ]);
        setSelectedCatalogId("");
        return;
      }
    }

    if (customTestName.trim()) {
      setPendingTests((prev) => [
        ...prev,
        {
          id: `test-${Date.now()}-${prev.length}`,
          testName: customTestName.trim(),
          category: customCategory,
          referenceRange: customRefRange.trim() || "Normal",
          unit: customUnit.trim(),
        },
      ]);
      setCustomTestName("");
      setCustomUnit("");
      setCustomRefRange("");
      return;
    }

    showToast("WARNING", "Saisie Requise", "Veuillez sélectionner un examen du catalogue ou saisir un nom d'analyse libre.");
  };

  const handleRemovePendingTest = (testId: string) => {
    setPendingTests((prev) => prev.filter((t) => t.id !== testId));
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (pendingTests.length === 0) {
      showToast("WARNING", "Analyses Requises", "Veuillez ajouter au moins une analyse médicale à la demande.");
      return;
    }

    const assignedVisitId = selectedVisitId || currentPatientVisits[0]?.id || `vis-lab-${Date.now()}`;

    const newReq = addLabRequest({
      visitId: assignedVisitId,
      patientId,
      siteId: currentSite.id,
      requesterName: currentUser.fullName,
      priority,
      status: "DEMANDE",
      clinicalNotes: clinicalNotes || "Analyses demandées par le praticien.",
      tests: pendingTests,
      resultReport: "",
      documentName: "",
    });

    setIsNewRequestModalOpen(false);
    setSelectedRequestId(newReq.id);
    setPendingTests([
      {
        id: "init-1",
        testName: "Numération Formule Sanguine (NFS / Hémogramme)",
        category: "HÉMATOLOGIE",
        referenceRange: "Hb 12-16 g/dL",
        unit: "g/dL",
      },
    ]);
    setClinicalNotes("");
  };

  const handleAddNewCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast("WARNING", "Nom Requis", "Veuillez renseigner le libellé de l'analyse.");
      return;
    }

    addLabCatalogItem({
      name: newCatName.trim(),
      code: newCatCode.trim() || undefined,
      category: newCatCategory,
      sampleType: newCatSample.trim() || undefined,
      defaultUnit: newCatUnit.trim() || undefined,
      defaultReferenceRange: newCatRef.trim() || undefined,
      priceFCFA: parseFloat(newCatPrice) || 0,
      isActive: true,
    });

    setNewCatName("");
    setNewCatCode("");
    setNewCatUnit("");
    setNewCatRef("");
  };

  // Helper for quick normal presets
  const handleApplyNormalResults = () => {
    if (!activeRequest || activeRequest.status === "VALIDE" || activeRequest.status === "TERMINE") return;
    activeRequest.tests.forEach((t) => {
      const normalVal = t.referenceRange?.includes("Négatif") ? "Négatif" : "Normal";
      updateLabTestResult(activeRequest.id, t.id, normalVal, false);
    });
    showToast("INFO", "Normes Appliquées", "Résultats normaux renseignés pour ce bilan.");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl glass-surface border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Laboratoire & Analyses Biologiques
            </h2>
            <p className="text-xs text-slate-400">
              Examens demandés, saisie flexible des résultats & gestion du catalogue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <GlassButton
            variant="secondary"
            size="md"
            icon={<BookOpen className="w-4 h-4 text-[#D9B45B]" />}
            onClick={() => setIsCatalogModalOpen(true)}
            title="Consulter et administrer le catalogue d'analyses"
          >
            Catalogue ({labCatalog.length})
          </GlassButton>

          <GlassButton
            variant="gold"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewRequestModalOpen(true)}
          >
            Nouvelle Demande
          </GlassButton>
        </div>
      </div>

      {/* Main Grid: Requests List (4 Cols) + Active Lab Sheet / Results (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher analyse, patient, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#051426] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#55D9FF]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === "ALL" ? "bg-white/20 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Tous ({labRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("DEMANDE")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === "DEMANDE" ? "bg-amber-500/20 text-amber-300 border border-amber-400/30" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Demandé
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("EN_COURS")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === "EN_COURS" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                En cours
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("VALIDE")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === "VALIDE" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Terminé
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredRequests.length === 0 ? (
              <GlassEmptyState
                icon={<FlaskConical className="w-6 h-6 text-amber-400" />}
                title="Aucune demande trouvée"
                description="Aucun examen ne correspond aux critères sélectionnés."
                actionLabel="Nouvelle Demande Labo"
                actionIcon={<Plus className="w-4 h-4" />}
                onAction={() => setIsNewRequestModalOpen(true)}
              />
            ) : (
              filteredRequests.map((req) => {
                const pat = patients.find((p) => p.id === req.patientId);
                const isSelected = req.id === activeRequest?.id;
                const isCompleted = req.status === "VALIDE" || req.status === "TERMINE";
                const isInProgress = req.status === "EN_COURS";

                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-400/40 shadow-[0_0_20px_rgba(217,180,91,0.2)]"
                        : "glass-surface-subtle hover:glass-surface border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-amber-300">{req.labCode}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          req.priority === "URGENTE"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                        }`}
                      >
                        {req.priority}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1">
                      {pat ? `${pat.lastName.toUpperCase()} ${pat.firstName}` : "Patient"}
                    </h4>

                    <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                      <span>{req.tests.length} analyse(s)</span>
                      <span
                        className={`font-semibold text-[11px] px-2 py-0.5 rounded-md ${
                          isCompleted
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : isInProgress
                            ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {isCompleted ? "Terminé ✓" : isInProgress ? "En cours ●" : "Demandé"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Results Entry & Biological Validation */}
        <div className="lg:col-span-8">
          {activeRequest && activePatient ? (
            <GlassCard className="p-6 space-y-6">
              {/* Request Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-base text-[#55D9FF]">
                      {activeRequest.labCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        activeRequest.status === "VALIDE" || activeRequest.status === "TERMINE"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                          : activeRequest.status === "EN_COURS"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                      }`}
                    >
                      {activeRequest.status === "VALIDE" || activeRequest.status === "TERMINE"
                        ? "Terminé & Validé"
                        : activeRequest.status === "EN_COURS"
                        ? "En cours d'analyse"
                        : "Demandé (En attente)"}
                    </span>
                    {activeVisit && (
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                        Passage : {activeVisit.visitCode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-sm font-bold text-white">
                      Patient : {activePatient.lastName.toUpperCase()} {activePatient.firstName} ({activePatient.patientCode})
                    </h3>
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
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>Demandé par : {activeRequest.requesterName}</span>
                    <span>&middot;</span>
                    <span className="font-mono">{formatDateTime(activeRequest.requestedAt)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* Status Toggle Switcher Buttons */}
                  <div className="flex items-center bg-[#051426] p-1 rounded-xl border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => updateLabRequestDetails(activeRequest.id, { status: "DEMANDE" })}
                      className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        activeRequest.status === "DEMANDE" ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:text-white"
                      }`}
                      title="Marquer comme simplement demandé"
                    >
                      Demandé
                    </button>
                    <button
                      type="button"
                      onClick={() => updateLabRequestDetails(activeRequest.id, { status: "EN_COURS" })}
                      className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        activeRequest.status === "EN_COURS" ? "bg-cyan-500 text-slate-900" : "text-slate-400 hover:text-white"
                      }`}
                      title="Marquer en cours de traitement"
                    >
                      En cours
                    </button>
                    <button
                      type="button"
                      onClick={() => validateLabRequest(activeRequest.id, currentUser.fullName)}
                      className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        activeRequest.status === "VALIDE" || activeRequest.status === "TERMINE"
                          ? "bg-emerald-500 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="Valider et terminer"
                    >
                      Terminé
                    </button>
                  </div>

                  {/* Quick Norms Preset Button */}
                  {activeRequest.status !== "VALIDE" && activeRequest.status !== "TERMINE" && (
                    <button
                      type="button"
                      onClick={handleApplyNormalResults}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Pré-remplir les valeurs normales"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Normes</span>
                    </button>
                  )}

                  {/* Print Biological Report */}
                  <GlassButton
                    variant="primary"
                    size="sm"
                    icon={<Printer className="w-3.5 h-3.5" />}
                    onClick={() =>
                      setPrintableDoc({
                        type: "LAB",
                        title: `COMPTE RENDU D'ANALYSES BIOLOGIQUES — ${activeRequest.labCode}`,
                        patient: activePatient,
                        data: activeRequest,
                      })
                    }
                  >
                    Imprimer
                  </GlassButton>
                </div>
              </div>

              {/* Tests Table with Free Results Entry */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span>Analyses Demandées ({activeRequest.tests.length})</span>
                  <span className="text-[11px] text-slate-400 font-normal">Saisie libre du résultat et des observations</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#051426]/50">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider bg-white/[0.02]">
                        <th className="py-2.5 px-3">Analyse Demandée</th>
                        <th className="py-2.5 px-3">Catégorie</th>
                        <th className="py-2.5 px-3">Résultat Mesuré</th>
                        <th className="py-2.5 px-3">Normes / Référence</th>
                        <th className="py-2.5 px-3">Unité</th>
                        <th className="py-2.5 px-3 text-center">Anomalie</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activeRequest.tests.map((test) => (
                        <tr key={test.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3 font-semibold text-white">
                            <div>{test.testName}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[11px]">
                            {test.category || "HÉMATOLOGIE"}
                          </td>
                          <td className="py-3 px-3">
                            <input
                              value={test.value || ""}
                              placeholder="Saisir résultat"
                              onChange={(e) =>
                                updateLabTestResult(activeRequest.id, test.id, e.target.value, test.isAbnormal || false, test.notes)
                              }
                              className={`bg-[#051426] border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none w-36 ${
                                test.isAbnormal
                                  ? "border-rose-500 text-rose-300 font-bold"
                                  : "border-white/15 focus:border-[#55D9FF]"
                              }`}
                            />
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                            {test.referenceRange || "Normal"}
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                            {test.unit || "—"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={test.isAbnormal || false}
                              onChange={(e) =>
                                updateLabTestResult(activeRequest.id, test.id, test.value || "", e.target.checked, test.notes)
                              }
                              className="rounded accent-rose-500 cursor-pointer"
                              title="Signaler valeur anormale"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Compte Rendu & Observations Libres */}
              <div className="space-y-4 pt-2">
                <GlassTextarea
                  label="Compte Rendu & Conclusions Biologiques (Champ libre)"
                  placeholder="Conclusions diagnostiques, interprétation globale, commentaires du biologiste ou technicien..."
                  value={activeRequest.resultReport || ""}
                  onChange={(e) =>
                    updateLabRequestDetails(activeRequest.id, { resultReport: e.target.value })
                  }
                  rows={3}
                />

                {/* Document ou Fichier Joint */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      Document ou Fichier Joint / Compte Rendu Scanné
                    </span>
                    <span className="text-[11px] text-slate-400">PDF ou référence image</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Resultats_NFS_Automate_2026.pdf"
                      value={activeRequest.documentName || ""}
                      onChange={(e) =>
                        updateLabRequestDetails(activeRequest.id, { documentName: e.target.value })
                      }
                      className="flex-1 bg-[#051426] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#55D9FF]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const sampleDoc = `Bilan_${activeRequest.labCode}_Scanne.pdf`;
                        updateLabRequestDetails(activeRequest.id, { documentName: sampleDoc });
                        showToast("INFO", "Document Associé", `Référence ${sampleDoc} jointe à l'examen.`);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 cursor-pointer flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Simuler import</span>
                    </button>
                  </div>
                </div>

                {activeRequest.clinicalNotes && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400">
                    <span className="font-bold text-slate-300">Renseignements cliniques fournis :</span>{" "}
                    {activeRequest.clinicalNotes}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    addInvoice({
                      visitId: activeRequest.visitId,
                      patientId: activePatient.id,
                      siteId: currentSite.id,
                      items: [
                        {
                          id: `item-lab-${Date.now()}`,
                          description: `Examens biologiques (${activeRequest.labCode}) - ${activeRequest.tests.length} analyse(s)`,
                          quantity: 1,
                          unitPrice: activeRequest.tests.length * 5000,
                          total: activeRequest.tests.length * 5000,
                        },
                      ],
                      totalAmount: activeRequest.tests.length * 5000,
                      paidAmount: 0,
                    });
                    showToast("SUCCESS", "Facture Transmise", `Facture de ${formatCurrency(activeRequest.tests.length * 5000)} transmise en caisse.`);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Transmettre Facture Caisse</span>
                </button>

                <div className="flex items-center gap-2">
                  <GlassButton
                    variant="gold"
                    size="md"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => validateLabRequest(activeRequest.id, currentUser.fullName)}
                  >
                    Valider & Clôturer les Résultats
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassEmptyState
              icon={<FlaskConical className="w-7 h-7 text-[#1261A0] dark:text-[#55D9FF]" />}
              title="Aucune analyse sélectionnée"
              description="Sélectionnez une demande dans la liste de gauche pour saisir les résultats et rédiger le compte rendu biologique."
              actionLabel="Nouvelle Demande"
              actionIcon={<Plus className="w-4 h-4" />}
              onAction={() => setIsNewRequestModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* MODAL 1: CREATE LAB REQUEST (FLEXIBLE: CATALOG + FREE TEXT) */}
      <GlassModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        title="Créer une Demande d'Analyses Médicales"
        subtitle="Sélection dans le catalogue facultatif ou saisie libre de toute analyse"
        icon={<FlaskConical className="w-5 h-5 text-amber-400" />}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <GlassSelect
              label="Patient *"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              options={patients.map((p) => ({
                value: p.id,
                label: `${p.lastName.toUpperCase()} ${p.firstName} (${p.patientCode})`,
              }))}
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                Passage Médical Associé
              </label>
              {currentPatientVisits.length > 0 ? (
                <select
                  value={selectedVisitId}
                  onChange={(e) => setSelectedVisitId(e.target.value)}
                  className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {currentPatientVisits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.visitCode} — {v.type} ({v.queueNumber})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-cyan-300 font-mono py-2">
                  Passage automatique du jour
                </div>
              )}
            </div>
          </div>

          <GlassSelect
            label="Priorité de Réalisation *"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            options={[
              { value: "NORMALE", label: "Normale (Traitement sous 24h)" },
              { value: "URGENTE", label: "Urgente (Traitement immédiat)" },
            ]}
          />

          {/* Saisie & Ajout d'Analyses : Catalogue OU Saisie Libre */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
              <span>Ajouter une Analyse à la Demande</span>
              <span className="text-[11px] text-cyan-300 font-normal">Catalogue ou Texte libre</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              {/* Option A: Sélection Catalogue */}
              <div className="sm:col-span-6">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Rechercher dans le Catalogue (Facultatif)
                </label>
                <select
                  value={selectedCatalogId}
                  onChange={(e) => {
                    setSelectedCatalogId(e.target.value);
                    if (e.target.value) {
                      setCustomTestName("");
                    }
                  }}
                  className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#55D9FF]"
                >
                  <option value="">-- Choisir dans le catalogue --</option>
                  {labCatalog
                    .filter((c) => c.isActive)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        [{item.category}] {item.name} {item.code ? `(${item.code})` : ""}
                      </option>
                    ))}
                </select>
              </div>

              {/* Option B: Saisie Libre de l'Analyse */}
              <div className="sm:col-span-6">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Ou Saisie Libre (Analyse absente du catalogue)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ionogramme complet, Troponine..."
                  value={customTestName}
                  onChange={(e) => {
                    setCustomTestName(e.target.value);
                    if (e.target.value) {
                      setSelectedCatalogId("");
                    }
                  }}
                  className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#55D9FF]"
                />
              </div>
            </div>

            {/* Catégorie facultative et détails complémentaires */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Catégorie (Facultatif)
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  {LAB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Unité (ex: g/L, µL)"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddAnalysisToPending}
                  className="w-full px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-bold text-cyan-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter Analyse</span>
                </button>
              </div>
            </div>

            {/* Liste des analyses sélectionnées pour cette demande */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Analyses incluses dans cette demande ({pendingTests.length}) :
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {pendingTests.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">
                        {t.category || "AUTRE"}
                      </span>
                      <span className="font-semibold text-white">{t.testName}</span>
                      {t.unit && <span className="text-[10px] text-slate-400 font-mono">({t.unit})</span>}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePendingTest(t.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 cursor-pointer"
                      title="Retirer cette analyse"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <GlassTextarea
            label="Indications & Renseignements Cliniques"
            placeholder="Ex: Fièvre prolongée, suspicion de paludisme ou infection respiratoire..."
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsNewRequestModalOpen(false)}
            >
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="gold" size="md">
              Créer la Demande d'Analyses
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* MODAL 2: GESTION DU CATALOGUE D'ANALYSES (ADMIN & LAB) */}
      <GlassModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        title="Catalogue des Analyses Médicales CM FONA"
        subtitle="Gestion des examens courants, catégories, et activation sans modification de code"
        icon={<BookOpen className="w-5 h-5 text-[#D9B45B]" />}
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Form: Ajouter une nouvelle analyse au catalogue */}
          {canManageCatalog && (
            <form onSubmit={handleAddNewCatalogItem} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une Analyse Courante au Catalogue</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-5">
                  <GlassInput
                    label="Libellé de l'Analyse *"
                    placeholder="Ex: Hémoglobine glyquée (HbA1c)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <GlassInput
                    label="Code"
                    placeholder="Ex: A1C"
                    value={newCatCode}
                    onChange={(e) => setNewCatCode(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <GlassSelect
                    label="Catégorie *"
                    value={newCatCategory}
                    onChange={(e) => setNewCatCategory(e.target.value)}
                    options={LAB_CATEGORIES.map((c) => ({ value: c, label: c }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <GlassInput
                    label="Prix FCFA"
                    placeholder="5000"
                    type="number"
                    value={newCatPrice}
                    onChange={(e) => setNewCatPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                <GlassInput
                  label="Type d'échantillon"
                  placeholder="Sang veineux (EDTA)"
                  value={newCatSample}
                  onChange={(e) => setNewCatSample(e.target.value)}
                />
                <GlassInput
                  label="Unité usuelle"
                  placeholder="Ex: % ou g/dL"
                  value={newCatUnit}
                  onChange={(e) => setNewCatUnit(e.target.value)}
                />
                <div className="flex justify-end">
                  <GlassButton type="submit" variant="gold" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                    Enregistrer au Catalogue
                  </GlassButton>
                </div>
              </div>
            </form>
          )}

          {/* Table du Catalogue existant */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
              <span>Analyses Enregistrées ({labCatalog.length})</span>
              <span className="text-[11px] text-slate-400">Les analyses désactivées restent préservées dans l'historique</span>
            </div>

            <div className="overflow-x-auto max-h-72 rounded-xl border border-white/10 bg-[#051426]/60">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider bg-white/[0.02]">
                    <th className="py-2.5 px-3">Analyse</th>
                    <th className="py-2.5 px-3">Catégorie</th>
                    <th className="py-2.5 px-3">Échantillon</th>
                    <th className="py-2.5 px-3">Unité</th>
                    <th className="py-2.5 px-3">Tarif</th>
                    <th className="py-2.5 px-3 text-center">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {labCatalog.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.code && (
                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-1 py-0.5 rounded">
                              {item.code}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{item.category}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{item.sampleType || "—"}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{item.defaultUnit || "—"}</td>
                      <td className="py-2.5 px-3 font-mono text-[#D9B45B] text-[11px]">
                        {item.priceFCFA ? formatCurrency(item.priceFCFA) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleLabCatalogItem(item.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            item.isActive
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-rose-500/20 hover:text-rose-300"
                              : "bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-emerald-500/20 hover:text-emerald-300"
                          }`}
                          title="Cliquer pour activer / désactiver cette analyse"
                        >
                          {item.isActive ? "Actif ✓" : "Désactivé"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-white/10">
            <GlassButton variant="primary" size="md" onClick={() => setIsCatalogModalOpen(false)}>
              Fermer
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};
