"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import type { LogoInfo } from "@/types";

// Cache en mémoire (persiste pour la session) pour éviter de retester des sources mortes
const logoSourceCache = new Map<string, number>();

interface LogoBadgeProps {
  logo?: LogoInfo | null;
  name: string;
  size?: string;
}

export function LogoBadge({ logo, name, size = "h-10 w-10 text-xs" }: LogoBadgeProps) {
  const [srcIndex, setSrcIndex] = useState(
    () => logoSourceCache.get(logo?.domain ?? "") ?? 0
  );

  const sources =
    logo?.domain
      ? [
          `https://www.google.com/s2/favicons?domain=${logo.domain}&sz=128`,
          `https://logo.clearbit.com/${logo.domain}?size=80`,
        ]
      : [];

  const handleError = () => {
    const next = srcIndex + 1;
    if (logo?.domain) logoSourceCache.set(logo.domain, next);
    setSrcIndex(next);
  };

  if (logo?.domain && srcIndex < sources.length) {
    return (
      <div
        className={`${size} shrink-0 rounded-full overflow-hidden bg-white border border-neutral-100 flex items-center justify-center`}
      >
        <img
          key={sources[srcIndex]}
          src={sources[srcIndex]}
          alt={name}
          className="h-full w-full object-contain p-1.5"
          onError={handleError}
        />
      </div>
    );
  }

  if (logo?.short) {
    return (
      <div
        className={`${size} shrink-0 rounded-full flex items-center justify-center font-bold ${logo.color}`}
      >
        {logo.short}
      </div>
    );
  }

  return (
    <div
      className={`${size} shrink-0 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center`}
    >
      <Wallet size={16} />
    </div>
  );
}
