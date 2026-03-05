"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const orbsY        = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const gridY        = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const watermarkY   = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);
  const linesY       = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentY     = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden min-h-screen flex items-center justify-center"
    >
      {/* Orbs — parallax slowest */}
      <motion.div style={{ y: orbsY }} className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[900px] h-[900px] bg-[#466EFF]/[0.07] rounded-full blur-[200px]" />
        <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-[#466EFF]/[0.04] rounded-full blur-[160px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-primary/[0.04] rounded-full blur-[120px]" />
      </motion.div>

      {/* Grid — parallax mid */}
      <motion.div style={{ y: gridY }} className="absolute inset-0 grid-bg opacity-30 z-[2] pointer-events-none" />

      {/* Ghost HEYANNA watermark — fastest parallax */}
      <motion.div
        style={{ y: watermarkY }}
        className="absolute inset-0 flex items-center justify-center z-[2] pointer-events-none overflow-hidden"
      >
        <span
          className="font-bold uppercase tracking-tight select-none whitespace-nowrap"
          style={{
            fontSize: "clamp(80px, 18vw, 280px)",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.045)",
            letterSpacing: "-0.02em",
          }}
        >
          HEYANNA
        </span>
      </motion.div>

      {/* Animated diagonal trend lines — parallax */}
      <motion.svg
        style={{ y: linesY }}
        className="absolute inset-0 w-full h-full z-[3] pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <motion.path
          d="M-100 800 Q 200 700, 400 650 T 800 500 T 1200 300 T 1600 150"
          fill="none"
          stroke="#466EFF"
          strokeWidth="1.5"
          opacity="0.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeOut", delay: 0.5 }}
        />
        <motion.path
          d="M-100 850 Q 300 750, 500 700 T 900 550 T 1300 350 T 1600 200"
          fill="none"
          stroke="#466EFF"
          strokeWidth="0.8"
          opacity="0.1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeOut", delay: 0.8 }}
        />
      </motion.svg>

      {/* Graph lines at bottom */}
      <svg className="absolute bottom-0 left-0 right-0 h-48 z-[3] opacity-[0.15] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1440 200">
        <path d="M0 180 Q 200 120, 400 140 T 800 100 T 1200 130 T 1440 80" stroke="#466EFF" strokeWidth="1" fill="none" />
        <path d="M0 160 Q 300 100, 500 130 T 900 90 T 1300 110 T 1440 60" stroke="#7F9CFF" strokeWidth="0.8" fill="none" opacity="0.3" />
      </svg>

      {/* Main content — gentle parallax */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#466EFF]/20 bg-[#466EFF]/[0.06] mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#466EFF]/60 animate-pulse-blue" />
          <span className="text-xs font-display text-[#8BA4FF] uppercase tracking-widest">
            AI-Powered Terminal
          </span>
        </motion.div>

        {/* Giant headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="leading-[0.9] mb-8"
        >
          <span className="block text-6xl sm:text-8xl lg:text-9xl xl:text-[10rem] font-bold uppercase tracking-tight text-white">
            Trade Before
          </span>
          <span className="flex items-center justify-center gap-3 sm:gap-5 lg:gap-7 text-6xl sm:text-8xl lg:text-9xl xl:text-[10rem] font-bold uppercase tracking-tight accent-blue">
            <span>The</span>
            <span className="inline-flex items-center justify-center shrink-0"
              style={{ width: "1em", height: "1em" }}>
              <Image
                src="/heyannalogo.png"
                alt="HeyAnna"
                width={160}
                height={160}
                className="w-full h-full object-contain"
              />
            </span>
            <span>Crowd</span>
          </span>
        </motion.h1>

        {/* Italic serif tagline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg sm:text-xl lg:text-2xl font-serif italic text-white/50 mb-6 max-w-2xl mx-auto"
        >
          → copy the smartest polymarket traders
        </motion.p>

        {/* Sub description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-sm sm:text-base text-white/35 mb-12 max-w-lg mx-auto leading-relaxed"
        >
          Set up your prediction market strategy in under 5 minutes. Official Polymarket builder partner.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="https://t.me/+i9D5bDox8lNmNDk9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-10 py-4 rounded-sm bg-[#466EFF] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#5A7FFF] transition-all duration-300 glow-primary hover:scale-[1.02]"
          >
            Start Trading
            <svg className="ml-3 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="https://x.com/tryheyanna"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-10 py-4 rounded-sm border border-white/15 hover:border-white/30 text-white/70 font-medium transition-all hover:bg-white/[0.03] text-sm uppercase tracking-widest"
          >
            Follow on X
          </a>
        </motion.div>

        {/* Trust text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-xs text-white/20 mt-8 tracking-wide"
        >
          By signing up, you agree to our <span className="underline underline-offset-2">terms of service</span>
        </motion.p>
      </motion.div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 80V40C360 0 720 10 1080 30C1260 40 1380 50 1440 40V80H0Z" fill="var(--background)" />
        </svg>
      </div>
    </section>
  );
}
