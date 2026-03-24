import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/dflow-api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEvent(raw: any) {
    return {
        ...raw,
        image: raw.image || raw.image_url || raw.imageUrl || null,
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const data = await getEvents({
            status: searchParams.get("status") || "active",
            seriesTickers: searchParams.get("seriesTickers") || undefined,
            limit: Number(searchParams.get("limit")) || 200,
            withNestedMarkets: true,
        });

        return NextResponse.json({
            ...data,
            events: (data.events ?? []).map(normalizeEvent),
        });
    } catch (error) {
        console.error("Markets API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch markets" },
            { status: 500 }
        );
    }
}
