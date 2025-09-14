# Better Auth Integration Guide

This document explains how to integrate Better Auth into this MovieShop project (Next.js 15 + Prisma). It assumes you have a running PostgreSQL DB and Prisma configured (`DATABASE_URL`).

Goal
- Enable user registration/login with Better Auth
- Keep Better Auth user schema compatible with Prisma models in `prisma/schema.prisma`
- Migrate anonymous cookie cart into a DB `Cart` when users sign up or sign in

Pre-checks (what I confirmed in this repo)
- Prisma is configured and migrations exist in `prisma/migrations/` (including a `better_auth_init` migration).
- Generated Prisma client exists under `src/generated/prisma` (client present).
- `prisma/schema.prisma` contains a `User` model compatible with Better Auth fields (email, password, username, isAnonymous, etc.).

Steps

1) Install Better Auth SDK

Run (if you haven't already):

```powershell
npm install @better-auth/sdk
```

(Replace package name with the actual Better Auth package if different; check Better Auth docs.)

2) Environment variables

Add the required Better Auth env vars to your `.env` (example names — replace with actual values from Better Auth):

```text
DATABASE_URL=postgresql://...
BETTER_AUTH_API_KEY=your_api_key
BETTER_AUTH_BASE_URL=https://api.betterauth.example
NEXT_PUBLIC_BETTER_AUTH_CLIENT_ID=...
```

3) Prisma: Confirm Better Auth user schema mapping

Your `prisma/schema.prisma` already contains a `User` model with fields commonly used by Better Auth (email, password, username, displayUsername, isAnonymous). If Better Auth requires extra fields or relations, update the `User` model and run a migration.

4) Middleware / Route protection (Next.js App Router)

You can create a server-side helper `src/lib/auth.ts` that wraps Better Auth session checks and exposes helper functions for server components and server actions.

Example (pseudo):

```ts
// src/lib/auth.ts
import { getSession } from '@better-auth/sdk/server';
import prisma from '@/lib/prisma';

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  // Map or create local user if necessary
  let user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    user = await prisma.user.create({ data: { email: session.user.email, name: session.user.name || '', isAnonymous: false } });
  }
  return user;
}
```

5) Migrate cookie-cart to DB cart on login/register

In your auth callback (where the user registers or signs in), call a server action that migrates the cookie cart into the DB cart (you already have similar functions in `src/app/actions/cart.ts`). Ensure the cookie is cleared after migration.

6) Protecting pages

Use server-side user checks in server components to show/hide content. Example in `src/app/dashboard/page.tsx`:

```tsx
import { getCurrentUser } from '@/lib/auth';
export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) return <Redirect to="/auth/login" />; // pseudo
  // ... render dashboard
}
```

7) Session utilities for client

Expose a minimal client helper to check auth state (`/auth/status` route or an API route) if needed for client-side components.

8) Testing and verification
- Create a test user, sign in, and ensure `prisma.user` entry exists for that email.
- Add items to cart while anonymous, then sign in — verify the DB `Cart` associated with the user contains the migrated items and cookie cleared.

9) Optional: Better Auth username / plugins
- Your schema includes `username`, `displayUsername`, and `isAnonymous` fields — make sure these align with Better Auth plugins if you enable them.

Troubleshooting
- If sessions aren't found server-side, ensure the Better Auth secret/config is set in `process.env` and that your Next.js server can reach Better Auth endpoints.
- If cookie migration doesn't run, inspect the server logs for the migration server action and ensure `cookieStore` is called correctly.

Security notes
- Keep secret env vars out of source control.
- Use `HttpOnly` cookies for session tokens.


"Done" checklist for us to mark integration complete
- [ ] Install Better Auth SDK and set env vars
- [ ] Implement `src/lib/auth.ts` and `getCurrentUser` wrapper
- [ ] Hook into Better Auth callback to call cart migration
- [ ] Protect dashboard and admin pages with `getCurrentUser`
- [ ] End-to-end manual test: anonymous cart → sign up → migrate cart → checkout


If you want, I can:
- Implement `src/lib/auth.ts` and the cart-migrate-on-login glue in a new branch.
- Add a small example auth callback page/route using the SDK.

Tell me if you want me to implement these files now.