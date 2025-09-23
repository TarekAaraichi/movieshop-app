<!--
  README: MovieShop App
  Short project overview and quick start instructions.
-->

# 🎬 MovieShop — Student / Contributor Guide

Minimal guide to run and inspect the MovieShop project (Next.js App Router, Prisma, Tailwind, Better Auth).

## Quick commands

1. Install dependencies

   ```pwsh
   npm install
   ```

2. Generate Prisma client & run migrations

   ```pwsh
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. (Optional) Seed demo data

   ```pwsh
   npm run seed
   ```

4. Start dev server

   ```pwsh
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Quick pointers

- `src/lib/prisma.ts` — Prisma client singleton.
- `src/hooks/useCart.tsx` — Client cart hook (optimistic updates).
- `src/app/api/cart/route.ts` — Server cart API and canonicalization logic.

If you want, I can add concise top-of-file comments to selected source files (for example: `src/hooks/useCart.tsx`, `src/app/api/cart/route.ts`, `src/app/movies/[movieId]/page.tsx`).
