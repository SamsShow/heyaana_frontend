"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { DashboardMixPanel } from "@/components/dashboard/DashboardMixPanel";
import { proxyFetcher } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { ShieldAlert, X, ArrowRight, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const [warnDismissed, setWarnDismissed] = useState(false);
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
      <div className="p-4 md:p-6 space-y-8 max-w-[1400px] mx-auto">
        {/* Approval warning banner */}
        {showApprovalWarning && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 dashboard-card">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-300">
                Trades not approved yet
              </p>
              <p className="text-xs text-amber-400/70 mt-0.5 leading-relaxed">
                You need to approve Polymarket trading allowances before placing
                trades. This requires a small amount of{" "}
                <span className="font-semibold text-amber-300">POL</span> for
                gas fees on Polygon.
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

        {/* Stats + Promo */}
        <DashboardSummary />

        {/* Activity / Operations */}
        <DashboardMixPanel />

        {/* Analytics link card */}
        <Link
          href="/dashboard/analytics"
          className="dashboard-card flex items-center justify-between p-5 group hover:border-[var(--blue-primary)]/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--blue-primary)]/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[var(--blue-primary)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                View Full Analytics
              </p>
              <p className="text-xs text-[var(--muted)]">
                15 chart signals &amp; deep market insights
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--blue-primary)] transition-colors" />
        </Link>
      </div>
    </DashboardChrome>
  );
}
