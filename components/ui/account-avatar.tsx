"use client";

import { AVATAR_BG } from "@/constants";
import { LogoBadge } from "./logo-badge";
import type { PatrimonyAccount } from "@/types";

interface AccountAvatarProps {
  account: Pick<PatrimonyAccount, "name" | "logo">;
  index?: number;
  size?: string;
}

export function AccountAvatar({
  account,
  index = 0,
  size = "h-10 w-10 text-xs",
}: AccountAvatarProps) {
  if (!account.logo) {
    return (
      <div
        className={`${size} shrink-0 rounded-full flex items-center justify-center font-bold ${
          AVATAR_BG[index % AVATAR_BG.length]
        }`}
      >
        {account.name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return <LogoBadge logo={account.logo} name={account.name} size={size} />;
}
