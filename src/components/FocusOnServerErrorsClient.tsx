"use client";
import { useEffect } from "react";

export default function FocusOnServerErrorsClient() {
  useEffect(() => {
    const el = document.getElementById("server-errors");
    if (!el) return;
    try {
      (el as HTMLElement).focus();
    } catch {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);
  return null;
}
