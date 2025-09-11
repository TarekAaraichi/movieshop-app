"use client";

import React from "react";
import { useForm } from "react-hook-form";
import authClient from "@/lib/auth-client";

type FormData = {
  email: string;
  name: string;
  password: string;
  username: string;
};

export default function SignUpPage() {
  const { register, handleSubmit } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    const payload = {
      email: data.email,
      name: data.name,
      password: data.password,
      username: data.username,
    };
    const res = await authClient.signUp.email(payload);
    console.log("signUp result", res);
    // handle navigation/success
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block mb-2">Email</label>
        <input className="w-full mb-3" {...register("email")} />

        <label className="block mb-2">Name</label>
        <input className="w-full mb-3" {...register("name")} />

        <label className="block mb-2">Username</label>
        <input className="w-full mb-3" {...register("username")} />

        <label className="block mb-2">Password</label>
        <input
          type="password"
          className="w-full mb-3"
          {...register("password")}
        />

        <button className="btn">Sign up</button>
      </form>
    </div>
  );
}
