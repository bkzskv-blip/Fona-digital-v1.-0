import { Router } from "express";
import { db } from "../../db/index.ts";
import { invoices, payments } from "../../db/schema.ts";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, requirePermission, auditServerAction, AuthRequest } from "../auth.ts";

const router = Router();

// ==========================================
// 1. FACTURES & PRESTATIONS
// ==========================================
router.get("/invoices", requireAuth, requirePermission("CAISSE_READ"), async (_req, res) => {
  try {
    const list = await db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(100);
    return res.json({ success: true, invoices: list });
  } catch (err) {
    console.error("[CashierRoutes] Erreur invoices:", err);
    return res.status(500).json({ success: false, error: "Erreur lecture des factures." });
  }
});

router.post("/invoices", requireAuth, requirePermission("CAISSE_CREATE"), async (req: AuthRequest, res) => {
  try {
    const { patientId, visitId, totalAmount, items } = req.body;
    if (!patientId || typeof totalAmount !== "number") {
      return res.status(400).json({ success: false, error: "Patient et montant total requis." });
    }

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(invoices);
    const count = Number(countResult[0]?.count || 0) + 1;
    const invoiceCode = `FAC-2026-${count.toString().padStart(4, "0")}`;
    const invoiceId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newInvoice = {
      id: invoiceId,
      invoiceCode,
      patientId,
      visitId: visitId || null,
      totalAmount,
      paidAmount: 0,
      balance: totalAmount,
      status: "IMPAYE",
      items: items || [],
      createdById: req.user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(invoices).values(newInvoice);

    await auditServerAction({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "INVOICE_CREATED",
      entity: "Invoice",
      entityId: invoiceId,
      details: `Facture ${invoiceCode} émise : ${totalAmount.toLocaleString("fr-FR")} FCFA`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, invoice: newInvoice });
  } catch (err) {
    console.error("[CashierRoutes] Erreur création facture:", err);
    return res.status(500).json({ success: false, error: "Erreur création facture." });
  }
});

// ==========================================
// 2. ENCAISSEMENTS & PAIEMENTS (TRANSACTION ACID & IDEMPOTENCE)
// ==========================================
router.get("/payments", requireAuth, requirePermission("CAISSE_READ"), async (_req, res) => {
  try {
    const list = await db.select().from(payments).orderBy(desc(payments.receivedAt)).limit(100);
    return res.json({ success: true, payments: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur lecture des paiements." });
  }
});

router.post("/payments", requireAuth, requirePermission("PAYMENT_WRITE"), async (req: AuthRequest, res) => {
  try {
    const { invoiceId, patientId, amount, paymentMethod, transactionRef, idempotencyKey, notes } = req.body;

    if (!invoiceId || !patientId || !amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: "Facture, patient, mode de paiement et montant valide (> 0 FCFA) requis.",
      });
    }

    // 1. Vérification d'idempotence (protection contre les doubles clics)
    if (idempotencyKey) {
      const existingPayment = await db
        .select()
        .from(payments)
        .where(eq(payments.idempotencyKey, idempotencyKey))
        .limit(1);

      if (existingPayment.length > 0) {
        return res.status(200).json({
          success: true,
          payment: existingPayment[0],
          isDuplicatePrevented: true,
          message: "Transaction déjà enregistrée (protection anti-doublon active).",
        });
      }
    }

    // 2. Exécution dans une transaction ACID PostgreSQL
    const result = await db.transaction(async (tx) => {
      // Verrouillage de la facture pour lecture cohérente
      const foundInvoices = await tx
        .select()
        .from(invoices)
        .where(eq(invoices.id, invoiceId))
        .limit(1);

      if (foundInvoices.length === 0) {
        throw new Error("Facture introuvable.");
      }

      const inv = foundInvoices[0];
      const newPaidAmount = inv.paidAmount + amount;
      const newBalance = inv.totalAmount - newPaidAmount;
      const newStatus = newBalance <= 0 ? "PAYE" : "PARTIEL";

      // Génération du code reçu
      const countResult = await tx.select({ count: sql<number>`count(*)` }).from(payments);
      const count = Number(countResult[0]?.count || 0) + 1;
      const paymentCode = `REC-2026-${count.toString().padStart(4, "0")}`;
      const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const newPayment = {
        id: paymentId,
        paymentCode,
        invoiceId,
        patientId,
        amount,
        paymentMethod,
        transactionRef: transactionRef || null,
        idempotencyKey: idempotencyKey || null,
        notes: notes || null,
        receivedById: req.user!.id,
        receivedByName: req.user!.fullName,
        receivedAt: new Date(),
      };

      await tx.insert(payments).values(newPayment);

      await tx
        .update(invoices)
        .set({
          paidAmount: newPaidAmount,
          balance: newBalance,
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoiceId));

      return { newPayment, updatedInvoice: { ...inv, paidAmount: newPaidAmount, balance: newBalance, status: newStatus } };
    });

    await auditServerAction({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "PAYMENT_RECORDED",
      entity: "Payment",
      entityId: result.newPayment.id,
      details: `Encaissement de ${amount.toLocaleString("fr-FR")} FCFA (${paymentMethod}) sur facture ${invoiceId}. Reçu ${result.newPayment.paymentCode}. Nouveau solde : ${result.updatedInvoice.balance} FCFA.`,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      payment: result.newPayment,
      invoice: result.updatedInvoice,
    });
  } catch (err: any) {
    console.error("[CashierRoutes] Erreur enregistrement paiement:", err);
    return res.status(500).json({ success: false, error: err.message || "Erreur lors de l'encaissement." });
  }
});

export default router;
