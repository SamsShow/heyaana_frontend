"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trade, proxyFetcher } from "@/lib/api";

interface PriceChartProps {
  trades?: Trade[];
  conditionId?: string;
  isLoading?: boolean;
}

type TimeRange = "1D" | "1W" | "2W" | "ALL";

const RANGE_MS: Record<TimeRange, number> = {
  "1D": 24 * 60 * 60 * 1000,
  "1W": 7 * 24 * 60 * 60 * 1000,
  "2W": 14 * 24 * 60 * 60 * 1000,
  ALL: Infinity,
};

type PriceHistoryPoint = {
  t?: number;
  timestamp?: number;
  time?: number;
  p?: number;
  price?: number;
  yes_price?: number;
  [key: string]: unknown;
};

function getPointPrice(pt: PriceHistoryPoint): number {
  return (pt.p ?? pt.price ?? pt.yes_price ?? 0) as number;
}

function getPointMs(pt: PriceHistoryPoint): number {
  const ts = (pt.t ?? pt.timestamp ?? pt.time ?? 0) as number;
  return ts < 1e12 ? ts * 1000 : ts;
}

function formatTickLabel(ms: number, range: TimeRange): string {
  const d = new Date(ms);
  if (range === "1D") {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  if (range === "ALL") {
    return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildTicks(data: { time: number }[], n = 5): number[] {
  if (data.length < 2) return data.map((d) => d.time);
  const min = data[0].time;
  const max = data[data.length - 1].time;
  return Array.from({ length: n }, (_, i) => Math.round(min + ((max - min) * i) / (n - 1)));
}

export function PriceChart({ trades, conditionId, isLoading }: PriceChartProps) {
  const [range, setRange] = useState<TimeRange>("1W");

  // Always fetch with interval=max (the only interval the backend reliably respects).
  // Client-side filtering below trims the data to the selected time range.
  // fidelity=1440 → one data point per day, keeping response size small.
  const { data: priceHistory, isLoading: historyLoading } = useSWR<unknown>(
    conditionId
      ? `/api/proxy/price/${encodeURIComponent(conditionId)}/history?interval=max&fidelity=1440`
      : null,
    proxyFetcher,
    { revalidateOnFocus: false },
  );

  const chartData = useMemo(() => {
    // Supported API response shapes:
    //   { history: { Yes: [{t, p}], No: [{t, p}] } }
    //   { history: [{t, p}, ...] }
    //   [{t, p}, ...]
    if (priceHistory && typeof priceHistory === "object") {
      type HistoryResp = {
        history?: { Yes?: PriceHistoryPoint[]; No?: PriceHistoryPoint[] } | PriceHistoryPoint[];
      };
      const resp = priceHistory as HistoryResp;

      let rawArray: PriceHistoryPoint[] =
        (resp.history as { Yes?: PriceHistoryPoint[] } | undefined)?.Yes ??
        (resp.history as { No?: PriceHistoryPoint[] } | undefined)?.No ??
        (Array.isArray(resp.history) ? (resp.history as PriceHistoryPoint[]) : null) ??
        (Array.isArray(priceHistory) ? (priceHistory as PriceHistoryPoint[]) : []);

      if (rawArray.length > 0) {
        // Sort ascending by timestamp
        rawArray = [...rawArray].sort((a, b) => getPointMs(a) - getPointMs(b));

        // ── Client-side time range filter ──────────────────────────────────
        // Since the backend always returns full history, slice to the
        // selected window (1D = last 24h, 1W = last 7d, 2W = last 14d, ALL = everything).
        if (range !== "ALL") {
          const cutoffMs = Date.now() - RANGE_MS[range];
          rawArray = rawArray.filter((pt) => getPointMs(pt) >= cutoffMs);
        }

        // ── Detect interleaved Yes + No prices ────────────────────────────
        // In a binary market Yes+No≈1, so interleaved data swings ~100¢ on every step.
        // If the average consecutive normalised diff is > 0.4 it's almost certainly
        // two series mixed together — keep every other element (the higher-valued side).
        if (rawArray.length > 4) {
          let sumDiff = 0;
          for (let i = 1; i < rawArray.length; i++) {
            const p1 = getPointPrice(rawArray[i - 1]);
            const p2 = getPointPrice(rawArray[i]);
            const n1 = p1 > 1 ? p1 / 100 : p1;
            const n2 = p2 > 1 ? p2 / 100 : p2;
            sumDiff += Math.abs(n2 - n1);
          }
          const avgDiff = sumDiff / (rawArray.length - 1);
          if (avgDiff > 0.4) {
            const p0 = getPointPrice(rawArray[0]);
            const p1 = getPointPrice(rawArray[1]);
            const n0 = p0 > 1 ? p0 / 100 : p0;
            const n1b = p1 > 1 ? p1 / 100 : p1;
            const keepEven = n0 >= n1b;
            rawArray = rawArray.filter((_, i) => (keepEven ? i % 2 === 0 : i % 2 === 1));
          }
        }

        return rawArray.map((pt) => {
          const ms = getPointMs(pt);
          const rawPrice = getPointPrice(pt);
          const price = rawPrice <= 1 ? rawPrice * 100 : rawPrice;
          return { time: ms, price: Math.round(price * 10) / 10 };
        });
      }
    }

    // Fallback: derive chart from trade data
    if (!Array.isArray(trades) || trades.length === 0) return [];

    const cutoff = range === "ALL" ? 0 : Date.now() - RANGE_MS[range];
    return trades
      .filter((t) => {
        const ms = t.timestamp ? t.timestamp * 1000 : t.created_time ? new Date(t.created_time).getTime() : 0;
        return ms >= cutoff;
      })
      .sort((a, b) => {
        const msA = a.timestamp ? a.timestamp * 1000 : a.created_time ? new Date(a.created_time).getTime() : 0;
        const msB = b.timestamp ? b.timestamp * 1000 : b.created_time ? new Date(b.created_time).getTime() : 0;
        return msA - msB;
      })
      .map((t) => {
        const ms = t.timestamp ? t.timestamp * 1000 : t.created_time ? new Date(t.created_time).getTime() : 0;
        const rawPrice = t.price ?? t.yes_price ?? 0;
        const price = rawPrice <= 1 ? rawPrice * 100 : rawPrice;
        return { time: ms, price: Math.round(price * 10) / 10 };
      });
  }, [trades, range, priceHistory]);

  const xAxisTicks = useMemo(() => buildTicks(chartData), [chartData]);

  const latestPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : null;
  const firstPrice = chartData.length > 0 ? chartData[0].price : null;
  const isUp = latestPrice !== null && firstPrice !== null && latestPrice >= firstPrice;
  const strokeColor = isUp ? "#10B981" : "#EF4444";

  if (isLoading || historyLoading) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-blue-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="space-y-3">
        <TimeRangeSelector range={range} onChange={setRange} />
        <div className="h-[240px] flex items-center justify-center text-muted text-sm font-mono">
          No price data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TimeRangeSelector range={range} onChange={setRange} />

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              ticks={xAxisTicks}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              axisLine={{ stroke: "var(--border-color)" }}
              tickLine={false}
              tickFormatter={(ms: number) => formatTickLabel(ms, range)}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}¢`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
              formatter={(value: number | undefined) => [`${value ?? 0}¢`, "Price"]}
              labelFormatter={(ms: unknown) => formatTickLabel(ms as number, range)}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 4, fill: strokeColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {latestPrice !== null && (
        <div className="flex justify-end">
          <span
            className="text-sm font-mono font-bold px-3 py-1.5 rounded-full border"
            style={{ color: strokeColor, backgroundColor: `${strokeColor}08`, borderColor: `${strokeColor}20` }}
          >
            {latestPrice}¢
          </span>
        </div>
      )}
    </div>
  );
}

function TimeRangeSelector({
  range,
  onChange,
}: {
  range: TimeRange;
  onChange: (r: TimeRange) => void;
}) {
  const ranges: TimeRange[] = ["1D", "1W", "2W", "ALL"];
  return (
    <div className="pill-tabs w-fit">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`pill-tab ${range === r ? "active" : ""}`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
