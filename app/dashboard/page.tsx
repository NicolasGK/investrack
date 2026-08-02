import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db/drizzle";
import { patrimonyAccount, userCategory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_CATEGORIES, SEED_ACCOUNTS } from "@/constants";
import type { PatrimonyAccount } from "@/types";
import { DashboardClient } from "./dashboard-client";

export default async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const db = getDb();
  const userId = session.user.id;

  // ── Comptes ───────────────────────────────────────────────────────────────
  const rows = await db
    .select()
    .from(patrimonyAccount)
    .where(eq(patrimonyAccount.userId, userId))
    .orderBy(patrimonyAccount.sortOrder);

  let initialAccounts: PatrimonyAccount[];

  if (rows.length === 0) {
    // Premier accès : on seed les comptes démo en base avec des IDs uniques par utilisateur
    const seeded = SEED_ACCOUNTS.map((acc, i) => ({
      ...acc,
      id: `${userId}-${acc.id}`,
    }));
    await db.insert(patrimonyAccount).values(
      seeded.map((acc, i) => ({
        id: acc.id,
        userId,
        name: acc.name,
        category: acc.category,
        logo: acc.logo ?? null,
        history: acc.history,
        monthly: acc.monthly,
        rate: acc.rate,
        sortOrder: i,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    initialAccounts = seeded;
  } else {
    initialAccounts = rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      history: r.history as (number | null)[],
      monthly: r.monthly,
      rate: r.rate,
      logo: r.logo as PatrimonyAccount["logo"],
    }));
  }

  // ── Catégories ────────────────────────────────────────────────────────────
  const catRows = await db
    .select()
    .from(userCategory)
    .where(eq(userCategory.userId, userId))
    .orderBy(userCategory.sortOrder);

  const initialCategories =
    catRows.length > 0 ? catRows.map((r) => r.name) : DEFAULT_CATEGORIES;

  return (
    <DashboardClient
      initialAccounts={initialAccounts}
      initialCategories={initialCategories}
      userName={session.user.name?.split(" ")[0] ?? "vous"}
    />
  );
}
