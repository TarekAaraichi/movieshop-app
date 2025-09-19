// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  // Tell better-auth to use the Prisma adapter so users/sessions/accounts are
  // persisted in your Postgres DB via the existing Prisma models.
  database: prismaAdapter(prisma, {
    provider: "postgresql", // keep as postgresql for your setup
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Ensure the adapter knows which fields in your Prisma `User` model
    // should be used for email and password. The default generated schema
    // may name the password field `password` or `passwordHash` — make sure
    // this matches the field in `prisma/schema.prisma` below.
    emailField: "email",
    passwordField: "password",
  },
});
