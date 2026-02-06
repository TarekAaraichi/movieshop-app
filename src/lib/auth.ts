/**
 * Auth server utilities (ensured)
 * Server-side configuration and adapter wiring for the authentication system.
 */

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

// Patch: Ensure 'role' is included in the session user object for admin menu logic
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    // Explicitly select 'role' field for user in session (if supported by adapter)
    selectUserFields: [
      "id",
      "name",
      "email",
      "emailVerified",
      "image",
      "createdAt",
      "updatedAt",
      "role", // crucial for admin menu
    ],
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    emailField: "email",
    passwordField: "password",
  },
});
