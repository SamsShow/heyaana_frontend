"use client";

import { Suspense, use } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { PriceChart } from "@/components/dashboard/market/PriceChart";
import { TradePanel } from "@/components/dashboard/market/TradePanel";
import { PositionCard } from "@/components/dashboard/market/PositionCard";
import { MarketTabs } from "@/components/dashboard/market/MarketTabs";
import { fetcher, formatVolume, Market, normalizeMarket, Trade } from "@/lib/api";
import { parseMarketTitle } from "@/lib/market-title";
import {
  ChevronLeft,
  Clock,
  Volume2,
  BarChart3,
  Loader2,
  TrendingUp,
} from "lucide-react";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEndDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MarketDetailPage() {
  return (
    <Suspense fallback={
      <DashboardChrome title="Market">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-6 h-6 animate-spin text-muted" />
        </div>
      </DashboardChrome>
    }>
      <MarketDetailContent />
    </Suspense>
  );
}

function MarketDetailContent() {
  const searchParams = useSearchParams();
  const conditionId = searchParams.get("conditionId") ?? searchParams.get("ticker");
  const decodedConditionId = conditionId ? decodeURIComponent(conditionId) : "";

  const { data: marketRaw, isLoading: loadingMarket, mutate: mutateMarket } = useSWR<Market>(
    decodedConditionId ? `/api/proxy/markets/by-condition/${encodeURIComponent(decodedConditionId)}` : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 15000 },
  );
  const market = marketRaw ? normalizeMarket(marketRaw) : null;

  // Fetch trades using condition_id from the loaded market
  const tradesKey = market?.condition_id
    ? `/api/proxy/data/trades?market=${encodeURIComponent(market.condition_id)}&limit=50`
    : null;
  const {
    data: tradesRaw,
    isLoading: loadingTrades,
    mutate: mutateTrades,
  } = useSWR<unknown>(tradesKey, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 10000,
  });
  // API may return {trades:[...]} or a plain array
  const trades: Trade[] = Array.isArray(tradesRaw)
    ? (tradesRaw as Trade[])
    : Array.isArray((tradesRaw as { trades?: unknown })?.trades)
      ? ((tradesRaw as { trades: Trade[] }).trades)
      : [];

  if (loadingMarket) {
    return (
      <DashboardChrome title="Market">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="flex items-center gap-2 text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-mono">Loading market…</span>
          </div>
        </div>
      </DashboardChrome>
    );
  }

  if (!market) {
    return (
      <DashboardChrome title="Market">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <p className="text-red-400 text-sm font-mono mb-3">
              Market not found.
            </p>
            <Link
              href="/dashboard/markets"
              className="text-blue-primary text-sm hover:underline"
            >
              ← Back to Markets
            </Link>
          </div>
        </div>
      </DashboardChrome>
    );
  }

  const yesPrice = market.yes_bid ?? market.last_price ?? 0;
  const noPrice = market.no_bid ?? (market.last_price ? 100 - market.last_price : 0);
  const parsedTitle = parseMarketTitle(market.title);

  return (
    <DashboardChrome title="Markets">
      <div className="h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          {/* Back link */}
          <Link
            href="/dashboard/markets"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>

          {/* Main layout: 2 columns on desktop */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column — Market info + Chart + Tabs */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Market header */}
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  {/* Market icon placeholder */}
                  <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
                    <BarChart3 className="w-6 h-6 text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-2xl font-semibold leading-tight">
                      {parsedTitle.displayTitle}
                    </h1>
                    {parsedTitle.subtitle && (
                      <p className="text-sm text-muted mt-1 leading-relaxed">
                        {parsedTitle.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-sm text-muted font-mono flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5" />
                        Volume {formatVolume(market.volume)}
                      </span>
                      {market.volume_24h > 0 && (
                        <span className="text-sm text-muted font-mono flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          24h {formatVolume(market.volume_24h)}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono ${market.status === "open"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : market.status === "closed"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                      >
                        {market.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex flex-wrap gap-4 text-xs font-mono text-muted">
                  {market.open_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Opened:{" "}
                      {formatTime(market.open_time)}
                    </span>
                  )}
                  {market.close_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Ends{" "}
                      {formatEndDate(market.close_time)}
                    </span>
                  )}
                </div>
              </div>

              {/* Price chart */}
              <div className="rounded-xl border border-border bg-surface/30 p-4 md:p-5">
                <PriceChart
                  trades={trades ?? []}
                  conditionId={market.condition_id}
                  isLoading={loadingTrades}
                />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="Last Price"
                  value={
                    market.last_price !== null ? `${market.last_price}¢` : "—"
                  }
                />
                <StatCard label="Volume" value={formatVolume(market.volume)} />
                <StatCard
                  label="24h Volume"
                  value={formatVolume(market.volume_24h)}
                />
                <StatCard
                  label="Open Interest"
                  value={market.open_interest.toLocaleString()}
                />
              </div>

              {/* Tabbed content */}
              <div className="rounded-xl border border-border bg-surface/30 p-4 md:p-5">
                <MarketTabs
                  market={market}
                  trades={trades ?? []}
                  tradesLoading={loadingTrades}
                />
              </div>
            </div>

            {/* Right column — Trading panel + Position */}
            <div className="lg:w-[360px] shrink-0 space-y-4">
              {/* Quick price display */}
              <div className="rounded-xl border border-border bg-surface/30 p-4">
                <div className="text-xs text-muted font-mono mb-3">
                  Current Prices
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <div className="text-lg font-bold text-emerald-400 font-mono">
                      {yesPrice}¢
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400/60 uppercase mt-0.5">
                      Yes
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="text-lg font-bold text-red-400 font-mono">
                      {noPrice}¢
                    </div>
                    <div className="text-[10px] font-mono text-red-400/60 uppercase mt-0.5">
                      No
                    </div>
                  </div>
                </div>
              </div>

              {/* Position card */}
              <PositionCard ticker={decodedConditionId} marketTitle={market.title} />

              {/* Trading panel */}
              <TradePanel
                market={market}
                conditionId={market.condition_id}
                marketId={market.id}
                onTradeSuccess={() => { mutateTrades(); mutateMarket(); }}
              />

              {/* Market meta */}
              <div className="rounded-xl border border-border bg-surface/30 p-4 space-y-2">
                <div className="text-xs font-mono text-muted">Market Info</div>
                <div className="space-y-1.5">
                  <MetaRow label="Ticker" value={market.ticker} />
                  <MetaRow label="Event" value={market.event_ticker} />
                  <MetaRow label="Type" value={market.market_type} />
                  {market.result && (
                    <MetaRow label="Result" value={market.result} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardChrome>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-border bg-surface/30">
      <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-sm font-bold font-mono">{value}</div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted font-mono">{label}</span>
      <span className="font-mono text-foreground truncate max-w-[200px]">
        {value}
      </span>
    </div>
  );
}
