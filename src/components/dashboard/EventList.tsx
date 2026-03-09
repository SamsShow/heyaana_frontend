"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
    GammaEventSummary,
    GammaCategory,
    gammaEventsFetcher,
    fetchGammaCategories,
    buildGammaUrl,
} from "@/lib/api";
import {
    Search,
    Loader2,
    RefreshCw,
    AlertCircle,
    ChevronRight,
    Flame,
} from "lucide-react";

const TRENDING_URL =
    "/api/gamma?active=true&closed=false&limit=100&order=volume&ascending=false";

function formatVol(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
}

function formatEndDate(iso: string): string {
    try {
        return new Date(iso).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

export function EventList() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [activeTagId, setActiveTagId] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    const isSearching = debouncedQuery.length > 0;

    const { data: categories = [] } = useSWR<GammaCategory[]>(
        TRENDING_URL,
        fetchGammaCategories,
        { revalidateOnFocus: false, dedupingInterval: 300000 },
    );

    const endpoint = buildGammaUrl({
        ...(isSearching ? { title: debouncedQuery } : { tag_id: activeTagId ?? undefined }),
        order: "volume",
        ascending: false,
        limit: 40,
    });

    const {
        data: events = [],
        isLoading,
        error,
        mutate,
    } = useSWR<GammaEventSummary[]>(endpoint, gammaEventsFetcher, {
        revalidateOnFocus: false,
    });

    const handleSelect = (event: GammaEventSummary) => {
        const url = new URL("/dashboard/markets/event", window.location.origin);
        url.searchParams.set("slug", event.slug);
        if (event.image) url.searchParams.set("img", event.image);
        url.searchParams.set("title", event.title);
        router.push(url.pathname + url.search);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/80 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search markets…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 text-sm rounded-xl bg-surface/60 border border-border/70 text-foreground placeholder:text-foreground/55 focus:outline-none focus:border-blue-primary/50 focus:ring-2 focus:ring-blue-primary/20 transition-all"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />
                )}
            </div>

            {/* Category filter tabs */}
            {!isSearching && (
                <div className="pill-tabs mt-3 w-full overflow-x-auto whitespace-nowrap scrollbar-none">
                    <button
                        onClick={() => setActiveTagId(null)}
                        className={`pill-tab inline-flex items-center gap-1 ${activeTagId === null ? "active" : ""}`}
                    >
                        <Flame className="w-3 h-3" />
                        Trending
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTagId(cat.id)}
                            className={`pill-tab ${activeTagId === cat.id ? "active" : ""}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && !isLoading && events.length === 0 && (
                <div className="dashboard-card mt-4 p-8 flex flex-col items-center gap-3 text-center">
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                    <p className="text-sm font-semibold">Unable to load markets</p>
                    <p className="text-xs text-muted">The Polymarket API may be temporarily unavailable.</p>
                    <button
                        onClick={() => mutate()}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-primary/10 border border-blue-primary/30 text-blue-primary hover:bg-blue-primary/20 transition-all"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try Again
                    </button>
                </div>
            )}

            {/* Event list */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2">
                {isLoading && events.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted">
                        <Loader2 className="w-6 h-6 mb-2 animate-spin opacity-50" />
                        <p className="text-xs font-mono">Loading markets…</p>
                    </div>
                )}

                {!isLoading && !error && events.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted">
                        <Search className="w-6 h-6 mb-2 opacity-30" />
                        <p className="text-sm font-mono">
                            {isSearching ? `No markets found for "${debouncedQuery}"` : "No markets available"}
                        </p>
                    </div>
                )}

                {events.map((event) => (
                    <button
                        key={event.slug}
                        onClick={() => handleSelect(event)}
                        className="w-full text-left flex items-center gap-4 px-4 py-4 rounded-xl border border-border/50 bg-surface/30 hover:bg-surface/70 hover:border-border transition-all group"
                    >
                        {/* Image */}
                        <div className="w-14 h-14 rounded-xl bg-surface-hover border border-border flex items-center justify-center shrink-0 overflow-hidden">
                            {event.image ? (
                                <img src={event.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg font-bold text-foreground/40">
                                    {event.title[0]?.toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Title + date */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-snug truncate group-hover:text-blue-primary transition-colors">
                                {event.title}
                            </p>
                            {event.close_time && (
                                <p className="text-[11px] font-mono text-muted/50 mt-1">
                                    {formatEndDate(event.close_time)}
                                </p>
                            )}
                        </div>

                        {/* Stats on right */}
                        <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
                            <div className="flex items-center gap-3 text-xs font-mono">
                                <span className="text-emerald-400 font-semibold">{formatVol(event.volume)}</span>
                                {event.volume_24h > 0 && (
                                    <span className="text-blue-primary/80">{formatVol(event.volume_24h)} <span className="text-muted/60">24h</span></span>
                                )}
                                {event.liquidity > 0 && (
                                    <span className="text-amber-400/80">{formatVol(event.liquidity)} <span className="text-muted/60">liq</span></span>
                                )}
                                <span className="text-purple-400/80">{event.market_count} <span className="text-muted/60">markets</span></span>
                            </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-muted/40 shrink-0 group-hover:text-blue-primary transition-colors ml-2" />
                    </button>
                ))}
            </div>
        </div>
    );
}
