"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ResponsiveContainer,
} from "recharts";
import { fmt } from "@/lib/utils";
import { futureValue } from "@/lib/utils";
import { currentValue, HORIZONS } from "@/constants";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import type { PatrimonyAccount } from "@/types";

interface ProjectionTabProps {
  accounts: PatrimonyAccount[];
  categories: string[];
  updateAccount: (id: string, patch: Partial<PatrimonyAccount>) => void;
  projectionAt: (years: number) => number;
}

export function ProjectionTab({
  accounts,
  categories,
  updateAccount,
  projectionAt,
}: ProjectionTabProps) {
  const totalNow = accounts.reduce((s, a) => s + currentValue(a), 0);

  const series = useMemo(() => {
    const pts: { year: number; label: string; value: number }[] = [];
    for (let y = 0; y <= 30; y++) {
      const total = accounts.reduce(
        (sum, a) =>
          sum + futureValue(currentValue(a), Number(a.monthly) || 0, Number(a.rate) || 0, y),
        0
      );
      pts.push({ year: y, label: `${y}a`, value: Math.round(total) });
    }
    return pts;
  }, [accounts]);

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <div className="text-xl font-bold text-neutral-900">Projection</div>
        <p className="text-sm text-neutral-400 mt-0.5">
          Votre patrimoine dans le temps, compte par compte
        </p>
      </div>

      <div className="rounded-3xl bg-neutral-900 p-6 text-white">
        <div className="text-sm text-neutral-400">Patrimoine actuel</div>
        <div className="mt-1 text-3xl font-bold tracking-tight">{fmt(totalNow)}</div>

        <div className="mt-5 h-44 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#737373", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={false}
              />
              {HORIZONS.map((y) => (
                <ReferenceDot
                  key={y}
                  x={`${y}a`}
                  y={series[y]?.value}
                  r={4}
                  fill="#34d399"
                  stroke="#0a0a0a"
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {HORIZONS.map((y) => (
            <div key={y} className="text-center">
              <div className="text-[10px] text-neutral-500">{y} ans</div>
              <div className="text-xs font-semibold text-emerald-400">
                {fmt(projectionAt(y), { maximumFractionDigits: 0 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold text-neutral-700 mb-2 px-1">
          Hypothèses par compte
        </div>
        <div className="rounded-2xl bg-white overflow-hidden divide-y divide-neutral-100">
          {accounts.map((a) => (
            <div key={a.id} className="px-4 py-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="font-semibold text-neutral-900">{a.name}</div>
                <div className="text-xs text-neutral-400">{fmt(currentValue(a))}</div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <label className="text-xs text-neutral-500">
                  Versement / mois
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg bg-neutral-100 px-2.5 py-2 text-sm font-medium text-neutral-900 outline-none"
                    value={a.monthly}
                    onChange={(e) => updateAccount(a.id, { monthly: Number(e.target.value) })}
                  />
                </label>
                <label className="text-xs text-neutral-500">
                  Taux annuel (%)
                  <input
                    type="number"
                    step="0.1"
                    className="mt-1 w-full rounded-lg bg-neutral-100 px-2.5 py-2 text-sm font-medium text-neutral-900 outline-none"
                    value={a.rate}
                    onChange={(e) => updateAccount(a.id, { rate: Number(e.target.value) })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-neutral-400 px-1 leading-relaxed">
          Modifiez les montants et taux ci-dessus pour ajuster la projection à votre situation
          réelle.
        </p>
      </div>
    </div>
  );
}
