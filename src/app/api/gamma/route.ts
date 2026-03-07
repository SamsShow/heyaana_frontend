import { NextRequest, NextResponse } from "next/server";

const GAMMA_BASE = "https://gamma-api.polymarket.com";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const path = searchParams.get("path") ?? "events";
    searchParams.delete("path");

    const upstreamUrl = `${GAMMA_BASE}/${path}?${searchParams.toString()}`;

    const res = await fetch(upstreamUrl, {
        headers: { "Accept": "application/json" },
        next: { revalidate: 30 },
    });

    if (!res.ok) {
        return NextResponse.json({ error: `Gamma API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
}
