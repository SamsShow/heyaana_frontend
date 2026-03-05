"use client";

import { ANALYSIS_ENDPOINTS } from "@/lib/api";
import { AnalysisCard } from "@/components/dashboard/analytics/AnalysisCard";

interface AnalyticsGridProps {
    limit?: number;
    title?: string;
    description?: string;
}

export function AnalyticsGrid({
    limit,
    title = "Market Analytics",
    description = "15 real-time analyses powered by prediction market data",
}: AnalyticsGridProps) {
    const endpoints = typeof limit === "number"
        ? ANALYSIS_ENDPOINTS.slice(0, limit)
        : ANALYSIS_ENDPOINTS;

    return (
        <section id="analytics" className="space-y-4">
            <div>
                <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                <p className="text-xs text-muted font-mono mt-1">
                    {description}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {endpoints.map((endpoint) => (
                    <AnalysisCard key={endpoint} endpointName={endpoint} />
                ))}
            </div>
        </section>
    );
}
