"use client";

import { motion } from "framer-motion";
import { Monitor, Zap, Phone, Crosshair } from "lucide-react";

const features = [
  {
    icon: Monitor,
    title: "One Screen, Every Venue",
    description: "All prediction market data — unified in a single terminal. No more tab-switching between venues.",
    accent: "blue",
  },
  {
    icon: Crosshair,
    title: "Real-Time Edge Detection",
    description: "Spot mispricings and flow imbalances as they happen. See what the crowd hasn't seen yet.",
    accent: "gold",
  },
  {
    icon: Phone,
    title: "AI-Powered Alerts",
    description: "When the world shakes, our AI doesn't tweet about it — it calls you. Instant, actionable signals.",
    accent: "blue",
  },
  {
    icon: Zap,
    title: "Move Before The Crowd",
    description: "While others are still reacting, you've already moved. Speed is the edge that compounds.",
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
            What Makes{" "}
            <span className="text-gradient-gold">HeyAnna</span>{" "}
            Different
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            The terminal prediction markets didn&apos;t know they needed —
            built for traders who move first.
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
