"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("heyana-theme") as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("heyana-theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
