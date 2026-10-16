import { Router } from "express";
import { db } from "../../db/index.ts";
import {
  visits,
  consultations,
  vitalSignsRecords,
  cares,
  appointments,
  pregnancies,
  prenatalVisits,
  deliveries,
  labCatalog,
  labRequests,
  imagingRequests,
  patients,
} from "../../db/schema.ts";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, requirePermission, auditServerAction, AuthRequest } from "../auth.ts";

const router = Router();

// ==========================================
// 1. PASSAGES MÉDICAUX (VISITS)
// ==========================================
router.get("/visits", requireAuth, async (req: AuthRequest, res) => {
  try {
    const patientId = req.query.patientId as string;
    const visitList = patientId
      ? await db.select().from(visits).where(eq(visits.patientId, patientId)).orderBy(desc(visits.startedAt))
      : await db.select().from(visits).orderBy(desc(visits.startedAt)).limit(100);

    return res.json({ success: true, visits: visitList });
  } catch (err) {
    console.error("[ClinicalRoutes] Erreur visits:", err);
    return res.status(500).json({ success: false, error: "Erreur lecture des passages." });
  }
});

router.post("/visits", requireAuth, requirePermission("VISIT_CREATE"), async (req: AuthRequest, res) => {
  try {
    const { patientId, type, reason } = req.body;
    if (!patientId || !type || !reason) {
      return res.status(400).json({ success: false, error: "Patient, type et motif de passage requis." });
    }

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(visits);
    const count = Number(countResult[0]?.count || 0) + 1;
    const visitCode = `VIS-2026-${count.toString().padStart(4, "0")}`;
    const visitId = `vis-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newVisit = {
      id: visitId,
      visitCode,
      patientId,
      type,
      status: "EN_ATTENTE",
      reason,
      startedAt: new Date(),
      createdById: req.user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(visits).values(newVisit);

    await auditServerAction({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "VISIT_CREATED",
      entity: "Visit",
      entityId: visitId,
      details: `Création du passage ${visitCode} (${type})`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, visit: newVisit });
  } catch (err) {
    console.error("[ClinicalRoutes] Erreur création visit:", err);
    return res.status(500).json({ success: false, error: "Erreur création passage." });
  }
});

router.put("/visits/:id/status", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db
      .update(visits)
      .set({
        status,
        endedAt: status === "TERMINE" ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(visits.id, id));

    return res.json({ success: true, message: "Statut du passage actualisé." });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur mise à jour statut." });
  }
});

// ==========================================
// 2. CONSULTATIONS CLINIQUES (ÉPURÉES : SIGNES & DIAGNOSTICS)
// ==========================================
router.get("/consultations", requireAuth, requirePermission("CONSULTATION_READ"), async (req: AuthRequest, res) => {
  try {
    const patientId = req.query.patientId as string;
    const list = patientId
      ? await db.select().from(consultations).where(eq(consultations.patientId, patientId)).orderBy(desc(consultations.createdAt))
      : await db.select().from(consultations).orderBy(desc(consultations.createdAt)).limit(100);

    return res.json({ success: true, consultations: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur consultations." });
  }
});

router.post("/consultations", requireAuth, requirePermission("CONSULTATION_CREATE"), async (req: AuthRequest, res) => {
  try {
    const {
      patientId,
      visitId,
      motif,
      clinicalHistory,
      clinicalExam,
      carePlan,
      conclusion,
      prescriberName,
      diagnoses,
      vitalSigns,
    } = req.body;

    if (!patientId || !visitId || !motif) {
      return res.status(400).json({ success: false, error: "Patient, passage et motif de consultation requis." });
    }

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(consultations);
    const count = Number(countResult[0]?.count || 0) + 1;
    const consultationCode = `CONS-2026-${count.toString().padStart(4, "0")}`;
    const consultationId = `cons-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newCons = {
      id: consultationId,
      consultationCode,
      visitId,
      patientId,
      motif,
      clinicalHistory: clinicalHistory || null,
      clinicalExam: clinicalExam || null, // Signes cliniques / Examen
      carePlan: carePlan || null, // Prise en charge
      conclusion: conclusion || null,
      prescriberName: prescriberName || req.user!.fullName,
      diagnoses: diagnoses || [],
      vitalSigns: vitalSigns || {},
      createdById: req.user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(consultations).values(newCons);

    // Mettre à jour le passage en cours
    await db.update(visits).set({ status: "EN_COURS", updatedAt: new Date() }).where(eq(visits.id, visitId));

    await auditServerAction({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "CONSULTATION_CREATED",
      entity: "Consultation",
      entityId: consultationId,
      details: `Consultation ${consultationCode} saisie par Dr. ${req.user!.fullName} (Motif : ${motif})`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, consultation: newCons });
  } catch (err) {
    console.error("[ClinicalRoutes] Erreur consultation:", err);
    return res.status(500).json({ success: false, error: "Erreur enregistrement consultation." });
  }
});

// ==========================================
// 3. SOINS INFIRMIERS & CONSTANTES
// ==========================================
router.get("/cares", requireAuth, requirePermission("CARE_READ"), async (req: AuthRequest, res) => {
  try {
    const list = await db.select().from(cares).orderBy(desc(cares.administeredAt)).limit(100);
    return res.json({ success: true, cares: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur soins." });
  }
});

router.post("/cares", requireAuth, requirePermission("CARE_WRITE"), async (req: AuthRequest, res) => {
  try {
    const { patientId, visitId, careType, notes, productsUsed, vitals } = req.body;
    if (!patientId || !careType) {
      return res.status(400).json({ success: false, error: "Patient et type de soin requis." });
    }

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(cares);
    const count = Number(countResult[0]?.count || 0) + 1;
    const careCode = `CARE-2026-${count.toString().padStart(4, "0")}`;
    const careId = `care-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newCare = {
      id: careId,
      careCode,
      patientId,
      visitId: visitId || null,
      careType,
      notes: notes || null,
      productsUsed: productsUsed || [],
      vitals: vitals || {},
      performedById: req.user!.id,
      performedByName: req.user!.fullName,
      administeredAt: new Date(),
      createdAt: new Date(),
    };

    await db.insert(cares).values(newCare);

    await auditServerAction({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "CARE_ADMINISTERED",
      entity: "Care",
      entityId: careId,
      details: `Soin ${careType} administré par ${req.user!.fullName}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, care: newCare });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur soin." });
  }
});

// ==========================================
// 4. RENDEZ-VOUS
// ==========================================
router.get("/appointments", requireAuth, requirePermission("APPOINTMENT_READ"), async (req: AuthRequest, res) => {
  try {
    const list = await db.select().from(appointments).orderBy(desc(appointments.appointmentDate)).limit(100);
    return res.json({ success: true, appointments: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur rendez-vous." });
  }
});

router.post("/appointments", requireAuth, requirePermission("APPOINTMENT_CREATE"), async (req: AuthRequest, res) => {
  try {
    const { patientId, practitionerId, practitionerName, appointmentDate, appointmentTime, service, reason } = req.body;

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(appointments);
    const count = Number(countResult[0]?.count || 0) + 1;
    const appointmentCode = `RDV-2026-${count.toString().padStart(4, "0")}`;
    const appointmentId = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newApt = {
      id: appointmentId,
      appointmentCode,
      patientId,
      practitionerId: practitionerId || null,
      practitionerName: practitionerName || "Praticien FONA",
      appointmentDate,
      appointmentTime,
      service,
      reason,
      status: "PLANIFIE",
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(appointments).values(newApt);
    return res.status(201).json({ success: true, appointment: newApt });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur création rendez-vous." });
  }
});

// ==========================================
// 5. MATERNITÉ & CPN & ACCOUCHEMENTS
// ==========================================
router.get("/maternity/pregnancies", requireAuth, requirePermission("MATERNITY_READ"), async (req: AuthRequest, res) => {
  try {
    const list = await db.select().from(pregnancies).orderBy(desc(pregnancies.createdAt));
    return res.json({ success: true, pregnancies: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur grossesses." });
  }
});

router.post("/maternity/pregnancies", requireAuth, requirePermission("MATERNITY_CREATE"), async (req: AuthRequest, res) => {
  try {
    const { patientId, lmpDate, eddDate, gravidity, parity, abortions, livingChildren, riskLevel, notes } = req.body;
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(pregnancies);
    const count = Number(countResult[0]?.count || 0) + 1;
    const pregnancyCode = `GROSS-2026-${count.toString().padStart(4, "0")}`;
    const id = `preg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newPreg = {
      id,
      pregnancyCode,
      patientId,
      lmpDate: lmpDate || null,
      eddDate: eddDate || null,
      gravidity: gravidity ? Number(gravidity) : 1,
      parity: parity ? Number(parity) : 0,
      abortions: abortions ? Number(abortions) : 0,
      livingChildren: livingChildren ? Number(livingChildren) : 0,
      status: "EN_COURS",
      riskLevel: riskLevel || "BAS",
      notes: notes || null,
      createdById: req.user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(pregnancies).values(newPreg);
    return res.status(201).json({ success: true, pregnancy: newPreg });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur dossier grossesse." });
  }
});

router.get("/maternity/cpn", requireAuth, requirePermission("MATERNITY_READ"), async (req: AuthRequest, res) => {
  try {
    const list = await db.select().from(prenatalVisits).orderBy(desc(prenatalVisits.visitDate));
    return res.json({ success: true, prenatalVisits: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur CPN." });
  }
});

router.post("/maternity/cpn", requireAuth, requirePermission("MATERNITY_CREATE"), async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(prenatalVisits);
    const count = Number(countResult[0]?.count || 0) + 1;
    const cpnCode = `CPN-2026-${count.toString().padStart(4, "0")}`;
    const id = `cpn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newCpn = {
      id,
      cpnCode,
      pregnancyId: data.pregnancyId,
      patientId: data.patientId,
      cpnNumber: Number(data.cpnNumber),
      visitDate: data.visitDate,
      gestationalAgeWeeks: data.gestationalAgeWeeks ? Number(data.gestationalAgeWeeks) : null,
      fundalHeightCm: data.fundalHeightCm ? Number(data.fundalHeightCm) : null,
      presentation: data.presentation || null,
      fetalHeartRateBpm: data.fetalHeartRateBpm ? Number(data.fetalHeartRateBpm) : null,
      bloodPressure: data.bloodPressure || null,
      weightKg: data.weightKg ? data.weightKg.toString() : null,
      proteinuria: data.proteinuria || null,
      glycosuria: data.glycosuria || null,
      ironFolicPrescribed: data.ironFolicPrescribed !== false,
      spDose: data.spDose || null,
      remarks: data.remarks || null,
      nextAppointmentDate: data.nextAppointmentDate || null,
      performedById: req.user!.id,
      performedByName: req.user!.fullName,
      createdAt: new Date(),
    };

    await db.insert(prenatalVisits).values(newCpn);
    return res.status(201).json({ success: true, prenatalVisit: newCpn });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur enregistrement CPN." });
  }
});

router.get("/maternity/deliveries", requireAuth, requirePermission("MATERNITY_READ"), async (req: AuthRequest, res) => {
  try {
    const list = await db.select().from(deliveries).orderBy(desc(deliveries.deliveryDate));
    return res.json({ success: true, deliveries: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur accouchements." });
  }
});

router.post("/maternity/deliveries", requireAuth, requirePermission("MATERNITY_CREATE"), async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(deliveries);
    const count = Number(countResult[0]?.count || 0) + 1;
    const deliveryCode = `ACC-2026-${count.toString().padStart(4, "0")}`;
    const id = `del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newDelivery = {
      id,
      deliveryCode,
      pregnancyId: data.pregnancyId,
      patientId: data.patientId,
      deliveryDate: data.deliveryDate,
      deliveryTime: data.deliveryTime,
      deliveryType: data.deliveryType || "EUTOCIQUE",
      episiotomy: !!data.episiotomy,
      perinealTear: data.perinealTear || null,
      placentaComplete: data.placentaComplete !== false,
      bloodLossMl: data.bloodLossMl ? Number(data.bloodLossMl) : 200,
      complications: data.complications || null,
      newbornSex: data.newbornSex || "MALE",
      newbornWeightG: data.newbornWeightG ? Number(data.newbornWeightG) : 3200,
      apgar1Min: data.apgar1Min ? Number(data.apgar1Min) : 9,
      apgar5Min: data.apgar5Min ? Number(data.apgar5Min) : 10,
      newbornStatus: data.newbornStatus || "VIVANT_BIEN_PORTANT",
      birthAttendantId: req.user!.id,
      birthAttendantName: req.user!.fullName,
      notes: data.notes || null,
      createdAt: new Date(),
    };

    await db.insert(deliveries).values(newDelivery);
    // Marquer la grossesse accouchée
    await db.update(pregnancies).set({ status: "ACCOUCHEE", updatedAt: new Date() }).where(eq(pregnancies.id, data.pregnancyId));

    return res.status(201).json({ success: true, delivery: newDelivery });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur accouchement." });
  }
});

// ==========================================
// 6. LABORATOIRE & IMAGERIE
// ==========================================
router.get("/lab/catalog", requireAuth, async (_req, res) => {
  try {
    const list = await db.select().from(labCatalog).orderBy(labCatalog.category, labCatalog.name);
    return res.json({ success: true, catalog: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur catalogue." });
  }
});

router.get("/lab/requests", requireAuth, requirePermission("LAB_READ"), async (_req, res) => {
  try {
    const list = await db.select().from(labRequests).orderBy(desc(labRequests.requestedAt)).limit(100);
    return res.json({ success: true, labRequests: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur demandes labo." });
  }
});

router.post("/lab/requests", requireAuth, requirePermission("LAB_CREATE"), async (req: AuthRequest, res) => {
  try {
    const { patientId, visitId, tests, priority } = req.body;
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(labRequests);
    const count = Number(countResult[0]?.count || 0) + 1;
    const labCode = `LAB-2026-${count.toString().padStart(4, "0")}`;
    const id = `lab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newReq = {
      id,
      labCode,
      patientId,
      visitId: visitId || null,
      requestedById: req.user!.id,
      requestedByName: req.user!.fullName,
      priority: priority || "NORMALE",
      status: "DEMANDE",
      tests: tests || [],
      requestedAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(labRequests).values(newReq);
    return res.status(201).json({ success: true, labRequest: newReq });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur demande labo." });
  }
});

router.put("/lab/requests/:id/results", requireAuth, requirePermission("LAB_WRITE"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { tests, resultReport } = req.body;

    await db
      .update(labRequests)
      .set({
        tests,
        resultReport,
        status: "EN_COURS",
        updatedAt: new Date(),
      })
      .where(eq(labRequests.id, id));

    return res.json({ success: true, message: "Résultats saisis." });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur saisie résultats." });
  }
});

router.put("/lab/requests/:id/validate", requireAuth, requirePermission("LAB_VALIDATE"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await db
      .update(labRequests)
      .set({
        status: "VALIDE",
        validatorName: req.user!.fullName,
        validatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(labRequests.id, id));

    return res.json({ success: true, message: "Bilan validé." });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur validation labo." });
  }
});

router.get("/imaging/requests", requireAuth, requirePermission("IMAGING_READ"), async (_req, res) => {
  try {
    const list = await db.select().from(imagingRequests).orderBy(desc(imagingRequests.requestedAt)).limit(100);
    return res.json({ success: true, imagingRequests: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Erreur imagerie." });
  }
});

export default router;
