import React, { useState, useMemo } from "react";
import {
  Receipt,
  Plus,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Clock,
  User,
  Search,
  Filter,
  ArrowRight,
  Zap,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassInput, GlassSelect } from "../ui/GlassFormControls";
import { GlassModal } from "../ui/GlassModal";
import { GlassEmptyState } from "../ui/GlassEmptyState";
import { Invoice, PaymentTransaction } from "../../types";

export const CashierView: React.FC = () => {
  const {
    invoices,
    payments,
    addInvoice,
    addPayment,
    patients,
    currentUser,
    currentSite,
    setSelectedPatientId,
    setActiveTab: setGlobalTab,
    setPrintableDoc,
    showToast,
    formatCurrency,
    formatDate,
    formatDateTime,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"INVOICES" | "PAYMENTS_HISTORY">("INVOICES");

  // Payment Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction["paymentMethod"]>("MOBILE_MONEY");
  const [transactionRef, setTransactionRef] = useState("");

  // New Invoice Modal
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [invPatientId, setInvPatientId] = useState(patients[0]?.id || "");
  const [invItems, setInvItems] = useState([
    { description: "Consultation Médecine Générale", quantity: 1, unitPrice: 15000 },
  ]);

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.balance.toString());
    setTransactionRef("");
  };

  const handleQuickPayFull = (inv: Invoice, method: PaymentTransaction["paymentMethod"]) => {
    if (inv.balance <= 0) return;
    const newPayment = addPayment(
      inv.id,
      inv.balance,
      method,
      `${method === "ESPECES" ? "CASH" : "M-MONEY"}-${Date.now().toString().slice(-4)}`
    );
    const pat = patients.find((p) => p.id === inv.patientId);
    if (pat) {
      setPrintableDoc({
        type: "RECEIPT",
        title: `REÇU DE PAIEMENT EXPRESS — ${newPayment.receiptCode}`,
        patient: pat,
        data: newPayment,
      });
    }
    showToast(
      "SUCCESS",
      "Encaissement Express Effectué",
      `Solde de ${formatCurrency(inv.balance)} réglé en ${method === "ESPECES" ? "Espèces" : "Mobile Money"}.`
    );
  };

  const handleAddPresetItem = (description: string, unitPrice: number) => {
    setInvItems((prev) => {
      if (prev.length === 1 && prev[0].description === "Consultation Médecine Générale" && prev[0].unitPrice === 15000 && description !== "Consultation Médecine Générale") {
        return [{ description, quantity: 1, unitPrice }];
      }
      return [...prev, { description, quantity: 1, unitPrice }];
    });
    showToast("INFO", "Prestation Ajoutée", `${description} (${formatCurrency(unitPrice)}) ajoutée à la facture.`);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("WARNING", "Montant Invalide", "Veuillez saisir un montant positif.");
      return;
    }

    if (amount > selectedInvoice.balance) {
      showToast("WARNING", "Dépassement du Solde", "Le montant saisi est supérieur au solde restant.");
      return;
    }

    const newPayment = addPayment(selectedInvoice.id, amount, paymentMethod, transactionRef);
    setSelectedInvoice(null);

    // Prompt to print receipt
    const pat = patients.find((p) => p.id === selectedInvoice.patientId);
    if (pat) {
      setPrintableDoc({
        type: "RECEIPT",
        title: `REÇU DE PAIEMENT — ${newPayment.receiptCode}`,
        patient: pat,
        data: newPayment,
      });
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const items = invItems.map((it, idx) => ({
      id: `it-${Date.now()}-${idx}`,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.quantity * it.unitPrice,
    }));

    const totalAmount = items.reduce((acc, it) => acc + it.total, 0);

    addInvoice({
      visitId: `vis-inv-${Date.now()}`,
      patientId: invPatientId,
      siteId: currentSite.id,
      items,
      totalAmount,
      paidAmount: 0,
    });

    setIsNewInvoiceModalOpen(false);
    showToast("SUCCESS", "Facture Créée", `Montant total : ${formatCurrency(totalAmount)}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and KPI Quick Glance */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl glass-surface border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D9B45B]/20 text-[#D9B45B] border border-[#D9B45B]/30 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Caisse & Facturation
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#051426] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("INVOICES")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "INVOICES" ? "bg-[#D9B45B] text-[#071A33] font-bold shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Factures ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab("PAYMENTS_HISTORY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "PAYMENTS_HISTORY" ? "bg-[#D9B45B] text-[#071A33] font-bold shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Historique Règlements ({payments.length})
            </button>
          </div>

          <GlassButton
            variant="gold"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewInvoiceModalOpen(true)}
          >
            Nouvelle Facture
          </GlassButton>
        </div>
      </div>

      {/* TAB 1: FACTURES & PAIEMENTS PARTIELS */}
      {activeTab === "INVOICES" && (
        invoices.length === 0 ? (
          <GlassEmptyState
            icon={<Receipt className="w-7 h-7 text-[#D9B45B]" />}
            title="Aucune facture émise"
            description="Toutes les prestations sont réglées ou aucune facture n'a encore été générée. Vous pouvez créer une nouvelle facture médicale dès maintenant."
            actionLabel="Nouvelle Facture"
            actionIcon={<Plus className="w-4 h-4" />}
            onAction={() => setIsNewInvoiceModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => {
            const pat = patients.find((p) => p.id === inv.patientId);

            return (
              <GlassCard
                key={inv.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-xs text-[#55D9FF]">
                      {inv.invoiceCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        inv.status === "PAYE"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                          : inv.status === "PARTIEL"
                          ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {inv.status === "PAYE"
                        ? "Soldé / Payé"
                        : inv.status === "PARTIEL"
                        ? "Paiement Partiel"
                        : "Impayé"}
                    </span>
                    <span className="text-xs text-slate-400">
                      Date : {formatDate(inv.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {pat ? `${pat.lastName.toUpperCase()} ${pat.firstName}` : "Patient"}
                      <span className="font-mono text-cyan-300 text-xs ml-2">({pat?.patientCode})</span>
                    </h4>
                    {pat && (
                      <button
                        onClick={() => {
                          setSelectedPatientId(pat.id);
                          setGlobalTab("patients");
                        }}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Dossier
                      </button>
                    )}
                  </div>

                  {/* Prestations list summary */}
                  <div className="text-xs text-slate-300">
                    Actes : {inv.items.map((it) => it.description).join(", ")}
                  </div>
                </div>

                {/* Amounts Breakdown (Section 25 & 75) */}
                <div className="flex items-center gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-right text-xs">
                    <div className="text-slate-400 text-[11px]">Total Prestations</div>
                    <div className="font-mono font-bold text-white text-sm">
                      {formatCurrency(inv.totalAmount)}
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="text-slate-400 text-[11px]">Déjà Réglé</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(inv.paidAmount)}
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="text-slate-400 text-[11px]">Solde Dû</div>
                    <div className="font-mono font-bold text-[#D9B45B] text-base">
                      {formatCurrency(inv.balance)}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
                    {inv.balance > 0 ? (
                      <>
                        {/* 1-Click Cash Settlement */}
                        <button
                          onClick={() => handleQuickPayFull(inv, "ESPECES")}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-xs font-bold text-emerald-300 flex items-center gap-1 cursor-pointer"
                          title="Encaisser le solde complet en espèces et générer le reçu"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Espèces</span>
                        </button>

                        {/* 1-Click Mobile Money Settlement */}
                        <button
                          onClick={() => handleQuickPayFull(inv, "MOBILE_MONEY")}
                          className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-xs font-bold text-cyan-300 flex items-center gap-1 cursor-pointer"
                          title="Encaisser le solde complet par Wave / Mobile Money"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Mobile Money</span>
                        </button>

                        {/* Partial or custom settlement */}
                        <button
                          onClick={() => openPaymentModal(inv)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center gap-1 cursor-pointer"
                          title="Saisir un montant personnalisé ou paiement partiel"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Partiel...</span>
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" />
                        Soldé
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ))}

      {/* TAB 2: HISTORIQUE DES RÈGLEMENTS */}
      {activeTab === "PAYMENTS_HISTORY" && (
        payments.length === 0 ? (
          <GlassEmptyState
            icon={<CreditCard className="w-7 h-7 text-emerald-400" />}
            title="Aucun règlement consigné"
            description="Aucun encaissement ou reçu de paiement n'a été enregistré pour le moment."
          />
        ) : (
          <div className="space-y-3">
            {payments.map((p) => {
            const pat = patients.find((pt) => pt.id === p.patientId);

            return (
              <GlassCard key={p.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300">
                    {p.paymentMethod === "MOBILE_MONEY" ? (
                      <Smartphone className="w-5 h-5 text-cyan-400" />
                    ) : p.paymentMethod === "ESPECES" ? (
                      <Banknote className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-violet-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{p.receiptCode}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 font-semibold text-slate-300">
                        {p.paymentMethod}
                      </span>
                      {p.transactionRef && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Ref: {p.transactionRef}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-300 font-medium mt-0.5">
                      {pat ? `${pat.lastName.toUpperCase()} ${pat.firstName}` : "Patient"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Encaissé par {p.receivedBy} · {formatDateTime(p.paidAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="font-mono font-black text-sm text-[#D9B45B]">
                    {formatCurrency(p.amount)}
                  </div>

                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={<Printer className="w-3.5 h-3.5" />}
                    onClick={() => {
                      if (pat) {
                        setPrintableDoc({
                          type: "RECEIPT",
                          title: `REÇU DE PAIEMENT — ${p.receiptCode}`,
                          patient: pat,
                          data: p,
                        });
                      }
                    }}
                  >
                    Reçu
                  </GlassButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ))}

      {/* ENCAISSER / ENREGISTRER PAIEMENT MODAL (Paiement Partiel Support) */}
      {selectedInvoice && (
        <GlassModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Règlement : ${selectedInvoice.invoiceCode}`}
          subtitle={`Solde restant dû : ${formatCurrency(selectedInvoice.balance)}`}
          icon={<CreditCard className="w-5 h-5" />}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Facture :</span>
                <span className="font-mono text-white">{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Déjà Payé :</span>
                <span className="font-mono text-emerald-400">{formatCurrency(selectedInvoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-200 font-bold pt-1 border-t border-white/10">
                <span>Solde à Régler :</span>
                <span className="font-mono text-[#D9B45B] text-sm">
                  {formatCurrency(selectedInvoice.balance)}
                </span>
              </div>
            </div>

            <GlassInput
              label="Montant à Encaisser (FCFA) *"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />

            <GlassSelect
              label="Mode de Règlement *"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              options={[
                { value: "MOBILE_MONEY", label: "Mobile Money (Wave / Orange / MTN)" },
                { value: "ESPECES", label: "Espèces (Comptant au guichet)" },
                { value: "CARTE", label: "Carte Bancaire (TPE)" },
                { value: "VIREMENT", label: "Virement Bancaire" },
              ]}
            />

            <GlassInput
              label="Référence Transaction / Bordereau"
              placeholder="Ex: WAVE-CI-984210 ou TPE-0941"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <GlassButton
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setSelectedInvoice(null)}
              >
                Annuler
              </GlassButton>
              <GlassButton type="submit" variant="gold" size="md">
                Encaisser & Émettre Reçu
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}

      {/* CREATE NEW INVOICE MODAL */}
      <GlassModal
        isOpen={isNewInvoiceModalOpen}
        onClose={() => setIsNewInvoiceModalOpen(false)}
        title="Établir une Facture Médicale"
        subtitle="Saisie des prestations et calcul du montant total"
        icon={<Receipt className="w-5 h-5" />}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <GlassSelect
            label="Patient *"
            value={invPatientId}
            onChange={(e) => setInvPatientId(e.target.value)}
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.lastName.toUpperCase()} ${p.firstName} (${p.patientCode})`,
            }))}
          />

          <div className="space-y-3">
            {/* Quick Act Presets */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                Actes Fréquents FONA (Ajout 1 Clic)
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { desc: "Consultation Médecine Générale", price: 15000 },
                  { desc: "Consultation Spécialiste", price: 25000 },
                  { desc: "Pansement stérile & Soin infirmier", price: 5000 },
                  { desc: "Bilan Biologique (NFS + CRP + Palu)", price: 18000 },
                  { desc: "Échographie Obstétricale / Pelvienne", price: 20000 },
                  { desc: "Forfait Accouchement Eutocique", price: 85000 },
                ].map((act, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddPresetItem(act.desc, act.price)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium cursor-pointer transition-colors"
                  >
                    + {act.desc.split(" (")[0]} ({act.price / 1000}k)
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Prestations Facturables
            </span>

            {invItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-6">
                  <GlassInput
                    label={idx === 0 ? "Description Acte" : undefined}
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...invItems];
                      updated[idx].description = e.target.value;
                      setInvItems(updated);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <GlassInput
                    label={idx === 0 ? "Qté" : undefined}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...invItems];
                      updated[idx].quantity = parseInt(e.target.value) || 1;
                      setInvItems(updated);
                    }}
                  />
                </div>
                <div className="col-span-4">
                  <GlassInput
                    label={idx === 0 ? "Tarif (FCFA)" : undefined}
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const updated = [...invItems];
                      updated[idx].unitPrice = parseInt(e.target.value) || 0;
                      setInvItems(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsNewInvoiceModalOpen(false)}
            >
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="md">
              Générer la Facture
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
