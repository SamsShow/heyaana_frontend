import { NextRequest, NextResponse } from "next/server";
import { API2_BASE_URL } from "@/lib/auth-api";

/** GET /api/proxy/price/:marketId/history → api2 /price/:marketId/history (public) */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> },
) {
  const { marketId } = await params;
  try {
    const { searchParams } = req.nextUrl;
    const upstream = new URL(`${API2_BASE_URL}/price/${encodeURIComponent(marketId)}/history`);
    searchParams.forEach((value, key) => upstream.searchParams.set(key, value));

    const res = await fetch(upstream.toString());
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[proxy GET /price/${marketId}/history]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
