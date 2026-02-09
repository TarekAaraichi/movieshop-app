"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
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
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const openBtnRef = useRef<HTMLButtonElement | null>(null);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock scroll when open and manage focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // focus the close button once opened
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = "auto";
      // restore focus to open button when closed
      setTimeout(() => openBtnRef.current?.focus(), 0);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <Button
        ref={openBtnRef}
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-md hover:bg-card/60 focus:outline-none focus:ring-2 focus:ring-indigo-300/50"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="fixed top-0 right-0 h-full w-full max-w-xs bg-card p-6 shadow-lg text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="font-bold text-xl text-foreground">
                MovieShop
              </Link>
              <Button
                ref={closeBtnRef}
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md hover:bg-card/60 focus:outline-none focus:ring-2 focus:ring-indigo-300/50"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <nav className="flex flex-col gap-4 text-lg">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="flex flex-col gap-2">
                    <h3 className="px-3 py-2 font-semibold text-muted">
                      {link.label}
                    </h3>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href!}
                        className={`pl-6 pr-3 py-2 rounded-md font-medium ${
                          pathname === child.href
                            ? "bg-card text-foreground"
                            : "text-muted hover:bg-card/60 hover:text-blue-600 dark:hover:text-blue-300"
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
                        ? "bg-card text-foreground"
                        : "text-muted hover:bg-card/60 hover:text-blue-600 dark:hover:text-blue-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="border-t border-border my-6" />

            <div className="flex flex-col gap-4">
              {session?.user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-md font-medium text-muted hover:bg-card/60 hover:text-foreground"
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
                  <Link href="/sign-in" className="btn-primary">
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-4 py-2 text-center rounded-md font-semibold bg-card text-foreground border border-border hover:brightness-95"
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
