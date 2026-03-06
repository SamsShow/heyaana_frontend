"use client";

import { useState } from "react";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { AnalyticsGrid } from "@/components/dashboard/AnalyticsGrid";
import { MarketSearch } from "@/components/dashboard/MarketSearch";
import { DashboardMixPanel } from "@/components/dashboard/DashboardMixPanel";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const [explorerOpen, setExplorerOpen] = useState(false);

  return (
    <DashboardChrome title="Dashboard">
      <div className="flex h-full overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-6 border-r border-border min-w-0">
          <DashboardSummary />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
            <div className="xl:col-span-2">
              <AnalyticsGrid
                limit={6}
                title="Analytics Preview"
                description="Key chart signals at a glance. Open Analytics for the full 15-chart suite."
              />
            </div>
            <DashboardMixPanel />
          </div>
        </div>

        {/* Market Explorer — collapsible panel */}
        <div className="hidden md:flex shrink-0 relative">
          {/* Toggle tab */}
          <button
            onClick={() => setExplorerOpen((o) => !o)}
            className="absolute -left-7 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-1.5 py-3 rounded-l-lg border border-r-0 border-border bg-surface hover:bg-surface-hover transition-all text-muted hover:text-foreground"
            title={explorerOpen ? "Close Market Explorer" : "Open Market Explorer"}
          >
            {explorerOpen
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Panel */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out border-l border-border ${
              explorerOpen ? "w-[380px] xl:w-[420px]" : "w-0"
            }`}
          >
            <div className="w-[380px] xl:w-[420px] h-full overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Market Explorer</h3>
                  <span className="text-[10px] text-muted font-mono">Search & Trade</span>
                </div>
                <MarketSearch navigateOnSelect />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardChrome>
  );
}
