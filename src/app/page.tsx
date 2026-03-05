"use client";

import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Ticker } from "@/components/landing/Ticker";
import { ProductValue } from "@/components/landing/ProductValue";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Insights } from "@/components/landing/Insights";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/shared/Footer";
import { SmoothScroll } from "@/components/shared/SmoothScroll";

export default function Home() {
  return (
    <SmoothScroll>
      <main
        className="min-h-screen"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 80% 5%, #071A3A 0%, transparent 50%), radial-gradient(ellipse 70% 50% at 10% 55%, #040D22 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 50% 100%, #050F28 0%, transparent 55%), #09090B",
        }}
      >
        <Navbar />
        <Hero />
        <Ticker />
        <ProductValue />
        <ProductDemo />
        <HowItWorks />
        <Insights />
        <CTA />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
