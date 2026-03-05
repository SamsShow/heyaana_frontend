import { NextResponse } from "next/server";
import { API2_BASE_URL } from "@/lib/auth-api";

/** GET /api/proxy/markets/trending → api2 /markets/trending (public) */
export async function GET() {
  try {
    const res = await fetch(`${API2_BASE_URL}/markets/trending`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[proxy GET /markets/trending]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
