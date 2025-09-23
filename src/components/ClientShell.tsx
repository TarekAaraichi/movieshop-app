"use client";
import React from "react";
import SonnerProvider from "@/app/SonnerProvider";
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
      <SonnerProvider />
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
