/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma with minimal API used by createOrder
const mockPrisma = {
  movie: { findMany: vi.fn(async () => []) },
  $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
    return fn({
      address: {
        create: async (data: unknown) => ({ id: "addr-1", ...(data as any) }),
      },
      order: {
        create: async (data: unknown) => ({ id: "order-1", ...(data as any) }),
      },
      movie: { update: async () => null },
    } as unknown);
  }),
};

// We'll mock dependencies; the module under test will be imported dynamically
vi.mock("./orderHelpers", () => ({
  findOrCreateUser: vi.fn(
    async (prisma: unknown, email: string, name: string) => ({
      id: "guest-id",
      email,
      name,
    })
  ),
}));
// Also mock the aliased import path used by orders.ts
vi.mock("@/app/actions/orderHelpers", () => ({
  findOrCreateUser: vi.fn(
    async (prisma: unknown, email: string, name: string) => ({
      id: "guest-id",
      email,
      name,
    })
  ),
}));
// Mock next/headers cookies() to provide a fake cart cookie store for tests
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => ({
      value: JSON.stringify([{ movieId: "m1", quantity: 1 }]),
    }),
    set: (_: unknown) => {},
  }),
}));
// Mock next/navigation redirect to be a no-op so tests don't throw
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {}),
}));
vi.mock("@/lib/getServerSession", () => ({
  getServerSession: vi.fn(async () => null),
}));

// Provide a mocked prisma module via the factory so it is available when orders.ts imports it.
vi.mock("@/lib/prisma", () => {
  const movieFindMany = vi.fn(async () => []);
  const $transaction = vi.fn(async (fn: any) =>
    fn({
      address: { create: async (data: any) => ({ id: "addr-1", ...data }) },
      order: { create: async (data: any) => ({ id: "order-1", ...data }) },
      movie: { update: async () => null },
    })
  );
  return {
    default: { movie: { findMany: movieFindMany }, $transaction },
    __esModule: true,
  };
});

describe("createOrder server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("uses guest flow when no session", async () => {
    // prepare a minimal form
    const fd = new FormData();
    fd.set("fullName", "Guest");
    fd.set("email", "guest@example.com");
    fd.set("line1", "123 Road");
    fd.set("city", "Town");
    fd.set("postalCode", "12345");
    fd.set("country", "Country");

    // Mock movie findMany to return a product with stock
    mockPrisma.movie.findMany.mockResolvedValueOnce([
      { id: "m1", price: "10.00", stock: 5, title: "Movie 1" },
    ] as unknown as unknown[]);

    // Mock cookie parsing by stubbing next/headers cookies() if needed —
    // createOrder reads cookies() at runtime; since our test runs in Node and not
    // in Next runtime, for now ensure cart cookie parsing inside createOrder sees items = []
    // The createOrder implementation will check items length and redirect; to avoid that,
    // we will instead spy on findOrCreateUser and ensure it gets called when failing session.

    // Dynamically import the module under test so mocks are applied
    const mod = await import("./orders");
    const { createOrder } = mod;
    const helpers = await import("@/app/actions/orderHelpers");
    await expect(createOrder(fd as unknown as FormData)).resolves.not.toThrow();
    expect(helpers.findOrCreateUser).toHaveBeenCalled();
  });

  it("uses session when available", async () => {
    // Make getServerSession return a session
    const gs = await import("@/lib/getServerSession");
    const g = gs as unknown as {
      getServerSession: { mockResolvedValueOnce: (v: unknown) => void };
    };
    g.getServerSession.mockResolvedValueOnce({ user: { id: "user-1" } });

    const fd = new FormData();
    fd.set("fullName", "User");
    fd.set("email", "user@example.com");
    fd.set("line1", "1 Main");
    fd.set("city", "City");
    fd.set("postalCode", "00000");
    fd.set("country", "Country");

    mockPrisma.movie.findMany.mockResolvedValueOnce([
      { id: "m1", price: "10.00", stock: 5, title: "Movie 1" },
    ] as unknown as unknown[]);

    const mod = await import("./orders");
    const { createOrder } = mod;
    const helpers = await import("@/app/actions/orderHelpers");
    await expect(createOrder(fd as unknown as FormData)).resolves.not.toThrow();
    expect(helpers.findOrCreateUser).not.toHaveBeenCalled();
  });
});
