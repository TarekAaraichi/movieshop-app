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
  FormMessage,
} from "@/components";
import { Input } from "@/components";
import { Card } from "@/components";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";

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
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = (searchParams?.get("callbackUrl") as string) || "";

  async function onSubmit(values: FormValues) {
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

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      alert("Sign in failed. Please check your input and try again.");
      return;
    }

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
  }

  return (
    <Card className="max-w-md mx-auto bg-gradient-to-r from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900">
      <div className="py-3 px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
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
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              Sign in
            </button>
          </form>
        </Form>
      </div>
    </Card>
  );
}
