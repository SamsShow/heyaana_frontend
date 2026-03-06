import { NextRequest, NextResponse } from "next/server";
import { API2_BASE_URL } from "@/lib/auth-api";

/** GET /api/proxy/social/feed → api2 /social/feed (public) */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const upstream = new URL(`${API2_BASE_URL}/social/feed`);
    searchParams.forEach((value, key) => upstream.searchParams.set(key, value));

    const res = await fetch(upstream.toString());
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[proxy GET /social/feed]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
