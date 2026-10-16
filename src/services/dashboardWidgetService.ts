import { Role, DashboardWidgetConfig, DashboardWidgetId } from "../types";

export const ALL_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: "total_patients",
    label: "Patients Enregistrés",
    description: "Volume cumulé des dossiers permanents actifs",
    category: "patients",
    requiredPermission: "PATIENT_READ",
    rolesRecommended: ["ADMIN", "RECEPTION_CAISSE", "PRACTITIONER", "NURSE", "MIDWIFE", "LAB", "IMAGING"],
    defaultVisible: true,
  },
  {
    id: "today_consultations",
    label: "Consultations Médicales",
    description: "Actes médicaux enregistrés au cours de la journée",
    category: "medical",
    requiredPermission: "CONSULTATION_READ",
    rolesRecommended: ["ADMIN", "PRACTITIONER"],
    defaultVisible: true,
  },
  {
    id: "active_visits",
    label: "Passages & File d'Attente",
    description: "Patients actuellement en cours de parcours clinique",
    category: "patients",
    requiredPermission: "PATIENT_READ",
    rolesRecommended: ["ADMIN", "RECEPTION_CAISSE", "PRACTITIONER", "NURSE"],
    defaultVisible: true,
  },
  {
    id: "upcoming_appointments",
    label: "Rendez-vous Confirmés",
    description: "Consultations et soins programmés du jour",
    category: "rdv",
    rolesRecommended: ["ADMIN", "RECEPTION_CAISSE", "PRACTITIONER", "MIDWIFE", "NURSE"],
    defaultVisible: true,
  },
  {
    id: "total_revenue",
    label: "Recettes Encaissées",
    description: "Montants totaux perçus (Espèces, Mobile Money, Cartes)",
    category: "finance",
    requiredPermission: "FINANCE_READ",
    rolesRecommended: ["ADMIN", "RECEPTION_CAISSE"],
    defaultVisible: true,
  },
  {
    id: "unpaid_invoices",
    label: "Factures Impayées / En Attente",
    description: "Soldes restant dus sur les passages cliniques",
    category: "finance",
    requiredPermission: "PAYMENT_WRITE",
    rolesRecommended: ["ADMIN", "RECEPTION_CAISSE"],
    defaultVisible: false,
  },
  {
    id: "pending_cares",
    label: "Soins & Injections en Attente",
    description: "Pansements, perfusions et actes infirmiers du jour",
    category: "medical",
    requiredPermission: "CARE_WRITE",
    rolesRecommended: ["ADMIN", "NURSE"],
    defaultVisible: true,
  },
  {
    id: "active_pregnancies",
    label: "Grossesses & CPN Suivies",
    description: "Dossiers obstétricaux et consultations prénatales en cours",
    category: "maternite",
    requiredPermission: "MATERNITY_WRITE",
    rolesRecommended: ["ADMIN", "MIDWIFE"],
    defaultVisible: true,
  },
  {
    id: "pending_labs",
    label: "Analyses Laboratoire",
    description: "Demandes biologiques en cours ou en attente de validation",
    category: "examens",
    requiredPermission: "LAB_WRITE",
    rolesRecommended: ["ADMIN", "LAB", "PRACTITIONER"],
    defaultVisible: true,
  },
  {
    id: "pending_imaging",
    label: "Examens Imagerie & Échographies",
    description: "Actes de radiologie et échographies programmés",
    category: "examens",
    requiredPermission: "IMAGING_WRITE",
    rolesRecommended: ["ADMIN", "IMAGING", "PRACTITIONER"],
    defaultVisible: true,
  },
  {
    id: "triage_alerts",
    label: "Triage & Alertes Vitales",
    description: "Patients classés en urgence rouge ou surveillance continue",
    category: "medical",
    requiredPermission: "PATIENT_READ",
    rolesRecommended: ["ADMIN", "PRACTITIONER", "NURSE"],
    defaultVisible: false,
  },
  {
    id: "service_occupancy",
    label: "Taux de Charge Clinique",
    description: "Capacité opérationnelle moyenne des différents pôles",
    category: "medical",
    requiredPermission: "PATIENT_READ",
    rolesRecommended: ["ADMIN", "PRACTITIONER"],
    defaultVisible: false,
  },
  {
    id: "cpn_attendance",
    label: "CPN du Jour & Suivi Prénatal",
    description: "Consultations prénatales planifiées et réalisées aujourd'hui",
    category: "maternite",
    requiredPermission: "MATERNITY_WRITE",
    rolesRecommended: ["MIDWIFE", "ADMIN"],
    defaultVisible: true,
  },
  {
    id: "urgent_labs",
    label: "Analyses Biologiques Urgentes",
    description: "Examens labo marqués priorité haute ou urgence vitale",
    category: "examens",
    requiredPermission: "LAB_WRITE",
    rolesRecommended: ["LAB", "PRACTITIONER", "ADMIN"],
    defaultVisible: false,
  },
  {
    id: "wait_time_avg",
    label: "Délai Moyen d'Attente",
    description: "Temps moyen écoulé entre l'admission et le premier soin/consultation",
    category: "patients",
    requiredPermission: "PATIENT_READ",
    rolesRecommended: ["RECEPTION_CAISSE", "ADMIN"],
    defaultVisible: false,
  },
  {
    id: "daily_collection_rate",
    label: "Taux d'Encaissement du Jour",
    description: "Pourcentage des factures soldées immédiatement à la caisse",
    category: "finance",
    requiredPermission: "FINANCE_READ",
    rolesRecommended: ["ADMIN", "RECEPTION_CAISSE"],
    defaultVisible: false,
  },
];

export const getDefaultWidgetsForRole = (role: Role): DashboardWidgetId[] => {
  switch (role) {
    case "ADMIN":
      return ["total_patients", "today_consultations", "upcoming_appointments", "total_revenue", "triage_alerts", "service_occupancy"];
    case "RECEPTION_CAISSE":
      return ["active_visits", "total_patients", "upcoming_appointments", "total_revenue", "unpaid_invoices", "wait_time_avg"];
    case "PRACTITIONER":
      return ["today_consultations", "total_patients", "upcoming_appointments", "pending_labs", "triage_alerts", "pending_imaging"];
    case "NURSE":
      return ["pending_cares", "active_visits", "total_patients", "upcoming_appointments", "triage_alerts"];
    case "MIDWIFE":
      return ["active_pregnancies", "cpn_attendance", "total_patients", "upcoming_appointments", "today_consultations"];
    case "LAB":
      return ["pending_labs", "urgent_labs", "total_patients", "active_visits"];
    case "IMAGING":
      return ["pending_imaging", "total_patients", "today_consultations", "active_visits"];
    default:
      return ["total_patients", "today_consultations", "upcoming_appointments"];
  }
};

export interface WidgetPreset {
  id: string;
  name: string;
  description: string;
  role?: Role;
  widgetIds: DashboardWidgetId[];
}

export const DASHBOARD_PRESETS: WidgetPreset[] = [
  {
    id: "preset_admin",
    name: "Supervision Globale (Admin)",
    description: "Dossiers, consultations, recettes et urgences",
    role: "ADMIN",
    widgetIds: ["total_patients", "today_consultations", "upcoming_appointments", "total_revenue", "triage_alerts", "service_occupancy"],
  },
  {
    id: "preset_clinic",
    name: "Consultation & Soins Cliniques",
    description: "Axé praticiens et médecins : actes, biologie et alertes",
    role: "PRACTITIONER",
    widgetIds: ["today_consultations", "total_patients", "upcoming_appointments", "pending_labs", "triage_alerts", "pending_imaging"],
  },
  {
    id: "preset_reception",
    name: "Accueil, Passages & Caisse",
    description: "File d'attente, encaissements et suivi des soldes",
    role: "RECEPTION_CAISSE",
    widgetIds: ["active_visits", "total_patients", "upcoming_appointments", "total_revenue", "unpaid_invoices", "wait_time_avg"],
  },
  {
    id: "preset_nurse",
    name: "Pôle Soins Infirmiers & Triage",
    description: "Actes de soins, passages en cours et alertes vitales",
    role: "NURSE",
    widgetIds: ["pending_cares", "active_visits", "total_patients", "upcoming_appointments", "triage_alerts"],
  },
  {
    id: "preset_maternity",
    name: "Pôle Maternité & Obstétrique",
    description: "Grossesses suivies, CPN du jour et calendrier obstétrical",
    role: "MIDWIFE",
    widgetIds: ["active_pregnancies", "cpn_attendance", "total_patients", "upcoming_appointments", "today_consultations"],
  },
  {
    id: "preset_compact",
    name: "Vue Minimaliste (3 KPI)",
    description: "Les trois métriques vitales fondamentales sans encombrement",
    widgetIds: ["total_patients", "today_consultations", "upcoming_appointments"],
  },
];
