"use client";

import useSWR from "swr";
import { useState } from "react";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { UserBadge } from "@/components/dashboard/WalletConnect";
import { useAuth } from "@/lib/useAuth";
import { proxyFetcher, Portfolio, Position, closePosition } from "@/lib/api";
import Link from "next/link";
import { TrendingUp, TrendingDown, Wallet, BarChart3, Loader2, X, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .trim();
}

function positionConditionId(pos: Position): string | undefined {
  return pos.condition_id ?? pos.conditionId;
}

function positionSide(pos: Position): string {
  return pos.outcome ?? pos.side ?? "—";
}

function positionSize(pos: Position): number {
  return pos.size ?? pos.shares ?? 0;
}

function positionPnlCash(pos: Position): number {
  return pos.pnl_cash ?? pos.pnl ?? 0;
}

function positionPnlPct(pos: Position): number | undefined {
  return pos.pnl_percent ?? pos.pnl_pct;
}

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closeResult, setCloseResult] = useState<{ ok: boolean; message: string } | null>(null);

  const { data: walletData } = useSWR<Record<string, string>>(
    isAuthenticated ? "/api/proxy/me/wallet/address" : null,
    proxyFetcher,
    { revalidateOnFocus: true },
  );

  const { data: balanceData, isLoading: balanceLoading } = useSWR<Record<string, unknown>>(
    isAuthenticated ? "/api/proxy/me/balance" : null,
    proxyFetcher,
    { revalidateOnFocus: true, refreshInterval: 30000 },
  );

  const { data: portfolio, isLoading: portfolioLoading, mutate: mutatePortfolio } = useSWR<Portfolio>(
    isAuthenticated ? "/api/proxy/me/portfolio" : null,
    proxyFetcher,
    { revalidateOnFocus: true, refreshInterval: 30000 },
  );

  const walletAddress =
    user?.wallet_address ??
    walletData?.address ??
    walletData?.wallet_address ??
    walletData?.eth_address ??
    null;

  // PnL from nested totals or top-level
  const portfolioValue = portfolio?.totals?.portfolio_value ?? portfolio?.portfolio_value;
  const totalPnl = portfolio?.totals?.total_pnl ?? portfolio?.total_pnl;

  // Balance text — API returns 'on_chain_summary'
  const rawBalance =
    (portfolio?.on_chain_summary as string | undefined) ??
    (balanceData?.on_chain_summary as string | undefined) ??
    (balanceData?.summary as string | undefined) ??
    (balanceData?.balance as string | undefined) ??
    (balanceData ? JSON.stringify(balanceData, null, 2) : null);
  const cleanBalance = rawBalance ? stripMarkdown(rawBalance) : null;

  const positions: Position[] = portfolio?.positions ?? [];

  async function handleClose(conditionId: string) {
    setClosingId(conditionId);
    setCloseResult(null);
    try {
      await closePosition(conditionId);
      setCloseResult({ ok: true, message: "Position closed successfully." });
      mutatePortfolio();
    } catch (err) {
      setCloseResult({ ok: false, message: err instanceof Error ? err.message : "Failed to close position" });
    } finally {
      setClosingId(null);
    }
  }

  return (
    <DashboardChrome title="Profile">
      <div className="p-3 md:p-4 space-y-6">
        {/* Account Info */}
        <div className="max-w-3xl mx-auto border border-border rounded-xl bg-surface/20 p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Account Profile</h2>
            <p className="text-sm text-muted mt-1">Live session profile from authenticated user endpoint.</p>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2 text-sm font-mono">
              <div>
                <span className="text-muted">Username:</span>{" "}
                <span>{isLoading ? "Loading…" : (user?.username ? `@${user.username}` : "—")}</span>
              </div>
              <div>
                <span className="text-muted">Wallet:</span>{" "}
                <span className="break-all">{isLoading ? "Loading…" : (walletAddress ?? "Not connected")}</span>
              </div>
            </div>
            <UserBadge />
          </div>

          {/* Balance */}
          <div className="p-4 rounded-xl border border-border bg-surface/30">
            <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-2">Wallet Balance</div>
            {balanceLoading && !cleanBalance ? (
              <div className="flex items-center gap-2 text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono">Loading balance…</span>
              </div>
            ) : cleanBalance ? (
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">{cleanBalance}</pre>
            ) : (
              <span className="text-xs font-mono text-muted">No balance data.</span>
            )}
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="max-w-3xl mx-auto border border-border rounded-xl bg-surface/20 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-primary" />
            <h2 className="text-xl font-bold">Portfolio</h2>
          </div>

          {closeResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-xs font-mono ${closeResult.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {closeResult.ok
                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                : <AlertCircle className="w-4 h-4 shrink-0" />}
              {closeResult.message}
            </div>
          )}

          {!isAuthenticated ? (
            <p className="text-sm text-muted font-mono">Log in to view your portfolio.</p>
          ) : portfolioLoading ? (
            <div className="flex items-center gap-2 text-muted py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-mono">Loading portfolio…</span>
            </div>
          ) : !portfolio ? (
            <p className="text-sm text-muted font-mono">Unable to load portfolio data.</p>
          ) : (
            <div className="space-y-4">
              {/* PnL summary */}
              {(portfolioValue !== undefined || totalPnl !== undefined) && (
                <div className="grid grid-cols-2 gap-3">
                  {portfolioValue !== undefined && (
                    <div className="p-4 rounded-xl border border-border bg-surface/30">
                      <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Portfolio Value</div>
                      <div className="text-lg font-bold font-mono">${Number(portfolioValue).toFixed(2)}</div>
                    </div>
                  )}
                  {totalPnl !== undefined && (
                    <div className="p-4 rounded-xl border border-border bg-surface/30">
                      <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Total PnL</div>
                      <div className={`text-lg font-bold font-mono flex items-center gap-1 ${Number(totalPnl) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {Number(totalPnl) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Number(totalPnl) >= 0 ? "+" : ""}${Number(totalPnl).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Open Positions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-muted" />
                  <h3 className="text-sm font-semibold">Open Positions ({positions.length})</h3>
                </div>

                {positions.length > 0 ? (
                  <div className="space-y-2">
                    {positions.map((pos, i) => {
                      const condId = positionConditionId(pos);
                      const pnlCash = positionPnlCash(pos);
                      const pnlPct = positionPnlPct(pos);
                      const isPositive = pnlCash >= 0;
                      const isClosing = closingId === condId;

                      return (
                        <div key={condId ?? i} className="p-4 rounded-xl border border-border bg-surface/30">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            {/* Left: title + meta */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {pos.icon && (
                                <img src={pos.icon} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <div className="text-sm font-semibold truncate">{pos.title ?? pos.ticker ?? `Position #${i + 1}`}</div>
                                  {condId && (
                                    <Link
                                      href={`/dashboard/market?conditionId=${encodeURIComponent(condId)}`}
                                      className="shrink-0 text-muted hover:text-blue-primary transition-colors"
                                      title="Open market"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                  )}
                                </div>
                                <div className="text-[10px] font-mono text-muted mt-0.5">
                                  <span className={`font-semibold ${positionSide(pos) === "Yes" ? "text-emerald-400" : "text-red-400"}`}>
                                    {positionSide(pos)}
                                  </span>
                                  {" • "}{positionSize(pos).toFixed(4)} shares
                                </div>
                              </div>
                            </div>

                            {/* Right: PnL + close button */}
                            <div className="flex items-center gap-3 shrink-0">
                              <div className={`text-right ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                                <div className="text-sm font-bold font-mono flex items-center gap-1 justify-end">
                                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {isPositive ? "+" : ""}${pnlCash.toFixed(4)}
                                </div>
                                {pnlPct !== undefined && (
                                  <div className="text-[10px] font-mono">
                                    {isPositive ? "+" : ""}{pnlPct.toFixed(2)}%
                                  </div>
                                )}
                              </div>

                              {condId && (
                                <button
                                  onClick={() => handleClose(condId)}
                                  disabled={isClosing}
                                  title="Close position"
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                                >
                                  {isClosing ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                  Close
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Price details */}
                          <div className="flex gap-4 text-[10px] font-mono text-muted">
                            {pos.avg_price !== undefined && <span>Avg: ${pos.avg_price.toFixed(4)}</span>}
                            {pos.current_price !== undefined && <span>Current: ${pos.current_price.toFixed(4)}</span>}
                            {pos.current_value !== undefined && <span>Value: ${pos.current_value.toFixed(4)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted font-mono py-4 text-center">No open positions.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardChrome>
  );
}
