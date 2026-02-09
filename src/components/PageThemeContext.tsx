"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

interface PageThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const PageThemeContext = createContext<PageThemeContextType | null>(null);

export const usePageTheme = () => {
  const context = useContext(PageThemeContext);
  if (!context) {
    throw new Error("usePageTheme must be used within a PageThemeProvider");
  }
  return context;
};

export const PageThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // determine initial theme: localStorage -> prefers-color-scheme -> default dark
    // Only honor an explicit user choice stored in localStorage.
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    let initial: Theme = "light"; // default to light when user hasn't chosen
    if (stored === "light" || stored === "dark") {
      initial = stored as Theme;
    }
    setTheme(initial);
    // apply to body
    try {
      if (typeof document !== "undefined") {
        document.body.classList.remove("light", "dark");
        document.body.classList.add(initial === "dark" ? "dark" : "light");
      }
    } catch {}
    setMounted(true);
  }, []);

  const value = { theme, setTheme };
  // Keep body class in sync when theme changes
  useEffect(() => {
    try {
      if (typeof document !== "undefined") {
        document.body.classList.remove("light", "dark");
        document.body.classList.add(theme === "dark" ? "dark" : "light");
      }
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  // Prevent hydration mismatch on server by rendering nothing until mounted
  if (!mounted) {
    return null;
  }

  return (
    <PageThemeContext.Provider value={value}>
      {children}
    </PageThemeContext.Provider>
  );
};

export const PageThemeSwitcher = () => {
  const { theme, setTheme } = usePageTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle page theme"
      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-popover"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );
};

export const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col grow">
      <div className="grow rounded-lg">{children}</div>
    </div>
  );
};
