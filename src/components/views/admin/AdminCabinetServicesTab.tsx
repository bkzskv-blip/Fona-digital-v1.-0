import React, { useState } from "react";
import {
  Stethoscope,
  Coins,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Tag,
  Users,
  Building,
  Edit2,
  Archive,
  FlaskConical,
  Check,
  X,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GlassCard } from "../../ui/GlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { GlassInput, GlassSelect } from "../../ui/GlassFormControls";
import { MedicalService, TariffItem, LabCatalogItem } from "../../../types";

export const AdminCabinetServicesTab: React.FC = () => {
  const {
    services,
    addService,
    updateService,
    toggleServiceStatus,
    tariffs,
    addTariff,
    updateTariff,
    toggleTariffStatus,
    labCatalog,
    addLabCatalogItem,
    updateLabCatalogItem,
    toggleLabCatalogItem,
    showToast,
    formatCurrency,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"SERVICES" | "TARIFFS" | "LAB_CATALOG">("SERVICES");

  // Services Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<MedicalService | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceHead, setServiceHead] = useState("");
  const [serviceCapacity, setServiceCapacity] = useState<number>(20);
  const [serviceColor, setServiceColor] = useState("#4F7DF3");

  // Tariffs State
  const [tariffCategoryFilter, setTariffCategoryFilter] = useState<string>("ALL");
  const [tariffSearchTerm, setTariffSearchTerm] = useState("");
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<TariffItem | null>(null);
  const [tariffName, setTariffName] = useState("");
  const [tariffCode, setTariffCode] = useState("");
  const [tariffCategory, setTariffCategory] = useState<TariffItem["category"]>("CONSULTATION");
  const [tariffPrice, setTariffPrice] = useState<number>(10000);
  const [tariffNotes, setTariffNotes] = useState("");

  // Handlers for Services
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceName("");
    setServiceCode(`SRV-${Date.now().toString().slice(-4)}`);
    setServiceDesc("");
    setServiceHead("Dr. ");
    setServiceCapacity(20);
    setServiceColor("#4F7DF3");
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: MedicalService) => {
    setEditingService(srv);
    setServiceName(srv.name);
    setServiceCode(srv.code);
    setServiceDesc(srv.description);
    setServiceHead(srv.headOfDepartment);
    setServiceCapacity(srv.patientCapacity || 20);
    setServiceColor(srv.color);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      showToast("WARNING", "Nom obligatoire", "Veuillez renseigner le nom du service.");
      return;
    }
    if (editingService) {
      updateService(editingService.id, {
        name: serviceName,
        code: serviceCode,
        description: serviceDesc,
        headOfDepartment: serviceHead,
        patientCapacity: serviceCapacity,
        color: serviceColor,
      });
    } else {
      addService({
        name: serviceName,
        code: serviceCode,
        description: serviceDesc,
        headOfDepartment: serviceHead,
        patientCapacity: serviceCapacity,
        color: serviceColor,
        status: "ACTIF",
      });
    }
    setIsServiceModalOpen(false);
  };

  // Handlers for Tariffs
  const handleOpenAddTariff = () => {
    setEditingTariff(null);
    setTariffName("");
    setTariffCode(`ACT-${Date.now().toString().slice(-4)}`);
    setTariffCategory("CONSULTATION");
    setTariffPrice(10000);
    setTariffNotes("");
    setIsTariffModalOpen(true);
  };

  const handleOpenEditTariff = (tar: TariffItem) => {
    setEditingTariff(tar);
    setTariffName(tar.name);
    setTariffCode(tar.code);
    setTariffCategory(tar.category);
    setTariffPrice(tar.priceFCFA);
    setTariffNotes(tar.notes || "");
    setIsTariffModalOpen(true);
  };

  const handleSaveTariff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tariffName.trim() || tariffPrice <= 0) {
      showToast("WARNING", "Champs Invalides", "Veuillez préciser un nom valide et un prix supérieur à 0.");
      return;
    }
    if (editingTariff) {
      updateTariff(editingTariff.id, {
        name: tariffName,
        code: tariffCode,
        category: tariffCategory,
        priceFCFA: tariffPrice,
        notes: tariffNotes,
      });
    } else {
      addTariff({
        name: tariffName,
        code: tariffCode,
        category: tariffCategory,
        priceFCFA: tariffPrice,
        status: "ACTIF",
        effectiveDate: new Date().toISOString().slice(0, 10),
        notes: tariffNotes,
      });
    }
    setIsTariffModalOpen(false);
  };

  const filteredTariffs = tariffs.filter((t) => {
    const matchesCat = tariffCategoryFilter === "ALL" || t.category === tariffCategoryFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(tariffSearchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(tariffSearchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Lab Catalog State
  const [labCatCategoryFilter, setLabCatCategoryFilter] = useState<string>("ALL");
  const [labCatSearchTerm, setLabCatSearchTerm] = useState("");
  const [isLabCatModalOpen, setIsLabCatModalOpen] = useState(false);
  const [editingLabCat, setEditingLabCat] = useState<LabCatalogItem | null>(null);
  const [labCatName, setLabCatName] = useState("");
  const [labCatCode, setLabCatCode] = useState("");
  const [labCatCategory, setLabCatCategory] = useState("HÉMATOLOGIE");
  const [labCatSample, setLabCatSample] = useState("Sang veineux (EDTA)");
  const [labCatUnit, setLabCatUnit] = useState("");
  const [labCatRef, setLabCatRef] = useState("");
  const [labCatPrice, setLabCatPrice] = useState<number>(5000);

  const handleOpenAddLabCat = () => {
    setEditingLabCat(null);
    setLabCatName("");
    setLabCatCode(`LAB-${Date.now().toString().slice(-4)}`);
    setLabCatCategory("HÉMATOLOGIE");
    setLabCatSample("Sang veineux (EDTA)");
    setLabCatUnit("");
    setLabCatRef("");
    setLabCatPrice(5000);
    setIsLabCatModalOpen(true);
  };

  const handleOpenEditLabCat = (item: LabCatalogItem) => {
    setEditingLabCat(item);
    setLabCatName(item.name);
    setLabCatCode(item.code || "");
    setLabCatCategory(item.category);
    setLabCatSample(item.sampleType || "Sang veineux (EDTA)");
    setLabCatUnit(item.defaultUnit || "");
    setLabCatRef(item.defaultReferenceRange || "");
    setLabCatPrice(item.priceFCFA || 5000);
    setIsLabCatModalOpen(true);
  };

  const handleSaveLabCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labCatName.trim()) {
      showToast("WARNING", "Nom Invalide", "Veuillez renseigner le nom de l'analyse.");
      return;
    }

    if (editingLabCat) {
      updateLabCatalogItem(editingLabCat.id, {
        name: labCatName.trim(),
        code: labCatCode.trim(),
        category: labCatCategory,
        sampleType: labCatSample.trim(),
        defaultUnit: labCatUnit.trim(),
        defaultReferenceRange: labCatRef.trim(),
        priceFCFA: Number(labCatPrice) || 0,
      });
      showToast("SUCCESS", "Analyse Modifiée", `L'analyse ${labCatName} a été mise à jour.`);
    } else {
      addLabCatalogItem({
        name: labCatName.trim(),
        code: labCatCode.trim() || `LAB-${Date.now().toString().slice(-4)}`,
        category: labCatCategory,
        sampleType: labCatSample.trim(),
        defaultUnit: labCatUnit.trim(),
        defaultReferenceRange: labCatRef.trim(),
        priceFCFA: Number(labCatPrice) || 0,
        isActive: true,
      });
      showToast("SUCCESS", "Analyse Ajoutée", `L'analyse ${labCatName} a été ajoutée au catalogue.`);
    }
    setIsLabCatModalOpen(false);
  };

  const filteredLabCatalog = labCatalog.filter((item) => {
    const matchesCat = labCatCategoryFilter === "ALL" || item.category === labCatCategoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(labCatSearchTerm.toLowerCase()) ||
      (item.code || "").toLowerCase().includes(labCatSearchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Sub Tab Switcher */}
      <div className="flex bg-[#051426] p-1 rounded-xl border border-white/10 w-fit flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab("SERVICES")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "SERVICES"
              ? "bg-[#4F7DF3] text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Services & Spécialités Médicales ({services.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab("TARIFFS")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "TARIFFS"
              ? "bg-[#D9B45B] text-[#071A33] font-black shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Catalogue de Tarification ({tariffs.length} Actes)</span>
        </button>
        <button
          onClick={() => setActiveSubTab("LAB_CATALOG")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "LAB_CATALOG"
              ? "bg-[#20B8A6] text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Analyses Laboratoire ({labCatalog.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: SERVICES & SPÉCIALITÉS */}
      {activeSubTab === "SERVICES" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl glass-surface border border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                Pôles Cliniques & Spécialités Hospitalières
              </h3>
              <p className="text-xs text-slate-400">
                Structure organisationnelle évolutive prête pour la transition vers la Clinique FONA
              </p>
            </div>

            <GlassButton
              variant="cyan"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAddService}
            >
              Ajouter une Spécialité
            </GlassButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => (
              <GlassCard
                key={srv.id}
                className={`p-5 space-y-3 transition-all ${
                  srv.status === "INACTIF" ? "opacity-60 border-slate-700" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                      style={{ backgroundColor: `${srv.color}25`, borderColor: srv.color, borderWidth: 1 }}
                    >
                      <Stethoscope className="w-5 h-5" style={{ color: srv.color }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{srv.name}</h4>
                      <span className="text-[10px] font-mono text-cyan-300">{srv.code}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditService(srv)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Modifier le service"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleServiceStatus(srv.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                        srv.status === "ACTIF"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                          : "bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600"
                      }`}
                    >
                      {srv.status === "ACTIF" ? "Actif" : "Inactif"}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {srv.description}
                </p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <div>Responsable : <b className="text-slate-200">{srv.headOfDepartment}</b></div>
                  <div>Capacité : <span className="text-cyan-300 font-bold">{srv.patientCapacity || 20} pts/jour</span></div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TARIFICATION DES ACTES */}
      {activeSubTab === "TARIFFS" && (
        <div className="space-y-6">
          {/* Non-Retroactivity Rule Banner (Section 9) */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-[#D9B45B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Règle de Non-Rétroactivité de la Tarification Médicale :</strong>
              <p className="mt-0.5 text-amber-200/80">
                La mise à jour d'un tarif dans ce catalogue ne modifie jamais rétroactivement les factures et règlements antérieurs. Les reçus passés conservent indéfiniment le tarif exact en vigueur au moment de leur émission.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl glass-surface border border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#D9B45B]" />
                Catalogue Officiel des Actes Médicaux FONA
              </h3>
              <p className="text-xs text-slate-400">
                {tariffs.length} prestations tarifées en Francs CFA (XOF)
              </p>
            </div>

            <GlassButton
              variant="gold"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAddTariff}
            >
              Ajouter un Tarif
            </GlassButton>
          </div>

          {/* Tariffs Filter & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher par nom d'acte ou code (ex: CONSULTATION, NFS...)"
                value={tariffSearchTerm}
                onChange={(e) => setTariffSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#051426]/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <select
              value={tariffCategoryFilter}
              onChange={(e) => setTariffCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#051426]/70 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Toutes les catégories ({tariffs.length})</option>
              <option value="CONSULTATION">Consultations Médicales</option>
              <option value="MATERNITE">Maternité & CPN</option>
              <option value="IMAGERIE">Échographie & Radiologie</option>
              <option value="LABORATOIRE">Laboratoire d'Analyses</option>
              <option value="SOINS">Soins & Perfusions</option>
              <option value="URGENCE">Urgences 24/7</option>
            </select>
          </div>

          {/* Tariffs Table */}
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white/[0.04] border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Code Acte</th>
                    <th className="p-3.5">Libellé de la Prestation</th>
                    <th className="p-3.5">Catégorie</th>
                    <th className="p-3.5 text-right">Tarif Officiel (FCFA)</th>
                    <th className="p-3.5">Date d'effet</th>
                    <th className="p-3.5 text-center">Statut</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTariffs.map((tar) => (
                    <tr key={tar.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-mono text-cyan-300 font-bold">{tar.code}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{tar.name}</div>
                        {tar.notes && <div className="text-[11px] text-slate-400 mt-0.5">{tar.notes}</div>}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300">
                          {tar.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-amber-300 text-sm">
                        {formatCurrency(tar.priceFCFA)}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 text-[11px]">{tar.effectiveDate}</td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            tar.status === "ACTIF"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-slate-700 text-slate-400 border-slate-600"
                          }`}
                        >
                          {tar.status === "ACTIF" ? "Actif" : "Archivé"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditTariff(tar)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Modifier le tarif"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleTariffStatus(tar.id)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-all cursor-pointer"
                            title={tar.status === "ACTIF" ? "Archiver" : "Réactiver"}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* SUB-TAB 3: CATALOGUE DES ANALYSES DE LABORATOIRE */}
      {activeSubTab === "LAB_CATALOG" && (
        <div className="space-y-6">
          {/* Information & Regulatory Banner */}
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-start gap-3 text-xs text-teal-200">
            <FlaskConical className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Catalogue Évolutif des Analyses Biologiques FONA :</strong>
              <p className="mt-0.5 text-teal-200/80">
                Ce catalogue sert de référentiel d'aide à la saisie pour les prescripteurs et le laboratoire. Toute analyse non répertoriée peut être saisie librement sans blocage. La désactivation d'une analyse préserve intégralement l'historique et les dossiers médicaux passés.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl glass-surface border border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-teal-400" />
                Référentiel des Analyses de Laboratoire
              </h3>
              <p className="text-xs text-slate-400">
                {labCatalog.length} analyses configurées (Hématologie, Biochimie, Parasito...)
              </p>
            </div>

            <GlassButton
              variant="cyan"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAddLabCat}
            >
              Ajouter une Analyse
            </GlassButton>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une analyse ou code..."
                value={labCatSearchTerm}
                onChange={(e) => setLabCatSearchTerm(e.target.value)}
                className="w-full bg-[#051426] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={labCatCategoryFilter}
                onChange={(e) => setLabCatCategoryFilter(e.target.value)}
                className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="ALL">Toutes les Catégories Biologiques</option>
                <option value="HÉMATOLOGIE">Hématologie</option>
                <option value="BIOCHIMIE">Biochimie</option>
                <option value="PARASITOLOGIE">Parasitologie</option>
                <option value="MICROBIOLOGIE">Microbiologie</option>
                <option value="IMMUNOLOGIE">Immunologie</option>
                <option value="SÉROLOGIE">Sérologie</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div className="md:col-span-4 flex items-center justify-end text-xs text-slate-400">
              {filteredLabCatalog.length} analyse(s) affichée(s)
            </div>
          </div>

          {/* Table */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase font-bold text-slate-400">
                    <th className="p-3">Code & Analyse</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3">Échantillon</th>
                    <th className="p-3">Normes / Unité</th>
                    <th className="p-3 text-right">Tarif Indicatif</th>
                    <th className="p-3 text-center">Statut</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                  {filteredLabCatalog.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{item.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300">{item.code}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 text-[11px]">
                        {item.sampleType || "Sang veineux (EDTA)"}
                      </td>
                      <td className="p-3 text-[11px]">
                        <span className="text-slate-200">{item.defaultReferenceRange || "Normal"}</span>
                        {item.defaultUnit && (
                          <span className="text-slate-400 font-mono ml-1">({item.defaultUnit})</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#D9B45B]">
                        {formatCurrency(item.priceFCFA || 0)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleLabCatalogItem(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                            item.isActive
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600"
                          }`}
                        >
                          {item.isActive ? "Actif" : "Inactif"}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditLabCat(item)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1 text-xs"
                          title="Modifier l'analyse"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Éditer</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLabCatalog.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                        Aucune analyse ne correspond à votre recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl glass-surface border border-white/20 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {editingService ? "Modifier le Service" : "Ajouter un Service Médical"}
            </h3>
            <form onSubmit={handleSaveService} className="space-y-3.5">
              <GlassInput
                label="Nom du Service"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="ex: Cardiologie"
                required
              />
              <GlassInput
                label="Code Service"
                value={serviceCode}
                onChange={(e) => setServiceCode(e.target.value)}
                placeholder="SRV-CARDIO"
                required
              />
              <GlassInput
                label="Médecin Responsable / Chef de Pôle"
                value={serviceHead}
                onChange={(e) => setServiceHead(e.target.value)}
                placeholder="Dr. ..."
                required
              />
              <GlassInput
                label="Description & Missions"
                value={serviceDesc}
                onChange={(e) => setServiceDesc(e.target.value)}
                placeholder="Description du service..."
              />
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <GlassButton type="button" variant="subtle" size="sm" onClick={() => setIsServiceModalOpen(false)}>
                  Annuler
                </GlassButton>
                <GlassButton type="submit" variant="cyan" size="sm">
                  Enregistrer
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tariff Modal */}
      {isTariffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl glass-surface border border-white/20 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {editingTariff ? "Modifier le Tarif d'un Acte" : "Créer un Tarif Médical"}
            </h3>
            <form onSubmit={handleSaveTariff} className="space-y-3.5">
              <GlassInput
                label="Libellé de l'Acte"
                value={tariffName}
                onChange={(e) => setTariffName(e.target.value)}
                placeholder="ex: Consultation Cardiologie"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <GlassInput
                  label="Code Acte"
                  value={tariffCode}
                  onChange={(e) => setTariffCode(e.target.value)}
                  placeholder="ACT-01"
                  required
                />
                <GlassSelect
                  label="Catégorie"
                  value={tariffCategory}
                  onChange={(e) => setTariffCategory(e.target.value as any)}
                  options={[
                    { value: "CONSULTATION", label: "Consultation" },
                    { value: "MATERNITE", label: "Maternité / CPN" },
                    { value: "IMAGERIE", label: "Imagerie / Écho" },
                    { value: "LABORATOIRE", label: "Laboratoire" },
                    { value: "SOINS", label: "Soins Ambulatoires" },
                    { value: "URGENCE", label: "Urgences" },
                  ]}
                />
              </div>
              <GlassInput
                label="Prix en FCFA"
                type="number"
                value={tariffPrice.toString()}
                onChange={(e) => setTariffPrice(Number(e.target.value))}
                required
              />
              <GlassInput
                label="Notes / Conditions d'Application"
                value={tariffNotes}
                onChange={(e) => setTariffNotes(e.target.value)}
                placeholder="Précisions tarifaires..."
              />
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <GlassButton type="button" variant="subtle" size="sm" onClick={() => setIsTariffModalOpen(false)}>
                  Annuler
                </GlassButton>
                <GlassButton type="submit" variant="gold" size="sm">
                  Enregistrer le Tarif
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lab Catalog Modal */}
      {isLabCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl glass-surface border border-white/20 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <FlaskConical className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingLabCat ? "Modifier l'Analyse du Catalogue" : "Ajouter une Analyse au Catalogue"}
              </h3>
            </div>

            <form onSubmit={handleSaveLabCat} className="space-y-3.5">
              <GlassInput
                label="Nom de l'Analyse Biologique *"
                value={labCatName}
                onChange={(e) => setLabCatName(e.target.value)}
                placeholder="ex: Sérologie Rubeole IgG/IgM, Ionogramme Complet..."
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <GlassInput
                  label="Code Référentiel"
                  value={labCatCode}
                  onChange={(e) => setLabCatCode(e.target.value)}
                  placeholder="LAB-01"
                  required
                />
                <GlassSelect
                  label="Catégorie Biologique *"
                  value={labCatCategory}
                  onChange={(e) => setLabCatCategory(e.target.value)}
                  options={[
                    { value: "HÉMATOLOGIE", label: "Hématologie" },
                    { value: "BIOCHIMIE", label: "Biochimie" },
                    { value: "PARASITOLOGIE", label: "Parasitologie" },
                    { value: "MICROBIOLOGIE", label: "Microbiologie" },
                    { value: "IMMUNOLOGIE", label: "Immunologie" },
                    { value: "SÉROLOGIE", label: "Sérologie" },
                    { value: "AUTRE", label: "Autre Spécialité" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <GlassInput
                  label="Type d'Échantillon Recommandé"
                  value={labCatSample}
                  onChange={(e) => setLabCatSample(e.target.value)}
                  placeholder="ex: Sérum, Sang total EDTA, Urine..."
                />
                <GlassInput
                  label="Unité de Mesure (Facultatif)"
                  value={labCatUnit}
                  onChange={(e) => setLabCatUnit(e.target.value)}
                  placeholder="ex: g/dL, mg/L, UI/mL, µmol/L..."
                />
              </div>

              <GlassInput
                label="Valeurs de Référence Normales"
                value={labCatRef}
                onChange={(e) => setLabCatRef(e.target.value)}
                placeholder="ex: Négatif, < 5.0, 70 - 110 mg/dL..."
              />

              <GlassInput
                label="Tarif Indicatif (FCFA)"
                type="number"
                value={labCatPrice.toString()}
                onChange={(e) => setLabCatPrice(Number(e.target.value))}
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <GlassButton type="button" variant="subtle" size="sm" onClick={() => setIsLabCatModalOpen(false)}>
                  Annuler
                </GlassButton>
                <GlassButton type="submit" variant="cyan" size="sm">
                  {editingLabCat ? "Mettre à Jour l'Analyse" : "Enregistrer dans le Catalogue"}
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
