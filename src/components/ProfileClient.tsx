"use client";

import * as React from "react";
import toast from "react-hot-toast";

export default function ProfileClient({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const updated = params.get("updated");

    if (updated) {
      toast.success("Profile updated successfully!");
      params.delete("updated");
      const next = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState(null, "", next);
    }
  }, []);

  return <>{children}</>;
}
