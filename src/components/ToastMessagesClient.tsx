"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function ToastMessagesClient({ errors }: { errors?: string[] }) {
  useEffect(() => {
    if (errors && errors.length > 0) {
      // show a consolidated toast and individual ones for clarity
      toast.error(errors.join(" — "));
      for (const e of errors) {
        toast.error(e, { duration: 6000 });
      }
    }
  }, [errors]);

  return null;
}
