"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getDb } from "@/db/drizzle";
import { patrimonyAccount, userCategory } from "@/db/schema";
import { eq, and, max } from "drizzle-orm";
import type { PatrimonyAccount } from "@/types";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");
  return session;
}

export async function saveAccount(acc: PatrimonyAccount): Promise<void> {
  const session = await requireSession();
  const db = getDb();
  const userId = session.user.id;

  const existing = await db
    .select({ sortOrder: patrimonyAccount.sortOrder })
    .from(patrimonyAccount)
    .where(
      and(eq(patrimonyAccount.id, acc.id), eq(patrimonyAccount.userId, userId))
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(patrimonyAccount)
      .set({
        name: acc.name,
        category: acc.category,
        logo: acc.logo ?? null,
        history: acc.history,
        monthly: acc.monthly,
        rate: acc.rate,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(patrimonyAccount.id, acc.id),
          eq(patrimonyAccount.userId, userId)
        )
      );
  } else {
    const [{ maxOrder }] = await db
      .select({ maxOrder: max(patrimonyAccount.sortOrder) })
      .from(patrimonyAccount)
      .where(eq(patrimonyAccount.userId, userId));

    await db.insert(patrimonyAccount).values({
      id: acc.id,
      userId,
      name: acc.name,
      category: acc.category,
      logo: acc.logo ?? null,
      history: acc.history,
      monthly: acc.monthly,
      rate: acc.rate,
      sortOrder: (maxOrder ?? -1) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export async function removeAccount(id: string): Promise<void> {
  const session = await requireSession();
  const db = getDb();

  await db
    .delete(patrimonyAccount)
    .where(
      and(
        eq(patrimonyAccount.id, id),
        eq(patrimonyAccount.userId, session.user.id)
      )
    );
}

export async function saveCategory(name: string): Promise<void> {
  const session = await requireSession();
  const db = getDb();
  const userId = session.user.id;

  const existing = await db
    .select({ id: userCategory.id })
    .from(userCategory)
    .where(and(eq(userCategory.userId, userId), eq(userCategory.name, name)))
    .limit(1);

  if (existing.length > 0) return;

  const [{ maxOrder }] = await db
    .select({ maxOrder: max(userCategory.sortOrder) })
    .from(userCategory)
    .where(eq(userCategory.userId, userId));

  await db.insert(userCategory).values({
    id: crypto.randomUUID(),
    userId,
    name,
    sortOrder: (maxOrder ?? -1) + 1,
    createdAt: new Date(),
  });
}
