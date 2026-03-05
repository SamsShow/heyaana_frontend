"use client";

import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { AnalyticsGrid } from "@/components/dashboard/AnalyticsGrid";
import { MarketSearch } from "@/components/dashboard/MarketSearch";
import { DashboardMixPanel } from "@/components/dashboard/DashboardMixPanel";

export default function DashboardPage() {
  return (
    <DashboardChrome title="Dashboard">
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-6 border-r border-border">
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

        <div className="hidden md:flex md:flex-col w-[380px] xl:w-[420px] shrink-0 overflow-y-auto" id="markets">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Market Explorer</h3>
              <span className="text-[10px] text-muted font-mono">Search & Trade</span>
            </div>
            <MarketSearch navigateOnSelect />
          </div>
        </div>
      </div>
    </DashboardChrome>
  );
}
