"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { fmt, fmtPct } from "@/lib/utils";
import { currentValue, monthlyPct, CATEGORY_COLORS, FALLBACK_COLOR } from "@/constants";
import { AccountAvatar } from "@/components/ui/account-avatar";
import { MonthlyEntries } from "@/components/accounts/monthly-entries";
import type { PatrimonyAccount } from "@/types";

interface ComptesTabProps {
  accounts: PatrimonyAccount[];
  categories: string[];
  updateAccount: (id: string, patch: Partial<PatrimonyAccount>) => void;
  deleteAccount: (id: string) => void;
  onAdd: () => void;
  currentMonthIndex: number;
}

export function ComptesTab({
  accounts,
  categories,
  updateAccount,
  deleteAccount,
  onAdd,
  currentMonthIndex,
}: ComptesTabProps) {
  const [editing, setEditing] = useState<string | null>(null);

  const grouped = categories
    .map((c) => ({
      category: c,
      accounts: accounts.filter((a) => a.category === c),
    }))
    .filter((g) => g.accounts.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2">
        <div className="text-xl font-bold text-neutral-900">Mes comptes</div>
        <button
          onClick={onAdd}
          className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center active:scale-95 transition cursor-pointer"
        >
          <Plus size={20} />
        </button>
      </div>

      {grouped.map((g) => {
        const colors = CATEGORY_COLORS[g.category] || FALLBACK_COLOR;
        const subtotal = g.accounts.reduce((s, a) => s + currentValue(a), 0);
        return (
          <div key={g.category}>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                <span className="text-sm font-semibold text-neutral-700">{g.category}</span>
              </div>
              <span className="text-sm font-semibold text-neutral-400">{fmt(subtotal)}</span>
            </div>
            <div className="rounded-2xl bg-white overflow-hidden divide-y divide-neutral-100">
              {g.accounts.map((a) => {
                const pct = monthlyPct(a);
                return (
                  <div key={a.id} className="px-4 py-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AccountAvatar account={a} size="h-9 w-9 text-[11px]" />
                        <div className="font-semibold text-neutral-900 truncate">{a.name}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold text-neutral-900">
                            {fmt(currentValue(a))}
                          </div>
                          <div
                            className={`text-[11px] font-semibold ${
                              pct >= 0 ? "text-emerald-600" : "text-red-500"
                            }`}
                          >
                            {fmtPct(pct)} vs mois préc.
                          </div>
                        </div>
                        <button
                          onClick={() => setEditing(editing === a.id ? null : a.id)}
                          className="text-neutral-400 cursor-pointer"
                        >
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => deleteAccount(a.id)} className="text-red-400 cursor-pointer">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {editing === a.id && (
                      <div className="mt-3.5 space-y-3.5">
                        <label className="block text-xs text-neutral-500 max-w-[160px]">
                          Versement mensuel
                          <input
                            type="number"
                            className="mt-1 w-full rounded-lg bg-neutral-100 px-2.5 py-2 text-sm font-medium text-neutral-900 outline-none"
                            value={a.monthly}
                            onChange={(e) =>
                              updateAccount(a.id, { monthly: Number(e.target.value) })
                            }
                          />
                        </label>
                        <MonthlyEntries account={a} updateAccount={updateAccount} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {grouped.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-neutral-300 mb-3">
            <Plus size={40} />
          </div>
          <p className="text-sm text-neutral-500 font-medium">Aucun compte pour l&apos;instant</p>
          <p className="text-xs text-neutral-400 mt-1">
            Commencez par ajouter votre premier compte
          </p>
          <button
            onClick={onAdd}
            className="mt-4 rounded-xl bg-neutral-900 text-white text-sm font-semibold px-5 py-2.5 cursor-pointer active:scale-95 transition"
          >
            Ajouter un compte
          </button>
        </div>
      )}
    </div>
  );
}
