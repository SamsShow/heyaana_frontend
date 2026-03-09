"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { UserBadge } from "@/components/dashboard/WalletConnect";
import { useAuth } from "@/lib/useAuth";
import { proxyFetcher, Portfolio, Position, closePosition, exportPrivateKey, unfollowTrader, approveTrading } from "@/lib/api";
import Link from "next/link";
import { TrendingUp, TrendingDown, Wallet, BarChart3, Loader2, X, AlertCircle, CheckCircle2, ExternalLink, KeyRound, ShieldAlert, Copy, Eye, EyeOff, Users, UserMinus, ShieldCheck } from "lucide-react";

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

const SYNC_MSGS = ["beep boop...", "syncing...", "fetching...", "refreshing...", "bzzzt...", "loading..."];

function PortfolioSyncLabel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % SYNC_MSGS.length), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="text-[10px] font-mono text-muted/60 animate-pulse">{SYNC_MSGS[i]}</span>
  );
}

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closeResult, setCloseResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [optimisticClosed, setOptimisticClosed] = useState<Set<string>>(new Set());
  const [syncingPortfolio, setSyncingPortfolio] = useState(false);
  const [syncFrame, setSyncFrame] = useState(0);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveResult, setApproveResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [approveFrame, setApproveFrame] = useState(0);

  // Private key export flow: null → 'warning' → 'confirmed' → 'revealed'
  const [pkStep, setPkStep] = useState<null | 'warning' | 'loading' | 'revealed'>(null);
  const [pkValue, setPkValue] = useState<string | null>(null);
  const [pkVisible, setPkVisible] = useState(false);
  const [pkError, setPkError] = useState<string | null>(null);
  const [pkCopied, setPkCopied] = useState(false);
  const [pkConfirmed, setPkConfirmed] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);

  function handleCopyWallet() {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
  }

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

  async function handleApprove() {
    setApproveLoading(true);
    setApproveResult(null);
    setApproveFrame(0);
    const interval = setInterval(() => setApproveFrame((f) => f + 1), 400);
    try {
      await approveTrading();
      setApproveResult({ ok: true, message: "All 6 transactions approved! You're ready to trade." });
      mutateStatus();
      mutatePortfolio();
      mutateBalance();
    } catch (err) {
      setApproveResult({ ok: false, message: err instanceof Error ? err.message : "Approval failed" });
    } finally {
      clearInterval(interval);
      setApproveLoading(false);
    }
  }

  const { data: statusData, isLoading: statusLoading, mutate: mutateStatus } = useSWR<{ is_copytrading?: boolean; polymarket_approved?: boolean }>(
    isAuthenticated ? "/api/proxy/me/status" : null,
    proxyFetcher,
    { revalidateOnFocus: true },
  );

  const { data: walletData } = useSWR<Record<string, string>>(
    isAuthenticated ? "/api/proxy/me/wallet/address" : null,
    proxyFetcher,
    { revalidateOnFocus: true },
  );

  const { data: balanceData, isLoading: balanceLoading, mutate: mutateBalance } = useSWR<Record<string, unknown>>(
    isAuthenticated ? "/api/proxy/me/balance" : null,
    proxyFetcher,
    { revalidateOnFocus: true, refreshInterval: 3000, dedupingInterval: 0 },
  );

  const { data: portfolio, isLoading: portfolioLoading, isValidating: portfolioValidating, mutate: mutatePortfolio } = useSWR<Portfolio>(
    isAuthenticated ? "/api/proxy/me/portfolio" : null,
    proxyFetcher,
    { revalidateOnFocus: true, refreshInterval: 3000, dedupingInterval: 0 },
  );

  type FollowingEntry = { username?: string; leader_username?: string; first_name?: string; [key: string]: unknown };
  const { data: followingRaw, isLoading: followingLoading, mutate: mutateFollowing } = useSWR<unknown>(
    isAuthenticated ? "/api/proxy/copy-trading/following" : null,
    proxyFetcher,
    { revalidateOnFocus: true },
  );
  const followingList: FollowingEntry[] = (() => {
    if (Array.isArray(followingRaw)) return followingRaw as FollowingEntry[];
    const w = followingRaw as { following?: unknown[]; data?: unknown[] } | null;
    if (Array.isArray(w?.following)) return w!.following as FollowingEntry[];
    if (Array.isArray(w?.data)) return w!.data as FollowingEntry[];
    return [];
  })();

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

  const balanceParsed = (() => {
    // Try structured tokens from balance endpoint or portfolio.balance
    type ApiToken = { symbol: string; balance?: number; amount?: string | number; usd_value?: number };
    const structuredTokens: ApiToken[] | undefined =
      (balanceData as { tokens?: ApiToken[] })?.tokens ??
      (portfolio?.balance as { tokens?: ApiToken[] } | undefined)?.tokens;

    if (structuredTokens && structuredTokens.length > 0) {
      const tokens: TokenRow[] = structuredTokens
        .map((t) => {
          const amt = typeof t.balance === "number" ? t.balance : parseFloat(String(t.amount ?? "0"));
          const usdValue = t.usd_value ?? 0;
          if (amt === 0) return null;
          const symbol = t.symbol.replace(/\s*\([^)]+\)/, "").trim();
          return { symbol, amount: amt.toFixed(4), usd: `$${usdValue.toFixed(2)}`, usdValue };
        })
        .filter((t): t is TokenRow => t !== null);
      const totalUsd =
        (balanceData as { total_usd?: number })?.total_usd ??
        (portfolio?.balance as { total_usd?: number } | undefined)?.total_usd;
      const total = totalUsd !== undefined ? `$${totalUsd.toFixed(2)}` : "";
      if (tokens.length > 0) return { tokens, total };
    }

    // Fall back to text parsing of on_chain_summary
    const raw =
      (portfolio?.on_chain_summary as string | undefined) ??
      (balanceData?.on_chain_summary as string | undefined) ??
      (balanceData?.summary as string | undefined);

    if (!raw) return null;

    const tokens: TokenRow[] = [];
    let total = "";

    const lineRe = /[•\-]\s+([A-Z][A-Z0-9._e]*(?:\s*\([^)]+\))?)\s*:\s*([\d.,]+)\s+\(\$([\d.,]+)\)/gi;
    let m: RegExpExecArray | null;
    while ((m = lineRe.exec(raw)) !== null) {
      const usdValue = parseFloat(m[3].replace(",", ""));
      if (usdValue === 0) continue;
      const symbol = m[1].replace(/\s*\([^)]+\)/, "").trim();
      tokens.push({ symbol, amount: m[2], usd: `$${m[3]}`, usdValue });
    }

    const totalRe = /total[:\s]+\$([\d.,]+)/i;
    const tm = raw.match(totalRe);
    if (tm) total = `$${tm[1]}`;

    return tokens.length > 0 ? { tokens, total } : null;
  })();

  const positions: Position[] = (portfolio?.positions ?? []).filter(
    (p) => !optimisticClosed.has(positionConditionId(p) ?? "")
  );

  async function handleClose(conditionId: string, size: number) {
    setClosingId(conditionId);
    setCloseResult(null);
    // Optimistically remove the position immediately
    setOptimisticClosed((prev) => new Set(prev).add(conditionId));
    try {
      await closePosition(conditionId, size);
      // Show beep boop syncing loader while portfolio revalidates
      setSyncingPortfolio(true);
      setSyncFrame(0);
      const syncInterval = setInterval(() => setSyncFrame((f) => f + 1), 300);
      await Promise.all([mutatePortfolio(), mutateBalance()]);
      clearInterval(syncInterval);
      setSyncingPortfolio(false);
      setCloseResult({ ok: true, message: "Position closed successfully." });
    } catch (err) {
      // Revert optimistic removal on failure
      setOptimisticClosed((prev) => { const s = new Set(prev); s.delete(conditionId); return s; });
      setCloseResult({ ok: false, message: err instanceof Error ? err.message : "Failed to close position" });
    } finally {
      setClosingId(null);
    }
  }

  async function handleUnfollow(username: string) {
    setUnfollowingId(username);
    try {
      await unfollowTrader(username);
      mutateFollowing();
    } catch {
      // silently revalidate to keep UI consistent
      mutateFollowing();
    } finally {
      setUnfollowingId(null);
    }
  }

  return (
    <DashboardChrome title="Profile">
      {/* Private Key Modal */}
      {pkStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClosePkModal} />
          <div className="relative w-full max-w-md mx-4 dashboard-card shadow-2xl z-10 overflow-hidden">

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

      <div className="p-3 md:p-4 space-y-6 max-w-[1400px] mx-auto">
        {/* Profile Header */}
        <div className="dashboard-card overflow-hidden">
          <div className="profile-banner px-6 md:px-8 pt-6 md:pt-8 pb-5">
            <div className="flex items-center gap-5">
              <div className="avatar avatar-lg">
                {isLoading ? "…" : (user?.username ?? "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold truncate">
                    {isLoading ? "Loading…" : (user?.username ? `@${user.username}` : "Anonymous")}
                  </h2>
                  <UserBadge />
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs font-mono text-muted truncate max-w-[240px]">
                    {isLoading ? "Loading…" : (walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "No wallet")}
                  </span>
                  {walletAddress && (
                    <button
                      onClick={handleCopyWallet}
                      title="Copy wallet address"
                      className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border border-border text-muted hover:text-foreground hover:border-blue-primary/30 transition-all"
                    >
                      {walletCopied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {walletCopied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="stat-card accent-blue p-4">
            <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Portfolio Value</div>
            <div className="text-lg font-bold font-mono">
              {portfolioLoading ? "…" : portfolioValue !== undefined ? `$${Number(portfolioValue).toFixed(2)}` : "—"}
            </div>
          </div>
          <div className="stat-card accent-green p-4">
            <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Total PnL</div>
            <div className={`text-lg font-bold font-mono flex items-center gap-1 ${totalPnl !== undefined && Number(totalPnl) >= 0 ? "text-emerald-400" : totalPnl !== undefined ? "text-red-400" : ""}`}>
              {portfolioLoading ? "…" : totalPnl !== undefined ? (
                <>{Number(totalPnl) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}{Number(totalPnl) >= 0 ? "+" : ""}${Number(totalPnl).toFixed(2)}</>
              ) : "—"}
            </div>
          </div>
          <div className="stat-card accent-amber p-4">
            <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Open Positions</div>
            <div className="text-lg font-bold font-mono">
              {portfolioLoading ? "…" : positions.length}
            </div>
          </div>
          <div className="stat-card accent-purple p-4">
            <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Balance</div>
            <div className="text-lg font-bold font-mono">
              {(balanceLoading || portfolioLoading) && !balanceParsed ? "…" : balanceParsed?.total || "—"}
            </div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Account & Settings Card */}
          {isAuthenticated && (
            <div className="dashboard-card p-5 md:p-6 space-y-4">
              <div className="section-header">
                <ShieldAlert className="w-4 h-4 text-blue-primary" />
                <h3 className="text-sm font-semibold">Account &amp; Settings</h3>
              </div>

              {/* Export Private Key */}
              <div className="flex items-center justify-between p-4 inner-card">
                <div>
                  <p className="text-sm font-semibold">Private Key</p>
                  <p className="text-xs text-muted mt-0.5">Export for backup or migration.</p>
                </div>
                <button
                  onClick={() => setPkStep('warning')}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>

              {/* Approve Trades */}
              {(() => {
                const isApproved = statusData?.polymarket_approved === true;
                const BEP_BOP = ["bep", "bop", "bep bop", "bzzzt", "beep", "🤖"];
                const frames = ["⬜⬜⬜⬜⬜⬜", "🟦⬜⬜⬜⬜⬜", "🟦🟦⬜⬜⬜⬜", "🟦🟦🟦⬜⬜⬜", "🟦🟦🟦🟦⬜⬜", "🟦🟦🟦🟦🟦⬜", "🟦🟦🟦🟦🟦🟦"];
                const frameIdx = approveFrame % frames.length;
                const bopIdx = approveFrame % BEP_BOP.length;
                return (
                  <div className="p-4 inner-card space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">Approve Trades</p>
                          {statusLoading ? (
                            <span className="text-[10px] font-mono text-muted px-1.5 py-0.5 rounded bg-surface border border-border animate-pulse">checking…</span>
                          ) : isApproved ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> approved
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">not approved</span>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-0.5">Polymarket USDC + CTF allowances.</p>
                      </div>
                      <button
                        onClick={handleApprove}
                        disabled={approveLoading || isApproved}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approveLoading
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <ShieldCheck className="w-3.5 h-3.5" />}
                        {approveLoading ? "Approving…" : isApproved ? "Approved" : "Approve"}
                      </button>
                    </div>

                    {approveLoading && (
                      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wide">Signing transactions</span>
                          <span className="text-[10px] font-mono text-blue-300 animate-pulse">{BEP_BOP[bopIdx]}</span>
                        </div>
                        <p className="text-[11px] font-mono text-foreground/70">{frames[frameIdx]}</p>
                      </div>
                    )}

                    {approveResult && !approveLoading && (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono ${approveResult.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                        {approveResult.ok
                          ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        {approveResult.message}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Wallet Balance Card */}
          <div className="dashboard-card overflow-hidden">
            <div className="section-header px-5 pt-5 pb-0">
              <Wallet className="w-4 h-4 text-blue-primary" />
              <h3 className="text-sm font-semibold">Wallet Balance</h3>
            </div>
            {(balanceLoading || portfolioLoading) && !balanceParsed ? (
              <div className="flex items-center gap-2 text-muted px-5 py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono">Loading balance…</span>
              </div>
            ) : balanceParsed ? (
              <div>
                <div>
                  {balanceParsed.tokens.map((t) => (
                    <div key={t.symbol} className="token-row">
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-sm text-blue-primary">
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
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-surface/30">
                    <span className="text-xs font-mono text-muted uppercase tracking-wide">Total</span>
                    <span className="text-lg font-bold font-mono">{balanceParsed.total}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted px-5 py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono">Loading balance…</span>
              </div>
            )}
          </div>

          {/* Following Card */}
          {isAuthenticated && (
            <div className="dashboard-card p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="section-header mb-0">
                  <Users className="w-4 h-4 text-blue-primary" />
                  <h3 className="text-sm font-semibold">Following</h3>
                </div>
                {followingList.length > 0 && (
                  <span className="text-xs font-mono px-2 py-1 rounded-lg bg-surface border border-border text-muted">
                    {followingList.length}
                  </span>
                )}
              </div>

              {followingLoading ? (
                <div className="flex items-center gap-2 text-muted py-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-mono">Loading…</span>
                </div>
              ) : followingList.length === 0 ? (
                <p className="text-sm text-muted font-mono text-center py-4">Not following any traders yet.</p>
              ) : (
                <div className="space-y-2">
                  {followingList.map((f, i) => {
                    const username = f.leader_username ?? f.username ?? "";
                    const displayName = f.first_name ?? username;
                    return (
                      <div key={username || i} className="flex items-center gap-3 p-3 inner-card">
                        <div className="avatar avatar-sm">
                          {(displayName || "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{displayName}</p>
                          {username && <p className="text-[10px] font-mono text-muted">@{username}</p>}
                        </div>
                        <button
                          onClick={() => handleUnfollow(username)}
                          disabled={unfollowingId === username}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {unfollowingId === username
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <UserMinus className="w-3 h-3" />}
                          Unfollow
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Positions Card — spans full width */}
          <div className="lg:col-span-2 dashboard-card p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="section-header mb-0">
                <BarChart3 className="w-4 h-4 text-blue-primary" />
                <h3 className="text-sm font-semibold">Open Positions</h3>
                {portfolioValidating && !syncingPortfolio && <PortfolioSyncLabel />}
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded-lg bg-surface border border-border text-muted">
                {positions.length}
              </span>
            </div>

            {syncingPortfolio && (() => {
              const MSGS = ["beep boop...", "syncing ledger...", "crunching numbers...", "bzzzt...", "almost there...", "recalculating..."];
              return (
                <div className="flex items-center gap-2 p-3 rounded-lg text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-300 animate-pulse">
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  {MSGS[syncFrame % MSGS.length]}
                </div>
              );
            })()}

            {closeResult && !syncingPortfolio && (
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
            ) : positions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {positions.map((pos, i) => {
                  const condId = positionConditionId(pos);
                  const pnlCash = positionPnlCash(pos);
                  const pnlPct = positionPnlPct(pos);
                  const isPositive = pnlCash >= 0;
                  const isClosing = closingId === condId;

                  return (
                    <div key={condId ?? i} className="p-4 inner-card">
                      <div className="flex items-start justify-between gap-3 mb-2">
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
                              onClick={() => handleClose(condId, positionSize(pos))}
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

                      <div className="flex gap-4 text-[10px] font-mono text-muted">
                        {pos.avg_price !== undefined && <span>Avg: ${pos.avg_price.toFixed(4)}</span>}
                        {pos.current_price !== undefined && <span>Current: ${pos.current_price.toFixed(4)}</span>}
                        {pos.current_value !== undefined && <span>Value: ${pos.current_value.toFixed(4)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : portfolioValidating ? (
              <div className="flex items-center justify-center gap-2 text-muted py-8">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono">Loading positions…</span>
              </div>
            ) : (
              <p className="text-sm text-muted font-mono py-4 text-center">No open positions.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardChrome>
  );
}
