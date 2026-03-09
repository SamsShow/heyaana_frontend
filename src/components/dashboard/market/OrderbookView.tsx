"use client";

import { Market } from "@/lib/api";

interface OrderbookViewProps {
  market: Market;
}

export function OrderbookView({ market }: OrderbookViewProps) {
  const yesBid = market.yes_bid ?? 0;
  const yesAsk = market.yes_ask ?? 0;
  const noBid = market.no_bid ?? 0;
  const noAsk = market.no_ask ?? 0;
  const spread = yesAsk > 0 && yesBid > 0 ? yesAsk - yesBid : 0;

  return (
    <div className="space-y-4">
      {/* Spread info */}
      <div className="flex items-center justify-between text-xs font-mono text-muted px-1">
        <span>Bid / Ask Spread</span>
        <span>{spread > 0 ? `${spread}¢` : "—"}</span>
      </div>

      {/* YES orderbook */}
      <div className="inner-card overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-emerald-500/5">
          <span className="text-xs font-semibold text-emerald-400">YES</span>
        </div>
        <div className="divide-y divide-border/50">
          <OrderRow label="Best Bid" value={yesBid} color="emerald" fillPct={yesBid} />
          <OrderRow label="Best Ask" value={yesAsk} color="emerald" fillPct={yesAsk} isAsk />
        </div>
      </div>

      {/* NO orderbook */}
      <div className="inner-card overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-red-500/5">
          <span className="text-xs font-semibold text-red-400">NO</span>
        </div>
        <div className="divide-y divide-border/50">
          <OrderRow label="Best Bid" value={noBid} color="red" fillPct={noBid} />
          <OrderRow label="Best Ask" value={noAsk} color="red" fillPct={noAsk} isAsk />
        </div>
      </div>

      {/* Market stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-3 inner-card">
          <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Volume</div>
          <div className="text-sm font-mono font-bold">{market.volume.toLocaleString()}</div>
        </div>
        <div className="p-3 inner-card">
          <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Open Interest</div>
          <div className="text-sm font-mono font-bold">{market.open_interest.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

function OrderRow({
  label,
  value,
  color,
  fillPct,
  isAsk,
}: {
  label: string;
  value: number;
  color: "emerald" | "red";
  fillPct: number;
  isAsk?: boolean;
}) {
  const bgColor = color === "emerald" ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)";

  return (
    <div className="relative px-3 py-2.5 flex items-center justify-between">
      {/* Fill bar */}
      <div
        className="absolute inset-y-0 left-0 pointer-events-none"
        style={{
          width: `${Math.min(fillPct, 100)}%`,
          backgroundColor: bgColor,
        }}
      />
      <span className="text-xs font-mono text-muted relative z-10">{label}</span>
      <span
        className={`text-sm font-mono font-bold relative z-10 ${
          isAsk ? "text-muted" : color === "emerald" ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {value > 0 ? `${value}¢` : "—"}
      </span>
    </div>
  );
}
