"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { TOKEN_STORAGE_KEY } from "@/lib/auth-api";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading, error } = useAuth();
    const router = useRouter();

    // Read token synchronously on first render — avoids a flash redirect while
    // SWR is still in-flight on page load (isLoading briefly false before fetch starts).
    const [hasToken] = useState(() => {
        if (typeof window === "undefined") return true; // SSR: optimistic
        return !!localStorage.getItem(TOKEN_STORAGE_KEY);
    });

    useEffect(() => {
        // No token at all — send straight to onboarding.
        if (!hasToken) {
            router.replace("/onboarding");
            return;
        }
        // Token exists but server confirmed it's invalid/expired.
        if (!isLoading && !isAuthenticated) {
            // Clear the stale token so the user isn't stuck in a redirect loop.
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            router.replace("/onboarding");
        }
    }, [isAuthenticated, isLoading, hasToken, router]);

    // No token — redirect pending, render nothing.
    if (!hasToken) return null;

    // Token exists, SWR still verifying.
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-primary mb-4" />
                <p className="text-sm font-mono text-muted animate-pulse">Verifying session…</p>
            </div>
        );
    }

    // Network error — don't redirect, show a retry prompt instead of bouncing to onboarding.
    if (error && !isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-3">
                <p className="text-sm font-mono text-red-400">Failed to reach server.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-xs font-mono text-muted underline hover:text-foreground"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Token confirmed invalid by server — redirect pending.
    if (!isAuthenticated) return null;

    return <>{children}</>;
}
