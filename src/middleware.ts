import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth-api";

/**
 * Middleware — protects /dashboard/* routes.
 *
 * If the JWT cookie is missing or expired, redirects to /onboarding.
 * API routes and public pages pass through untouched.
 */
export function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
