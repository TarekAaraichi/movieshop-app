"use client";

import React from "react";
import Link from "next/link";
import CartCountBadge from "@/components/CartCountBadge";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type NavBarProps = {
  isAuthenticated: boolean;
  isAdmin: boolean;
};

export default function NavBarClient({
  isAuthenticated,
  isAdmin,
}: NavBarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    if (!confirm("Are you sure you want to sign out?")) return;
    try {
      await authClient.signOut({
        fetchOptions: {
          onResponse: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch {
      // Fallback: navigate to home
      router.push("/");
      router.refresh();
    }
  };

  if (isAuthenticated && isAdmin) {
    return (
      <nav className="container mx-auto flex justify-between items-center p-4">
        <div className="text-2xl font-bold tracking-wide">
          <Link
            href="/"
            className="text-teal-400 hover:text-teal-300 focus:text-teal-300 active:text-teal-500 transition"
          >
            MovieShop (Admin)
          </Link>
        </div>
        <div className="flex gap-6 items-center">
          <Link
            href="/movies"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
          >
            Movies
          </Link>
          <Link
            href="/admin"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
          >
            Admin Panel
          </Link>
          <Link
            href="/cart"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition flex items-center"
          >
            Cart <CartCountBadge />
          </Link>
          <button
            type="button"
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </nav>
    );
  }

  if (isAuthenticated) {
    return (
      <nav className="container mx-auto flex justify-between items-center p-4">
        <div className="text-2xl font-bold tracking-wide">
          <Link
            href="/"
            className="text-teal-400 hover:text-teal-300 focus:text-teal-300 active:text-teal-500 transition"
          >
            MovieShop
          </Link>
        </div>
        <div className="flex gap-6 items-center">
          <Link
            href="/movies"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
          >
            Movies
          </Link>
          <Link
            href="/cart"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition flex items-center"
          >
            Cart <CartCountBadge />
          </Link>
          <Link
            href="/profile"
            className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
          >
            My Account
          </Link>
          <button
            type="button"
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="container mx-auto flex justify-between items-center p-4">
      <div className="text-2xl font-bold tracking-wide">
        <Link
          href="/"
          className="text-teal-400 hover:text-teal-300 focus:text-teal-300 active:text-teal-500 transition"
        >
          MovieShop
        </Link>
      </div>
      <div className="flex gap-6 items-center">
        <Link
          href="/movies"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Movies
        </Link>
        <Link
          href="/cart"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition flex items-center"
        >
          Cart <CartCountBadge />
        </Link>
        <Link
          href="/about"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          About Us
        </Link>
        <Link
          href="/contact"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Contact
        </Link>
        <button
          type="button"
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
          onClick={() => {
            router.push("/sign-in");
            router.refresh();
          }}
        >
          Sign In
        </button>
      </div>
    </nav>
  );
}
