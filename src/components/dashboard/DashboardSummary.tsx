"use client";

import useSWR from "swr";
import { fetcher, DashboardResponse, refreshCache } from "@/lib/api";
import { mockDashboardSummary } from "@/lib/mock-data";
import { Loader2, RefreshCw, Clock, TrendingUp, BarChart3, Activity, Zap } from "lucide-react";
import { useState } from "react";

function formatNumber(n: unknown): string {
    if (typeof n !== "number") return String(n ?? "—");
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    if (Number.isInteger(n)) return n.toLocaleString();
    return n.toFixed(2);
}

const STAT_ICONS: Record<string, React.ReactNode> = {
    total_trades: <Activity className="w-4 h-4" />,
    total_volume: <BarChart3 className="w-4 h-4" />,
    overall_win_rate: <TrendingUp className="w-4 h-4" />,
    avg_excess_return: <Zap className="w-4 h-4" />,
};

export function DashboardSummary() {
    const { data, error, isLoading, mutate } = useSWR<DashboardResponse>(
        "/dashboard",
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

    const isMock = (error || !data) && !isLoading;
    const summary = isMock ? mockDashboardSummary : data!.summary;
    const pendingCount = isMock ? 0 : (data?.pending_analyses?.length ?? 0);
    const refreshedAt = isMock
        ? "Offline — showing sample data"
        : data?.refreshed_at
        ? new Date(data.refreshed_at).toLocaleString()
        : "Unknown";

    // Build stat cards from summary object
    const stats = Object.entries(summary).map(([key, value]) => ({
        key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: formatNumber(value),
        icon: STAT_ICONS[key] || <BarChart3 className="w-4 h-4" />,
    }));

    return (
        <div className="space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted font-mono">
                        <Clock className="w-3 h-3" />
                        <span>Last updated: {refreshedAt}</span>
                        {isMock && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                sample
                            </span>
                        )}
                        {pendingCount > 0 && (
                            <span className="ml-2 text-amber-400 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {pendingCount} pending
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
            {stats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.key}
                            className="glass-card shine-effect p-4 flex flex-col gap-2"
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
            )}
        </div>
    );
}
