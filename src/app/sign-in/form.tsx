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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.email("Invalid email").min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignInForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    // Handle form submission using client-side auth helper
    const result = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    // better-auth client returns different shaped objects; narrow as unknown safely
    const unknownResult: unknown = result;
    console.log("authClient.signIn.email result:", unknownResult);

    const isObject =
      typeof unknownResult === "object" && unknownResult !== null;
    const record = (unknownResult as Record<string, unknown> | null) ?? null;
    const hasUser = isObject && record != null && "user" in record;
    const hasToken = isObject && record != null && "token" in record;
    const hasUrl = isObject && record != null && "url" in record;
    const isSuccess = Boolean(hasUser || hasToken || hasUrl);

    if (!isSuccess) {
      // Extract message safely
      let message = "Sign in failed";
      if (isObject && record && "error" in record) {
        const err = record["error"] as unknown;
        if (
          typeof err === "object" &&
          err !== null &&
          "message" in (err as Record<string, unknown>)
        ) {
          message = String((err as Record<string, unknown>)["message"]);
        }
      } else if (isObject && record && "message" in record) {
        message = String(record["message"]);
      }

      // Debug logging
      try {
        console.warn("Sign-in error (raw):", unknownResult);
        console.warn("typeof result:", typeof unknownResult);
        try {
          console.warn("result JSON:", JSON.stringify(unknownResult));
        } catch (jsonErr) {
          console.warn("result JSON stringify failed:", jsonErr);
        }
        console.warn("Object.keys(result):", Object.keys(record || {}));
        console.warn(
          "Object.getOwnPropertyNames(result):",
          Object.getOwnPropertyNames(record || {})
        );
        console.dir(unknownResult);
      } catch (logErr) {
        console.warn("Sign-in logging error:", logErr);
      }

      // If result appears empty (no enumerable keys), attempt a raw fetch to the auth API endpoint
      if (isObject && record && Object.keys(record).length === 0) {
        try {
          const resp = await fetch("/api/auth/sign-in/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: values.email,
              password: values.password,
            }),
          });
          const text = await resp.text();
          console.warn(
            "Raw /api/auth/sign-in/email response status:",
            resp.status,
            "body:",
            text
          );
          alert(
            `Sign in failed; server responded with status ${resp.status}. See console for body.`
          );
        } catch (err) {
          console.error("Fallback fetch error:", err);
          alert(`Sign in failed and fallback fetch errored: ${String(err)}`);
        }
      } else {
        alert(`Sign in failed: ${message}`);
      }
    } else {
      console.log("Signed in successfully:", unknownResult);
      alert("Signed in successfully.");
      router.replace("/");
      try {
        router.refresh();
      } catch {}
    }
  }

  return (
    <Card className="max-w-md mx-auto bg-gradient-to-r from-white to-indigo-50">
      <div className="py-3 px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
              disabled={form.formState.isSubmitting}
              className={
                form.formState.isSubmitting
                  ? "ml-auto mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-opacity duration-150 bg-gradient-to-r from-indigo-300 to-blue-400 cursor-wait opacity-80 disabled:cursor-wait"
                  : "ml-auto mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition transform duration-150 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
              }
            >
              {form.formState.isSubmitting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin text-white"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
                    />
                  </svg>
                  Loading...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </Form>
      </div>
    </Card>
  );
}
