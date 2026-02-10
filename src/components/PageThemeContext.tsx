"use client";

import { type ReactNode } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "./theme-provider";

export const PageThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="theme"
    >
      {children}
    </ThemeProvider>
  );
};

export const PageThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle page theme"
      className="p-2 rounded-full hover:bg-accent"
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
