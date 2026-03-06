"use client";

import useSWR from "swr";
import { fetcher, MetaStatsResponse, refreshCache } from "@/lib/api";
import { Loader2, RefreshCw, Clock, BarChart3, Activity } from "lucide-react";
import { useState } from "react";

// Map meta_stats API metric names to display config
const META_STAT_CONFIG: Record<
    string,
    { label: string; icon: React.ReactNode; metricKey: string }
> = {
    total_trades: {
        label: "Total Trades",
        icon: <Activity className="w-4 h-4" />,
        metricKey: "num_trades_millions",
    },
    total_volume: {
        label: "Total Volume",
        icon: <BarChart3 className="w-4 h-4" />,
        metricKey: "total_volume_billions",
    },
    unique_markets: {
        label: "Unique Markets",
        icon: <BarChart3 className="w-4 h-4" />,
        metricKey: "num_markets",
    },
};

function formatStatValue(metricKey: string, value: number, formatted: string): string {
    if (metricKey === "num_trades_millions") return `${formatted || value.toFixed(1)}M`;
    if (metricKey === "total_volume_billions") return `${formatted || value.toFixed(2)}B`;
    if (metricKey === "num_markets" && value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }
    return formatted ?? String(value);
}

function buildStatsFromMetaStats(data: MetaStatsResponse["data"]): Array<{
    key: string;
    label: string;
    value: string;
    icon: React.ReactNode;
}> {
    const byMetric = Object.fromEntries(
        data.map((m) => [m.metric, { value: m.value, formatted: m.formatted }])
    );
    return Object.entries(META_STAT_CONFIG).map(([key, cfg]) => {
        const m = byMetric[cfg.metricKey];
        const value = m
            ? formatStatValue(cfg.metricKey, m.value, m.formatted ?? "")
            : "—";
        return { key, label: cfg.label, value, icon: cfg.icon };
    });
}

export function DashboardSummary() {
    const { data, error, isLoading, mutate } = useSWR<MetaStatsResponse>(
        "/api/v1/analysis/meta_stats",
        fetcher,
        { revalidateOnFocus: false }
    );
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshCache();
            await mutate();
        } catch {
            // silently fail — SWR will show stale data
        } finally {
            setRefreshing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 rounded-xl border border-border bg-surface/50 flex items-center justify-center h-[140px]">
                <div className="flex items-center gap-2 text-muted">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-mono">Loading dashboard…</span>
                </div>
            </div>
        );
    }

    const hasData = Boolean(data?.data && Array.isArray(data.data) && data.data.length > 0);
    const stats = hasData ? buildStatsFromMetaStats(data!.data) : [];
    const refreshedAt = data?.refreshed_at
        ? new Date(data.refreshed_at).toLocaleString()
        : error
        ? "Offline — failed to load"
        : "Unknown";

    return (
        <div className="space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted font-mono">
                        <Clock className="w-3 h-3" />
                        <span>Last updated: {refreshedAt}</span>
                        {error && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                offline
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border rounded-lg hover:bg-surface transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Refreshing…" : "Refresh"}
                </button>
            </div>

            {/* Stats grid */}
            {stats.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.key}
                            className="terminal-card p-4 flex flex-col gap-2"
                        >
                            <div className="flex items-center gap-2 text-muted">
                                {stat.icon}
                                <span className="text-[11px] font-mono uppercase tracking-wider">
                                    {stat.label}
                                </span>
                            </div>
                            <div className="text-lg font-bold font-mono">{stat.value}</div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-6 rounded-xl border border-border bg-surface/50 flex items-center justify-center text-muted text-sm font-mono">
                    Failed to load stats
                </div>
            ) : null}
        </div>
    );
}
