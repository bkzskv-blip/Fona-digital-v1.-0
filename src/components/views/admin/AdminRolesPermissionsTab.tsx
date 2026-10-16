import React, { useState } from "react";
import {
  ShieldCheck,
  Key,
  Check,
  X,
  Users,
  Info,
  Sliders,
  Lock,
  AlertTriangle,
  FileCheck,
  CreditCard,
  Stethoscope,
  Baby,
  HeartHandshake,
  Receipt,
  BarChart3,
  Building,
  HelpCircle,
  Eye,
  Plus,
  Edit3,
  Printer,
  Download,
  Archive,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "../../ui/GlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "../../../services/rbacService";
import { Role, Permission } from "../../../types";
import { useApp } from "../../../context/AppContext";

interface ModuleActionCapability {
  module: string;
  moduleLabel: string;
  actions: {
    name: "Voir (READ)" | "Créer (CREATE)" | "Modifier (UPDATE)" | "Valider (VALIDATE)" | "Imprimer (PRINT)" | "Exporter (EXPORT)" | "Archiver (ARCHIVE)" | "Administrer (ADMIN)";
    admin: boolean;
    reception: boolean;
    practitioner: boolean;
    nurse: boolean;
    midwife: boolean;
    auditedDiff?: boolean;
    restrictionNote?: string;
  }[];
}

const MODULE_ACTION_GRID: ModuleActionCapability[] = [
  {
    module: "PATIENT",
    moduleLabel: "Dossier Patient & Timeline",
    actions: [
      { name: "Voir (READ)", admin: true, reception: true, practitioner: true, nurse: true, midwife: true, restrictionNote: "Accueil restreint aux données administratives" },
      { name: "Créer (CREATE)", admin: true, reception: true, practitioner: false, nurse: false, midwife: false },
      { name: "Modifier (UPDATE)", admin: true, reception: true, practitioner: false, nurse: false, midwife: false, restrictionNote: "Coordonnées administratives uniquement" },
      { name: "Valider (VALIDATE)", admin: true, reception: true, practitioner: true, nurse: true, midwife: true },
      { name: "Imprimer (PRINT)", admin: true, reception: true, practitioner: true, nurse: true, midwife: true },
      { name: "Exporter (EXPORT)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Archiver (ARCHIVE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Administrer (ADMIN)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
    ],
  },
  {
    module: "CONSULTATION",
    moduleLabel: "Consultations & Diagnostics",
    actions: [
      { name: "Voir (READ)", admin: true, reception: false, practitioner: true, nurse: true, midwife: true, restrictionNote: "Masqué à l'accueil (secret médical)" },
      { name: "Créer (CREATE)", admin: true, reception: false, practitioner: true, nurse: false, midwife: false },
      { name: "Modifier (UPDATE)", admin: true, reception: false, practitioner: true, nurse: false, midwife: false, auditedDiff: true, restrictionNote: "Traçabilité stricte Avant ➔ Après obligatoire" },
      { name: "Valider (VALIDATE)", admin: true, reception: false, practitioner: true, nurse: false, midwife: false },
      { name: "Imprimer (PRINT)", admin: true, reception: false, practitioner: true, nurse: false, midwife: false },
      { name: "Exporter (EXPORT)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Archiver (ARCHIVE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Administrer (ADMIN)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
    ],
  },
  {
    module: "CARE",
    moduleLabel: "Soins Ambulatoires & Constantes",
    actions: [
      { name: "Voir (READ)", admin: true, reception: false, practitioner: true, nurse: true, midwife: true },
      { name: "Créer (CREATE)", admin: true, reception: false, practitioner: true, nurse: true, midwife: true },
      { name: "Modifier (UPDATE)", admin: true, reception: false, practitioner: true, nurse: true, midwife: false, auditedDiff: true },
      { name: "Valider (VALIDATE)", admin: true, reception: false, practitioner: true, nurse: true, midwife: true },
      { name: "Imprimer (PRINT)", admin: true, reception: false, practitioner: true, nurse: true, midwife: true },
      { name: "Exporter (EXPORT)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Archiver (ARCHIVE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Administrer (ADMIN)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
    ],
  },
  {
    module: "MATERNITY",
    moduleLabel: "Maternité, CPN & Accouchements",
    actions: [
      { name: "Voir (READ)", admin: true, reception: false, practitioner: true, nurse: false, midwife: true },
      { name: "Créer (CREATE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: true },
      { name: "Modifier (UPDATE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: true, auditedDiff: true },
      { name: "Valider (VALIDATE)", admin: true, reception: false, practitioner: true, nurse: false, midwife: true },
      { name: "Imprimer (PRINT)", admin: true, reception: false, practitioner: true, nurse: false, midwife: true },
      { name: "Exporter (EXPORT)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Archiver (ARCHIVE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Administrer (ADMIN)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
    ],
  },
  {
    module: "CAISSE",
    moduleLabel: "Caisse & Règlements",
    actions: [
      { name: "Voir (READ)", admin: true, reception: true, practitioner: false, nurse: false, midwife: false, restrictionNote: "Opérations de caisse opérationnelle" },
      { name: "Créer (CREATE)", admin: true, reception: true, practitioner: false, nurse: false, midwife: false },
      { name: "Modifier (UPDATE)", admin: true, reception: true, practitioner: false, nurse: false, midwife: false, restrictionNote: "Avant validation définitive" },
      { name: "Valider (VALIDATE)", admin: true, reception: true, practitioner: false, nurse: false, midwife: false },
      { name: "Imprimer (PRINT)", admin: true, reception: true, practitioner: false, nurse: false, midwife: false },
      { name: "Exporter (EXPORT)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Archiver (ARCHIVE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Administrer (ADMIN)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
    ],
  },
  {
    module: "FINANCE",
    moduleLabel: "Finances & Chiffre d'Affaires Global",
    actions: [
      { name: "Voir (READ)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false, restrictionNote: "Moindre privilège absolu : réservé direction" },
      { name: "Créer (CREATE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Modifier (UPDATE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Valider (VALIDATE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Imprimer (PRINT)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Exporter (EXPORT)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Archiver (ARCHIVE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Administrer (ADMIN)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
    ],
  },
  {
    module: "ADMIN",
    moduleLabel: "Administration, Comptes & Sécurité",
    actions: [
      { name: "Voir (READ)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Créer (CREATE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Modifier (UPDATE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Valider (VALIDATE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Imprimer (PRINT)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Exporter (EXPORT)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Archiver (ARCHIVE)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
      { name: "Administrer (ADMIN)", admin: true, reception: false, practitioner: false, nurse: false, midwife: false },
    ],
  },
];

interface RoleProfileDetail {
  role: Role;
  title: string;
  badge: string;
  summary: string;
  canDo: string[];
  cannotDo: string[];
  dataRestrictions: string;
  auditGuarantees: string;
}

const FIVE_MAIN_ROLES_DETAILS: RoleProfileDetail[] = [
  {
    role: "ADMIN",
    title: "1. Administrateur Principal",
    badge: "Contrôle Global & Supervision",
    summary: "Compte avec le niveau de contrôle maximal. Gère les comptes, rôles, permissions, identité de marque, sauvegardes et finances.",
    canDo: [
      "Dashboard global et indicateurs consolidés",
      "Création, modification et désactivation des comptes personnels nominatifs",
      "Attribution des rôles et octroi de permissions exceptionnelles unitaires",
      "Gestion des sauvegardes chiffrées (RPO ≤ 24h, RTO ≤ 4h) et tests d'intégrité",
      "Consultation intégrale du journal d'audit inaltérable et des sessions actives",
      "Accès aux statistiques financières et chiffre d'affaires global de la clinique",
      "Configuration de l'identité visuelle FONA, numérotation et paramètres système",
    ],
    cannotDo: [
      "Modifier silencieusement une donnée clinique : toute rectification est obligatoirement soumise au journal d'audit Avant ➔ Après avec motif",
      "Supprimer physiquement un compte utilisateur (la suppression est interdite par respect de la traçabilité)",
    ],
    dataRestrictions: "Accès complet aux données cliniques, financières et administratives. Soumis à l'immuabilité de l'audit.",
    auditGuarantees: "Non-répudiation totale : même l'administrateur laisse une empreinte horodatée pour chaque action sensible.",
  },
  {
    role: "RECEPTION_CAISSE",
    title: "2. Accueil / Réception-Caisse",
    badge: "Opérationnel Accueil & Caisse",
    summary: "Compte centré sur l'admission du patient, l'orientation, les passages du jour, la prise de rendez-vous et l'encaissement.",
    canDo: [
      "Recherche rapide de patient et consultation du volet administratif",
      "Création de nouveau dossier patient avec vérification anti-doublon",
      "Émission de tickets de passage (Consultation, Soin, Maternité, Labo)",
      "Planification et gestion des rendez-vous et rappels",
      "Enregistrement des paiements (Espèces, Mobile Money) et délivrance de reçus",
      "Gestion des acomptes et calcul automatique du solde restant dû (Solde = Total - Acompte)",
    ],
    cannotDo: [
      "Modifier un diagnostic médical ou une consultation clinique",
      "Modifier les constantes vitales ou les soins infirmiers",
      "Modifier les données obstétricales ou accouchements de maternité",
      "Accéder aux détails cliniques intimes non nécessaires à l'accueil (principe du moindre privilège)",
      "Consulter les rapports financiers globaux de la clinique hors de sa caisse",
      "Accéder au panneau d'administration des utilisateurs ou de la sécurité",
    ],
    dataRestrictions: "Données médicales masquées (« Accès restreint au personnel soignant »). Accès uniquement aux informations administratives et de facturation.",
    auditGuarantees: "Chaque encaissement, génération de reçu et ticket d'admission est tracé avec l'identifiant du caissier.",
  },
  {
    role: "PRACTITIONER",
    title: "3. Médecin / Praticien",
    badge: "Prise en Charge Médicale",
    summary: "Compte orienté vers l'acte clinique, le diagnostic médical, la décision thérapeutique et les examens complémentaires.",
    canDo: [
      "Consultation intégrale du dossier patient permanent et de la Timeline médicale",
      "Création de consultations, anamnèse, examen physique et antécédents",
      "Saisie des constantes vitales et mesures répétées",
      "Pose et rectification de diagnostics (principal et associés)",
      "Prescription médicamenteuse et édition d'ordonnances officielles signées",
      "Prescription d'analyses de laboratoire et examens d'imagerie médicale",
      "Rectification d'un acte validé avec saisie du motif clinique obligatoire (Avant ➔ Après)",
      "Impression des documents médicaux autorisés",
    ],
    cannotDo: [
      "Gérer les utilisateurs ou modifier les rôles et permissions",
      "Modifier les paramètres système, l'identité de marque ou les sauvegardes",
      "Encaisser des paiements ou modifier les factures validées de la caisse",
      "Consulter le chiffre d'affaires global et les statistiques financières de la clinique",
    ],
    dataRestrictions: "Accès médical complet aux dossiers cliniques. Aucun accès aux flux financiers détaillés ou à l'administration.",
    auditGuarantees: "Toute rectification de consultation conserve l'ancienne et la nouvelle valeur avec horodatage et motif clinique.",
  },
  {
    role: "NURSE",
    title: "4. Infirmier / Aide-Soignant",
    badge: "Soins & Surveillance",
    summary: "Compte centré sur l'administration des soins, la surveillance des constantes vitales, les pansements et la coordination.",
    canDo: [
      "Consultation du dossier patient nécessaire aux soins",
      "Enregistrement des constantes vitales (T°, Pouls, TA, SpO2, Poids, Glycémie)",
      "Consultation de l'évolution longitudinale et feuille de température interactive",
      "Enregistrement des soins infirmiers (pansements, injections, perfusions)",
      "Traçabilité des produits utilisés (provenance FONA ou apportés par le patient)",
      "Ajout d'observations infirmières et horodatage de l'acte",
      "Coordination des rendez-vous de soins et surveillance",
    ],
    cannotDo: [
      "Poser ou modifier un diagnostic médical réservé au médecin",
      "Modifier une consultation médicale validée",
      "Encaisser des paiements ou modifier la caisse",
      "Gérer les utilisateurs ou accéder à l'administration système",
    ],
    dataRestrictions: "Accès aux dossiers patients et soins. Pas d'accès aux flux financiers ni aux diagnostics réservés.",
    auditGuarantees: "Chaque administration de soin et prise de constante consigne l'identité du soignant, l'heure et les observations.",
  },
  {
    role: "MIDWIFE",
    title: "5. Sage-Femme",
    badge: "Maternité & Périnatalité",
    summary: "Compte spécialisé maternité, suivi longitudinal de la grossesse, consultations prénatales (CPN), accouchements et suites de couches.",
    canDo: [
      "Ouverture et suivi du dossier de grossesse (DDR, DPA, gestité, parité, facteurs de risque)",
      "Saisie des CPN 1 à 4 avec mesures répétées (HU, BDCF, mouvements, albuminurie)",
      "Enregistrement du volet d'arrivée en salle de travail et partogramme",
      "Enregistrement complet de l'accouchement (voie basse / césarienne, état délivrance)",
      "Enregistrement du nouveau-né (sexe, poids, taille, Apgar 1min et 5min)",
      "Suivi des suites de couches et post-partum",
      "Prescription d'échographies obstétricales et bilans prénataux",
      "Édition et impression des documents officiels de maternité",
    ],
    cannotDo: [
      "Administrer les comptes ou modifier les permissions",
      "Encaisser des paiements ou manipuler la caisse",
      "Accéder aux rapports financiers globaux de la clinique",
      "Modifier des prises en charge médicales hors de son périmètre obstétrical sans délégation",
    ],
    dataRestrictions: "Accès complet au pôle obstétrical et périnatal. Aucun accès aux flux financiers de caisse ou administration.",
    auditGuarantees: "Chaque CPN, accouchement et mesure fœtale est signé numériquement et historisé dans la Timeline de la patiente.",
  },
];

export const AdminRolesPermissionsTab: React.FC = () => {
  const { users, currentUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>("PRACTITIONER");
  const [viewMode, setViewMode] = useState<"ROLES_DETAIL" | "MATRIX_GRID">("ROLES_DETAIL");

  const currentRoleDetail = FIVE_MAIN_ROLES_DETAILS.find((r) => r.role === selectedRole) || FIVE_MAIN_ROLES_DETAILS[0];

  return (
    <div className="space-y-6">
      {/* Top Banner on RBAC Architecture */}
      <div className="p-5 rounded-2xl glass-surface border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#D9B45B] border border-amber-400/30 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Architecture RBAC, Rôles & Principe du Moindre Privilège
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Ségrégation stricte des rôles &middot; Vérification frontend & serveur &middot; Traçabilité Avant ➔ Après
            </p>
          </div>
        </div>

        {/* View Mode Buttons */}
        <div className="flex bg-[var(--surface-subtle)] p-1 rounded-xl border border-[var(--border)] overflow-x-auto">
          <button
            onClick={() => setViewMode("ROLES_DETAIL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === "ROLES_DETAIL"
                ? "bg-[#1261A0] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Les 5 Profils Métier
          </button>
          <button
            onClick={() => setViewMode("MATRIX_GRID")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === "MATRIX_GRID"
                ? "bg-[#1261A0] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Matrice Modules x Actions
          </button>
        </div>
      </div>

      {/* Security Pipeline Flow Banner */}
      <div className="p-4 rounded-2xl bg-black/25 border border-[var(--border)] flex items-center justify-between gap-3 overflow-x-auto text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-[#D9B45B]">Pipeline FONA :</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-[var(--text-secondary)]">
          <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">1. RÔLE</span>
          <span>➔</span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">2. PERMISSIONS</span>
          <span>➔</span>
          <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold">3. MODULES</span>
          <span>➔</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">4. ACTIONS</span>
          <span>➔</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">5. RESTRICTIONS DONNÉES</span>
          <span>➔</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">6. AUDIT AVANT/APRÈS</span>
        </div>
      </div>

      {/* VIEW 1: LES 5 COMPTES PRINCIPAUX DÉTAILLÉS */}
      {viewMode === "ROLES_DETAIL" && (
        <div className="space-y-6">
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {FIVE_MAIN_ROLES_DETAILS.map((r) => {
              const isSelected = selectedRole === r.role;
              const count = users.filter((u) => u.role === r.role).length;

              return (
                <button
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#4F7DF3]/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10"
                      : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-white/20"
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Profil Métier</div>
                  <div className="text-xs font-bold text-[var(--text-primary)] mt-1">{ROLE_LABELS[r.role]}</div>
                  <div className="mt-2 text-[10px] text-cyan-400 font-medium flex items-center justify-between">
                    <span>{count} compte{count > 1 ? "s" : ""}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Role Detailed Specifications Card */}
          <GlassCard className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--border)] gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{currentRoleDetail.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D9B45B]/15 text-[#D9B45B] border border-[#D9B45B]/30">
                    {currentRoleDetail.badge}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{currentRoleDetail.summary}</p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/25 text-xs font-mono text-cyan-300">
                Code Système : {currentRoleDetail.role}
              </div>
            </div>

            {/* Grid 2 Columns: PEUT FAIRE vs NE PEUT PAS FAIRE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Allowed Actions */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Droits & Actions Autorisés</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {currentRoleDetail.canDo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Forbidden / Restricted Actions */}
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                  <X className="w-4 h-4 text-rose-400" />
                  <span>Restrictions & Actions Interdites</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {currentRoleDetail.cannotDo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold shrink-0">✗</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Data Restrictions & Audit Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#D9B45B] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Principe du Moindre Privilège sur les Données</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {currentRoleDetail.dataRestrictions}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Traçabilité & Mesures de Non-Répudiation</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {currentRoleDetail.auditGuarantees}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* VIEW 2: MATRICE COMPLÈTE MODULES X ACTIONS (8 NIVEAUX) */}
      {viewMode === "MATRIX_GRID" && (
        <GlassCard className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D9B45B]" />
              Matrice Granulaire d'Autorisations FONA (8 Niveaux d'Action)
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Voir &middot; Créer &middot; Modifier &middot; Valider &middot; Imprimer &middot; Exporter &middot; Archiver &middot; Administrer
            </p>
          </div>

          <div className="space-y-6">
            {MODULE_ACTION_GRID.map((mod) => (
              <div key={mod.module} className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 border-l-2 border-cyan-400 pl-2">
                  {mod.moduleLabel}
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
                  <table className="w-full text-left text-xs divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--surface-subtle)] text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Action Système</th>
                        <th className="py-2.5 px-2 text-center">Admin</th>
                        <th className="py-2.5 px-2 text-center">Accueil/Caisse</th>
                        <th className="py-2.5 px-2 text-center">Médecin</th>
                        <th className="py-2.5 px-2 text-center">Infirmier</th>
                        <th className="py-2.5 px-2 text-center">Sage-Femme</th>
                        <th className="py-2.5 px-3">Règle de Sécurité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)] text-slate-200">
                      {mod.actions.map((act, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2 px-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                            {act.name}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {act.admin ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">✗</span>}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {act.reception ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">✗</span>}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {act.practitioner ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">✗</span>}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {act.nurse ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">✗</span>}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {act.midwife ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">✗</span>}
                          </td>
                          <td className="py-2 px-3 text-[11px] text-[var(--text-muted)]">
                            {act.auditedDiff && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-[#D9B45B] border border-amber-500/30 text-[10px] font-bold mr-1.5">
                                Audit Diff Avant/Après
                              </span>
                            )}
                            {act.restrictionNote || "Standard RBAC"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
