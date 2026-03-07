import { API1_BASE_URL, API2_BASE_URL, TOKEN_STORAGE_KEY } from "./auth-api";

export async function fetcher(url: string) {
    let requestUrl: string;

    if (url.startsWith("/api/v1/")) {
        // Analysis, dashboard, and market endpoints — api.heyanna.trade (no auth needed)
        requestUrl = `${API1_BASE_URL}${url}`;
    } else {
        let path = url;
        if (path.startsWith("/api/proxy")) {
            path = path.replace(/^\/api\/proxy/, "");
        } else if (path.startsWith("/api/auth")) {
            path = path.replace(/^\/api\/auth/, "");
        }
        requestUrl = path.startsWith("http") ? path : `${API2_BASE_URL}${path}`;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    };
    if (token && !url.startsWith("/api/v1/")) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(requestUrl, { headers });
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        error.name = await res.text();
        throw error;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
    }
    return res.json();
}

// ─── Analysis types ───────────────────────────────────────

export type AnalysisResponse = {
    name: string;
    description: string;
    data: Record<string, unknown>[];
    chart?: {
        type: "line" | "bar" | "area" | "stacked-area-100" | "stacked-bar-100";
        data: Record<string, unknown>[];
        xKey: string;
        yKeys: string[];
        title: string;
        yUnit?: string;
        strokeDasharrays?: (string | null)[];
        colors?: Record<string, string>;
        xLabel?: string;
        yLabel?: string;
    };
    refreshed_at: string;
};

// Meta stats from /api/v1/analysis/meta_stats
export type MetaStatsMetric = { metric: string; value: number; formatted: string };
export type MetaStatsResponse = {
    name: string;
    description?: string;
    data: MetaStatsMetric[];
    chart?: unknown;
    refreshed_at?: string;
};

export type DashboardResponse = {
    summary: Record<string, unknown>;
    win_rate_by_price: Record<string, unknown>;
    returns_by_hour: Record<string, unknown>;
    volume_over_time: Record<string, unknown>;
    maker_taker_gap: Record<string, unknown>;
    ev_yes_vs_no: Record<string, unknown>;
    mispricing_by_price: Record<string, unknown>;
    longshot_volume_share: Record<string, unknown>;
    trade_size_by_role: Record<string, unknown>;
    maker_vs_taker_returns: Record<string, unknown>;
    maker_returns_by_direction: Record<string, unknown>;
    maker_win_rate_by_direction: Record<string, unknown>;
    yes_vs_no_by_price: Record<string, unknown>;
    maker_taker_returns_by_category: Record<string, unknown>;
    win_rate_by_trade_size: Record<string, unknown>;
    kalshi_calibration_deviation: Record<string, unknown>;
    refreshed_at: string;
    pending_analyses: string[];
};

// ─── Market types ─────────────────────────────────────────

export type Market = {
    id?: number;
    condition_id?: string;
    ticker: string;
    event_ticker: string;
    market_type: string;
    title: string;
    yes_sub_title: string;
    no_sub_title: string;
    status: string;
    yes_bid: number | null;
    yes_ask: number | null;
    no_bid: number | null;
    no_ask: number | null;
    last_price: number | null;
    volume: number;
    volume_24h: number;
    open_interest: number;
    result: string;
    created_time: string | null;
    open_time: string | null;
    close_time: string | null;
};

export type Trade = {
    // Real API fields from /data/trades
    transactionHash?: string;
    proxyWallet?: string;
    side?: string;           // "BUY" | "SELL"
    outcome?: string;        // "Yes" | "No"
    size?: number;
    price?: number;
    timestamp?: number;      // unix seconds
    title?: string;
    icon?: string;
    name?: string;
    conditionId?: string;
    // Legacy field aliases (kept for backwards compat)
    trade_id?: string;
    ticker?: string;
    count?: number;
    yes_price?: number;
    no_price?: number;
    taker_side?: string;
    created_time?: string;
};

// ─── Analysis endpoint names ──────────────────────────────

export const ANALYSIS_ENDPOINTS = [
    "win_rate_by_price",
    "returns_by_hour",
    "volume_over_time",
    "maker_taker_gap",
    "ev_yes_vs_no",
    "mispricing_by_price",
    "longshot_volume_share",
    "trade_size_by_role",
    "maker_vs_taker_returns",
    "maker_returns_by_direction",
    "maker_win_rate_by_direction",
    "yes_vs_no_by_price",
    "maker_taker_returns_by_category",
    "win_rate_by_trade_size",
    "kalshi_calibration_deviation",
] as const;

export type AnalysisEndpoint = (typeof ANALYSIS_ENDPOINTS)[number];

// ─── Portfolio types ──────────────────────────────────────

export type Position = {
    market_id?: number;
    condition_id?: string;
    conditionId?: string;
    ticker?: string;
    title?: string;
    slug?: string;
    icon?: string;
    // API returns 'outcome', older responses may use 'side'
    outcome?: string;
    side?: string;
    // API returns 'size', older responses may use 'shares'
    size?: number;
    shares?: number;
    avg_price?: number;
    current_price?: number;
    current_value?: number;
    // API returns pnl_cash / pnl_percent
    pnl_cash?: number;
    pnl_percent?: number;
    // legacy field names
    pnl?: number;
    pnl_pct?: number;
    orders?: PortfolioOrder[];
};

export type PortfolioOrder = {
    source?: string;
    proxyWallet?: string;
    side?: string;
    asset?: string;
    conditionId?: string;
    condition_id?: string;
    size?: number;
    price?: number;
    timestamp?: number;
    title?: string;
    slug?: string;
    icon?: string;
    outcome?: string;
    status?: string;
    tx_hash?: string;
};

export type Portfolio = {
    wallet?: string;
    // balance text summary — API returns 'on_chain_summary'
    on_chain_summary?: string;
    funds_summary?: string;
    balance?: number;
    positions?: Position[];
    totals?: {
        portfolio_value?: number;
        total_pnl?: number;
    };
    portfolio_value?: number;
    total_pnl?: number;
    orders?: PortfolioOrder[];
    [key: string]: unknown;
};

// ─── Trending / api2 Market types ─────────────────────────

export type Api2Market = {
    id?: number;
    condition_id?: string;
    question?: string;
    title?: string;
    slug?: string;
    image?: string;
    icon?: string;
    description?: string;
    yes_price?: number;
    no_price?: number;
    volume?: number;
    volume_24h?: number;
    liquidity?: number;
    end_date?: string;
    outcome?: string;
    active?: boolean;
    closed?: boolean;
    category?: string;
    tokens?: Array<{
        token_id: string;
        outcome: string;
        price: number;
    }>;
    [key: string]: unknown;
};

type RawMarket = Partial<Market> &
    Partial<Api2Market> & {
        event_title?: string;
        outcomes?: string[];
        odds_cents?: Record<string, number>;
    };

function toNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function readOdds(odds: Record<string, number> | undefined, key: "yes" | "no"): number | null {
    if (!odds) return null;
    const direct = odds[key] ?? odds[key.toUpperCase()] ?? odds[key[0].toUpperCase() + key.slice(1)];
    return toNumber(direct);
}

export function normalizeMarket(raw: RawMarket): Market {
    const yesFromOdds = readOdds(raw.odds_cents, "yes");
    const noFromOdds = readOdds(raw.odds_cents, "no");
    const yesBid = toNumber(raw.yes_bid) ?? toNumber(raw.yes_price) ?? yesFromOdds;
    const noBid = toNumber(raw.no_bid) ?? toNumber(raw.no_price) ?? noFromOdds;
    const lastPrice = toNumber(raw.last_price) ?? yesBid;
    const computedNo = noBid ?? (lastPrice !== null ? Math.max(0, 100 - lastPrice) : null);

    const ticker =
        raw.ticker ??
        raw.slug ??
        raw.condition_id ??
        (raw.id != null ? String(raw.id) : null) ??
        (toNumber((raw as { market_id?: unknown }).market_id) != null
            ? String(toNumber((raw as { market_id?: unknown }).market_id))
            : null) ??
        "UNKNOWN";
    const eventTicker =
        raw.event_ticker ??
        raw.event_title ??
        raw.category ??
        "UNKNOWN";
    const title =
        raw.question ??
        raw.title ??
        raw.event_title ??
        ticker;
    const status =
        raw.status ??
        (raw.closed ? "closed" : raw.active === false ? "closed" : "open");
    const yesSubtitle = raw.yes_sub_title ?? raw.outcomes?.[0] ?? "Yes";
    const noSubtitle = raw.no_sub_title ?? raw.outcomes?.[1] ?? "No";

    return {
        id: toNumber(raw.id) ?? toNumber((raw as { market_id?: unknown }).market_id) ?? undefined,
        condition_id: raw.condition_id ?? undefined,
        ticker,
        event_ticker: eventTicker,
        market_type: raw.market_type ?? "binary",
        title,
        yes_sub_title: yesSubtitle,
        no_sub_title: noSubtitle,
        status,
        yes_bid: yesBid,
        yes_ask: toNumber(raw.yes_ask) ?? yesBid,
        no_bid: computedNo,
        no_ask: toNumber(raw.no_ask) ?? computedNo,
        last_price: lastPrice,
        volume: toNumber(raw.volume) ?? 0,
        volume_24h: toNumber(raw.volume_24h) ?? 0,
        open_interest: toNumber(raw.open_interest) ?? toNumber(raw.liquidity) ?? 0,
        result: raw.result ?? raw.outcome ?? "",
        created_time: raw.created_time ?? null,
        open_time: raw.open_time ?? null,
        close_time: raw.close_time ?? raw.end_date ?? null,
    };
}

// ─── Trade request ────────────────────────────────────────

export type TradeRequest = {
    condition_id: string;
    side: "Yes" | "No";
    amount: number;
    order_side?: "BUY" | "SELL";
    auto_prepare?: boolean;
};

// ─── Client-side fetchers for proxy routes ────────────────

export async function proxyFetcher(url: string) {
    const path = url.replace(/^\/api\/proxy/, "");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
        const res = await fetch(`${API2_BASE_URL}${path}`, {
            signal: controller.signal,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : ""}`
            }
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error ?? "Request failed");
        }
        const ct = res.headers.get("content-type") ?? "";
        if (!ct.includes("application/json")) {
            throw new Error("Server returned non-JSON response");
        }
        return res.json();
    } catch (err) {
        if ((err as Error)?.name === "AbortError") throw new Error("Request timed out");
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}

export async function postTrade(trade: TradeRequest) {
    const res = await fetch(`${API2_BASE_URL}/trade`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : ""}`
        },
        body: JSON.stringify(trade),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? data.detail ?? "Trade failed");
    if (data.success === false) {
        const swapHint = data.auto_prepare?.swap_result ? ` (${data.auto_prepare.swap_result})` : "";
        throw new Error(`${data.message ?? data.error ?? "Trade failed"}${swapHint}`);
    }
    if (data.status === "error") throw new Error(data.message ?? data.error ?? "Trade execution failed");
    if (typeof data.result === "string" && data.result.toUpperCase().includes("FAILED")) {
        const swapHint = data.auto_prepare?.swap_result ? ` (${data.auto_prepare.swap_result})` : "";
        throw new Error(`${data.result.trim()}${swapHint}`);
    }
    return data;
}

// ─── Copy trading ─────────────────────────────────────────

export async function enableCopyTrading(): Promise<unknown> {
    const res = await fetch(`${API2_BASE_URL}/me/copy-trading/enable`, {
        method: "POST",
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : ""}`
        }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to enable copy trading");
    return data;
}

export async function disableCopyTrading(): Promise<unknown> {
    const res = await fetch(`${API2_BASE_URL}/me/copy-trading/disable`, {
        method: "POST",
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : ""}`
        }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to disable copy trading");
    return data;
}

export async function followTrader(leaderUsername: string): Promise<unknown> {
    const res = await fetch(`${API2_BASE_URL}/copy-trading/follow`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : ""}`
        },
        body: JSON.stringify({ leader_username: leaderUsername }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to follow trader");
    return data;
}

export async function unfollowTrader(leaderUsername: string): Promise<unknown> {
    const res = await fetch(`${API2_BASE_URL}/copy-trading/unfollow`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : ""}`
        },
        body: JSON.stringify({ leader_username: leaderUsername }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to unfollow trader");
    return data;
}

// ─── Close position ───────────────────────────────────────

export async function closePosition(conditionId: string, size?: number): Promise<unknown> {
    const res = await fetch(`${API2_BASE_URL}/position/close`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : ""}`
        },
        body: JSON.stringify({ condition_id: conditionId, ...(size !== undefined ? { size } : {}) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? data.detail ?? "Failed to close position");
    if (typeof data.result === "string" && data.result.toUpperCase().includes("FAILED")) {
        throw new Error(data.result.trim());
    }
    return data;
}

// ─── Approve trading ──────────────────────────────────────

export async function approveTrading(): Promise<unknown> {
    const res = await fetch(`${API2_BASE_URL}/approve`, {
        method: "POST",
        headers: {
            "accept": "application/json",
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : ""}`
        }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? data.detail ?? "Approval failed");
    return data;
}

// ─── Export private key ───────────────────────────────────

export async function exportPrivateKey(): Promise<string> {
    const res = await fetch(`${API2_BASE_URL}/me/wallet/private-key`, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : ""}`
        }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? data.detail ?? "Failed to export private key");
    const key = data.eth_private_key ?? data.private_key ?? data.key ?? data.privateKey;
    if (!key) throw new Error("Private key not found in response");
    return key as string;
}

// ─── Trade cancel ─────────────────────────────────────────

export async function cancelTrade(orderId: string) {
    const res = await fetch(`${API2_BASE_URL}/trade/cancel`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : ""}`
        },
        body: JSON.stringify({ order_id: orderId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Cancel failed");
    return data;
}

// ─── API helper functions ─────────────────────────────────

export async function refreshCache(): Promise<Record<string, string>> {
    const res = await fetch(`${API1_BASE_URL}/api/v1/refresh`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to refresh cache");
    return res.json();
}

// ─── Formatting helpers ───────────────────────────────────

export function formatVolume(vol: number): string {
    if (vol >= 1_000_000_000) return `$${(vol / 1_000_000_000).toFixed(1)}B`;
    if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
    if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
    return `$${vol}`;
}

export function formatRelativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export function truncateAddress(addr: string): string {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
