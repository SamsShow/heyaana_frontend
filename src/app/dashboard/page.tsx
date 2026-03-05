"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  BarChart2,
  Activity,
  Gift,
  User,
  ArrowRight,
} from "lucide-react";
import { MobileTopBar, MobileBottomNav } from "@/components/dashboard/Sidebar";
import { WalletConnect } from "@/components/dashboard/WalletConnect";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { AnalyticsGrid } from "@/components/dashboard/AnalyticsGrid";
import { MarketSearch } from "@/components/dashboard/MarketSearch";
import { MarketDetail } from "@/components/dashboard/MarketDetail";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard", active: true },
  { icon: BarChart2, label: "Analytics", href: "/dashboard#analytics" },
  { icon: Activity, label: "Markets", href: "/dashboard#markets" },
  { icon: Gift, label: "Referral", href: "/dashboard/referral" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

export default function DashboardPage() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex w-[176px] shrink-0 border-r border-border flex-col py-5 overflow-hidden">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-7 px-4">
          <Image src="/heyannalogo.png" alt="HeyAnna" width={32} height={32} className="w-8 h-8" />
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-all rounded-lg ${
                item.active
                  ? "bg-surface text-foreground"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-primary/20 text-blue-primary flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
              SS
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">Sam</div>
              <div className="text-[9px] text-muted font-mono">Connected</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Mobile top bar ── */}
        <MobileTopBar />

        {/* ── Mobile bottom nav ── */}
        <MobileBottomNav />

        {/* ── Top bar (desktop) ── */}
        <header className="hidden lg:flex h-[52px] border-b border-border items-center justify-between px-5 shrink-0">
          <Image src="/heyannalogo.png" alt="HeyAnna" width={26} height={26} className="opacity-70" />

          {/* Portfolio center */}
          <div className="text-center">
            <div className="text-[9px] text-muted font-mono uppercase tracking-widest">Portfolio</div>
            <div className="text-base font-bold font-mono leading-tight">Analytics</div>
            <Link
              href="#analytics"
              className="text-[10px] text-blue-primary hover:text-blue-light transition-colors flex items-center gap-0.5 justify-center"
            >
              View Insights <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          {/* Right actions */}
          <WalletConnect />
        </header>

        {/* ── Content: two-column layout ── */}
        <div className="flex-1 flex overflow-hidden pt-12 pb-24 lg:pt-0 lg:pb-0">

          {/* ── Left panel — Summary + Analytics ── */}
          <div className="flex-1 lg:flex-[3] overflow-y-auto p-3 md:p-4 space-y-6 border-r border-border">
            {/* Dashboard summary */}
            <DashboardSummary />

            {/* Analytics grid */}
            <div id="analytics">
              <AnalyticsGrid />
            </div>
          </div>

          {/* ── Right panel — Market Explorer ── */}
          <div className="hidden md:flex md:flex-col w-[380px] xl:w-[420px] shrink-0 overflow-y-auto" id="markets">
            {/* Market search */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Market Explorer</h3>
                <span className="text-[10px] text-muted font-mono">Search & Trade</span>
              </div>
              <MarketSearch
                onSelectMarket={setSelectedTicker}
                selectedTicker={selectedTicker ?? undefined}
              />
            </div>

            {/* Market detail */}
            <div className="flex-1 overflow-y-auto">
              {selectedTicker ? (
                <MarketDetail
                  ticker={selectedTicker}
                  onClose={() => setSelectedTicker(null)}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center text-muted px-4">
                    <p className="text-sm font-mono">Select a market</p>
                    <p className="text-xs font-mono mt-1 opacity-50">
                      Search and click a market above
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
