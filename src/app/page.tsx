"use client";

import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Ticker } from "@/components/landing/Ticker";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/shared/Footer";
import { SmoothScroll } from "@/components/shared/SmoothScroll";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <Ticker />
        <Stats />
        <Features />
        <HowItWorks />
        <CTA />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
