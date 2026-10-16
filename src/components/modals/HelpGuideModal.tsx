import React from "react";
import { X, HelpCircle, Command, Keyboard, Shield, Wifi, HardDrive, Phone, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  const { setIsGlobalSearchOpen } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#020b17]/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[var(--surface-elevated)] border border-[var(--border)] rounded-3xl shadow-2xl z-10 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D9B45B]/15 border border-[#D9B45B]/30 flex items-center justify-center text-[#B48B2E] dark:text-[#D9B45B]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Centre d'Aide & Guide Clinique</h2>
              <p className="text-xs text-[var(--text-secondary)]">Raccourcis clavier, parcours de soins et normes de sécurité FONA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Core Philosophy Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-amber-500/10 border border-cyan-400/25">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1261A0] dark:text-[#55D9FF] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Principe Fondateur FONA Digital</span>
            </div>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed italic">
              « Un patient possède un dossier unique permanent. Chaque nouveau passage crée un nouvel événement médical ou administratif rattaché à ce patient. L'ensemble forme une Timeline chronologique unifiée. »
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-[#55D9FF]" />
              <span>Raccourcis Clavier Rapides</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                onClick={() => {
                  onClose();
                  setIsGlobalSearchOpen(true);
                }}
                className="p-3 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Recherche Globale</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Patient, consultation, acte...</div>
                </div>
                <kbd className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-xs font-mono font-bold text-[#55D9FF]">
                  Ctrl + K
                </kbd>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Fermer les modales</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Annuler l'action en cours</div>
                </div>
                <kbd className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text-secondary)]">
                  Échap
                </kbd>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Impression Document</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Ordonnance, reçu, bilan</div>
                </div>
                <kbd className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text-secondary)]">
                  Ctrl + P
                </kbd>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Navigation Sidebar</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Basée sur le rôle connecté</div>
                </div>
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">Priorité RBAC</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Garanties & Continuité de Service</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
                  <span>RPO Garanti</span>
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">≤ 24 heures</div>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Perte max. de données</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
                  <HardDrive className="w-3.5 h-3.5 text-[#55D9FF]" />
                  <span>RTO Garanti</span>
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">≤ 4 heures</div>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Temps max. de reprise</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
                  <Wifi className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mode Hors-Ligne</span>
                </div>
                <div className="text-sm font-bold text-amber-500">Auto-Sync</div>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">File d'attente locale</p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">Assistance Technique & Urgences Cliniques</div>
                <div className="text-[11px] text-[var(--text-secondary)]">Support FONA Digital disponible 24/7</div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#1261A0] dark:text-[#55D9FF]">+225 27 22 00 00 00</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--surface-subtle)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
