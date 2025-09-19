"use client";

import React from "react";
import Link from "next/link";
import CartCountBadge from "@/components/CartCountBadge";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type NavBarClientProps = {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
};

type MeResponse = {
  id: string;
  role?: string | null;
};

export default function NavBarClient({
  isAuthenticated: propIsAuthenticated,
  isAdmin: propIsAdmin,
}: NavBarClientProps) {
  const router = useRouter();
  const [state, setState] = React.useState({
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
  });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try to get a client-session first (authClient may expose this)
        const session = typeof authClient.getSession === "function"
          ? await authClient.getSession()
          : null;

        if (session?.user?.id) {
          // If we have a session user id, fetch the authoritative role from the server DB.
          // Expects a server route that returns the current user record, e.g. /api/users/me
          const res = await fetch("/api/users/me", { credentials: "include" });
          if (!mounted) return;
          if (res.ok) {
            const me = (await res.json()) as MeResponse;
            setState({
              loading: false,
              isAuthenticated: true,
              isAdmin: me.role?.toLowerCase() === "admin" || me.role === "ADMIN",
            });
            return;
          }

          // If the endpoint isn't available or failed, fall back to trusting the session (no admin)
          setState({ loading: false, isAuthenticated: true, isAdmin: false });
          return;
        }

        // No session -> visitor
        if (mounted) setState({ loading: false, isAuthenticated: false, isAdmin: false });
      } catch {
        if (mounted) setState({ loading: false, isAuthenticated: false, isAdmin: false });
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Prefer explicit props from parent when provided; otherwise use resolved state.
  const isAuthenticated = typeof propIsAuthenticated === "boolean" ? propIsAuthenticated : state.isAuthenticated;
  const isAdmin = typeof propIsAdmin === "boolean" ? propIsAdmin : state.isAdmin;

  // Admin navbar
  if (isAuthenticated && isAdmin) {
    return (
      <nav className="container mx-auto flex justify-between items-center p-4">
        <div className="text-2xl font-bold tracking-wide">
          <Link
            href="/"
            className="text-teal-400 hover:text-teal-300 focus:text-teal-300 active:text-teal-500 transition"
          >
            MovieShop (Admin)
          </Link>
        </div>
        <div className="flex gap-6 items-center">
          <Link
            href="/movies"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
          >
            Movies
          </Link>
          <Link
            href="/admin"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
          >
            Admin Panel
          </Link>
          <Link
            href="/admin/users"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
          >
            Users
          </Link>
          <Link
            href="/cart"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition flex items-center"
          >
            Cart <CartCountBadge />
          </Link>
          <button
            type="button"
            className="ml-auto bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded transition-shadow focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            onClick={() => {
              if (confirm("Are you sure you want to sign out?")) {
                authClient.signOut?.({
                  fetchOptions: {
                    onRequest: () => {
                      router.push("/");
                      router.refresh();
                    },
                  },
                });
              }
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>
    );
  }

  // Authenticated (regular user) navbar
  if (isAuthenticated) {
    return (
      <nav className="container mx-auto flex justify-between items-center p-4">
        <div className="text-2xl font-bold tracking-wide">
          <Link
            href="/"
            className="text-teal-400 hover:text-teal-300 focus:text-teal-300 active:text-teal-500 transition"
          >
            MovieShop
          </Link>
        </div>
        <div className="flex gap-6 items-center">
          <Link
            href="/movies"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
          >
            Movies
          </Link>
          <Link
            href="/cart"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition flex items-center"
          >
            Cart <CartCountBadge />
          </Link>
          <Link
            href="/profile"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
          >
            My Account
          </Link>
          <Link
            href="/orders"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
          >
            Orders
          </Link>
          <button
            type="button"
            className="ml-auto bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded transition-shadow focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            onClick={() => {
              if (confirm("Are you sure you want to sign out?")) {
                authClient.signOut?.({
                  fetchOptions: {
                    onRequest: () => {
                      router.push("/");
                      router.refresh();
                    },
                  },
                });
              }
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>
    );
  }

  // Visitor (not authenticated) navbar
  return (
    <nav className="container mx-auto flex justify-between items-center p-4">
      <div className="text-2xl font-bold tracking-wide">
        <Link
          href="/"
          className="text-teal-400 hover:text-teal-300 focus:text-teal-300 active:text-teal-500 transition"
        >
          MovieShop
        </Link>
      </div>
      <div className="flex gap-6 items-center">
        <Link
          href="/movies"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Movies
        </Link>
        <Link
          href="/cart"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition flex items-center"
        >
          Cart <CartCountBadge />
        </Link>
        <Link
          href="/about"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          About Us
        </Link>
        <Link
          href="/contact"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Contact
        </Link>
        <button
          type="button"
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
          onClick={() => {
            router.push("/sign-in");
            router.refresh();
          }}
        >
          Sign In
        </button>
      </div>
    </nav>
  );
}
