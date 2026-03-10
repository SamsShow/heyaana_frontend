"use client";

import useSWR from "swr";
import { EventCard, EventCardSkeleton, type EventCardData } from "./EventCard";
import type { ViewMode } from "./MarketFeedNav";

// Raw Gamma API types (matches the actual Polymarket Gamma API response)
type RawGammaMarket = {
  conditionId?: string;
  condition_id?: string;
  question?: string;
  outcomePrices?: string; // JSON string e.g. '["0.25","0.75"]'
  outcomes?: string;      // JSON string e.g. '["Yes","No"]'
  volume?: string | number;
  liquidity?: string | number;
  active?: boolean;
  closed?: boolean;
  endDate?: string;
  image?: string;
  icon?: string;
};

type RawGammaEvent = {
  id?: number;
  title?: string;
  slug?: string;
  ticker?: string;
  image?: string;
  icon?: string;
  volume?: string | number;
  volume24hr?: string | number;
  liquidity?: string | number;
  endDate?: string;
  markets?: RawGammaMarket[];
  tags?: Array<{ id: string | number; label: string }>;
};

function parsePrice(pricesJson: string | undefined | null, index: number): number {
  if (!pricesJson) return index === 0 ? 50 : 50;
  try {
    const arr: string[] = JSON.parse(pricesJson);
    const v = parseFloat(arr[index] ?? "0.5");
    return Math.round(isNaN(v) ? 50 : v * 100);
  } catch {
    return 50;
  }
}

function parseNum(v: string | number | undefined): number {
  const n = typeof v === "string" ? parseFloat(v) : (typeof v === "number" ? v : NaN);
  return isNaN(n) ? 0 : n;
}

async function gammaEventsFetcher(url: string): Promise<EventCardData[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gamma API error: ${res.status}`);
  const events: RawGammaEvent[] = await res.json();

  return events
    .filter((event) => !!event.title)
    .map((event) => {
      const allMarkets = event.markets ?? [];
      // Show active markets (not closed); keep all if none pass filter
      const activeMarkets = allMarkets.filter((m) => !m.closed);
      const displayMarkets = (activeMarkets.length > 0 ? activeMarkets : allMarkets).slice(0, 5);

      const vol = parseNum(event.volume);
      const volume =
        vol > 0 ? vol : allMarkets.reduce((s, m) => s + parseNum(m.volume), 0);

      return {
        id: event.id ?? 0,
        title: event.title ?? "",
        image: event.image ?? event.icon,
        category: event.tags?.[0]?.label ?? "Other",
        volume,
        close_time: event.endDate ?? allMarkets[0]?.endDate ?? null,
        markets: displayMarkets.map((m) => ({
          question: m.question ?? event.title ?? "",
          yesPrice: parsePrice(m.outcomePrices, 0),
          noPrice: parsePrice(m.outcomePrices, 1),
          conditionId: m.conditionId ?? m.condition_id,
        })),
      } satisfies EventCardData;
    });
}

function buildUrl(tagId: number | null): string {
  const p = new URLSearchParams({
    active: "true",
    closed: "false",
    limit: "30",
    order: "volume",
    ascending: "false",
  });
  if (tagId !== null) {
    p.set("tag_id", String(tagId));
  }
  return `/api/gamma?${p.toString()}`;
}

interface Props {
  viewMode: ViewMode;
  tagId: number | null;
  className?: string;
}

export function MarketFeed({ viewMode, tagId, className }: Props) {
  const url = buildUrl(tagId);
  const { data: events, error, isLoading } = useSWR(url, gammaEventsFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  if (error) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <p className="text-sm text-[var(--muted)]">Failed to load markets. Please try again.</p>
      </div>
    );
  }

  if (isLoading || !events) {
    return (
      <div className={`grid grid-cols-3 gap-3 p-3 content-start ${className}`}>
        {Array.from({ length: 9 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <p className="text-sm text-[var(--muted)]">No markets found for this category.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-3 p-3 content-start ${className}`}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} mode={viewMode} />
      ))}
    </div>
  );
}
