import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Phone,
  Mail,
  Building,
  Edit2,
  Clock,
  Copy,
  Check,
  Sliders,
  Sparkles,
  Lock,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GlassCard } from "../../ui/GlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { GlassInput, GlassSelect } from "../../ui/GlassFormControls";
import { GlassAvatar } from "../../ui/GlassAvatar";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "../../../services/rbacService";
import { Role, User, UserStatus, Permission } from "../../../types";

interface PermissionGroup {
  category: string;
  items: {
    key: Permission;
    label: string;
    description: string;
  }[];
}

const ALL_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: "Dossier Patient",
    items: [
      { key: "PATIENT_READ", label: "Voir le dossier & Timeline", description: "Consultation antécédents et parcours patient" },
      { key: "PATIENT_CREATE", label: "Créer un dossier patient", description: "Enregistrement permanent avec détection doublon" },
      { key: "PATIENT_UPDATE", label: "Modifier les coordonnées", description: "Mise à jour état civil et contacts" },
      { key: "PATIENT_PRINT", label: "Imprimer le dossier", description: "Génération de la fiche médicale papier" },
      { key: "PATIENT_ARCHIVE", label: "Archiver un dossier", description: "Fusion contrôlée ou archivage réglementaire" },
    ],
  },
  {
    category: "Consultations & Diagnostics",
    items: [
      { key: "CONSULTATION_READ", label: "Consulter les consultations", description: "Lecture motifs, anamnèse et diagnostics" },
      { key: "CONSULTATION_CREATE", label: "Créer un acte médical", description: "Saisie de consultation clinique" },
      { key: "CONSULTATION_UPDATE", label: "Rectifier un acte validé", description: "Modification tracée avec motif et diff Avant/Après" },
      { key: "CONSULTATION_VALIDATE", label: "Valider une consultation", description: "Signature numérique de l'acte" },
      { key: "CONSULTATION_PRINT", label: "Imprimer l'ordonnance", description: "Émission officielle de l'ordonnance FONA" },
      { key: "PRESCRIPTION_WRITE", label: "Émettre des prescriptions", description: "Prescription de médicaments et posologies" },
    ],
  },
  {
    category: "Soins & Constantes",
    items: [
      { key: "CARE_READ", label: "Voir les soins", description: "Lecture du registre des soins infirmiers" },
      { key: "CARE_CREATE", label: "Administrer un soin", description: "Enregistrement pansements, injections, perfusions" },
      { key: "CARE_UPDATE", label: "Mettre à jour les soins", description: "Rectification des observations de soins" },
      { key: "CARE_PRINT", label: "Imprimer les soins", description: "Génération feuille de surveillance" },
      { key: "VITALS_WRITE", label: "Saisir les constantes", description: "Pouls, tension, T°, SpO2, poids et glycémie" },
    ],
  },
  {
    category: "Maternité & CPN",
    items: [
      { key: "MATERNITY_READ", label: "Consulter les dossiers maternité", description: "Lecture grossesses, CPN et accouchements" },
      { key: "MATERNITY_CREATE", label: "Ouvrir une grossesse / CPN", description: "Saisie de dossier obstétrical et CPN 1-4" },
      { key: "MATERNITY_UPDATE", label: "Modifier le suivi maternité", description: "Mise à jour du partogramme et mesures fœtales" },
      { key: "MATERNITY_VALIDATE", label: "Valider un accouchement", description: "Validation de la naissance et nouveau-né" },
      { key: "MATERNITY_PRINT", label: "Imprimer carnet maternité", description: "Génération des documents obstétricaux" },
    ],
  },
  {
    category: "Laboratoire & Imagerie",
    items: [
      { key: "LAB_READ", label: "Voir les analyses labo", description: "Lecture des résultats de biologie" },
      { key: "LAB_CREATE", label: "Prescrire un bilan labo", description: "Demande NFS, Palu, CRP, biochimie" },
      { key: "LAB_VALIDATE", label: "Valider les résultats labo", description: "Validation biologique avec marquage d'anomalie" },
      { key: "LAB_PRINT", label: "Imprimer les résultats labo", description: "Compte rendu officiel signé" },
      { key: "IMAGING_READ", label: "Voir les examens d'imagerie", description: "Lecture des clichés et conclusions" },
      { key: "IMAGING_CREATE", label: "Prescrire une imagerie", description: "Demande d'échographie ou radiologie" },
      { key: "IMAGING_VALIDATE", label: "Valider compte rendu imagerie", description: "Conclusion échographique / radiologique" },
      { key: "IMAGING_PRINT", label: "Imprimer compte rendu imagerie", description: "Génération du compte rendu d'échographie" },
    ],
  },
  {
    category: "Accueil, Caisse & Règlements",
    items: [
      { key: "VISIT_CREATE", label: "Créer un passage d'accueil", description: "Ticket d'arrivée et orientation" },
      { key: "APPOINTMENT_READ", label: "Consulter l'agenda", description: "Lecture des rendez-vous planifiés" },
      { key: "APPOINTMENT_CREATE", label: "Planifier un rendez-vous", description: "Attribution de créneau avec rappel" },
      { key: "APPOINTMENT_UPDATE", label: "Modifier un rendez-vous", description: "Report, annulation ou confirmation" },
      { key: "CAISSE_READ", label: "Consulter la caisse", description: "Visualisation des factures et reçus" },
      { key: "CAISSE_CREATE", label: "Émettre une facture", description: "Saisie de prestations tarifées" },
      { key: "CAISSE_VALIDATE", label: "Valider un encaissement", description: "Délivrance de reçu comptant ou Mobile Money" },
      { key: "CAISSE_PRINT", label: "Imprimer un reçu de caisse", description: "Émission du reçu officiel FONA" },
      { key: "CAISSE_PARTIAL", label: "Gérer paiements partiels", description: "Calcul automatique solde = montant - payé" },
      { key: "PAYMENT_WRITE", label: "Encaisser un règlement", description: "Validation transaction caisse" },
    ],
  },
  {
    category: "Finances & Statistiques Globales",
    items: [
      { key: "FINANCE_READ", label: "Voir les données financières globales", description: "Chiffre d'affaires, statistiques de caisse et bilans (Moindre privilège strict)" },
      { key: "REPORT_READ", label: "Consulter les rapports d'activité", description: "Indicateurs cliniques et fréquentation" },
      { key: "REPORT_EXPORT", label: "Exporter les rapports", description: "Téléchargement PDF et Excel" },
    ],
  },
  {
    category: "Administration Système & Gouvernance",
    items: [
      { key: "ADMIN_WRITE", label: "Administration générale FONA", description: "Configuration globale du cabinet et marque" },
      { key: "ADMIN_USER_CREATE", label: "Créer des comptes personnels", description: "Attribution de comptes individuels nominatifs" },
      { key: "ADMIN_USER_UPDATE", label: "Modifier les utilisateurs", description: "Mise à jour rôles et profils" },
      { key: "ADMIN_USER_DISABLE", label: "Désactiver un compte", description: "Suspension sans suppression physique" },
      { key: "ADMIN_PERMISSIONS_MANAGE", label: "Gérer permissions exceptionnelles", description: "Personnalisation des droits par titulaire" },
      { key: "ADMIN_AUDIT_READ", label: "Consulter le journal d'audit", description: "Traçabilité inaltérable des opérations" },
      { key: "ADMIN_BACKUP_MANAGE", label: "Gérer les sauvegardes", description: "Sauvegardes manuelles et restauration RTO/RPO" },
    ],
  },
];

export const AdminUsersTab: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    toggleUserStatus,
    resetUserPassword,
    updateUserExceptionalPermissions,
    clinicSites,
    showToast,
    formatDateTime,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Create/Edit User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("PRACTITIONER");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clinicSiteId, setClinicSiteId] = useState(clinicSites[0]?.id || "site-plateau");
  const [avatarVariant, setAvatarVariant] = useState<User["avatarVariant"]>("doctor");

  // Temp Password display modal
  const [tempPasswordModal, setTempPasswordModal] = useState<{ user: User; pass: string; isNewAccount?: boolean } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Permissions Manager Modal
  const [permissionTargetUser, setPermissionTargetUser] = useState<User | null>(null);
  const [customExceptionalPerms, setCustomExceptionalPerms] = useState<Permission[]>([]);
  const [customRevokedPerms, setCustomRevokedPerms] = useState<Permission[]>([]);

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || (u.status || "ACTIF") === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFullName("");
    setUsername("");
    setRole("PRACTITIONER");
    setDepartment("Médecine Générale");
    setEmail("");
    setPhone("+225 ");
    setClinicSiteId(clinicSites[0]?.id || "site-plateau");
    setAvatarVariant("doctor");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setUsername(user.username);
    setRole(user.role);
    setDepartment(user.department);
    setEmail(user.email);
    setPhone(user.phone);
    setClinicSiteId(user.clinicSiteId);
    setAvatarVariant(user.avatarVariant);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) {
      showToast("WARNING", "Champs Incomplets", "Le nom et l'identifiant sont obligatoires.");
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        fullName,
        username,
        role,
        department,
        email,
        phone,
        clinicSiteId,
        avatarVariant,
      });
      setIsModalOpen(false);
    } else {
      // Temporary password generation per Cahier des charges:
      const generatedTempPass = `Fona-${Math.random().toString(36).substring(2, 8).toUpperCase()}!26`;
      const created = addUser({
        fullName,
        username,
        role,
        department,
        email,
        phone,
        clinicSiteId,
        avatarVariant,
        status: "ACTIF",
        password: generatedTempPass,
        isFirstLogin: true,
      });
      setIsModalOpen(false);
      setTempPasswordModal({ user: created, pass: generatedTempPass, isNewAccount: true });
    }
  };

  const handleResetPassword = (user: User) => {
    const tempPass = resetUserPassword(user.id);
    setTempPasswordModal({ user, pass: tempPass, isNewAccount: false });
    setHasCopied(false);
  };

  const copyPasswordToClipboard = () => {
    if (tempPasswordModal) {
      navigator.clipboard.writeText(tempPasswordModal.pass);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  // Open Permissions Modal for specific user
  const handleOpenPermissionsModal = (user: User) => {
    setPermissionTargetUser(user);
    setCustomExceptionalPerms(user.exceptionalPermissions ? [...user.exceptionalPermissions] : []);
    setCustomRevokedPerms(user.revokedPermissions ? [...user.revokedPermissions] : []);
  };

  const togglePermissionForTargetUser = (perm: Permission) => {
    if (!permissionTargetUser) return;
    const isBaseRolePerm = ROLE_PERMISSIONS[permissionTargetUser.role]?.includes(perm);

    if (isBaseRolePerm) {
      // It is inherited from role: if currently revoked, un-revoke it; otherwise revoke it
      if (customRevokedPerms.includes(perm)) {
        setCustomRevokedPerms((prev) => prev.filter((p) => p !== perm));
      } else {
        setCustomRevokedPerms((prev) => [...prev, perm]);
      }
    } else {
      // It is not in base role: toggle exceptional grant
      if (customExceptionalPerms.includes(perm)) {
        setCustomExceptionalPerms((prev) => prev.filter((p) => p !== perm));
      } else {
        setCustomExceptionalPerms((prev) => [...prev, perm]);
      }
    }
  };

  const handleSavePermissions = () => {
    if (!permissionTargetUser) return;
    updateUserExceptionalPermissions(
      permissionTargetUser.id,
      customExceptionalPerms,
      customRevokedPerms
    );
    setPermissionTargetUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and New User Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl glass-surface border border-[var(--border)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Comptes Personnels & Habilitations FONA Digital
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {users.length} comptes nominatifs individuels enregistrés &middot; Aucun compte partagé &middot; Traçabilité inaltérable
          </p>
        </div>

        <GlassButton
          variant="gold"
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Créer un Compte Nominatif
        </GlassButton>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, identifiant, téléphone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-cyan-400"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)] focus:outline-none focus:border-cyan-400"
        >
          <option value="ALL">Tous les 5 rôles principaux ({users.length})</option>
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)] focus:outline-none focus:border-cyan-400"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIF">Comptes Actifs</option>
          <option value="INACTIF">Comptes Inactifs (Désactivés)</option>
          <option value="SUSPENDU">Comptes Suspendus</option>
        </select>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map((user) => {
          const userStatus: UserStatus = user.status || "ACTIF";
          const site = clinicSites.find((s) => s.id === user.clinicSiteId);
          const hasCustomPerms = Boolean(
            (user.exceptionalPermissions && user.exceptionalPermissions.length > 0) ||
            (user.revokedPermissions && user.revokedPermissions.length > 0)
          );

          return (
            <GlassCard
              key={user.id}
              className={`p-5 space-y-4 transition-all ${
                userStatus === "INACTIF"
                  ? "opacity-60 border-slate-700"
                  : userStatus === "SUSPENDU"
                  ? "border-red-500/30 bg-red-950/10"
                  : ""
              }`}
            >
              {/* User Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <GlassAvatar
                    role={user.role}
                    name={user.fullName}
                    size="lg"
                    showStatus={userStatus === "ACTIF"}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{user.fullName}</h4>
                      {userStatus === "ACTIF" && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Actif
                        </span>
                      )}
                      {userStatus === "INACTIF" && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                          Inactif
                        </span>
                      )}
                      {userStatus === "SUSPENDU" && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          Suspendu
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#B48B2E] dark:text-[#D9B45B] mt-0.5">
                      {ROLE_LABELS[user.role]}
                    </p>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">@{user.username}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenPermissionsModal(user)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      hasCustomPerms
                        ? "bg-[#D9B45B]/15 border-[#D9B45B]/40 text-[#D9B45B]"
                        : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                    }`}
                    title="Gérer les permissions personnalisées"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                    title="Modifier les coordonnées"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleResetPassword(user)}
                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                    title="Réinitialiser le mot de passe"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Exceptional Permissions Badge */}
              {hasCustomPerms && (
                <div className="px-3 py-1.5 rounded-xl bg-[#D9B45B]/10 border border-[#D9B45B]/30 flex items-center justify-between text-[11px]">
                  <span className="text-[#D9B45B] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Permissions individuelles ajustées
                  </span>
                  <span className="text-[10px] text-slate-300">
                    +{user.exceptionalPermissions?.length || 0} accordée(s) &middot; -{user.revokedPermissions?.length || 0} révoquée(s)
                  </span>
                </div>
              )}

              {/* User Details */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{user.department}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate font-mono">{user.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate text-[var(--text-muted)]">{user.email || "Non renseigné"}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 text-[var(--text-muted)]">
                  <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>Dernière connexion : <b className="text-[var(--text-primary)] font-semibold">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Jamais connecté"}</b></span>
                </div>
              </div>

              {/* Status Action Buttons (No permanent delete per specification) */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-[11px]">
                <span className="text-[10px] text-[var(--text-muted)]">
                  Site : <span className="text-[var(--text-secondary)] font-medium">{site?.name.split(" (")[0] || "CM FONA"}</span>
                </span>

                <div className="flex items-center gap-2">
                  {userStatus === "ACTIF" ? (
                    <>
                      <button
                        onClick={() => toggleUserStatus(user.id, "INACTIF")}
                        className="px-2.5 py-1 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-all cursor-pointer"
                        title="Désactiver l'accès sans supprimer les antécédents"
                      >
                        Désactiver
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id, "SUSPENDU")}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[10px] font-semibold transition-all cursor-pointer"
                      >
                        Suspendre
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleUserStatus(user.id, "ACTIF")}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 transition-all cursor-pointer"
                    >
                      Réactiver le compte
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Audit Protection Notice */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-start gap-3 text-xs text-blue-200">
        <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Règle de gouvernance & traçabilité FONA :</strong> Les comptes utilisateurs ne sont jamais supprimés physiquement. La désactivation conserve l'intégralité des signatures médicales passées, des consultations et de l'historique d'audit.
        </div>
      </div>

      {/* User Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                {editingUser ? "Modifier le Compte Collaborateur" : "Créer un Compte Nominatif (Collaborateur)"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <GlassInput
                  label="Nom & Prénoms *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ex: Dr. Kouamé Paul"
                  required
                />
                <GlassInput
                  label="Identifiant Nominatif *"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: p.kouame"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <GlassSelect
                  label="Rôle Fonctionnel Principal"
                  value={role}
                  onChange={(e) => {
                    const nextRole = e.target.value as Role;
                    setRole(nextRole);
                    if (nextRole === "PRACTITIONER") setAvatarVariant("doctor");
                    else if (nextRole === "NURSE") setAvatarVariant("nurse");
                    else if (nextRole === "MIDWIFE") setAvatarVariant("midwife");
                    else if (nextRole === "RECEPTION_CAISSE") setAvatarVariant("reception");
                    else if (nextRole === "ADMIN") setAvatarVariant("admin");
                    else if (nextRole === "LAB") setAvatarVariant("lab");
                    else if (nextRole === "IMAGING") setAvatarVariant("imaging");
                  }}
                  options={Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
                />
                <GlassInput
                  label="Département / Service *"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="ex: Maternité & CPN"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <GlassInput
                  label="Téléphone Professionnel *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+225 07..."
                  required
                />
                <GlassInput
                  label="Adresse Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@cmfona.ml"
                />
              </div>

              <GlassSelect
                label="Site Clinique d'Affectation"
                value={clinicSiteId}
                onChange={(e) => setClinicSiteId(e.target.value)}
                options={clinicSites.map((s) => ({ value: s.id, label: s.name }))}
              />

              {!editingUser && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed">
                  <span className="font-bold text-amber-300">Procédure de sécurité FONA :</span> Un mot de passe temporaire unique sera généré automatiquement. Le renouvellement du mot de passe sera imposé à la première connexion.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <GlassButton
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </GlassButton>
                <GlassButton type="submit" variant="gold" size="sm">
                  {editingUser ? "Enregistrer les modifications" : "Créer & Émettre Accès"}
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Temporary Password Modal */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface-elevated)] border border-amber-500/40 p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-[#D9B45B]">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                {tempPasswordModal.isNewAccount ? "Compte Créé — Mot de Passe Temporaire" : "Mot de Passe Temporaire Réinitialisé"}
              </h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Le compte nominatif pour <strong className="text-[var(--text-primary)]">{tempPasswordModal.user.fullName}</strong> (@{tempPasswordModal.user.username}) est prêt. Veuillez lui communiquer ses accès :
            </p>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-cyan-400/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Identifiant : <b className="text-white font-mono">@{tempPasswordModal.user.username}</b></span>
                <span className="text-[10px] text-amber-400">Renouvellement obligatoire</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-base font-bold text-[#55D9FF] select-all tracking-wider">
                  {tempPasswordModal.pass}
                </span>
                <button
                  onClick={copyPasswordToClipboard}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-[#55D9FF] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-amber-300/90 italic">
              ⚠️ Le mot de passe ne sera plus jamais affiché en clair par souci de sécurité.
            </p>

            <div className="flex justify-end pt-2">
              <GlassButton
                variant="gold"
                size="sm"
                onClick={() => setTempPasswordModal(null)}
              >
                Compris & Fermer
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Exceptionnelles Manager Modal */}
      {permissionTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-2xl my-6 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D9B45B]/15 border border-[#D9B45B]/30 flex items-center justify-center text-[#D9B45B]">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Permissions Individuelles — {permissionTargetUser.fullName}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Rôle de base : <strong className="text-[#D9B45B]">{ROLE_LABELS[permissionTargetUser.role]}</strong> &middot; Dérogation et ajustement unitaire
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPermissionTargetUser(null)}
                className="w-8 h-8 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-xs text-cyan-200 leading-relaxed flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-cyan-300" />
                <div>
                  <span className="font-bold text-white">Principe des permissions exceptionnelles FONA :</span> Vous pouvez accorder des droits supplémentaires à un collaborateur (ex: autoriser une infirmière spécifique à lire et imprimer les consultations sans pouvoir les modifier) ou révoquer un droit standard sans modifier son rôle principal.
                </div>
              </div>

              {/* Matrix of Permission Groups */}
              <div className="space-y-5">
                {ALL_PERMISSION_GROUPS.map((group) => (
                  <div key={group.category} className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] border-l-2 border-cyan-400 pl-2">
                      {group.category}
                    </h4>

                    <div className="divide-y divide-[var(--border)] rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] overflow-hidden">
                      {group.items.map((item) => {
                        const isInherited = ROLE_PERMISSIONS[permissionTargetUser.role]?.includes(item.key);
                        const isRevoked = customRevokedPerms.includes(item.key);
                        const isGranted = customExceptionalPerms.includes(item.key);
                        const effective = (isInherited && !isRevoked) || isGranted;

                        return (
                          <div
                            key={item.key}
                            className="p-3 flex items-center justify-between gap-3 hover:bg-[var(--surface)] transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[var(--text-primary)]">{item.label}</span>
                                <span className="text-[10px] font-mono text-[var(--text-muted)]">[{item.key}]</span>
                                {isGranted && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#D9B45B]/15 text-[#D9B45B] border border-[#D9B45B]/30">
                                    Accord Exceptionnel
                                  </span>
                                )}
                                {isRevoked && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                    Révoqué
                                  </span>
                                )}
                                {isInherited && !isRevoked && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    Inclus par Rôle
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{item.description}</p>
                            </div>

                            {/* Toggle Button */}
                            <button
                              type="button"
                              onClick={() => togglePermissionForTargetUser(item.key)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                effective
                                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                              }`}
                            >
                              {effective ? "Actif (Autorisé)" : "Inactif (Refusé)"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-subtle)]">
              <span className="text-xs text-[var(--text-muted)]">
                Ajustements : +{customExceptionalPerms.length} dérogation(s) &middot; -{customRevokedPerms.length} révocation(s)
              </span>
              <div className="flex items-center gap-3">
                <GlassButton
                  variant="subtle"
                  size="sm"
                  onClick={() => setPermissionTargetUser(null)}
                >
                  Annuler
                </GlassButton>
                <GlassButton
                  variant="gold"
                  size="sm"
                  icon={<Check className="w-4 h-4" />}
                  onClick={handleSavePermissions}
                >
                  Appliquer les Permissions
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
