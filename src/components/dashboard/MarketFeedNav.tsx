"use client";

import useSWR from "swr";
import { LayoutGrid, List, Bookmark, SlidersHorizontal } from "lucide-react";
import { fetchGammaCategories, type GammaCategory } from "@/lib/api";

export type ViewMode = "events" | "markets";

const TRENDING_URL =
  "/api/gamma?active=true&closed=false&limit=100&order=volume&ascending=false";

interface Props {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  tagId: number | null;
  setTagId: (id: number | null) => void;
}

export function MarketFeedNav({ viewMode, setViewMode, tagId, setTagId }: Props) {
  const { data: categories = [] } = useSWR<GammaCategory[]>(
    TRENDING_URL,
    fetchGammaCategories,
    { revalidateOnFocus: false, dedupingInterval: 300_000 },
  );

  const visibleCats = categories;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border-color)] flex-shrink-0 overflow-x-auto">
      {/* View toggle icons */}
      <div className="flex items-center gap-0.5 mr-1 flex-shrink-0">
        <button className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors">
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors">
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Watchlist + Events/Markets tabs */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-full whitespace-nowrap">
          <Bookmark className="w-3.5 h-3.5" />
          Watchlist
        </button>
        {(["events", "markets"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors capitalize whitespace-nowrap ${
              viewMode === mode
                ? "bg-[var(--blue-primary)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5"
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-[var(--border-color)] mx-1 flex-shrink-0" />

      {/* Dynamic category pills from Gamma API */}
      <div className="flex items-center gap-1">
        {/* "All" pill */}
        <button
          onClick={() => setTagId(null)}
          className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
            tagId === null
              ? "bg-white/10 text-[var(--foreground)] font-medium"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5"
          }`}
        >
          All
        </button>

        {visibleCats.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setTagId(cat.id)}
            className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
              tagId === cat.id
                ? "bg-white/10 text-[var(--foreground)] font-medium"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5"
            }`}
          >
            {cat.label}
          </button>
        ))}

      </div>

      {/* Filters button */}
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--blue-primary)] text-white text-sm rounded-full font-medium ml-auto flex-shrink-0">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filters
      </button>
    </div>
  );
}
