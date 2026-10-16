import React, { useState, useMemo } from "react";
import {
  SlidersHorizontal,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Users,
  Stethoscope,
  CalendarDays,
  Receipt,
  HeartHandshake,
  Baby,
  Activity,
  ShieldAlert,
  TestTube2,
  FileScan,
  TrendingUp,
  Search,
  ArrowUp,
  ArrowDown,
  Trash2,
  Layers,
  Clock,
  Percent,
} from "lucide-react";
import { DashboardWidgetConfig, DashboardWidgetId, Role } from "../../types";
import {
  ALL_DASHBOARD_WIDGETS,
  getDefaultWidgetsForRole,
  DASHBOARD_PRESETS,
  WidgetPreset,
} from "../../services/dashboardWidgetService";
import { hasPermission } from "../../services/rbacService";
import { GlassButton } from "../ui/GlassButton";

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: Role;
  activeWidgetIds: DashboardWidgetId[];
  onSaveWidgets: (selectedIds: DashboardWidgetId[]) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  patients: Users,
  medical: Stethoscope,
  rdv: CalendarDays,
  finance: Receipt,
  maternite: Baby,
  examens: TestTube2,
};

const CATEGORY_NAMES: Record<string, string> = {
  patients: "Patients & File d'attente",
  medical: "Actes Cliniques & Soins",
  rdv: "Agenda & Rendez-vous",
  finance: "Finances & Caisse",
  maternite: "Pôle Maternité & CPN",
  examens: "Laboratoire & Imagerie",
};

export const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({
  isOpen,
  onClose,
  userRole,
  activeWidgetIds,
  onSaveWidgets,
}) => {
  const [selectedIds, setSelectedIds] = useState<DashboardWidgetId[]>(activeWidgetIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"catalog" | "order">("catalog");

  // Keep state synced when modal opens
  React.useEffect(() => {
    setSelectedIds(activeWidgetIds);
  }, [activeWidgetIds, isOpen]);

  // Filter widgets by RBAC permissions
  const availableWidgets = useMemo(() => {
    return ALL_DASHBOARD_WIDGETS.filter((widget) => {
      if (!widget.requiredPermission) return true;
      return hasPermission(userRole, widget.requiredPermission);
    });
  }, [userRole]);

  // Search and category filtering
  const filteredWidgets = useMemo(() => {
    return availableWidgets.filter((w) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        w.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        activeCategoryFilter === "all" || w.category === activeCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [availableWidgets, searchQuery, activeCategoryFilter]);

  if (!isOpen) return null;

  const toggleWidget = (id: DashboardWidgetId) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) return; // Keep at least one KPI
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleApplyPreset = (preset: WidgetPreset) => {
    // Only keep widgets that the current role has permission to access
    const permittedIds = preset.widgetIds.filter((wId) => {
      const config = ALL_DASHBOARD_WIDGETS.find((item) => item.id === wId);
      if (!config || !config.requiredPermission) return true;
      return hasPermission(userRole, config.requiredPermission);
    });
    if (permittedIds.length > 0) {
      setSelectedIds(permittedIds);
    }
  };

  const handleResetToRoleDefaults = () => {
    const defaultIds = getDefaultWidgetsForRole(userRole);
    setSelectedIds(defaultIds);
  };

  const moveWidget = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedIds.length) return;
    const updated = [...selectedIds];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setSelectedIds(updated);
  };

  const handleSave = () => {
    onSaveWidgets(selectedIds);
    onClose();
  };

  const categories = Array.from(new Set(availableWidgets.map((w) => w.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border)] flex items-center justify-between gap-4 bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1261A0]/15 dark:bg-cyan-500/15 border border-[#1261A0]/30 dark:border-cyan-400/30 flex items-center justify-center text-[#1261A0] dark:text-[#55D9FF]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <span>Personnalisation du Tableau de Bord</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1261A0]/10 dark:bg-cyan-500/20 text-[#1261A0] dark:text-cyan-300 font-mono font-bold">
                  {selectedIds.length} actif{selectedIds.length > 1 ? "s" : ""}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                Configurez les indicateurs clés de performance (KPI) prioritaires affichés selon votre pratique clinique.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets and View Mode Bar */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-solid)] space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D9B45B]" />
              <span>Préréglages Cliniques Express :</span>
            </span>

            <button
              onClick={handleResetToRoleDefaults}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surface-subtle)] hover:bg-[#1261A0]/10 text-[var(--text-secondary)] hover:text-[#1261A0] font-semibold text-xs border border-[var(--border)] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Rétablir par défaut</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {DASHBOARD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  preset.role === userRole
                    ? "bg-[#1261A0]/15 dark:bg-cyan-500/20 text-[#1261A0] dark:text-cyan-300 border-[#1261A0]/40 dark:border-cyan-400/40 shadow-xs"
                    : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--border-active)]"
                }`}
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Sub Navigation: Catalogue vs Reorder */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-1 p-1 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border)]">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "catalog"
                    ? "bg-[#1261A0] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Catalogue des Widgets ({availableWidgets.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("order")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "order"
                    ? "bg-[#1261A0] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Ordre d'Affichage ({selectedIds.length})</span>
              </button>
            </div>

            {activeTab === "catalog" && (
              <div className="relative max-w-xs w-full hidden sm:block">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Filtrer un KPI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-solid)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[#1261A0]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === "catalog" ? (
            <>
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveCategoryFilter("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                    activeCategoryFilter === "all"
                      ? "bg-[#1261A0] text-white border-transparent"
                      : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Tous
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                      activeCategoryFilter === cat
                        ? "bg-[#1261A0] text-white border-transparent"
                        : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {CATEGORY_NAMES[cat] || cat}
                  </button>
                ))}
              </div>

              {/* Widgets Catalog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredWidgets.map((widget) => {
                  const isSelected = selectedIds.includes(widget.id);
                  const isRecommended = widget.rolesRecommended.includes(userRole);
                  const CategoryIcon = CATEGORY_ICONS[widget.category] || Activity;

                  return (
                    <div
                      key={widget.id}
                      onClick={() => toggleWidget(widget.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-[#1261A0]/10 dark:bg-cyan-500/15 border-[#1261A0] dark:border-cyan-400 shadow-sm"
                          : "bg-[var(--surface-subtle)] border-[var(--border)] hover:border-[var(--border-active)]"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#1261A0] text-white border-transparent"
                              : "bg-[var(--surface-solid)] text-[var(--text-secondary)] border-[var(--border)]"
                          }`}
                        >
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                              {widget.label}
                            </span>
                            {isRecommended && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#D9B45B]/20 text-[#966E1E] dark:text-[#F2D27E] border border-[#D9B45B]/40">
                                Recommandé
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                            {widget.description}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#1261A0] dark:bg-cyan-500 text-white border-transparent shadow-xs"
                            : "border-[var(--border)] bg-[var(--surface-solid)] text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Reorder Mode */
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Ajustez la position d'affichage de vos indicateurs de gauche à droite sur le tableau de bord :
              </p>

              <div className="space-y-2">
                {selectedIds.map((id, index) => {
                  const widget = ALL_DASHBOARD_WIDGETS.find((w) => w.id === id);
                  if (!widget) return null;
                  const CategoryIcon = CATEGORY_ICONS[widget.category] || Activity;

                  return (
                    <div
                      key={id}
                      className="p-3.5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border)] flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-xs font-mono font-bold text-[var(--text-secondary)]">
                          {index + 1}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#1261A0]/10 text-[#1261A0] dark:text-cyan-300 flex items-center justify-center shrink-0">
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                            {widget.label}
                          </h4>
                          <span className="text-[11px] text-[var(--text-secondary)]">
                            {CATEGORY_NAMES[widget.category] || widget.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => moveWidget(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-subtle)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                          title="Déplacer vers la gauche"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveWidget(index, "down")}
                          disabled={index === selectedIds.length - 1}
                          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-subtle)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                          title="Déplacer vers la droite"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        {selectedIds.length > 1 && (
                          <button
                            onClick={() => toggleWidget(id)}
                            className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 cursor-pointer ml-1"
                            title="Retirer cet indicateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--surface-subtle)] flex items-center justify-between gap-4">
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            <strong>{selectedIds.length}</strong> indicateur{selectedIds.length > 1 ? "s" : ""} sélectionné{selectedIds.length > 1 ? "s" : ""} (au moins 1 obligatoire).
          </span>
          <div className="flex items-center gap-3">
            <GlassButton variant="subtle" size="md" onClick={onClose}>
              Annuler
            </GlassButton>
            <GlassButton variant="primary" size="md" onClick={handleSave}>
              Enregistrer mes KPI
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};
