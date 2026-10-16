import React, { useState } from "react";
import { X, FileText, Printer, Search, Download, CheckCircle, FileCheck2, Receipt, Stethoscope, Baby, FlaskConical } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface QuickDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickDocumentsModal: React.FC<QuickDocumentsModalProps> = ({ isOpen, onClose }) => {
  const { setPrintableDoc, patients, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  if (!isOpen) return null;

  const defaultPatient = patients[0] || {
    id: "pat-default",
    patientCode: "PAT-2026-000001",
    firstName: "Amara",
    lastName: "Touré",
    sex: "MALE",
    birthDate: "1988-06-12",
    phone: "+223 76 12 34 56",
    address: "Sirakoro Méguétana, Bamako",
  };

  const documentTemplates = [
    {
      id: "presc",
      title: "Ordonnance Médicale Sécurisée",
      category: "MEDICAL",
      description: "Prescription thérapeutique officielle avec en-tête FONA et identification du prescripteur.",
      icon: Stethoscope,
      type: "PRESCRIPTION" as const,
      previewData: {
        prescriber: currentUser.fullName,
        items: [
          { drug: "Paracétamol 1g", dosage: "1 cp toutes les 8h si douleur", duration: "5 jours" },
          { drug: "Amoxicilline 1g", dosage: "1 gélule matin et soir", duration: "7 jours" },
        ],
        notes: "À prendre au cours des repas. Respecter la durée du traitement prescrite.",
      },
    },
    {
      id: "rec",
      title: "Reçu de Caisse & Encaissement",
      category: "FINANCE",
      description: "Justificatif de paiement patient, solde restant et détails des prestations médicales.",
      icon: Receipt,
      type: "RECEIPT" as const,
      previewData: {
        receiptNumber: "REC-2026-00452",
        items: [
          { label: "Consultation Médecine Générale", amount: 15000 },
          { label: "Injection intraveineuse", amount: 5000 },
        ],
        total: 20000,
        paid: 20000,
        balance: 0,
        paymentMethod: "Espèces / Mobile Money",
      },
    },
    {
      id: "cert",
      title: "Certificat Médical d'Aptitude / Repos",
      category: "MEDICAL",
      description: "Attestation médicale clinique signée pour arrêt de travail ou aptitude sportive.",
      icon: FileCheck2,
      type: "VISIT_SUMMARY" as const,
      previewData: {
        diagnosisSummary: "État de santé justifiant un repos médical prescrit.",
        durationDays: 3,
        doctorName: currentUser.fullName,
      },
    },
    {
      id: "lab",
      title: "Compte Rendu d'Analyses Biologiques",
      category: "LAB",
      description: "Bulletin de résultats de laboratoire avec normes de référence et validation biologiste.",
      icon: FlaskConical,
      type: "LAB" as const,
      previewData: {
        labNumber: "LAB-2026-00128",
        tests: [
          { name: "NFS - Hémoglobine", value: "13.8 g/dL", normal: "12.0 - 16.0", flag: "NORMAL" },
          { name: "Glycémie à jeun", value: "0.95 g/L", normal: "0.70 - 1.10", flag: "NORMAL" },
          { name: "Goutte Épaisse", value: "Négative", normal: "Négative", flag: "NORMAL" },
        ],
        validatedBy: "Dr. Diane N'Guessan (Biologiste)",
      },
    },
    {
      id: "cpn",
      title: "Fiche Obstétricale CPN & Maternité",
      category: "MATERNITY",
      description: "Relevé des consultations prénatales, calendrier vaccinal et évolution biométrique.",
      icon: Baby,
      type: "VISIT_SUMMARY" as const,
      previewData: {
        diagnosisSummary: "Suivi Prénatal CPN 2 validé. Évolution fœtale physiologique satisfaisante.",
        doctorName: currentUser.fullName,
      },
    },
  ];

  const filteredDocs = documentTemplates.filter((doc) => {
    const matchCat = selectedCategory === "ALL" || doc.category === selectedCategory;
    const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenPrint = (doc: (typeof documentTemplates)[0]) => {
    setPrintableDoc({
      type: doc.type,
      title: doc.title,
      patient: defaultPatient,
      data: doc.previewData,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#020b17]/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[var(--surface-elevated)] border border-[var(--border)] rounded-3xl shadow-2xl z-10 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-[#1261A0] dark:text-[#55D9FF]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Modèles de Documents Cliniques & Impression</h2>
              <p className="text-xs text-[var(--text-secondary)]">Génération instantanée conforme à l'identité visuelle FONA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 pb-2 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un modèle de document (ordonnance, certificat, reçu...)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: "ALL", label: "Tous les modèles" },
              { id: "MEDICAL", label: "Médical" },
              { id: "FINANCE", label: "Caisse" },
              { id: "LAB", label: "Laboratoire" },
              { id: "MATERNITY", label: "Maternité" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#1261A0] text-white shadow-xs"
                    : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Document Cards */}
        <div className="p-6 pt-2 space-y-3 max-h-[60vh] overflow-y-auto">
          {filteredDocs.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-[#1261A0] dark:text-[#55D9FF] shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)]">{doc.title}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{doc.description}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
                      <span>Patient démo : {defaultPatient.firstName} {defaultPatient.lastName}</span>
                      <span>•</span>
                      <span>Format papier blanc médical</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenPrint(doc)}
                  className="px-3.5 py-2 rounded-xl bg-[#D9B45B]/15 hover:bg-[#D9B45B]/25 border border-[#D9B45B]/30 text-[#B48B2E] dark:text-[#D9B45B] text-xs font-bold flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Aperçu & Imprimer</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--surface-subtle)] flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-secondary)]">Conformité impression papier blanc pur sans fond sombre</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
