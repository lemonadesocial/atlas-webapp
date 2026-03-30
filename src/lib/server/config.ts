import "server-only";

// Server-only secrets. Never import this from client components.
export const OAUTH_CLIENT_SECRET =
  process.env.OAUTH_CLIENT_SECRET || "";
export const OAUTH_AUTHORITY =
  process.env.NEXT_PUBLIC_OAUTH_AUTHORITY || "";
export const OAUTH_CLIENT_ID =
  process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || "atlas-webapp";
export const LEMONADE_BACKEND_URL =
  process.env.LEMONADE_BACKEND_URL || process.env.NEXT_PUBLIC_LEMONADE_BACKEND_URL || "";
