"use client";

/**
 * SaveButton
 * Reusable client button used for saving forms and showing loading state.
 */

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

type Props = {
  label?: string;
  className?: string;
};

export default function SaveButton({ label = "Save", className = "" }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className={`w-full bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 ${className}`}
    >
      {pending ? "Updating…" : label}
    </Button>
  );
}
