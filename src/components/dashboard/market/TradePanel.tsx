"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Market, postTrade } from "@/lib/api";
import { Loader2, ExternalLink, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/dashboard/Toast";

interface TradePanelProps {
  market: Market;
  conditionId?: string;
  marketId?: number;
  onTradeSuccess?: () => void;
}

export function TradePanel({ market, conditionId, marketId, onTradeSuccess }: TradePanelProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [side, setSide] = useState<"Yes" | "No">("Yes");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

    if (e.key === "Escape") {
      if (amountInputRef.current) {
        amountInputRef.current.blur();
      }
      setAmount("");
      return;
    }

    if (isInput) return;

    if (e.key === "b" || e.key === "B") {
      e.preventDefault();
      setSide("Yes");
      setTimeout(() => amountInputRef.current?.focus(), 0);
      return;
    }

    if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      setSide("No");
      setTimeout(() => amountInputRef.current?.focus(), 0);
      return;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const yesPrice = market.yes_bid ?? market.last_price ?? 50;
  const noPrice = market.no_bid ?? (market.last_price ? 100 - market.last_price : 50);

  async function handleTrade() {
    if (!amount || Number(amount) <= 0) return;
    if (!conditionId) {
      toast("Market condition ID not available for trading", "error");
      return;
    }

    setLoading(true);
    setTxHash(null);
    try {
      const data = await postTrade({
        condition_id: conditionId,
        side,
        amount: Number(amount),
        order_side: "BUY",
        auto_prepare: true,
      }) as Record<string, unknown>;
      const hash = (data?.tx_hash ?? data?.transaction_hash ?? data?.txHash) as string | undefined;
      toast(`Successfully bought ${side} for $${amount}`, "success");
      setTxHash(hash ?? null);
      setAmount("");
      onTradeSuccess?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Trade failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-card p-4 space-y-4">
      <div className="section-header mb-0">
        <TrendingUp className="w-4 h-4 text-blue-primary" />
        <h3 className="text-sm font-semibold">Buy Shares</h3>
      </div>

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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">$</span>
          <input
            ref={amountInputRef}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pr-4 py-2.5 text-sm font-mono dark-input"
            style={{ paddingLeft: "2rem" }}
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
            className={`flex-1 py-2 text-xs font-mono rounded-lg border transition-all ${
              amount === String(v)
                ? "border-blue-primary/40 bg-blue-primary/10 text-blue-primary"
                : "border-border hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
          >
            ${v}
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleTrade}
        disabled={loading || !amount || Number(amount) <= 0 || !isAuthenticated}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          side === "Yes"
            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
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

      {/* Keyboard shortcut hints */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-muted/50 font-mono">
        <span><kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9px]">B</kbd> Buy Yes</span>
        <span><kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9px]">S</kbd> Sell No</span>
        <span><kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9px]">Esc</kbd> Clear</span>
      </div>

      {/* Tx hash link */}
      {txHash && (
        <a
          href={`https://polygonscan.com/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-mono text-emerald-400/80 hover:text-emerald-400 transition-colors truncate"
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">View on Polygonscan</span>
        </a>
      )}
    </div>
  );
}
