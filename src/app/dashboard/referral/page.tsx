"use client";

import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { Gift } from "lucide-react";

export default function ReferralPage() {
  return (
    <DashboardChrome title="Referral">
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center">
            <Gift className="w-7 h-7 text-muted" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Coming Soon</h2>
            <p className="text-sm text-muted mt-1 max-w-xs">The referral program is under construction. Check back soon.</p>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full border border-border text-muted uppercase tracking-widest">
            In Progress
          </span>
        </div>
      </div>
    </DashboardChrome>
  );
}
