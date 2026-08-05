export interface LogoInfo {
  short?: string;
  color?: string;
  domain?: string | null;
  generic?: boolean;
}

export interface PatrimonyAccount {
  id: string;
  name: string;
  category: string;
  // Historique mensuel : { "YYYY-MM": valeur } — format libre, n'importe quel mois/année
  history: Record<string, number>;
  // Capital investi chaque mois : { "YYYY-MM": montant } — soustrait du gain pour le calcul de perf nette
  deposits: Record<string, number>;
  monthly: number;
  rate: number;
  logo?: LogoInfo | null;
}

export interface Provider {
  name: string;
  short: string;
  color: string;
  domain: string | null;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  pct: number;
}

export interface ChartPoint {
  label: string;
  total: number;
  i: number;
}

export interface MonthlyTotal {
  i: number;
  key: string;
  label: string;
  total: number;
  totalDeposits: number;
  hasData: boolean;
}

export type PeriodKey = "1M" | "6M" | "YTD" | "1Y" | "All";
export type UnitKey = "pct" | "eur";
