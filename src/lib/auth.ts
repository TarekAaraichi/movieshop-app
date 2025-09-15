import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),

    emailAndPassword: {
        enabled: true,
        // You can customize the fields used for email and password
        emailField: "email",
        minPasswordLength: 8,
        // passwordField: "passwordHash", // This should match your Prisma schema field for storing hashed passwords
    },
});