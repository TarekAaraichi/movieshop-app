"use client";

/**
 * SignOutButton
 * Client-side button that triggers user sign-out and optional UI refresh/confirmation.
 */

import React from "react";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    if (!confirm("Are you sure you want to sign out?")) return;
    try {
      await authClient.signOut({
        fetchOptions: {
          onResponse: () => {
            try {
              toast.success("Signed out successfully.");
            } catch {}
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch {
      try {
        toast.error("Sign out failed.");
      } catch {}
      router.push("/");
      router.refresh();
    }
  };

  return (
    <Button
      type="button"
      className={`px-4 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 active:bg-red-800 transition-colors duration-200 ${className ?? ""}`}
      onClick={handleSignOut}
      aria-label="Sign out of your account"
    >
      Sign out
    </Button>
  );
}
