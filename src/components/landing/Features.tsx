"use client";

import { motion } from "framer-motion";
import { Monitor, Zap, Phone, Crosshair } from "lucide-react";

const features = [
  {
    icon: Monitor,
    title: "All The Markets. One Screen.",
    description: "Full global market access. If it's moving anywhere, you see it here.",
    accent: "blue",
  },
  {
    icon: Crosshair,
    title: "Spot The Mispricing.",
    description: "Cross-venue price gaps, liquidity shifts, and arbitrage — captured before the market catches up.",
    accent: "gold",
  },
  {
    icon: Phone,
    title: "Your Edge Doesn't Sleep.",
    description: "Personalized AI alerts tied directly to your positions. No noise. No delay.",
    accent: "blue",
  },
  {
    icon: Zap,
    title: "Conviction, Backed By Data.",
    description: "Resolution history, flow analytics, and live risk monitoring — to understand the move before you go big.",
    accent: "gold",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono text-blue-primary uppercase tracking-widest">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
            This Is What You&apos;re{" "}
            <span className="text-gradient-gold">Trading With.</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Global data. Cross-venue intelligence. And AI that&apos;s already ahead.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative gradient-border p-7 transition-all duration-500 hover:translate-y-[-2px]"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`p-3 rounded-xl transition-all duration-300 ${feature.accent === "gold"
                    ? "bg-gold-accent/10 text-gold-accent group-hover:bg-gold-accent group-hover:text-white group-hover:shadow-lg group-hover:shadow-gold-accent/20"
                    : "bg-blue-primary/10 text-blue-primary group-hover:bg-blue-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-primary/20"
                    }`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">{feature.title}</h3>
              <p className="text-sm text-muted leading-relaxed group-hover:text-white/60 transition-colors">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
