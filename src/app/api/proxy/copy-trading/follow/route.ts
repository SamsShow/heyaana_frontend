import { NextRequest } from "next/server";
import { proxyPost } from "../../helpers";

/** POST /api/proxy/copy-trading/follow → api2 /copy-trading/follow */
export function POST(req: NextRequest) {
  return proxyPost(req, "/copy-trading/follow");
}
