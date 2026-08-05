"use client";

import type { UnitKey } from "@/types";

interface UnitToggleProps {
  value: UnitKey;
  onChange: (unit: UnitKey) => void;
  dark?: boolean;
}

export function UnitToggle({ value, onChange, dark = false }: UnitToggleProps) {
  const isEur = value === "eur";
  return (
    <button
      onClick={() => onChange(isEur ? "pct" : "eur")}
      title={isEur ? "Afficher en %" : "Afficher en €"}
      className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 cursor-pointer ${
        dark
          ? isEur
            ? "bg-white text-neutral-900 border border-white"
            : "bg-transparent text-neutral-300 border border-white/30"
          : isEur
          ? "bg-neutral-900 text-white border border-neutral-900"
          : "bg-transparent text-neutral-400 border border-neutral-300"
      }`}
    >
      {isEur ? "€" : "%"}
    </button>
  );
}
