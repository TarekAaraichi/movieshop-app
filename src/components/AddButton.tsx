"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type AddButtonProps = {
  buttonText?: string;
  type?: "submit" | "button";
  disabled?: boolean;
  onClick?: () => void;
};

export default function AddButton({
  buttonText = "Create",
  type = "submit",
  disabled = false,
  ...props
}: AddButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <Button type={type} disabled={isDisabled} className="w-full" {...props}>
      {isDisabled ? "Creating…" : buttonText}
    </Button>
  );
}
