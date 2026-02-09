"use client";

/**
 * SigninForm
 * Client form component for user authentication (sign in).
 * Handles form state, validation, and submission to auth endpoints.
 */

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components";
import { Input } from "@/components";
import { Card } from "@/components";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const formSchema = z.object({
  email: z.email("Invalid email").min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function SignInForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = (searchParams?.get("callbackUrl") as string) || "";
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    // Snapshot the anonymous cart so the server-side migration can merge it
    try {
      const pre = await fetch("/api/cart");
      if (pre.ok) {
        const pj = await pre.json();
        if (Array.isArray(pj.items) && pj.items.length > 0) {
          try {
            // Only write the cookie if none exists or it already contains legacy JSON
            const existing = (document.cookie || "")
              .split("; ")
              .find((c) => c.startsWith("cart="));
            let shouldWrite = false;
            if (!existing) {
              shouldWrite = true;
            } else {
              const rawVal = existing.split("=")[1] || "";
              try {
                const decoded = decodeURIComponent(rawVal || "");
                if (decoded.trim().startsWith("[")) {
                  // existing cookie already is JSON — fine to overwrite
                  shouldWrite = true;
                }
              } catch {
                // if decode fails, don't overwrite an opaque cart id
              }
            }
            if (shouldWrite) {
              document.cookie = `cart=${encodeURIComponent(
                JSON.stringify(pj.items),
              )}; path=/; max-age=${60 * 60 * 24 * 30}`;
            }
          } catch {}
        }
      }
    } catch {}

    let error: any = null;
    try {
      const res = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      error = (res as any)?.error ?? null;
    } catch (e) {
      error = e;
    }

    if (error) {
      toast.error("Sign in failed. Please check your input and try again.");
      setIsSubmitting(false);
      return;
    }

    toast.success("Signed in successfully.");

    // Signed in successfully. Navigate to server-side migration helper so
    // the migration runs with session cookies available and then redirects
    // back to the desired callback.
    const cb = callbackUrl || "/profile";
    if (typeof window !== "undefined") {
      // location.assign ensures cookies are sent and the browser follows
      // the redirect returned by the server route.
      window.location.assign(
        `/api/cart/migrate-and-continue?callback=${encodeURIComponent(cb)}`,
      );
    } else {
      try {
        router.replace(cb);
      } catch {
        router.push(cb);
      }
    }
    setIsSubmitting(false);
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="py-4 px-6 md:py-6 md:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      autoComplete="email"
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      autoComplete="current-password"
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "opacity-80 cursor-wait bg-indigo-600 text-white py-2 px-4 rounded-md shadow-md"
                  : "cursor-pointer bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition shadow-md"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        </Form>
      </div>
    </Card>
  );
}
