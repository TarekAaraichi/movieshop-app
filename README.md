# 🎬 MovieShop Technical Overview & Contributor Guide

This document provides a comprehensive overview of the MovieShop application, including its architecture, features, and technical implementation. It serves as a guide for developers and contributors.

## 1. Project Overview

MovieShop is a modern, full-stack e-commerce application built for browsing and purchasing movies. It features a clean, responsive user interface, a robust backend, and a complete set of features for both customers and administrators. The application is built with a focus on performance, developer experience, and modern web standards.

## 2. Tech Stack

The project leverages a modern, type-safe technology stack:

- **Framework**: [Next.js](https://nextjs.org/) 15 (with App Router)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [Better Auth](https://better-auth.dev/)
- **UI Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Testing**: [Vitest](https://vitest.dev/)

## 3. Core Features

### Customer-Facing Features

- **Authentication**: Secure user sign-up, sign-in, and session management.
- **Movie Browsing**: View a paginated list of all movies, with search and filtering capabilities.
- **Movie Details**: Dedicated pages for each movie with detailed information, including cast and crew.
- **Collections**: Curated movie collections such as "New Releases," "Top Rated," and genre-specific pages.
- **Shopping Cart**: A persistent, client-side shopping cart with optimistic UI updates for a smooth user experience.
- **Checkout**: A simulated checkout process to "purchase" movies.
- **User Profile**: A dedicated page for users to view their order history and manage their account details.
- **Theme Switching**: A light/dark mode theme switcher for improved user experience.

### Administrative Features

- **Admin Dashboard**: A protected area for managing application data.
- **Movie Management**: CRUD (Create, Read, Update, Delete) operations for movies.
- **Person Management**: CRUD operations for actors and directors.
- **User Management**: View and manage user accounts.

## 4. Project Structure

The codebase is organized into a `src` directory, following modern Next.js conventions.

```
/
├── prisma/               # Prisma schema, database migrations, and seed scripts
├── public/               # Static assets (images, fonts)
├── src/
│   ├── app/              # Next.js App Router: pages, layouts, and API routes
│   │   ├── admin/        # Admin dashboard pages
│   │   ├── api/          # API routes (auth, cart)
│   │   ├── (customer)/   # Customer-facing pages (movies, cart, profile)
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   │
│   ├── components/       # Reusable React components (UI elements, forms)
│   │   └── ui/           # Core UI components from shadcn/ui
│   │
│   ├── hooks/            # Custom React hooks (e.g., useCart)
│   │
│   ├── lib/              # Core libraries, helper functions, and client instances
│   │   ├── auth.ts       # Authentication configuration
│   │   └── prisma.ts     # Prisma client singleton
│   │
│   ├── server/           # Server-side logic
│   │   ├── actions/      # Next.js Server Actions for mutations
│   │   └── services/     # Server-side business logic
│   │
│   └── types/            # TypeScript type definitions
│
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

### Key Architectural Concepts

- **Server Components & Client Components**: The app extensively uses the React Server Components (RSC) model introduced in Next.js. Server-side fetching and rendering are the default, with client-side interactivity opted into via the `"use client"` directive.
- **Server Actions**: Data mutations (e.g., adding to cart, creating a movie) are handled by Next.js Server Actions, allowing for direct, secure function calls from client components to the server without manually creating API endpoints.
- **Prisma Singleton**: The `src/lib/prisma.ts` file implements a singleton pattern to ensure only one instance of the Prisma client is used throughout the application, which is crucial for performance and avoiding connection issues in a serverless environment.
- **Styling**: The UI is built with Tailwind CSS for utility-first styling, and `shadcn/ui` provides a set of accessible and composable base components.

## 5. Getting Started

Follow these steps to get the project running locally.

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root and add your PostgreSQL database connection string:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### 3. Run Database Migrations

This command will apply all pending database migrations. The first time you run it, it will create all the tables defined in the Prisma schema.

```bash
npx prisma migrate dev
```

### 4. (Optional) Seed the Database

To populate the database with initial demo data (movies, genres, etc.), run the seed script:

```bash
npm run seed
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.
