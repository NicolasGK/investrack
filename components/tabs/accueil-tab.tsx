"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Plus, ChevronRight, Sparkles, LogOut } from "lucide-react";
import { fmt, fmtPct } from "@/lib/utils";
import { currentValue, monthlyPct, CATEGORY_COLORS, FALLBACK_COLOR, HORIZONS } from "@/constants";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { AccountAvatar } from "@/components/ui/account-avatar";
import type { PatrimonyAccount, ChartPoint } from "@/types";

interface AccueilTabProps {
  accounts: PatrimonyAccount[];
  categories: string[];
  totalNow: number;
  evolPct: number;
  chartData: ChartPoint[];
  projectionAt: (years: number) => number;
  onAdd: () => void;
  onSignOut?: () => void;
  userName?: string;
}

export function AccueilTab({
  accounts,
  categories,
  totalNow,
  evolPct,
  chartData,
  projectionAt,
  onAdd,
  onSignOut,
  userName = "vous",
}: AccueilTabProps) {
  const categoryBreakdown = categories
    .map((category) => {
      const total = accounts
        .filter((a) => a.category === category)
        .reduce((sum, a) => sum + currentValue(a), 0);
      return {
        category,
        total,
        pct: totalNow ? (total / totalNow) * 100 : 0,
      };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

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
        <div className="text-sm text-neutral-400">Patrimoine total</div>
        <div className="mt-1 text-4xl font-bold tracking-tight">{fmt(totalNow)}</div>
        <div className="mt-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              evolPct >= 0
                ? "bg-emerald-400/15 text-emerald-400"
                : "bg-red-400/15 text-red-400"
            }`}
          >
            {evolPct >= 0 ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {fmtPct(evolPct)}
          </span>
          <span className="ml-2 text-xs text-neutral-500">vs mois précédent</span>
        </div>

        <div className="mt-5 h-32 -mx-2">
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
              <div
                key={c.category}
                className="flex items-center justify-between text-sm"
              >
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

      {/* Liste des comptes */}
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
              <div key={a.id} className="flex items-center gap-3 px-4 py-3.5">
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
              </div>
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
