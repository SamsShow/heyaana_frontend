const API_BASE_URL = "https://api.heyanna.trade/api/v1";

export async function fetcher(url: string) {
    const res = await fetch(url.startsWith("http") ? url : `${API_BASE_URL}${url}`);
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        error.name = await res.text();
        throw error;
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
    trade_id: string;
    ticker: string;
    count: number;
    yes_price: number;
    no_price: number;
    taker_side: string;
    created_time: string;
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
    ticker?: string;
    title?: string;
    side: "Yes" | "No" | string;
    shares: number;
    avg_price: number;
    current_price?: number;
    current_value?: number;
    pnl?: number;
    pnl_pct?: number;
};

export type Portfolio = {
    balance?: number;
    positions?: Position[];
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

// ─── Trade request ────────────────────────────────────────

export type TradeRequest = {
    market_id: number;
    side: "Yes" | "No";
    amount: number;
    auto_prepare?: boolean;
};

// ─── Client-side fetchers for proxy routes ────────────────

export async function proxyFetcher(url: string) {
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
    }
    return res.json();
}

export async function postTrade(trade: TradeRequest) {
    const res = await fetch("/api/proxy/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trade),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Trade failed");
    return data;
}

// ─── API helper functions ─────────────────────────────────

export async function refreshCache(): Promise<Record<string, string>> {
    const res = await fetch(`${API_BASE_URL}/refresh`, { method: "POST" });
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
