"use client";

import React from "react";
import { useForm } from "react-hook-form";
import authClient from "@/lib/auth-client";

type FormData = { username: string; password: string };

export default function SignInPage() {
  const { register, handleSubmit } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    const res = await authClient.signIn.username(data);
    console.log("signIn result", res);
    // Attempt to extract user id if present in the response shape
    function getUserIdFromAuthResponse(obj: unknown): string | undefined {
      if (!obj || typeof obj !== "object") return undefined;
      const maybe = obj as { user?: { id?: string } };
      return maybe.user?.id;
    }
    const userId = getUserIdFromAuthResponse(res);
    if (userId) {
      // read cookie cart client-side
      const cookieStr =
        (typeof document !== "undefined" && document.cookie) || "";
      const match = cookieStr.match(/(?:^|; )cart=([^;]+)/);
      const cartJson = match ? decodeURIComponent(match[1]) : "[]";
      let items: { movieId: string; quantity: number }[] = [];
      try {
        items = JSON.parse(cartJson) as { movieId: string; quantity: number }[];
      } catch {
        items = [];
      }
      if (items.length) {
        await fetch("/api/cart/migrate", {
          method: "POST",
          body: JSON.stringify({ userId, items }),
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    // handle navigation/success
  }

  return (
    <div className="max-w-md mx-auto m-4 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("username")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("password")}
          />
        </div>
        <button
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
