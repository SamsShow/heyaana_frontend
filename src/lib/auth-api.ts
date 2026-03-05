/**
 * Authenticated API client for api2.heyanna.trade endpoints.
 *
 * All calls go through Next.js Route Handlers (/api/auth/*, /api/proxy/*)
 * so the raw JWT never reaches client code — it lives only in an HttpOnly cookie.
 */

export const API2_BASE_URL = "https://api2.heyanna.trade";

// ─── Cookie constants ─────────────────────────────────────
export const TOKEN_COOKIE = "token";
export const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 1 week in seconds

// ─── Server-side fetcher (used inside Route Handlers) ─────
/**
 * Fetch from api2 with the JWT bearer token.
 * Only call this from server-side code (Route Handlers / Server Components).
 */
export async function api2Fetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${API2_BASE_URL}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// ─── Client-side helpers (call our own /api/* proxies) ─────

/** Login via Telegram Mini App initData */
export async function loginTelegram(initData: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ init_data: initData }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Login failed");
  }
  return res.json();
}

/** Login with a manual user_id (dev only) */
export async function loginManual(userId: number) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Login failed");
  }
  return res.json();
}

/** Logout — clears cookie + revokes session on backend */
export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

/** Get current user profile via proxy */
export async function fetchMe() {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return null;
  return res.json();
}

// ─── Types ────────────────────────────────────────────────

export type UserProfile = {
  user_id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  wallet_address: string | null;
  created_at: string;
};
