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
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";

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
        code: z.ZodIssueCode.custom,
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

  async function onSubmit(values: FormValues) {
    // Handle form submission
    const result = await auth.api.signUpEmail({
      body: {
        name: values.name,
        email: values.email,
        password: values.password,
        image: values.image || undefined,
        callbackURL: values.callbackURL || undefined,
      },
    });

    if (!result.token) {
      // sign-up didn't return a token — show a generic error
      alert("Sign up failed. Please check your input and try again.");
      return;
    }

    // Signed up successfully — you can use result.user or result.token as needed
    alert("Signed up successfully.");
  }

  return (
    <Card className="max-w-md mx-auto bg-gradient-to-r from-white to-indigo-50">
      <div className="py-3 px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} className="bg-white text-black"/>
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
