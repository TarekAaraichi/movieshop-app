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
