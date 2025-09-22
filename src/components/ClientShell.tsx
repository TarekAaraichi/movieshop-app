"use client";
import React from "react";
import SonnerProvider from "@/app/SonnerProvider";
import { CartCountProvider, NavBarClient } from "@/components";
import { authClient } from "@/lib/auth-client";

type ServerSession = {
  user?: { id?: string; role?: string } | null;
} | null;

type ClientShellProps = {
  children: React.ReactNode;
  // serverSession is optional and comes from server layout when available
  serverSession?: ServerSession;
};

export default function ClientShell({
  children,
  serverSession,
}: ClientShellProps) {
  // client-side reactive session
  const { data: clientSession } = authClient.useSession();

  // prefer client session when available, fallback to serverSession for initial render
  const session = clientSession ?? serverSession;
  const isAuthenticated = Boolean(session?.user);
  type SessionUser = { role?: string } | undefined | null;
  const isAdmin = (session?.user as SessionUser)?.role === "admin";

  return (
    <>
      <SonnerProvider />
      <CartCountProvider>
        <header className="bg-gray-800 shadow-lg">
          <NavBarClient isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
        </header>
        {children}
      </CartCountProvider>
    </>
  );
}
