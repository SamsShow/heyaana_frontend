import { NextRequest, NextResponse } from "next/server";
import { API2_BASE_URL } from "@/lib/auth-api";

/** GET /api/proxy/markets/category/:cat → api2 /markets/category/:cat (public) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;
  try {
    const res = await fetch(
      `${API2_BASE_URL}/markets/category/${encodeURIComponent(category)}`,
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[proxy GET /markets/category/${category}]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
