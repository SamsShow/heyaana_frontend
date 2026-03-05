import { NextRequest, NextResponse } from "next/server";
import { api2Fetch, TOKEN_COOKIE } from "@/lib/auth-api";

/**
 * Generic proxy that forwards authenticated requests to api2.
 * Reused by all /api/proxy/* route handlers.
 */
export async function proxyGet(req: NextRequest, path: string) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const apiRes = await api2Fetch(path, token);
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch (err) {
    console.error(`[proxy GET ${path}]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function proxyPost(
  req: NextRequest,
  path: string,
  opts?: { hasBody?: boolean },
) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = opts?.hasBody !== false ? await req.json().catch(() => ({})) : undefined;
    const apiRes = await api2Fetch(path, token, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch (err) {
    console.error(`[proxy POST ${path}]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
