import type { NextConfig } from "next";

// Priorité : variable explicite > URL de prod Vercel (stable) > URL de déploiement Vercel > localhost
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_URL: appUrl,
    BETTER_AUTH_URL: appUrl,
  },
};

export default nextConfig;
