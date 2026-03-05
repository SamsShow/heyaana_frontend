"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@/lib/wallet";
import { Wallet, ChevronDown, LogOut, Copy, Check, AlertCircle, Loader2 } from "lucide-react";

export function WalletConnect({ compact = false }: { compact?: boolean }) {
    const { address, balance, isConnected, isConnecting, error, truncated, connect, disconnect } = useWallet();
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const copyAddress = async () => {
        if (!address) return;
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    // Not connected
    if (!isConnected) {
        return (
            <div className="relative">
                <button
                    onClick={connect}
                    disabled={isConnecting}
                    className={`flex items-center gap-1.5 font-mono font-medium transition-all rounded border ${
                        compact
                            ? "px-2 py-1 text-[10px] border-blue-primary/40 bg-blue-primary/10 text-blue-primary hover:bg-blue-primary/20"
                            : "px-3 py-1.5 text-xs border-blue-primary/40 bg-blue-primary/10 text-blue-primary hover:bg-blue-primary/20"
                    } disabled:opacity-50`}
                >
                    {isConnecting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <Wallet className="w-3 h-3" />
                    )}
                    {isConnecting ? "Connecting…" : "Connect Wallet"}
                </button>
                {error && (
                    <div className="absolute top-full mt-1 right-0 flex items-center gap-1 text-[10px] text-red-400 font-mono whitespace-nowrap bg-background border border-red-500/20 px-2 py-1 rounded-lg z-50">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // Connected
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen((o) => !o)}
                className={`flex items-center gap-1.5 font-mono transition-all rounded border border-border bg-surface hover:bg-surface-hover ${
                    compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-[11px]"
                }`}
            >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                <span className="text-foreground">{truncated}</span>
                {balance && !compact && (
                    <span className="text-muted border-l border-border pl-1.5 ml-0.5">
                        {balance} ETH
                    </span>
                )}
                <ChevronDown className={`w-3 h-3 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-xl shadow-xl shadow-black/30 z-50 overflow-hidden">
                    {/* Address */}
                    <div className="px-3 py-2.5 border-b border-border">
                        <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Connected</div>
                        <div className="text-xs font-mono text-foreground break-all">{address}</div>
                        {balance && (
                            <div className="text-[10px] text-muted font-mono mt-1">{balance} ETH</div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-1">
                        <button
                            onClick={copyAddress}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg hover:bg-surface transition-all text-left"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                            {copied ? "Copied!" : "Copy address"}
                        </button>
                        <button
                            onClick={() => { disconnect(); setOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg hover:bg-surface transition-all text-left text-red-400 hover:text-red-300"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Disconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
