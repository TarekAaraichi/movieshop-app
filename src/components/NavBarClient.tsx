"use client";

import React from "react";
import Link from "next/link";
import CartCountBadge from "@/components/CartCountBadge";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";

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

  const pathname = usePathname();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try to get a client-session first (authClient may expose this)
        const session =
          typeof authClient.getSession === "function"
            ? await authClient.getSession()
            : null;

        // Narrow session with a small type-guard to avoid `any` and satisfy eslint
        // Accept multiple session shapes that authClient may return: { user } or { data: { user } }
        function extractUser(s: unknown): { id?: string } | null {
          if (!s || typeof s !== "object") return null;
          const maybe = s as Record<string, unknown>;
          if (maybe.user && typeof maybe.user === "object") {
            const user = maybe.user as Record<string, unknown>;
            return { id: typeof user.id === "string" ? user.id : undefined };
          }
          if (maybe.data && typeof maybe.data === "object") {
            const data = maybe.data as Record<string, unknown>;
            if (data.user && typeof data.user === "object") {
              const user = data.user as Record<string, unknown>;
              return { id: typeof user.id === "string" ? user.id : undefined };
            }
          }
          return null;
        }

        // Start with the client session; most client SDKs expose this and it's reliable
        const extractedUser = extractUser(session);
        if (extractedUser?.id) {
          // Optimistically show authenticated UI; attempt to augment role info from server
          setState({ loading: false, isAuthenticated: true, isAdmin: false });
          try {
            const res = await fetch("/api/users/me", {
              credentials: "include",
            });
            if (!mounted) return;
            if (res.ok) {
              const me = (await res.json()) as MeResponse;
              setState({
                loading: false,
                isAuthenticated: true,
                isAdmin:
                  me.role?.toLowerCase() === "admin" || me.role === "ADMIN",
              });
            }
          } catch {
            // ignore network errors; keep optimistic authenticated UI
          }
          return;
        }

        // If no session detected yet, poll briefly for session changes (helps when
        // the user signs in via a popup/redirect and client SDK updates shortly after)
        if (mounted && !extractedUser) {
          let attempts = 0;
          const maxAttempts = 6; // ~3 seconds total
          const interval = 500; // ms
          const id = setInterval(async () => {
            attempts += 1;
            try {
              const maybe =
                typeof authClient.getSession === "function"
                  ? await authClient.getSession()
                  : null;
              const polled = extractUser(maybe);
              if (polled?.id) {
                // stop polling and set authenticated
                clearInterval(id);
                if (!mounted) return;
                setState({
                  loading: false,
                  isAuthenticated: true,
                  isAdmin: false,
                });
                try {
                  const res = await fetch("/api/users/me", {
                    credentials: "include",
                  });
                  if (!mounted) return;
                  if (res.ok) {
                    const me = (await res.json()) as MeResponse;
                    setState({
                      loading: false,
                      isAuthenticated: true,
                      isAdmin:
                        me.role?.toLowerCase() === "admin" ||
                        me.role === "ADMIN",
                    });
                  }
                } catch {
                  // ignore
                }
              } else if (attempts >= maxAttempts) {
                clearInterval(id);
                if (!mounted) return;
                setState({
                  loading: false,
                  isAuthenticated: false,
                  isAdmin: false,
                });
              }
            } catch {
              clearInterval(id);
              if (!mounted) return;
              setState({
                loading: false,
                isAuthenticated: false,
                isAdmin: false,
              });
            }
          }, interval);
        }

        // No session -> visitor
        if (mounted)
          setState({ loading: false, isAuthenticated: false, isAdmin: false });
      } catch {
        if (mounted)
          setState({ loading: false, isAuthenticated: false, isAdmin: false });
      }
    })();
    return () => {
      mounted = false;
    };
    // Re-run when the route changes so navbar reflects sign-in/sign-out immediately
  }, [pathname]);

  // Reusable sign-out handler used by authenticated navbars
  async function handleSignOut() {
    try {
      if (typeof authClient.signOut === "function") {
        await authClient.signOut();
      }
    } catch {
      // ignore sign-out errors - still navigate
    } finally {
      // Immediately update local UI state so the navbar reflects signed-out status
      setState({ loading: false, isAuthenticated: false, isAdmin: false });
      // Navigate home and revalidate server-side data
      router.push("/");
      router.refresh();
    }
  }

  // If the auth state is still resolving, defer navigation to protected routes
  async function handleProtectedNav(e: React.MouseEvent, path: string) {
    // Prevent default always to control navigation behaviour
    e.preventDefault();

    // Always force a full-page navigation for the orders index so the server
    // renders the correct authenticated view immediately and avoids flash.
    if (path === "/orders") {
      if (typeof window !== "undefined") {
        window.location.assign(path);
        return;
      }
    }

    // If still loading, probe the client session before deciding
    if (state.loading) {
      try {
        const session =
          typeof authClient.getSession === "function"
            ? await authClient.getSession()
            : null;
        const extractedUser = ((): { id?: string } | null => {
          if (!session || typeof session !== "object") return null;
          const maybe = session as Record<string, unknown>;
          if (maybe.user && typeof maybe.user === "object") {
            const user = maybe.user as Record<string, unknown>;
            return { id: typeof user.id === "string" ? user.id : undefined };
          }
          if (maybe.data && typeof maybe.data === "object") {
            const data = maybe.data as Record<string, unknown>;
            if (data.user && typeof data.user === "object") {
              const user = data.user as Record<string, unknown>;
              return { id: typeof user.id === "string" ? user.id : undefined };
            }
          }
          return null;
        })();

        if (extractedUser?.id) {
          if (typeof window !== "undefined") {
            window.location.assign(path);
            return;
          }
        }
      } catch {
        // fall back to SPA navigation
      }
    }

    // Default to SPA navigation
    router.push(path);
  }

  // Prefer explicit props from parent when provided; otherwise use resolved state.
  const isAuthenticated =
    typeof propIsAuthenticated === "boolean"
      ? propIsAuthenticated
      : state.isAuthenticated;
  const isAdmin =
    typeof propIsAdmin === "boolean" ? propIsAdmin : state.isAdmin;

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
              if (confirm("Are you sure you want to sign out?"))
                handleSignOut();
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
            onClick={(e) => handleProtectedNav(e, "/orders")}
          >
            Orders
          </Link>
          <button
            type="button"
            className="ml-auto bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded transition-shadow focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            onClick={() => {
              if (confirm("Are you sure you want to sign out?"))
                handleSignOut();
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
