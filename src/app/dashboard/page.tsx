"use client";

import { useState } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Users,
  BarChart2,
  Gift,
  User,
  Wallet,
  Menu,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

/* ─── mock data ─────────────────────────────────────────── */

const weeklyChart = [
  { t: "Mon", v: 0 },
  { t: "Tue", v: -0.01 },
  { t: "Wed", v: -0.01 },
  { t: "Wed", v: -0.02 },
  { t: "Wed", v: -0.05 },
  { t: "Wed", v: -0.06 },
  { t: "Now", v: -0.07 },
];

const positions = [
  {
    id: 1,
    flag: "🇪🇸",
    title: "Will Spain win the 2026 FIFA World Cup?",
    outcome: "Yes",
    trader: "0x Copy: 0x9703...6bc2",
    price: "$1.00",
    pnl: "+$0 (+0.00%)",
    neg: false,
    expiry: "Ends Jul 20, 5:30 AM",
    from: "15¢",
    to: "15¢",
  },
  {
    id: 2,
    flag: "🏒",
    title: "Will the Buffalo Sabres win the Eastern Conference?",
    outcome: "No",
    trader: "0x Copy: 0x9703...69c2",
    price: "$1.00",
    pnl: "-$0.00 (-0.21%)",
    neg: true,
    expiry: "Ends Jun 30, 5:30 AM",
    from: "92¢",
    to: "92¢",
  },
  {
    id: 3,
    flag: "🏛️",
    title: "2025 Balance of Power: D Senate, D House",
    outcome: "Yes",
    trader: "0x Copy: 0x9703...69c2",
    price: "$0.99",
    pnl: "-$0.01 (-1.21%)",
    neg: true,
    expiry: "Ends Nov 3, 5:30 AM",
    from: "41¢",
    to: "41¢",
  },
  {
    id: 4,
    flag: "🏀",
    title: "Will the Cleveland Cavaliers win the 2026 NBA Finals?",
    outcome: "Yes",
    trader: "0x Copy: 0x9703...69c2",
    price: "$0.98",
    pnl: "-$0.02 (-2.14%)",
    neg: true,
    expiry: "Ends Jul 1, 5:30 AM",
    from: "7¢",
    to: "7¢",
  },
  {
    id: 5,
    flag: "🫏",
    title: "Will the Democratic Party control the House after the 2026 Midterm elections?",
    outcome: "Yes",
    trader: "0x Copy: 0x9703...91c3",
    price: "$0.97",
    pnl: "-$0.03 (-3.12%)",
    neg: true,
    expiry: "Ends Nov 3, 5:30 AM",
    from: "16¢",
    to: "16¢",
  },
];

const liveMarkets = [
  {
    id: 1,
    flag: "⚽",
    title: "Will BTC exceed $150K by March 2026?",
    outcome: "Yes",
    trader: "0x Copy: 0x8821...3fA0",
    price: "$0.71",
    pnl: "+$0.09 (+14.5%)",
    neg: false,
    expiry: "Ends Mar 31, 5:30 AM",
    from: "62¢",
    to: "71¢",
  },
  {
    id: 2,
    flag: "🏈",
    title: "Fed rate cut in Q1 2026?",
    outcome: "No",
    trader: "0x Copy: 0x4F2c...9bB1",
    price: "$0.38",
    pnl: "+$0.07 (+15.6%)",
    neg: false,
    expiry: "Ends Mar 18, 5:30 AM",
    from: "45¢",
    to: "38¢",
  },
];

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard", active: true },
  { icon: Users, label: "Traders", href: "/dashboard/traders" },
  { icon: BarChart2, label: "Markets", href: "/dashboard/markets" },
  { icon: Gift, label: "Referral", href: "/dashboard/referral" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

const timeTabs = ["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"];

/* ─── sub-components ─────────────────────────────────────── */

function PositionCard({ pos }: { pos: typeof positions[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/[0.06] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="text-xl leading-none mt-0.5 shrink-0">{pos.flag}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white/80 leading-snug line-clamp-2">{pos.title}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[9px] px-1.5 py-0.5 font-mono ${pos.outcome === "Yes" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
              {pos.outcome}
            </span>
            <span className="text-[9px] text-white/20 font-mono truncate">{pos.trader}</span>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <div className="text-xs font-mono text-white/70">{pos.price}</div>
          <div className={`text-[10px] font-mono mt-0.5 ${pos.neg ? "text-red-400" : "text-green-400"}`}>{pos.pnl}</div>
          <div className="text-[9px] text-white/20 font-mono mt-0.5">{pos.from} → {pos.to}</div>
        </div>
      </div>
      <div className="text-[9px] text-white/20 font-mono mt-1.5">{pos.expiry}</div>
    </motion.div>
  );
}

/* ─── custom tooltip ─────────────────────────────────────── */
function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-white/10 px-2 py-1 text-[10px] font-mono text-red-400">
      {payload[0].value.toFixed(2)}
    </div>
  );
}

/* ─── main page ───────────────────────────────────────────── */
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("1W");

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#09090E" }}
    >
      {/* ── Sidebar ── */}
      <aside className="w-[176px] shrink-0 border-r border-white/[0.05] flex flex-col py-5 overflow-hidden">
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
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-all ${
                item.active
                  ? "bg-white/[0.08] text-white"
                  : "text-white/35 hover:text-white/65 hover:bg-white/[0.04]"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 pt-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-primary/20 text-blue-primary flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
              U
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/70 truncate">User</div>
              <div className="text-[9px] text-white/25 font-mono">Connected</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-[52px] border-b border-white/[0.05] flex items-center justify-between px-5 shrink-0">
          <Image src="/heyannalogo.png" alt="HeyAnna" width={26} height={26} className="opacity-70" />

          {/* Portfolio center */}
          <div className="text-center">
            <div className="text-[9px] text-white/25 font-mono uppercase tracking-widest">Portfolio</div>
            <div className="text-base font-bold font-mono leading-tight">$50.95</div>
            <Link
              href="#"
              className="text-[10px] text-blue-primary hover:text-blue-light transition-colors flex items-center gap-0.5 justify-center"
            >
              Deposit <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2.5 py-1.5 border border-white/[0.08] bg-white/[0.03] text-[10px] font-mono text-white/40">
              <Wallet className="w-3 h-3" />
              $0.00
            </div>
            <button className="p-1.5 border border-white/[0.08] hover:bg-white/[0.04] transition-all">
              <Menu className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden p-3 gap-3">

          {/* ── Left panel — Portfolio ── */}
          <div className="w-[320px] shrink-0 flex flex-col gap-3 overflow-y-auto">
            <div className="border border-white/[0.06] bg-white/[0.015] p-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-white/60">User</span>
                <div className="text-right">
                  <div className="text-[9px] text-white/25 font-mono uppercase tracking-wider">This Week</div>
                  <div className="text-xl font-bold font-mono text-red-500 leading-tight">-$0.07</div>
                  <div className="text-[10px] text-white/25 font-mono">+0.00%</div>
                </div>
              </div>

              {/* Time tabs */}
              <div className="flex gap-0.5 mt-3 mb-3">
                {timeTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[9px] font-mono px-1.5 py-1 transition-all ${
                      activeTab === tab
                        ? "bg-white/[0.1] text-white"
                        : "text-white/25 hover:text-white/50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Chart */}
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="t"
                      tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      fill="url(#redFill)"
                      dot={false}
                      activeDot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stats breakdown */}
              <div className="mt-4 pt-3 border-t border-white/[0.05] space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-white/40">Total P&L (all time)</span>
                  <span className="font-mono text-red-500">-$0.07</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span className="text-white/22">Realized</span>
                  <span className="font-mono text-white/35">+$0</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span className="text-white/22">Unrealized</span>
                  <span className="font-mono text-white/35">-$0.07</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-white/[0.04]">
                  <span className="text-white/40">Copy Trading</span>
                  <span className="font-mono text-red-500">-$0.07</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span className="text-white/22">Realized</span>
                  <span className="font-mono text-white/35">+$0</span>
                </div>
                <div className="flex justify-between pl-3">
                  <span className="text-white/22">Unrealized</span>
                  <span className="font-mono text-white/35">-$0.07</span>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1.5 border-t border-white/[0.04]">
                  <div className="flex justify-between">
                    <span className="text-white/35">Manual</span>
                    <span className="font-mono text-white/50">+$0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/35">Trades</span>
                    <span className="font-mono text-white/50">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/35">Open Pos</span>
                    <span className="font-mono text-white/50">$5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/35">Win Rate</span>
                    <span className="font-mono text-white/50">—</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-white/35">Balance</span>
                    <span className="font-mono text-white/50">$46</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right panel — Positions ── */}
          <div className="flex-1 overflow-y-auto space-y-3">

            {/* Positions header */}
            <div className="flex items-center justify-between py-1">
              <button className="flex items-center gap-1 text-sm font-semibold text-white hover:text-white/70 transition-colors">
                Positions <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <Link href="#" className="text-[11px] text-white/25 hover:text-white/50 transition-colors">
                View All
              </Link>
            </div>

            {positions.map((pos, i) => (
              <motion.div
                key={pos.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <PositionCard pos={pos} />
              </motion.div>
            ))}

            {/* Live markets section */}
            <div className="flex items-center justify-between py-1 pt-4">
              <button className="flex items-center gap-1 text-sm font-semibold text-white hover:text-white/70 transition-colors">
                Live Markets <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <Link href="#" className="text-[11px] text-white/25 hover:text-white/50 transition-colors">
                View All
              </Link>
            </div>

            {liveMarkets.map((pos, i) => (
              <motion.div
                key={pos.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 + 0.3 }}
              >
                <PositionCard pos={pos} />
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
