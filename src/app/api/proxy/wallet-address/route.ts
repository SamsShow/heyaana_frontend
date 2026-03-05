import { NextRequest } from "next/server";
import { proxyGet } from "../helpers";

/** GET /api/proxy/wallet-address → api2 /me/wallet/address */
export function GET(req: NextRequest) {
  return proxyGet(req, "/me/wallet/address");
}
