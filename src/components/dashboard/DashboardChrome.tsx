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
  TrendingUp,
  Bell,
  Settings,
  Loader2,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  Share2,
  Send,
  Sun,
  AlignJustify,
  X,
  Star,
} from "lucide-react";
import { UserBadge } from "@/components/dashboard/WalletConnect";
import { MobileTopBar, MobileBottomNav } from "@/components/dashboard/Sidebar";
import { DepositModal } from "@/components/dashboard/DepositModal";
import { WithdrawModal } from "@/components/dashboard/WithdrawModal";
import { TransferToSafeModal } from "@/components/dashboard/TransferToSafeModal";
import { CommandPalette, useCommandPaletteShortcut } from "@/components/dashboard/CommandPalette";
import { useAuth } from "@/lib/useAuth";
import { proxyFetcher } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface DashboardChromeProps {
  title: string;
  children: React.ReactNode;
}

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics" },
  { icon: BarChart2, label: "My Stats", href: "/dashboard/user-analytics" },
  { icon: Activity, label: "Markets", href: "/dashboard/markets" },
  { icon: Star, label: "Watchlist", href: "/dashboard/watchlist" },
  { icon: TrendingUp, label: "Trades", href: "/dashboard/social" },
  { icon: Users, label: "Traders", href: "/dashboard/traders" },
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

// ── Hamburger menu ──────────────────────────────────────────────

type MenuItem =
  | { type: "divider" }
  | {
      type?: undefined;
      icon: React.FC<{ className?: string }>;
      label: string;
      href?: string;
      onClick?: () => void;
      danger?: boolean;
      disabled?: boolean;
      badge?: string;
    };

function HamburgerMenu({ onLogout, onDeposit, onWithdraw, onTransferToSafe }: { onLogout: () => void; onDeposit: () => void; onWithdraw: () => void; onTransferToSafe: () => void }) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || portalRef.current?.contains(t)) return;
      setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function openMenu() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen(p => !p);
  }

  function handleShare() {
    navigator.share?.({ url: window.location.href, title: "HeyAnna" }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
    });
    setOpen(false);
  }

  const items: MenuItem[] = [
    { icon: ArrowDownToLine, label: "Deposit", onClick: () => { setOpen(false); onDeposit(); } },
    { icon: ArrowUpFromLine, label: "Withdraw", onClick: () => { setOpen(false); onWithdraw(); } },
    { icon: ArrowRightLeft, label: "Transfer to Safe", onClick: () => { setOpen(false); onTransferToSafe(); } },
    { icon: Share2, label: "Share", onClick: handleShare },
    { icon: Send, label: "Join Community", onClick: () => { window.open("https://t.me/+i9D5bDox8lNmNDk9", "_blank"); setOpen(false); } },
    { type: "divider" },
    { icon: Sun, label: "Light Mode", onClick: () => setOpen(false), disabled: true, badge: "Soon" },
    { icon: Settings, label: "Settings", href: "/dashboard/profile", onClick: () => setOpen(false) },
    { type: "divider" },
    { icon: LogOut, label: "Logout", onClick: () => { onLogout(); setOpen(false); }, danger: true },
  ];

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={openMenu}
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
          open
            ? "border-blue-primary/40 bg-blue-primary/10 text-blue-primary"
            : "border-border text-muted hover:text-foreground hover:bg-white/[0.04]"
        }`}
        aria-label="Menu"
      >
        {open ? <X className="w-4 h-4" /> : <AlignJustify className="w-4 h-4" />}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={portalRef}
          className="fixed w-52 py-1.5 rounded-2xl shadow-2xl border border-white/[0.08]"
          style={{ top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999, background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, #111118 30%, #0E0E15 100%)" }}
        >
          {items.map((item, i) => {
            if (item.type === "divider") {
              return <div key={i} className="h-px bg-border/50 my-1.5" />;
            }
            const Icon = item.icon;
            const inner = (
              <>
                <Icon className={`w-4 h-4 shrink-0 ${item.danger ? "text-red-400" : "text-muted"}`} />
                <span className={`flex-1 text-sm ${item.danger ? "text-red-400" : "text-foreground/90"}`}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    {item.badge}
                  </span>
                )}
              </>
            );
            const cls = `w-full flex items-center gap-3 px-4 py-2.5 transition-all ${
              item.disabled ? "opacity-40 cursor-not-allowed" : item.danger ? "hover:bg-red-500/10" : "hover:bg-white/[0.04]"
            }`;
            if (item.href) {
              return <Link key={i} href={item.href} className={cls} onClick={item.onClick}>{inner}</Link>;
            }
            return (
              <button key={i} className={cls} onClick={item.disabled ? undefined : item.onClick} disabled={item.disabled}>
                {inner}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

export function DashboardChrome({ title, children }: DashboardChromeProps) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, hasSessionToken, isValidating, error } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTransferToSafe, setShowTransferToSafe] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useCommandPaletteShortcut(showCommandPalette, setShowCommandPalette);

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
          {navItems.slice(0, 5).map((item) => {
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
          {navItems.slice(5).map((item) => {
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
      <div className="flex-1 flex flex-col min-h-0">
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

          <div className="flex items-center gap-2">
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

            <Link href="/dashboard/social?tab=copy" className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.04] transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-primary" />
            </Link>

            <div className="w-px h-5 bg-border mx-1" />

            <UserBadge />

            <HamburgerMenu onLogout={logout} onDeposit={() => setShowDeposit(true)} onWithdraw={() => setShowWithdraw(true)} onTransferToSafe={() => setShowTransferToSafe(true)} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pt-12 pb-24 lg:pt-0 lg:pb-0">
          {children}
        </main>
      </div>

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}
      {showTransferToSafe && <TransferToSafeModal onClose={() => setShowTransferToSafe(false)} />}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onDeposit={() => setShowDeposit(true)}
          onWithdraw={() => setShowWithdraw(true)}
          onTransferToSafe={() => setShowTransferToSafe(true)}
        />
      )}
    </div>
  );
}
