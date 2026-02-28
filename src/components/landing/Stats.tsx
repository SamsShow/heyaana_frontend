"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Clock, Zap, BarChart3, Target } from "lucide-react";

function AnimatedNumber({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, target]);

    return (
        <span ref={ref} className="tabular-nums">
            {prefix}{value.toLocaleString()}{suffix}
        </span>
    );
}

const stats = [
    { value: 24, suffix: "/7", label: "Market Monitoring", icon: Clock },
    { value: 100, suffix: "ms", label: "Alert Latency", icon: Zap },
    { value: 50, suffix: "+", label: "Venues Tracked", icon: BarChart3 },
    { value: 10000, suffix: "+", prefix: "", label: "Signals Delivered", icon: Target },
];

export function Stats() {
    return (
        <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="relative group text-center p-6 rounded-2xl border border-border/50 bg-surface/30 hover:bg-surface/60 transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-primary/10 via-transparent to-gold-accent/10" />

                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-primary/10 mb-3">
                                    <stat.icon className="w-5 h-5 text-blue-primary" />
                                </div>
                                <div className="text-3xl sm:text-4xl font-bold font-mono text-white mb-1">
                                    <AnimatedNumber target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                </div>
                                <div className="text-xs text-muted uppercase tracking-wider mt-1">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
