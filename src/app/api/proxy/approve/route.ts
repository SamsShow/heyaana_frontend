import { NextRequest } from "next/server";
import { proxyPost } from "../helpers";

/** POST /api/proxy/approve → api2 /approve */
export function POST(req: NextRequest) {
  return proxyPost(req, "/approve", { hasBody: false });
}
