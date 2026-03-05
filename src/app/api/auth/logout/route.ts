import { NextRequest, NextResponse } from "next/server";
import { API2_BASE_URL, TOKEN_COOKIE } from "@/lib/auth-api";

/**
 * POST /api/auth/logout
 *
 * Revokes the session on the backend and clears the HttpOnly cookie.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  // Best-effort revoke on the backend
  if (token) {
    try {
      await fetch(`${API2_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // swallow — we still want to clear the cookie locally
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // delete the cookie
  });

  return res;
}
