// src/app/movies/[movieId]/edit/SaveButton.tsx
'use client';
import { useFormStatus } from 'react-dom';

export default function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {pending ? 'Updating…' : 'Update Movie'}
    </button>
  );
}
