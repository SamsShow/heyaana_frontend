"use client";

export type ParsedMarketTitle = {
  displayTitle: string;
  subtitle: string | null;
  isComposite: boolean;
  legCount: number;
};

export function parseMarketTitle(rawTitle: string | null | undefined): ParsedMarketTitle {
  const fallback = "Untitled market";
  if (!rawTitle || !rawTitle.trim()) {
    return {
      displayTitle: fallback,
      subtitle: null,
      isComposite: false,
      legCount: 0,
    };
  }

  return {
    displayTitle: rawTitle.trim(),
    subtitle: null,
    isComposite: false,
    legCount: 1,
  };
}
