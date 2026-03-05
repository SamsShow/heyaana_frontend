"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Activity, Gift, User, ArrowRight, LogOut, Copy } from "lucide-react";
import { UserBadge } from "@/components/dashboard/WalletConnect";
import { MobileTopBar, MobileBottomNav } from "@/components/dashboard/Sidebar";
import { useAuth } from "@/lib/useAuth";

interface DashboardChromeProps {
  title: string;
  children: React.ReactNode;
}

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Activity, label: "Markets", href: "/dashboard/markets" },
  { icon: Copy, label: "Copy Trade", href: "/dashboard/copy-trading" },
  { icon: Gift, label: "Referral", href: "/dashboard/referral" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardChrome({ title, children }: DashboardChromeProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden lg:flex w-[176px] shrink-0 border-r border-border flex-col py-5 overflow-hidden">
        <Link href="/" className="flex items-center justify-center mb-7 px-4">
          <Image src="/heyannalogo.png" alt="HeyAnna" width={32} height={32} className="w-8 h-8" />
        </Link>

        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = isItemActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-all rounded-lg ${
                  active ? "bg-surface text-foreground" : "text-muted hover:text-foreground hover:bg-surface"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

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

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileTopBar />
        <MobileBottomNav />

        <header className="hidden lg:flex h-[52px] border-b border-border items-center justify-between px-5 shrink-0">
          <Image src="/heyannalogo.png" alt="HeyAnna" width={26} height={26} className="opacity-70" />

          <div className="text-center">
            <div className="text-[9px] text-muted font-mono uppercase tracking-widest">Portfolio</div>
            <div className="text-base font-bold font-mono leading-tight">{title}</div>
            <Link
              href="/dashboard/analytics"
              className="text-[10px] text-blue-primary hover:text-blue-light transition-colors flex items-center gap-0.5 justify-center"
            >
              View Insights <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <UserBadge />
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-mono text-muted hover:text-foreground hover:bg-surface transition-all"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pt-12 pb-24 lg:pt-0 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
