"use client";

import useSWR from "swr";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { UserBadge } from "@/components/dashboard/WalletConnect";
import { useAuth } from "@/lib/useAuth";
import { proxyFetcher, Portfolio, Position, formatVolume } from "@/lib/api";
import {
  WalletConnectKitButton,
  WalletConnectKitProvider,
  hasWalletConnectProjectId,
} from "@/lib/walletconnect-kit";
import { TrendingUp, TrendingDown, Wallet, BarChart3, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  const { data: portfolio, isLoading: portfolioLoading } = useSWR<Portfolio>(
    isAuthenticated ? "/api/proxy/me/portfolio" : null,
    proxyFetcher,
    { revalidateOnFocus: false },
  );

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
                <span className="text-muted">Name:</span>{" "}
                <span>{isLoading ? "Loading…" : (user?.first_name ?? "—")}</span>
              </div>
              <div>
                <span className="text-muted">Username:</span>{" "}
                <span>{isLoading ? "Loading…" : (user?.username ? `@${user.username}` : "—")}</span>
              </div>
              <div>
                <span className="text-muted">Telegram ID:</span>{" "}
                <span>{isLoading ? "Loading…" : (user?.telegram_id ?? "—")}</span>
              </div>
              <div>
                <span className="text-muted">Wallet:</span>{" "}
                <span className="break-all">{isLoading ? "Loading…" : (user?.wallet_address ?? "Not connected")}</span>
              </div>
              <div className="pt-3 space-y-2">
                <div className="text-xs text-muted">EVM wallet connection</div>
                <WalletConnectKitProvider>
                  <WalletConnectKitButton />
                </WalletConnectKitProvider>
                {!hasWalletConnectProjectId && (
                  <p className="text-[11px] text-yellow-500">
                    Set <code>NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code> to enable WalletConnect QR flows.
                  </p>
                )}
              </div>
            </div>

            <UserBadge />
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="max-w-3xl mx-auto border border-border rounded-xl bg-surface/20 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-primary" />
            <h2 className="text-xl font-bold">Portfolio</h2>
          </div>

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
              {/* Balance / summary */}
              {portfolio.balance !== undefined && (
                <div className="p-4 rounded-xl border border-border bg-surface/30">
                  <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Balance</div>
                  <div className="text-2xl font-bold font-mono">{formatVolume(portfolio.balance)}</div>
                </div>
              )}

              {/* Raw text summary if present */}
              {typeof portfolio.funds_summary === "string" && (
                <div className="p-4 rounded-xl border border-border bg-surface/30">
                  <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">On-chain Funds</div>
                  <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">{portfolio.funds_summary}</pre>
                </div>
              )}

              {/* Portfolio value / PnL if present */}
              {(portfolio.portfolio_value !== undefined || portfolio.total_pnl !== undefined) && (
                <div className="grid grid-cols-2 gap-3">
                  {portfolio.portfolio_value !== undefined && (
                    <div className="p-4 rounded-xl border border-border bg-surface/30">
                      <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Portfolio Value</div>
                      <div className="text-lg font-bold font-mono">
                        ${typeof portfolio.portfolio_value === "number" ? portfolio.portfolio_value.toFixed(2) : String(portfolio.portfolio_value ?? "")}
                      </div>
                    </div>
                  )}
                  {portfolio.total_pnl !== undefined && (
                    <div className="p-4 rounded-xl border border-border bg-surface/30">
                      <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Total PnL</div>
                      <div className={`text-lg font-bold font-mono flex items-center gap-1 ${Number(portfolio.total_pnl) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {Number(portfolio.total_pnl) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        ${typeof portfolio.total_pnl === "number" ? portfolio.total_pnl.toFixed(2) : String(portfolio.total_pnl ?? "")}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Open Positions */}
              {portfolio.positions && portfolio.positions.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-muted" />
                    <h3 className="text-sm font-semibold">Open Positions ({portfolio.positions.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {portfolio.positions.map((pos: Position, i: number) => {
                      const pnl = pos.pnl ?? 0;
                      const isPositive = pnl >= 0;
                      return (
                        <div key={i} className="p-4 rounded-xl border border-border bg-surface/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{pos.title ?? pos.ticker ?? `Position #${i + 1}`}</div>
                              <div className="text-[10px] font-mono text-muted mt-0.5">{pos.side} • {(pos.shares ?? 0).toFixed(2)} shares</div>
                            </div>
                            <div className={`text-right ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                              <div className="text-sm font-bold font-mono flex items-center gap-1 justify-end">
                                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                ${Math.abs(pnl).toFixed(2)}
                              </div>
                              {pos.pnl_pct !== undefined && (
                                <div className="text-[10px] font-mono">{isPositive ? "+" : ""}{(pos.pnl_pct ?? 0).toFixed(1)}%</div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-4 text-[10px] font-mono text-muted">
                            <span>Avg: ${(pos.avg_price ?? 0).toFixed(2)}</span>
                            {pos.current_price !== undefined && <span>Current: ${(pos.current_price ?? 0).toFixed(2)}</span>}
                            {pos.current_value !== undefined && <span>Value: ${(pos.current_value ?? 0).toFixed(2)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted font-mono py-4 text-center">No open positions.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardChrome>
  );
}
