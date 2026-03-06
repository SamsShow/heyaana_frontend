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
  marketId?: number;
  isLoading?: boolean;
}

type TimeRange = "1D" | "1W" | "2W" | "ALL";

const RANGE_MS: Record<TimeRange, number> = {
  "1D": 24 * 60 * 60 * 1000,
  "1W": 7 * 24 * 60 * 60 * 1000,
  "2W": 14 * 24 * 60 * 60 * 1000,
  ALL: Infinity,
};

const RANGE_INTERVAL: Record<TimeRange, string> = {
  "1D": "1h",
  "1W": "6h",
  "2W": "1d",
  ALL: "1w",
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

export function PriceChart({ trades, marketId, isLoading }: PriceChartProps) {
  const [range, setRange] = useState<TimeRange>("1W");

  // Fetch from price history API if marketId is provided
  const { data: priceHistory, isLoading: historyLoading } = useSWR<unknown>(
    marketId
      ? `/api/proxy/price/${marketId}/history?interval=${RANGE_INTERVAL[range]}`
      : null,
    proxyFetcher,
    { revalidateOnFocus: false },
  );

  const chartData = useMemo(() => {
    // Prefer price history API data if available
    if (priceHistory) {
      const historyArray: PriceHistoryPoint[] = Array.isArray(priceHistory)
        ? priceHistory
        : typeof priceHistory === "object" && priceHistory !== null
          ? (Object.values(priceHistory).find(Array.isArray) as PriceHistoryPoint[] | undefined) ?? []
          : [];

      if (historyArray.length > 0) {
        return historyArray.map((pt) => {
          const ts = pt.t ?? pt.timestamp ?? pt.time ?? 0;
          const price = pt.p ?? pt.price ?? pt.yes_price ?? 0;
          return {
            time: typeof ts === "number" && ts < 1e12 ? ts * 1000 : ts,
            price: typeof price === "number" ? price : 0,
            label: new Date(typeof ts === "number" && ts < 1e12 ? ts * 1000 : ts).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
          };
        });
      }
    }

    // Fallback: derive from trade data
    if (!Array.isArray(trades) || trades.length === 0) return [];

    const now = Date.now();
    const cutoff = now - RANGE_MS[range];

    const filtered = trades
      .filter((t) => new Date(t.created_time).getTime() >= cutoff)
      .sort(
        (a, b) =>
          new Date(a.created_time).getTime() -
          new Date(b.created_time).getTime(),
      );

    return filtered.map((t) => ({
      time: new Date(t.created_time).getTime(),
      price: t.yes_price,
      label: new Date(t.created_time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [trades, range, priceHistory]);

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
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              axisLine={{ stroke: "var(--border-color)" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
              formatter={(value: number | undefined) => [`${value ?? 0}¢`, "Yes Price"]}
              labelFormatter={(label: React.ReactNode) => String(label)}
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

      {/* Latest price badge */}
      {latestPrice !== null && (
        <div className="flex justify-end">
          <span
            className="text-sm font-mono font-bold px-2 py-1 rounded"
            style={{ color: strokeColor, backgroundColor: `${strokeColor}15` }}
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
    <div className="flex items-center gap-1">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
            range === r
              ? "bg-surface-hover text-foreground border border-border"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
