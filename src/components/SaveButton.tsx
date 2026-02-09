"use client";

/**
 * SaveButton
 * Reusable client button used for saving forms and showing loading state.
 */

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type Props = {
  label?: string;
  className?: string;
};

export default function SaveButton({ label = "Save", className = "" }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={`w-full ${className}`}>
      {pending ? "Updating…" : label}
    </Button>
  );
}
