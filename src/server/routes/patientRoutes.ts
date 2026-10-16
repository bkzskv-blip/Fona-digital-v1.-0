import { Router } from "express";
import { db } from "../../db/index.ts";
import {
  patients,
  patientAllergies,
  patientHistories,
  visits,
  consultations,
  cares,
  appointments,
  prenatalVisits,
  deliveries,
  labRequests,
  imagingRequests,
  payments,
} from "../../db/schema.ts";
import { eq, or, ilike, and, desc, sql } from "drizzle-orm";
import { requireAuth, requirePermission, auditServerAction, AuthRequest } from "../auth.ts";

const router = Router();

// ==========================================
// GET /api/patients (Recherche et Liste)
// ==========================================
router.get("/", requireAuth, requirePermission("PATIENT_READ"), async (req: AuthRequest, res) => {
  try {
    const q = (req.query.q as string)?.trim();
    const includeArchived = req.query.includeArchived === "true";

    let conditions: any[] = [];
    if (!includeArchived) {
      conditions.push(eq(patients.isArchived, false));
    }

    if (q) {
      conditions.push(
        or(
          ilike(patients.patientCode, `%${q}%`),
          ilike(patients.lastName, `%${q}%`),
          ilike(patients.firstName, `%${q}%`),
          ilike(patients.phone, `%${q}%`)
        )
      );
    }

    const patientList = await db
      .select()
      .from(patients)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(patients.createdAt))
      .limit(100);

    return res.json({ success: true, patients: patientList });
  } catch (err) {
    console.error("[PatientRoutes] Erreur récupération patients:", err);
    return res.status(500).json({ success: false, error: "Erreur serveur lors de la recherche des patients." });
  }
});

// ==========================================
// GET /api/patients/:id (Dossier complet)
// ==========================================
router.get("/:id", requireAuth, requirePermission("PATIENT_READ"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const patientRecords = await db
      .select()
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1);

    if (patientRecords.length === 0) {
      return res.status(404).json({ success: false, error: "Patient introuvable." });
    }

    const patient = patientRecords[0];
    const allergies = await db.select().from(patientAllergies).where(eq(patientAllergies.patientId, id));
    const histories = await db.select().from(patientHistories).where(eq(patientHistories.patientId, id));

    return res.json({
      success: true,
      patient: {
        ...patient,
        allergies,
        histories,
      },
    });
  } catch (err) {
    console.error("[PatientRoutes] Erreur lecture patient:", err);
    return res.status(500).json({ success: false, error: "Erreur serveur." });
  }
});

// ==========================================
// POST /api/patients (Création d'un dossier permanent)
// ==========================================
router.post("/", requireAuth, requirePermission("PATIENT_CREATE"), async (req: AuthRequest, res) => {
  try {
    const {
      firstName,
      lastName,
      sex,
      birthDate,
      phone,
      address,
      bloodGroup,
      emergencyContactName,
      emergencyContactPhone,
      allergies,
      histories,
    } = req.body;

    if (!firstName || !lastName || !sex) {
      return res.status(400).json({
        success: false,
        error: "Le prénom, le nom et le sexe sont obligatoires pour créer un dossier patient.",
      });
    }

    // Détection de doublon basée sur nom, prénom et téléphone
    if (phone) {
      const existing = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.phone, phone.trim()),
            ilike(patients.lastName, lastName.trim()),
            ilike(patients.firstName, firstName.trim())
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: `Un dossier patient existe déjà pour cette personne (${existing[0].patientCode} : ${existing[0].lastName} ${existing[0].firstName}). Utilisez le dossier existant.`,
          existingPatient: existing[0],
        });
      }
    }

    // Génération automatique du code patient
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(patients);
    const count = Number(countResult[0]?.count || 0) + 1;
    const patientCode = `PAT-2026-${count.toString().padStart(4, "0")}`;
    const patientId = `pat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newPatient = {
      id: patientId,
      patientCode,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      sex,
      birthDate: birthDate || null,
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
      bloodGroup: bloodGroup || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      isArchived: false,
      createdById: req.user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(patients).values(newPatient);

    // Insertion des allergies éventuelles
    if (Array.isArray(allergies) && allergies.length > 0) {
      for (const al of allergies) {
        await db.insert(patientAllergies).values({
          id: `alg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          patientId,
          allergen: al.allergen,
          severity: al.severity || "MODEREE",
          reaction: al.reaction || null,
          notes: al.notes || null,
          createdAt: new Date(),
        });
      }
    }

    // Insertion des antécédents éventuels
    if (Array.isArray(histories) && histories.length > 0) {
      for (const hist of histories) {
        await db.insert(patientHistories).values({
          id: `hst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          patientId,
          category: hist.category || "MEDICAL",
          condition: hist.condition,
          year: hist.year ? Number(hist.year) : null,
          notes: hist.notes || null,
          createdAt: new Date(),
        });
      }
    }

    await auditServerAction({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "PATIENT_CREATED",
      entity: "Patient",
      entityId: patientId,
      details: `Création du dossier patient permanent ${newPatient.patientCode} (${newPatient.lastName} ${newPatient.firstName})`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, patient: newPatient });
  } catch (err) {
    console.error("[PatientRoutes] Erreur création patient:", err);
    return res.status(500).json({ success: false, error: "Erreur serveur lors de la création du patient." });
  }
});

// ==========================================
// PUT /api/patients/:id (Mise à jour)
// ==========================================
router.put("/:id", requireAuth, requirePermission("PATIENT_UPDATE"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      sex,
      birthDate,
      phone,
      address,
      bloodGroup,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    const existing = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: "Patient introuvable." });
    }

    await db
      .update(patients)
      .set({
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        sex,
        birthDate,
        phone: phone?.trim(),
        address: address?.trim(),
        bloodGroup,
        emergencyContactName,
        emergencyContactPhone,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, id));

    await auditServerAction({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "PATIENT_UPDATED",
      entity: "Patient",
      entityId: id,
      details: `Mise à jour des coordonnées administratives du dossier ${existing[0].patientCode}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: "Dossier patient mis à jour avec succès." });
  } catch (err) {
    console.error("[PatientRoutes] Erreur mise à jour patient:", err);
    return res.status(500).json({ success: false, error: "Erreur lors de la modification du dossier." });
  }
});

// ==========================================
// POST /api/patients/:id/archive (Archivage contrôlé — NON DESTRUCTIF)
// ==========================================
router.post("/:id/archive", requireAuth, requirePermission("PATIENT_ARCHIVE"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const existing = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: "Patient introuvable." });
    }

    await db
      .update(patients)
      .set({
        isArchived: true,
        archivedAt: new Date(),
        archivedReason: reason || "Archivage administratif sans suppression des données cliniques",
        updatedAt: new Date(),
      })
      .where(eq(patients.id, id));

    await auditServerAction({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "PATIENT_ARCHIVED",
      entity: "Patient",
      entityId: id,
      details: `Archivage contrôlé du patient ${existing[0].patientCode}. Motif : ${reason || "Non précisé"}. Données historiques préservées.`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: "Dossier archivé en toute sécurité sans suppression de données." });
  } catch (err) {
    console.error("[PatientRoutes] Erreur archivage patient:", err);
    return res.status(500).json({ success: false, error: "Erreur lors de l'archivage." });
  }
});

// ==========================================
// GET /api/patients/:id/timeline (Chronologie Médicale Unifiée)
// ==========================================
router.get("/:id/timeline", requireAuth, requirePermission("PATIENT_READ"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const [
      visList,
      consList,
      careList,
      aptList,
      cpnList,
      delList,
      labList,
      imgList,
      payList,
    ] = await Promise.all([
      db.select().from(visits).where(eq(visits.patientId, id)),
      db.select().from(consultations).where(eq(consultations.patientId, id)),
      db.select().from(cares).where(eq(cares.patientId, id)),
      db.select().from(appointments).where(eq(appointments.patientId, id)),
      db.select().from(prenatalVisits).where(eq(prenatalVisits.patientId, id)),
      db.select().from(deliveries).where(eq(deliveries.patientId, id)),
      db.select().from(labRequests).where(eq(labRequests.patientId, id)),
      db.select().from(imagingRequests).where(eq(imagingRequests.patientId, id)),
      db.select().from(payments).where(eq(payments.patientId, id)),
    ]);

    const events: any[] = [];

    visList.forEach((v) => {
      events.push({
        id: `tl-${v.id}`,
        patientId: id,
        type: "VISIT",
        occurredAt: v.startedAt,
        title: `Passage Médical — ${v.type}`,
        description: `Motif : ${v.reason} (${v.status})`,
      });
    });

    consList.forEach((c) => {
      events.push({
        id: `tl-${c.id}`,
        patientId: id,
        type: "CONSULTATION",
        occurredAt: c.createdAt,
        title: `Consultation : ${c.motif}`,
        description: c.conclusion || c.clinicalExam || "Consultation enregistrée",
        author: c.prescriberName,
      });
    });

    careList.forEach((cr) => {
      events.push({
        id: `tl-${cr.id}`,
        patientId: id,
        type: "CARE",
        occurredAt: cr.administeredAt,
        title: `Soin Infirmier : ${cr.careType}`,
        description: cr.notes,
        author: cr.performedByName,
      });
    });

    aptList.forEach((a) => {
      events.push({
        id: `tl-${a.id}`,
        patientId: id,
        type: "APPOINTMENT",
        occurredAt: new Date(`${a.appointmentDate}T${a.appointmentTime}:00Z`),
        title: `Rendez-vous — ${a.service}`,
        description: `${a.reason} (${a.status})`,
        author: a.practitionerName,
      });
    });

    cpnList.forEach((cpn) => {
      events.push({
        id: `tl-${cpn.id}`,
        patientId: id,
        type: "CPN",
        occurredAt: new Date(cpn.visitDate),
        title: `Consultation Prénatale CPN ${cpn.cpnNumber}`,
        description: `Terme : ${cpn.gestationalAgeWeeks || "?"} SA, Hauteur utérine : ${cpn.fundalHeightCm || "?"} cm, TA : ${cpn.bloodPressure || "?"}`,
        author: cpn.performedByName,
      });
    });

    delList.forEach((d) => {
      events.push({
        id: `tl-${d.id}`,
        patientId: id,
        type: "DELIVERY",
        occurredAt: new Date(`${d.deliveryDate}T${d.deliveryTime}:00Z`),
        title: `Accouchement — Nouveau-né ${d.newbornSex}`,
        description: `Poids : ${d.newbornWeightG}g, Apgar : ${d.apgar1Min}/${d.apgar5Min}, Mode : ${d.deliveryType}`,
        author: d.birthAttendantName,
      });
    });

    labList.forEach((l) => {
      events.push({
        id: `tl-${l.id}`,
        patientId: id,
        type: "LAB",
        occurredAt: l.requestedAt,
        title: `Examens de Laboratoire (${l.labCode})`,
        description: `Statut : ${l.status}${l.validatorName ? ` — Validé par ${l.validatorName}` : ""}`,
      });
    });

    imgList.forEach((im) => {
      events.push({
        id: `tl-${im.id}`,
        patientId: id,
        type: "IMAGING",
        occurredAt: im.requestedAt,
        title: `Imagerie : ${im.examType} (${im.bodyRegion})`,
        description: im.conclusion || im.clinicalIndication,
        author: im.radiologistName,
      });
    });

    payList.forEach((p) => {
      events.push({
        id: `tl-${p.id}`,
        patientId: id,
        type: "PAYMENT",
        occurredAt: p.receivedAt,
        title: `Paiement Reçu : ${p.amount.toLocaleString("fr-FR")} FCFA`,
        description: `Mode : ${p.paymentMethod}${p.transactionRef ? ` (Réf: ${p.transactionRef})` : ""}`,
        author: p.receivedByName,
      });
    });

    // Tri antéchronologique (plus récent en premier)
    events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    return res.json({ success: true, timeline: events });
  } catch (err) {
    console.error("[PatientRoutes] Erreur timeline:", err);
    return res.status(500).json({ success: false, error: "Erreur serveur lors de la lecture de la timeline." });
  }
});

export default router;
