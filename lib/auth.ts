import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db/drizzle";
import { schema } from "../db/schema";

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // TODO: remplacer par un vrai service d'envoi d'email (Resend, SendGrid…)
      // En développement, le lien s'affiche dans la console du serveur.
      console.log(`[investrack] Réinitialisation de mot de passe pour ${user.email}`);
      console.log(`[investrack] Lien de réinitialisation : ${url}`);
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  session: {
    expiresIn: SEVEN_DAYS,
    updateAge: SEVEN_DAYS,
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  plugins: [nextCookies()],
});
