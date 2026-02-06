"use client";

import { useEffect } from "react";
import { z } from "zod";
import toast from "react-hot-toast";

const movieCreateClientSchema = z.object({
  title: z.string().min(1, "Title is required"),
  releaseDate: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid date" }),
  description: z.string().min(1, "Description is required"),
  director: z.string().min(1, "Director is required"),
  actors: z.string().optional().nullable(),
  imageUrl: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url("Invalid URL").optional(),
  ),
  runtime: z.preprocess(
    (v) => (typeof v === "string" ? parseInt(v as string, 10) : v),
    z
      .number()
      .int()
      .positive({ message: "Runtime must be a positive integer" }),
  ),
  price: z.preprocess(
    (v) => (typeof v === "string" ? parseFloat(v as string) : v),
    z.number().nonnegative({ message: "Price must be >= 0" }),
  ),
  stock: z.preprocess(
    (v) => (typeof v === "string" ? parseInt(v as string, 10) : v),
    z.number().int().nonnegative({ message: "Stock must be >= 0" }),
  ),
  genres: z.string().optional().nullable(),
});

export default function MovieCreateClientValidator({
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
      const result = movieCreateClientSchema.safeParse(raw);
      if (!result.success) {
        e.preventDefault();
        // collect messages
        const msgs: string[] = [];
        for (const issue of result.error.issues) {
          const path = issue.path.join(".") || "field";
          msgs.push(`${path}: ${issue.message}`);
        }
        // show first message as toast and log full
        toast.error(msgs[0] ?? "Validation error");
        // also optionally show all messages in console for debugging
        console.warn("Movie create validation failed:", msgs);
      }
    }

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [formId]);

  return null;
}
