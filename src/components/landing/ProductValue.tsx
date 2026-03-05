"use client";

import { motion } from "framer-motion";
import { Activity, Brain, Bell } from "lucide-react";

const features = [
    {
        icon: Activity,
        title: "Real-Time Market Signals",
        description: "HeyAnna scans prediction markets, news, and social chatter to detect unusual activity before the crowd.",
        accent: "blue",
        liveData: [
            { label: "ETH Surge", prob: "78%", change: "+12%" },
            { label: "BTC > $95K", prob: "64%", change: "+8%" },
            { label: "SOL Rally", prob: "89%", change: "+23%" },
        ],
    },
    {
        icon: Brain,
        title: "AI Market Intelligence",
        description: "Our AI analyzes market movements, narratives, and liquidity shifts to surface the highest-signal opportunities.",
        accent: "blue",
        bars: [85, 62, 91, 45, 78, 95, 67, 88],
    },
    {
        icon: Bell,
        title: "Instant Trade Alerts",
        description: "Get notifications when something meaningful happens — so you can move before everyone else.",
        accent: "blue",
        alerts: [
            { type: "WHALE", text: "Large position detected on Polymarket", time: "2m ago" },
            { type: "SIGNAL", text: "Probability shift > 15% on BTC market", time: "5m ago" },
            { type: "NEWS", text: "Breaking narrative detected — AI sector", time: "12m ago" },
        ],
    },
];

export function ProductValue() {
    return (
        <section id="features" className="py-24 relative">
            <div className="absolute inset-0 terminal-dots opacity-30" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-display text-blue-primary uppercase tracking-widest">Features</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 mb-5 uppercase tracking-tight">
                        <span className="text-white">Simplify</span>{" "}
                        <span className="accent-blue">Trading</span>
                    </h2>
                    <p className="text-white/50 max-w-xl mx-auto text-base sm:text-lg">
                        Everything you need to find, analyze, and act on prediction market signals.
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            className="glass-card p-6 sm:p-7 group"
                        >
                            {/* Card header */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2.5 transition-all duration-300 bg-blue-primary/10 text-blue-primary group-hover:bg-blue-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-primary/20">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-wide">{feature.title}</h3>
                            </div>

                            <p className="text-sm text-white/55 leading-relaxed mb-5">{feature.description}</p>

                            {/* Live data visualization per card */}
                            <div className="terminal-card p-4">
                                {feature.liveData && (
                                    <div className="space-y-2.5">
                                        {feature.liveData.map((item) => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                    <span className="text-xs font-mono text-white/70">{item.label}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-mono text-blue-light">{item.prob}</span>
                                                    <span className="text-xs font-mono text-green-400">{item.change}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {feature.bars && (
                                    <div className="flex items-end gap-1.5 h-16">
                                        {feature.bars.map((h, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ scaleY: 0 }}
                                                whileInView={{ scaleY: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.4, delay: idx * 0.08 }}
                                                className="flex-1 rounded-sm origin-bottom"
                                                style={{
                                                    height: `${h}%`,
                                                    background: h > 80 ? "#466EFF" : "rgba(70,110,255,0.5)",
                                                    opacity: 0.7,
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {feature.alerts && (
                                    <div className="space-y-2">
                                        {feature.alerts.map((alert) => (
                                            <div key={alert.text} className="flex items-start gap-2">
                                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded mt-0.5 ${alert.type === "WHALE" ? "bg-blue-primary/20 text-blue-light" :
                                                        alert.type === "SIGNAL" ? "bg-blue-dark/30 text-blue-light" :
                                                            "bg-green-500/20 text-green-400"
                                                    }`}>
                                                    {alert.type}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] text-white/60 leading-tight truncate">{alert.text}</p>
                                                    <p className="text-[9px] text-white/30 font-mono mt-0.5">{alert.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
