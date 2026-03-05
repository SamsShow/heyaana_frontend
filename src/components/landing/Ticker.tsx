"use client";

import { motion } from "framer-motion";
import { Zap, Monitor, Bell, TrendingUp, Crosshair, Globe, Brain, Activity } from "lucide-react";

const tickerItems = [
    { icon: Zap, text: "Real-time signals detected" },
    { icon: Monitor, text: "All venues. One terminal." },
    { icon: Bell, text: "AI-powered alerts" },
    { icon: TrendingUp, text: "Move before the crowd" },
    { icon: Crosshair, text: "Signal-to-trade in seconds" },
    { icon: Globe, text: "Cross-platform intelligence" },
    { icon: Brain, text: "Narrative analysis" },
    { icon: Activity, text: "Whale activity tracking" },
];

export function Ticker() {
    const items = [...tickerItems, ...tickerItems];

    return (
        <div className="relative overflow-hidden py-4 bg-[#080D1E] border-y border-[#466EFF]/10">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0A0F20] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A0F20] to-transparent z-10" />

            <motion.div
                className="flex gap-8 whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                    x: {
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    },
                }}
            >
                {items.map((item, i) => (
                    <span
                        key={i}
                        className="text-sm font-mono text-white/50 flex-shrink-0 inline-flex items-center gap-2"
                    >
                        <item.icon className="w-3.5 h-3.5 text-blue-primary/50" />
                        {item.text}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}
