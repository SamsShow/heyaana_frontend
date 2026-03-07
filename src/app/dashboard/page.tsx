"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { AnalyticsGrid } from "@/components/dashboard/AnalyticsGrid";
import { MarketSearch } from "@/components/dashboard/MarketSearch";
import { DashboardMixPanel } from "@/components/dashboard/DashboardMixPanel";
import { proxyFetcher } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { ChevronLeft, ChevronRight, ShieldAlert, X } from "lucide-react";

export default function DashboardPage() {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [warnDismissed, setWarnDismissed] = useState(false);
  const { isAuthenticated } = useAuth();

  const { data: statusData } = useSWR<{ polymarket_approved?: boolean }>(
    isAuthenticated ? "/api/proxy/me/status" : null,
    proxyFetcher,
    { revalidateOnFocus: false },
  );

  const showApprovalWarning = isAuthenticated && statusData && statusData.polymarket_approved === false && !warnDismissed;

  return (
    <DashboardChrome title="Dashboard">
      <div className="flex h-full overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-6 border-r border-border min-w-0">

          {/* Approval warning banner */}
          {showApprovalWarning && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-300">Trades not approved yet</p>
                <p className="text-xs text-amber-400/70 mt-0.5 leading-relaxed">
                  You need to approve Polymarket trading allowances before placing trades. This requires a small amount of <span className="font-semibold text-amber-300">POL</span> for gas fees on Polygon.
                </p>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors"
                >
                  Go to Profile → Approve Trades
                </Link>
              </div>
              <button
                onClick={() => setWarnDismissed(true)}
                className="shrink-0 text-amber-400/50 hover:text-amber-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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
