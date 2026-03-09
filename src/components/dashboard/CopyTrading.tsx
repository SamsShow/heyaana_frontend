"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  enableCopyTrading,
  disableCopyTrading,
  followTrader,
  unfollowTrader,
  proxyFetcher,
} from "@/lib/api";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  TrendingUp,
  Zap,
  Users,
  TriangleAlert,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";

type SocialTrader = {
  user_id?: number;
  username?: string;
  first_name?: string;
  trade_count?: number;
  recent_trades?: unknown[];
  [key: string]: unknown;
};

export function CopyTrading() {
  const { isAuthenticated } = useAuth();
  const [togglingEnabled, setTogglingEnabled] = useState(false);
  const [pendingFollow, setPendingFollow] = useState<Set<string>>(new Set());
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; message: string } | null>(null);

  // GET /me/copy-trading — returns enabled state + followed leaders in one call
  const { data: copyTradingData, mutate: mutateCopyTrading } = useSWR<{
    copy_trading_enabled?: boolean;
    leaders?: Array<{ username?: string; leader_username?: string }>;
    following?: Array<{ username?: string; leader_username?: string }>;
  }>(
    isAuthenticated ? "/api/proxy/me/copy-trading" : null,
    proxyFetcher,
    { revalidateOnFocus: true },
  );
  const enabled = copyTradingData?.copy_trading_enabled ?? false;

  // Derive followed leaders from the same response
  const followingRaw = copyTradingData?.leaders ?? copyTradingData?.following ?? [];
  // Keep a separate mutate alias for follow/unfollow refreshes
  const mutateFollowing = mutateCopyTrading;

  // Load real traders from social feed
  const { data: socialFeedRaw } = useSWR<unknown>(
    "/api/proxy/social/feed?limit=20",
    proxyFetcher,
    { revalidateOnFocus: false },
  );

  // Derive traders list from social feed only — no mock data
  const traders = (() => {
    const feedArray = Array.isArray(socialFeedRaw) ? socialFeedRaw : [];
    const seen = new Map<string, SocialTrader>();
    for (const item of feedArray as SocialTrader[]) {
      const username = item.username;
      if (!username) continue;
      if (!seen.has(username)) {
        seen.set(username, item);
      }
    }
    return Array.from(seen.values())
      .filter((t) => t.username)
      .map((t) => ({
        id: t.user_id ?? 0,
        username: t.username!,
        name: t.first_name ?? t.username!,
        avatar: (t.first_name ?? t.username ?? "?").slice(0, 2).toUpperCase(),
        trades: t.trade_count ?? (t.recent_trades ? (t.recent_trades as unknown[]).length : 0),
      }));
  })();

  // Derive the set of followed usernames from the unified response
  const followed = new Set<string>(
    followingRaw.map((f) => f.leader_username ?? f.username ?? "").filter(Boolean)
  );

  async function handleToggleCopyTrading() {
    setTogglingEnabled(true);
    setStatusMsg(null);
    const next = !enabled;
    // Optimistic update
    mutateCopyTrading({ ...copyTradingData, copy_trading_enabled: next }, false);
    try {
      if (enabled) {
        await disableCopyTrading();
        setStatusMsg({ ok: true, message: "Copy trading disabled." });
      } else {
        await enableCopyTrading();
        setStatusMsg({ ok: true, message: "Copy trading enabled!" });
      }
      await mutateCopyTrading();
    } catch (err) {
      // Revert on failure
      mutateCopyTrading({ ...copyTradingData, copy_trading_enabled: enabled }, false);
      setStatusMsg({
        ok: false,
        message: err instanceof Error ? err.message : "Failed",
      });
    } finally {
      setTogglingEnabled(false);
    }
  }

  async function handleFollowToggle(username: string) {
    setPendingFollow((prev) => new Set(prev).add(username));
    setStatusMsg(null);
    try {
      if (followed.has(username)) {
        await unfollowTrader(username);
      } else {
        await followTrader(username);
      }
      await mutateFollowing();
    } catch (err) {
      setStatusMsg({
        ok: false,
        message: err instanceof Error ? err.message : "Request failed",
      });
    } finally {
      setPendingFollow((prev) => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <Copy className="w-8 h-8 mb-3 opacity-30" />
        <p className="text-sm font-mono">Log in to use copy trading</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable / disable toggle */}
      <div className="dashboard-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Copy Trading</h2>
            <p className="text-xs text-muted mt-0.5">
              {enabled
                ? "Active — mirroring selected traders"
                : "Inactive — enable to mirror top traders"}
            </p>
          </div>
          <button
            onClick={handleToggleCopyTrading}
            disabled={togglingEnabled}
            aria-pressed={enabled}
            aria-label={enabled ? "Disable copy trading" : "Enable copy trading"}
            className={`relative inline-flex items-center h-7 rounded-full transition-colors disabled:opacity-50 ${
              enabled ? "bg-emerald-500" : "bg-surface-hover border border-border"
            }`}
            style={{ width: "3.25rem" }}
          >
            {togglingEnabled ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted" />
            ) : (
              <span
                className={`inline-block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  enabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            )}
          </button>
        </div>

        {statusMsg && (
          <div
            className={`mt-3 flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-lg ${
              statusMsg.ok
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {statusMsg.ok ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {statusMsg.message}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card accent-blue p-4">
          <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">
            Following
          </div>
          <div className="text-xl font-bold font-mono">{followed.size}</div>
        </div>
        <div className="stat-card accent-green p-4">
          <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">
            Status
          </div>
          <div
            className={`text-sm font-bold font-mono ${
              enabled ? "text-emerald-400" : "text-muted"
            }`}
          >
            {enabled ? "Active" : "Off"}
          </div>
        </div>
        <div className="stat-card accent-amber p-4">
          <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">
            Traders
          </div>
          <div className="text-xl font-bold font-mono">{traders.length}</div>
        </div>
      </div>

      {/* Auto-execute disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300/80 leading-relaxed">
          <span className="font-semibold text-amber-400">Trades execute automatically.</span>{" "}
          When you follow a trader, their positions will be mirrored in your account in real time without further confirmation. Only follow traders you trust, and ensure your account has sufficient balance.
        </p>
      </div>

      {/* Traders list */}
      <div>
        <div className="section-header">
          <Users className="w-4 h-4 text-blue-primary" />
          <h3 className="text-sm font-semibold">Top Traders</h3>
        </div>

        <div className="space-y-2">
          {traders.length === 0 ? (
            <div className="inner-card p-8 flex flex-col items-center justify-center text-center text-muted">
              <Users className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm font-medium">Coming soon</p>
              <p className="text-xs mt-1">Top traders will appear here when available</p>
            </div>
          ) : (
          traders.map((trader) => {
            const isFollowing = followed.has(trader.username);
            const isPending = pendingFollow.has(trader.username);

            return (
              <div
                key={trader.id}
                className={`inner-card p-4 transition-all ${
                  isFollowing
                    ? "!border-blue-primary/30 bg-blue-primary/5"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="avatar avatar-md">
                    {trader.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{trader.name}</span>
                      {"streak" in trader && (trader as { streak: number }).streak > 5 && (
                        <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" />
                          {(trader as { streak: number }).streak}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {"winRate" in trader && (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          {(trader as { winRate: number }).winRate}% win
                        </span>
                      )}
                      {"pnl" in trader && (
                        <span className="text-[10px] font-mono text-muted">
                          {(trader as { pnl: string }).pnl}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-muted">
                        {trader.trades} trades
                      </span>
                    </div>
                    {"markets" in trader && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {((trader as { markets: string[] }).markets).map((m) => (
                          <span
                            key={m}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-hover text-muted border border-border/50"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Follow / Unfollow */}
                  <button
                    onClick={() => handleFollowToggle(trader.username)}
                    disabled={isPending}
                    className={`shrink-0 min-w-[76px] flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border disabled:opacity-50 ${
                      isFollowing
                        ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                        : "border-blue-primary/30 text-blue-primary hover:bg-blue-primary/10"
                    }`}
                  >
                    {isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isFollowing ? (
                      "Unfollow"
                    ) : (
                      "Follow"
                    )}
                  </button>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
}
