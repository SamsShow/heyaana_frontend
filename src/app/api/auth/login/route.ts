import { NextRequest, NextResponse } from "next/server";
import { API2_BASE_URL, TOKEN_COOKIE, TOKEN_MAX_AGE } from "@/lib/auth-api";

/**
 * POST /api/auth/login
 *
 * Accepts either:
 *   { init_data: string }   → Telegram Mini App login
 *   { user_id: number }     → Manual/dev login
 *
 * Proxies to api2, extracts the JWT from the response,
 * sets it as an HttpOnly cookie, and returns { ok: true }.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let apiRes: Response;

    if (body.init_data) {
      // Telegram Mini App flow
      const params = new URLSearchParams({ init_data: body.init_data });
      apiRes = await fetch(`${API2_BASE_URL}/auth/telegram?${params}`, {
        method: "POST",
      });
    } else if (body.user_id != null) {
      // Manual / dev flow
      const params = new URLSearchParams({ user_id: String(body.user_id) });
      apiRes = await fetch(`${API2_BASE_URL}/auth/manual?${params}`, {
        method: "POST",
      });
    } else {
      return NextResponse.json(
        { error: "Provide init_data or user_id" },
        { status: 400 },
      );
    }

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return NextResponse.json(
        { error: errText || "Auth failed" },
        { status: apiRes.status },
      );
    }

    const data = await apiRes.json();

    // The backend returns the JWT — look for common field names
    const token: string | undefined =
      data.access_token ?? data.token ?? data.jwt;

    if (!token) {
      return NextResponse.json(
        { error: "No token in auth response" },
        { status: 502 },
      );
    }

    // Build response and set HttpOnly cookie
    const res = NextResponse.json({ ok: true });
    res.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE, // 1 week
    });

    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
