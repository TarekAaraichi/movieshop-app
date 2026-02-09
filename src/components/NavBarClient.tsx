"use client";

/**
 * NavBarClient
 * Client-only navigation bar shown on pages that require client interactivity.
 * Contains search, cart count, and user menu controls.
 */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartCountBadge } from "@/components";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type NavBarProps = {
  isAuthenticated?: boolean;
};

export default function NavBarClient({ isAuthenticated = false }: NavBarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleSignOut = async () => {
    // Close menu immediately for better UX
    setMenuOpen(false);
    try {
      await authClient.signOut({
        fetchOptions: {
          onResponse: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch {
      router.push("/");
      router.refresh();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  if (isAuthenticated) {
    return (
      <nav className="container mx-auto flex justify-between items-center p-4">
        <div className="text-2xl font-bold tracking-wide">
          <Link
            href="/"
            className="text-foreground hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition"
          >
            MovieShop (Admin)
          </Link>
        </div>

        <div className="flex gap-6 items-center">
          <Link
            href="/movies"
            className="hover:bg-blue-900 dark:hover:bg-popover hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition"
          >
            Movies
          </Link>

          <Link
            href="/admin"
            className="hover:bg-slate-100 dark:hover:bg-popover hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition"
          >
            Admin Panel
          </Link>

          <Link
            href="/cart"
            className="hover:bg-slate-100 dark:hover:bg-popover hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition flex items-center"
          >
            Cart <CartCountBadge />
          </Link>

          <div className="ml-auto flex items-center gap-3" ref={menuRef}>
            <Link
              href="/profile"
              className="hidden sm:inline-block hover:bg-slate-100 dark:hover:bg-popover hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition"
            >
              Profile
            </Link>

            <Button
              type="button"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label="User menu"
              onClick={() => setMenuOpen((s) => !s)}
              className="inline-flex items-center justify-center rounded-full w-9 h-9 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2"
              variant="ghost"
              size="icon"
            >
              {/* fallback avatar (SVG) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-muted"
                aria-hidden
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </Button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-4 mt-14 w-44 bg-popover text-foreground border border-border rounded-md shadow-lg py-1 z-50"
              >
                <Link
                  href="/profile"
                  role="menuitem"
                  className="block px-3 py-2 text-sm text-foreground hover:bg-slate-100 dark:hover:bg-popover hover:text-foreground first:rounded-t-md last:rounded-b-md mx-1 my-1 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Button
                  role="menuitem"
                  variant="ghost"
                  size="default"
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-slate-100 dark:hover:bg-popover hover:text-foreground first:rounded-t-md last:rounded-b-md mx-1 my-1 transition"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  if (isAuthenticated) {
    return (
      <nav className="container mx-auto flex justify-between items-center p-4">
        <div className="text-2xl font-bold tracking-wide">
          <Link
            href="/"
            className="text-foreground hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition"
          >
            MovieShop
          </Link>
        </div>
        <div className="flex gap-6 items-center">
          <Link
            href="/movies"
            className="hover:bg-slate-100 dark:hover:bg-popover hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition"
          >
            Movies
          </Link>
          <Link
            href="/cart"
            className="hover:bg-slate-100 dark:hover:bg-popover hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition flex items-center"
          >
            Cart <CartCountBadge />
          </Link>
          <div className="ml-auto flex items-center gap-3" ref={menuRef}>
            <Link
              href="/profile"
              className="hidden sm:inline-block hover:bg-slate-100 dark:hover:bg-popover hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition"
            >
              Profile
            </Link>
            <Button
              type="button"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label="User menu"
              onClick={() => setMenuOpen((s) => !s)}
              className="inline-flex items-center justify-center rounded-full w-9 h-9 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2"
              variant="ghost"
              size="icon"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-muted"
                aria-hidden
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </Button>
            {menuOpen && (
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-4 mt-14 w-44 bg-popover text-foreground border border-border rounded-md shadow-lg py-1 z-50"
              >
                <Link
                  href="/profile"
                  role="menuitem"
                  className="block px-3 py-2 text-sm text-foreground hover:bg-slate-100 dark:hover:bg-popover hover:text-foreground first:rounded-t-md last:rounded-b-md mx-1 my-1 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Button
                  role="menuitem"
                  variant="ghost"
                  size="default"
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-slate-100 dark:hover:bg-popover hover:text-foreground first:rounded-t-md last:rounded-b-md mx-1 my-1 transition"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="container mx-auto flex justify-between items-center p-4">
      <div className="text-2xl font-bold tracking-wide">
        <Link
          href="/"
          className="text-foreground hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition"
        >
          MovieShop
        </Link>
      </div>
      <div className="flex gap-6 items-center">
        <Link
          href="/movies"
          className="hover:bg-slate-100 dark:hover:bg-popover hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition"
        >
          Movies
        </Link>
        <Link
          href="/cart"
          className="hover:bg-slate-100 dark:hover:bg-popover hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 active:text-blue-700 transition flex items-center"
        >
          Cart <CartCountBadge />
        </Link>
        <Button
          onClick={() => {
            router.push("/sign-in");
            router.refresh();
          }}
          className="ml-auto px-3 py-1 rounded transition"
        >
          Sign In
        </Button>
      </div>
    </nav>
  );
}
