Here’s a ready-to-attach **Markdown brief for Copilot**. It tells it exactly how to wire up **Better Auth – Email & Password** for a “Movies Webstore,” with framework-agnostic steps plus quick recipes for **Next.js** and **Express/Hono** backends.

---

# Implement Better Auth (Email & Password) in the Movies Webstore

> Goal: Add secure email/password auth for browsing, checkout, and account pages. Use Better Auth’s cookie-based sessions and server checks.

## 1) Install & Env

```bash
pnpm add better-auth
# add an adapter for your DB (choose one):
pnpm add better-auth/adapters/prisma
# or
pnpm add better-auth/adapters/drizzle
# and your ORM driver(s)
```

Create `.env` (values are examples):

```env
BETTER_AUTH_SECRET=replace-with-a-strong-random-string
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgres://user:pass@host:5432/db
```

Refs: install + env keys and base URL. ([Better Auth][1])

## 2) Database & Schema

Pick an adapter (Prisma or Drizzle). Generate schemas and run migrations with Better Auth CLI, then your ORM’s migration tool.

```bash
# Generate schema files based on your Better Auth config & plugins
npx @better-auth/cli@latest generate
# Run your ORM migrations (examples)
# Prisma:
pnpm prisma migrate dev
# Drizzle:
pnpm drizzle-kit generate && pnpm drizzle-kit migrate
```

Refs: adapters + CLI generate/migrate. ([Better Auth][2])

> Need custom fields later (e.g., `role`, `favoriteGenre`)? Add via Better Auth’s typed schema extensions and re-run `generate`. ([Better Auth][3])

## 3) Create the Auth instance (`auth.ts`)

Create `src/lib/auth.ts` (path can vary; export as `auth`):

```ts
import { betterAuth } from "better-auth";
// Choose ONE adapter block that matches your stack:

/** Prisma example */
// import { prisma } from "@/lib/prisma"; // your Prisma client
// import { prismaAdapter } from "better-auth/adapters/prisma";
// export const auth = betterAuth({
//   database: prismaAdapter(prisma),
//   emailAndPassword: { enabled: true },
// });

/** Drizzle example */
// import { db } from "@/lib/db"; // your Drizzle client
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// export const auth = betterAuth({
//   database: drizzleAdapter(db, { provider: "pg" }),
//   emailAndPassword: { enabled: true },
// });
```

Enable the built-in **email/password** method via `emailAndPassword.enabled: true`. ([Better Auth][1])

## 4) Mount the API route (`/api/auth/*`)

Expose Better Auth’s handlers at `/api/auth/*` in your framework’s router. (Use the official integration snippet for your framework.) ([Better Auth][1])

## 5) Client setup (`authClient`)

Create `src/lib/auth-client.ts`:

```ts
import { createAuthClient } from "better-auth/client";
export const authClient = createAuthClient();
```

Refs: client concept and usage. ([Better Auth][4])

## 6) Sign Up / Sign In UI (Email & Password)

Use client-side helpers only (don’t call these from the server):

```ts
// sign-up
await authClient.signUp.email({
  email,
  name,          // include if you collect it
  password,
});

// sign-in
await authClient.signIn.email({
  email,
  password,
});

// sign-out
await authClient.signOut();
```

Refs: basic usage for `signUp.email`, `signIn.email`, and sign-out. ([Better Auth][5])

## 7) Session access

**Client:** reactive hook or direct fetch

```ts
const { data: session } = authClient.useSession();
// or
const session = await authClient.getSession();
```

**Server:** pass the current request headers

```ts
import { auth } from "@/lib/auth";
const session = await auth.api.getSession({ headers: req.headers });
// Redirect/403 if not logged in
```

Refs: cookie-based sessions and server `getSession({ headers })`. ([Better Auth][6])

## 8) Route protection in the Movies Webstore

### Protect purchase & account pages

* **Anonymous allowed**: Home, Catalog, Movie details.
* **Auth required**: Checkout, Order history, Account settings, Saved lists.

**Pattern (server-side):**

```ts
// Example server action / API handler
const session = await auth.api.getSession({ headers: req.headers });
if (!session) return new Response("Unauthorized", { status: 401 });
// proceed with order creation, etc.
```

**Next.js recipe (RSC / server actions):**

```ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session) redirect("/sign-in");
  // render account UI
}
```

Refs: Next integration examples for checking session + redirect. ([Better Auth][7])

**Hono/Express middleware shape:**

```ts
// Hono
app.use("/checkout/*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.header() });
  if (!session) return c.redirect("/sign-in");
  await next();
});

// Express
app.use("/checkout", async (req, res, next) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.redirect("/sign-in");
  next();
});
```

Refs: framework-agnostic server API and headers handling. ([Better Auth][8])

## 9) Email flows you’ll likely add next

* **Email verification** after sign-up
* **Password reset** (request + confirm)

Wire these using Better Auth’s email utilities. (You can layer in your mailer of choice later.) ([Better Auth][9])

## 10) DX & Migrations

* When you change auth config or add plugins/fields, **re-run**:

  ```bash
  npx @better-auth/cli generate
  # then run your ORM migration tool
  ```

  ([Better Auth][2])

## 11) Copilot tasks to request (suggested prompts)

* “Create the `auth.ts` with Prisma adapter, `emailAndPassword.enabled = true`, using `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and my existing Prisma client.” ([Better Auth][1])
* “Add a Next.js route handler mounting Better Auth at `/api/auth/*` and show me the folder structure.” ([Better Auth][1])
* “Generate a `SignInForm` and `SignUpForm` that call `authClient.signIn.email` and `authClient.signUp.email`, with zod validation and error toasts.” ([Better Auth][5])
* “Create a server action `createOrder` that checks `auth.api.getSession({ headers })` and returns 401 if missing; otherwise writes the order.” ([Better Auth][8])
* “Write a Next.js guard for `/checkout` that redirects to `/sign-in` if unauthenticated.” ([Better Auth][7])

## 12) Common pitfalls (and fixes)

* **404 on `/api/auth/sign-up/email`** → You didn’t mount the `/api/auth/*` route (or mounted a different base path). Mount it per your framework integration. ([Reddit][10])
* **`getSession` returns `null`** → Ensure you pass the **current request headers** and that cookies are being set on your domain; double-check `BETTER_AUTH_URL` and cookie domain (avoid cross-site mismatch in dev). ([Better Auth][8])
* **Migrations out of sync after changing config** → Re-run `npx @better-auth/cli generate` and your ORM migrations. ([Better Auth][2])

---

### References

* Better Auth – **Installation & Mounting** (env, base URL, route mounting). ([Better Auth][1])
* Better Auth – **Email & Password** (enable and use). ([Better Auth][11])
* Better Auth – **Basic Usage** (client `signUp.email`, `signIn.email`). ([Better Auth][5])
* Better Auth – **Client & API concepts** (client lib, headers access). ([Better Auth][4])
* Better Auth – **Session Management** (cookie sessions). ([Better Auth][6])
* Better Auth – **Next.js Integration** (server checks/redirects). ([Better Auth][7])
* Adapters: **Prisma / Drizzle** (schema generation & migration). ([Better Auth][2])
* Community reports on 404s/cookies (helpful for troubleshooting). ([Reddit][10])

---

**That’s it.** Attach this file to your Copilot chat and ask it to generate the concrete files (auth instance, API route, forms, guards, and tests) for your Movies Webstore.

[1]: https://www.better-auth.com/docs/installation?utm_source=chatgpt.com "Installation"
[2]: https://www.better-auth.com/docs/adapters/prisma?utm_source=chatgpt.com "Prisma"
[3]: https://www.better-auth.com/docs/concepts/database?utm_source=chatgpt.com "Database"
[4]: https://www.better-auth.com/docs/concepts/client?utm_source=chatgpt.com "Client"
[5]: https://www.better-auth.com/docs/basic-usage?utm_source=chatgpt.com "Basic Usage"
[6]: https://www.better-auth.com/docs/concepts/session-management?utm_source=chatgpt.com "Session Management"
[7]: https://www.better-auth.com/docs/integrations/next?utm_source=chatgpt.com "Next.js integration"
[8]: https://www.better-auth.com/docs/concepts/api?utm_source=chatgpt.com "API"
[9]: https://www.better-auth.com/docs/concepts/email?utm_source=chatgpt.com "Email"
[10]: https://www.reddit.com/r/sveltejs/comments/1l776mv/better_auth_issue_not_found_apiauthsignupemail/?utm_source=chatgpt.com "Better Auth issue: Not found: /api/auth/sign-up/email"
[11]: https://www.better-auth.com/docs/authentication/email-password?utm_source=chatgpt.com "Email & Password"
