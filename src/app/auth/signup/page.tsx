"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import authClient from "@/lib/auth-client";

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(1, { message: "Name is required" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

type FormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(data: FormData) {
    const payload = {
      email: data.email,
      name: data.name,
      password: data.password,
      username: data.username,
    };
    const res = await authClient.signUp.email(payload);
    console.log("signUp result", res);

    function getUserIdFromAuthResponse(obj: unknown): string | undefined {
      if (!obj || typeof obj !== "object") return undefined;
      const maybe = obj as { user?: { id?: string } };
      return maybe.user?.id;
    }

    const userId = getUserIdFromAuthResponse(res);
    if (userId) {
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
  }

  return (
    <div className="max-w-md mx-auto m-4 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            aria-invalid={Boolean(errors.email)}
            className={`w-full px-3 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            aria-invalid={Boolean(errors.name)}
            className={`w-full px-3 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            aria-invalid={Boolean(errors.username)}
            className={`w-full px-3 py-2 border ${
              errors.username ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-red-500 mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            aria-invalid={Boolean(errors.password)}
            className={`w-full px-3 py-2 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Sign up
        </button>
      </form>
    </div>
  );
}
