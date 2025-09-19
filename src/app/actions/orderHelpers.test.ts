/* eslint-disable */
import { describe, it, expect } from "vitest";
import { findOrCreateUser } from "./orderHelpers";

// Minimal fake prisma client for testing
const makePrisma = () => {
  const users: any[] = [];
  return {
    user: {
      findUnique: async ({ where }: any) =>
        users.find((u) => u.email === where.email) || null,
      create: async ({ data }: any) => {
        const u = { id: `id_${users.length + 1}`, ...data };
        users.push(u);
        return u;
      },
    },
  };
};

describe("findOrCreateUser", () => {
  it("creates a new user when none exists", async () => {
    const prisma = makePrisma();
    const user = await findOrCreateUser(prisma, "guest@example.com", "Guest");
    expect(user).toHaveProperty("id");
    expect(user.email).toBe("guest@example.com");
  });

  it("returns existing user if present", async () => {
    const prisma = makePrisma();
    const first = await findOrCreateUser(prisma, "a@b.com", "A B");
    const second = await findOrCreateUser(prisma, "a@b.com", "A B");
    expect(second.id).toBe(first.id);
  });
});
