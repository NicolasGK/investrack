"use client";

import { Home, Wallet, Calculator, TrendingUp } from "lucide-react";

export type TabId = "accueil" | "comptes" | "simulation" | "projection";

interface BottomNavProps {
  tab: TabId;
  setTab: (tab: TabId) => void;
}

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "accueil", label: "Accueil", icon: Home },
  { id: "comptes", label: "Comptes", icon: Wallet },
  { id: "simulation", label: "Simulation", icon: Calculator },
  { id: "projection", label: "Projection", icon: TrendingUp },
];

export function BottomNav({ tab, setTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-5 pt-2 bg-linear-to-t from-neutral-100 via-neutral-100 to-transparent">
      <div className="w-full max-w-md mx-4 rounded-full bg-white shadow-lg px-2 py-2 flex items-center justify-between">
        {NAV_ITEMS.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 rounded-full py-2 transition cursor-pointer ${
                active ? "bg-neutral-900 text-white" : "text-neutral-400"
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
