"use client";

/**
 * SignOutButton
 * Client-side button that triggers user sign-out and optional UI refresh/confirmation.
 */

import React from "react";
import { Button } from "@/components/ui/button";
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
      variant="destructive"
      className={`px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-500 ${className ?? ""}`}
      onClick={handleSignOut}
      aria-label="Sign out of your account"
    >
      Sign out
    </Button>
  );
}
