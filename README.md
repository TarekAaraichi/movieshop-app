# 🎬 MovieShop — Beginner Friendly Guide

Welcome! This repository is a demo full‑stack storefront called MovieShop built with Next.js (App Router), Prisma (Postgres), Tailwind CSS, and Better Auth. This README helps a new contributor get the project running and points to important files and workflows.

---

## Quick start (5–10 minutes)

1. Clone the repo and open it:

   ```pwsh
   git clone <repo-url>
   cd movieshop-app
   ```

1. Install dependencies:

   ```pwsh
   npm install
   ```

1. Create a `.env` file at the project root. At minimum, add your database connection string (replace with your Postgres settings):

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/movieshop?schema=public"
   ```

1. Generate Prisma client & run migrations (development):

   ```pwsh
   npx prisma generate
   npx prisma migrate dev --name init
   ```

1. Start the dev server:

   ```pwsh
   npm run dev
   ```

1. Visit `http://localhost:3000` in your browser.

---

## Useful npm scripts

- `npm run dev` — start Next.js dev server (with Turbopack).
- `npm run build` — production build.
- `npm run start` — start the production server (after `build`).
- `npm run seed` — run `prisma/seed.js` to seed sample data.
- `npm run seed:auth` — create demo users via the Better Auth API (use after `npm run dev`).
- `npm test` — run unit tests (Vitest).
- `npm run lint` — run ESLint.

---

## Helpful development tips

If you run into Prisma issues:

```pwsh
npm install prisma @prisma/client
npx prisma generate
```

Use `DISABLE_AUTH=true` to stub authentication in development (PowerShell example):

```pwsh
$env:DISABLE_AUTH = 'true'
npm run dev
```

This makes `auth.api.getSession()` return a fake user for convenience while testing. Do not enable in production.

---

## Where to look in the codebase (high value files)

- `src/app/layout.tsx` — root layout, header, and footer.
- `src/app` — App Router routes (server components). Notable routes:
  - `/movies` — browse movies
  - `/movies/[movieId]` — movie details
  - `/profile` and `/profile/edit` — user profile pages
  - `/admin` — admin panel (protected)
  - `/collections` — curated lists
- `src/components` — reusable client components (search, cart, details menu, buttons).
- `src/lib/prisma.ts` — Prisma client singleton.
- `src/lib/auth.ts` and `src/app/api/auth/[...all]/route.ts` — Better Auth wrapper and API route.
- `prisma/schema.prisma` — database models and enums.
- `prisma/seed.js` — seed script to populate sample data.

---

## Common workflows

Create or update Prisma models:

1. Edit `prisma/schema.prisma`.
1. Run `npx prisma migrate dev --name your-change`.
1. Run `npx prisma generate` (if not run by migrate).

Add a new page (App Router):

1. Create folder under `src/app/your-route`.
1. Add `page.tsx` (server component) and client components under `src/components` if needed.

Add a server action:

1. Create an exported async function inside `src/server/actions`.
1. Use it from a server component or wire to a client form.

---

## Running and seeding demo users with Better Auth

1. Start the dev server:

```pwsh
npm run dev
```

1. In another terminal, run:

```pwsh
npm run seed:auth
```

This will create demo accounts such as `demo@example.com` and `admin@example.com`.

---

## Troubleshooting

- "Prisma client missing" or `@prisma/client` errors:

  - Ensure you ran `npm install` and `npx prisma generate`.

  - If you changed `schema.prisma`, run `npx prisma migrate dev`.

- Server-side redirects when navigating to a page:

  - Some pages require authentication. If you aren't signed in they may redirect to `/sign-in`.

  - Use `DISABLE_AUTH=true` in development to bypass auth for debugging.

- TypeScript errors after edits:

  - Run `npx tsc --noEmit` to see errors, and fix types in the files indicated.

---

## Tests

- Unit tests are run with Vitest: `npm test`.
- Tests live under `src/**/*.test.*`.

---

## Notes for contributors / maintainers

- Keep `src/lib/prisma.ts`'s singleton pattern intact to avoid multiple PrismaClient instances in development.
- When changing auth-related Prisma models (User, Session, Account), coordinate with `src/lib/auth.ts` and the Better Auth adapter expectations.
- Follow the project's branching strategy: develop on `development` and open PRs to it.

---

If you'd like a walkthrough for a specific task (for example: "add an admin-only page" or "change the movie model & migrate"), tell me which area and I'll add step-by-step instructions.
