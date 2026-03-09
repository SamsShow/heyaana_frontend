import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#060B1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/heyannalogo.png"
                alt="HeyAnna logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg font-bold tracking-tight text-white">
                Hey<span className="text-gold-accent">Anna</span>
              </span>
            </Link>
            <p className="text-sm text-white/45 leading-relaxed">
              The terminal for prediction markets.
              One screen. Every signal. Real-time edge.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-white/40">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/#features" className="text-sm text-white/40 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/#how-it-works" className="text-sm text-white/40 hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-white/40">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/#insights" className="text-sm text-white/40 hover:text-white transition-colors">Intelligence Feed</Link></li>
              <li><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Product Guide</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-white/40">Community</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://t.me/+i9D5bDox8lNmNDk9" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white transition-colors">
                  Telegram Channel
                </a>
              </li>
              <li>
                <a href="https://x.com/tryheyanna" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white transition-colors">
                  Twitter / X
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            &copy; 2026 HeyAnna. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-primary animate-pulse-blue"></span>
            AI-Powered Prediction Market Terminal
          </div>
        </div>
      </div>
    </footer>
  );
}
