"use client";

import useSWR from "swr";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
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
} from "lucide-react";
import { useState } from "react";

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
  const [pendingFollow, setPendingFollow] = useState<Set<string>>(new Set());
  const [followError, setFollowError] = useState<string | null>(null);

  const { data: feedRaw, isLoading } = useSWR<unknown>(
    "/api/proxy/trades?limit=50",
    proxyFetcher,
    { revalidateOnFocus: false, refreshInterval: 30000 },
  );

  const { data: followingData, mutate: mutateFollowing } = useSWR<unknown>(
    isAuthenticated ? "/api/proxy/copy-trading/following" : null,
    proxyFetcher,
    { revalidateOnFocus: false },
  );

  const followed = new Set<string>(
    Array.isArray(followingData)
      ? (followingData as Array<{ leader_username?: string; username?: string }>)
          .map((f) => f.leader_username ?? f.username ?? "")
          .filter(Boolean)
      : [],
  );

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
    setPendingFollow((prev) => new Set(prev).add(username));
    try {
      if (followed.has(username)) {
        await unfollowTrader(username);
      } else {
        await followTrader(username);
      }
      await mutateFollowing();
    } catch (err) {
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
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-blue-primary" />
              <h1 className="text-xl font-bold">Social Feed</h1>
            </div>
            <p className="text-xs text-muted font-mono">
              Global trade feed across all users. Follow traders to mirror their positions.
            </p>
          </div>

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
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-primary/30 to-purple-500/30 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                        {(trade.first_name ?? trade.username ?? "?").slice(0, 2).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">
                            {trade.first_name ?? trade.username ?? `User #${trade.user_id}`}
                          </span>
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
        </div>
      </div>
    </DashboardChrome>
  );
}
