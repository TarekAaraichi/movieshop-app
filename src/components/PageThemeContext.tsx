"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { Sun, Moon } from "lucide-react";

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
    setMounted(true);
  }, []);

  const value = { theme, setTheme };

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
    <button
      className="p-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle page theme"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export const PageWrapper = ({ children }: { children: ReactNode }) => {
  const { theme } = usePageTheme();
  return (
    <div className={theme}>
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-purple-100 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 text-black dark:text-white rounded-lg p-4 sm:p-6 transition-colors">
        {children}
      </div>
    </div>
  );
};
