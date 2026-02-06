"use client";

import { useEffect } from "react";
import { z } from "zod";
import toast from "react-hot-toast";

const personCreateClientSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  role: z.enum(["DIRECTOR", "ACTOR"], {
    errorMap: () => ({ message: "Select a role" }),
  }),
  bio: z.string().optional().nullable(),
  imageUrl: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url("Invalid URL").optional().nullable(),
  ),
});

export default function PersonCreateClientValidator({
  formId,
}: {
  formId: string;
}) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    function handleSubmit(e: Event) {
      const fd = new FormData(form);
      const raw = Object.fromEntries(fd.entries());
      const result = personCreateClientSchema.safeParse(raw);
      if (!result.success) {
        e.preventDefault();
        const msgs: string[] = [];
        for (const issue of result.error.issues) {
          const path = issue.path.join(".") || "field";
          msgs.push(`${path}: ${issue.message}`);
        }
        toast.error(msgs[0] ?? "Validation error");
        // eslint-disable-next-line no-console
        console.warn("Person create validation failed:", msgs);
      }
    }

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [formId]);

  return null;
}
