"use client";

import { useState } from "react";
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
import toast from "react-hot-toast";

const formSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.email("Invalid email").min(1, "Email is required"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    // allow empty string or a valid URL so the default '' passes validation
    image: z.url("Invalid URL").or(z.literal("")),
    callbackURL: z.url("Invalid URL").or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

export default function SignUpForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      image: "",
      callbackURL: "",
    },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = (searchParams?.get("callbackUrl") as string) || "";
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      const pre = await fetch("/api/cart");
      if (pre.ok) {
        const pj = await pre.json();
        if (Array.isArray(pj.items) && pj.items.length > 0) {
          try {
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
                  shouldWrite = true;
                }
              } catch {
                // do not overwrite opaque cart id
              }
            }
            if (shouldWrite) {
              document.cookie = `cart=${encodeURIComponent(JSON.stringify(pj.items))}; path=/; max-age=${60 * 60 * 24 * 30}`;
            }
          } catch {}
        }
      }
    } catch {}

    let error: any = null;
    try {
      const res = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      error = (res as any)?.error ?? null;
    } catch (e) {
      error = e;
    }

    if (error) {
      toast.error("Sign up failed. Please check your input and try again.");
      setIsSubmitting(false);
      return;
    }

    toast.success("Signed up successfully.");

    try {
      const cb = callbackUrl || "/profile";
      if (typeof window !== "undefined") {
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
    } catch (e) {
      console.error("migrate-cart call failed", e);
    }

    const target = callbackUrl || "/profile";
    try {
      router.replace(target);
    } catch {
      router.push(target);
    }
    router.refresh();
    setIsSubmitting(false);
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="py-4 px-6 md:py-6 md:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-card"
                      autoComplete="name"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      className="bg-card"
                      autoComplete="email"
                      required
                    />
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
                    <Input
                      type="password"
                      {...field}
                      className="bg-card"
                      autoComplete="new-password"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="bg-card"
                      autoComplete="new-password"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "opacity-80 cursor-wait bg-emerald-600 text-white py-2 px-4 rounded-md shadow-md"
                  : "bg-linear-to-r from-emerald-500 to-emerald-600 text-white py-2 px-4 rounded-md hover:brightness-95 transition shadow-md cursor-pointer"
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
                  <span>Signing up…</span>
                </>
              ) : (
                <span>Sign up</span>
              )}
            </button>
          </form>
        </Form>
      </div>
    </Card>
  );
}
