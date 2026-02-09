"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

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
    <Button
      type={type}
      disabled={isDisabled}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      {...props}
    >
      {isDisabled ? "Creating…" : buttonText}
    </Button>
  );
}
