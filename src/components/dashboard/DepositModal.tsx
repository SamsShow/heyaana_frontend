"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Info } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import useSWR from "swr";
import { proxyFetcher } from "@/lib/api";

interface DepositModalProps {
  onClose: () => void;
}

export function DepositModal({ onClose }: DepositModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);

  // Always fetch — user.wallet_address may be null even when logged in
  const { data: walletData, isLoading } = useSWR<Record<string, string>>(
    isAuthenticated ? "/api/proxy/me/wallet/address" : null,
    proxyFetcher,
    { revalidateOnFocus: false }
  );

  const address =
    user?.wallet_address ??
    walletData?.address ??
    walletData?.wallet_address ??
    walletData?.eth_address ??
    "";

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-[420px] mx-4 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden"
        style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, #111118 30%, #0E0E15 100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <h2 className="text-base font-bold">Deposit</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Token + Chain selectors (static) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wide mb-1.5">Supported token</p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                {/* USDC logo */}
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-white">$</span>
                </div>
                <span className="text-sm font-semibold">USDC</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-mono text-muted uppercase tracking-wide">Supported chain</p>
                <span className="text-[10px] font-mono text-muted">$15+ min</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                {/* Polygon logo */}
                <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-white">P</span>
                </div>
                <span className="text-sm font-semibold">Polygon</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="relative p-3 rounded-2xl bg-white shadow-lg">
              {address ? (
                <QRCodeSVG
                  value={address}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                  includeMargin={false}
                />
              ) : (
                <div className="w-[180px] h-[180px] flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
                  {!isLoading && <p className="text-[10px] text-gray-400 font-mono text-center px-4">No wallet address found</p>}
                </div>
              )}
              {/* Polygon badge on QR */}
              <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">P</span>
              </div>
            </div>
          </div>

          {/* Address label */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <p className="text-xs font-semibold text-foreground/80">Your deposit address</p>
              <Info className="w-3 h-3 text-muted/60" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <span className="flex-1 text-xs font-mono text-muted/80 truncate">
                {address || "Loading…"}
              </span>
              <button
                onClick={copyAddress}
                className="shrink-0 text-muted hover:text-foreground transition-colors p-0.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Copy address button */}
          <button
            onClick={copyAddress}
            disabled={!address}
            className="w-full py-3 text-sm font-semibold rounded-xl bg-blue-primary text-white hover:bg-blue-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy address</>}
          </button>

          {/* Price impact */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-muted">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <span className="text-[8px] font-bold text-white">$</span>
            </div>
            Price impact: <span className="text-emerald-400 font-semibold">0.00%</span>
          </div>

          {/* Note */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[11px] text-foreground/60 leading-relaxed">
              <span className="font-semibold text-foreground/80">Note:</span>{" "}
              Send USDC directly to your wallet address. No fees. All deposits are automatically converted to USDC on Polygon for trading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
