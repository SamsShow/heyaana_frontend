import { NextRequest, NextResponse } from "next/server";
import { API2_BASE_URL } from "@/lib/auth-api";

/** GET /api/proxy/data/trades → api2 /data/trades (public) */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const upstream = new URL(`${API2_BASE_URL}/data/trades`);
    searchParams.forEach((value, key) => upstream.searchParams.set(key, value));

    const res = await fetch(upstream.toString());
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[proxy GET /data/trades]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
