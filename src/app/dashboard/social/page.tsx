"use client";

import useSWR from "swr";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { CopyTrading } from "@/components/dashboard/CopyTrading";
import { proxyFetcher, formatRelativeTime, followTrader, unfollowTrader } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import {
  Loader2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  UserPlus,
  UserMinus,
  AlertCircle,
  X,
  TrendingUp,
  Wallet,
  BarChart2,
} from "lucide-react";
import { useState } from "react";

type UserPortfolio = {
  username?: string;
  first_name?: string;
  wallet?: string;
  balance?: number | { total_usd?: number; tokens?: unknown[] };
  portfolio_value?: number;
  total_pnl?: number;
  totals?: { portfolio_value?: number; total_pnl?: number };
  positions?: Array<{
    title?: string;
    outcome?: string;
    side?: string;
    size?: number;
    shares?: number;
    current_value?: number;
    pnl_cash?: number;
    pnl?: number;
    icon?: string;
  }>;
  [key: string]: unknown;
};

function UserProfileModal({
  username,
  isFollowing,
  isPending,
  onFollow,
  onClose,
  currentUsername,
}: {
  username: string;
  isFollowing: boolean;
  isPending: boolean;
  onFollow: () => void;
  onClose: () => void;
  currentUsername?: string;
}) {
  const { data, isLoading, error } = useSWR<UserPortfolio>(
    `/api/proxy/users/${username}/portfolio`,
    proxyFetcher,
  );

  const isOwnProfile = currentUsername === username;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md dashboard-card rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl z-10">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-xs font-mono">Failed to load profile</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 avatar avatar-lg shrink-0">
                {(data?.first_name ?? username ?? "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base truncate">{data?.first_name ?? username}</p>
                <p className="text-xs font-mono text-muted">@{username}</p>
                {data?.wallet && (
                  <p className="text-[10px] font-mono text-muted/60 truncate mt-0.5">
                    {data.wallet.slice(0, 6)}…{data.wallet.slice(-4)}
                  </p>
                )}
              </div>
              {!isOwnProfile && (
                <button
                  onClick={onFollow}
                  disabled={isPending}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all border disabled:opacity-50 ${
                    isFollowing
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                      : "border-blue-primary/40 text-blue-primary hover:bg-blue-primary/10"
                  }`}
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isFollowing ? (
                    <><UserMinus className="w-3.5 h-3.5" /> Unfollow</>
                  ) : (
                    <><UserPlus className="w-3.5 h-3.5" /> Follow</>
                  )}
                </button>
              )}
            </div>

            {/* Stats row */}
            {(() => {
              const portfolioVal = data?.totals?.portfolio_value ?? data?.portfolio_value;
              const pnl = data?.totals?.total_pnl ?? data?.total_pnl;
              const balance = (() => {
                const b = data?.balance;
                if (typeof b === "number") return b;
                if (b && typeof b === "object") return (b as { total_usd?: number }).total_usd;
                return undefined;
              })();
              const posCount = data?.positions?.length;
              return (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {portfolioVal !== undefined && (
                    <div className="inner-card p-3">
                      <div className="flex items-center gap-1.5 text-muted mb-1">
                        <Wallet className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono uppercase tracking-wide">Portfolio</span>
                      </div>
                      <p className="text-sm font-bold font-mono">
                        ${Number(portfolioVal).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {pnl !== undefined && (
                    <div className="inner-card p-3">
                      <div className="flex items-center gap-1.5 text-muted mb-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono uppercase tracking-wide">P&amp;L</span>
                      </div>
                      <p className={`text-sm font-bold font-mono ${Number(pnl) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {Number(pnl) >= 0 ? "+" : ""}${Number(pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {balance !== undefined && (
                    <div className="inner-card p-3">
                      <div className="flex items-center gap-1.5 text-muted mb-1">
                        <Wallet className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono uppercase tracking-wide">Balance</span>
                      </div>
                      <p className="text-sm font-bold font-mono">
                        ${Number(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {posCount !== undefined && (
                    <div className="inner-card p-3">
                      <div className="flex items-center gap-1.5 text-muted mb-1">
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono uppercase tracking-wide">Positions</span>
                      </div>
                      <p className="text-sm font-bold font-mono">{posCount}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Positions list */}
            {data?.positions && data.positions.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wide text-muted mb-2">Open Positions</p>
                <div className="space-y-2">
                  {data.positions.map((pos, i) => {
                    const side = pos.outcome ?? pos.side ?? "—";
                    const isBuy = side.toLowerCase() === "yes" || side.toLowerCase() === "buy";
                    const pnlVal = pos.pnl_cash ?? pos.pnl;
                    const size = pos.size ?? pos.shares;
                    return (
                      <div key={i} className="inner-card p-3 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-md bg-surface flex items-center justify-center text-[10px] font-bold font-mono shrink-0 border border-border">
                          {(pos.title ?? "?")[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-1">{pos.title ?? "Unknown market"}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${isBuy ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                              {side}
                            </span>
                            {size !== undefined && (
                              <span className="text-[10px] font-mono text-muted">{size} shares</span>
                            )}
                            {pos.current_value !== undefined && (
                              <span className="text-[10px] font-mono text-foreground">${Number(pos.current_value).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        {pnlVal !== undefined && (
                          <span className={`text-[10px] font-mono font-bold shrink-0 ${Number(pnlVal) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {Number(pnlVal) >= 0 ? "+" : ""}${Number(pnlVal).toFixed(2)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!data?.positions?.length && !data?.portfolio_value && !data?.totals?.portfolio_value && (
              <p className="text-xs font-mono text-muted text-center py-4">No portfolio data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type FeedTrade = {
  user_id?: number;
  username?: string;
  first_name?: string;
  eth_address?: string;
  market_id?: number;
  condition_id?: string;
  market_title?: string;
  side?: string;
  amount?: number;   // share count (size)
  price?: number;    // price per share (0–1 scale)
  cost?: number;     // actual USD cost if provided directly
  pnl_cash?: number;
  pnl?: number;
  current_pnl?: number;
  unrealized_pnl?: number;
  status?: string;
  tx_hash?: string;
  executed_at?: string | number;
  created_at?: string | number;
  copied_from_user_id?: number;
  copied_from_username?: string;
  [key: string]: unknown;
};

export default function SocialFeedPage() {
  const { isAuthenticated, user } = useAuth();
  const [tab, setTab] = useState<"feed" | "copy">("feed");
  const [pendingFollow, setPendingFollow] = useState<Set<string>>(new Set());
  const [followError, setFollowError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [confirmFollowUser, setConfirmFollowUser] = useState<string | null>(null);

  const { data: feedRaw, isLoading } = useSWR<unknown>(
    "/api/proxy/trades?limit=50",
    proxyFetcher,
    { revalidateOnFocus: true, refreshInterval: 15000 },
  );

  const { data: followingData, mutate: mutateFollowing } = useSWR<unknown>(
    isAuthenticated ? "/api/proxy/copy-trading/following" : null,
    proxyFetcher,
    { revalidateOnFocus: true },
  );

  // Optimistic overrides: track local follow/unfollow before server confirms
  const [optimisticFollowed, setOptimisticFollowed] = useState<Set<string>>(new Set());
  const [optimisticUnfollowed, setOptimisticUnfollowed] = useState<Set<string>>(new Set());

  const rawFollowingArr = (() => {
    if (Array.isArray(followingData)) return followingData;
    const wrapped = followingData as { following?: unknown[]; data?: unknown[] } | null;
    if (Array.isArray(wrapped?.following)) return wrapped!.following;
    if (Array.isArray(wrapped?.data)) return wrapped!.data;
    return [];
  })();

  const serverFollowed = new Set<string>(
    (rawFollowingArr as Array<{ leader_username?: string; username?: string }>)
      .map((f) => f.leader_username ?? f.username ?? "")
      .filter(Boolean),
  );

  // Merge: server state + optimistic additions - optimistic removals
  const followed = new Set<string>([
    ...[...serverFollowed].filter((u) => !optimisticUnfollowed.has(u)),
    ...optimisticFollowed,
  ]);

  const feedArr = Array.isArray(feedRaw)
    ? feedRaw
    : Array.isArray((feedRaw as { trades?: FeedTrade[] })?.trades)
      ? (feedRaw as { trades: FeedTrade[] }).trades
      : [];
  const feed: FeedTrade[] = feedArr;

  function requestFollow(username: string) {
    if (!username) return;
    if (!isAuthenticated) { window.location.href = "/onboarding"; return; }
    if (!followed.has(username)) {
      setConfirmFollowUser(username);
    } else {
      handleFollowToggle(username);
    }
  }

  async function handleFollowToggle(username: string) {
    if (!username) return;
    if (!isAuthenticated) {
      window.location.href = "/onboarding";
      return;
    }
    setConfirmFollowUser(null);
    setFollowError(null);
    const isCurrentlyFollowing = followed.has(username);

    // Optimistic update — flip state immediately
    if (isCurrentlyFollowing) {
      setOptimisticUnfollowed((prev) => new Set(prev).add(username));
      setOptimisticFollowed((prev) => { const s = new Set(prev); s.delete(username); return s; });
    } else {
      setOptimisticFollowed((prev) => new Set(prev).add(username));
      setOptimisticUnfollowed((prev) => { const s = new Set(prev); s.delete(username); return s; });
    }

    setPendingFollow((prev) => new Set(prev).add(username));
    try {
      if (isCurrentlyFollowing) {
        await unfollowTrader(username);
      } else {
        await followTrader(username);
      }
      await mutateFollowing();
      // Clear optimistic overrides now that server state is fresh
      setOptimisticFollowed((prev) => { const s = new Set(prev); s.delete(username); return s; });
      setOptimisticUnfollowed((prev) => { const s = new Set(prev); s.delete(username); return s; });
    } catch (err) {
      // Revert optimistic update on failure
      if (isCurrentlyFollowing) {
        setOptimisticUnfollowed((prev) => { const s = new Set(prev); s.delete(username); return s; });
      } else {
        setOptimisticFollowed((prev) => { const s = new Set(prev); s.delete(username); return s; });
      }
      setFollowError(err instanceof Error ? err.message : "Failed to update follow");
    } finally {
      setPendingFollow((prev) => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
    }
  }

  return (
    <DashboardChrome title="Social Feed">
      {selectedUser && (
        <UserProfileModal
          username={selectedUser}
          isFollowing={followed.has(selectedUser)}
          isPending={pendingFollow.has(selectedUser)}
          onFollow={() => requestFollow(selectedUser)}
          onClose={() => setSelectedUser(null)}
          currentUsername={user?.username ?? undefined}
        />
      )}

      {/* Follow confirmation dialog */}
      {confirmFollowUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmFollowUser(null)} />
          <div className="relative w-full max-w-sm mx-4 dashboard-card shadow-2xl z-10 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Follow @{confirmFollowUser}?</p>
                <p className="text-xs text-muted mt-0.5">Trades will execute automatically</p>
              </div>
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">
              By following this trader, their positions will be <span className="text-amber-400 font-semibold">mirrored in your account automatically</span> without any further confirmation. Make sure you have sufficient balance and trust this trader.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmFollowUser(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl border border-border text-muted hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFollowToggle(confirmFollowUser)}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-primary text-white hover:bg-blue-primary/90 transition-all"
              >
                Follow
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-full overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
          {/* Header + Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="section-header mb-0">
              <Users className="w-5 h-5 text-blue-primary" />
              <div>
                <h1 className="text-xl font-bold">Social</h1>
                <p className="text-xs text-muted mt-0.5">Live trading activity &amp; copy trading</p>
              </div>
            </div>
            <div className="pill-tabs">
              <button
                onClick={() => setTab("feed")}
                className={`pill-tab ${tab === "feed" ? "active" : ""}`}
              >
                Feed
              </button>
              <button
                onClick={() => setTab("copy")}
                className={`pill-tab ${tab === "copy" ? "active" : ""}`}
              >
                Copy Trading
              </button>
            </div>
          </div>

          {tab === "copy" ? (
            <CopyTrading />
          ) : (
            <>
          {followError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {followError}
            </div>
          )}

          <div className="dashboard-card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_80px_80px_80px] md:grid-cols-[minmax(140px,1fr)_1fr_90px_90px_110px_100px_90px] gap-3 px-4 py-2.5 text-[10px] font-mono text-muted uppercase tracking-wider border-b border-border/50">
              <span>Trader</span>
              <span className="hidden md:block">Market</span>
              <span className="text-center">Side</span>
              <span className="text-right">Amount</span>
              <span className="text-right hidden md:block">PnL</span>
              <span className="text-center hidden md:block">Status</span>
              <span className="text-right">Time</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-2 text-muted">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-mono">Loading feed…</span>
                </div>
              </div>
            ) : feed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted">
                <Users className="w-6 h-6 mb-2 opacity-30" />
                <p className="text-sm font-mono">No social trading activity yet.</p>
              </div>
            ) : (
              <div>
                {feed.map((trade, i) => {
                  const isBuy = (trade.side ?? "").toLowerCase() === "buy" || (trade.side ?? "").toLowerCase() === "yes";
                  const rawTime = trade.executed_at ?? trade.created_at;
                  const timeStr = typeof rawTime === "number"
                    ? new Date(rawTime * 1000).toISOString()
                    : rawTime;
                  const isOwnTrade = trade.username && user?.username === trade.username;
                  const isFollowing = trade.username ? followed.has(trade.username) : false;
                  const isPending = trade.username ? pendingFollow.has(trade.username) : false;
                  const cost = trade.cost ?? (trade.price !== undefined && trade.amount !== undefined ? trade.amount * trade.price : null);
                  const rawPnl = trade.pnl_cash ?? trade.pnl ?? trade.current_pnl ?? trade.unrealized_pnl;
                  const pnlValue = rawPnl === undefined || rawPnl === null ? null : Number(rawPnl);
                  const hasPnl = pnlValue !== null && Number.isFinite(pnlValue);
                  const displayName = trade.first_name ?? trade.username ?? `User #${trade.user_id}`;

                  return (
                    <div
                      key={`${trade.user_id}-${trade.executed_at}-${i}`}
                      className="grid grid-cols-[1fr_80px_80px_80px] md:grid-cols-[minmax(140px,1fr)_1fr_90px_90px_110px_100px_90px] gap-3 items-center px-4 py-3 border-b border-border/30 transition-all hover:bg-surface/60 group"
                    >
                      {/* Trader */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => trade.username && setSelectedUser(trade.username)}
                          className="avatar avatar-sm shrink-0 hover:opacity-80 transition-opacity text-[10px]"
                        >
                          {displayName.slice(0, 2).toUpperCase()}
                        </button>
                        <div className="min-w-0">
                          <button
                            onClick={() => trade.username && setSelectedUser(trade.username)}
                            className="text-sm font-semibold truncate block hover:text-blue-primary transition-colors"
                          >
                            {trade.username ? `@${trade.username}` : displayName}
                          </button>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {trade.copied_from_username && (
                              <span className="text-[10px] font-mono text-blue-primary/60 flex items-center gap-0.5">
                                <Copy className="w-2.5 h-2.5" />
                                @{trade.copied_from_username}
                              </span>
                            )}
                            {isAuthenticated && trade.username && !isOwnTrade && (
                              <button
                                onClick={() => requestFollow(trade.username!)}
                                disabled={isPending}
                                className={`hidden md:flex items-center gap-1 text-[10px] font-semibold transition-all disabled:opacity-50 ${
                                  isFollowing
                                    ? "text-muted hover:text-red-400"
                                    : "text-muted hover:text-blue-primary"
                                }`}
                              >
                                {isPending ? (
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                ) : isFollowing ? (
                                  <><UserMinus className="w-2.5 h-2.5" /> Unfollow</>
                                ) : (
                                  <><UserPlus className="w-2.5 h-2.5" /> Follow</>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Market — hidden on mobile */}
                      <div className="min-w-0 hidden md:block">
                        <p className="text-sm truncate text-foreground/80">
                          {trade.market_title ?? "—"}
                        </p>
                      </div>

                      {/* Side */}
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isBuy
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {isBuy
                            ? <ArrowUpRight className="w-3 h-3" />
                            : <ArrowDownRight className="w-3 h-3" />}
                          {trade.side ?? "—"}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono">
                          {cost !== null ? `$${cost.toFixed(2)}` : "—"}
                        </span>
                        {trade.amount !== undefined && (
                          <p className="text-[10px] font-mono text-muted mt-0.5">
                            {trade.amount.toFixed(2)} shares
                          </p>
                        )}
                      </div>

                      {/* Current PnL — hidden on mobile */}
                      <div className="text-right hidden md:block">
                        {hasPnl ? (
                          <span className={`text-sm font-bold font-mono ${pnlValue >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {pnlValue >= 0 ? "+" : ""}${Math.abs(pnlValue).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-muted">—</span>
                        )}
                      </div>

                      {/* Status — hidden on mobile */}
                      <div className="text-center hidden md:block">
                        {trade.status && (trade.status === "filled" || trade.status === "success" || trade.status === "matched") ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {trade.status === "filled" ? "matched" : trade.status}
                          </span>
                        ) : trade.status === "pending" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            pending
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-muted">—</span>
                        )}
                      </div>

                      {/* Time */}
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-muted">
                          {timeStr ? formatRelativeTime(timeStr) : "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </DashboardChrome>
  );
}
