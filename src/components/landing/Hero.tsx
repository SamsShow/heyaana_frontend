"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

/* Small SVG star component for floating decorations */
function Star({ className = "", size = 20, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

/* Cursor arrow decoration */
function CursorArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M4 2L20 12L12 14L8 22L4 2Z" />
    </svg>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Mascot parallax: starts lower (translateY 80px) and rises up as user scrolls
  const mascotY = useTransform(scrollYProgress, [0, 0.5], [80, -30]);
  // Mascot opacity: fades in as user scrolls
  const mascotOpacity = useTransform(scrollYProgress, [0, 0.15], [0.3, 1]);
  // Mascot scale: grows slightly
  const mascotScale = useTransform(scrollYProgress, [0, 0.3], [0.85, 1]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-navy-hero">
      {/* Subtle grid background on entire hero */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Radial gradient glow behind content */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gold-accent/3 rounded-full blur-[100px]" />

      {/* Floating decorative stars */}
      <Star className="absolute top-[12%] left-[8%] text-gold-accent animate-sparkle" size={24} />
      <Star className="absolute top-[20%] left-[18%] text-gold-accent/60 animate-twinkle" size={14} />
      <Star className="absolute top-[15%] right-[12%] text-gold-accent animate-sparkle" size={18} style={{ animationDelay: "1s" }} />
      <Star className="absolute top-[40%] left-[5%] text-white/40 animate-twinkle" size={12} style={{ animationDelay: "2s" }} />
      <Star className="absolute top-[35%] right-[8%] text-gold-accent/50 animate-sparkle" size={16} style={{ animationDelay: "1.5s" }} />
      <Star className="absolute top-[25%] right-[30%] text-white/30 animate-twinkle" size={10} style={{ animationDelay: "3s" }} />

      {/* Cursor arrows */}
      <CursorArrow className="absolute top-[45%] left-[15%] text-white/20 animate-float-delayed" />
      <CursorArrow className="absolute top-[28%] right-[20%] text-white/15 animate-float-slow rotate-45" />

      {/* Main content — centered text */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-0 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-primary/30 bg-blue-primary/10 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-primary animate-pulse-blue" />
            <span className="text-xs font-mono text-blue-light uppercase tracking-widest">
              AI-Powered Terminal
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-white"
          >
            The Terminal{" "}
            <br className="hidden sm:block" />
            Prediction Markets{" "}
            <br className="hidden sm:block" />
            <span className="text-gradient-gold">Didn&apos;t Know</span>{" "}
            They Needed
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            One screen. Every venue. Real-time flows, mispricings, and edge
            the crowd hasn&apos;t spotted yet.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://t.me/+i9D5bDox8lNmNDk9"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-primary text-white font-medium hover:bg-blue-dark transition-all glow-blue-strong glow-pulse text-base"
            >
              Join Telegram
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://x.com/tryheyanna"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 hover:border-blue-primary/50 text-white font-medium transition-all hover:bg-white/5 text-base"
            >
              Follow on X
            </a>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 text-sm text-white/40 font-mono"
          >
            While others react, you&apos;ve already moved.
          </motion.p>
        </div>
      </div>

      {/* Mascot — centered, overlapping the bottom edge with parallax */}
      <div className="relative z-10 flex justify-center mt-4 pb-0">
        {/* Glow behind mascot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-primary/8 rounded-full blur-[80px]" />

        <motion.div
          style={{
            y: mascotY,
            opacity: mascotOpacity,
            scale: mascotScale,
          }}
          className="relative z-10"
        >
          {/* Mascot stars */}
          <Star className="absolute -top-6 -right-6 text-gold-accent animate-sparkle" size={22} />
          <Star className="absolute -top-2 -left-8 text-gold-accent/70 animate-twinkle" size={16} style={{ animationDelay: "0.5s" }} />

          <Image
            src="/heannaMas_transparent.png"
            alt="HeyAnna mascot — a pixel art princess with a crown"
            width={350}
            height={350}
            className="w-48 sm:w-64 lg:w-[300px] h-auto drop-shadow-2xl"
            priority
          />
        </motion.div>
      </div>

      {/* Curved bottom edge */}
      <div className="relative z-20 -mt-16 sm:-mt-20 lg:-mt-24">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120V60C240 0 480 0 720 30C960 60 1200 90 1440 60V120H0Z"
            fill="var(--background)"
          />
        </svg>
      </div>
    </section>
  );
}
