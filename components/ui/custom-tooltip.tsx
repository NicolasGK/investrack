"use client";

import { fmt } from "@/lib/utils";

interface TooltipPayload {
  value: number;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg">
      <div className="text-neutral-400">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-semibold">
          {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}
