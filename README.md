# 🎬 MovieShop: A Full-Stack Next.js 15 Showcase

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-blue?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**Live Demo**: [https://movieshop.vercel.app](https://movieshop.vercel.app) (coming soon)

MovieShop is a feature-rich, full-stack e-commerce application built to demonstrate a mastery of modern web development practices using Next.js 15, Prisma, and the latest in the React ecosystem. It serves as a comprehensive portfolio project showcasing everything from database architecture to a polished, performant, and secure user experience.

## ✨ Core Features

This project is more than just a demo; it's a fully-realized application with a wide array of features.

### Customer-Facing

- **Full E-commerce Flow**: Browse, search, and filter movies. Add them to a persistent cart and complete a simulated checkout process.
- **Robust Authentication**: Secure user sign-up, sign-in, and session management with both credential and OAuth (e.g., Google, GitHub) providers via **Better Auth**.
- **Dynamic Movie Collections**: Explore curated collections like "New Releases," "Top Rated," and browse by genre, budget, and more.
- **Persistent Shopping Cart**: Advanced cart logic that persists for anonymous users and merges with their account cart upon login.
- **User Profiles & Order History**: Registered users can manage their profile and view a history of their past orders.
- **Consistent Loading UI**: A seamless user experience with animated loading skeletons for all data-heavy pages, powered by Next.js Suspense.
- **Theming**: Switch between light and dark modes for a personalized viewing experience.
- **Responsive Design**: A beautiful, mobile-first interface that looks great on all devices.

### Administrative

- **Secure Admin Dashboard**: A role-protected area accessible only to administrators.
- **Full CRUD Operations**: Administrators can Create, Read, Update, and Delete movies, persons (actors/directors), and manage users.

### Technical & Quality Assurance

- **Automated Code Quality**: Pre-commit and pre-push hooks powered by **Husky** automatically run linting and build checks to ensure code quality and prevent errors.

- **Server Actions**: Modern data mutation patterns using Next.js Server Actions for type-safe and secure interactions between client and server.

## 🛠️ Tech Stack & Architecture

MovieShop is built with a modern, type-safe, and scalable technology stack.

- **Framework**: **Next.js 15** (with App Router, React Server Components)
- **Database ORM**: **Prisma**
- **Database**: **PostgreSQL**
- **Authentication**: **Better Auth**
- **UI Styling**: **Tailwind CSS**
- **UI Components**: **shadcn/ui**
- **Language**: **TypeScript**
- **Testing**: **Vitest**
- **Code Quality**: **ESLint**, **Prettier**, **Husky**
- **Deployment**: **Vercel**

### Architectural Highlights

- **Next.js App Router**: The application is structured around the App Router, leveraging Server Components for data fetching and server-side rendering by default, while using Client Components for interactivity.
- **Prisma Singleton**: A singleton pattern for the Prisma client (`src/lib/prisma.ts`) ensures efficient database connection management in a serverless environment.
- **Clear Server/Client Boundaries**: A strong separation of concerns between server-side logic (in `server/` and `lib/`) and client-side components.
- **Type Safety End-to-End**: TypeScript is used throughout the entire stack, from database models to API routes and UI components, ensuring robust and maintainable code.

## 🚀 Getting Started

Follow these steps to get the project running locally.

### 1. Prerequisites

- Node.js (v18 or later)
- npm
- A PostgreSQL database

### 2. Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/TarekAaraichi/movieshop-app.git
   cd movieshop-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the project root by copying the example file:

   ```bash
   cp .env.example .env
   ```

   Update the `DATABASE_URL` in your new `.env` file with your PostgreSQL connection string.

4. **Run database migrations:**
   This command applies the schema to your database.

   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database (Optional):**
   To populate the database with initial demo data, run the seed script:

   ```bash
   npm run seed
   ```

6. **Start the development server:**

   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production build of the application.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run seed`: Seeds the database with initial data.
- `npm test`: Runs unit tests with Vitest.

## Admin Features (recent)

- Added an **Orders** stat card to the admin dashboard header.
- Admin dashboard now includes an **Orders** tab with:
  - Search (order ID, user name, or email)
  - Status filter (Pending / Paid / Cancelled)
  - Paginated list and quick View links
  - Cancel action (admin-only) which marks an order CANCELLED and restocks affected movies

These features use Next.js Server Actions and server-side Prisma queries; see `src/server/actions/ordersActions.ts` for the cancel logic.

## Theming & Tokens

- The app centralizes visual tokens in `src/app/globals.css` and provides utility classes (e.g., `bg-card`, `bg-popover`, `text-foreground`) to avoid ad-hoc Tailwind color classes.
- A small pre-hydration script in the root layout ensures theme state is read from `localStorage` before React hydrates, reducing FOUC.

## Developer Notes & Gotchas

- When running the seed script you may see a Node warning about module type (seed file uses ES module syntax). This is harmless; to remove the warning add `"type": "module"` to `package.json` or run the seed via `node --input-type=module` as needed.
- The project uses Next.js 15 with Turbopack by default for dev and build. Production builds may run type/lint checks during `npm run build`.
- If you hit linting errors during CI or build, run the linter locally and address the reported issues:

```bash
npm run lint
```

- To reset and reseed the database during development:

```bash
npx prisma migrate reset --force
npm run seed
```

- Admin access: during UI iteration, server-side role enforcement was temporarily relaxed in `src/lib/requireAdmin.ts` so authenticated sessions can render admin UI—reintroduce strict role checks before deploying to production.

## Recent Changes Summary

- Centralized theme tokens and removed many hard-coded Tailwind color classes across admin components.
- Introduced a `Button` primitive and migrated many admin buttons/components to use it for consistent variants and accessibility.
- Added admin Orders tab, search, filters, and a cancel server action. See the commit message that closed issues #39 and #40 for full context.

[Back to top](#-movieshop-a-full-stack-nextjs-15-showcase)
