"use client";

import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { CopyTrading } from "@/components/dashboard/CopyTrading";

export default function CopyTradingPage() {
  return (
    <DashboardChrome title="Copy Trading">
      <div className="p-3 md:p-4">
        <div className="max-w-2xl mx-auto">
          <CopyTrading />
        </div>
      </div>
    </DashboardChrome>
  );
}
