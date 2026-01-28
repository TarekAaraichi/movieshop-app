"use client";

import React, { useEffect, useState } from "react";

const STORAGE_KEY = "site-theme";

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark") return true;
      if (saved === "light") return false;
      // default to system preference
      return (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {}
    applyTheme(isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      onClick={() => setIsDark((v) => !v)}
      className={`px-3 py-2 rounded-md text-sm leading-none border transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isDark
          ? "bg-gray-700 text-gray-100 border-gray-600 shadow-sm"
          : "bg-transparent text-gray-300 border-transparent"
      }`}
    >
      <span className="sr-only">Toggle theme</span>
      <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
    </button>
  );
}
