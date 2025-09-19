"use client";
import React from "react";
import SonnerProvider from "@/app/SonnerProvider";
import { CartCountProvider } from "@/components/CartCountContext";
import NavBarClient from "@/components/NavBarClient";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SonnerProvider />
      <CartCountProvider>
        <header className="bg-gray-800 shadow-lg">
          <NavBarClient />
        </header>
        {children}
      </CartCountProvider>
    </>
  );
}
