"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  loginTelegram,
  loginManual as loginManualApi,
  logout as logoutApi,
  type UserProfile,
} from "./auth-api";

const ME_KEY = "/api/auth/me";

async function meFetcher(url: string): Promise<UserProfile | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't probe /me on unauthenticated pages — avoids a noisy 401 in the console
  const skipFetch = pathname === "/" || pathname === "/onboarding";

  const {
    data: user,
    error,
    isLoading,
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
    isAuthenticated,
    login,
    loginManual,
    logout,
  };
}
