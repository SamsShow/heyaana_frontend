"use client";

export type ParsedMarketTitle = {
  displayTitle: string;
  subtitle: string | null;
  isComposite: boolean;
  legCount: number;
};

function formatClause(clause: string): string {
  const trimmed = clause.trim();
  const yesMatch = trimmed.match(/^yes\s+(.+)$/i);
  if (yesMatch) return `Yes: ${yesMatch[1]}`;
  const noMatch = trimmed.match(/^no\s+(.+)$/i);
  if (noMatch) return `No: ${noMatch[1]}`;
  return trimmed;
}

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

  const title = rawTitle.trim();
  const clauses = title
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const yesNoCount = clauses.filter((part) => /^(yes|no)\s+/i.test(part)).length;
  const isComposite = clauses.length >= 4 && yesNoCount >= Math.ceil(clauses.length * 0.6);

  if (!isComposite) {
    return {
      displayTitle: title,
      subtitle: null,
      isComposite: false,
      legCount: clauses.length,
    };
  }

  const formatted = clauses.map(formatClause);
  const preview = formatted.slice(0, 2).join(" | ");
  const hiddenCount = Math.max(0, formatted.length - 2);
  const subtitle = hiddenCount > 0 ? `${preview} | +${hiddenCount} more` : preview;

  return {
    displayTitle: `Multi-leg market (${formatted.length} conditions)`,
    subtitle,
    isComposite: true,
    legCount: formatted.length,
  };
}
