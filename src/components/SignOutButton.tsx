"use client";

/**
 * SignOutButton
 * Client-side button that triggers user sign-out and optional UI refresh/confirmation.
 */

import React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    if (!confirm("Are you sure you want to sign out?")) return;
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

  return (
    <button
      type="button"
      className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors duration-150"
      onClick={handleSignOut}
    >
      Sign out
    </button>
  );
}
