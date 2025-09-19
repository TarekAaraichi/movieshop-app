# 🎬 MovieShop - Delta team

Full-stack e-commerce platform for purchasing and managing movies.  
Built with **Next.js 15**, **PostgreSQL**, **Prisma**, **Tailwind CSS**, **shadcn/ui**, **Better Auth**, and **Zod**.

## 🚀 Setup instructions

1. Clone the repo and checkout the desired branch (default: `development`).
2. Create a `.env` file in the project root. Copy from `.env.example` if available, and update your database credentials (DB password, etc.).
3. Run `npm install` to install all required packages. If you see missing package errors (e.g. `react`, `react-dom`, `next`, `@prisma/client`), install them manually with `npm install <package>`.
4. Ensure you have a local Postgres database named `movieshop` (or update your `.env` with your database name). Prisma will auto-create it if needed.
5. If you get errors about Prisma client initialization, make sure:
   - You have run `npm install @prisma/client prisma`.
   - You have run `npx prisma generate` after installing packages.
   - You are using the singleton pattern for Prisma client in `src/lib/prisma.ts` (see code comments for details).
   - If you get schema output errors, comment out the `output` line in `prisma/schema.prisma`.
6. Run `npx prisma migrate dev` to apply the schema and create tables.
7. Run `npm run dev` to start the Next.js development server.

## Seeding via Better Auth (recommended)

If you want demo users created using the Better Auth library so passwords and accounts match the library's expectations, start the dev server first and then run:

```bash
# in one terminal
npm run dev

# in another terminal (project root)
npm run seed:auth
```

This will POST to the library's `/api/auth/sign-up/email` endpoint and create the demo users (`demo@example.com` and `admin@example.com`).

## Temporarily disabling authentication (show pages as signed-in)

If you want to run the app without the Better Auth checks (for development/testing or to view pages that are hidden behind auth), there's a non-destructive toggle.

- Set `DISABLE_AUTH=true` in your environment before starting the dev server. The app will export a small shim that makes `auth.api.getSession()` return a fake user (by default `demo@example.com` with role `admin`) and `auth.api.signOut()` becomes a no-op. This preserves the existing code paths while letting you view protected pages.

PowerShell example:

```powershell
$env:DISABLE_AUTH = 'true'
npm run dev
```

To customize the fake user, set these environment variables before starting the server:

```powershell
$env:FAKE_USER_EMAIL = 'you@local.test'
$env:FAKE_USER_NAME = 'Local User'
$env:FAKE_USER_ROLE = 'admin'
$env:DISABLE_AUTH = 'true'
npm run dev
```

To run normally again, unset `DISABLE_AUTH` or set it to any value other than `'true'`.

Note: This is intended strictly for local development and debugging. Do not enable `DISABLE_AUTH` in production.

## 🌿 Branching Strategy

- `main`: protected, stable branch
- `development`: default branch for all work
- Feature branches: `feat/<feature-name>` branched from `development`
- Submit a PR back to development when done.

## 📂 Docs

- [ERD Diagram](./docs/ERD.md) → database model overview
- [Project Description & Requirements](./docs/MovieProject.pdf) → detailed overview of project goals and specifications

## ✅ Tech Stack

- **Frontend**: Next.js 15 + App Router, Tailwind CSS, shadcn/ui
- **Backend**: Prisma + PostgreSQL
- **Auth**: Better Auth
- **Validation**: Zod
- **Version control**: GitHub with protected branches & PR workflow
