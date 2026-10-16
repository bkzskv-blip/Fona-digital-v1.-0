import React, { useState } from "react";
import {
  X,
  Shield,
  Building2,
  Mail,
  Phone,
  Clock,
  Key,
  CheckCircle,
  AlertCircle,
  Lock,
  Save,
  User as UserIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassAvatar } from "../ui/GlassAvatar";
import { ROLE_LABELS } from "../../services/rbacService";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentSite,
    sessions,
    lockSession,
    changeCurrentUserPassword,
    updatePersonalProfile,
    showToast,
    formatDateTime,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"INFO" | "PASSWORD" | "SESSION">("INFO");

  // Contact form
  const [phoneInput, setPhoneInput] = useState(currentUser.phone || "");
  const [emailInput, setEmailInput] = useState(currentUser.email || "");
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Password change form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (!isOpen) return null;

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContact(true);
    try {
      updatePersonalProfile({ phone: phoneInput.trim(), email: emailInput.trim() });
      showToast("SUCCESS", "Profil mis à jour", "Vos coordonnées ont été enregistrées.");
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!oldPassword) {
      setPasswordError("Veuillez renseigner votre mot de passe actuel.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Le nouveau mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = changeCurrentUserPassword(oldPassword, newPassword);
      if (res.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setActiveTab("INFO");
        showToast("SUCCESS", "Mot de passe modifié", "Votre nouveau mot de passe est actif.");
      } else {
        setPasswordError(res.error || "Impossible de modifier le mot de passe.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#020b17]/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[var(--surface-elevated)] border border-[var(--border)] rounded-3xl shadow-2xl z-10 overflow-hidden my-6 animate-fona-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1261A0]/15 border border-[#1261A0]/30 flex items-center justify-center text-[#1261A0] dark:text-[#55D9FF]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Profil</h2>
              <p className="text-xs text-[var(--text-secondary)]">Compte professionnel FONA Digital</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[var(--surface-subtle)] px-6 pt-2 border-b border-[var(--border)] gap-2">
          <button
            onClick={() => setActiveTab("INFO")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "INFO"
                ? "border-[#1261A0] dark:border-[#55D9FF] text-[#1261A0] dark:text-[#55D9FF]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab("PASSWORD")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "PASSWORD"
                ? "border-[#1261A0] dark:border-[#55D9FF] text-[#1261A0] dark:text-[#55D9FF]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Mot de passe
          </button>
          <button
            onClick={() => setActiveTab("SESSION")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "SESSION"
                ? "border-[#1261A0] dark:border-[#55D9FF] text-[#1261A0] dark:text-[#55D9FF]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Session
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: INFORMATIONS */}
          {activeTab === "INFO" && (
            <div className="space-y-5">
              {/* Identity Card */}
              <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center gap-4">
                <GlassAvatar role={currentUser.role} name={currentUser.fullName} size="lg" showStatus />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-[var(--text-primary)] truncate">
                      {currentUser.fullName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D9B45B]/15 text-[#B48B2E] dark:text-[#D9B45B] border border-[#D9B45B]/30">
                      {ROLE_LABELS[currentUser.role]}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {currentUser.department || "Équipe Médicale"} &middot; {currentSite.name}
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSaveContact} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    Téléphone professionnel
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+223 70 00 00 00"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    Adresse e-mail professionnelle
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="nom@cmfona.ml"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingContact}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1261A0] text-white text-xs font-bold hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === "PASSWORD" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Mot de passe actuel *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
                  <input
                    type={showPasswordText ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-2.5 text-[var(--text-secondary)]"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Nouveau mot de passe (min. 6 caractères) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
                  <input
                    type={showPasswordText ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Confirmer le nouveau mot de passe *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
                  <input
                    type={showPasswordText ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1261A0] text-white text-xs font-bold hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Changer le mot de passe</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SESSION */}
          {activeTab === "SESSION" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Statut de la session :</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active et sécurisée
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Dernière connexion :</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {currentUser.lastLoginAt ? formatDateTime(currentUser.lastLoginAt) : "Aujourd'hui"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Site médical :</span>
                  <span className="font-medium text-[var(--text-primary)]">{currentSite.name}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    lockSession();
                  }}
                  className="w-full py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Verrouiller ce poste</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
