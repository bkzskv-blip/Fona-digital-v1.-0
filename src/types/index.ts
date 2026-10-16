export type Role =
  | "ADMIN"
  | "RECEPTION_CAISSE"
  | "PRACTITIONER"
  | "NURSE"
  | "MIDWIFE"
  | "LAB"
  | "IMAGING";

export type AnimationMode = "full" | "reduced" | "disabled";
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type Permission =
  // Dossier Patient
  | "PATIENT_READ"
  | "PATIENT_WRITE"
  | "PATIENT_CREATE"
  | "PATIENT_UPDATE"
  | "PATIENT_ARCHIVE"
  | "PATIENT_PRINT"
  // Consultations & Diagnostics
  | "CONSULTATION_READ"
  | "CONSULTATION_WRITE"
  | "CONSULTATION_CREATE"
  | "CONSULTATION_UPDATE"
  | "CONSULTATION_VALIDATE"
  | "CONSULTATION_PRINT"
  | "PRESCRIPTION_WRITE"
  // Soins & Constantes
  | "CARE_READ"
  | "CARE_WRITE"
  | "CARE_CREATE"
  | "CARE_UPDATE"
  | "CARE_PRINT"
  | "VITALS_WRITE"
  // Maternité & Obstétrique
  | "MATERNITY_READ"
  | "MATERNITY_WRITE"
  | "MATERNITY_CREATE"
  | "MATERNITY_UPDATE"
  | "MATERNITY_VALIDATE"
  | "MATERNITY_PRINT"
  // Laboratoire
  | "LAB_READ"
  | "LAB_WRITE"
  | "LAB_CREATE"
  | "LAB_VALIDATE"
  | "LAB_PRINT"
  // Imagerie
  | "IMAGING_READ"
  | "IMAGING_WRITE"
  | "IMAGING_CREATE"
  | "IMAGING_VALIDATE"
  | "IMAGING_PRINT"
  // Rendez-vous & Accueil
  | "APPOINTMENT_READ"
  | "APPOINTMENT_CREATE"
  | "APPOINTMENT_UPDATE"
  | "VISIT_CREATE"
  // Caisse & Règlements
  | "CAISSE_READ"
  | "CAISSE_CREATE"
  | "CAISSE_VALIDATE"
  | "CAISSE_PRINT"
  | "CAISSE_PARTIAL"
  | "PAYMENT_WRITE"
  // Données Financières Globales
  | "FINANCE_READ"
  // Rapports & Statistiques
  | "REPORT_READ"
  | "REPORT_EXPORT"
  // Administration & Sécurité
  | "ADMIN_WRITE"
  | "ADMIN_USER_CREATE"
  | "ADMIN_USER_UPDATE"
  | "ADMIN_USER_DISABLE"
  | "ADMIN_PERMISSIONS_MANAGE"
  | "ADMIN_SETTINGS_MANAGE"
  | "ADMIN_AUDIT_READ"
  | "ADMIN_BACKUP_MANAGE";

export type UserStatus = "ACTIF" | "INACTIF" | "SUSPENDU";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  clinicSiteId: string;
  department: string;
  email: string;
  phone: string;
  avatarVariant: "doctor" | "nurse" | "midwife" | "reception" | "admin" | "lab" | "imaging";
  status?: UserStatus;
  password?: string;
  isFirstLogin?: boolean;
  lastLoginAt?: string;
  lastActivityAt?: string;
  createdAt?: string;
  exceptionalPermissions?: Permission[]; // Droits accordés en plus du rôle
  revokedPermissions?: Permission[]; // Droits explicitement révoqués
}

export interface MedicalService {
  id: string;
  code: string;
  name: string;
  description: string;
  headOfDepartment: string;
  status: "ACTIF" | "INACTIF";
  patientCapacity?: number;
  color: string;
}

export interface TariffItem {
  id: string;
  code: string;
  name: string;
  category: "CONSULTATION" | "MATERNITE" | "IMAGERIE" | "LABORATOIRE" | "SOINS" | "URGENCE" | "AUTRE";
  priceFCFA: number;
  status: "ACTIF" | "ARCHIVE";
  effectiveDate: string;
  notes?: string;
}

export type DashboardWidgetId =
  | "total_patients"
  | "today_consultations"
  | "active_visits"
  | "upcoming_appointments"
  | "total_revenue"
  | "unpaid_invoices"
  | "pending_cares"
  | "active_pregnancies"
  | "pending_labs"
  | "pending_imaging"
  | "triage_alerts"
  | "service_occupancy"
  | "cpn_attendance"
  | "urgent_labs"
  | "wait_time_avg"
  | "daily_collection_rate";

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  label: string;
  description: string;
  category: "patients" | "medical" | "rdv" | "finance" | "maternite" | "examens";
  requiredPermission?: Permission;
  rolesRecommended: Role[];
  defaultVisible: boolean;
}

export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  device: string;
  browser: string;
  ipAddress: string;
  siteId: string;
  siteName: string;
  loginAt: string;
  lastActivityAt: string;
  isCurrent: boolean;
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  type: "AUTOMATIQUE" | "MANUELLE";
  status: "REUSSIE" | "EN_COURS" | "ECHEC";
  sizeMb: number;
  durationSeconds: number;
  checksumSha256: string;
  fileName: string;
  encryption?: string;
  keySource?: string;
  offsiteReplicated?: boolean;
  offsiteStatus?: string;
  offsiteLocation?: string;
  gcsUri?: string;
  totalRecords?: number;
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  maxFailedAttempts: number;
  passwordMinLength: number;
  requireSpecialChar: boolean;
  requireNumbers: boolean;
  twoFactorAuthEnabled: boolean;
  ipWhitelistEnabled: boolean;
  auditLogRetentionDays: number;
}

export interface DocumentTemplateConfig {
  showOfficialLogo: boolean;
  showInstitutionHeader: boolean;
  showWatermark: boolean;
  defaultPaperFormat: "A4" | "A5" | "TICKET_80MM";
  includePractitionerSignature: boolean;
  officialMention: string;
  patientIdPrefix: string;
  consultationIdPrefix: string;
  invoiceIdPrefix: string;
}

export interface ClinicSite {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  isCentral: boolean;
  syncStatus: "synced" | "pending" | "syncing" | "offline";
  lastSyncAt: string;
  dataRecordsCount: number;
  pendingSyncCount: number;
}

export interface SyncEvent {
  id: string;
  sourceSiteId: string;
  targetSiteId: string;
  entityType: "PATIENT" | "VISIT" | "CONSULTATION" | "PAYMENT" | "CARE" | "LAB" | "MATERNITY";
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  payloadSummary: string;
  timestamp: string;
  status: "synced" | "queued" | "conflict_resolved";
}

export type Sex = "MALE" | "FEMALE";

export interface Patient {
  id: string;
  patientCode: string; // e.g. PAT-2026-0001
  siteId: string;
  firstName: string;
  lastName: string;
  sex: Sex;
  birthDate: string;
  phone: string;
  address: string;
  profession?: string;
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  allergies: string[];
  medicalHistory: string[];
  surgicalHistory: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export type VisitType = "CONSULTATION" | "SOIN" | "MATERNITE" | "LABORATOIRE" | "IMAGERIE" | "URGENCE";
export type VisitStatus = "EN_ATTENTE" | "EN_COURS" | "TERMINE" | "ANNULE";

export interface Visit {
  id: string;
  visitCode: string; // e.g. VIS-2026-0001
  patientId: string;
  siteId: string;
  type: VisitType;
  status: VisitStatus;
  queueNumber: string;
  priority: "NORMALE" | "URGENTE";
  startedAt: string;
  endedAt?: string;
  createdById: string;
  createdByName: string;
  notes?: string;
}

export interface VitalSign {
  id: string;
  measuredAt: string;
  measuredBy: string;
  temperature?: number; // °C
  systolicBP?: number; // mmHg
  diastolicBP?: number; // mmHg
  heartRate?: number; // bpm
  respiratoryRate?: number; // cpm
  oxygenSaturation?: number; // % SpO2
  weight?: number; // kg
  height?: number; // cm
  bmi?: number; // kg/m2
  bloodGlucose?: number; // g/L
}

export interface Diagnosis {
  id: string;
  label: string;
  icdCode?: string;
  isPrimary: boolean;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ClinicalModificationRecord {
  id: string;
  fieldChanged: string; // Ex: "Diagnostic principal", "Conduite thérapeutique", "Conclusion clinique", "Examen clinique"
  previousValue: string;
  newValue: string;
  modifiedById: string;
  modifiedByName: string;
  modifiedByRole: Role;
  modifiedAt: string;
  reason: string; // Motif obligatoire de la modification clinique (traçabilité médicale)
}

export interface Consultation {
  id: string;
  consultationCode: string; // CONS-2026-0001
  visitId: string;
  patientId: string;
  siteId: string;
  practitionerId: string;
  practitionerName: string;
  motif: string;
  historyOfIllness: string;
  clinicalExam: string;
  vitalSigns: VitalSign[];
  diagnoses: Diagnosis[];
  carePlan: string;
  prescriberName?: string;
  prescriptions?: PrescriptionItem[];
  conclusion: string;
  complementaryExamsNotes?: string;
  status?: "BROUILLON" | "EN_COURS" | "TERMINE";
  createdAt: string;
  lastModifiedAt?: string;
  lastModifiedByName?: string;
  modificationHistory?: ClinicalModificationRecord[];
}

export interface CareProduct {
  name: string;
  source: "FONA" | "PATIENT";
  quantity: string;
}

export interface Care {
  id: string;
  careCode: string; // SOIN-2026-0001
  visitId: string;
  patientId: string;
  siteId: string;
  nurseId: string;
  nurseName: string;
  careType: string;
  productsUsed?: CareProduct[];
  observations: string;
  administeredAt: string;
}

export type AppointmentStatus =
  | "PREVU"
  | "CONFIRME"
  | "EN_ATTENTE"
  | "EFFECTUE"
  | "ANNULE"
  | "ABSENT";

export interface Appointment {
  id: string;
  appointmentCode: string; // RDV-2026-0001
  patientId: string;
  practitionerId: string;
  practitionerName: string;
  siteId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  durationMinutes: number;
  motif: string;
  status: AppointmentStatus;
  reminderOffsetMinutes: number;
  reminderSent: boolean;
  notes?: string;
}

export interface Pregnancy {
  id: string;
  pregnancyCode: string;
  patientId: string;
  siteId: string;
  lmpDate: string; // DDR
  eddDate: string; // DPA
  gravidity: number; // Gestité
  parity: number; // Parité
  abortions: number; // Avortements
  livingChildren: number; // Enfants vivants
  riskFactors: string[];
  status: "EN_COURS" | "ACCOUCHEE" | "INTERROMPUE";
  notes?: string;
  createdAt: string;
}

export interface PrenatalVisit {
  id: string;
  cpnCode: string; // CPN-1, CPN-2...
  pregnancyId: string;
  patientId: string;
  siteId: string;
  cpnNumber: number;
  date: string;
  gestationalAgeWeeks: number;
  weight: number;
  bloodPressure: string;
  fundalHeightCm: number;
  fetalHeartRateBpm: number;
  fetalMovement: boolean;
  edema: boolean;
  albuminuria: "NEGATIVE" | "TRACES" | "POSITIVE";
  glucosuria: "NEGATIVE" | "POSITIVE";
  ironPrescribed: boolean;
  ultrasoundDone: boolean;
  notes: string;
  midwifeName: string;
}

export interface Delivery {
  id: string;
  deliveryCode: string; // ACC-2026-0001
  pregnancyId: string;
  patientId: string;
  siteId: string;
  // Volet 1: Arrivée maternité
  arrivalDateTime: string;
  laborStage: string;
  cervicalDilationCm: number;
  membranesStatus: "INTACTES" | "ROMPUES";
  membraneRuptureDateTime?: string;
  presentation: "CEPHALIQUE" | "SIEGE" | "TRANSVERSE";
  // Volet 2: Après accouchement
  deliveryDateTime: string;
  deliveryType: "VOIE_BASSE" | "CESARIENNE" | "INSTRUMENTALE";
  babyGender: "GARCON" | "FILLE";
  babyWeightGrams: number;
  babyHeightCm: number;
  apgar1min: number;
  apgar5min: number;
  placentaDeliveryDateTime: string;
  placentaComplete: boolean;
  postpartumBloodLossMl: number;
  complications?: string;
  midwifeName: string;
}

export interface LabCatalogItem {
  id: string;
  code?: string;
  name: string;
  category: string; // e.g. "HÉMATOLOGIE" | "BIOCHIMIE" | "PARASITOLOGIE" | "MICROBIOLOGIE" | "IMMUNOLOGIE" | "SÉROLOGIE" | "AUTRE"
  sampleType?: string; // e.g. "Sang total (EDTA)", "Sérum", "Urine", "Selles"
  defaultReferenceRange?: string;
  defaultUnit?: string;
  priceFCFA?: number;
  isActive: boolean;
}

export interface LabTestItem {
  id: string;
  testName: string;
  category?: string;
  value?: string;
  referenceRange?: string;
  unit?: string;
  isAbnormal?: boolean;
  notes?: string;
}

export interface LabRequest {
  id: string;
  labCode: string; // LAB-2026-0001
  visitId: string;
  patientId: string;
  siteId: string;
  requesterName: string;
  priority: "NORMALE" | "URGENTE";
  status: "DEMANDE" | "EN_COURS" | "VALIDE" | "TERMINE";
  clinicalNotes: string;
  tests: LabTestItem[];
  resultReport?: string; // Compte rendu et conclusions biologiques
  documentName?: string; // Référence / document joint
  performedByName?: string; // Biologiste / Technicien
  requestedAt: string;
  validatedAt?: string;
  validatedBy?: string;
}

export interface ImagingRequest {
  id: string;
  imagingCode: string; // IMG-2026-0001
  visitId: string;
  patientId: string;
  siteId: string;
  requesterName: string;
  modality: "RADIOLOGIE" | "ECHOGRAPHIE" | "SCANNER" | "AUTRE";
  examName: string;
  indication: string;
  findings: string;
  conclusion: string;
  status: "DEMANDE" | "REALISE" | "VALIDE";
  requestedAt: string;
  completedAt?: string;
  radiologistName?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceCode: string; // FAC-2026-0001
  visitId: string;
  patientId: string;
  siteId: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: "IMPAYE" | "PARTIEL" | "PAYE";
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  receiptCode: string; // REC-2026-0001
  invoiceId: string;
  patientId: string;
  siteId: string;
  amount: number;
  paymentMethod: "ESPECES" | "MOBILE_MONEY" | "CARTE" | "VIREMENT";
  transactionRef?: string;
  receivedBy: string;
  paidAt: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  siteId: string;
  siteName: string;
  type:
    | "CONSULTATION"
    | "CARE"
    | "APPOINTMENT"
    | "LAB"
    | "IMAGING"
    | "CPN"
    | "DELIVERY"
    | "PAYMENT";
  occurredAt: string;
  title: string;
  subtitle?: string;
  description?: string;
  author: string;
  badgeColor?: string;
  rawItem?: any;
}

export interface BrandSettings {
  primaryLogo: string;
  secondaryLogo: string;
  compactLogo?: string;
  iconLogo: string;
  secondaryIconLogo: string;
  activePrimaryChoice: "secondary_design" | "official_cross";
  organizationName: string;
  shortName: string;
  slogan: string;
  primaryColor: string;
  secondaryColor: string;
  cyanColor: string;
  goldColor: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  currentTheme: "dark" | "light";
  themeMode?: ThemeMode;
  defaultCabinetTheme?: ThemeMode;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  siteId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

export type DateFormatPattern = "dd/MM/yyyy" | "yyyy-MM-dd" | "MM/dd/yyyy";
export type TimeFormatPattern = "24h" | "12h";
export type WeekStartsOn = "monday" | "sunday";
export type CalendarType = "gregory";

export interface RegionalSettings {
  country: string; // "ML"
  locale: string; // "fr-ML"
  language: string; // "fr"
  currency: string; // "XOF"
  currencyDisplay: string; // "FCFA"
  timezone: string; // "Africa/Bamako"
  dateFormat: DateFormatPattern; // "dd/MM/yyyy"
  timeFormat: TimeFormatPattern; // "24h"
  weekStartsOn: WeekStartsOn; // "monday"
  calendar: CalendarType; // "gregory"
  phoneCountryCode: string; // "+223"
}

export type SettingsCategoryKey =
  | "generalBrand"
  | "appearanceTheme"
  | "regional"
  | "documentsNumbering"
  | "securitySessions"
  | "backupsMaintenance"
  | "technicalConfig";

export interface CentralizedSettings {
  generalBrand: BrandSettings & {
    emergencyPhone?: string;
    directorName?: string;
  };
  appearanceTheme: {
    defaultCabinetTheme: "system" | "dark" | "light";
    liquidGlassIntensity: "balanced" | "high" | "subtle";
    animationMode: AnimationMode;
    density: "comfortable" | "compact";
    contrastMode: "standard" | "high_contrast";
  };
  regional: RegionalSettings;
  documentsNumbering: DocumentTemplateConfig & {
    footerLegalText?: string;
    visitIdPrefix?: string;
    receiptIdPrefix?: string;
    labIdPrefix?: string;
    imagingIdPrefix?: string;
    nextPatientSeq?: number;
    nextConsultationSeq?: number;
    nextInvoiceSeq?: number;
  };
  securitySessions: SecuritySettings & {
    enforceLockOnIdle?: boolean;
    idleWarningMinutes?: number;
  };
  backupsMaintenance: {
    autoBackupEnabled: boolean;
    backupFrequency: "hourly" | "daily" | "weekly";
    lastBackupAt: string;
    rpoObjectiveHours: number;
    rtoObjectiveHours: number;
    retentionDays: number;
    backupStorageLocation: "secure_local_vault" | "hybrid_cloud";
    compressionEnabled: boolean;
  };
  technicalConfig: {
    serverEnvironment: "production" | "staging" | "development";
    apiEndpoint: string;
    logLevel: "info" | "warn" | "error" | "debug";
    degradedOfflineAllowed: boolean;
    requireConfirmationForCritical: boolean;
    syncIntervalSeconds: number;
    maintenanceMode: boolean;
  };
  updatedAt: string;
  updatedBy: string;
}
