"use client";

import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { AnalyticsGrid } from "@/components/dashboard/AnalyticsGrid";

export default function AnalyticsPage() {
  return (
    <DashboardChrome title="Analytics">
      <div className="p-3 md:p-4 space-y-6">
        <DashboardSummary />
        <AnalyticsGrid />
      </div>
    </DashboardChrome>
  );
}
