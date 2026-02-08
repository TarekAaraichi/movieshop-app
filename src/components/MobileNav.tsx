"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Session } from "better-auth";
import SignOutButton from "./SignOutButton";

interface MobileNavLink {
  href?: string;
  label: string;
  children?: MobileNavLink[];
}

interface MobileNavProps {
  session: Session | null;
  navLinks: MobileNavLink[];
}

export function MobileNav({ session, navLinks }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-md hover:bg-gray-800"
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed top-0 right-0 h-full w-full max-w-xs bg-gray-950 p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="font-bold text-xl">
                MovieShop
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md hover:bg-gray-800"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 text-lg">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="flex flex-col gap-2">
                    <h3 className="px-3 py-2 font-semibold text-gray-400">
                      {link.label}
                    </h3>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href!}
                        className={`pl-6 pr-3 py-2 rounded-md font-medium ${
                          pathname === child.href
                            ? "bg-gray-800 text-white"
                            : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href!}
                    className={`px-3 py-2 rounded-md font-medium ${
                      pathname === link.href
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="border-t border-gray-800 my-6" />

            <div className="flex flex-col gap-4">
              {session?.user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-md font-medium text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  >
                    <Image
                      src={session.user.image || "/images/default-avatar.png"}
                      alt="User avatar"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                    <span>{session.user.name}</span>
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 text-center rounded-md font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-4 py-2 text-center rounded-md font-semibold bg-gray-700 text-white hover:bg-gray-600"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
