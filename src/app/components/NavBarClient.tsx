"use client";
import Link from "next/link";
import CartCountBadge from "@/app/cart/CartCountBadge";

export default function NavBarClient() {
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
        {/* <Link
          href="/checkout"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Checkout
        </Link> */}
        <Link
          href="/dashboard"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Dashboard
        </Link>
        <Link
          href="/admin"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Admin
        </Link>
        {/* <Link
          href="/sign-up"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Register
        </Link> */}
        <Link
          href="/sign-in"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Login
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
      </div>
    </nav>
  );
}
