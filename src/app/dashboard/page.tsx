"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { MarketFeedNav, type ViewMode } from "@/components/dashboard/MarketFeedNav";
import { MarketFeed } from "@/components/dashboard/MarketFeed";
import { StatsSidebar, StatsMobileStrip } from "@/components/dashboard/StatsSidebar";
import { proxyFetcher } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { ShieldAlert, X } from "lucide-react";

export default function DashboardPage() {
  const [warnDismissed, setWarnDismissed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("events");
  const [tagId, setTagId] = useState<number | null>(null);

  const { isAuthenticated } = useAuth();

  const { data: statusData } = useSWR<{ polymarket_approved?: boolean }>(
    isAuthenticated ? "/api/proxy/me/status" : null,
    proxyFetcher,
    { revalidateOnFocus: false },
  );

  const showApprovalWarning =
    isAuthenticated &&
    statusData &&
    statusData.polymarket_approved === false &&
    !warnDismissed;

  return (
    <DashboardChrome title="Dashboard">
      <div className="flex flex-col h-full w-full overflow-x-hidden overflow-y-hidden">
        {/* Approval warning banner */}
        {showApprovalWarning && (
          <div className="flex items-start gap-3 p-3 mx-3 mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-300">Trades not approved yet</p>
              <p className="text-xs text-amber-400/70 mt-0.5 leading-relaxed">
                You need to approve Polymarket trading allowances before placing trades.
              </p>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors"
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

        {/* Mobile stats strip */}
        <StatsMobileStrip />

        {/* Category nav */}
        <MarketFeedNav
          viewMode={viewMode}
          setViewMode={setViewMode}
          tagId={tagId}
          setTagId={setTagId}
        />

        {/* Main content: feed + sidebar */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Market cards grid */}
          <MarketFeed
            viewMode={viewMode}
            tagId={tagId}
            className="flex-1 overflow-y-auto"
          />

          {/* Right stats sidebar — desktop only */}
          <div className="hidden lg:flex w-[300px] flex-shrink-0 border-l border-[var(--border-color)] overflow-y-auto flex-col">
            <StatsSidebar className="h-full" />
          </div>
        </div>
      </div>
    </DashboardChrome>
  );
}
