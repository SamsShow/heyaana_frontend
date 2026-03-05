import { NextRequest, NextResponse } from "next/server";
import { API2_BASE_URL } from "@/lib/auth-api";

/** GET /api/proxy/markets/search?q=... → api2 /markets/search?q=... (public) */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const res = await fetch(
      `${API2_BASE_URL}/markets/search?q=${encodeURIComponent(q)}`,
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[proxy GET /markets/search]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
