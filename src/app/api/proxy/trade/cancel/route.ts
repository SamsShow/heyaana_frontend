import { NextRequest } from "next/server";
import { proxyPost } from "../../helpers";

/** POST /api/proxy/trade/cancel → api2 /trade/cancel */
export function POST(req: NextRequest) {
  return proxyPost(req, "/trade/cancel");
}
