/**
 * About page (ensured)
 * Server-rendered informational page about the project.
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageThemeContext";

export default function AboutPage() {
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto px-4 md:px-0 flex flex-col md:flex-row gap-8 items-start">
        <main className="flex-1 bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-pink-500 pb-2">
              About MovieShop
            </h1>
            <p className="mt-3 text-lg text-muted">
              MovieShop is a demo portfolio app I built as my graduation project
              for the React JavaScript System Development program. It showcases
              a full-stack e-commerce flow, server actions, and UI patterns I
              used while learning modern React/Next.js development.
            </p>
          </header>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 pl-2">
              What this project demonstrates
            </h2>
            <div className="prose max-w-none dark:prose-invert text-muted leading-relaxed space-y-4">
              <p>
                The primary goal of this project was to apply concepts from the
                React JavaScript System Development curriculum in a single,
                cohesive app. MovieShop demonstrates:
              </p>
              <ul>
                <li>
                  Server components and client boundaries with Next.js App
                  Router
                </li>
                <li>Type-safe database access using Prisma and PostgreSQL</li>
                <li>
                  Modern UX patterns: skeleton loading, accessible controls, and
                  responsive layout
                </li>
                <li>Persistent cart behavior and simulated checkout flows</li>
                <li>
                  Role-based admin UI and server actions for secure mutations
                </li>
              </ul>
              <p>
                This is a learning & portfolio project — payments are simulated
                and the site is intentionally self-contained for demonstration
                purposes.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 pl-2">
              Core features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard
                title="Full E‑commerce Flow"
                description="Search, browse, add to cart, and complete a simulated checkout."
              />
              <FeatureCard
                title="Auth & Profiles"
                description="Sign up / sign in, profile editing, and order history."
              />
              <FeatureCard
                title="Admin Area"
                description="Protected admin dashboard with CRUD for movies, people, and users."
              />
              <FeatureCard
                title="Theming & Accessibility"
                description="Light/dark themes with persisted preference and accessible components."
              />
              <FeatureCard
                title="Loading UX"
                description="Consistent skeletons and progressive loading for large pages."
              />
              <FeatureCard
                title="Server Actions"
                description="Uses Next.js server actions for secure, type-safe mutations."
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 pl-2">
              Technology stack
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
              <TechItem name="Next.js 15" category="Framework" />
              <TechItem name="React" category="UI" />
              <TechItem name="Prisma" category="ORM" />
              <TechItem name="PostgreSQL" category="Database" />
              <TechItem name="Tailwind CSS" category="Styling" />
              <TechItem name="shadcn/ui" category="Components" />
              <TechItem name="Better Auth" category="Authentication" />
              <TechItem name="TypeScript" category="Language" />
              <TechItem name="Vitest" category="Testing" />
              <TechItem name="Husky" category="Git Hooks" />
              <TechItem name="Vercel" category="Deployment" />
              <TechItem name="ESLint" category="Linting" />
              <TechItem name="Prettier" category="Formatting" />
              <TechItem name="React Hook Form" category="Forms/Validation" />
              <TechItem name="Zod" category="Schema Validation" />
              <TechItem name="clsx" category="Utility (Classnames)" />
              <TechItem name="use-debounce" category="Utility (Debounce)" />
              <TechItem name="react-hot-toast" category="Notifications" />
            </div>
          </section>

          <div className="mt-12 text-center">
            <Button
              asChild
              variant="default"
              size="lg"
              className="bg-linear-to-r from-indigo-600 to-pink-500 hover:brightness-95 text-white"
            >
              <a
                href="https://github.com/TarekAaraichi/movieshop-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                View source on GitHub
              </a>
            </Button>
          </div>
        </main>

        <aside className="w-full md:w-96 sticky top-6 self-start">
          <div className="bg-card border border-border rounded-2xl shadow-sm p-0 flex flex-col gap-4 overflow-hidden">
            <div className="p-6">
              {/* You can add project summary, quick links, or acknowledgements here if desired */}
            </div>
            <div className="text-xs text-neutral-500 dark:text-slate-500 pt-2 px-6 pb-4">
              For demo purposes only. Not for commercial use.
            </div>
          </div>
        </aside>
      </div>
    </PageWrapper>
  );
}

const FeatureCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const icons: Record<string, string> = {
    "Full E‑commerce Flow": "🛒",
    "Auth & Profiles": "👤",
    "Admin Area": "🛠️",
    "Theming & Accessibility": "🌓",
    "Loading UX": "⏳",
    "Server Actions": "⚙️",
  };

  const icon = icons[title] ?? "🔸";

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-start gap-3">
      <div className="text-2xl" aria-hidden>
        {icon}
      </div>
      <h3 className="font-bold text-foreground text-lg">{title}</h3>
      <p className="text-muted text-sm">{description}</p>
    </div>
  );
};

const TechItem = ({ name, category }: { name: string; category: string }) => {
  const icons: Record<string, string> = {
    "Next.js 15": "🟪",
    React: "⚛️",
    Prisma: "🔷",
    PostgreSQL: "🐘",
    "Tailwind CSS": "🎨",
    "shadcn/ui": "🧩",
    "Better Auth": "🔒",
    TypeScript: "🟦",
    Vitest: "✅",
    Husky: "🐶",
    Vercel: "▲",
    ESLint: "🔍",
    Prettier: "✨",
    "React Hook Form": "🧪",
    Zod: "🧬",
    clsx: "🗂️",
    "use-debounce": "🔄",
    "react-hot-toast": "🍞",
  };

  const icon = icons[name] ?? "🔹";

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="text-2xl mb-3" aria-hidden>
        {icon}
      </div>
      <p className="font-bold text-foreground">{name}</p>
      <p className="text-xs text-muted">{category}</p>
    </div>
  );
};
