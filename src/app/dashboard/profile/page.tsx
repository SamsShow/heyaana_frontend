"use client";

import useSWR from "swr";
import { useState } from "react";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { UserBadge } from "@/components/dashboard/WalletConnect";
import { useAuth } from "@/lib/useAuth";
import { proxyFetcher, Portfolio, Position, closePosition, exportPrivateKey } from "@/lib/api";
import Link from "next/link";
import { TrendingUp, TrendingDown, Wallet, BarChart3, Loader2, X, AlertCircle, CheckCircle2, ExternalLink, KeyRound, ShieldAlert, Copy, Eye, EyeOff } from "lucide-react";

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

  // Private key export flow: null → 'warning' → 'confirmed' → 'revealed'
  const [pkStep, setPkStep] = useState<null | 'warning' | 'loading' | 'revealed'>(null);
  const [pkValue, setPkValue] = useState<string | null>(null);
  const [pkVisible, setPkVisible] = useState(false);
  const [pkError, setPkError] = useState<string | null>(null);
  const [pkCopied, setPkCopied] = useState(false);
  const [pkConfirmed, setPkConfirmed] = useState(false);

  async function handleExportKey() {
    setPkStep('loading');
    setPkError(null);
    try {
      const key = await exportPrivateKey();
      setPkValue(key);
      setPkStep('revealed');
    } catch (err) {
      setPkError(err instanceof Error ? err.message : 'Failed to export key');
      setPkStep('warning');
    }
  }

  function handleCopyKey() {
    if (!pkValue) return;
    navigator.clipboard.writeText(pkValue);
    setPkCopied(true);
    setTimeout(() => setPkCopied(false), 2000);
  }

  function handleClosePkModal() {
    setPkStep(null);
    setPkValue(null);
    setPkVisible(false);
    setPkError(null);
    setPkConfirmed(false);
  }

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

  type TokenRow = { symbol: string; amount: string; usd: string; usdValue: number };

  // Parse the on_chain_summary text into structured token rows
  const balanceParsed = (() => {
    const raw =
      (portfolio?.on_chain_summary as string | undefined) ??
      (balanceData?.on_chain_summary as string | undefined) ??
      (balanceData?.summary as string | undefined);

    if (!raw) return null;

    const tokens: TokenRow[] = [];
    let total = "";

    // Match lines like: "• POL (native): 63.8338 ($6.29)" or "• USDC.e: 10.4842 ($10.48)"
    const lineRe = /[•\-]\s+([A-Z][A-Z0-9._e]*(?:\s*\([^)]+\))?)\s*:\s*([\d.,]+)\s+\(\$([\d.,]+)\)/gi;
    let m: RegExpExecArray | null;
    while ((m = lineRe.exec(raw)) !== null) {
      const usdValue = parseFloat(m[3].replace(",", ""));
      if (usdValue === 0) continue; // skip zero-value tokens
      // Clean symbol: strip parenthetical like "(native)"
      const symbol = m[1].replace(/\s*\([^)]+\)/, "").trim();
      tokens.push({ symbol, amount: m[2], usd: `$${m[3]}`, usdValue });
    }

    // Match total line: "Total: $16.78 USD"
    const totalRe = /total[:\s]+\$([\d.,]+)/i;
    const tm = raw.match(totalRe);
    if (tm) total = `$${tm[1]}`;

    return tokens.length > 0 ? { tokens, total } : null;
  })();

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
      {/* Private Key Modal */}
      {pkStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClosePkModal} />
          <div className="relative w-full max-w-md mx-4 bg-surface border border-border rounded-2xl shadow-2xl z-10 overflow-hidden">

            {/* Warning / Confirmation step */}
            {(pkStep === 'warning' || pkStep === 'loading') && (
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Export Private Key</h3>
                    <p className="text-xs text-muted mt-0.5">This action reveals your wallet&apos;s private key</p>
                  </div>
                  <button onClick={handleClosePkModal} className="ml-auto text-muted hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Security Warning</p>
                  <ul className="text-xs text-foreground/80 space-y-1.5 list-none">
                    <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span>Never share your private key with anyone, including support staff.</li>
                    <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span>Anyone with this key has full control of your wallet and funds.</li>
                    <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span>Store it offline in a secure location — never in a message or cloud storage.</li>
                    <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span>Heyaana will never ask for your private key.</li>
                  </ul>
                </div>

                {pkError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {pkError}
                  </div>
                )}

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pkConfirmed}
                    onChange={(e) => setPkConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-amber-400"
                  />
                  <span className="text-xs text-foreground/80">I understand the risks and take full responsibility for securing my private key.</span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={handleClosePkModal}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-border text-muted hover:text-foreground hover:border-foreground/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExportKey}
                    disabled={!pkConfirmed || pkStep === 'loading'}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {pkStep === 'loading' ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting…</>
                    ) : (
                      <><KeyRound className="w-3.5 h-3.5" /> Reveal Key</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Revealed step */}
            {pkStep === 'revealed' && pkValue && (
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Private Key</h3>
                    <p className="text-xs text-muted mt-0.5">Store this securely and never share it</p>
                  </div>
                  <button onClick={handleClosePkModal} className="ml-auto text-muted hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                  <p className="text-[10px] font-mono text-red-400 uppercase tracking-wide mb-2">Do not share — full wallet access</p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 font-mono text-xs break-all text-foreground">
                      {pkVisible ? pkValue : '•'.repeat(Math.min(pkValue.length, 64))}
                    </p>
                    <button
                      onClick={() => setPkVisible((v) => !v)}
                      className="shrink-0 text-muted hover:text-foreground transition-colors"
                      title={pkVisible ? 'Hide' : 'Show'}
                    >
                      {pkVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopyKey}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-surface-hover transition-all"
                  >
                    {pkCopied ? (
                      <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy Key</>
                    )}
                  </button>
                  <button
                    onClick={handleClosePkModal}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-surface border border-border hover:bg-surface-hover transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

          {/* Export Private Key */}
          {isAuthenticated && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface/30">
              <div>
                <p className="text-sm font-semibold">Private Key</p>
                <p className="text-xs text-muted mt-0.5">Export your wallet&apos;s private key for backup or migration.</p>
              </div>
              <button
                onClick={() => setPkStep('warning')}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          )}

          {/* Balance */}
          <div className="rounded-xl border border-border bg-surface/30 overflow-hidden">
            <div className="px-4 pt-4 pb-2 text-[10px] font-mono text-muted uppercase tracking-wider">Wallet Balance</div>
            {balanceLoading && !balanceParsed ? (
              <div className="flex items-center gap-2 text-muted px-4 pb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono">Loading balance…</span>
              </div>
            ) : balanceParsed ? (
              <div>
                <div className="divide-y divide-border">
                  {balanceParsed.tokens.map((t) => (
                    <div key={t.symbol} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-bold font-mono text-blue-primary shrink-0">
                          {t.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{t.symbol}</p>
                          <p className="text-[10px] font-mono text-muted">{t.amount}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold font-mono">{t.usd}</p>
                    </div>
                  ))}
                </div>
                {balanceParsed.total && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface/40">
                    <span className="text-xs font-mono text-muted uppercase tracking-wide">Total</span>
                    <span className="text-base font-bold font-mono">{balanceParsed.total}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs font-mono text-muted px-4 pb-4">No balance data.</p>
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
