import { RegionalSettings } from "../types";

export const DEFAULT_REGIONAL_SETTINGS: RegionalSettings = {
  country: "ML",
  locale: "fr-ML",
  language: "fr",
  currency: "XOF",
  currencyDisplay: "FCFA",
  timezone: "Africa/Bamako",
  dateFormat: "dd/MM/yyyy",
  timeFormat: "24h",
  weekStartsOn: "monday",
  calendar: "gregory",
  phoneCountryCode: "+223",
};

export const REGIONAL_PRESETS: Record<string, { label: string; settings: RegionalSettings }> = {
  MALI_BAMAKO: {
    label: "Mali (Bamako) — FCFA (XOF) [Par Défaut]",
    settings: DEFAULT_REGIONAL_SETTINGS,
  },
  SENEGAL_DAKAR: {
    label: "Sénégal (Dakar) — FCFA (XOF)",
    settings: {
      country: "SN",
      locale: "fr-SN",
      language: "fr",
      currency: "XOF",
      currencyDisplay: "FCFA",
      timezone: "Africa/Dakar",
      dateFormat: "dd/MM/yyyy",
      timeFormat: "24h",
      weekStartsOn: "monday",
      calendar: "gregory",
      phoneCountryCode: "+221",
    },
  },
  COTE_D_IVOIRE_ABIDJAN: {
    label: "Côte d'Ivoire (Abidjan) — FCFA (XOF)",
    settings: {
      country: "CI",
      locale: "fr-CI",
      language: "fr",
      currency: "XOF",
      currencyDisplay: "FCFA",
      timezone: "Africa/Abidjan",
      dateFormat: "dd/MM/yyyy",
      timeFormat: "24h",
      weekStartsOn: "monday",
      calendar: "gregory",
      phoneCountryCode: "+225",
    },
  },
  BURKINA_OUAGADOUGOU: {
    label: "Burkina Faso (Ouagadougou) — FCFA (XOF)",
    settings: {
      country: "BF",
      locale: "fr-BF",
      language: "fr",
      currency: "XOF",
      currencyDisplay: "FCFA",
      timezone: "Africa/Ouagadougou",
      dateFormat: "dd/MM/yyyy",
      timeFormat: "24h",
      weekStartsOn: "monday",
      calendar: "gregory",
      phoneCountryCode: "+226",
    },
  },
  GUINEE_CONAKRY: {
    label: "Guinée (Conakry) — GNF",
    settings: {
      country: "GN",
      locale: "fr-GN",
      language: "fr",
      currency: "GNF",
      currencyDisplay: "GNF",
      timezone: "Africa/Conakry",
      dateFormat: "dd/MM/yyyy",
      timeFormat: "24h",
      weekStartsOn: "monday",
      calendar: "gregory",
      phoneCountryCode: "+224",
    },
  },
};

const STORAGE_KEY = "fona_regional_settings";

export function getStoredRegionalSettings(): RegionalSettings {
  if (typeof window === "undefined") {
    return DEFAULT_REGIONAL_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REGIONAL_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_REGIONAL_SETTINGS,
      ...parsed,
    };
  } catch (err) {
    console.error("Failed to parse stored regional settings:", err);
    return DEFAULT_REGIONAL_SETTINGS;
  }
}

export function saveRegionalSettings(settings: RegionalSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save regional settings to localStorage:", err);
  }
}

/**
 * Format a number according to Mali / French regional rules:
 * Separateur de milliers : espace fine ou espace
 * Séparateur décimal : virgule (,)
 * Ex: 1 250 500,50 ou 1 250 500
 */
export function formatNumber(
  value: number | undefined | null,
  decimals?: number,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "0";
  }

  const hasDecimals = decimals !== undefined ? decimals > 0 : value % 1 !== 0;
  const fractionDigits = decimals !== undefined ? decimals : hasDecimals ? 2 : 0;

  try {
    const formatter = new Intl.NumberFormat(settings.locale || "fr-ML", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      useGrouping: true,
    });
    // Replace non-breaking or thin space with standard no-break space for uniform rendering across fonts
    return formatter.format(value).replace(/\s+/g, " ");
  } catch (e) {
    // Fallback manual formatter: 1 250 500,50
    const fixed = value.toFixed(fractionDigits);
    const [intPart, decPart] = fixed.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return decPart ? `${formattedInt},${decPart}` : formattedInt;
  }
}

/**
 * Format currency according to Mali (XOF / FCFA) specification:
 * 25 000 FCFA
 * 125 500 FCFA
 * 1 250 000 FCFA
 * Avec décimales si non entières : 1 250 500,50 FCFA
 */
export function formatCurrency(
  amount: number | undefined | null,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS,
  options?: { showCurrency?: boolean; decimals?: number }
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `0 ${settings.currencyDisplay}`.trim();
  }

  const showCurrency = options?.showCurrency ?? true;
  const isInteger = amount % 1 === 0;
  const decimals = options?.decimals !== undefined ? options.decimals : isInteger ? 0 : 2;

  const numStr = formatNumber(amount, decimals, settings);
  if (!showCurrency) return numStr;

  return `${numStr} ${settings.currencyDisplay}`;
}

/**
 * Parse any date input into a valid Date object
 */
function parseDateInput(input: string | Date | number | undefined | null): Date | null {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Handle pure date string YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    }

    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Format a Date using the central timezone (Africa/Bamako by default)
 * Standard default format: dd/MM/yyyy (07/10/2026)
 */
export function formatDate(
  dateInput: string | Date | number | undefined | null,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS,
  options?: {
    style?: "numeric" | "short" | "medium" | "long" | "full";
  }
): string {
  const d = parseDateInput(dateInput);
  if (!d) return "-";

  const timezone = settings.timezone || "Africa/Bamako";
  const locale = settings.locale || "fr-ML";
  const style = options?.style || "numeric";

  if (style === "numeric") {
    try {
      const parts = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).formatToParts(d);

      const day = parts.find((p) => p.type === "day")?.value || "01";
      const month = parts.find((p) => p.type === "month")?.value || "01";
      const year = parts.find((p) => p.type === "year")?.value || "2026";

      if (settings.dateFormat === "yyyy-MM-dd") {
        return `${year}-${month}-${day}`;
      }
      if (settings.dateFormat === "MM/dd/yyyy") {
        return `${month}/${day}/${year}`;
      }
      // Default: dd/MM/yyyy
      return `${day}/${month}/${year}`;
    } catch {
      // Fallback
      const day = String(d.getUTCDate()).padStart(2, "0");
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  // Textual styles
  try {
    const dateStyle = style === "short" ? "short" : style === "medium" ? "medium" : style === "long" ? "long" : "full";
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      dateStyle,
    }).format(d);
  } catch {
    return formatDate(d, settings, { style: "numeric" });
  }
}

/**
 * Format time in configured timezone (Africa/Bamako)
 * Format 24h : 14:35
 */
export function formatTime(
  dateInput: string | Date | number | undefined | null,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS,
  options?: { withSeconds?: boolean }
): string {
  const d = parseDateInput(dateInput);
  if (!d) return "--:--";

  const timezone = settings.timezone || "Africa/Bamako";
  const locale = settings.locale || "fr-ML";
  const withSeconds = options?.withSeconds ?? false;
  const hour12 = settings.timeFormat === "12h";

  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: withSeconds ? "2-digit" : undefined,
      hour12,
    }).format(d);
  } catch {
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
}

/**
 * Format date & time combined:
 * Format : 07/10/2026 14:35
 */
export function formatDateTime(
  dateInput: string | Date | number | undefined | null,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS
): string {
  const d = parseDateInput(dateInput);
  if (!d) return "-";

  const datePart = formatDate(d, settings, { style: "numeric" });
  const timePart = formatTime(d, settings);

  return `${datePart} ${timePart}`;
}

/**
 * Format Mali telephone numbers:
 * +223 66 73 05 16
 * +223 69 64 26 46
 */
export function formatPhone(
  phoneNumber: string | undefined | null,
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS
): string {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/[\s.-]/g, "").trim();

  // If already full international code e.g. +223XXXXXXXX
  const countryCode = settings.phoneCountryCode || "+223";
  const codeDigits = countryCode.replace("+", "");

  let nationalNumber = cleaned;
  if (cleaned.startsWith(`+${codeDigits}`)) {
    nationalNumber = cleaned.slice(countryCode.length);
  } else if (cleaned.startsWith(codeDigits)) {
    nationalNumber = cleaned.slice(codeDigits.length);
  } else if (cleaned.startsWith("+")) {
    // Keep other international formats
    return phoneNumber;
  }

  // Malian numbers are 8 digits: XX XX XX XX
  if (nationalNumber.length === 8) {
    const p1 = nationalNumber.slice(0, 2);
    const p2 = nationalNumber.slice(2, 4);
    const p3 = nationalNumber.slice(4, 6);
    const p4 = nationalNumber.slice(6, 8);
    return `${countryCode} ${p1} ${p2} ${p3} ${p4}`;
  }

  // If multiple phones separated by slash
  if (phoneNumber.includes("/")) {
    return phoneNumber
      .split("/")
      .map((part) => formatPhone(part.trim(), settings))
      .join(" / ");
  }

  return phoneNumber;
}

/**
 * Get current time in configured timezone (Africa/Bamako)
 */
export function getBamakoNow(settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS): {
  date: string;
  time: string;
  dateTime: string;
} {
  const now = new Date();
  return {
    date: formatDate(now, settings),
    time: formatTime(now, settings),
    dateTime: formatDateTime(now, settings),
  };
}

/**
 * Generate official CSV for Excel formatted with West African / French standard (semicolon + UTF-8 with BOM)
 */
export function exportToExcelCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  settings: RegionalSettings = DEFAULT_REGIONAL_SETTINGS
): void {
  // UTF-8 BOM so Excel opens with proper accented characters and accents in French
  const BOM = "\uFEFF";
  const delimiter = ";"; // French/European Excel delimiter

  const csvRows = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(delimiter),
    ...rows.map((row) =>
      row
        .map((cell) => {
          if (typeof cell === "number") {
            return formatNumber(cell, cell % 1 === 0 ? 0 : 2, settings);
          }
          return `"${String(cell || "").replace(/"/g, '""')}"`;
        })
        .join(delimiter)
    ),
  ];

  const csvContent = BOM + csvRows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
