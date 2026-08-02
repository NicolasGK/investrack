import type { NextConfig } from "next";

// Priorité : variable explicite > URL Vercel automatique > localhost
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_URL: appUrl,
    BETTER_AUTH_URL: appUrl,
  },
};

export default nextConfig;
