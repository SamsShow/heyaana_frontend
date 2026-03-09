"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { TOKEN_STORAGE_KEY } from "@/lib/auth-api";

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

    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        // No token at all — send straight to onboarding.
        if (!hasToken) {
            router.replace("/onboarding");
            return;
        }
        // Token exists but server confirmed it's invalid/expired.
        // Don't redirect on transient network errors.
        if (!isLoading && !error && !isAuthenticated) {
            // Clear the stale token so the user isn't stuck in a redirect loop.
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            setRedirecting(true);
            router.replace("/onboarding");
        }
    }, [isAuthenticated, isLoading, error, hasToken, router]);

    // No token or already redirecting — render nothing immediately.
    if (!hasToken || redirecting) return null;

    // Token exists but auth isn't resolved yet: do not render protected content yet.
    if (isLoading) return null;

    // Network error while unauthenticated — keep guard closed.
    if (error && !isAuthenticated) {
        return null;
    }

    // Token confirmed invalid by server — redirect pending.
    if (!isAuthenticated) return null;

    return <>{children}</>;
}
