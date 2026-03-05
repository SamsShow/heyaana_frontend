import { NextRequest } from "next/server";
import { proxyPost } from "../../helpers";

/** POST /api/proxy/copy-trading/enable → api2 /me/copy-trading/enable */
export function POST(req: NextRequest) {
  return proxyPost(req, "/me/copy-trading/enable", { hasBody: false });
}
