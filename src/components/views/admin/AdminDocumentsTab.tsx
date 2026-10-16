import React, { useState } from "react";
import {
  FileText,
  Printer,
  ShieldCheck,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  Receipt,
  FileCheck2,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GlassCard } from "../../ui/GlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { GlassInput, GlassSelect } from "../../ui/GlassFormControls";
import { FonaLogo } from "../../ui/FonaLogo";

export const AdminDocumentsTab: React.FC = () => {
  const { documentConfig, updateDocumentConfig, brandSettings, showToast, formatDate } = useApp();

  const [showOfficialLogo, setShowOfficialLogo] = useState(documentConfig.showOfficialLogo);
  const [showInstitutionHeader, setShowInstitutionHeader] = useState(documentConfig.showInstitutionHeader);
  const [showWatermark, setShowWatermark] = useState(documentConfig.showWatermark);
  const [defaultPaperFormat, setDefaultPaperFormat] = useState(documentConfig.defaultPaperFormat);
  const [includeSignature, setIncludeSignature] = useState(documentConfig.includePractitionerSignature);
  const [officialMention, setOfficialMention] = useState(documentConfig.officialMention);
  const [patientIdPrefix, setPatientIdPrefix] = useState(documentConfig.patientIdPrefix);
  const [consultationIdPrefix, setConsultationIdPrefix] = useState(documentConfig.consultationIdPrefix);
  const [invoiceIdPrefix, setInvoiceIdPrefix] = useState(documentConfig.invoiceIdPrefix);

  const handleSaveDocConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateDocumentConfig({
      showOfficialLogo,
      showInstitutionHeader,
      showWatermark,
      defaultPaperFormat,
      includePractitionerSignature: includeSignature,
      officialMention,
      patientIdPrefix,
      consultationIdPrefix,
      invoiceIdPrefix,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl glass-surface border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#55D9FF] border border-cyan-400/30 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Documents Médicaux, Gabarits d'Impression & Numérotation
            </h3>
            <p className="text-xs text-slate-400">
              Paramétrage des ordonnances, reçus de caisse, comptes rendus d'imagerie et bilans biologiques
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-300 px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-500/30">
          Format Actif : {defaultPaperFormat}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <FileCheck2 className="w-4 h-4 text-[#D9B45B]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Configuration des En-Têtes & Mentions Légales
              </h4>
            </div>

            <form onSubmit={handleSaveDocConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassSelect
                  label="Format Papier par Défaut"
                  value={defaultPaperFormat}
                  onChange={(e) => setDefaultPaperFormat(e.target.value as any)}
                  options={[
                    { value: "A4", label: "Format A4 Standard (Ordonnances / Bilans)" },
                    { value: "A5", label: "Format A5 Demi-page (Certificats)" },
                    { value: "TICKET_80MM", label: "Ticket Thermique 80mm (Reçus Caisse)" },
                  ]}
                />

                <GlassInput
                  label="Préfixe Code Patient"
                  value={patientIdPrefix}
                  onChange={(e) => setPatientIdPrefix(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Préfixe Actes / Consultations"
                  value={consultationIdPrefix}
                  onChange={(e) => setConsultationIdPrefix(e.target.value)}
                />
                <GlassInput
                  label="Préfixe Factures & Reçus"
                  value={invoiceIdPrefix}
                  onChange={(e) => setInvoiceIdPrefix(e.target.value)}
                />
              </div>

              <GlassInput
                label="Mention Légale Obligatoire en Pied de Page"
                value={officialMention}
                onChange={(e) => setOfficialMention(e.target.value)}
              />

              {/* Toggles */}
              <div className="pt-2 space-y-3">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <span className="text-xs font-semibold text-white block">Logo officiel FONA sur l'en-tête</span>
                    <span className="text-[10px] text-slate-400">Intègre le logo institutionnel FONA haute résolution</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showOfficialLogo}
                    onChange={(e) => setShowOfficialLogo(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <span className="text-xs font-semibold text-white block">Filigrane de sécurité anti-fraude</span>
                    <span className="text-[10px] text-slate-400">Marquage discret FONA Digital en arrière-plan</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <span className="text-xs font-semibold text-white block">Cadre de signature et cachet du médecin</span>
                    <span className="text-[10px] text-slate-400">Emplacement réservé avec nom du praticien</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end">
                <GlassButton type="submit" variant="gold" size="sm" icon={<Save className="w-4 h-4" />}>
                  Enregistrer les Modèles
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Live Document Sheet Mockup (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Aperçu en Temps Réel du Rendu Papier (Thème Clair Sobre)
            </h4>

            {/* Simulated Paper A4 / Sheet */}
            <div className="bg-white text-slate-900 rounded-xl p-5 shadow-xl border border-slate-200 space-y-4 text-xs font-sans">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-3 border-slate-200">
                <div className="space-y-1">
                  {showOfficialLogo && (
                    <FonaLogo variant="compact" theme="light" size="sm" />
                  )}
                  <div className="text-[10px] text-slate-600 font-semibold mt-1">
                    {brandSettings.organizationName}
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {brandSettings.clinicAddress} &middot; Tél: {brandSettings.clinicPhone.split("/")[0]}
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono text-slate-500">
                  <div>RÉF : <strong>{consultationIdPrefix}0042</strong></div>
                  <div>DATE : {formatDate(new Date())}</div>
                </div>
              </div>

              {/* Watermark preview note */}
              {showWatermark && (
                <div className="text-center py-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  [Filigrane FONA Anti-Falsification Actif]
                </div>
              )}

              {/* Patient and Body Preview */}
              <div className="space-y-2 text-[11px]">
                <div className="p-2 rounded bg-slate-100 flex justify-between font-medium">
                  <span>Patient : Mme. Ouattara Aminata</span>
                  <span className="font-mono text-[10px] text-slate-500">{patientIdPrefix}0001</span>
                </div>
                <div className="font-serif italic text-slate-700 py-1">
                  « Amoxicilline 1g — 1 cp matin et soir pendant 7 jours »
                </div>
              </div>

              {/* Signature frame */}
              {includeSignature && (
                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <div className="w-36 text-center text-[10px] text-slate-600 space-y-6">
                    <span>Signature & Cachet du Praticien</span>
                    <div className="border-b border-slate-300" />
                  </div>
                </div>
              )}

              {/* Legal footer */}
              <div className="text-[8px] text-slate-400 text-center pt-2 border-t border-slate-100 truncate">
                {officialMention}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
