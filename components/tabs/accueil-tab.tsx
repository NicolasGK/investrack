"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Plus, ChevronRight, Sparkles, LogOut,
  TrendingUp, Wallet, BarChart3,
} from "lucide-react";
import { fmt, fmtPct, fmtDeltaEur } from "@/lib/utils";
import {
  currentValue, monthlyPct, CATEGORY_COLORS, FALLBACK_COLOR, HORIZONS,
  periodWindow, periodInterestPct, ordinalToLabel, PERIOD_LABELS,
} from "@/constants";
import { PeriodSelector } from "@/components/ui/period-selector";
import { UnitToggle } from "@/components/ui/unit-toggle";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { AccountAvatar } from "@/components/ui/account-avatar";
import type { PatrimonyAccount, MonthlyTotal, PeriodKey, UnitKey } from "@/types";

interface AccueilTabProps {
  accounts: PatrimonyAccount[];
  categories: string[];
  monthlyTotals: MonthlyTotal[];
  projectionAt: (years: number) => number;
  onAdd: () => void;
  onOpenAccount: (id: string) => void;
  onSignOut?: () => void;
  userName?: string;
}

export function AccueilTab({
  accounts,
  categories,
  monthlyTotals,
  projectionAt,
  onAdd,
  onOpenAccount,
  onSignOut,
  userName = "vous",
}: AccueilTabProps) {
  const [period, setPeriod] = useState<PeriodKey>("1Y");
  const [unit, setUnit] = useState<UnitKey>("pct");

  const totalNow = monthlyTotals.length ? monthlyTotals[monthlyTotals.length - 1].total : 0;

  const totalsPoints = monthlyTotals.map((m) => ({ i: m.i, v: m.total }));
  const win = periodWindow(totalsPoints, period);
  const evolPct = periodInterestPct(win.baseline, win.current);
  const evolEur = (win.current?.v ?? 0) - (win.baseline?.v ?? 0);
  const chartData = win.points.map((p) => ({
    label: ordinalToLabel(p.i),
    total: Math.round(p.v),
  }));

  const categoryBreakdown = categories
    .map((category) => {
      const total = accounts
        .filter((a) => a.category === category)
        .reduce((sum, a) => sum + currentValue(a), 0);
      return { category, total, pct: totalNow ? (total / totalNow) * 100 : 0 };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  // ── Écran d'onboarding pour les nouveaux utilisateurs ──────────────────────
  if (accounts.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-sm text-neutral-500">Bonjour</div>
            <div className="text-xl font-bold text-neutral-900 capitalize">{userName}</div>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              title="Se déconnecter"
              className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-400 hover:text-neutral-700 active:scale-95 transition cursor-pointer"
            >
              <LogOut size={17} />
            </button>
          )}
        </div>

        {/* Hero card d'onboarding */}
        <div className="rounded-3xl bg-neutral-900 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-emerald-400/15 flex items-center justify-center shrink-0">
              <TrendingUp size={22} className="text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-white text-base leading-tight">
                Bienvenue sur Investrack
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                Votre patrimoine, enfin visible
              </div>
            </div>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed mb-5">
            Ajoutez vos comptes et saisissez vos soldes — le graphique se construit automatiquement
            au fil du temps.
          </p>
          <button
            onClick={onAdd}
            className="w-full rounded-2xl bg-emerald-400 text-neutral-900 font-bold py-3.5 text-sm active:scale-[0.98] transition cursor-pointer"
          >
            Ajouter mon premier compte
          </button>
        </div>

        {/* Étapes */}
        <div className="rounded-2xl bg-white p-4 space-y-4">
          <div className="text-sm font-semibold text-neutral-900">Comment ça marche ?</div>
          {[
            {
              icon: <Wallet size={18} className="text-emerald-600" />,
              bg: "bg-emerald-50",
              step: "1",
              title: "Ajoutez un compte",
              desc: "Banque, livret, investissement… choisissez parmi nos prestataires ou ajoutez le vôtre.",
            },
            {
              icon: <BarChart3 size={18} className="text-blue-600" />,
              bg: "bg-blue-50",
              step: "2",
              title: "Saisissez votre solde",
              desc: "Entrez la valeur actuelle de chaque compte. Mettez-la à jour chaque mois.",
            },
            {
              icon: <TrendingUp size={18} className="text-violet-600" />,
              bg: "bg-violet-50",
              step: "3",
              title: "Visualisez votre évolution",
              desc: "Le graphique affiche l'évolution de votre patrimoine sur la période de votre choix.",
            },
          ].map(({ icon, bg, step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-neutral-900">{title}</div>
                <div className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA secondaire */}
        <button
          onClick={onAdd}
          className="w-full rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-500 text-sm font-semibold py-4 flex items-center justify-center gap-2 active:bg-neutral-50 transition cursor-pointer"
        >
          <Plus size={16} />
          Ajouter un compte
        </button>
      </div>
    );
  }

  // ── Vue normale avec données ────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-sm text-neutral-500">Bonjour</div>
          <div className="text-xl font-bold text-neutral-900 capitalize">{userName}</div>
        </div>
        <div className="flex items-center gap-2">
          {onSignOut && (
            <button
              onClick={onSignOut}
              title="Se déconnecter"
              className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-400 hover:text-neutral-700 active:scale-95 transition cursor-pointer"
            >
              <LogOut size={17} />
            </button>
          )}
          <button
            onClick={onAdd}
            className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-700 active:scale-95 transition cursor-pointer"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Carte patrimoine total */}
      <div className="rounded-3xl bg-neutral-900 p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="text-sm text-neutral-400">Patrimoine total</div>
          <div className="flex flex-col items-end gap-2">
            <PeriodSelector value={period} onChange={setPeriod} dark />
            <UnitToggle value={unit} onChange={setUnit} dark />
          </div>
        </div>
        <div className="mt-1 text-4xl font-bold tracking-tight">{fmt(totalNow)}</div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              evolPct >= 0 ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"
            }`}
          >
            {evolPct >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {unit === "pct" ? fmtPct(evolPct) : fmtDeltaEur(evolEur)}
          </span>
          <span className="text-xs text-neutral-500">{PERIOD_LABELS[period]}</span>
        </div>

        <div className="mt-5 h-32 -mx-2">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" hide />
                <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  fill="url(#totalFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-1.5 opacity-50">
              <BarChart3 size={24} className="text-neutral-400" />
              <p className="text-xs text-neutral-400">
                Mettez à jour vos comptes chaque mois pour voir l&apos;évolution
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Répartition par catégorie */}
      <div className="rounded-2xl bg-white p-4">
        <div className="text-sm font-semibold text-neutral-900 mb-3">
          Répartition par catégorie
        </div>
        <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden flex">
          {categoryBreakdown.map((c) => (
            <div
              key={c.category}
              className={(CATEGORY_COLORS[c.category] || FALLBACK_COLOR).dot}
              style={{ width: `${c.pct}%` }}
            />
          ))}
        </div>
        <div className="mt-3.5 space-y-2.5">
          {categoryBreakdown.map((c) => {
            const colors = CATEGORY_COLORS[c.category] || FALLBACK_COLOR;
            return (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                  <span className="font-medium text-neutral-700">{c.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900">{fmt(c.total)}</span>
                  <span className="text-xs text-neutral-400 w-9 text-right">
                    {c.pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des comptes — cliquables */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-neutral-900">Comptes</div>
          <button
            onClick={onAdd}
            className="text-sm font-medium text-neutral-500 flex items-center gap-0.5 cursor-pointer"
          >
            Ajouter <ChevronRight size={15} />
          </button>
        </div>
        <div className="rounded-2xl bg-white overflow-hidden divide-y divide-neutral-100">
          {accounts.map((a, i) => {
            const cur = currentValue(a);
            const pct = monthlyPct(a);
            return (
              <button
                key={a.id}
                onClick={() => onOpenAccount(a.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-neutral-50 transition text-left cursor-pointer"
              >
                <AccountAvatar account={a} index={i} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-neutral-900 truncate">{a.name}</div>
                  <div className="text-xs text-neutral-400">{a.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-neutral-900">{fmt(cur)}</div>
                  <div
                    className={`text-xs font-semibold ${
                      pct >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {fmtPct(pct)}
                  </div>
                </div>
                <ChevronRight size={16} className="text-neutral-300 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Projections rapides */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={16} className="text-neutral-400" />
          <div className="text-lg font-bold text-neutral-900">Projections</div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {HORIZONS.map((y) => (
            <div key={y} className="rounded-2xl bg-white p-3.5">
              <div className="text-xs text-neutral-400 font-medium">{y} ans</div>
              <div className="mt-1 text-sm font-bold text-neutral-900 leading-tight">
                {fmt(projectionAt(y), { maximumFractionDigits: 0 })}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-neutral-400 leading-relaxed">
          Basé sur vos versements mensuels et taux par compte — modifiables dans l&apos;onglet
          Projection.
        </p>
      </div>
    </div>
  );
}
