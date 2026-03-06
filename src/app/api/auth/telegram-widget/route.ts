import { NextRequest, NextResponse } from "next/server";

const API2_BASE_URL = "https://api2.heyanna.trade";

/**
 * Proxy the Telegram Login Widget auth call to api2.
 * Avoids CORS: browser calls /api/auth/telegram-widget (same origin),
 * server calls api2 server-to-server (no CORS).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  const url = `${API2_BASE_URL}/auth/telegram-widget${params ? `?${params}` : ""}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    });

    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return NextResponse.json(
        { error: "Auth server returned non-JSON response" },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Auth server unreachable" },
      { status: 503 },
    );
  }
}
