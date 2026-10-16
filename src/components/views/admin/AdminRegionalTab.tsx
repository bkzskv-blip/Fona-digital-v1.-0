import React, { useState, useEffect } from "react";
import {
  Globe2,
  Clock,
  Coins,
  Calendar,
  Phone,
  Save,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Download,
  ShieldCheck,
  Zap,
  Building,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { GlassCard } from "../../ui/GlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { GlassInput, GlassSelect } from "../../ui/GlassFormControls";
import { REGIONAL_PRESETS, exportToExcelCsv } from "../../../services/regionalService";
import { DateFormatPattern, TimeFormatPattern, WeekStartsOn } from "../../../types";

export const AdminRegionalTab: React.FC = () => {
  const {
    regionalSettings,
    updateRegionalSettings,
    resetRegionalSettingsToDefault,
    formatCurrency,
    formatNumber,
    formatDate,
    formatTime,
    formatDateTime,
    formatPhone,
    showToast,
  } = useApp();

  // Form states initialized with context settings
  const [country, setCountry] = useState(regionalSettings.country);
  const [locale, setLocale] = useState(regionalSettings.locale);
  const [language, setLanguage] = useState(regionalSettings.language);
  const [currency, setCurrency] = useState(regionalSettings.currency);
  const [currencyDisplay, setCurrencyDisplay] = useState(regionalSettings.currencyDisplay);
  const [timezone, setTimezone] = useState(regionalSettings.timezone);
  const [dateFormat, setDateFormat] = useState<DateFormatPattern>(regionalSettings.dateFormat);
  const [timeFormat, setTimeFormat] = useState<TimeFormatPattern>(regionalSettings.timeFormat);
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>(regionalSettings.weekStartsOn);
  const [phoneCountryCode, setPhoneCountryCode] = useState(regionalSettings.phoneCountryCode);

  // Sync if context updates
  useEffect(() => {
    setCountry(regionalSettings.country);
    setLocale(regionalSettings.locale);
    setLanguage(regionalSettings.language);
    setCurrency(regionalSettings.currency);
    setCurrencyDisplay(regionalSettings.currencyDisplay);
    setTimezone(regionalSettings.timezone);
    setDateFormat(regionalSettings.dateFormat);
    setTimeFormat(regionalSettings.timeFormat);
    setWeekStartsOn(regionalSettings.weekStartsOn);
    setPhoneCountryCode(regionalSettings.phoneCountryCode);
  }, [regionalSettings]);

  // Live ticking clock for Bamako
  const [currentLiveTime, setCurrentLiveTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleApplyPreset = (presetKey: string) => {
    const preset = REGIONAL_PRESETS[presetKey];
    if (preset) {
      setCountry(preset.settings.country);
      setLocale(preset.settings.locale);
      setLanguage(preset.settings.language);
      setCurrency(preset.settings.currency);
      setCurrencyDisplay(preset.settings.currencyDisplay);
      setTimezone(preset.settings.timezone);
      setDateFormat(preset.settings.dateFormat);
      setTimeFormat(preset.settings.timeFormat);
      setWeekStartsOn(preset.settings.weekStartsOn);
      setPhoneCountryCode(preset.settings.phoneCountryCode);
      showToast("INFO", "Profil Régional Sélectionné", `Paramètres chargés : ${preset.label}`);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateRegionalSettings({
      country,
      locale,
      language,
      currency,
      currencyDisplay,
      timezone,
      dateFormat,
      timeFormat,
      weekStartsOn,
      phoneCountryCode,
    });
  };

  const handleTestExport = () => {
    const headers = ["Référence", "Patient", "Date & Heure Acte", "Montant Prestation", "Téléphone"];
    const rows = [
      ["FAC-2026-0001", "Aminata Ouattara", formatDateTime(new Date()), 25000, "+223 76 89 45 12"],
      ["FAC-2026-0002", "Kouadio N'Guessan", formatDateTime(new Date()), 125500, "+223 65 67 89 01"],
      ["FAC-2026-0003", "Clarisse Brou", formatDateTime(new Date()), 1250000, "+223 78 23 45 67"],
    ];
    exportToExcelCsv("fona_test_export_regional_mali", headers, rows, regionalSettings);
    showToast("SUCCESS", "Export Test Réussi", "Fichier CSV conforme Excel téléchargé selon les formats régionaux du Mali.");
  };

  // Preview samples
  const sampleAmounts = [25000, 125500, 1250000];
  const sampleFloatNumber = 1250500.5;
  const sampleDate = "2026-10-07T14:35:00Z";
  const samplePhone = "66730516";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl glass-surface border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#D9B45B]/20 text-[#D9B45B] border border-[#D9B45B]/30 flex items-center justify-center shrink-0">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Paramètres Régionaux & Localisation FONA Digital
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Source Unique de Vérité
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Configuration centralisée pour le Mali (XOF / FCFA, Africa/Bamako, fr-ML, +223, JJ/MM/AAAA, 24h)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <GlassButton
            type="button"
            variant="secondary"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={resetRegionalSettingsToDefault}
            title="Rétablir les valeurs officielles du Mali"
          >
            Rétablir Mali (Par Défaut)
          </GlassButton>
          <GlassButton
            type="button"
            variant="subtle"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-amber-400" />}
            onClick={handleTestExport}
            title="Tester un export Excel avec ces paramètres"
          >
            Test Export Excel
          </GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D9B45B]" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  Édition des Normes Régionales
                </h4>
              </div>
              <span className="text-[11px] font-mono text-cyan-300">Application immédiate</span>
            </div>

            {/* Presets Selector */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <label className="text-xs font-semibold text-slate-300 block">
                Charger un profil pays prédéfini (Zone UEMOA / CEDEAO) :
              </label>
              <select
                onChange={(e) => handleApplyPreset(e.target.value)}
                defaultValue="MALI_BAMAKO"
                className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
              >
                {Object.entries(REGIONAL_PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Code Pays ISO (country)"
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                  placeholder="ML"
                  required
                />
                <GlassInput
                  label="Locale de Formatage (locale)"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  placeholder="fr-ML"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Langue du Système (language)"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="fr"
                  required
                />
                <GlassInput
                  label="Indicatif Téléphonique Pays (phoneCountryCode)"
                  value={phoneCountryCode}
                  onChange={(e) => setPhoneCountryCode(e.target.value)}
                  placeholder="+223"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Code Devise ISO 4217 (currency)"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="XOF"
                  required
                />
                <GlassInput
                  label="Libellé d'Affichage Devise (currencyDisplay)"
                  value={currencyDisplay}
                  onChange={(e) => setCurrencyDisplay(e.target.value)}
                  placeholder="FCFA"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Fuseau Horaire Métier (timezone)
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="Africa/Bamako">Africa/Bamako (GMT / UTC+00:00) — Mali</option>
                    <option value="Africa/Dakar">Africa/Dakar (GMT / UTC+00:00) — Sénégal</option>
                    <option value="Africa/Abidjan">Africa/Abidjan (GMT / UTC+00:00) — Côte d'Ivoire</option>
                    <option value="Africa/Ouagadougou">Africa/Ouagadougou (GMT / UTC+00:00) — Burkina</option>
                    <option value="Africa/Niamey">Africa/Niamey (WAT / UTC+01:00) — Niger</option>
                    <option value="Africa/Porto-Novo">Africa/Porto-Novo (WAT / UTC+01:00) — Bénin</option>
                    <option value="Africa/Lome">Africa/Lome (GMT / UTC+00:00) — Togo</option>
                    <option value="Africa/Conakry">Africa/Conakry (GMT / UTC+00:00) — Guinée</option>
                    <option value="UTC">UTC (Temps Universel Coordonné)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Format de Date Clinique (dateFormat)
                  </label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value as DateFormatPattern)}
                    className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="dd/MM/yyyy">dd/MM/yyyy (07/10/2026) — Standard Francophone</option>
                    <option value="yyyy-MM-dd">yyyy-MM-dd (2026-10-07) — ISO Standard</option>
                    <option value="MM/dd/yyyy">MM/dd/yyyy (10/07/2026) — US Format</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Format de l'Heure (timeFormat)
                  </label>
                  <select
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value as TimeFormatPattern)}
                    className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="24h">24h (14:35) — Standard Hospitalier</option>
                    <option value="12h">12h (02:35 PM) — Format Anglo-saxon</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Début de Semaine (weekStartsOn)
                  </label>
                  <select
                    value={weekStartsOn}
                    onChange={(e) => setWeekStartsOn(e.target.value as WeekStartsOn)}
                    className="w-full bg-[#051426] border border-white/15 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="monday">Lundi (monday) — Standard FONA</option>
                    <option value="sunday">Dimanche (sunday)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <GlassButton
                  type="submit"
                  variant="gold"
                  size="md"
                  icon={<Save className="w-4 h-4" />}
                >
                  Enregistrer les Paramètres Régionaux
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: Live Visual Formatting Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Bamako Clock Card */}
          <GlassCard className="p-6 space-y-4 border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-[#071A33]/50 to-blue-950/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  Horloge Officielle en Direct
                </h4>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{timezone}</span>
              </span>
            </div>

            <div className="text-center py-3 space-y-1">
              <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wider">
                {formatTime(currentLiveTime)}
              </div>
              <div className="text-sm font-bold text-[#55D9FF]">
                {formatDate(currentLiveTime, { style: "long" })}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Fuseau horaire : GMT (UTC+00:00) &middot; Bamako, Mali
              </div>
            </div>
          </GlassCard>

          {/* Canonical Format Verification Card (User Prompt Specification) */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D9B45B]" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  Aperçu Conforme aux Spécifications
                </h4>
              </div>
              <span className="text-[10px] font-bold text-amber-300">Mali Direct</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Monetary Format */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="font-semibold flex items-center gap-1 text-slate-300">
                    <Coins className="w-3.5 h-3.5 text-[#D9B45B]" />
                    Format monétaire ({currency} / {currencyDisplay})
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">Exemples requis</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  {sampleAmounts.map((amt) => (
                    <div key={amt} className="p-2 rounded-lg bg-[#051426] border border-white/10 font-mono font-bold text-white text-xs">
                      {formatCurrency(amt)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Number Format */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-300 block">Format numérique</span>
                  <span className="text-[10px] text-slate-400">Espace milliers, virgule décimale</span>
                </div>
                <span className="font-mono font-bold text-cyan-300 text-sm px-2.5 py-1 rounded bg-[#051426] border border-white/10">
                  {formatNumber(sampleFloatNumber)}
                </span>
              </div>

              {/* Date Format */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-300 block">Format date ({dateFormat})</span>
                  <span className="text-[10px] text-slate-400">dd/MM/yyyy</span>
                </div>
                <span className="font-mono font-bold text-white text-sm px-2.5 py-1 rounded bg-[#051426] border border-white/10">
                  {formatDate(sampleDate)}
                </span>
              </div>

              {/* Date/Time Format */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-300 block">Format date/heure</span>
                  <span className="text-[10px] text-slate-400">{dateFormat} {timeFormat}</span>
                </div>
                <span className="font-mono font-bold text-[#D9B45B] text-sm px-2.5 py-1 rounded bg-[#051426] border border-white/10">
                  {formatDateTime(sampleDate)}
                </span>
              </div>

              {/* Phone Format */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-300 block">Format téléphone Mali</span>
                  <span className="text-[10px] text-slate-400">Indicatif {phoneCountryCode}</span>
                </div>
                <span className="font-mono font-bold text-emerald-300 text-sm px-2.5 py-1 rounded bg-[#051426] border border-white/10">
                  {formatPhone(samplePhone)}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Storage & Architecture Guarantee Card */}
          <GlassCard className="p-5 space-y-2 border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Zap className="w-4 h-4 text-[#D9B45B]" />
              <span>Garantie d'Architecture Centralisée</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Les montants sont stockés en nombres bruts en base (XOF) et formatés uniquement à l'affichage via le service régional central. Les dates sont stockées en timestamps ISO UTC et converties à la volée dans le fuseau horaire <strong>{timezone}</strong>.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
