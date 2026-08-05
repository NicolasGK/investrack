import type { PatrimonyAccount, Provider, PeriodKey } from "@/types";

// ── Couleurs catégories ──────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Investissement: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Livret: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Épargne: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Autre: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
};

export const FALLBACK_COLOR = { bg: "bg-neutral-100", text: "text-neutral-700", dot: "bg-neutral-500" };

export const AVATAR_BG = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

// ── Couleurs d'accent par établissement ──────────────────────────────────────

export const ACCOUNT_HEX: Record<string, string> = {
  TR: "#171717", BX: "#f97316", BB: "#db2777", CA: "#15803d", BP: "#ea580c",
  RV: "#0ea5e9", BNP: "#065f46", SG: "#b91c1c", LCL: "#1e40af", CE: "#dc2626",
  LBP: "#eab308", CM: "#991b1b", N26: "#14b8a6", FO: "#0891b2", YO: "#4f46e5",
  LX: "#9333ea", CB: "#3b82f6", BI: "#facc15", PP: "#1d4ed8", LY: "#c026d3",
  LA: "#2563eb",
};

export const CATEGORY_HEX: Record<string, string> = {
  Investissement: "#10b981",
  Livret: "#3b82f6",
  Épargne: "#f59e0b",
  Autre: "#8b5cf6",
};

export const getAccountAccent = (account: PatrimonyAccount): string =>
  (account.logo?.short && ACCOUNT_HEX[account.logo.short]) ||
  CATEGORY_HEX[account.category] ||
  "#34d399";

// Utilitaires de contraste pour les graphiques sur fond sombre
const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
};
const relLuminance = ([r, g, b]: [number, number, number]): number => {
  const a = [r, g, b].map((v) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};
const lighten = (hex: string, amt: number): string => {
  const [r, g, b] = hexToRgb(hex);
  const mix = (c: number) => Math.round(c * (1 - amt) + 255 * amt);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
export const getChartAccent = (hex: string): string =>
  relLuminance(hexToRgb(hex)) < 0.12 ? lighten(hex, 0.65) : hex;

// ── Système de mois libre (clé "YYYY-MM") ───────────────────────────────────

export const MONTH_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
export const MONTH_FULL = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const TODAY = new Date();
export const CURRENT_YEAR = TODAY.getFullYear();
export const CURRENT_MONTH = TODAY.getMonth() + 1; // 1-12

export const monthKey = (year: number, month: number): string =>
  `${year}-${String(month).padStart(2, "0")}`;

// Ordinal = nombre de mois écoulés depuis l'an 0 (permet de comparer/soustraire)
export const monthKeyToOrdinal = (key: string): number => {
  const [y, m] = key.split("-").map(Number);
  return y * 12 + m;
};
export const ordinalToYearMonth = (ord: number): { year: number; month: number } => {
  const month = ((ord - 1) % 12) + 1;
  const year = Math.floor((ord - 1) / 12);
  return { year, month };
};
export const ordinalToLabel = (ord: number): string => {
  const { year, month } = ordinalToYearMonth(ord);
  return `${MONTH_SHORT[month - 1]} ${String(year).slice(-2)}`;
};
export const monthKeyToLabel = (key: string): string => ordinalToLabel(monthKeyToOrdinal(key));

export const CURRENT_MONTH_KEY = monthKey(CURRENT_YEAR, CURRENT_MONTH);

// Construction d'un historique objet depuis un tableau de valeurs démarrant à (startYear, startMonth)
export const seedHistory = (
  startYear: number,
  startMonth: number,
  values: number[]
): Record<string, number> => {
  const h: Record<string, number> = {};
  values.forEach((v, idx) => {
    const ord = startYear * 12 + startMonth + idx;
    const { year, month } = ordinalToYearMonth(ord);
    h[monthKey(year, month)] = v;
  });
  return h;
};

// ── Utilitaires période graphique ───────────────────────────────────────────

export const PERIODS: PeriodKey[] = ["1M", "6M", "YTD", "1Y", "All"];
export const PERIOD_LABELS: Record<PeriodKey, string> = {
  "1M": "vs il y a 1 mois",
  "6M": "vs il y a 6 mois",
  YTD: "depuis janvier",
  "1Y": "vs il y a 1 an",
  All: "depuis la 1ère saisie",
};

interface PeriodPoint { i: number; v: number }
interface PeriodWindow {
  points: PeriodPoint[];
  baseline: PeriodPoint | null;
  current: PeriodPoint | null;
}

export function periodWindow(points: PeriodPoint[], periodKey: PeriodKey): PeriodWindow {
  if (!points.length) return { points: [], baseline: null, current: null };
  const current = points[points.length - 1];
  if (periodKey === "All") return { points, baseline: points[0], current };

  let startOrd: number;
  if (periodKey === "YTD") {
    const { year } = ordinalToYearMonth(current.i);
    startOrd = year * 12 + 1;
  } else {
    const monthsBack = ({ "1M": 1, "6M": 6, "1Y": 12 } as Record<string, number>)[periodKey] ?? 12;
    startOrd = current.i - monthsBack;
  }

  // baseline = dernier point avant ou à la limite de la période (pour calcul delta)
  let baseline: PeriodPoint | null = null;
  for (const p of points) {
    if (p.i <= startOrd) baseline = p;
    else break;
  }
  if (!baseline) baseline = points[0];

  // Le graphique n'affiche que les points dans la fenêtre (>= startOrd)
  const windowed = points.filter((p) => p.i >= startOrd);
  const chartPoints = windowed.length > 0 ? windowed : [baseline];
  return { points: chartPoints, baseline, current };
}

export const periodInterestPct = (
  baseline: PeriodPoint | null,
  current: PeriodPoint | null
): number =>
  baseline && baseline.v && current ? ((current.v - baseline.v) / baseline.v) * 100 : 0;

// ── Helpers sur les comptes ──────────────────────────────────────────────────

// Entrées triées chronologiquement (uniquement mois avec valeur saisie)
export const accountEntries = (a: PatrimonyAccount) =>
  Object.keys(a.history || {})
    .filter((k) => {
      const v = a.history[k];
      return v !== null && v !== undefined && v !== 0;
    })
    .map((k) => ({ key: k, i: monthKeyToOrdinal(k), v: a.history[k] }))
    .sort((x, y) => x.i - y.i);

export const currentValue = (a: PatrimonyAccount): number => {
  const e = accountEntries(a);
  return e.length ? e[e.length - 1].v : 0;
};

export const previousValue = (a: PatrimonyAccount): number => {
  const e = accountEntries(a);
  return e.length > 1 ? e[e.length - 2].v : currentValue(a);
};

// Variation mensuelle brute (sans déduire les dépôts)
export const monthlyPctRaw = (a: PatrimonyAccount): number => {
  const cur = currentValue(a);
  const prev = previousValue(a);
  return prev ? ((cur - prev) / prev) * 100 : 0;
};

// Variation mensuelle nette : déduit le capital investi ce mois
export const monthlyPct = (a: PatrimonyAccount): number => {
  const e = accountEntries(a);
  if (e.length < 2) return 0;
  const cur = e[e.length - 1];
  const prev = e[e.length - 2];
  const deposit = (a.deposits || {})[cur.key] ?? 0;
  return prev.v ? ((cur.v - prev.v - deposit) / prev.v) * 100 : 0;
};

// Perf nette sur une période (déduit tous les dépôts entre baseline et current)
export const periodNetEur = (
  entries: { key: string; i: number; v: number }[],
  deposits: Record<string, number>,
  baseline: { i: number; v: number } | null,
  current: { i: number; v: number } | null
): number => {
  if (!baseline || !current) return 0;
  const totalDeposits = entries
    .filter((e) => e.i > baseline.i && e.i <= current.i)
    .reduce((s, e) => s + ((deposits || {})[e.key] ?? 0), 0);
  return current.v - baseline.v - totalDeposits;
};

export const periodNetPct = (
  entries: { key: string; i: number; v: number }[],
  deposits: Record<string, number>,
  baseline: { i: number; v: number } | null,
  current: { i: number; v: number } | null
): number => {
  if (!baseline || !baseline.v) return 0;
  return (periodNetEur(entries, deposits, baseline, current) / baseline.v) * 100;
};

// ── Constantes app ────────────────────────────────────────────────────────────

export const HORIZONS = [5, 10, 15, 20, 30];

export const DEFAULT_CATEGORIES = ["Investissement", "Livret", "Épargne", "Autre"];

export const PROVIDERS: Provider[] = [
  { name: "Trade Republic", short: "TR", color: "bg-neutral-900 text-white", domain: "traderepublic.com" },
  { name: "Bricks", short: "BX", color: "bg-orange-500 text-white", domain: "bricks.co" },
  { name: "Boursobank", short: "BB", color: "bg-pink-600 text-white", domain: "boursobank.com" },
  { name: "Crédit Agricole", short: "CA", color: "bg-green-700 text-white", domain: "credit-agricole.fr" },
  { name: "Banque Populaire", short: "BP", color: "bg-orange-600 text-white", domain: "banquepopulaire.fr" },
  { name: "Revolut", short: "RV", color: "bg-sky-500 text-white", domain: "revolut.com" },
  { name: "BNP Paribas", short: "BNP", color: "bg-emerald-800 text-white", domain: "bnpparibas.com" },
  { name: "Société Générale", short: "SG", color: "bg-red-700 text-white", domain: "societegenerale.fr" },
  { name: "LCL", short: "LCL", color: "bg-blue-800 text-white", domain: "lcl.fr" },
  { name: "Caisse d'Épargne", short: "CE", color: "bg-red-600 text-white", domain: "caisse-epargne.fr" },
  { name: "La Banque Postale", short: "LBP", color: "bg-yellow-500 text-black", domain: "labanquepostale.fr" },
  { name: "Crédit Mutuel", short: "CM", color: "bg-red-800 text-white", domain: "creditmutuel.fr" },
  { name: "N26", short: "N26", color: "bg-teal-500 text-white", domain: "n26.com" },
  { name: "Fortuneo", short: "FO", color: "bg-cyan-600 text-white", domain: "fortuneo.fr" },
  { name: "Yomoni", short: "YO", color: "bg-indigo-600 text-white", domain: "yomoni.fr" },
  { name: "Linxea", short: "LX", color: "bg-purple-600 text-white", domain: "linxea.com" },
  { name: "Coinbase", short: "CB", color: "bg-blue-500 text-white", domain: "coinbase.com" },
  { name: "Binance", short: "BI", color: "bg-yellow-400 text-black", domain: "binance.com" },
  { name: "PayPal", short: "PP", color: "bg-blue-700 text-white", domain: "paypal.com" },
  { name: "Lydia / Sumeria", short: "LY", color: "bg-fuchsia-600 text-white", domain: "lydia-app.com" },
  { name: "Livret A", short: "LA", color: "bg-blue-600 text-white", domain: null },
];

// Données de démo (nouveau format "YYYY-MM")
export const SEED_ACCOUNTS: PatrimonyAccount[] = [
  {
    id: "tr",
    name: "Trade Republic",
    category: "Investissement",
    history: seedHistory(2025, 12, [4043.82, 4283.16, 4413.49, 4278.23, 4613.44, 5027.57, 5125.58, 5097.87]),
    deposits: {},
    monthly: 400,
    rate: 7,
    logo: { short: "TR", color: "bg-neutral-900 text-white", domain: "traderepublic.com" },
  },
  {
    id: "bricks",
    name: "Bricks",
    category: "Investissement",
    history: seedHistory(2025, 12, [681.52, 724.96, 768.48, 822.22, 875.85, 929.83, 984.48, 1038.85]),
    deposits: {},
    monthly: 50,
    rate: 9,
    logo: { short: "BX", color: "bg-orange-500 text-white", domain: "bricks.co" },
  },
  {
    id: "revolut",
    name: "Revolut",
    category: "Épargne",
    history: seedHistory(2025, 12, [390.55, 395.44, 367.53, 356.32, 378.52, 410.22, 392.3, 374.86]),
    deposits: {},
    monthly: 20,
    rate: 3,
    logo: { short: "RV", color: "bg-sky-500 text-white", domain: "revolut.com" },
  },
  {
    id: "livreta",
    name: "Livret A",
    category: "Livret",
    history: seedHistory(2025, 12, [3022.89, 3107.89, 3223.34, 2877.89, 2420.89, 2865.89, 3015.89, 3115.89]),
    deposits: {},
    monthly: 100,
    rate: 3,
    logo: { short: "LA", color: "bg-blue-600 text-white" },
  },
];

// ── Migration rétrocompatible depuis l'ancien format tableau ─────────────────

const OLD_MONTH_KEYS = [
  "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06",
  "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12",
];

export function migrateHistory(history: unknown): Record<string, number> {
  if (Array.isArray(history)) {
    const obj: Record<string, number> = {};
    (history as (number | null)[]).forEach((v, i) => {
      if (v !== null && v !== undefined && OLD_MONTH_KEYS[i]) {
        obj[OLD_MONTH_KEYS[i]] = v;
      }
    });
    return obj;
  }
  return (history as Record<string, number>) || {};
}
