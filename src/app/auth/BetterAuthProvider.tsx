"use client";

import React from "react";

type Props = { children: React.ReactNode };

export default function BetterAuthProvider({ children }: Props) {
  // Minimal wrapper: the app can import `authClient` from `src/lib/auth-client`
  // where needed. This component exists so we can mount client-only logic
  // in layout.tsx if you want to add providers later.
  return <>{children}</>;
}
