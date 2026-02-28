"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-hero/80 backdrop-blur-xl border-b border-border/30">
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
            {[
              { label: "Features", href: "/#features" },
              { label: "How It Works", href: "/#how-it-works" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-white/70 hover:text-white px-4 py-1.5 rounded-full hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://x.com/tryheyanna"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 hover:text-white px-4 py-1.5 rounded-full hover:bg-white/5 transition-all"
            >
              Twitter / X
            </a>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://t.me/+i9D5bDox8lNmNDk9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-5 py-2 rounded-full bg-blue-primary text-white font-medium hover:bg-blue-dark transition-all glow-blue"
            >
              Join Telegram
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
          <div className="md:hidden border-t border-border/30 py-4 space-y-3">
            <Link href="/#features" className="block text-sm text-white/70 hover:text-white px-2 py-1" onClick={() => setMobileOpen(false)}>Features</Link>
            <Link href="/#how-it-works" className="block text-sm text-white/70 hover:text-white px-2 py-1" onClick={() => setMobileOpen(false)}>How It Works</Link>
            <a href="https://x.com/tryheyanna" target="_blank" rel="noopener noreferrer" className="block text-sm text-white/70 hover:text-white px-2 py-1" onClick={() => setMobileOpen(false)}>Twitter / X</a>
            <div className="flex gap-2 pt-2">
              <a
                href="https://t.me/+i9D5bDox8lNmNDk9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm px-4 py-2 rounded-full bg-blue-primary text-white font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Join Telegram
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
