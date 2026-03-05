import { NextRequest } from "next/server";
import { proxyGet } from "../helpers";

/** GET /api/proxy/balance → api2 /me/balance */
export function GET(req: NextRequest) {
  return proxyGet(req, "/me/balance");
}
