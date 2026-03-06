"use client";

import useSWR from "swr";
import { proxyFetcher, Portfolio, Position } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PositionCardProps {
  ticker: string;
  marketTitle: string;
}

export function PositionCard({ ticker, marketTitle }: PositionCardProps) {
  const { isAuthenticated } = useAuth();

  const { data: portfolio } = useSWR<Portfolio>(
    isAuthenticated ? "/api/proxy/portfolio" : null,
    proxyFetcher,
    { revalidateOnFocus: false },
  );

  // Try to find position for this market in the portfolio
  const position: Position | null = (() => {
    if (!portfolio?.positions) return null;
    return (
      portfolio.positions.find(
        (p) => p.ticker === ticker || p.title?.toLowerCase() === marketTitle.toLowerCase(),
      ) ?? null
    );
  })();

  if (!isAuthenticated || !position) return null;

  const pnl = position.pnl ?? 0;
  const pnlPct = position.pnl_pct ?? 0;
  const isPositive = pnl >= 0;

  return (
    <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold truncate flex-1 mr-2">
          {marketTitle.length > 40 ? marketTitle.slice(0, 40) + "…" : marketTitle}
        </h3>
      </div>

      <div className="text-xs text-muted font-mono mb-1">Your Position</div>

      {/* Side badge */}
      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-1 rounded font-semibold ${position.side === "Yes"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
            }`}
        >
          {position.side.toUpperCase()}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Shares</div>
          <div className="text-sm font-mono font-bold">{(position.shares ?? 0).toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Avg Price</div>
          <div className="text-sm font-mono font-bold">{(position.avg_price ?? 0).toFixed(0)}¢</div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Current Value</div>
          <div className="text-sm font-mono font-bold">
            ${(position.current_value ?? (position.shares ?? 0) * ((position.avg_price ?? 0) / 100)).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-muted uppercase tracking-wider">P&L</div>
          <div className={`text-sm font-mono font-bold flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-red-400"
            }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? "+" : ""}${pnl.toFixed(2)}
            <span className="text-[10px]">
              ({isPositive ? "+" : ""}{(pnlPct ?? 0).toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Close position button */}
      <button
        className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all border ${position.side === "Yes"
            ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            : "border-red-500/30 text-red-400 hover:bg-red-500/10"
          }`}
      >
        Close {position.side} Position
      </button>
    </div>
  );
}
