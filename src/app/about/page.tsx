/**
 * About page (ensured)
 * Server-rendered informational page about the project.
 */

import { Card } from "@/components/ui/card";
import { PageWrapper } from "@/components/PageThemeContext";

export default function AboutPage() {
  return (
    <PageWrapper>
      <div className="grow flex items-center justify-center">
        <div className="max-w-4xl w-full p-4">
          <Card className="p-6 sm:p-8 bg-card">
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-pink-400 pb-2">
                About MovieShop
              </h1>
              <p className="mt-3 text-lg text-muted">
                A feature-rich, full-stack e-commerce platform for movies, built
                with modern web technologies.
              </p>
            </header>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 pl-2">
                Project Vision
              </h2>
              <div className="prose max-w-none dark:prose-invert text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-4">
                <p>
                  MovieShop was developed as a portfolio project to demonstrate
                  a comprehensive understanding of full-stack web development
                  using the Next.js 15 App Router. The goal was to create a
                  production-quality, feature-complete e-commerce application
                  that not only looks great but also incorporates best practices
                  in architecture, performance, and user experience.
                </p>
                <p>
                  This project showcases everything from database design and
                  server-side data fetching to secure authentication, complex
                  state management, and a polished, responsive user interface.
                  It serves as a testament to the skills required to build and
                  deploy a modern, scalable web application from the ground up.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 pl-2">
                Core Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureCard
                  title="Full E-commerce Flow"
                  description="Browse, search, and filter movies. Add them to a persistent cart and complete a simulated checkout process."
                />
                <FeatureCard
                  title="Robust Authentication"
                  description="Secure user sign-up, sign-in, and session management with both credential and OAuth providers via Better Auth."
                />
                <FeatureCard
                  title="Dynamic Movie Collections"
                  description="Explore curated collections like 'New Releases', 'Top Rated', and browse by genre, budget, and more."
                />
                <FeatureCard
                  title="Persistent Shopping Cart"
                  description="Advanced cart logic that persists for anonymous users and merges with their account cart upon login."
                />
                <FeatureCard
                  title="User Profiles & Order History"
                  description="Registered users can manage their profile and view a history of their past orders."
                />
                <FeatureCard
                  title="Consistent Loading UI"
                  description="A seamless user experience with animated loading skeletons for all data-heavy pages, powered by Next.js Suspense."
                />
                <FeatureCard
                  title="Theming"
                  description="Switch between light and dark modes for a personalized viewing experience."
                />
                <FeatureCard
                  title="Secure Admin Dashboard"
                  description="A role-protected area accessible only to administrators with full CRUD operations for movies, people, and users."
                />
                <FeatureCard
                  title="Automated Code Quality"
                  description="Pre-commit and pre-push hooks powered by Husky automatically run linting and build checks to ensure code quality."
                />
                <FeatureCard
                  title="Server Actions"
                  description="Modern data mutation patterns using Next.js Server Actions for type-safe and secure interactions."
                />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 pl-2">
                Technology Stack
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
                <TechItem name="Next.js 15" category="Framework" />
                <TechItem name="React & RSC" category="UI Library" />
                <TechItem name="Prisma" category="ORM" />
                <TechItem name="PostgreSQL" category="Database" />
                <TechItem name="Tailwind CSS" category="Styling" />
                <TechItem name="shadcn/ui" category="Components" />
                <TechItem name="Better Auth" category="Authentication" />
                <TechItem name="TypeScript" category="Language" />
                <TechItem name="Vitest" category="Testing" />
                <TechItem name="Husky" category="Git Hooks" />
                <TechItem name="Vercel" category="Deployment" />
              </div>
            </section>

            <div className="mt-16 text-center">
              <a
                href="https://github.com/TarekAaraichi/movieshop-app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-border bg-card text-sm text-foreground px-6 py-3 hover:bg-card/90 transition-colors duration-300 font-semibold"
              >
                View Source Code on GitHub
              </a>
            </div>
          </Card>
        </div>
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
}) => (
  <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
    <h3 className="font-bold text-foreground text-lg mb-2">{title}</h3>
    <p className="text-muted text-sm">{description}</p>
  </div>
);

const TechItem = ({ name, category }: { name: string; category: string }) => (
  <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
    <p className="font-bold text-foreground">{name}</p>
    <p className="text-xs text-muted">{category}</p>
  </div>
);
