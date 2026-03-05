import { NextRequest } from "next/server";
import { proxyGet } from "../../helpers";

/** GET /api/proxy/copy-trading/following → api2 /copy-trading/following */
export function GET(req: NextRequest) {
  return proxyGet(req, "/copy-trading/following");
}
