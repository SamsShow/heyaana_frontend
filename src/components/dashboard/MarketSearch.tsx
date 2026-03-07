"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Market, GammaCategory, gammaFetcher, fetchGammaCategories, buildGammaUrl } from "@/lib/api";
import { Search, Loader2, Flame } from "lucide-react";

interface MarketSearchProps {
    onSelectMarket?: (ticker: string) => void;
    selectedTicker?: string;
    /** If true, clicking a market navigates to /dashboard/markets/[ticker] */
    navigateOnSelect?: boolean;
    /** Max height for the list */
    maxHeight?: string;
}

const TRENDING_URL = "/api/gamma?active=true&closed=false&limit=100&order=volume&ascending=false";

export function MarketSearch({
    onSelectMarket,
    selectedTicker,
    navigateOnSelect = false,
    maxHeight,
}: MarketSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [activeTagId, setActiveTagId] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    const isSearching = debouncedQuery.length > 0;

    // Fetch dynamic categories from top trending events
    const { data: categories = [] } = useSWR<GammaCategory[]>(
        TRENDING_URL,
        fetchGammaCategories,
        { revalidateOnFocus: false, dedupingInterval: 300000 },
    );

    const endpoint = isSearching
        ? buildGammaUrl({ title: debouncedQuery, limit: 30 })
        : buildGammaUrl({ tag_id: activeTagId ?? undefined, order: "volume", ascending: false, limit: 30 });

    const { data: markets = [], isLoading } = useSWR<Market[]>(
        endpoint,
        gammaFetcher,
        { revalidateOnFocus: false },
    );

    const handleSelect = useCallback(
        (market: Market) => {
            const id = market.condition_id ?? market.ticker;
            if (navigateOnSelect) {
                const url = new URL("/dashboard/market", window.location.origin);
                url.searchParams.set("conditionId", id);
                if (market.image) url.searchParams.set("img", market.image);
                router.push(url.pathname + url.search);
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
                <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
                    {/* Trending — always first */}
                    <button
                        onClick={() => setActiveTagId(null)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-full whitespace-nowrap transition-all shrink-0 ${activeTagId === null
                            ? "bg-blue-primary/10 text-blue-primary border border-blue-primary/30"
                            : "text-muted hover:text-foreground border border-transparent hover:border-border"
                        }`}
                    >
                        <Flame className="w-3 h-3" />
                        Trending
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTagId(cat.id)}
                            className={`px-3 py-1.5 text-xs font-mono rounded-full whitespace-nowrap transition-all shrink-0 ${activeTagId === cat.id
                                ? "bg-blue-primary/10 text-blue-primary border border-blue-primary/30"
                                : "text-muted hover:text-foreground border border-transparent hover:border-border"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Results */}
            <div
                className="mt-3 flex-1 overflow-y-auto space-y-2"
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
            className={`w-full text-left px-4 py-4 rounded-2xl border transition-all ${
                isSelected
                    ? "border-blue-primary/40 bg-blue-primary/5"
                    : "border-border bg-surface/50 hover:bg-surface/80 hover:border-border/80"
            }`}
        >
            <div className="flex items-center gap-4">
                {/* Image or initial */}
                <div className="w-12 h-12 rounded-xl bg-surface-hover border border-border flex items-center justify-center shrink-0 overflow-hidden">
                    {market.image ? (
                        <img src={market.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-lg font-bold text-foreground/80">{initial}</span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug line-clamp-2 text-foreground mb-2.5">
                        {title}
                    </p>

                    {/* Price pills */}
                    <div className="flex items-center gap-2">
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

