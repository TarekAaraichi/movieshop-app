# Cart Migration (cookie -> DB) — how to call

This project stores the shopping cart in a cookie named `cart`. When a visitor creates or signs in to an account you should migrate any cookie-based cart into the user's DB cart so their items are preserved.

A server action is provided: `linkAccountAndMigrate(userId: string)` in `src/app/actions/cart.ts`.

Recommended integration patterns

1. Server-side auth callback (recommended)

If your authentication provider exposes a server-side callback or event that runs after sign-in, call `linkAccountAndMigrate` from that callback. Example (pseudo-code):

```ts
// server-side auth callback
import { linkAccountAndMigrate } from "@/app/actions/cart";

export async function onSignIn({ user }) {
  // user.id must be the app user id that matches prisma.user.id
  if (user?.id) {
    await linkAccountAndMigrate(user.id);
  }
  // continue with your normal flow
}
```

2. Redirect-based helper (provided)

If your auth provider only offers a client-side flow, you can redirect the user to the included helper route after sign-in. For example, after signing the user in on the client, redirect to:

```text
/auth/migrate?userId=<USER_ID>&returnUrl=/cart
```

The server helper page at `/auth/migrate` will call `linkAccountAndMigrate(userId)` on the server, clear the cookie, and redirect back to `returnUrl` (defaults to `/`).

Security note: prefer server-side callbacks when possible. Passing `userId` in query parameters is a convenience for simple setups or temporary testing only.

3. Custom flow

If your auth system has a different integration model, call `linkAccountAndMigrate(userId)` on the server once you have a verified user id. The action is idempotent: it replaces the DB cart with cookie items when present.

Where the helper is implemented

- Server action: `src/app/actions/cart.ts` — `linkAccountAndMigrate(userId: string)`
- Helper page: `src/app/auth/migrate/page.tsx` (redirect-based convenience)

If you want, I can also wire this helper into a specific auth provider (Better Auth / NextAuth / custom) — tell me which one and I will add an example integration file.
