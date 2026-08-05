import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db/drizzle";
import { patrimonyAccount, userCategory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_CATEGORIES, migrateHistory } from "@/constants";
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

  // Migration transparente : si history est encore un tableau (ancien format), on le convertit
  const initialAccounts: PatrimonyAccount[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    history: migrateHistory(r.history),
    monthly: r.monthly,
    rate: r.rate,
    logo: r.logo as PatrimonyAccount["logo"],
  }));

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
