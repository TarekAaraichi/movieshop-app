/**
 * About page (ensured)
 * Server-rendered informational page about the project.
 */

import { Card } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";

export default function AboutPage() {
  return (
    <PageWrapper>
    <div className="main-content rounded-2xl">
      <Card className="w-full bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-slate-700/50 backdrop-blur-sm border border-zinc-800 shadow-lg rounded-2xl p-6 md:p-10 transition-transform center mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
                  About MovieShop
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  A modern demo storefront focused on server actions, robust
                  cart semantics, and secure admin flows.
                </p>
              </div>
            </div>

            <p className="mt-6 text-zinc-300 leading-relaxed prose prose-invert max-w-none">
              MovieShop is a demonstration storefront built to showcase server
              actions, DB-backed carts with migration/merge semantics, and
              secure admin routes using Better Auth. We emphasize simple,
              testable patterns and a clear server/client separation.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-sm text-zinc-200">
                ⚡ Server Actions
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-sm text-zinc-200">
                🧭 Prisma + Postgres
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-sm text-zinc-200">
                🎨 Tailwind
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-sm text-zinc-200">
                🔒 Better Auth
              </span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <a
                href="/catalog"
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium shadow-sm transition"
              >
                Explore Catalog
              </a>
              <a
                href="https://github.com/TarekAaraichi/movieshop-app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800/50 text-sm text-zinc-200 px-3 py-2 hover:bg-zinc-800/80 transition"
              >
                View on GitHub
              </a>
            </div>
          </div>

          <aside className="w-full md:w-72 flex-shrink-0 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-zinc-200">Built With</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li className="flex items-center justify-between">
                <span>Next.js App Router</span>
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded">
                  SSR + RSC
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Prisma + PostgreSQL</span>
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded">
                  ORM
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Tailwind CSS</span>
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded">
                  Utility
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Better Auth</span>
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded">
                  Auth
                </span>
              </li>
            </ul>

            <div className="mt-4 text-xs text-zinc-400">
              <div className="font-medium text-zinc-200">Principles</div>
              <p className="mt-1">
                Testable services, clear server/client boundaries, and small
                surface APIs.
              </p>
            </div>
          </aside>
        </div>
      </Card>
    </div>
    </PageWrapper>
  );
}
