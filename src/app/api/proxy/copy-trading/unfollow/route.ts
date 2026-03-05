import { NextRequest } from "next/server";
import { proxyPost } from "../../helpers";

/** POST /api/proxy/copy-trading/unfollow → api2 /copy-trading/unfollow */
export function POST(req: NextRequest) {
  return proxyPost(req, "/copy-trading/unfollow");
}
