"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { fmt, fmtPct, fmtDeltaEur } from "@/lib/utils";
import {
  accountEntries, currentValue, monthlyPct,
  getAccountAccent, getChartAccent,
  periodWindow, periodInterestPct,
  ordinalToLabel, PERIOD_LABELS,
} from "@/constants";
import { PeriodSelector } from "@/components/ui/period-selector";
import { UnitToggle } from "@/components/ui/unit-toggle";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { AccountAvatar } from "@/components/ui/account-avatar";
import { MonthlyEntries } from "@/components/accounts/monthly-entries";
import type { PatrimonyAccount, PeriodKey, UnitKey } from "@/types";

interface AccountDetailTabProps {
  account: PatrimonyAccount;
  updateAccount: (id: string, patch: Partial<PatrimonyAccount>) => void;
  onBack: () => void;
}

export function AccountDetailTab({ account, updateAccount, onBack }: AccountDetailTabProps) {
  const [period, setPeriod] = useState<PeriodKey>("1Y");
  const [unit, setUnit] = useState<UnitKey>("pct");

  const accent = getAccountAccent(account);
  const chartAccent = getChartAccent(accent);

  const points = accountEntries(account).map((e) => ({ i: e.i, v: e.v }));
  const win = periodWindow(points, period);
  const chartData = win.points.map((p) => ({
    label: ordinalToLabel(p.i),
    value: p.v,
  }));

  const cur = currentValue(account);
  const interestPct = periodInterestPct(win.baseline, win.current);
  const interestEur = (win.current?.v ?? 0) - (win.baseline?.v ?? 0);
  const monthPct = monthlyPct(account);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-700 active:scale-95 transition cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <AccountAvatar account={account} size="h-8 w-8 text-[11px]" />
          <span className="font-semibold text-neutral-900">{account.name}</span>
        </div>
        <div className="h-10 w-10" />
      </div>

      {/* Carte thémée */}
      <div
        className="rounded-3xl p-6 text-white relative overflow-hidden"
        style={{ backgroundColor: "#171717" }}
      >
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{ background: `radial-gradient(circle at 15% 0%, ${accent}, transparent 60%)` }}
        />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartAccent }} />
              {account.category}
            </div>
            <div className="flex flex-col items-end gap-2">
              <PeriodSelector value={period} onChange={setPeriod} dark />
              <UnitToggle value={unit} onChange={setUnit} dark />
            </div>
          </div>

          <div className="mt-1 text-4xl font-bold tracking-tight">{fmt(cur)}</div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{
                backgroundColor:
                  interestPct >= 0 ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
                color: interestPct >= 0 ? "#34d399" : "#f87171",
              }}
            >
              {interestPct >= 0 ? (
                <ArrowUpRight size={13} />
              ) : (
                <ArrowDownRight size={13} />
              )}
              {unit === "pct" ? fmtPct(interestPct) : fmtDeltaEur(interestEur)}
            </span>
            <span className="text-xs text-neutral-500">{PERIOD_LABELS[period]}</span>
          </div>

          <div className="mt-5 h-40 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="accountFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartAccent} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={chartAccent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#737373", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={["dataMin - 50", "dataMax + 50"]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartAccent}
                  strokeWidth={2.5}
                  fill="url(#accountFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-white p-3.5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-400 font-medium">Intérêts ({period})</div>
            <UnitToggle value={unit} onChange={setUnit} />
          </div>
          <div
            className={`mt-1 text-sm font-bold leading-tight ${
              interestPct >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {unit === "pct" ? fmtPct(interestPct) : fmtDeltaEur(interestEur)}
          </div>
          <div className="mt-0.5 text-[11px] text-neutral-400 leading-tight">
            ({fmt(win.current?.v ?? 0)} − {fmt(win.baseline?.v ?? 0)}) ÷ {fmt(win.baseline?.v ?? 0)} × 100
          </div>
        </div>
        <div className="rounded-2xl bg-white p-3.5">
          <div className="text-xs text-neutral-400 font-medium">Variation mensuelle</div>
          <div
            className={`mt-1 text-sm font-bold leading-tight ${
              monthPct >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {fmtPct(monthPct)}
          </div>
          <div className="mt-0.5 text-[11px] text-neutral-400">vs mois précédent</div>
        </div>
      </div>

      {/* Hypothèses de projection */}
      <div className="rounded-2xl bg-white p-4">
        <div className="text-sm font-semibold text-neutral-900 mb-3">Hypothèses de projection</div>
        <div className="grid grid-cols-2 gap-2.5">
          <label className="text-xs text-neutral-500">
            Versement / mois
            <input
              type="number"
              className="mt-1 w-full rounded-lg bg-neutral-100 px-2.5 py-2 text-sm font-medium text-neutral-900 outline-none"
              value={account.monthly}
              onChange={(e) => updateAccount(account.id, { monthly: Number(e.target.value) })}
            />
          </label>
          <label className="text-xs text-neutral-500">
            Taux annuel (%)
            <input
              type="number"
              step="0.1"
              className="mt-1 w-full rounded-lg bg-neutral-100 px-2.5 py-2 text-sm font-medium text-neutral-900 outline-none"
              value={account.rate}
              onChange={(e) => updateAccount(account.id, { rate: Number(e.target.value) })}
            />
          </label>
        </div>
      </div>

      {/* Historique mensuel éditable */}
      <div className="rounded-2xl bg-white p-4">
        <MonthlyEntries account={account} updateAccount={updateAccount} />
      </div>
    </div>
  );
}
