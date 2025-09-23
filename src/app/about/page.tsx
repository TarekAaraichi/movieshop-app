import { Card } from "@/components";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-16">
      <Card className="w-full max-w-4xl bg-white/5 backdrop-blur-sm border border-white/6 shadow-lg rounded-2xl p-6 md:p-10 transition-transform hover:-translate-y-1">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-semibold shadow-sm">
          MS
          </div>
          <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
            About MovieShop
          </h1>
          <p className="mt-1 text-sm text-zinc-300">
            A modern demo storefront focused on server actions, robust cart
            semantics, and secure admin flows.
          </p>
          </div>
        </div>

        <p className="mt-6 text-zinc-200 leading-relaxed prose prose-invert max-w-none">
          MovieShop is a demonstration storefront built by{" "}
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/6 text-white/90 font-medium">
          Delta Team
          </span>{" "}
          to showcase server actions, DB-backed carts with migration/merge
          semantics, and secure admin routes using Better Auth. We emphasize
          simple, testable patterns and a clear server/client separation.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/6 text-sm text-zinc-100">
          ⚡ Server Actions
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/6 text-sm text-zinc-100">
          🧭 Prisma + Postgres
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/6 text-sm text-zinc-100">
          🎨 Tailwind
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/6 text-sm text-zinc-100">
          🔒 Better Auth
          </span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <a
          href="/catalog"
          className="inline-flex items-center justify-center rounded-md bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 text-sm font-medium shadow-sm transition"
          >
          Explore Catalog
          </a>
          <a
          href="https://github.com/your-org/movieshop"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md border border-white/8 bg-white/3 text-sm text-zinc-100 px-3 py-2 hover:bg-white/5 transition"
          >
          View on GitHub
          </a>
        </div>
        </div>

        <aside className="w-full md:w-72 flex-shrink-0 bg-white/3 border border-white/6 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-zinc-100">Built With</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-200">
          <li className="flex items-center justify-between">
          <span>Next.js App Router</span>
          <span className="text-xs bg-white/6 px-2 py-0.5 rounded">SSR + RSC</span>
          </li>
          <li className="flex items-center justify-between">
          <span>Prisma + PostgreSQL</span>
          <span className="text-xs bg-white/6 px-2 py-0.5 rounded">ORM</span>
          </li>
          <li className="flex items-center justify-between">
          <span>Tailwind CSS</span>
          <span className="text-xs bg-white/6 px-2 py-0.5 rounded">Utility</span>
          </li>
          <li className="flex items-center justify-between">
          <span>Better Auth</span>
          <span className="text-xs bg-white/6 px-2 py-0.5 rounded">Auth</span>
          </li>
        </ul>

        <div className="mt-4 text-xs text-zinc-300">
          <div className="font-medium text-zinc-100">Principles</div>
          <p className="mt-1">Testable services, clear server/client boundaries, and small surface APIs.</p>
        </div>
        </aside>
      </div>
      </Card>
    </div>
  );
}
