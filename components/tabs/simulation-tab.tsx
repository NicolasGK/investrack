"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fmt } from "@/lib/utils";
import { futureValue, growthSeries } from "@/lib/utils";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

function SimField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  suffix: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <div className="text-xs text-neutral-400 font-medium">{label}</div>
      <div className="mt-1 flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-xl font-bold text-neutral-900 outline-none"
        />
        <span className="text-sm text-neutral-400 font-medium">{suffix}</span>
      </div>
    </div>
  );
}

export function SimulationTab() {
  const [initial, setInitial] = useState<number | string>(1000);
  const [monthly, setMonthly] = useState<number | string>(150);
  const [rate, setRate] = useState<number | string>(7);
  const [years, setYears] = useState<number | string>(15);

  const fv = futureValue(
    Number(initial) || 0,
    Number(monthly) || 0,
    Number(rate) || 0,
    Number(years) || 0
  );
  const capital = (Number(initial) || 0) + (Number(monthly) || 0) * (Number(years) || 0) * 12;
  const interest = fv - capital;
  const series = growthSeries(
    Number(initial) || 0,
    Number(monthly) || 0,
    Number(rate) || 0,
    Number(years) || 0
  );

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <div className="text-xl font-bold text-neutral-900">Simulation</div>
        <p className="text-sm text-neutral-400 mt-0.5">
          Combien rapporte votre épargne placée ?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <SimField label="Capital initial" value={initial} onChange={setInitial} suffix="€" />
        <SimField
          label="Versement mensuel"
          value={monthly}
          onChange={setMonthly}
          suffix="€/mois"
        />
        <SimField label="Taux annuel" value={rate} onChange={setRate} suffix="%" />
        <SimField label="Durée" value={years} onChange={setYears} suffix="ans" />
      </div>

      <div className="rounded-3xl bg-neutral-900 p-6 text-white">
        <div className="text-sm text-neutral-400">Montant final estimé</div>
        <div className="mt-1 text-4xl font-bold tracking-tight">{fmt(fv)}</div>
        <div className="mt-4 flex gap-4">
          <div>
            <div className="text-xs text-neutral-500">Capital versé</div>
            <div className="text-sm font-semibold">{fmt(capital)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Intérêts générés</div>
            <div className="text-sm font-semibold text-emerald-400">{fmt(interest)}</div>
          </div>
        </div>

        <div className="mt-5 h-40 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="simFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#34d399"
                strokeWidth={2.5}
                fill="url(#simFill)"
              />
              <Area
                type="monotone"
                dataKey="capital"
                stroke="#525252"
                strokeWidth={1.5}
                fill="none"
                strokeDasharray="3 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Valeur totale
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" /> Capital versé
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4">
        <div className="text-sm font-semibold text-neutral-900 mb-2">
          Répartition à {years} ans
        </div>
        <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden flex">
          <div className="h-full bg-neutral-400" style={{ width: `${(capital / fv) * 100}%` }} />
          <div className="h-full bg-emerald-500" style={{ width: `${(interest / fv) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-neutral-500">
          <span>Capital {((capital / fv) * 100).toFixed(0)}%</span>
          <span>Intérêts {((interest / fv) * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
