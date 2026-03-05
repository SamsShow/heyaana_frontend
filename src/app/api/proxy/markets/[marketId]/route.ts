import { NextRequest, NextResponse } from "next/server";
import { API2_BASE_URL } from "@/lib/auth-api";

/** GET /api/proxy/markets/:id → api2 /markets/:id (public) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> },
) {
  const { marketId } = await params;
  try {
    const isNumericId = /^\d+$/.test(marketId);
    const upstreamPath = isNumericId
      ? `/markets/${marketId}`
      : `/markets/by-condition/${encodeURIComponent(marketId)}`;
    const res = await fetch(`${API2_BASE_URL}${upstreamPath}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[proxy GET /markets/${marketId}]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
