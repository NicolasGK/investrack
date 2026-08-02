"use client";

import { useState } from "react";
import { Plus, Check, X, Pencil, Trash2 } from "lucide-react";
import { MONTHS } from "@/constants";
import { accountEntries } from "@/constants";
import { fmt, fmtPct } from "@/lib/utils";
import type { PatrimonyAccount } from "@/types";

interface MonthlyEntriesProps {
  account: PatrimonyAccount;
  updateAccount: (id: string, patch: Partial<PatrimonyAccount>) => void;
}

export function MonthlyEntries({ account, updateAccount }: MonthlyEntriesProps) {
  const [addingMonth, setAddingMonth] = useState<number | "">("");
  const [addingValue, setAddingValue] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const filled = accountEntries(account);
  const availableMonths = MONTHS.map((_, i) => i).filter(
    (i) => account.history[i] == null
  );

  const setValueAt = (idx: number, val: number | null) => {
    const h = [...account.history];
    h[idx] = val;
    updateAccount(account.id, { history: h });
  };

  return (
    <div>
      <div className="text-xs font-semibold text-neutral-500 mb-2">Historique mensuel</div>
      <div className="rounded-xl bg-neutral-50 divide-y divide-neutral-100">
        {filled.length === 0 && (
          <div className="px-3 py-3 text-xs text-neutral-400">
            Aucune saisie pour l&apos;instant
          </div>
        )}
        {filled.map((e, idx) => {
          const prev = idx > 0 ? filled[idx - 1].v : null;
          const pct = prev != null ? ((e.v! - prev) / prev) * 100 : null;
          const isEditing = editingIndex === e.i;
          return (
            <div key={e.i} className="flex items-center gap-2 px-3 py-2.5">
              <span className="text-xs text-neutral-500 w-14 shrink-0">{MONTHS[e.i]}</span>
              {isEditing ? (
                <>
                  <input
                    autoFocus
                    type="number"
                    value={editValue}
                    onChange={(ev) => setEditValue(ev.target.value)}
                    className="flex-1 min-w-0 rounded-lg bg-white border border-neutral-300 px-2.5 py-1.5 text-sm font-medium text-neutral-900 outline-none"
                  />
                  <button
                    onClick={() => {
                      setValueAt(e.i, editValue === "" ? null : Number(editValue));
                      setEditingIndex(null);
                    }}
                    className="text-emerald-600"
                  >
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingIndex(null)} className="text-neutral-400">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-semibold text-neutral-900 text-right">
                    {fmt(e.v!)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold w-11 text-right shrink-0 ${
                      pct === null
                        ? "text-neutral-300"
                        : pct >= 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {pct === null ? "—" : fmtPct(pct)}
                  </span>
                  <button
                    onClick={() => {
                      setEditingIndex(e.i);
                      setEditValue(String(e.v));
                    }}
                    className="text-neutral-400"
                  >
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setValueAt(e.i, null)} className="text-red-400">
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2.5">
        {addingMonth === "" ? (
          <button
            onClick={() => setAddingMonth(availableMonths[0] ?? 0)}
            disabled={availableMonths.length === 0}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 text-neutral-500 text-xs font-semibold py-2.5 disabled:opacity-40"
          >
            <Plus size={14} /> Ajouter une saisie
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5">
            <select
              value={addingMonth}
              onChange={(e) => setAddingMonth(Number(e.target.value))}
              className="rounded-lg bg-white border border-neutral-200 px-2 py-1.5 text-xs font-medium text-neutral-700 outline-none"
            >
              {availableMonths.map((i) => (
                <option key={i} value={i}>
                  {MONTHS[i]}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Montant"
              value={addingValue}
              onChange={(e) => setAddingValue(e.target.value)}
              className="flex-1 min-w-0 rounded-lg bg-white border border-neutral-200 px-2.5 py-1.5 text-sm font-medium text-neutral-900 outline-none"
            />
            <button
              onClick={() => {
                if (addingValue === "") return;
                setValueAt(addingMonth as number, Number(addingValue));
                setAddingMonth("");
                setAddingValue("");
              }}
              className="text-emerald-600"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => {
                setAddingMonth("");
                setAddingValue("");
              }}
              className="text-neutral-400"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
