"use client";

/**
 * AddButton
 * Small presentational button used across the app for 'Add' actions.
 */

import { useFormStatus } from "react-dom";

export default function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {pending ? "Creating…" : "Create Movie"}
    </button>
  );
}
