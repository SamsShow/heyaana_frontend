"use client";

import { DashboardChrome } from "@/components/dashboard/DashboardChrome";

export default function ReferralPage() {
  return (
    <DashboardChrome title="Referral">
      <div className="p-3 md:p-4">
        <div className="max-w-3xl mx-auto border border-border rounded-xl bg-surface/20 p-6 md:p-8">
          <h2 className="text-xl font-bold">Referral Program</h2>
          <p className="text-sm text-muted mt-2">
            Referral dashboard is being wired to backend endpoints. This route is now live and ready for integration.
          </p>
        </div>
      </div>
    </DashboardChrome>
  );
}
