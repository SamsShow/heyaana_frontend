import { NextRequest } from "next/server";
import { proxyPost } from "../helpers";

/** POST /api/proxy/trade → api2 /trade */
export function POST(req: NextRequest) {
  return proxyPost(req, "/trade");
}
