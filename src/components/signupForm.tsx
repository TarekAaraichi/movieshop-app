"use client";

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

  async function onSubmit(values: FormValues) {
    // Handle form submission
    // Snapshot the anonymous cart so the server-side migration can merge it
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
              document.cookie = `cart=${encodeURIComponent(
                JSON.stringify(pj.items)
              )}; path=/; max-age=${60 * 60 * 24 * 30}`;
            }
          } catch {}
        }
      }
    } catch {}

    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      // sign-up didn't return a token — show a generic error
      alert("Sign up failed. Please check your input and try again.");
    } else {
      // Signed up successfully — you can use result.user or result.token as needed
      alert("Signed up successfully.");
      try {
        const cb = callbackUrl || "/profile";
        if (typeof window !== "undefined") {
          window.location.assign(
            `/api/cart/migrate-and-continue?callback=${encodeURIComponent(cb)}`
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
      // signup succeeded
    }
  }

  return (
    <Card className="max-w-md mx-auto bg-gradient-to-r from-white to-indigo-50">
      <div className="py-3 px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white text-black" />
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
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
              Sign up
            </button>
          </form>
        </Form>
      </div>
    </Card>
  );
}
