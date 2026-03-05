"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Product", href: "/#product" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Insights", href: "/#insights" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100 bg-[#060B1A]/90 backdrop-blur-xl border-b border-white/5"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/heyannalogo.png"
              alt="HeyAnna logo"
              width={36}
              height={36}
              className="w-9 h-9 rounded-lg"
              priority
            />
            <span className="text-lg font-bold tracking-tight text-white">
              Hey<span className="text-gold-accent">Anna</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-white/50 hover:text-white px-4 py-1.5 rounded-full hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://x.com/tryheyanna"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/50 hover:text-white px-4 py-1.5 rounded-full hover:bg-white/5 transition-all"
            >
              Twitter / X
            </a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://t.me/+i9D5bDox8lNmNDk9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-5 py-2 rounded-full bg-blue-primary text-white font-medium hover:bg-blue-dark transition-all glow-blue"
            >
              Get Early Access
            </a>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-sm text-white/60 hover:text-white px-2 py-1"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a href="https://x.com/tryheyanna" target="_blank" rel="noopener noreferrer" className="block text-sm text-white/60 hover:text-white px-2 py-1" onClick={() => setMobileOpen(false)}>Twitter / X</a>
            <div className="flex gap-2 pt-2">
              <a
                href="https://t.me/+i9D5bDox8lNmNDk9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm px-4 py-2 rounded-full bg-blue-primary text-white font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Get Early Access
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
