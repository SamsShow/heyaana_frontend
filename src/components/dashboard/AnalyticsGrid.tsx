"use client";

import { ANALYSIS_ENDPOINTS } from "@/lib/api";
import { AnalysisCard } from "@/components/dashboard/analytics/AnalysisCard";

export function AnalyticsGrid() {
    return (
        <section id="analytics" className="space-y-4">
            <div>
                <h2 className="text-lg font-bold tracking-tight">Market Analytics</h2>
                <p className="text-xs text-muted font-mono mt-1">
                    15 real-time analyses powered by prediction market data
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {ANALYSIS_ENDPOINTS.map((endpoint) => (
                    <AnalysisCard key={endpoint} endpointName={endpoint} />
                ))}
            </div>
        </section>
    );
}
