import { NextRequest, NextResponse } from "next/server";
import { api2Fetch, TOKEN_COOKIE } from "@/lib/auth-api";

/**
 * GET /api/auth/me
 *
 * Proxies to api2 /me with the JWT from the cookie.
 * Returns the user profile or 401 if not authenticated.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const apiRes = await api2Fetch("/me", token);

    if (!apiRes.ok) {
      return NextResponse.json(
        { error: "Upstream error" },
        { status: apiRes.status },
      );
    }

    const data = await apiRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[auth/me]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
