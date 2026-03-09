"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Plug, Radar, Zap } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    icon: Plug,
    step: "01",
    title: "Connect Your Markets",
    description: "Choose the prediction markets you trade. HeyAnna supports all major platforms.",
  },
  {
    icon: Radar,
    step: "02",
    title: "Track Signal Sources",
    description: "HeyAnna monitors liquidity, narratives, and market activity across every venue in real-time.",
  },
  {
    icon: Zap,
    step: "03",
    title: "Act On Intelligence",
    description: "Receive alerts and move before the market catches up. Signal to trade in seconds.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const radialY = useTransform(scrollYProgress, [0, 1], [40, -50]);
  const dotsY = useTransform(scrollYProgress, [0, 1], [-25, 35]);
  const contentY = useTransform(scrollYProgress, [0, 1], [18, -18]);

  return (
    <section ref={sectionRef} id="how-it-works" className="py-24 relative overflow-hidden">
      <motion.div style={{ y: radialY }} className="absolute inset-0 radial-fade opacity-60" />
      <motion.div style={{ y: dotsY }} className="absolute inset-0 terminal-dots opacity-20" />

      <motion.div style={{ y: contentY }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-mono text-blue-primary uppercase tracking-widest">How It Works</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 mb-5 uppercase tracking-tight text-white">
            <span>From Signal to</span>{" "}
            <span className="text-blue-primary">Edge</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-base sm:text-lg">
            Three steps to staying ahead of every prediction market.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+50px)] w-[calc(100%-100px)] h-px bg-linear-to-r from-blue-primary/60 via-blue-primary/30 to-transparent z-0" />
              )}

              <div className="relative z-10 text-center p-6">
                {/* Icon container */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-primary/10 mb-6 mx-auto">
                  <step.icon className="w-8 h-8 text-blue-primary" />
                </div>

                {/* Step number */}
                <div className="text-2xl font-bold text-blue-primary mb-3 font-mono">{step.step}</div>

                <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-wide">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
