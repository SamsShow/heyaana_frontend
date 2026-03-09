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
      <main className="min-h-screen bg-[#060B1A]">
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
