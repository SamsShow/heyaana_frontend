import { NextRequest } from "next/server";
import { proxyPost } from "../../helpers";

/** POST /api/proxy/copy-trading/disable → api2 /me/copy-trading/disable */
export function POST(req: NextRequest) {
  return proxyPost(req, "/me/copy-trading/disable", { hasBody: false });
}
