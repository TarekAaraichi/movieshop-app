"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function AdminToastsClient() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);

      if (params.get("deleted")) {
        toast.success(`Deleted ${params.get("name") ?? "item"}`);
      }
      if (params.get("updated")) {
        toast.success(`Updated ${params.get("name") ?? "item"}`);
      }
      if (params.get("granted")) {
        toast.success(`Granted admin to ${params.get("name") ?? "user"}`);
      }
      if (params.get("revoked")) {
        toast.success(`Revoked admin from ${params.get("name") ?? "user"}`);
      }
      if (params.get("error")) {
        toast.error(params.get("error") as string);
      }

      // Remove query params so toasts don't reappear on refresh
      if (params.toString()) {
        const url = new URL(window.location.href);
        url.search = "";
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return null;
}
