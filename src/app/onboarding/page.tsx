"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Shield,
  TrendingUp,
  Zap,
  MessageCircle,
  Bot,
  Flame,
  Loader2,
} from "lucide-react";
import { marketCategories, topTraders } from "@/lib/mock-data";
import { useAuth } from "@/lib/useAuth";

const STEPS = [
  { id: 1, title: "Connect", subtitle: "Link your account" },
  { id: 2, title: "Markets", subtitle: "Choose preferences" },
  { id: 3, title: "Risk", subtitle: "Set tolerance" },
  { id: 4, title: "Traders", subtitle: "Pick to copy" },
  { id: 5, title: "Launch", subtitle: "Start trading" },
];

function OnboardingPageContent() {
  const [step, setStep] = useState(1);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["Politics", "Crypto", "Tech"]);
  const [riskLevel, setRiskLevel] = useState<"conservative" | "moderate" | "aggressive">("moderate");
  const [maxExposure, setMaxExposure] = useState(25);
  const [selectedTraders, setSelectedTraders] = useState<number[]>([1, 2]);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentHostname, setCurrentHostname] = useState<string | null>(null);
  const [showDevLogin, setShowDevLogin] = useState(false);
  const telegramRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loginManual, login, loginWidget } = useAuth();
  const telegramBotUsername = (
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "heyanna_ai_bot"
  ).replace(/^@/, "");

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const toggleMarket = (name: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const toggleTrader = (id: number) => {
    setSelectedTraders((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // If already authenticated, go directly to dashboard.
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentHostname(window.location.hostname);
    }
  }, []);

  useEffect(() => {
    const tgError = searchParams.get("tg_error");
    if (!tgError) return;
    const detail = searchParams.get("tg_detail");
    const readable =
      tgError === "missing_hash"
        ? "Telegram widget payload missing hash."
        : tgError === "widget_auth_failed"
          ? `Telegram widget auth failed — ensure the bot domain matches this host.${detail ? ` (${detail})` : ""}`
          : tgError === "missing_token"
            ? "Telegram auth response missing token."
            : tgError === "internal_error"
              ? `Server error during Telegram auth.${detail ? ` ${detail}` : " Please try again or use Dev Login below."}`
              : `Telegram login failed (${tgError}). Please try again.`;
    setLoginError(readable);
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("dev") === "true") {
      setShowDevLogin(true);
    }
  }, [searchParams]);

  // If opened inside Telegram Mini App, prefer secure initData auth.
  useEffect(() => {
    if (step !== 1) return;
    if (typeof window === "undefined") return;
    const telegram = (
      window as Window & {
        Telegram?: { WebApp?: { initData?: string } };
      }
    ).Telegram;
    const initData = telegram?.WebApp?.initData;
    if (!initData) return;

    let cancelled = false;
    (async () => {
      setLoginLoading(true);
      setLoginError(null);
      try {
        await login(initData);
        if (!cancelled) next();
      } catch (err) {
        if (!cancelled) {
          setLoginError(
            err instanceof Error ? err.message : "Telegram Mini App login failed",
          );
        }
      } finally {
        if (!cancelled) setLoginLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, login]);


  // Load Telegram Login Widget script
  useEffect(() => {
    if (step !== 1 || !telegramRef.current) return;
    if (!telegramBotUsername) return;

    // Clear previous widget
    telegramRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", telegramBotUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    // Define the callback globally so the widget can find it
    (window as any).onTelegramAuth = async (user: any) => {
      setLoginLoading(true);
      setLoginError(null);
      try {
        await loginWidget(user);
        next();
      } catch (err) {
        setLoginError(
          err instanceof Error ? err.message : "Telegram login failed",
        );
      } finally {
        setLoginLoading(false);
      }
    };

    telegramRef.current.appendChild(script);

    return;
  }, [step, telegramBotUsername]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 radial-fade" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/heyannalogo.png"
              alt="HeyAnna logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg glow-red"
            />
            <span className="text-lg font-bold">
              Hey<span className="text-red-primary">Anna</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-xs text-muted hover:text-foreground transition-colors">
            Skip to Dashboard →
          </Link>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-12">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-mono font-bold transition-all ${step > s.id
                    ? "bg-green-500 text-white"
                    : step === s.id
                      ? "bg-red-primary text-white glow-red"
                      : "bg-surface border border-border text-muted"
                    }`}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <div className="hidden sm:block mt-2 text-center">
                  <div className="text-xs font-medium">{s.title}</div>
                  <div className="text-[10px] text-muted">{s.subtitle}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-16 h-px mx-2 transition-colors ${step > s.id ? "bg-green-500" : "bg-border"
                  }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Connect */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Connect Your Account</h2>
                  <p className="text-muted">Sign in with Telegram to start trading on Polymarket</p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  {/* Telegram Login Widget */}
                  <div className="w-full flex items-center justify-between p-5 rounded-xl border border-border bg-surface/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Telegram</div>
                        <div className="text-xs text-muted">Sign in to get started</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div ref={telegramRef} className="flex items-center" />
                    </div>
                  </div>

                  <p className="text-[11px] text-muted font-mono">
                    Bot:{" "}
                    <span className="text-foreground">
                      @{telegramBotUsername}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted font-mono">
                    Current host:{" "}
                    <span className="text-foreground">{currentHostname ?? "unknown"}</span>
                  </p>

                  {/* Dev Login (hidden by default, use ?dev=true to show) */}
                  {showDevLogin && (
                    <div className="w-full p-5 rounded-xl border border-dashed border-border bg-surface/30">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">Dev Login</div>
                          <div className="text-[10px] text-muted font-mono tracking-tight leading-none italic opacity-70">Testing/Debug Only</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          defaultValue="1"
                          id="dev-user-id"
                          placeholder="Telegram User ID"
                          className="flex-1 px-3 py-2 text-sm font-mono rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-red-primary/50"
                        />
                        <button
                          onClick={() => {
                            const val = (document.getElementById("dev-user-id") as HTMLInputElement)?.value;
                            if (val) loginManual(Number(val)).then(() => next());
                          }}
                          disabled={loginLoading}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-primary text-white text-sm font-medium hover:bg-red-dark transition-all disabled:opacity-50"
                        >
                          {loginLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ArrowRight className="w-4 h-4" />
                          )}
                          Login
                        </button>
                      </div>
                    </div>
                  )}

                  {loginError && (
                    <div className="text-center text-sm text-red-400 font-mono bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-2">
                      {loginError}
                    </div>
                  )}

                  <button className="w-full flex items-center justify-between p-5 rounded-xl border border-border hover:border-red-primary/30 bg-surface/50 hover:bg-surface transition-all group opacity-50 cursor-not-allowed" disabled>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Elsa AI x402</div>
                        <div className="text-xs text-muted">Enable AI intelligence layer</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-muted border border-border rounded px-2 py-0.5">SOON</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Market Preferences */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Select Your Markets</h2>
                  <p className="text-muted">Choose the prediction market categories you want to trade in</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                  {marketCategories.map((cat) => {
                    const isSelected = selectedMarkets.includes(cat.name);
                    return (
                      <button
                        key={cat.name}
                        onClick={() => toggleMarket(cat.name)}
                        className={`p-4 rounded-xl border text-center transition-all ${isSelected
                          ? "border-red-primary bg-red-primary/10 glow-red"
                          : "border-border bg-surface/50 hover:border-red-primary/20"
                          }`}
                      >
                        <div className="text-2xl mb-1">{cat.icon}</div>
                        <div className="text-sm font-medium">{cat.name}</div>
                        <div className="text-[10px] text-muted font-mono">{cat.count} markets</div>
                        {cat.hot && (
                          <span className="inline-block mt-1 text-[8px] font-mono text-red-primary border border-red-primary/20 rounded px-1">
                            HOT
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-center text-xs text-muted">
                  Selected: <span className="text-red-primary font-mono">{selectedMarkets.length}</span> categories
                </p>
              </div>
            )}

            {/* Step 3: Risk Tolerance */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Define Risk Tolerance</h2>
                  <p className="text-muted">Set your comfort level for automated trade copying</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                  {(
                    [
                      {
                        key: "conservative" as const,
                        icon: Shield,
                        label: "Conservative",
                        desc: "Lower risk, smaller positions. Ideal for beginners.",
                        maxExp: "10%",
                        perTrade: "2%",
                      },
                      {
                        key: "moderate" as const,
                        icon: TrendingUp,
                        label: "Moderate",
                        desc: "Balanced approach. Good risk-to-reward ratio.",
                        maxExp: "25%",
                        perTrade: "5%",
                      },
                      {
                        key: "aggressive" as const,
                        icon: Zap,
                        label: "Aggressive",
                        desc: "Higher risk, larger positions. For experienced traders.",
                        maxExp: "50%",
                        perTrade: "10%",
                      },
                    ] as const
                  ).map((level) => (
                    <button
                      key={level.key}
                      onClick={() => {
                        setRiskLevel(level.key);
                        setMaxExposure(level.key === "conservative" ? 10 : level.key === "moderate" ? 25 : 50);
                      }}
                      className={`p-5 rounded-xl border text-left transition-all ${riskLevel === level.key
                        ? "border-red-primary bg-red-primary/5 glow-red"
                        : "border-border bg-surface/50 hover:border-red-primary/20"
                        }`}
                    >
                      <level.icon className={`w-6 h-6 mb-3 ${riskLevel === level.key ? "text-red-primary" : "text-muted"}`} />
                      <div className="font-semibold mb-1">{level.label}</div>
                      <p className="text-xs text-muted mb-3">{level.desc}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-muted">Max Exposure</span>
                          <span className="text-red-primary">{level.maxExp}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-muted">Per Trade</span>
                          <span className="text-red-primary">{level.perTrade}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="max-w-md mx-auto mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted">Custom Max Exposure</label>
                    <span className="text-sm font-mono font-bold text-red-primary">{maxExposure}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={75}
                    value={maxExposure}
                    onChange={(e) => setMaxExposure(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-red-primary bg-border"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Select Traders */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Pick Traders to Copy</h2>
                  <p className="text-muted">Select top-performing traders to automatically mirror</p>
                </div>

                <div className="space-y-3 max-w-lg mx-auto">
                  {topTraders.map((trader) => {
                    const isSelected = selectedTraders.includes(trader.id);
                    return (
                      <button
                        key={trader.id}
                        onClick={() => toggleTrader(trader.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${isSelected
                          ? "border-red-primary bg-red-primary/5 glow-red"
                          : "border-border bg-surface/50 hover:border-red-primary/20"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${isSelected ? "bg-red-primary text-white" : "bg-red-primary/10 text-red-primary"
                            }`}>
                            {trader.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{trader.name}</div>
                            <div className="flex items-center gap-2 text-[10px] text-muted">
                              <Flame className="w-2.5 h-2.5 text-red-primary" />
                              {trader.streak} streak &bull; {trader.trades} trades
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-mono font-bold text-green-500">{trader.winRate}%</div>
                            <div className="text-[10px] text-muted">{trader.pnl}</div>
                          </div>
                          <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${isSelected ? "bg-red-primary border-red-primary" : "border-border"
                            }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-center text-xs text-muted">
                  Copying: <span className="text-red-primary font-mono">{selectedTraders.length}</span> traders
                </p>
              </div>
            )}

            {/* Step 5: Launch */}
            {step === 5 && (
              <div className="space-y-8 text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-red-primary/10 border border-red-primary/20 flex items-center justify-center mx-auto mb-6 glow-red-strong">
                    <Zap className="w-10 h-10 text-red-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">You&apos;re All Set!</h2>
                  <p className="text-muted">HeyAnna will now automatically copy trades from your selected traders</p>
                </div>

                <div className="max-w-md mx-auto p-6 rounded-xl border border-border bg-surface/50 text-left space-y-3">
                  <h4 className="text-sm font-semibold mb-3">Configuration Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Markets</span>
                    <span className="font-mono text-red-primary">{selectedMarkets.length} selected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Risk Profile</span>
                    <span className="font-mono text-red-primary capitalize">{riskLevel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Max Exposure</span>
                    <span className="font-mono text-red-primary">{maxExposure}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Copied Traders</span>
                    <span className="font-mono text-red-primary">{selectedTraders.length}</span>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-red-primary text-white font-medium hover:bg-red-dark transition-all glow-red-strong"
                >
                  Launch Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex items-center justify-between mt-12">
            <button
              onClick={prev}
              disabled={step === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all ${step === 1
                ? "text-muted/30 cursor-not-allowed"
                : "text-muted hover:text-foreground border border-border hover:border-red-primary/30"
                }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-primary text-white text-sm font-medium hover:bg-red-dark transition-all glow-red"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted" />
        </div>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  );
}
