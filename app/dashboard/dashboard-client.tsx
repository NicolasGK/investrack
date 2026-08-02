"use client";

import { useState, useMemo } from "react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { MONTHS, SEEDED_MONTH_COUNT, currentValue } from "@/constants";
import { futureValue } from "@/lib/utils";
import { BottomNav, type TabId } from "@/components/layout/bottom-nav";
import { AccueilTab } from "@/components/tabs/accueil-tab";
import { ComptesTab } from "@/components/tabs/comptes-tab";
import { SimulationTab } from "@/components/tabs/simulation-tab";
import { ProjectionTab } from "@/components/tabs/projection-tab";
import { AddAccountModal } from "@/components/modals/add-account-modal";
import { saveAccount, removeAccount, saveCategory } from "@/app/actions/accounts";
import type { PatrimonyAccount } from "@/types";

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

  const monthlyTotals = useMemo(() => {
    return MONTHS.map((label, i) => {
      const values = accounts
        .map((a) => a.history[i])
        .filter((v): v is number => v !== null && v !== undefined);
      return { label, total: values.reduce((s, v) => s + v, 0), hasData: values.length > 0 };
    }).filter((m) => m.hasData);
  }, [accounts]);

  const totalNow = monthlyTotals.length ? monthlyTotals[monthlyTotals.length - 1].total : 0;
  const totalPrev =
    monthlyTotals.length > 1 ? monthlyTotals[monthlyTotals.length - 2].total : totalNow;
  const evolPct = totalPrev ? ((totalNow - totalPrev) / totalPrev) * 100 : 0;

  const chartData = monthlyTotals.map((m) => ({
    label: m.label,
    total: Math.round(m.total),
  }));

  const currentMonthIndex = monthlyTotals.length
    ? MONTHS.indexOf(monthlyTotals[monthlyTotals.length - 1].label)
    : SEEDED_MONTH_COUNT - 1;

  const projectionAt = (years: number) =>
    accounts.reduce((sum, a) => {
      return sum + futureValue(currentValue(a), Number(a.monthly) || 0, Number(a.rate) || 0, years);
    }, 0);

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

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const handleSetTab = (newTab: TabId) => {
    const currentIdx = TAB_ORDER.indexOf(tab);
    const newIdx = TAB_ORDER.indexOf(newTab);
    setSlideDirection(newIdx > currentIdx ? "right" : "left");
    setTab(newTab);
  };

  const slideClass =
    slideDirection === "right" ? "animate-slide-from-right" : "animate-slide-from-left";

  return (
    <div className="min-h-screen w-full bg-neutral-100 flex justify-center font-sans overflow-x-hidden">
      <div key={tab} className={`w-full max-w-md pb-28 px-4 pt-6 ${slideClass}`}>
        {tab === "accueil" && (
          <AccueilTab
            accounts={accounts}
            categories={categories}
            totalNow={totalNow}
            evolPct={evolPct}
            chartData={chartData}
            projectionAt={projectionAt}
            onAdd={() => setShowAddAccount(true)}
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
            currentMonthIndex={currentMonthIndex}
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
      </div>

      <BottomNav tab={tab} setTab={handleSetTab} />

      {showAddAccount && (
        <AddAccountModal
          categories={categories}
          addCategory={addCategory}
          currentMonthIndex={currentMonthIndex}
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
