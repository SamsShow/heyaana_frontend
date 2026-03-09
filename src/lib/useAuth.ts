"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  loginTelegram,
  loginWidgetTelegram,
  loginManual as loginManualApi,
  logout as logoutApi,
  api2Fetch,
  TOKEN_STORAGE_KEY,
  type UserProfile,
} from "./auth-api";

const ME_KEY = "/me";

type UseAuthOptions = {
  probeOnboarding?: boolean;
};

async function meFetcher(path: string): Promise<UserProfile | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await api2Fetch(path, undefined, { signal: controller.signal });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw new Error("Session check timed out");
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export function useAuth(options?: UseAuthOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const probeOnboarding = options?.probeOnboarding ?? false;
  // Read token on each render so it updates after login (useState would stay stale)
  const hasSessionToken = typeof window !== "undefined" ? !!localStorage.getItem(TOKEN_STORAGE_KEY) : false;

  // Don't probe /me on unauthenticated pages — avoids a noisy 401 in the console
  const onOnboarding = pathname === "/onboarding" || pathname === "/onboarding/";
  const skipFetch = pathname === "/" || !hasSessionToken || (onOnboarding && !probeOnboarding);

  const {
    data: user,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<UserProfile | null>(skipFetch ? null : ME_KEY, meFetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const isAuthenticated = !!user;

  /** Login via Telegram Mini App init_data */
  const login = useCallback(
    async (initData: string) => {
      await loginTelegram(initData);
      await mutate(); // re-fetch /me
    },
    [mutate],
  );

  /** Login with manual user_id (dev/testing only) */
  const loginManual = useCallback(
    async (userId: number) => {
      await loginManualApi(userId);
      await mutate();
    },
    [mutate],
  );

  const loginWidget = useCallback(
    async (user: any) => {
      await loginWidgetTelegram(user);
      await mutate();
    },
    [mutate],
  );

  /** Logout — clear session, redirect to home */
  const logout = useCallback(async () => {
    await logoutApi();
    await mutate(null, { revalidate: false });
    router.push("/");
  }, [mutate, router]);

  return {
    user,
    error,
    isLoading,
    isValidating,
    hasSessionToken,
    isAuthenticated,
    login,
    loginWidget,
    loginManual,
    logout,
  };
}
