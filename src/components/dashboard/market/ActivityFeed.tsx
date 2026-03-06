"use client";

import { Trade, formatRelativeTime } from "@/lib/api";
import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";

interface ActivityFeedProps {
  trades: Trade[];
  isLoading?: boolean;
}

type FilterSide = "all" | "yes" | "no";

export function ActivityFeed({ trades, isLoading }: ActivityFeedProps) {
  const [filter, setFilter] = useState<FilterSide>("all");

  const safeTrades = Array.isArray(trades) ? trades : [];
  const filteredTrades = safeTrades.filter((t) => {
    if (filter === "all") return true;
    return t.taker_side === filter;
  });

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4">
        {(["all", "yes", "no"] as FilterSide[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all capitalize ${
              filter === f
                ? "bg-surface-hover text-foreground border border-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Trade list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-border border-t-blue-primary rounded-full animate-spin" />
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="text-center py-8 text-muted text-sm font-mono">
          No trades found.
        </div>
      ) : (
        <div className="space-y-0.5">
          {filteredTrades.map((trade, i) => (
            <TradeRow key={trade.trade_id ?? i} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}

function TradeRow({ trade }: { trade: Trade }) {
  const isYes = trade.taker_side === "yes";
  const hashId = trade.trade_id ?? "";
  const truncated =
    hashId.length > 10
      ? `0x${hashId.slice(0, 4)}…${hashId.slice(-4)}`
      : hashId || "—";

  return (
    <div className="flex items-center gap-3 py-3 px-1 border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors rounded-lg">
      {/* Icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isYes ? "bg-emerald-500/20" : "bg-red-500/20"
        }`}
      >
        {isYes ? (
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-400" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-mono text-muted text-xs">{truncated}</span>
          <span className="text-foreground">bought</span>
          <span className={`font-semibold ${isYes ? "text-emerald-400" : "text-red-400"}`}>
            {trade.count} {isYes ? "Yes" : "No"}
          </span>
        </div>
        <div className="text-[10px] font-mono text-muted mt-0.5">
          at {isYes ? trade.yes_price : trade.no_price}¢ • ${((trade.count * (isYes ? trade.yes_price : trade.no_price)) / 100).toFixed(2)}
        </div>
      </div>

      {/* Time + link */}
      <div className="text-right shrink-0 flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted">
          {formatRelativeTime(trade.created_time)}
        </span>
        <ExternalLink className="w-3 h-3 text-muted/50" />
      </div>
    </div>
  );
}
