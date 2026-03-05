import { NextRequest } from "next/server";
import { proxyPost } from "../helpers";

/** POST /api/proxy/swap → api2 /swap */
export function POST(req: NextRequest) {
  return proxyPost(req, "/swap");
}
