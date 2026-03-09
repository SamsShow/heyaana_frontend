"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import {
  Home,
  BarChart2,
  Activity,
  Gift,
  User,
  LogOut,
  Users,
  Bell,
  Settings,
  Loader2,
} from "lucide-react";
import { UserBadge } from "@/components/dashboard/WalletConnect";
import { MobileTopBar, MobileBottomNav } from "@/components/dashboard/Sidebar";
import { useAuth } from "@/lib/useAuth";
import { proxyFetcher } from "@/lib/api";

interface DashboardChromeProps {
  title: string;
  children: React.ReactNode;
}

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Activity, label: "Markets", href: "/dashboard/markets" },
  { icon: Users, label: "Social", href: "/dashboard/social" },
  { icon: Gift, label: "Referral", href: "/dashboard/referral" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatMoney(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "--";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function HeaderStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const valueClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
        ? "text-red-400"
        : "text-foreground";

  return (
    <div className="rounded-lg border border-border/70 bg-white/[0.03] px-2.5 py-1.5 min-w-[98px]">
      <p className="text-[10px] font-mono text-muted uppercase tracking-wide leading-none">
        {label}
      </p>
      <p className={`text-xs font-semibold mt-1 leading-none ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

export function DashboardChrome({ title, children }: DashboardChromeProps) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, hasSessionToken, isValidating, error } = useAuth();

  const showSessionSync = hasSessionToken && isValidating;
  const showSessionOffline = hasSessionToken && !!error;

  const { data: balanceData } = useSWR<Record<string, unknown>>(
    isAuthenticated ? "/api/proxy/me/balance" : null,
    proxyFetcher,
    { revalidateOnFocus: true, refreshInterval: 30000 },
  );

  const { data: portfolioData } = useSWR<Record<string, unknown>>(
    isAuthenticated ? "/api/proxy/me/portfolio" : null,
    proxyFetcher,
    { revalidateOnFocus: true, refreshInterval: 30000 },
  );

  const totalBalance = (() => {
    const direct = balanceData?.total_usd;
    if (typeof direct === "number") return direct;
    const nested = (portfolioData?.balance as { total_usd?: unknown } | undefined)?.total_usd;
    return typeof nested === "number" ? nested : null;
  })();

  const totalPnl = (() => {
    const topLevel = portfolioData?.total_pnl;
    if (typeof topLevel === "number") return topLevel;
    const nested = (portfolioData?.totals as { total_pnl?: unknown } | undefined)?.total_pnl;
    return typeof nested === "number" ? nested : null;
  })();

  return (
    <div className="dashboard-layout flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex w-[200px] shrink-0 border-r border-border flex-col bg-[#0D0D14]">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 px-5 py-6 border-b border-border"
        >
          <Image
            src="/heyannalogo.png"
            alt="HeyAnna"
            width={28}
            height={28}
            className="w-7 h-7"
          />
          <span className="text-[15px] font-bold tracking-tight text-foreground">
            Hey<span className="text-blue-primary">Anna</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-5 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] font-medium text-muted uppercase tracking-widest mb-3 px-3">
            Trading
          </div>
          {navItems.slice(0, 4).map((item) => {
            const active = isItemActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-[13px] transition-all rounded-xl group relative ${
                  active
                    ? "text-foreground bg-white/[0.04]"
                    : "text-muted hover:text-foreground hover:bg-white/[0.03]"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-primary" />
                )}
                <item.icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    active ? "text-blue-primary" : ""
                  }`}
                />
                {item.label}
              </Link>
            );
          })}

          <div className="text-[10px] font-medium text-muted uppercase tracking-widest mb-3 px-3 pt-6">
            Account
          </div>
          {navItems.slice(4).map((item) => {
            const active = isItemActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-[13px] transition-all rounded-xl group relative ${
                  active
                    ? "text-foreground bg-white/[0.04]"
                    : "text-muted hover:text-foreground hover:bg-white/[0.03]"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-primary" />
                )}
                <item.icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    active ? "text-blue-primary" : ""
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-primary/15 text-blue-primary flex items-center justify-center text-xs font-bold shrink-0">
              {user?.username?.[0]?.toUpperCase() ??
                user?.first_name?.[0]?.toUpperCase() ??
                "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium truncate text-foreground">
                {user?.username ?? user?.first_name ?? "User"}
              </div>
              <div className="text-[10px] text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Connected
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/[0.04] transition-all"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileTopBar />
        <MobileBottomNav />

        {/* Desktop header */}
        <header className="hidden lg:flex h-[56px] border-b border-border items-center justify-between px-6 shrink-0 bg-[#0D0D14]/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold text-foreground">
              {title}
            </h1>
            {isAuthenticated && (
              <div className="hidden xl:flex items-center gap-2 ml-2">
                <HeaderStat label="Balance" value={formatMoney(totalBalance)} />
                <HeaderStat
                  label="PnL"
                  value={
                    totalPnl === null || !Number.isFinite(totalPnl)
                      ? "--"
                      : `${totalPnl >= 0 ? "+" : ""}${formatMoney(totalPnl)}`
                  }
                  tone={
                    totalPnl === null
                      ? "neutral"
                      : totalPnl >= 0
                        ? "positive"
                        : "negative"
                  }
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {showSessionSync && (
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-primary/25 bg-blue-primary/10 text-blue-300 text-[10px] font-mono">
                <Loader2 className="w-3 h-3 animate-spin" />
                Session reconnecting...
              </div>
            )}
            {showSessionOffline && !showSessionSync && (
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-300 text-[10px] font-mono">
                Session unstable
              </div>
            )}
            <button className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.04] transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-primary" />
            </button>

            <button className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.04] transition-all">
              <Settings className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            <UserBadge />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pt-12 pb-24 lg:pt-0 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
