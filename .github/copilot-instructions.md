<!--
This file provides concise, project-specific guidance for AI coding assistants (Copilot-style agents).
Keep it short (20-50 lines). Update when project conventions or key files change.
-->

# MovieShop — Copilot Instructions

Quick context

- Full-stack Next.js 15 app (App Router) using Prisma + PostgreSQL, Tailwind, shadcn/ui, and Better Auth.
- DB models live in `prisma/schema.prisma`. Prisma client is the canonical DB access in `src/lib/prisma.ts`.

How to run & test locally

- Install: `npm install`
- Dev server: `npm run dev` (uses `next dev --turbopack`)
- Build: `npm run build` (uses Turbopack)
- Seed DB: `npm run seed` (runs `prisma/seed.js`)
- Migrate: `npx prisma migrate dev` and `npx prisma generate` after schema changes
- Unit tests: `npm test` (Vitest; tests live under `src/**/*.test.*`)

Project conventions & important patterns

- Path alias: `@/*` maps to `src/*` via `tsconfig.json`. Prefer `@/` imports for app code.
- Prisma singleton: `src/lib/prisma.ts` implements a global Prisma client — reuse `prisma` export instead of creating new `PrismaClient` instances.
- Auth: `better-auth` is wrapped in `src/lib/auth.ts`. API route at `src/app/api/auth/[...all]/route.ts` delegates to `toNextJsHandler(auth)`; prefer changes in `src/lib/auth.ts` for auth behavior.
- App Router pages and components use server/client boundaries. Look for `use client` at top of client components and `page.tsx` files for routes.
- UI primitives and forms follow `src/components/ui/*` and `react-hook-form` + `zod` for validation.

Code style & tests

- Typescript strict mode is enabled. Keep types explicit for public functions and API handlers.
- Tests run in Node environment (see `vitest.config.ts`) — avoid DOM-only APIs in unit tests unless using a DOM test setup.

Integration points & gotchas

- Database: migrations and Prisma Client must be regenerated after schema edits. If `@prisma/client` errors occur, run `npm install @prisma/client prisma` then `npx prisma generate`.
- Sessions & auth: look at Prisma models `Session`, `Account`, and `User` in `prisma/schema.prisma` — altering these fields affects `better-auth` adapter expectations.
- Global state: `src/lib/prisma.ts` caches the client in `global` for development; do not remove the singleton pattern.
- Next 15 / Turbopack: some third-party libs may need adjustments; run `npm run dev` to see build-time errors.

Where to look first (high-value files)

- `README.md` — project overview and setup steps
- `prisma/schema.prisma` — DB model source of truth
- `src/lib/prisma.ts` and `src/lib/auth.ts` — important infra glue
- `src/app` — routes, pages and server/client components
- `package.json` — scripts and dependencies

If you need more

- Ask the maintainer for any non-discoverable secrets, environment variables, or CI details (e.g., exact DB URL, Vercel settings).
- When proposing changes that touch DB schema or auth flows, include migration steps and a brief rollback plan.

Examples (do this, not that)

- Use: `import { prisma } from '@/lib/prisma'` — not `new PrismaClient()`
- Update auth: edit `src/lib/auth.ts` and avoid changing the API handler directly in `src/app/api/auth/.../route.ts`.
