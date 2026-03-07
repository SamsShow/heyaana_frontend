"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Market, gammaFetcher, buildGammaUrl } from "@/lib/api";
import { Search, Loader2, Flame, Zap, TrendingUp, Trophy, Tv2 } from "lucide-react";

interface MarketSearchProps {
    onSelectMarket?: (ticker: string) => void;
    selectedTicker?: string;
    /** If true, clicking a market navigates to /dashboard/markets/[ticker] */
    navigateOnSelect?: boolean;
    /** Max height for the list */
    maxHeight?: string;
}

// tag_ids from Polymarket: https://gamma-api.polymarket.com/tags
const CATEGORIES = [
    { id: "trending", label: "Trending", icon: Flame,       tag_id: undefined, order: "volume" as const },
    { id: "sports",   label: "Sports",   icon: Trophy,      tag_id: 100381,    order: "volume" as const },
    { id: "crypto",   label: "Crypto",   icon: TrendingUp,  tag_id: 100085,    order: "volume" as const },
    { id: "politics", label: "Politics", icon: null,         tag_id: 100053,    order: "volume" as const },
    { id: "pop",      label: "Pop Culture", icon: Tv2,      tag_id: 100063,    order: "volume" as const },
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
    const activeCat = CATEGORIES.find((c) => c.id === activeCategory)!;

    const endpoint = isSearching
        ? buildGammaUrl({ title: debouncedQuery, limit: 30 })
        : buildGammaUrl({ tag_id: activeCat.tag_id, order: activeCat.order, ascending: false, limit: 30 });

    const { data: markets = [], isLoading } = useSWR<Market[]>(
        endpoint,
        gammaFetcher,
        { revalidateOnFocus: false },
    );

    const handleSelect = useCallback(
        (market: Market) => {
            const id = market.condition_id ?? market.ticker;
            if (navigateOnSelect) {
                router.push(`/dashboard/market?conditionId=${encodeURIComponent(id)}`);
            }
            onSelectMarket?.(id);
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

                {markets.map((market) => {
                    const id = market.condition_id ?? market.ticker;
                    return (
                        <MarketCard
                            key={id}
                            market={market}
                            isSelected={selectedTicker === id}
                            onClick={() => handleSelect(market)}
                        />
                    );
                })}
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
    const title = market.title || "?";
    const initial = title[0].toUpperCase();

    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all ${
                isSelected
                    ? "border-blue-primary/40 bg-blue-primary/5"
                    : "border-border bg-surface/50 hover:bg-surface/80 hover:border-border/80"
            }`}
        >
            <div className="flex items-center gap-3">
                {/* Square icon */}
                <div className="w-11 h-11 rounded-xl bg-surface-hover border border-border flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-foreground/80">{initial}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug line-clamp-2 text-foreground">
                        {title}
                    </p>

                    {/* Price pills */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500 text-white">
                            Yes {yesPrice}¢
                        </span>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500 text-white">
                            No {noPrice}¢
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}

