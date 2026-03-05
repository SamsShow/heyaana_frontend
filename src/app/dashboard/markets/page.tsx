"use client";

import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { MarketSearch } from "@/components/dashboard/MarketSearch";

export default function MarketsPage() {
  return (
    <DashboardChrome title="Markets">
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Market Explorer</h2>
            <p className="text-sm text-muted mt-1">
              Browse prediction markets and place trades
            </p>
          </div>

          <MarketSearch navigateOnSelect />
        </div>
      </div>
    </DashboardChrome>
  );
}
