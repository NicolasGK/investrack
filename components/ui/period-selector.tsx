"use client";

import { PERIODS } from "@/constants";
import type { PeriodKey } from "@/types";

interface PeriodSelectorProps {
  value: PeriodKey;
  onChange: (period: PeriodKey) => void;
  dark?: boolean;
}

export function PeriodSelector({ value, onChange, dark = false }: PeriodSelectorProps) {
  return (
    <div className={`inline-flex rounded-full p-1 gap-0.5 ${dark ? "bg-white/10" : "bg-neutral-100"}`}>
      {PERIODS.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
            value === opt
              ? dark
                ? "bg-white text-neutral-900"
                : "bg-neutral-900 text-white"
              : dark
              ? "text-neutral-300"
              : "text-neutral-500"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
