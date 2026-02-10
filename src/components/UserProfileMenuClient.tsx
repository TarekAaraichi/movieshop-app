"use client";

import React from "react";
import Link from "next/link";
import DetailsMenu from "./DetailsMenu";
import SignOutButton from "./SignOutButton";

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function UserProfileMenuClient({
  name,
  showAdmin = false,
}: {
  name?: string | null;
  showAdmin?: boolean;
}) {
  const label = name ?? "Account";

  const summary = (
    <summary className="cursor-pointer list-none flex items-center gap-3 px-2 py-1 rounded-md text-sm transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-blue-300/40">
      <div className="w-8 h-8 rounded-full shrink-0 bg-linear-to-r from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
        {initials(name)}
      </div>
      <span className="text-sm font-medium">{label}</span>
      <svg
        className="w-3 h-3 opacity-80 transition-transform duration-150"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M6 9l6 6 6-6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </summary>
  );

  return (
    <div className="hidden md:block">
      <DetailsMenu summary={summary} className="relative">
        <div className="absolute right-0 mt-2 w-44 bg-card text-foreground border border-border rounded-md shadow-lg py-1 z-50">
          <Link
            href="/profile"
            role="menuitem"
            className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground mx-1 my-1 transition"
          >
            Profile
          </Link>
          {showAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground mx-1 my-1 transition"
            >
              Admin
            </Link>
          )}
          <div className="px-2 py-1">
            <SignOutButton className="w-full" />
          </div>
        </div>
      </DetailsMenu>
    </div>
  );
}
