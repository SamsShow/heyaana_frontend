import { NextRequest, NextResponse } from "next/server";
import { API2_BASE_URL } from "@/lib/auth-api";

/** GET /api/proxy/users/:username/portfolio → api2 /users/:username/portfolio (public) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  try {
    const res = await fetch(
      `${API2_BASE_URL}/users/${encodeURIComponent(username)}/portfolio`,
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[proxy GET /users/${username}/portfolio]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
