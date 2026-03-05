import { NextRequest, NextResponse } from "next/server";
import { API2_BASE_URL, TOKEN_COOKIE, TOKEN_MAX_AGE } from "@/lib/auth-api";

function sanitizeNextPath(value: string | null): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//")) return "/dashboard";
  return value;
}

/**
 * GET /api/auth/telegram-widget
 *
 * Telegram Login Widget redirects here with signed user data in query params.
 * We forward those params to api2 /auth/telegram-widget, then set our HttpOnly
 * token cookie and redirect to dashboard.
 */
export async function GET(req: NextRequest) {
  const query = new URLSearchParams(req.nextUrl.searchParams);
  const nextPath = sanitizeNextPath(query.get("next"));
  query.delete("next");

  if (!query.get("hash")) {
    return NextResponse.redirect(
      new URL("/onboarding?tg_error=missing_hash", req.url),
    );
  }

  try {
    const upstream = await fetch(
      `${API2_BASE_URL}/auth/telegram-widget?${query.toString()}`,
      { method: "GET" },
    );

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => "");
      const detail = encodeURIComponent(errBody.slice(0, 120) || String(upstream.status));
      return NextResponse.redirect(
        new URL(`/onboarding?tg_error=widget_auth_failed&tg_detail=${detail}`, req.url),
      );
    }

    const body = await upstream.text();

    // The backend returns an HTML page showing the JWT — extract it via regex
    const jwtMatch = body.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    const token = jwtMatch?.[0];

    if (!token) {
      const detail = encodeURIComponent(`No JWT found in response: ${body.slice(0, 120)}`);
      return NextResponse.redirect(
        new URL(`/onboarding?tg_error=missing_token&tg_detail=${detail}`, req.url),
      );
    }

    const res = NextResponse.redirect(new URL(nextPath, req.url));
    res.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error("[auth/telegram-widget]", err);
    const msg = err instanceof Error ? err.message : String(err);
    const detail = encodeURIComponent(msg.slice(0, 120));
    return NextResponse.redirect(
      new URL(`/onboarding?tg_error=internal_error&tg_detail=${detail}`, req.url),
    );
  }
}
