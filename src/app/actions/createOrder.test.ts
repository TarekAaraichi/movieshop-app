/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * This test file runs the server action `createOrder` (ordersActions.createOrder)
 * in a Node test environment. To avoid path-alias and runtime issues we import
 * the server modules via relative paths and mock Next runtime helpers.
 */

// Mocks
vi.mock("../../server/actions/orderHelpersActions", () => ({
  findOrCreateUser: vi.fn(
    async (prisma: unknown, email: string, name: string) => ({
      id: "guest-id",
      email,
      name,
    })
  ),
}));

vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => ({
      value: JSON.stringify([{ movieId: "m1", quantity: 1 }]),
    }),
    set: (_: unknown) => {},
  }),
}));

vi.mock("next/navigation", () => ({ redirect: vi.fn(() => {}) }));

vi.mock("../../lib/getServerSession", () => ({
  // Placeholder - user requested deletion of this folder. File left intentionally blank.
}));
