"use client";

import { useState } from "react";
import { Market, postTrade } from "@/lib/api";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/useAuth";

interface TradePanelProps {
  market: Market;
  conditionId?: string;
  marketId?: number;
  onTradeSuccess?: () => void;
}

export function TradePanel({ market, conditionId, marketId, onTradeSuccess }: TradePanelProps) {
  const { isAuthenticated } = useAuth();
  const [side, setSide] = useState<"Yes" | "No">("Yes");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const yesPrice = market.yes_bid ?? market.last_price ?? 50;
  const noPrice = market.no_bid ?? (market.last_price ? 100 - market.last_price : 50);

  async function handleTrade() {
    if (!amount || Number(amount) <= 0) return;
    if (!conditionId) {
      setResult({ ok: false, message: "Market condition ID not available for trading" });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      await postTrade({
        condition_id: conditionId,
        side,
        amount: Number(amount),
        order_side: "BUY",
        auto_prepare: true,
      });
      setResult({ ok: true, message: `Successfully bought ${side} for $${amount}` });
      setAmount("");
      onTradeSuccess?.();
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Trade failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-4">
      <h3 className="text-sm font-semibold">Buy shares</h3>

      {/* Side selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide("Yes")}
          className={`py-3 rounded-lg text-sm font-semibold transition-all ${
            side === "Yes"
              ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40"
              : "bg-surface border border-border text-muted hover:text-foreground hover:border-emerald-500/20"
          }`}
        >
          Yes {yesPrice}¢
        </button>
        <button
          onClick={() => setSide("No")}
          className={`py-3 rounded-lg text-sm font-semibold transition-all ${
            side === "No"
              ? "bg-red-500/20 text-red-400 border-2 border-red-500/40"
              : "bg-surface border border-border text-muted hover:text-foreground hover:border-red-500/20"
          }`}
        >
          No {noPrice}¢
        </button>
      </div>

      {/* Amount input */}
      <div>
        <label className="text-xs text-muted font-mono mb-1.5 block">Amount (USD)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-7 pr-4 py-2.5 text-sm font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-blue-primary/50 focus:ring-1 focus:ring-blue-primary/20 placeholder:text-muted/50 transition-all"
          />
        </div>
        {amount && Number(amount) > 0 && (
          <div className="mt-1.5 text-xs text-muted font-mono">
            ≈ {(Number(amount) / ((side === "Yes" ? yesPrice : noPrice) / 100)).toFixed(1)} shares
          </div>
        )}
      </div>

      {/* Quick amounts */}
      <div className="flex gap-2">
        {[1, 5, 10, 25].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(String(v))}
            className="flex-1 py-1.5 text-xs font-mono rounded-md border border-border hover:bg-surface-hover transition-all text-muted hover:text-foreground"
          >
            ${v}
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleTrade}
        disabled={loading || !amount || Number(amount) <= 0 || !isAuthenticated}
        className={`w-full py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          side === "Yes"
            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Placing trade…
          </span>
        ) : !isAuthenticated ? (
          "Login to trade"
        ) : (
          `Buy ${side}`
        )}
      </button>

      {/* Result feedback */}
      {result && (
        <div
          className={`flex items-start gap-2 p-3 rounded-lg text-xs font-mono ${
            result.ok
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {result.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}
