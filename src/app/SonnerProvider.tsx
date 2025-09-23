"use client";

/**
 * SonnerProvider
 * Client wrapper that configures and exposes the sonner toast provider across the app.
 */

import { Toaster } from "sonner";

export default function SonnerProvider() {
  return <Toaster richColors position="top-center" />;
}
