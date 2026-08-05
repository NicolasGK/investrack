"use client";

import { useState } from "react";
import { Plus, Check, X, Pencil, Trash2 } from "lucide-react";
import {
  accountEntries, monthKey, monthKeyToOrdinal, ordinalToLabel,
  MONTH_FULL, CURRENT_YEAR, CURRENT_MONTH,
  periodNetPct,
} from "@/constants";

const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 2009 },
  (_, i) => CURRENT_YEAR - i
);
import { fmt, fmtPct } from "@/lib/utils";
import type { PatrimonyAccount } from "@/types";

interface MonthlyEntriesProps {
  account: PatrimonyAccount;
  updateAccount: (id: string, patch: Partial<PatrimonyAccount>) => void;
}

export function MonthlyEntries({ account, updateAccount }: MonthlyEntriesProps) {
  const [adding, setAdding] = useState(false);
  const [addMonth, setAddMonth] = useState(CURRENT_MONTH);
  const [addYear, setAddYear] = useState(CURRENT_YEAR);
  const [addingValue, setAddingValue] = useState("");
  const [addingDeposit, setAddingDeposit] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDeposit, setEditDeposit] = useState("");

  const filled = accountEntries(account);
  const deposits = account.deposits || {};

  const setValueAtKey = (key: string, val: number | null, deposit?: number | null) => {
    const h = { ...account.history };
    const d = { ...deposits };
    if (val === null) {
      delete h[key];
      delete d[key];
    } else {
      h[key] = val;
      if (deposit != null && deposit > 0) {
        d[key] = deposit;
      } else {
        delete d[key];
      }
    }
    updateAccount(account.id, { history: h, deposits: d });
  };

  const openAdd = () => {
    // Propose le mois suivant la dernière saisie, sinon le mois courant
    if (filled.length) {
      const lastOrd = filled[filled.length - 1].i;
      const nextOrd = lastOrd + 1;
      const month = ((nextOrd - 1) % 12) + 1;
      const year = Math.floor((nextOrd - 1) / 12);
      setAddYear(year);
      setAddMonth(month);
    } else {
      setAddYear(CURRENT_YEAR);
      setAddMonth(CURRENT_MONTH);
    }
    setAdding(true);
  };

  const targetKey = monthKey(addYear, addMonth);
  const overwriting = account.history[targetKey] != null;

  return (
    <div>
      <div className="text-xs font-semibold text-neutral-500 mb-2">Historique mensuel</div>
      <div className="rounded-xl bg-neutral-50 divide-y divide-neutral-100">
        {/* En-tête colonnes */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          <span className="text-[10px] text-neutral-400 w-14 shrink-0">Mois</span>
          <span className="flex-1 text-[10px] text-neutral-400 text-right">Valeur</span>
          <span className="text-[10px] text-neutral-400 flex-1 text-right shrink-0">Investi</span>
          <span className="text-[10px] text-neutral-400 w-14 text-right shrink-0">Perf nette</span>
          <span className="w-8 shrink-0" />
        </div>

        {filled.length === 0 && (
          <div className="px-3 py-3 text-xs text-neutral-400">
            Aucune saisie pour l&apos;instant
          </div>
        )}
        {filled.map((e, idx) => {
          const prev = idx > 0 ? filled[idx - 1] : null;
          const netPct = prev != null
            ? periodNetPct(filled, deposits, { i: prev.i, v: prev.v }, { i: e.i, v: e.v })
            : null;
          const deposit = deposits[e.key] ?? 0;
          const isEditing = editingKey === e.key;
          return (
            <div key={e.key} className="flex items-center gap-2 px-3 py-2.5">
              <span className="text-xs text-neutral-500 w-14 shrink-0">
                {ordinalToLabel(e.i)}
              </span>
              {isEditing ? (
                <>
                  <input
                    autoFocus
                    type="number"
                    placeholder="Valeur"
                    value={editValue}
                    onChange={(ev) => setEditValue(ev.target.value)}
                    className="flex-1 min-w-0 rounded-lg bg-white border border-neutral-300 px-2 py-1.5 text-sm font-medium text-neutral-900 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Investi"
                    value={editDeposit}
                    onChange={(ev) => setEditDeposit(ev.target.value)}
                    className="flex-1 min-w-0 rounded-lg bg-white border border-neutral-300 px-2 py-1.5 text-sm font-medium text-neutral-900 outline-none"
                  />
                  <button
                    onClick={() => {
                      setValueAtKey(
                        e.key,
                        editValue === "" ? null : Number(editValue),
                        editDeposit === "" ? null : Number(editDeposit)
                      );
                      setEditingKey(null);
                    }}
                    className="text-emerald-600 cursor-pointer"
                  >
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingKey(null)} className="text-neutral-400 cursor-pointer">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-semibold text-neutral-900 text-right">
                    {fmt(e.v)}
                  </span>
                  <span className="flex-1 text-xs text-neutral-400 text-right shrink-0">
                    {deposit > 0 ? fmt(deposit) : "—"}
                  </span>
                  <span
                    className={`text-[10px] font-semibold w-14 text-right shrink-0 ${
                      netPct === null
                        ? "text-neutral-300"
                        : netPct >= 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {netPct === null ? "—" : fmtPct(netPct)}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingKey(e.key);
                        setEditValue(String(e.v));
                        setEditDeposit(deposit > 0 ? String(deposit) : "");
                      }}
                      className="text-neutral-400 cursor-pointer"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setValueAtKey(e.key, null)}
                      className="text-red-400 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2.5">
        {!adding ? (
          <button
            onClick={openAdd}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 text-neutral-500 text-xs font-semibold py-2.5 cursor-pointer"
          >
            <Plus size={14} /> Ajouter une saisie (mois passé ou récent)
          </button>
        ) : (
          <div className="rounded-xl bg-neutral-50 px-3 py-2.5 space-y-2">
            <div className="flex items-center gap-2">
              <select
                value={addMonth}
                onChange={(e) => setAddMonth(Number(e.target.value))}
                className="flex-1 min-w-0 rounded-lg bg-white border border-neutral-200 px-2 py-1.5 text-xs font-medium text-neutral-700 outline-none"
              >
                {MONTH_FULL.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={addYear}
                onChange={(e) => setAddYear(Number(e.target.value))}
                className="flex-1 min-w-0 rounded-lg bg-white border border-neutral-200 px-2 py-1.5 text-xs font-medium text-neutral-700 outline-none"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Valeur du compte"
                value={addingValue}
                onChange={(e) => setAddingValue(e.target.value)}
                className="flex-1 min-w-0 rounded-lg bg-white border border-neutral-200 px-2.5 py-1.5 text-sm font-medium text-neutral-900 outline-none"
              />
              <input
                type="number"
                placeholder="Capital investi (€)"
                value={addingDeposit}
                onChange={(e) => setAddingDeposit(e.target.value)}
                className="w-32 min-w-0 rounded-lg bg-white border border-neutral-200 px-2.5 py-1.5 text-sm font-medium text-neutral-900 outline-none"
              />
              <button
                onClick={() => {
                  if (addingValue === "") return;
                  setValueAtKey(
                    targetKey,
                    Number(addingValue),
                    addingDeposit === "" ? null : Number(addingDeposit)
                  );
                  setAdding(false);
                  setAddingValue("");
                  setAddingDeposit("");
                }}
                className="text-emerald-600 shrink-0 cursor-pointer"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setAddingValue("");
                  setAddingDeposit("");
                }}
                className="text-neutral-400 shrink-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              Capital investi : montant versé ce mois (ex : 100€ sur Trade Republic). Optionnel.
            </p>
            {overwriting && (
              <p className="text-[11px] text-amber-600">
                {ordinalToLabel(monthKeyToOrdinal(targetKey))} a déjà une valeur — elle sera remplacée.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
