"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { fmtPct } from "@/lib/utils";

interface StatBadgeProps {
  value: number;
}

export function StatBadge({ value }: StatBadgeProps) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
      }`}
    >
      {positive ? (
        <ArrowUpRight size={13} strokeWidth={2.5} />
      ) : (
        <ArrowDownRight size={13} strokeWidth={2.5} />
      )}
      {fmtPct(value)}
    </span>
  );
}
