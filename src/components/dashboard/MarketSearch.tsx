"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher, Market } from "@/lib/api";
import { Search, Loader2, TrendingUp } from "lucide-react";

interface MarketSearchProps {
    onSelectMarket: (ticker: string) => void;
    selectedTicker?: string;
}

export function MarketSearch({ onSelectMarket, selectedTicker }: MarketSearchProps) {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    const { data, isLoading } = useSWR<{ markets?: Market[] } | Market[]>(
        debouncedQuery.length >= 2 ? `/market/search?query=${encodeURIComponent(debouncedQuery)}&limit=20` : null,
        fetcher,
        { revalidateOnFocus: false }
    );

    // Normalize data — API might return array or object with markets key
    const markets: Market[] = Array.isArray(data) ? data : (data?.markets ?? []);

    return (
        <div className="flex flex-col h-full">
            {/* Search input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                    type="text"
                    placeholder="Search markets by title or ticker…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm font-mono bg-surface border border-border rounded-lg focus:outline-none focus:border-blue-primary/50 focus:ring-1 focus:ring-blue-primary/20 placeholder:text-muted/50 transition-all"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />
                )}
            </div>

            {/* Results */}
            <div className="mt-3 flex-1 overflow-y-auto space-y-1 max-h-[600px]">
                {debouncedQuery.length < 2 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted">
                        <Search className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-sm font-mono">Type at least 2 characters to search</p>
                    </div>
                )}

                {debouncedQuery.length >= 2 && !isLoading && markets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted">
                        <p className="text-sm font-mono">No markets found for &quot;{debouncedQuery}&quot;</p>
                    </div>
                )}

                {markets.map((market) => (
                    <button
                        key={market.ticker}
                        onClick={() => onSelectMarket(market.ticker)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                            selectedTicker === market.ticker
                                ? "border-blue-primary/40 bg-blue-primary/5"
                                : "border-border hover:border-border hover:bg-surface"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm leading-snug line-clamp-2">{market.title}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] font-mono text-muted">{market.ticker}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                        market.status === "open"
                                            ? "bg-green-500/10 text-green-400"
                                            : market.status === "closed"
                                            ? "bg-red-500/10 text-red-400"
                                            : "bg-amber-500/10 text-amber-400"
                                    }`}>
                                        {market.status}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                {market.last_price !== null && (
                                    <div className="text-sm font-mono font-medium">
                                        {market.last_price}¢
                                    </div>
                                )}
                                {market.volume_24h > 0 && (
                                    <div className="flex items-center gap-1 text-[10px] text-muted font-mono mt-0.5">
                                        <TrendingUp className="w-3 h-3" />
                                        {market.volume_24h.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
