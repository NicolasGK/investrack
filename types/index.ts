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
  // Tableau de (number | null) — un slot par mois du calendrier MONTHS
  history: (number | null)[];
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
}
