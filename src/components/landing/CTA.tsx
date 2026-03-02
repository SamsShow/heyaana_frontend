"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-primary/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-gold-accent/3 rounded-full blur-[80px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left — Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-accent/30 bg-gold-accent/10 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-accent animate-pulse-blue" />
              <span className="text-xs font-mono text-gold-accent uppercase tracking-widest">
                Join the Signal
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
              The Prediction Economy
              <br />
              <span className="text-blue-primary">Is Growing Up.</span>
            </h2>

            <p className="text-lg text-muted mb-4 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              The tools should too.
            </p>
            <p className="text-lg text-muted mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              This isn&apos;t for everyone. It&apos;s for traders who want control.
              <br />
              Join HeyAnna.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center lg:items-start gap-4 w-full max-w-md mx-auto lg:mx-0 sm:max-w-none">
              <a
                href="https://t.me/+i9D5bDox8lNmNDk9"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex justify-center lg:justify-start"
              >
                <InteractiveHoverButton
                  text="Join Telegram"
                  className="w-full sm:w-[200px] border-blue-primary/40 bg-background text-white"
                />
              </a>
              <a
                href="https://x.com/tryheyanna"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full sm:w-[200px] px-8 py-3.5 rounded-full border border-border hover:border-blue-primary/40 font-medium transition-all hover:bg-surface text-base"
              >
                Follow on X
              </a>
            </div>

            <p className="text-xs text-muted mt-6">
              No sign-up required &bull; Free signals &bull; Community-first
            </p>
          </motion.div>

          {/* Right — Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 40 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-shrink-0 flex justify-center lg:justify-end relative"
          >
            {/* Glow behind mascot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 sm:w-72 sm:h-72 bg-blue-primary/8 rounded-full blur-[60px]" />
            </div>

            <Image
              src="/mascot_hero_transparent.png"
              alt="HeyAnna mascot"
              width={300}
              height={300}
              className="relative z-10 w-48 sm:w-60 lg:w-72 h-auto drop-shadow-xl animate-float"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
