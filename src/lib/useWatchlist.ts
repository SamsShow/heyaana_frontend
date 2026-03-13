"use client";

import { useState, useEffect, useCallback } from "react";

export interface WatchlistItem {
  conditionId: string;
  title: string;
  image?: string;
  slug?: string;
}

const STORAGE_KEY = "heyanna_watchlist";

function loadWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WatchlistItem[]) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(items: WatchlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable
  }
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setWatchlist(loadWatchlist());
  }, []);

  const isWatched = useCallback(
    (conditionId: string) => watchlist.some((w) => w.conditionId === conditionId),
    [watchlist],
  );

  const toggleWatch = useCallback((item: WatchlistItem) => {
    setWatchlist((prev) => {
      const exists = prev.some((w) => w.conditionId === item.conditionId);
      const next = exists
        ? prev.filter((w) => w.conditionId !== item.conditionId)
        : [...prev, item];
      saveWatchlist(next);
      return next;
    });
  }, []);

  const removeWatch = useCallback((conditionId: string) => {
    setWatchlist((prev) => {
      const next = prev.filter((w) => w.conditionId !== conditionId);
      saveWatchlist(next);
      return next;
    });
  }, []);

  return { watchlist, isWatched, toggleWatch, removeWatch };
}
