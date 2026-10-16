import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ==========================================
// 1. UTILISATEURS & SESSIONS (RBAC SÉCURISÉ)
// ==========================================
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull().unique(),
    fullName: text("full_name").notNull(),
    role: text("role").notNull(), // ADMIN, PRACTITIONER, NURSE, MIDWIFE, RECEPTION_CAISSE
    department: text("department").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone").notNull(),
    avatarVariant: text("avatar_variant").default("doctor"),
    status: text("status").default("ACTIF"), // ACTIF, SUSPENDU, ARCHIVE
    passwordHash: text("password_hash").notNull(),
    passwordSalt: text("password_salt").notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_users_role").on(table.role),
    index("idx_users_status").on(table.status),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow().notNull(),
    isRevoked: boolean("is_revoked").default(false).notNull(),
  },
  (table) => [
    index("idx_sessions_token").on(table.token),
    index("idx_sessions_user").on(table.userId),
  ]
);

// ==========================================
// 2. DOSSIER PATIENT PERMANENT (PATIENTS)
// ==========================================
export const patients = pgTable(
  "patients",
  {
    id: text("id").primaryKey(),
    patientCode: text("patient_code").notNull().unique(), // ex: PAT-2026-0001
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    sex: text("sex").notNull(), // MALE, FEMALE, OTHER
    birthDate: text("birth_date"), // YYYY-MM-DD
    phone: text("phone"),
    address: text("address"),
    bloodGroup: text("blood_group"), // A+, B+, O+, etc.
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),
    isArchived: boolean("is_archived").default(false).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedReason: text("archived_reason"),
    createdById: text("created_by_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_patients_code").on(table.patientCode),
    index("idx_patients_phone").on(table.phone),
    index("idx_patients_name").on(table.lastName, table.firstName),
    index("idx_patients_archived").on(table.isArchived),
  ]
);

export const patientAllergies = pgTable(
  "patient_allergies",
  {
    id: text("id").primaryKey(),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    allergen: text("allergen").notNull(),
    severity: text("severity").default("MODEREE"), // LEGERE, MODEREE, SEVERE
    reaction: text("reaction"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_allergies_patient").on(table.patientId)]
);

export const patientHistories = pgTable(
  "patient_histories",
  {
    id: text("id").primaryKey(),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    category: text("category").notNull(), // MEDICAL, CHIRURGICAL, FAMILIAL, GYNECO
    condition: text("condition").notNull(),
    year: integer("year"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_histories_patient").on(table.patientId)]
);

// ==========================================
// 3. PASSAGES MÉDICAUX (VISITS)
// ==========================================
export const visits = pgTable(
  "visits",
  {
    id: text("id").primaryKey(),
    visitCode: text("visit_code").notNull().unique(), // ex: VIS-2026-0001
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    type: text("type").notNull(), // CONSULTATION, SOIN, URGENCE, CPN, MATERNITE, LABORATOIRE, IMAGERIE
    status: text("status").default("EN_ATTENTE").notNull(), // EN_ATTENTE, EN_COURS, TERMINE, ANNULE
    reason: text("reason").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdById: text("created_by_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_visits_code").on(table.visitCode),
    index("idx_visits_patient").on(table.patientId),
    index("idx_visits_status").on(table.status),
    index("idx_visits_started").on(table.startedAt),
  ]
);

// ==========================================
// 4. CONSULTATIONS CLINIQUES & DIAGNOSTICS
// ==========================================
export const consultations = pgTable(
  "consultations",
  {
    id: text("id").primaryKey(),
    consultationCode: text("consultation_code").notNull().unique(), // ex: CONS-2026-0001
    visitId: text("visit_id")
      .notNull()
      .references(() => visits.id, { onDelete: "restrict" }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    motif: text("motif").notNull(),
    clinicalHistory: text("clinical_history"), // Histoire de la maladie
    clinicalExam: text("clinical_exam"), // Examen clinique / Signes cliniques
    carePlan: text("care_plan"), // Conduite à tenir / Prise en charge
    conclusion: text("conclusion"),
    prescriberName: text("prescriber_name"),
    diagnoses: jsonb("diagnoses").default([]), // [{ name, code, isPrimary, startDate, endDate, notes }]
    vitalSigns: jsonb("vital_signs").default({}), // snapshot des constantes
    createdById: text("created_by_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_consultations_code").on(table.consultationCode),
    index("idx_consultations_patient").on(table.patientId),
    index("idx_consultations_visit").on(table.visitId),
  ]
);

// ==========================================
// 5. CONSTANTES VITALES MULTIPLES
// ==========================================
export const vitalSignsRecords = pgTable(
  "vital_signs_records",
  {
    id: text("id").primaryKey(),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    visitId: text("visit_id").references(() => visits.id, { onDelete: "set null" }),
    consultationId: text("consultation_id").references(() => consultations.id, { onDelete: "set null" }),
    temperature: numeric("temperature", { precision: 4, scale: 1 }), // °C
    systolicBP: integer("systolic_bp"), // mmHg
    diastolicBP: integer("diastolic_bp"), // mmHg
    heartRate: integer("heart_rate"), // bpm
    respiratoryRate: integer("respiratory_rate"), // cpm
    oxygenSaturation: integer("oxygen_saturation"), // %
    weight: numeric("weight", { precision: 5, scale: 2 }), // kg
    height: numeric("height", { precision: 5, scale: 2 }), // cm
    bmi: numeric("bmi", { precision: 4, scale: 1 }),
    bloodSugar: numeric("blood_sugar", { precision: 5, scale: 2 }), // g/L
    notes: text("notes"),
    measuredById: text("measured_by_id"),
    measuredByName: text("measured_by_name"),
    measuredAt: timestamp("measured_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_vitals_patient").on(table.patientId),
    index("idx_vitals_measured").on(table.measuredAt),
  ]
);

// ==========================================
// 6. SOINS INFIRMIERS
// ==========================================
export const cares = pgTable(
  "cares",
  {
    id: text("id").primaryKey(),
    careCode: text("care_code").notNull().unique(), // ex: CARE-2026-0001
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    visitId: text("visit_id").references(() => visits.id, { onDelete: "set null" }),
    careType: text("care_type").notNull(), // Pansement, Injection, Perfusion, etc.
    notes: text("notes"),
    productsUsed: jsonb("products_used").default([]), // [{ name, quantity, source: 'FONA' | 'PATIENT' }]
    vitals: jsonb("vitals").default({}),
    performedById: text("performed_by_id"),
    performedByName: text("performed_by_name"),
    administeredAt: timestamp("administered_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_cares_code").on(table.careCode),
    index("idx_cares_patient").on(table.patientId),
  ]
);

// ==========================================
// 7. RENDEZ-VOUS
// ==========================================
export const appointments = pgTable(
  "appointments",
  {
    id: text("id").primaryKey(),
    appointmentCode: text("appointment_code").notNull().unique(), // ex: RDV-2026-0001
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    practitionerId: text("practitioner_id"),
    practitionerName: text("practitioner_name"),
    appointmentDate: text("appointment_date").notNull(), // YYYY-MM-DD
    appointmentTime: text("appointment_time").notNull(), // HH:mm
    service: text("service").notNull(),
    reason: text("reason").notNull(),
    status: text("status").default("PLANIFIE").notNull(), // PLANIFIE, CONFIRME, EFFECTUE, ANNULE, ABSENT
    reminderSent: boolean("reminder_sent").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_appointments_code").on(table.appointmentCode),
    index("idx_appointments_patient").on(table.patientId),
    index("idx_appointments_date").on(table.appointmentDate),
  ]
);

// ==========================================
// 8. MATERNITÉ & SUIVI OBSTÉTRICAL
// ==========================================
export const pregnancies = pgTable(
  "pregnancies",
  {
    id: text("id").primaryKey(),
    pregnancyCode: text("pregnancy_code").notNull().unique(), // ex: GROSS-2026-0001
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    lmpDate: text("lmp_date"), // DDR (Dernières Règles) YYYY-MM-DD
    eddDate: text("edd_date"), // DPA (Terme Prévu) YYYY-MM-DD
    gravidity: integer("gravidity").default(1), // Nombre de gestes
    parity: integer("parity").default(0), // Nombre de pares
    abortions: integer("abortions").default(0),
    livingChildren: integer("living_children").default(0),
    status: text("status").default("EN_COURS").notNull(), // EN_COURS, ACCOUCHEE, INTERROMPUE
    riskLevel: text("risk_level").default("BAS"), // BAS, MOYEN, ELEVE
    notes: text("notes"),
    createdById: text("created_by_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_pregnancies_code").on(table.pregnancyCode),
    index("idx_pregnancies_patient").on(table.patientId),
  ]
);

export const prenatalVisits = pgTable(
  "prenatal_visits",
  {
    id: text("id").primaryKey(),
    cpnCode: text("cpn_code").notNull().unique(), // ex: CPN-2026-0001
    pregnancyId: text("pregnancy_id")
      .notNull()
      .references(() => pregnancies.id, { onDelete: "cascade" }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    cpnNumber: integer("cpn_number").notNull(), // 1, 2, 3, 4, etc.
    visitDate: text("visit_date").notNull(),
    gestationalAgeWeeks: integer("gestational_age_weeks"),
    fundalHeightCm: integer("fundal_height_cm"),
    presentation: text("presentation"),
    fetalHeartRateBpm: integer("fetal_heart_rate_bpm"),
    bloodPressure: text("blood_pressure"),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    proteinuria: text("proteinuria"),
    glycosuria: text("glycosuria"),
    ironFolicPrescribed: boolean("iron_folic_prescribed").default(true),
    spDose: text("sp_dose"), // TPI Palu / Sulfadoxine-Pyriméthamine
    remarks: text("remarks"),
    nextAppointmentDate: text("next_appointment_date"),
    performedById: text("performed_by_id"),
    performedByName: text("performed_by_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_cpn_code").on(table.cpnCode),
    index("idx_cpn_pregnancy").on(table.pregnancyId),
    index("idx_cpn_patient").on(table.patientId),
  ]
);

export const deliveries = pgTable(
  "deliveries",
  {
    id: text("id").primaryKey(),
    deliveryCode: text("delivery_code").notNull().unique(), // ex: ACC-2026-0001
    pregnancyId: text("pregnancy_id")
      .notNull()
      .references(() => pregnancies.id, { onDelete: "restrict" }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    deliveryDate: text("delivery_date").notNull(),
    deliveryTime: text("delivery_time").notNull(),
    deliveryType: text("delivery_type").default("EUTOCIQUE"), // EUTOCIQUE, DYSTOCIQUE, CESARIENNE
    episiotomy: boolean("episiotomy").default(false),
    perinealTear: text("perineal_tear"),
    placentaComplete: boolean("placenta_complete").default(true),
    bloodLossMl: integer("blood_loss_ml").default(200),
    complications: text("complications"),
    newbornSex: text("newborn_sex").default("MALE"),
    newbornWeightG: integer("newborn_weight_g").default(3200),
    apgar1Min: integer("apgar_1min").default(9),
    apgar5Min: integer("apgar_5min").default(10),
    newbornStatus: text("newborn_status").default("VIVANT_BIEN_PORTANT"),
    birthAttendantId: text("birth_attendant_id"),
    birthAttendantName: text("birth_attendant_name"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_deliveries_code").on(table.deliveryCode),
    index("idx_deliveries_pregnancy").on(table.pregnancyId),
    index("idx_deliveries_patient").on(table.patientId),
  ]
);

// ==========================================
// 9. LABORATOIRE & IMAGERIE
// ==========================================
export const labCatalog = pgTable(
  "lab_catalog",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(), // NFS, TDR-PALU, GLY, etc.
    name: text("name").notNull(),
    category: text("category").notNull(), // HEMATOLOGIE, BIOCHIMIE, etc.
    sampleType: text("sample_type").notNull(),
    defaultReferenceRange: text("default_reference_range"),
    defaultUnit: text("default_unit"),
    priceFcfa: integer("price_fcfa").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_lab_catalog_code").on(table.code),
    index("idx_lab_catalog_cat").on(table.category),
  ]
);

export const labRequests = pgTable(
  "lab_requests",
  {
    id: text("id").primaryKey(),
    labCode: text("lab_code").notNull().unique(), // ex: LAB-2026-0001
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    visitId: text("visit_id").references(() => visits.id, { onDelete: "set null" }),
    requestedById: text("requested_by_id"),
    requestedByName: text("requested_by_name"),
    priority: text("priority").default("NORMALE"), // NORMALE, URGENTE
    status: text("status").default("DEMANDE").notNull(), // DEMANDE, EN_COURS, VALIDE, TERMINE
    tests: jsonb("tests").default([]), // [{ testId, code, name, resultValue, unit, referenceRange, isAbnormal, notes }]
    resultReport: text("result_report"),
    validatorName: text("validator_name"),
    validatedAt: timestamp("validated_at", { withTimezone: true }),
    documentName: text("document_name"),
    requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_lab_requests_code").on(table.labCode),
    index("idx_lab_requests_patient").on(table.patientId),
    index("idx_lab_requests_status").on(table.status),
  ]
);

export const imagingRequests = pgTable(
  "imaging_requests",
  {
    id: text("id").primaryKey(),
    imagingCode: text("imaging_code").notNull().unique(), // ex: IMG-2026-0001
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    visitId: text("visit_id").references(() => visits.id, { onDelete: "set null" }),
    examType: text("exam_type").notNull(), // RADIOGRAPHIE, ECHOGRAPHIE
    bodyRegion: text("body_region").notNull(),
    clinicalIndication: text("clinical_indication").notNull(),
    priority: text("priority").default("NORMALE"),
    status: text("status").default("DEMANDE").notNull(), // DEMANDE, EN_COURS, REALISE, VALIDE
    findings: text("findings"),
    conclusion: text("conclusion"),
    radiologistName: text("radiologist_name"),
    performedAt: timestamp("performed_at", { withTimezone: true }),
    requestedById: text("requested_by_id"),
    requestedByName: text("requested_by_name"),
    requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_imaging_requests_code").on(table.imagingCode),
    index("idx_imaging_requests_patient").on(table.patientId),
  ]
);

// ==========================================
// 10. CAISSE & FINANCES (TRANSACTIONS ACID)
// ==========================================
export const invoices = pgTable(
  "invoices",
  {
    id: text("id").primaryKey(),
    invoiceCode: text("invoice_code").notNull().unique(), // ex: FAC-2026-0001
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    visitId: text("visit_id").references(() => visits.id, { onDelete: "set null" }),
    totalAmount: integer("total_amount").notNull(), // Montant en FCFA
    paidAmount: integer("paid_amount").default(0).notNull(),
    balance: integer("balance").notNull(), // totalAmount - paidAmount
    status: text("status").default("IMPAYE").notNull(), // IMPAYE, PARTIEL, PAYE, ANNULE
    items: jsonb("items").default([]), // [{ description, category, unitPrice, quantity, total }]
    createdById: text("created_by_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_invoices_code").on(table.invoiceCode),
    index("idx_invoices_patient").on(table.patientId),
    index("idx_invoices_status").on(table.status),
  ]
);

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),
    paymentCode: text("payment_code").notNull().unique(), // ex: REC-2026-0001
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "restrict" }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    amount: integer("amount").notNull(), // Montant versé en FCFA
    paymentMethod: text("payment_method").notNull(), // ESPECES, ORANGE_MONEY, MOOV_MONEY, CARTE, VIREMENT
    transactionRef: text("transaction_ref"), // Référence externe Mobile Money / Banque
    idempotencyKey: text("idempotency_key").unique(), // Protection anti-double clic
    notes: text("notes"),
    receivedById: text("received_by_id"),
    receivedByName: text("received_by_name"),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_payments_code").on(table.paymentCode),
    uniqueIndex("idx_payments_idempotency").on(table.idempotencyKey),
    index("idx_payments_invoice").on(table.invoiceId),
    index("idx_payments_patient").on(table.patientId),
  ]
);

// ==========================================
// 11. AUDIT & JOURNALISATION SÉCURISÉE
// ==========================================
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull(),
    userRole: text("user_role").notNull(),
    siteId: text("site_id").default("site-plateau").notNull(),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    details: text("details").notNull(),
    ipAddress: text("ip_address"),
  },
  (table) => [
    index("idx_audit_timestamp").on(table.timestamp),
    index("idx_audit_user").on(table.userId),
    index("idx_audit_action").on(table.action),
  ]
);

// ==========================================
// 12. PARAMÈTRES SYSTÈME CENTRALISÉS
// ==========================================
export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(), // 'central_config'
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  updatedBy: text("updated_by").notNull(),
});

// ==========================================
// RELATIONS DRIZZLE ORM
// ==========================================
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  allergies: many(patientAllergies),
  histories: many(patientHistories),
  visits: many(visits),
  consultations: many(consultations),
  vitalSigns: many(vitalSignsRecords),
  cares: many(cares),
  appointments: many(appointments),
  pregnancies: many(pregnancies),
  labRequests: many(labRequests),
  imagingRequests: many(imagingRequests),
  invoices: many(invoices),
  payments: many(payments),
}));

export const visitsRelations = relations(visits, ({ one, many }) => ({
  patient: one(patients, {
    fields: [visits.patientId],
    references: [patients.id],
  }),
  consultations: many(consultations),
  vitalSigns: many(vitalSignsRecords),
  cares: many(cares),
  labRequests: many(labRequests),
  imagingRequests: many(imagingRequests),
  invoices: many(invoices),
}));

export const consultationsRelations = relations(consultations, ({ one }) => ({
  visit: one(visits, {
    fields: [consultations.visitId],
    references: [visits.id],
  }),
  patient: one(patients, {
    fields: [consultations.patientId],
    references: [patients.id],
  }),
}));

export const pregnanciesRelations = relations(pregnancies, ({ one, many }) => ({
  patient: one(patients, {
    fields: [pregnancies.patientId],
    references: [patients.id],
  }),
  prenatalVisits: many(prenatalVisits),
  deliveries: many(deliveries),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  patient: one(patients, {
    fields: [invoices.patientId],
    references: [patients.id],
  }),
  visit: one(visits, {
    fields: [invoices.visitId],
    references: [visits.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  patient: one(patients, {
    fields: [payments.patientId],
    references: [patients.id],
  }),
}));
