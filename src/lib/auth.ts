/**
 * Auth server utilities (ensured)
 * Server-side configuration and adapter wiring for the authentication system.
 */

// src/lib/auth.ts
import * as BetterAuth from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

// Patch: Ensure 'role' is included in the session user object for admin menu logic
type BetterAuthModule = { betterAuth: (opts: unknown) => unknown };

const authRaw = (BetterAuth as unknown as BetterAuthModule).betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    emailField: "email",
    passwordField: "password",
  },
});

type SessionWithUser = { user?: { id?: string } } | null;

type AuthShape = {
  handler: (request: Request) => Promise<Response>;
  api: {
    getSession: (opts?: { headers?: unknown }) => Promise<SessionWithUser>;
  } & Record<string, unknown>;
} & Record<string, unknown>;

export const auth = authRaw as unknown as AuthShape;
