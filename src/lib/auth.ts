

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
  },
});