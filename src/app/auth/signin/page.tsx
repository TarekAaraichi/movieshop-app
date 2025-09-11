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
    // handle navigation/success
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Sign In</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block mb-2">Username</label>
        <input className="w-full mb-3" {...register("username")} />

        <label className="block mb-2">Password</label>
        <input
          type="password"
          className="w-full mb-3"
          {...register("password")}
        />

        <button className="btn">Sign in</button>
      </form>
    </div>
  );
}
