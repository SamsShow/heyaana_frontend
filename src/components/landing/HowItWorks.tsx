"use client";

import { motion } from "framer-motion";
import { MessageCircle, Activity, Rocket } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    step: "01",
    title: "Connect",
    description: "Join our Telegram channel or follow on X. Get plugged into the signal network in seconds.",
  },
  {
    icon: Activity,
    step: "02",
    title: "Get Signals",
    description: "Our AI monitors every venue in real-time, detecting mispricings and edge opportunities before the crowd does.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Move First",
    description: "Act on signals with precision. While others are still reading headlines, you've already positioned for profit.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy-hero" />
      <div className="absolute inset-0 radial-fade opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono text-blue-primary uppercase tracking-widest">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-white">
            From Signal to <span className="text-gold-accent">Edge</span> in Seconds
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Three steps to staying ahead of every prediction market.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
                <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-blue-primary/40 to-blue-primary/10 z-0" />
              )}

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-primary/10 border border-blue-primary/20 mb-6 mx-auto">
                  <step.icon className="w-8 h-8 text-blue-primary" />
                </div>
                <div className="text-xs font-mono text-gold-accent mb-2 tracking-widest">{step.step}</div>
                <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
