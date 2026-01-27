"use client";

/**
 * ClientShell
 * Client wrapper used to mount client-only UI pieces (e.g., client navbar) without
 * affecting server-rendered layout. This file may be toggled to favor layout header.
 */

// ClientShell is a small client-only wrapper that provides client-scoped
// providers (toasts, cart count) and intentionally keeps the component
// navbar commented out so the server-rendered layout header is the only
// visible navigation bar. This keeps navigation consistent and prevents
// duplicate header UI while allowing easy re-enable for testing.
import React from "react";
import { CartCountProvider } from "@/components";

type ClientShellProps = {
  children: React.ReactNode;
  // serverSession may be passed from server layout; kept optional for
  // compatibility. We accept `serverSession` here but alias it to
  // `_serverSession` in the parameter list to avoid unused-variable lint
  // warnings while keeping the prop available for callers.
  serverSession?: unknown;
};

export default function ClientShell({
  children,
  serverSession: _serverSession,
}: ClientShellProps) {
  // client-side shell — session props are accepted from server layout but
  // the component-based navbar is intentionally disabled (see below).
  // mark as intentionally unused
  void _serverSession;

  return (
    <>
      <CartCountProvider>
        {/* NavBarClient is intentionally commented out so the layout navbar in
            `src/app/layout.tsx` is the only visible navigation bar.
            To restore the component-based navbar, uncomment the block below. */}
        {/*
        <header className="bg-gray-800 shadow-lg">
          <NavBarClient isAuthenticated={false} isAdmin={false} />
        </header>
        */}
        {children}
      </CartCountProvider>
    </>
  );
}
