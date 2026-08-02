import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle(neon(url), { schema });
}

// Lazy singleton — seule la première requête instancie la connexion
let _db: ReturnType<typeof createDb> | undefined;

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

// Alias pour la compatibilité avec l'adaptateur Better Auth
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_, prop) {
    return getDb()[prop as keyof ReturnType<typeof createDb>];
  },
});
