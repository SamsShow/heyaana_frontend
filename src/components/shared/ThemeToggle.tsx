"use client";

import { useTheme } from "@/lib/theme";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-all duration-200 group"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-foreground group-hover:text-blue-primary transition-colors" />
      ) : (
        <Moon className="w-4 h-4 text-foreground group-hover:text-blue-primary transition-colors" />
      )}
    </button>
  );
}
