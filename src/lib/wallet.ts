"use client";

import { useState, useEffect, useCallback } from "react";

export type WalletState = {
    address: string | null;
    balance: string | null;
    isConnecting: boolean;
    isConnected: boolean;
    error: string | null;
    chainId: number | null;
};

declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, handler: (...args: unknown[]) => void) => void;
            removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
            isMetaMask?: boolean;
        };
    }
}

function truncateAddress(address: string): string {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatBalance(balanceHex: string): string {
    const wei = BigInt(balanceHex);
    const eth = Number(wei) / 1e18;
    return eth.toFixed(4);
}

export function useWallet() {
    const [state, setState] = useState<WalletState>({
        address: null,
        balance: null,
        isConnecting: false,
        isConnected: false,
        error: null,
        chainId: null,
    });

    const fetchBalance = useCallback(async (address: string) => {
        if (!window.ethereum) return;
        try {
            const balanceHex = await window.ethereum.request({
                method: "eth_getBalance",
                params: [address, "latest"],
            }) as string;
            setState((prev) => ({ ...prev, balance: formatBalance(balanceHex) }));
        } catch {
            // ignore balance fetch errors
        }
    }, []);

    // Restore previously connected wallet on mount
    useEffect(() => {
        if (typeof window === "undefined" || !window.ethereum) return;

        (async () => {
            try {
                const accounts = await window.ethereum!.request({ method: "eth_accounts" }) as string[];
                if (accounts.length > 0) {
                    const chainIdHex = await window.ethereum!.request({ method: "eth_chainId" }) as string;
                    setState((prev) => ({
                        ...prev,
                        address: accounts[0],
                        isConnected: true,
                        chainId: parseInt(chainIdHex, 16),
                    }));
                    fetchBalance(accounts[0]);
                }
            } catch {
                // not connected
            }
        })();

        const handleAccountsChanged = (accounts: unknown) => {
            const accs = accounts as string[];
            if (accs.length === 0) {
                setState({ address: null, balance: null, isConnecting: false, isConnected: false, error: null, chainId: null });
            } else {
                setState((prev) => ({ ...prev, address: accs[0], isConnected: true }));
                fetchBalance(accs[0]);
            }
        };

        const handleChainChanged = (chainId: unknown) => {
            setState((prev) => ({ ...prev, chainId: parseInt(chainId as string, 16) }));
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        return () => {
            window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum?.removeListener("chainChanged", handleChainChanged);
        };
    }, [fetchBalance]);

    const connect = useCallback(async () => {
        if (!window.ethereum) {
            setState((prev) => ({ ...prev, error: "No wallet detected. Install MetaMask." }));
            return;
        }
        setState((prev) => ({ ...prev, isConnecting: true, error: null }));
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
            const chainIdHex = await window.ethereum.request({ method: "eth_chainId" }) as string;
            setState((prev) => ({
                ...prev,
                address: accounts[0],
                isConnected: true,
                isConnecting: false,
                chainId: parseInt(chainIdHex, 16),
                error: null,
            }));
            fetchBalance(accounts[0]);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Connection rejected";
            setState((prev) => ({ ...prev, isConnecting: false, error: msg }));
        }
    }, [fetchBalance]);

    const disconnect = useCallback(() => {
        setState({ address: null, balance: null, isConnecting: false, isConnected: false, error: null, chainId: null });
    }, []);

    const truncated = state.address ? truncateAddress(state.address) : null;

    return { ...state, truncated, connect, disconnect };
}
