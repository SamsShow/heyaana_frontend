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
  balance?: number;
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
      <div className="relative w-full sm:max-w-md bg-surface border border-border rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl z-10">
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
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-primary/30 to-purple-500/30 flex items-center justify-center text-lg font-bold font-mono shrink-0">
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
              const balance = data?.balance;
              const posCount = data?.positions?.length;
              return (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {portfolioVal !== undefined && (
                    <div className="rounded-xl border border-border bg-surface/60 p-3">
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
                    <div className="rounded-xl border border-border bg-surface/60 p-3">
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
                    <div className="rounded-xl border border-border bg-surface/60 p-3">
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
                    <div className="rounded-xl border border-border bg-surface/60 p-3">
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
                      <div key={i} className="rounded-lg border border-border bg-surface/40 p-3 flex items-start gap-3">
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
  amount?: number;
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

  async function handleFollowToggle(username: string) {
    if (!username) return;
    if (!isAuthenticated) {
      window.location.href = "/onboarding";
      return;
    }
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
          onFollow={() => handleFollowToggle(selectedUser)}
          onClose={() => setSelectedUser(null)}
          currentUsername={user?.username ?? undefined}
        />
      )}
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
          {/* Header + Tabs */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-primary" />
              <h1 className="text-xl font-bold">Social</h1>
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border w-fit">
              <button
                onClick={() => setTab("feed")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${tab === "feed" ? "bg-blue-primary text-white" : "text-muted hover:text-foreground"}`}
              >
                Feed
              </button>
              <button
                onClick={() => setTab("copy")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${tab === "copy" ? "bg-blue-primary text-white" : "text-muted hover:text-foreground"}`}
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

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-2 text-muted">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-mono">Loading feed…</span>
              </div>
            </div>
          ) : feed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted">
              <Users className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm font-mono">No social trading activity yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feed.map((trade, i) => {
                const isBuy = (trade.side ?? "").toLowerCase() === "buy" || (trade.side ?? "").toLowerCase() === "yes";
                const rawTime = trade.executed_at ?? trade.created_at;
                const timeStr = typeof rawTime === "number"
                  ? new Date(rawTime * 1000).toISOString()
                  : rawTime;
                const isOwnTrade = trade.username && user?.username === trade.username;
                const isFollowing = trade.username ? followed.has(trade.username) : false;
                const isPending = trade.username ? pendingFollow.has(trade.username) : false;

                return (
                  <div
                    key={`${trade.user_id}-${trade.executed_at}-${i}`}
                    className="rounded-xl border border-border bg-surface/30 p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <button
                        onClick={() => trade.username && setSelectedUser(trade.username)}
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-primary/30 to-purple-500/30 flex items-center justify-center text-xs font-bold font-mono shrink-0 hover:ring-2 hover:ring-blue-primary/40 transition-all"
                      >
                        {(trade.first_name ?? trade.username ?? "?").slice(0, 2).toUpperCase()}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => trade.username && setSelectedUser(trade.username)}
                            className="text-sm font-semibold hover:text-blue-primary transition-colors"
                          >
                            {trade.first_name ?? trade.username ?? `User #${trade.user_id}`}
                          </button>
                          {trade.username && (
                            <span className="text-[10px] font-mono text-muted">@{trade.username}</span>
                          )}
                          {trade.copied_from_username && (
                            <span className="text-[10px] font-mono text-blue-primary/70 flex items-center gap-0.5">
                              <Copy className="w-2.5 h-2.5" />
                              copied @{trade.copied_from_username}
                            </span>
                          )}
                          {timeStr && (
                            <span className="text-[10px] font-mono text-muted ml-auto">
                              {formatRelativeTime(timeStr)}
                            </span>
                          )}
                        </div>

                        {/* Trade details */}
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                            isBuy
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}>
                            {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {trade.side ?? "—"}
                          </span>
                          {trade.amount !== undefined && (
                            <span className="text-xs font-mono text-foreground">${trade.amount}</span>
                          )}
                          {trade.market_title && (
                            <span className="text-xs font-mono text-muted truncate max-w-[300px]">
                              {trade.market_title}
                            </span>
                          )}
                        </div>

                        {trade.status && (
                          <span className={`inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            trade.status === "filled" || trade.status === "success"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : trade.status === "pending"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-surface-hover text-muted"
                          }`}>
                            {trade.status}
                          </span>
                        )}
                      </div>

                      {/* Follow button */}
                      {isAuthenticated && trade.username && !isOwnTrade && (
                        <button
                          onClick={() => handleFollowToggle(trade.username!)}
                          disabled={isPending}
                          className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all border disabled:opacity-50 ${
                            isFollowing
                              ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                              : "border-blue-primary/30 text-blue-primary hover:bg-blue-primary/10"
                          }`}
                        >
                          {isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isFollowing ? (
                            <>
                              <UserMinus className="w-3 h-3" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              Follow
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </DashboardChrome>
  );
}
