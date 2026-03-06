"use client";

import useSWR from "swr";
import { fetcher, AnalysisResponse } from "@/lib/api";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area
} from "recharts";
import { Loader2 } from "lucide-react";

interface AnalysisCardProps {
    endpointName: string;
    className?: string;
}

// Generate colors if none provided
const DEFAULT_COLORS = ["#DC2626", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6"];

export function AnalysisCard({ endpointName, className = "" }: AnalysisCardProps) {
    const { data, error, isLoading } = useSWR<AnalysisResponse>(
        `/analysis/${endpointName}`,
        fetcher,
        { errorRetryCount: 0 }
    );

    if (isLoading) {
        return (
            <div className={`terminal-card p-6 h-[400px] flex items-center justify-center ${className}`}>
                <div className="flex flex-col items-center gap-2 text-muted">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm font-mono">Loading data...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className={`terminal-card p-6 h-[400px] flex items-center justify-center ${className}`}>
                <div className="flex flex-col items-center gap-2 text-red-500">
                    <p className="text-sm font-mono text-center">Failed to load analysis.</p>
                </div>
            </div>
        );
    }

    const { chart, name, description } = data;

    if (!chart || !chart.data || chart.data.length === 0) {
        return (
            <div className={`terminal-card p-6 h-[400px] flex items-center justify-center ${className}`}>
                <div className="flex flex-col items-center gap-2 text-muted">
                    <h3 className="text-lg font-semibold text-foreground">{chart?.title || name}</h3>
                    <p className="text-sm font-mono text-center">No chart data available.</p>
                </div>
            </div>
        );
    }

    const yFormatter = (val: number) => {
        if (chart.yUnit === "percent") {
            return `${val}%`;
        }
        if (chart.yUnit === "cents") {
            return `${val}¢`;
        }
        if (chart.yUnit === "usd") {
            return `$${val}`;
        }
        return val.toString();
    };

    const renderChart = () => {
        switch (chart.type) {
            case "line":
                return (
                    <LineChart data={chart.data} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                            dataKey={chart.xKey}
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--border-color)" }}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--border-color)" }}
                            tickFormatter={yFormatter}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--surface)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                            }}
                            formatter={(value: any, name: string | undefined) => [
                                yFormatter(Number(value)),
                                name,
                            ]}
                            labelFormatter={(label) => `${chart.xLabel || chart.xKey}: ${label}`}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                        {chart.yKeys.map((key, i) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={chart.colors?.[key] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                                strokeWidth={2}
                                dot={false}
                                strokeDasharray={chart.strokeDasharrays?.[i] || undefined}
                            />
                        ))}
                    </LineChart>
                );

            case "bar":
                return (
                    <BarChart data={chart.data} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                            dataKey={chart.xKey}
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--border-color)" }}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--border-color)" }}
                            tickFormatter={yFormatter}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--surface)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                            }}
                            formatter={(value: any, name: string | undefined) => [
                                yFormatter(Number(value)),
                                name,
                            ]}
                            labelFormatter={(label) => `${chart.xLabel || chart.xKey}: ${label}`}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                        {chart.yKeys.map((key, i) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={chart.colors?.[key] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                );
            case "area":
                return (
                    <AreaChart data={chart.data} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                            dataKey={chart.xKey}
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--border-color)" }}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--border-color)" }}
                            tickFormatter={yFormatter}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--surface)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                            }}
                            formatter={(value: any, name: string | undefined) => [
                                yFormatter(Number(value)),
                                name,
                            ]}
                            labelFormatter={(label) => `${chart.xLabel || chart.xKey}: ${label}`}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                        {chart.yKeys.map((key, i) => (
                            <Area
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={chart.colors?.[key] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                                fill={chart.colors?.[key] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                        ))}
                    </AreaChart>
                );
            case "stacked-area-100":
                return (
                    <AreaChart data={chart.data} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                            dataKey={chart.xKey}
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--border-color)" }}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--border-color)" }}
                            tickFormatter={yFormatter}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--surface)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                            }}
                            formatter={(value: any, name: string | undefined) => [
                                yFormatter(Number(value)),
                                name,
                            ]}
                            labelFormatter={(label) => `${chart.xLabel || chart.xKey}: ${label}`}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                        {chart.yKeys.map((key, i) => (
                            <Area
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stackId="1"
                                stroke={chart.colors?.[key] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                                fill={chart.colors?.[key] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                                fillOpacity={1}
                                strokeWidth={2}
                            />
                        ))}
                    </AreaChart>
                );
            case "stacked-bar-100":
                return (
                    <BarChart data={chart.data} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                            dataKey={chart.xKey}
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--border-color)" }}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--border-color)" }}
                            tickFormatter={yFormatter}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--surface)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                            }}
                            formatter={(value: any, name: string | undefined) => [
                                yFormatter(Number(value)),
                                name,
                            ]}
                            labelFormatter={(label) => `${chart.xLabel || chart.xKey}: ${label}`}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                        {chart.yKeys.map((key, i) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                stackId="1"
                                fill={chart.colors?.[key] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                            />
                        ))}
                    </BarChart>
                );
            default:
                return (
                    <div className="flex h-full items-center justify-center text-muted font-mono text-sm">
                        Unsupported chart type: {chart.type}
                    </div>
                );
        }
    };

    return (
        <div className={`terminal-card p-6 flex flex-col h-[400px] ${className}`}>
            <div className="mb-6 shrink-0">
                <h3 className="text-lg font-semibold">{chart.title || name}</h3>
                <p className="text-xs text-muted mt-1">{description}</p>
            </div>

            <div className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
                {chart.xLabel && (
                    <div className="absolute bottom-[-16px] left-0 w-full text-center text-[10px] text-muted font-mono">
                        {chart.xLabel}
                    </div>
                )}
                {chart.yLabel && (
                    <div className="absolute top-1/2 left-[-20px] -translate-y-1/2 -rotate-90 origin-center text-[10px] text-muted font-mono whitespace-nowrap">
                        {chart.yLabel}
                    </div>
                )}
            </div>
        </div>
    );
}
