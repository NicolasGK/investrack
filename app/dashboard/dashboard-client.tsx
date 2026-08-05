"use client";

import { useState, useMemo } from "react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  monthKeyToOrdinal, CURRENT_MONTH_KEY, monthKeyToLabel, currentValue,
} from "@/constants";
import { futureValue as fv } from "@/lib/utils";
import { BottomNav, type TabId } from "@/components/layout/bottom-nav";
import { AccueilTab } from "@/components/tabs/accueil-tab";
import { ComptesTab } from "@/components/tabs/comptes-tab";
import { SimulationTab } from "@/components/tabs/simulation-tab";
import { ProjectionTab } from "@/components/tabs/projection-tab";
import { AccountDetailTab } from "@/components/tabs/account-detail-tab";
import { AddAccountModal } from "@/components/modals/add-account-modal";
import { saveAccount, removeAccount, saveCategory } from "@/app/actions/accounts";
import type { PatrimonyAccount, MonthlyTotal } from "@/types";

const TAB_ORDER: TabId[] = ["accueil", "comptes", "simulation", "projection"];

interface Props {
  initialAccounts: PatrimonyAccount[];
  initialCategories: string[];
  userName: string;
}

export function DashboardClient({ initialAccounts, initialCategories, userName }: Props) {
  const router = useRouter();

  const [tab, setTab] = useState<TabId>("accueil");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [accounts, setAccounts] = useState<PatrimonyAccount[]>(initialAccounts);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // ── Calcul de la timeline globale (nouveau format "YYYY-MM") ────────────────
  const monthlyTotals: MonthlyTotal[] = useMemo(() => {
    const keys = new Set<string>();
    accounts.forEach((a) => {
      Object.keys(a.history || {}).forEach((k) => {
        const v = a.history[k];
        if (v !== null && v !== undefined) keys.add(k);
      });
    });
    return Array.from(keys)
      .sort((a, b) => monthKeyToOrdinal(a) - monthKeyToOrdinal(b))
      .map((key) => {
        const i = monthKeyToOrdinal(key);
        const values = accounts
          .map((a) => a.history[key])
          .filter((v): v is number => v !== null && v !== undefined);
        return {
          i,
          key,
          label: monthKeyToLabel(key),
          total: values.reduce((s, v) => s + v, 0),
          hasData: values.length > 0,
        };
      });
  }, [accounts]);

  // Dernier mois saisi globalement — utilisé comme valeur par défaut pour les nouveaux comptes
  const latestMonthKey = monthlyTotals.length
    ? monthlyTotals[monthlyTotals.length - 1].key
    : CURRENT_MONTH_KEY;

  const projectionAt = (years: number) =>
    accounts.reduce((sum, a) => {
      return sum + fv(currentValue(a), Number(a.monthly) || 0, Number(a.rate) || 0, years);
    }, 0);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const updateAccount = (id: string, patch: Partial<PatrimonyAccount>) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    const merged = { ...acc, ...patch };
    setAccounts((prev) => prev.map((a) => (a.id === id ? merged : a)));
    saveAccount(merged).catch(console.error);
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    removeAccount(id).catch(console.error);
    if (selectedAccountId === id) setSelectedAccountId(null);
  };

  const addAccount = (acc: PatrimonyAccount) => {
    setAccounts((prev) => [...prev, acc]);
    saveAccount(acc).catch(console.error);
  };

  const addCategory = (name: string) => {
    if (name && !categories.includes(name)) {
      setCategories((prev) => [...prev, name]);
      saveCategory(name).catch(console.error);
    }
  };

  const openAccount = (id: string) => setSelectedAccountId(id);
  const backToDashboard = () => setSelectedAccountId(null);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const handleSetTab = (newTab: TabId) => {
    const currentIdx = TAB_ORDER.indexOf(tab);
    const newIdx = TAB_ORDER.indexOf(newTab);
    setSlideDirection(newIdx > currentIdx ? "right" : "left");
    setSelectedAccountId(null);
    setTab(newTab);
  };

  const slideClass =
    slideDirection === "right" ? "animate-slide-from-right" : "animate-slide-from-left";

  const isDetailOpen = selectedAccountId !== null;
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="min-h-screen w-full bg-neutral-100 flex justify-center font-sans overflow-x-hidden">
      <div
        key={isDetailOpen ? `detail-${selectedAccountId}` : tab}
        className={`w-full max-w-md pb-28 px-4 pt-6 ${slideClass}`}
      >
        {/* ── Détail d'un compte ── */}
        {isDetailOpen && selectedAccount && (
          <AccountDetailTab
            account={selectedAccount}
            updateAccount={updateAccount}
            onBack={backToDashboard}
          />
        )}

        {/* ── Onglets principaux (masqués si détail ouvert) ── */}
        {!isDetailOpen && (
          <>
            {tab === "accueil" && (
              <AccueilTab
                accounts={accounts}
                categories={categories}
                monthlyTotals={monthlyTotals}
                projectionAt={projectionAt}
                onAdd={() => setShowAddAccount(true)}
                onOpenAccount={openAccount}
                onSignOut={handleSignOut}
                userName={userName}
              />
            )}
            {tab === "comptes" && (
              <ComptesTab
                accounts={accounts}
                categories={categories}
                updateAccount={updateAccount}
                deleteAccount={deleteAccount}
                onAdd={() => setShowAddAccount(true)}
                onOpenAccount={openAccount}
              />
            )}
            {tab === "simulation" && <SimulationTab />}
            {tab === "projection" && (
              <ProjectionTab
                accounts={accounts}
                categories={categories}
                updateAccount={updateAccount}
                projectionAt={projectionAt}
              />
            )}
          </>
        )}
      </div>

      {/* Navigation cachée sur la page détail */}
      {!isDetailOpen && <BottomNav tab={tab} setTab={handleSetTab} />}

      {showAddAccount && (
        <AddAccountModal
          categories={categories}
          addCategory={addCategory}
          latestMonthKey={latestMonthKey}
          onClose={() => setShowAddAccount(false)}
          onSave={(acc) => {
            addAccount(acc);
            setShowAddAccount(false);
          }}
        />
      )}
    </div>
  );
}
