"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { fetcher, formatVolume, Market, normalizeMarket } from "@/lib/api";
import { parseMarketTitle } from "@/lib/market-title";
import { Search, Loader2, TrendingUp, Flame, Zap } from "lucide-react";

interface MarketSearchProps {
    onSelectMarket?: (ticker: string) => void;
    selectedTicker?: string;
    /** If true, clicking a market navigates to /dashboard/markets/[ticker] */
    navigateOnSelect?: boolean;
    /** Max height for the list */
    maxHeight?: string;
}

const CATEGORIES = [
    { id: "trending", label: "Trending", icon: Flame, query: "" },
    { id: "sports", label: "Sports", icon: Zap, query: "sports game" },
    { id: "crypto", label: "Crypto", icon: TrendingUp, query: "crypto bitcoin" },
    { id: "politics", label: "Politics", icon: null, query: "election president" },
    { id: "entertainment", label: "Entertain.", icon: null, query: "entertainment" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

export function MarketSearch({
    onSelectMarket,
    selectedTicker,
    navigateOnSelect = false,
    maxHeight,
}: MarketSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<CategoryId>("trending");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    const isSearching = debouncedQuery.length > 0;

    // Use api2 proxy endpoints — search query or trending fallback
    const activeQuery = isSearching
        ? debouncedQuery
        : (CATEGORIES.find((c) => c.id === activeCategory)?.query ?? "");
    const endpoint = activeQuery
        ? `/api/proxy/markets/search?q=${encodeURIComponent(activeQuery)}`
        : "/api/proxy/markets/trending";

    const { data, isLoading } = useSWR<
        { markets?: Market[]; results?: Market[] } | Market[]
    >(
        endpoint,
        fetcher,
        { revalidateOnFocus: false },
    );

    // Normalize response shape
    const rawMarkets: Market[] = Array.isArray(data)
        ? data
        : (data?.results ?? data?.markets ?? []);
    const markets: Market[] = rawMarkets.map((m) => normalizeMarket(m));

    const handleSelect = useCallback(
        (market: Market) => {
            if (navigateOnSelect) {
                const id = market.condition_id ?? market.ticker;
                router.push(`/dashboard/market?conditionId=${encodeURIComponent(id)}`);
            }
            onSelectMarket?.(market.ticker);
        },
        [navigateOnSelect, router, onSelectMarket],
    );

    return (
        <div className="flex flex-col h-full">
            {/* Search input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                    type="text"
                    placeholder="Search markets…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm font-mono bg-surface border border-border rounded-lg focus:outline-none focus:border-blue-primary/50 focus:ring-1 focus:ring-blue-primary/20 placeholder:text-muted/50 transition-all"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />
                )}
            </div>

            {/* Category tabs (hidden while searching) */}
            {!isSearching && (
                <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-full whitespace-nowrap transition-all ${activeCategory === cat.id
                                    ? "bg-blue-primary/10 text-blue-primary border border-blue-primary/30"
                                    : "text-muted hover:text-foreground border border-transparent hover:border-border"
                                    }`}
                            >
                                {Icon && <Icon className="w-3 h-3" />}
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Results */}
            <div
                className="mt-3 flex-1 overflow-y-auto space-y-1.5"
                style={maxHeight ? { maxHeight } : { maxHeight: "600px" }}
            >
                {isLoading && markets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted">
                        <Loader2 className="w-6 h-6 mb-2 animate-spin opacity-50" />
                        <p className="text-xs font-mono">Loading markets…</p>
                    </div>
                )}

                {!isLoading && markets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted">
                        <Search className="w-6 h-6 mb-2 opacity-30" />
                        <p className="text-sm font-mono">
                            {isSearching
                                ? `No markets found for "${debouncedQuery}"`
                                : "No markets available"}
                        </p>
                    </div>
                )}

                {markets.map((market) => (
                    <MarketCard
                        key={market.ticker}
                        market={market}
                        isSelected={selectedTicker === market.ticker}
                        onClick={() => handleSelect(market)}
                    />
                ))}
            </div>
        </div>
    );
}

function MarketCard({
    market,
    isSelected,
    onClick,
}: {
    market: Market;
    isSelected: boolean;
    onClick: () => void;
}) {
    const yesPrice = market.yes_bid ?? market.last_price ?? 0;
    const noPrice = market.no_bid ?? (market.last_price ? 100 - market.last_price : 0);
    const parsedTitle = parseMarketTitle(market.title);

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-3 rounded-xl border transition-all group ${isSelected
                ? "border-blue-primary/40 bg-blue-primary/5"
                : "border-border hover:border-border hover:bg-surface/80"
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                    <span className="text-base">
                        {getCategoryEmoji(market.event_ticker)}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-foreground">
                        {parsedTitle.displayTitle}
                    </p>
                    {parsedTitle.subtitle && (
                        <p className="mt-1 text-[11px] text-muted line-clamp-1">{parsedTitle.subtitle}</p>
                    )}

                    {/* Price buttons */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Yes {yesPrice}¢
                        </span>
                        <span className="text-xs font-mono px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                            No {noPrice}¢
                        </span>
                        {market.volume > 0 && (
                            <span className="text-[10px] font-mono text-muted ml-auto flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {formatVolume(market.volume)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}

function getCategoryEmoji(eventTicker: string): string {
    const lower = (eventTicker ?? "").toLowerCase();
    if (lower.includes("nba") || lower.includes("nfl") || lower.includes("sport") || lower.includes("game"))
        return "🏈";
    if (lower.includes("crypto") || lower.includes("btc") || lower.includes("eth"))
        return "₿";
    if (lower.includes("election") || lower.includes("politic") || lower.includes("president"))
        return "🏛️";
    if (lower.includes("ai") || lower.includes("tech")) return "🤖";
    return "📊";
}
