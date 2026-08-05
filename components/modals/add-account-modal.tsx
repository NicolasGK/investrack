"use client";

import { useState } from "react";
import { X, Plus, Search, Wallet } from "lucide-react";
import { PROVIDERS, CURRENT_MONTH_KEY } from "@/constants";
import { normalize } from "@/lib/utils";
import { LogoBadge } from "@/components/ui/logo-badge";
import { AccountAvatar } from "@/components/ui/account-avatar";
import type { PatrimonyAccount, Provider, LogoInfo } from "@/types";

interface LogoGridProps {
  search: string;
  onSelect: (provider: Provider & { generic?: boolean }) => void;
}

function LogoGrid({ search, onSelect }: LogoGridProps) {
  const filtered = PROVIDERS.filter((p) =>
    normalize(p.name).includes(normalize(search))
  );

  return (
    <div className="grid grid-cols-4 gap-3">
      {filtered.map((p) => (
        <button
          key={p.name}
          onClick={() => onSelect(p)}
          className="flex flex-col items-center gap-1.5 active:scale-95 transition cursor-pointer"
        >
          <LogoBadge logo={p} name={p.name} size="h-14 w-14 text-sm" />
          <span className="text-[10px] text-neutral-500 text-center leading-tight">{p.name}</span>
        </button>
      ))}
      <button
        onClick={() => onSelect({ name: "", short: "", color: "", domain: null, generic: true })}
        className="flex flex-col items-center gap-1.5 active:scale-95 transition cursor-pointer"
      >
        <div className="h-14 w-14 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center">
          <Wallet size={20} />
        </div>
        <span className="text-[10px] text-neutral-500 text-center leading-tight">Autre</span>
      </button>
      {filtered.length === 0 && (
        <div className="col-span-4 text-center text-xs text-neutral-400 py-2">
          Aucun résultat — choisissez &quot;Autre&quot; pour un logo générique.
        </div>
      )}
    </div>
  );
}

interface AddAccountModalProps {
  categories: string[];
  addCategory: (name: string) => void;
  latestMonthKey: string;
  onClose: () => void;
  onSave: (account: PatrimonyAccount) => void;
}

export function AddAccountModal({
  categories,
  addCategory,
  latestMonthKey,
  onClose,
  onSave,
}: AddAccountModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [logo, setLogo] = useState<LogoInfo | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [value, setValue] = useState("");
  const [monthly, setMonthly] = useState<number | string>(50);

  const chooseProvider = (p: Provider & { generic?: boolean }) => {
    setLogo(
      p.generic
        ? { generic: true }
        : { short: p.short, color: p.color, domain: p.domain }
    );
    if (!p.generic) setName(p.name);
    setStep(2);
  };

  const handleNameChange = (v: string) => {
    setName(v);
    const n = normalize(v);
    if (!n) { setLogo(null); return; }
    const match =
      PROVIDERS.find((p) => normalize(p.name) === n) ||
      PROVIDERS.find(
        (p) => n.includes(normalize(p.name)) || normalize(p.name).includes(n)
      ) ||
      null;
    if (match) setLogo({ short: match.short, color: match.color, domain: match.domain });
    else if (logo?.short) setLogo(null);
  };

  const handleSave = () => {
    if (!name || !value) return;
    let finalCategory = category;
    if (addingCategory && newCategory) {
      addCategory(newCategory);
      finalCategory = newCategory;
    }
    // Utilise le mois courant global (dernier mois saisi ou mois actuel)
    const key = latestMonthKey || CURRENT_MONTH_KEY;
    onSave({
      id: `acc-${Date.now()}`,
      name,
      category: finalCategory,
      logo: logo ?? { generic: true },
      history: { [key]: Number(value) },
      monthly: Number(monthly),
      rate: 5,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 animate-fade-in-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl p-5 max-h-[88vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 1 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-neutral-900">Choisir un compte</div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 cursor-pointer active:scale-95 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                autoFocus
                placeholder="Rechercher une banque, un courtier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-neutral-100 pl-10 pr-3.5 py-3 text-sm font-medium text-neutral-900 outline-none"
              />
            </div>

            <LogoGrid search={search} onSelect={chooseProvider} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep(1)}
                className="text-sm font-medium text-neutral-500 cursor-pointer"
              >
                ← Changer
              </button>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 cursor-pointer active:scale-95 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <AccountAvatar account={{ name, logo }} size="h-12 w-12 text-sm" />
              <div className="text-lg font-bold text-neutral-900">Détails du compte</div>
            </div>

            <div className="space-y-3.5">
              <label className="block">
                <div className="text-xs text-neutral-500 mb-1 font-medium">Nom du compte</div>
                <input
                  type="text"
                  placeholder="ex : Boursobank, PEA, Yomoni..."
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm font-medium text-neutral-900 outline-none"
                />
              </label>

              <label className="block">
                <div className="text-xs text-neutral-500 mb-1 font-medium">Valeur actuelle</div>
                <input
                  type="number"
                  placeholder="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm font-medium text-neutral-900 outline-none"
                />
              </label>

              <div>
                <div className="text-xs text-neutral-500 mb-1.5 font-medium">Catégorie</div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCategory(c);
                        setAddingCategory(false);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                        !addingCategory && category === c
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  <button
                    onClick={() => setAddingCategory(true)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      addingCategory
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    <Plus size={12} /> Nouvelle
                  </button>
                </div>
                {addingCategory && (
                  <input
                    type="text"
                    placeholder="Nom de la nouvelle catégorie"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm font-medium text-neutral-900 outline-none"
                  />
                )}
              </div>

              <label className="block">
                <div className="text-xs text-neutral-500 mb-1 font-medium">
                  Versement mensuel prévu
                </div>
                <input
                  type="number"
                  value={monthly}
                  onChange={(e) => setMonthly(e.target.value)}
                  className="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm font-medium text-neutral-900 outline-none"
                />
              </label>
              <p className="text-[11px] text-neutral-400 -mt-2">
                Le taux annuel se règle ensuite dans l&apos;onglet Projection.
              </p>

              <button
                onClick={handleSave}
                className="w-full rounded-xl bg-neutral-900 text-white font-semibold py-3.5 mt-2 active:scale-[0.98] transition cursor-pointer"
              >
                Ajouter le compte
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
