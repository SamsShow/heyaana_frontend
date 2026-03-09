"use client";

import { Trade, formatRelativeTime } from "@/lib/api";
import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";

interface ActivityFeedProps {
  trades: Trade[];
  isLoading?: boolean;
}

type FilterSide = "all" | "yes" | "no";

// Normalise a trade to a consistent shape regardless of which API returned it
function normalizeTrade(t: Trade) {
  const side = (t.outcome ?? t.taker_side ?? t.side ?? "").toLowerCase();
  const isYes = side === "yes" || side === "buy";
  const size = t.size ?? t.count ?? 0;
  const price = t.price ?? (isYes ? t.yes_price : t.no_price) ?? 0;
  const priceInCents = price > 1 ? price : price * 100; // API returns 0-1, display in ¢
  const hash = t.transactionHash ?? t.trade_id ?? t.proxyWallet ?? "";
  const truncatedHash = hash.length > 10
    ? `${hash.slice(0, 6)}…${hash.slice(-4)}`
    : hash || "—";
  const traderName = t.name && t.name.trim() ? t.name.trim() : truncatedHash;
  const rawTime = t.timestamp
    ? new Date(t.timestamp * 1000).toISOString()
    : t.created_time;
  return { isYes, size, price: priceInCents, total: (size * priceInCents) / 100, hash, truncatedHash, traderName, rawTime, side };
}

export function ActivityFeed({ trades, isLoading }: ActivityFeedProps) {
  const [filter, setFilter] = useState<FilterSide>("all");

  const safeTrades = Array.isArray(trades) ? trades : [];
  const filteredTrades = safeTrades.filter((t) => {
    if (filter === "all") return true;
    const side = (t.outcome ?? t.taker_side ?? t.side ?? "").toLowerCase();
    if (filter === "yes") return side === "yes" || side === "buy";
    if (filter === "no") return side === "no" || side === "sell";
    return true;
  });

  return (
    <div>
      <div className="pill-tabs mb-4">
        {(["all", "yes", "no"] as FilterSide[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pill-tab capitalize ${filter === f ? "active" : ""}`}
          >
            {f === "all" ? "All" : f === "yes" ? "Yes / Buy" : "No / Sell"}
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
            <TradeRow key={(trade.transactionHash ?? trade.trade_id ?? i)} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}

function TradeRow({ trade }: { trade: Trade }) {
  const { isYes, size, price, total, traderName, rawTime, truncatedHash } = normalizeTrade(trade);
  const txHash = trade.transactionHash ?? trade.trade_id;
  const polymarketUrl = txHash
    ? `https://polygonscan.com/tx/${txHash}`
    : null;

  return (
    <div className="flex items-center gap-3 py-3 px-1 border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors rounded-lg">
      {/* Icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isYes ? "bg-emerald-500/20" : "bg-red-500/20"
      }`}>
        {isYes
          ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          : <ArrowDownRight className="w-4 h-4 text-red-400" />}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm flex-wrap">
          <span className="font-mono text-muted text-xs truncate max-w-[120px]">{traderName}</span>
          <span className="text-foreground">bought</span>
          <span className={`font-semibold ${isYes ? "text-emerald-400" : "text-red-400"}`}>
            {size.toFixed(2)} {isYes ? "Yes" : "No"}
          </span>
        </div>
        <div className="text-[10px] font-mono text-muted mt-0.5">
          at {price.toFixed(1)}¢ • ${total.toFixed(2)}
        </div>
      </div>

      {/* Time + link */}
      <div className="text-right shrink-0 flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted">
          {rawTime ? formatRelativeTime(rawTime) : "—"}
        </span>
        {polymarketUrl ? (
          <a href={polymarketUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3 text-muted/50 hover:text-muted transition-colors" />
          </a>
        ) : (
          <ExternalLink className="w-3 h-3 text-muted/20" />
        )}
      </div>
    </div>
  );
}
