export const fmt = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  Number(n).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    ...opts,
  });

export const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

export const fmtDeltaEur = (n: number) => `${n > 0 ? "+" : ""}${fmt(n)}`;

export function futureValue(
  initial: number,
  monthlyContribution: number,
  annualRatePct: number,
  years: number
): number {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return initial + monthlyContribution * n;
  const fvInitial = initial * Math.pow(1 + r, n);
  const fvContrib = monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);
  return fvInitial + fvContrib;
}

export function growthSeries(
  initial: number,
  monthlyContribution: number,
  annualRatePct: number,
  years: number
) {
  const r = annualRatePct / 100 / 12;
  const points: { month: number; label: string; value: number; capital: number }[] = [];
  for (let m = 0; m <= years * 12; m++) {
    const value =
      r === 0
        ? initial + monthlyContribution * m
        : initial * Math.pow(1 + r, m) +
          monthlyContribution * ((Math.pow(1 + r, m) - 1) / (r || 1));
    const capital = initial + monthlyContribution * m;
    if (m % 3 === 0 || m === years * 12) {
      points.push({
        month: m,
        label: m % 12 === 0 ? `${m / 12}a` : "",
        value: Math.round(value),
        capital: Math.round(capital),
      });
    }
  }
  return points;
}

export const normalize = (s = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
