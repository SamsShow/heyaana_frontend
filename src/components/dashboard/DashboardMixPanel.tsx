"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher, DashboardResponse } from "@/lib/api";
import { mockDashboardSummary, topTraders } from "@/lib/mock-data";
import { Activity, Clock3, Loader2, Users, Zap } from "lucide-react";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatCompactNumber(value: unknown): string {
  if (typeof value !== "number") return "—";
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
}

type TradingSnapshot = {
  win_rate_percent: number;
  total_trades: number;
  total_volume: number;
  refreshed_at: string;
};

export function DashboardMixPanel() {
  const { data, error, isLoading } = useSWR<DashboardResponse>("/api/v1/dashboard", fetcher, {
    revalidateOnFocus: false,
  });

  const [snapshot, setSnapshot] = useState<TradingSnapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  useEffect(() => {
    fetcher("/api/v1/trading_snapshot")
      .then((d) => setSnapshot(d as TradingSnapshot))
      .catch(() => {})
      .finally(() => setSnapshotLoading(false));
  }, []);

  const summary = isRecord(data?.summary) ? data.summary : mockDashboardSummary;
  const pendingAnalyses = Array.isArray(data?.pending_analyses) ? data.pending_analyses : [];
  const lastUpdated = data?.refreshed_at ? new Date(data.refreshed_at).toLocaleString() : "Offline";
  const isMock = Boolean(error) || !isRecord(data?.summary);

  const overallWinRate = snapshot
    ? `${snapshot.win_rate_percent}%`
    : typeof summary.overall_win_rate === "number" && !isNaN(summary.overall_win_rate as number)
      ? `${((summary.overall_win_rate as number) * 100).toFixed(1)}%`
      : "—";

  const volume24h = snapshot ? formatCompactNumber(snapshot.total_volume) : formatCompactNumber(summary.total_volume);
  const totalTrades = snapshot ? formatCompactNumber(snapshot.total_trades) : formatCompactNumber(summary.total_trades);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Operations Snapshot</h2>
        <p className="text-xs text-muted font-mono mt-1">
          Status, queues, and trader activity beyond chart analytics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
        <div className="terminal-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock3 className="w-4 h-4 text-blue-primary" />
              System Status
            </div>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-muted" /> : null}
          </div>
          <div className="text-xs font-mono text-muted">Last refresh: {lastUpdated}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`inline-block w-2 h-2 rounded-full ${isMock ? "bg-amber-400" : "bg-green-400"}`} />
            <span className="font-mono">{isMock ? "Fallback data mode" : "Live data mode"}</span>
          </div>
        </div>

        <div className="terminal-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Activity className="w-4 h-4 text-blue-primary" />
            Queue Health
          </div>
          <div className="space-y-2">
            {pendingAnalyses.length > 0 ? (
              pendingAnalyses.slice(0, 6).map((name) => (
                <div key={name} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted truncate pr-2">{name.replaceAll("_", " ")}</span>
                  <span className="text-amber-400">pending</span>
                </div>
              ))
            ) : (
              <div className="text-xs font-mono text-green-400">No pending analysis jobs</div>
            )}
          </div>
        </div>

        <div className="terminal-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Zap className="w-4 h-4 text-blue-primary" />
              Trading Snapshot
            </div>
            {snapshotLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted" />}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <div className="text-muted">Win Rate</div>
              <div className="text-base font-semibold text-foreground">{overallWinRate}</div>
            </div>
            <div>
              <div className="text-muted">Total Trades</div>
              <div className="text-base font-semibold text-foreground">{totalTrades}</div>
            </div>
            <div className="col-span-2">
              <div className="text-muted">Total Volume</div>
              <div className="text-base font-semibold text-foreground">{volume24h}</div>
            </div>
          </div>
          {snapshot?.refreshed_at && (
            <div className="mt-3 text-[10px] font-mono text-muted/50">
              Updated {new Date(snapshot.refreshed_at).toLocaleString()}
            </div>
          )}
        </div>

        <div className="terminal-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Users className="w-4 h-4 text-blue-primary" />
            Top Copied Traders
          </div>
          <div className="space-y-2">
            {topTraders.slice(0, 4).map((trader) => (
              <div key={trader.id} className="flex items-center justify-between text-xs">
                <span className="font-medium truncate pr-2">{trader.name}</span>
                <span className="font-mono text-green-400">{trader.winRate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
