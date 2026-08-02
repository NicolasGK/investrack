import type { PatrimonyAccount, Provider } from "@/types";

export const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Investissement: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  Livret: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Épargne: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Autre: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
};

export const FALLBACK_COLOR = {
  bg: "bg-neutral-100",
  text: "text-neutral-700",
  dot: "bg-neutral-500",
};

export const AVATAR_BG = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

// Calendrier fixe — toutes les saisies mensuelles s'alignent sur ce tableau
export const MONTHS = [
  "Déc 25",
  "Jan 26",
  "Fév 26",
  "Mar 26",
  "Avr 26",
  "Mai 26",
  "Juin 26",
  "Juil 26",
  "Août 26",
  "Sep 26",
  "Oct 26",
  "Nov 26",
  "Déc 26",
];

export const SEEDED_MONTH_COUNT = 8;

export const HORIZONS = [5, 10, 15, 20, 30];

export const DEFAULT_CATEGORIES = [
  "Investissement",
  "Livret",
  "Épargne",
  "Autre",
];

export const PROVIDERS: Provider[] = [
  {
    name: "Trade Republic",
    short: "TR",
    color: "bg-neutral-900 text-white",
    domain: "traderepublic.com",
  },
  {
    name: "Bricks",
    short: "BX",
    color: "bg-orange-500 text-white",
    domain: "bricks.co",
  },
  {
    name: "Boursobank",
    short: "BB",
    color: "bg-pink-600 text-white",
    domain: "boursobank.com",
  },
  {
    name: "Crédit Agricole",
    short: "CA",
    color: "bg-green-700 text-white",
    domain: "credit-agricole.fr",
  },
  {
    name: "Banque Populaire",
    short: "BP",
    color: "bg-orange-600 text-white",
    domain: "banquepopulaire.fr",
  },
  {
    name: "Revolut",
    short: "RV",
    color: "bg-sky-500 text-white",
    domain: "revolut.com",
  },
  {
    name: "BNP Paribas",
    short: "BNP",
    color: "bg-emerald-800 text-white",
    domain: "bnpparibas.com",
  },
  {
    name: "Société Générale",
    short: "SG",
    color: "bg-red-700 text-white",
    domain: "societegenerale.fr",
  },
  {
    name: "LCL",
    short: "LCL",
    color: "bg-blue-800 text-white",
    domain: "lcl.fr",
  },
  {
    name: "Caisse d'Épargne",
    short: "CE",
    color: "bg-red-600 text-white",
    domain: "caisse-epargne.fr",
  },
  {
    name: "La Banque Postale",
    short: "LBP",
    color: "bg-yellow-500 text-black",
    domain: "labanquepostale.fr",
  },
  {
    name: "Crédit Mutuel",
    short: "CM",
    color: "bg-red-800 text-white",
    domain: "creditmutuel.fr",
  },
  {
    name: "N26",
    short: "N26",
    color: "bg-teal-500 text-white",
    domain: "n26.com",
  },
  {
    name: "Fortuneo",
    short: "FO",
    color: "bg-cyan-600 text-white",
    domain: "fortuneo.fr",
  },
  {
    name: "Yomoni",
    short: "YO",
    color: "bg-indigo-600 text-white",
    domain: "yomoni.fr",
  },
  {
    name: "Linxea",
    short: "LX",
    color: "bg-purple-600 text-white",
    domain: "linxea.com",
  },
  {
    name: "Coinbase",
    short: "CB",
    color: "bg-blue-500 text-white",
    domain: "coinbase.com",
  },
  {
    name: "Binance",
    short: "BI",
    color: "bg-yellow-400 text-black",
    domain: "binance.com",
  },
  {
    name: "PayPal",
    short: "PP",
    color: "bg-blue-700 text-white",
    domain: "paypal.com",
  },
  {
    name: "Lydia / Sumeria",
    short: "LY",
    color: "bg-fuchsia-600 text-white",
    domain: "lydia-app.com",
  },
  {
    name: "Livret A",
    short: "LA",
    color: "bg-blue-600 text-white",
    domain: null,
  },
];

// Helpers sur les comptes
export const emptyHistory = (filled: (number | null)[] = []): (number | null)[] => {
  const h: (number | null)[] = Array(MONTHS.length).fill(null);
  filled.forEach((v, i) => (h[i] = v));
  return h;
};

export const accountEntries = (a: PatrimonyAccount) =>
  a.history
    .map((v, i) => ({ i, v }))
    .filter((e) => e.v !== null && e.v !== undefined && e.v !== 0);

export const currentValue = (a: PatrimonyAccount): number => {
  const e = accountEntries(a);
  return e.length ? (e[e.length - 1].v ?? 0) : 0;
};

export const previousValue = (a: PatrimonyAccount): number => {
  const e = accountEntries(a);
  return e.length > 1 ? (e[e.length - 2].v ?? 0) : currentValue(a);
};

export const monthlyPct = (a: PatrimonyAccount): number => {
  const cur = currentValue(a);
  const prev = previousValue(a);
  return prev ? ((cur - prev) / prev) * 100 : 0;
};

export const SEED_ACCOUNTS: PatrimonyAccount[] = [
  {
    id: "tr",
    name: "Trade Republic",
    category: "Investissement",
    history: emptyHistory([4043.82, 4283.16, 4413.49, 4278.23, 4613.44, 5027.57, 5125.58, 5097.87]),
    monthly: 400,
    rate: 7,
    logo: { short: "TR", color: "bg-neutral-900 text-white", domain: "traderepublic.com" },
  },
  {
    id: "bricks",
    name: "Bricks",
    category: "Investissement",
    history: emptyHistory([681.52, 724.96, 768.48, 822.22, 875.85, 929.83, 984.48, 1038.85]),
    monthly: 50,
    rate: 9,
    logo: { short: "BX", color: "bg-orange-500 text-white", domain: "bricks.co" },
  },
  {
    id: "revolut",
    name: "Revolut",
    category: "Épargne",
    history: emptyHistory([390.55, 395.44, 367.53, 356.32, 378.52, 410.22, 392.3, 374.86]),
    monthly: 20,
    rate: 3,
    logo: { short: "RV", color: "bg-sky-500 text-white", domain: "revolut.com" },
  },
  {
    id: "livreta",
    name: "Livret A",
    category: "Livret",
    history: emptyHistory([3022.89, 3107.89, 3223.34, 2877.89, 2420.89, 2865.89, 3015.89, 3115.89]),
    monthly: 100,
    rate: 3,
    logo: { short: "LA", color: "bg-blue-600 text-white" },
  },
];
