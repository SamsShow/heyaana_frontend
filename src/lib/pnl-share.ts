import type { Position } from "@/lib/api";
import { getPublicSiteUrl } from "@/lib/site-url";

export type PnlShareBuildInput = {
  position: Position;
  marketTitle?: string;
};

function fmtPrice(n: number | undefined): string {
  if (n === undefined || !Number.isFinite(n)) return "—";
  return `$${n.toFixed(4)}`;
}

/** OG `<img>` needs an absolute URL; portfolio icons are often `https://` or `//…`. */
function resolveMarketIconUrl(icon: string | undefined): string | undefined {
  if (!icon?.trim()) return undefined;
  const t = icon.trim();
  if (t.startsWith("https://")) return t;
  if (t.startsWith("http://")) return t;
  if (t.startsWith("//")) return `https:${t}`;
  return undefined;
}

/** Match dashboard position PnL: 4 decimals when small, grouped when large. */
function fmtPnlCashForShare(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  const a = Math.abs(n);
  const body =
    a >= 10_000
      ? a.toLocaleString("en-US", {
          maximumFractionDigits: 2,
          minimumFractionDigits: a % 1 === 0 ? 0 : 2,
        })
      : a.toFixed(4);
  return `${sign}$${body}`;
}

/**
 * Absolute origin for share URLs in the browser (current deployment).
 * Use this for modal preview + links copied while using the app.
 */
export function getShareOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getPublicSiteUrl();
}

/** Keep full market copy; only cap pathological lengths for URL limits. */
const MAX_MARKET_CHARS = 1800;

/** Query string shared by the OG image route and `/share/pnl/`. */
export function buildPnlShareSearchParams(input: PnlShareBuildInput): URLSearchParams {
  const { position, marketTitle } = input;
  const rawTitle = marketTitle ?? position.title ?? position.ticker ?? "Market";
  const title =
    rawTitle.length > MAX_MARKET_CHARS
      ? `${rawTitle.slice(0, MAX_MARKET_CHARS - 1)}…`
      : rawTitle;
  const pnl = position.pnl_cash ?? position.pnl ?? 0;
  const pnlPct = position.pnl_percent ?? position.pnl_pct;
  const entry = position.avg_price;
  const exit = position.current_price;
  const pnlCashDisplay = fmtPnlCashForShare(pnl);
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const side = position.outcome ?? position.side ?? "";
  const status = side ? `${side}` : "Open";
  const icon = resolveMarketIconUrl(position.icon);

  const q = new URLSearchParams();
  q.set("market", title);
  q.set("pnl", String(pnl));
  q.set("pnlCash", pnlCashDisplay);
  if (pnlPct !== undefined && Number.isFinite(pnlPct)) {
    q.set("pnlPct", String(pnlPct));
  }
  q.set("entry", fmtPrice(entry));
  q.set("exit", fmtPrice(exit));
  q.set("date", date);
  q.set("status", status.slice(0, 28));
  if (icon) q.set("icon", icon);
  return q;
}

/** Direct PNG endpoint (same-origin preview in modal). */
export function buildPnlShareImageUrl(origin: string, input: PnlShareBuildInput): string {
  const q = buildPnlShareSearchParams(input);
  const base = origin.replace(/\/$/, "");
  return `${base}/api/og/pnl/?${q.toString()}`;
}

/**
 * Landing page for X/social: carries the same query as the image so crawlers get `summary_large_image`.
 * Trailing path matches `trailingSlash: true` (`/share/pnl/?…`).
 */
export function buildPnlSharePageUrl(origin: string, input: PnlShareBuildInput): string {
  const q = buildPnlShareSearchParams(input);
  const base = origin.replace(/\/$/, "");
  return `${base}/share/pnl/?${q.toString()}`;
}
