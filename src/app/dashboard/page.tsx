"use client";

import { DashboardSidebar, DashboardMobileHeader } from "@/components/dashboard/Sidebar";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { TraderStats } from "@/components/dashboard/TraderStats";
import { ActiveTrades } from "@/components/dashboard/ActiveTrades";
import { RiskControl } from "@/components/dashboard/RiskControl";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AnalysisCard } from "@/components/dashboard/analytics/AnalysisCard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Header */}
      <DashboardMobileHeader />

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0">
        {/* Header */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Trading Dashboard</h1>
              <p className="text-sm text-muted mt-1">
                Monitor your copied trades, analyze performance, and manage risk.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500/20 bg-green-500/5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-green-500">Kalshi Connected</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-primary/20 bg-red-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-primary animate-pulse-red" />
                <span className="text-xs font-mono text-red-primary">AI Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="p-6 space-y-6">
          {/* Stats */}
          <StatsOverview />

          {/* Real-time Market Analysis */}
          <div>
            <h2 className="text-xl font-bold mb-4">Real-time Market Analysis</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AnalysisCard endpointName="win_rate_by_price" />
              <AnalysisCard endpointName="returns_by_hour" />
              <AnalysisCard endpointName="volume_over_time" />
              <AnalysisCard endpointName="maker_taker_gap_over_time" />
              <AnalysisCard endpointName="ev_yes_vs_no" />
              <AnalysisCard endpointName="mispricing_by_price" />
              <AnalysisCard endpointName="longshot_volume_share" />
              <AnalysisCard endpointName="trade_size_by_role" />
              <AnalysisCard endpointName="maker_vs_taker_returns" />
              <AnalysisCard endpointName="maker_returns_by_direction" />
              <AnalysisCard endpointName="maker_win_rate_by_direction" />
              <AnalysisCard endpointName="yes_vs_no_by_price" />
              <AnalysisCard endpointName="maker_taker_returns_by_category" />
              <AnalysisCard endpointName="win_rate_by_trade_size" />
            </div>
          </div>

          {/* Traders & Activity Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <TraderStats />
            </div>
            <ActivityFeed />
          </div>

          {/* Active Trades */}
          <ActiveTrades />

          {/* Risk Control */}
          <RiskControl />
        </div>
      </main>
    </div>
  );
}
