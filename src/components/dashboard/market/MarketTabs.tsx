"use client";

import { useState } from "react";
import { Market, Trade } from "@/lib/api";
import { ActivityFeed } from "./ActivityFeed";
import { OrderbookView } from "./OrderbookView";
import { BarChart3, Activity, Users } from "lucide-react";

interface MarketTabsProps {
  market: Market;
  trades: Trade[];
  tradesLoading?: boolean;
}

type TabId = "activity" | "orderbook" | "holders";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "activity", label: "Activity", icon: Activity },
  { id: "orderbook", label: "Orderbook", icon: BarChart3 },
  { id: "holders", label: "Top Holders", icon: Users },
];

export function MarketTabs({ market, trades, tradesLoading }: MarketTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("activity");

  return (
    <div>
      {/* Tab headers */}
      <div className="flex items-center gap-0 border-b border-border mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm transition-all border-b-2 -mb-px ${
                isActive
                  ? "border-blue-primary text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {activeTab === "activity" && (
          <ActivityFeed trades={trades} isLoading={tradesLoading} />
        )}
        {activeTab === "orderbook" && <OrderbookView market={market} />}
        {activeTab === "holders" && (
          <div className="flex flex-col items-center justify-center py-12 text-muted">
            <Users className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-sm font-mono">Top Holders</p>
            <p className="text-xs font-mono mt-1 opacity-50">Coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
