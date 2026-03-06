"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { WalletConnect } from "@/components/dashboard/WalletConnect";
import { useAuth } from "@/lib/useAuth";
import {
  LayoutDashboard,
  TrendingUp,
  Activity,
  Settings,
  Bell,
  Copy,
  MessageCircle,
  Users,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/analytics", icon: TrendingUp, label: "Analytics" },
  { href: "/dashboard/markets", icon: Activity, label: "Markets" },
  { href: "/dashboard/social", icon: Users, label: "Social" },
];

const bottomItems = [
  { href: "#", icon: Bell, label: "Alerts" },
  { href: "#", icon: MessageCircle, label: "Telegram" },
  { href: "#", icon: Settings, label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-background z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/heyannalogo.png"
            alt="HeyAnna logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-lg font-bold tracking-tight">
            Hey<span className="text-blue-primary">Anna</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3 px-3">
          Trading
        </div>
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive
                ? "bg-red-primary/10 text-red-primary border border-red-primary/20"
                : "text-muted hover:text-foreground hover:bg-surface"
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3 px-3 pt-6">
          System
        </div>
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface transition-all"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
            {item.label === "Alerts" && (
              <span className="ml-auto w-5 h-5 rounded-full bg-red-primary text-white text-[10px] flex items-center justify-center font-mono">
                3
              </span>
            )}
            {item.label === "Telegram" && (
              <span className="ml-auto text-[10px] border border-border rounded px-1.5 py-0.5 text-muted">
                SOON
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-primary/10 text-red-primary flex items-center justify-center text-xs font-bold font-mono">
              {user?.username?.[0]?.toUpperCase() ?? user?.first_name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <div className="text-sm font-medium">{user?.username ?? user?.first_name ?? "User"}</div>
              <div className="text-[10px] text-muted">Connected</div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

const mobileNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/analytics", icon: TrendingUp, label: "Analytics" },
  { href: "/dashboard/markets", icon: Activity, label: "Markets" },
  { href: "/dashboard/social", icon: Users, label: "Social" },
  { href: "/dashboard/copy-trading", icon: Copy, label: "Copy" },
  { href: "/dashboard/profile", icon: Settings, label: "Profile" },
];

export function MobileTopBar() {
  const { logout } = useAuth();

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-12 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/heyannalogo.png"
          alt="HeyAnna logo"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <span className="text-sm font-bold">
          Hey<span className="text-blue-primary">Anna</span>
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <WalletConnect compact />
        <button
          onClick={logout}
          className="inline-flex items-center justify-center rounded-lg border border-border p-1.5 text-muted hover:text-foreground hover:bg-surface transition-all"
          aria-label="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-2xl border border-border bg-background/80 backdrop-blur-xl shadow-lg shadow-black/30">
      {mobileNavItems.map((item) => {
        const isActive = item.href === "/dashboard"
          ? pathname === "/dashboard"
          : item.href.startsWith("/dashboard")
            ? pathname === item.href || pathname.startsWith(`${item.href}/`)
            : false;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3.5 py-1.5 rounded-xl transition-all ${isActive ? "bg-surface text-foreground" : "text-muted hover:text-foreground"
              }`}
          >
            <item.icon className={`w-5 h-5 ${isActive ? "text-blue-primary" : ""}`} />
            <span className="text-[9px] font-mono">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** @deprecated Use MobileTopBar + MobileBottomNav instead */
export function DashboardMobileHeader() {
  return <MobileTopBar />;
}
