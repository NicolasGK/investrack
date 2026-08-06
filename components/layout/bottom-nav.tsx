"use client";

import { useState } from "react";
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
  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === tab);
  const [poppingTab, setPoppingTab] = useState<TabId | null>(null);

  const handleClick = (id: TabId) => {
    if (id === tab) return;
    setPoppingTab(id);
    setTimeout(() => setPoppingTab(null), 400);
    setTab(id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-5 pt-2 bg-linear-to-t from-neutral-100 via-neutral-100 to-transparent">
      <div className="relative w-full max-w-md mx-4 rounded-full bg-white shadow-lg px-2 py-2 flex items-center justify-between">
        {/* Pill glissant */}
        <div
          aria-hidden
          className="absolute top-2 bottom-2 rounded-full bg-neutral-900 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{
            left: "8px",
            width: `calc((100% - 16px) / ${NAV_ITEMS.length})`,
            transform: `translateX(calc(${activeIndex} * 100%))`,
          }}
        />
        {NAV_ITEMS.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`relative z-10 flex-1 flex flex-col items-center gap-1 rounded-full py-2 cursor-pointer transition-colors duration-300 ${
                active ? "text-white" : "text-neutral-400"
              }`}
            >
              <span
                key={poppingTab === item.id ? `pop-${item.id}` : item.id}
                className={poppingTab === item.id ? "animate-pop" : ""}
              >
                <Icon size={18} />
              </span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
