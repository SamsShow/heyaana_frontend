import { NextRequest } from "next/server";
import { proxyGet } from "../helpers";

/** GET /api/proxy/portfolio → api2 /me/portfolio */
export function GET(req: NextRequest) {
  return proxyGet(req, "/me/portfolio");
}
