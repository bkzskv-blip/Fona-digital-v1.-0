import React, { useState } from "react";
import {
  Sparkles,
  Palette,
  ShieldCheck,
  Save,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GlassCard } from "../../ui/GlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { GlassInput, GlassSelect } from "../../ui/GlassFormControls";
import { FonaLogo } from "../../ui/FonaLogo";
import { GlassAvatar } from "../../ui/GlassAvatar";

export const AdminBrandTab: React.FC = () => {
  const {
    brandSettings,
    updateBrandSettings,
    animationMode,
    setAnimationMode,
    respectSystemMotion,
    setRespectSystemMotion,
    triggerLaunchIntro,
    showToast,
    themeMode,
    resolvedTheme,
    setThemeMode,
  } = useApp();

  const [defaultCabinetTheme, setDefaultCabinetTheme] = useState<"system" | "dark" | "light">(
    brandSettings.defaultCabinetTheme || "system"
  );

  // Branding Form State
  const [orgName, setOrgName] = useState(brandSettings.organizationName);
  const [shortName, setShortName] = useState(brandSettings.shortName);
  const [slogan, setSlogan] = useState(brandSettings.slogan);
  const [clinicAddress, setClinicAddress] = useState(brandSettings.clinicAddress);
  const [clinicPhone, setClinicPhone] = useState(brandSettings.clinicPhone);
  const [clinicEmail, setClinicEmail] = useState(brandSettings.clinicEmail);
  const [activePrimaryChoice, setActivePrimaryChoice] = useState<"secondary_design" | "official_cross">(
    brandSettings.activePrimaryChoice || "secondary_design"
  );

  const [testActionState, setTestActionState] = useState<string | null>(null);

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandSettings({
      organizationName: orgName,
      shortName,
      slogan,
      clinicAddress,
      clinicPhone,
      clinicEmail,
      activePrimaryChoice,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner on Brand Centralization */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#D9B45B] shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Identité Institutionnelle FONA Digital & Système de Logos
            </h4>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Source unique de vérité : toute modification ici est répercutée sur les menus, ordonnances, comptes rendus et reçus.
            </p>
          </div>
        </div>
        <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Actif sur toute l'App
        </span>
      </div>

      {/* Both Official Logos Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Logo Secondaire -> Choisi comme Logo Principal */}
        <GlassCard
          className={`p-5 space-y-3 transition-all ${
            activePrimaryChoice === "secondary_design"
              ? "ring-2 ring-[#55D9FF] bg-cyan-950/20 shadow-[0_0_20px_rgba(85,217,255,0.15)]"
              : "opacity-85"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#55D9FF]/20 text-[#55D9FF] border border-cyan-400/30">
                Logo Principal (App)
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Cœur & Silhouette
              </span>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="primaryLogoChoice"
                checked={activePrimaryChoice === "secondary_design"}
                onChange={() => setActivePrimaryChoice("secondary_design")}
                className="accent-[#55D9FF]"
              />
              <span className="font-semibold text-cyan-300">Sélectionné</span>
            </label>
          </div>

          <div className="h-36 rounded-xl bg-[#030d1a] border border-white/10 p-3 flex items-center justify-center overflow-hidden">
            <img
              src={brandSettings.primaryLogo || "/fona_logo_principal.jpg"}
              alt="Logo Principal FONA"
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain drop-shadow-[0_4px_16px_rgba(217,180,91,0.3)]"
            />
          </div>

          <div className="text-xs text-slate-400 leading-relaxed">
            <p className="font-semibold text-slate-200">
              Symbole Cœur & Silhouette avec Croix Médicale :
            </p>
            <p className="text-[11px] mt-0.5">
              Typographie FONA dorée avec l'élément « O » figurant un cœur humain enveloppant la croix de santé, bandeau Cabinet Médical et devise institutionnelle.
            </p>
          </div>
        </GlassCard>

        {/* Card 2: Logo Officiel -> Référence Institutionnelle */}
        <GlassCard
          className={`p-5 space-y-3 transition-all ${
            activePrimaryChoice === "official_cross"
              ? "ring-2 ring-[#D9B45B] bg-amber-950/20 shadow-[0_0_20px_rgba(217,180,91,0.15)]"
              : "opacity-85"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#D9B45B]/20 text-[#D9B45B] border border-amber-400/30">
                Logo Officiel (Référence)
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Croix & Caducée Serpent
              </span>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="primaryLogoChoice"
                checked={activePrimaryChoice === "official_cross"}
                onChange={() => setActivePrimaryChoice("official_cross")}
                className="accent-[#D9B45B]"
              />
              <span>Définir comme Principal</span>
            </label>
          </div>

          <div className="h-36 rounded-xl bg-[#030d1a] border border-white/10 p-3 flex items-center justify-center overflow-hidden">
            <img
              src={brandSettings.secondaryLogo || "/fona_logo_officiel.jpg"}
              alt="Logo Officiel Institutionnel FONA"
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain drop-shadow-[0_4px_16px_rgba(217,180,91,0.3)]"
            />
          </div>

          <div className="text-xs text-slate-400 leading-relaxed">
            <p className="font-semibold text-slate-200">
              Croix Dorée Monumentale & Caducée Serpent :
            </p>
            <p className="text-[11px] mt-0.5">
              Référence patrimoniale avec la croix de soins or 3D enlacée du serpent d'Asclépios, cartouche doré Cabinet Médical et devise cursive.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Forms & Previews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Logo Dynamic Showcase (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Palette className="w-4 h-4 text-[#55D9FF]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Aperçu Dynamique du Composant FonaLogo
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* Full */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="uppercase font-bold text-slate-400">Variante Full (Grand Format) :</span>
                  <span className="text-[#55D9FF] font-mono">variant="full"</span>
                </div>
                <div className="pt-1">
                  <FonaLogo variant="full" size="md" />
                </div>
              </div>

              {/* Compact */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="uppercase font-bold text-slate-400">Variante Compact (Menu / Header) :</span>
                  <span className="text-[#55D9FF] font-mono">variant="compact"</span>
                </div>
                <div className="pt-1">
                  <FonaLogo variant="compact" size="md" />
                </div>
              </div>

              {/* Icon */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="uppercase font-bold text-slate-400">Variante Icône (Favicon / Réduit) :</span>
                  <span className="text-[#55D9FF] font-mono">variant="icon"</span>
                </div>
                <div className="pt-1 flex items-center gap-3">
                  <FonaLogo variant="icon" size="lg" />
                  <FonaLogo variant="icon" size="md" />
                  <FonaLogo variant="icon" size="sm" />
                </div>
              </div>

              {/* Print / Light Mode */}
              <div className="p-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="uppercase font-bold text-slate-600">Aperçu Impression / Ordonnances :</span>
                  <span className="text-slate-500 font-mono">theme="light"</span>
                </div>
                <div className="pt-1">
                  <FonaLogo variant="full" theme="light" size="sm" />
                </div>
              </div>
            </div>

            {/* Official Colors Swatches */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                Charte Chromatique FONA Medical Liquid Glass :
              </span>
              <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                <div className="p-2 rounded-lg bg-[#071A33] border border-white/20 text-slate-300">
                  #071A33<br/><span className="text-[9px] text-slate-400">Navy Nuit</span>
                </div>
                <div className="p-2 rounded-lg bg-[#1261A0] text-white">
                  #1261A0<br/><span className="text-[9px] text-blue-200">Bleu Santé</span>
                </div>
                <div className="p-2 rounded-lg bg-[#4F7DF3] text-white">
                  #4F7DF3<br/><span className="text-[9px] text-blue-200">Bleu FONA</span>
                </div>
                <div className="p-2 rounded-lg bg-[#55D9FF] text-[#071A33] font-bold">
                  #55D9FF<br/><span className="text-[9px]">Cyan Glass</span>
                </div>
                <div className="p-2 rounded-lg bg-[#D9B45B] text-[#071A33] font-bold">
                  #D9B45B<br/><span className="text-[9px]">Or FONA</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Institution Settings Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#D9B45B]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Coordonnées Institutionnelles & Slogan
              </h3>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Raison Sociale Officielle"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
                <GlassInput
                  label="Nom Court / Acronyme"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                />
              </div>

              <GlassInput
                label="Devise / Slogan Officiel"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
              />

              <GlassInput
                label="Adresse Physique du Siège"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Téléphones Officiels"
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                />
                <GlassInput
                  label="Courriel Central"
                  value={clinicEmail}
                  onChange={(e) => setClinicEmail(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-[var(--border)]">
                <GlassButton
                  type="submit"
                  variant="gold"
                  size="md"
                  icon={<Save className="w-4 h-4" />}
                >
                  Enregistrer l'Identité FONA
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          {/* Theme & Appearance Environment Card (Mode clair / sombre / système) */}
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#55D9FF]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Environnement Visuel & Thème FONA Digital
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--surface-subtle)] text-[#1261A0] dark:text-[#55D9FF] border border-[var(--border)]">
                Résolution : {resolvedTheme === "light" ? "Mode Clair" : "Mode Sombre"}
              </span>
            </div>

            {/* 3 User Theme Modes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] block">
                Votre préférence d'affichage (Utilisateur actif) :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Mode Clair */}
                <button
                  type="button"
                  onClick={() => setThemeMode("light")}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    themeMode === "light"
                      ? "bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-400/30"
                      : "bg-[var(--surface-subtle)] border-[var(--border)] hover:border-[var(--border-active)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Mode Clair</span>
                    </span>
                    {themeMode === "light" && <Check className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Blanc médical lumineux, surfaces glass nacrées, contrastes cliniques optimaux.
                  </p>
                </button>

                {/* 2. Mode Sombre */}
                <button
                  type="button"
                  onClick={() => setThemeMode("dark")}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    themeMode === "dark"
                      ? "bg-[#091f3a]/80 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30 text-white"
                      : "bg-[var(--surface-subtle)] border-[var(--border)] hover:border-[var(--border-active)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-cyan-400" />
                      <span>Mode Sombre</span>
                    </span>
                    {themeMode === "dark" && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Dark Medical Glass, bleus/noirs profonds #06111F, reflets cyan & dorés.
                  </p>
                </button>

                {/* 3. Mode Système */}
                <button
                  type="button"
                  onClick={() => setThemeMode("system")}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    themeMode === "system"
                      ? "bg-[#4F7DF3]/20 border-[#4F7DF3] shadow-md ring-1 ring-[#4F7DF3]/30"
                      : "bg-[var(--surface-subtle)] border-[var(--border)] hover:border-[var(--border-active)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-[#4F7DF3]" />
                      <span>Système (Auto)</span>
                    </span>
                    {themeMode === "system" && <Check className="w-4 h-4 text-[#4F7DF3]" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Suit automatiquement les préférences système de votre smartphone ou ordinateur.
                  </p>
                </button>
              </div>
            </div>

            {/* Cabinet Default Theme for Infrastructure / New Devices */}
            <div className="pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  Thème d'Établissement par Défaut (Siège & Cliniques FONA) :
                </label>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Appliqué par défaut aux nouveaux postes de travail et bornes d'accueil.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <GlassSelect
                  className="w-40 text-xs py-1.5"
                  value={defaultCabinetTheme}
                  onChange={(e) => {
                    const val = e.target.value as "system" | "dark" | "light";
                    setDefaultCabinetTheme(val);
                    updateBrandSettings({ defaultCabinetTheme: val });
                    showToast("SUCCESS", "Thème d'Établissement Mis à Jour", `Thème par défaut fixé sur : ${val.toUpperCase()}`);
                  }}
                  options={[
                    { value: "system", label: "💻 Système (Recommandé)" },
                    { value: "dark", label: "🌙 Sombre (Dark Glass)" },
                    { value: "light", label: "☀️ Clair (Médical Blanc)" },
                  ]}
                />
              </div>
            </div>
          </GlassCard>

          {/* Animation & Liquid Glass Micro-Controls */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#55D9FF]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Fluidité & Moteur d'Animation
                </h3>
              </div>
              <button
                onClick={triggerLaunchIntro}
                className="text-xs text-cyan-600 dark:text-cyan-300 hover:text-[var(--text-primary)] px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-400/20 transition-all cursor-pointer"
              >
                Aperçu du démarrage
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setAnimationMode("full")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  animationMode === "full"
                    ? "bg-[#4F7DF3]/20 border-cyan-400 text-[var(--text-primary)] font-bold shadow-xs"
                    : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-active)]"
                }`}
              >
                <div className="text-xs font-bold text-[var(--text-primary)]">🟢 Complètes</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1">Liquid Glass total</div>
              </button>

              <button
                onClick={() => setAnimationMode("reduced")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  animationMode === "reduced"
                    ? "bg-amber-500/20 border-amber-400 text-[var(--text-primary)] font-bold shadow-xs"
                    : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-active)]"
                }`}
              >
                <div className="text-xs font-bold text-[var(--text-primary)]">🟡 Réduites</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1">Usage intensif</div>
              </button>

              <button
                onClick={() => setAnimationMode("disabled")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  animationMode === "disabled"
                    ? "bg-slate-500/20 border-slate-400 text-[var(--text-primary)] font-bold shadow-xs"
                    : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-active)]"
                }`}
              >
                <div className="text-xs font-bold text-[var(--text-primary)]">⚪ Désactivées</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1">Zéro animation</div>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
