"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { FlickeringGrid } from "@/components/ui/flickering-grid-hero";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

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

/* Grid animation config tuned to HeyAnna brand colors */
const GRID_CONFIG = {
  background: {
    color: "#2E5CFF",
    maxOpacity: 0.15,
    flickerChance: 0.12,
    squareSize: 4,
    gridGap: 4,
  },
  logo: {
    color: "#2E5CFF",
    maxOpacity: 0.6,
    flickerChance: 0.18,
    squareSize: 3,
    gridGap: 6,
  },
} as const;

/* Logo mask style — uses the HeyAnna logo as a CSS mask */
const logoMaskStyle = {
  WebkitMaskImage: `url('/heyannalogo.png')`,
  WebkitMaskSize: "280px",
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskImage: `url('/heyannalogo.png')`,
  maskSize: "280px",
  maskPosition: "center",
  maskRepeat: "no-repeat",
} as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const mascotY = useTransform(scrollYProgress, [0, 0.5], [80, -30]);
  const mascotOpacity = useTransform(scrollYProgress, [0, 0.15], [0.3, 1]);
  const mascotScale = useTransform(scrollYProgress, [0, 0.3], [0.85, 1]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-navy-hero">
      {/* Flickering grid background — subtle blue squares across entire hero */}
      <FlickeringGrid
        className="absolute inset-0 z-0 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        {...GRID_CONFIG.background}
      />

      {/* HeyAnna logo flickering grid mask — large centered logo shape */}
      <div
        className="absolute inset-0 z-[1] flex items-center justify-center opacity-40"
        style={logoMaskStyle}
      >
        <FlickeringGrid {...GRID_CONFIG.logo} />
      </div>

      {/* Radial gradient glow behind content */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-primary/5 rounded-full blur-[120px] z-[2]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gold-accent/3 rounded-full blur-[100px] z-[2]" />

      {/* Floating decorative stars */}
      <Star className="absolute top-[12%] left-[8%] text-gold-accent animate-sparkle z-[3]" size={24} />
      <Star className="absolute top-[20%] left-[18%] text-gold-accent/60 animate-twinkle z-[3]" size={14} />
      <Star className="absolute top-[15%] right-[12%] text-gold-accent animate-sparkle z-[3]" size={18} style={{ animationDelay: "1s" }} />
      <Star className="absolute top-[40%] left-[5%] text-white/40 animate-twinkle z-[3]" size={12} style={{ animationDelay: "2s" }} />
      <Star className="absolute top-[35%] right-[8%] text-gold-accent/50 animate-sparkle z-[3]" size={16} style={{ animationDelay: "1.5s" }} />

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
            >
              <InteractiveHoverButton
                text="Join Telegram"
                className="w-full min-w-[180px] sm:w-[200px] border-blue-primary/40 bg-navy-hero text-white glow-pulse"
              />
            </a>
            <a
              href="https://x.com/tryheyanna"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full min-w-[180px] sm:w-[200px] px-8 py-3.5 rounded-full border border-white/20 hover:border-blue-primary/50 text-white font-medium transition-all hover:bg-white/5 text-base"
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
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-primary/8 rounded-full blur-[80px]" />

        <motion.div
          style={{
            y: mascotY,
            opacity: mascotOpacity,
            scale: mascotScale,
          }}
          className="relative z-10"
        >
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
