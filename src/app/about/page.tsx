/**
 * About page (ensured)
 * Server-rendered informational page about the project.
 */

import { Card } from "@/components/ui/card";
import { PageWrapper } from "@/components/PageThemeContext";

export default function AboutPage() {
  return (
    <PageWrapper>
      <div className="m-auto max-w-4xl w-full">
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-slate-700/50">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-white to-zinc-300 pb-2">
              About MovieShop
            </h1>
            <p className="mt-3 text-lg text-zinc-400">
              A feature-rich, full-stack e-commerce platform for movies, built
              with modern web technologies.
            </p>
          </header>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 border-l-4 border-indigo-500 pl-4">
              Project Vision
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed space-y-4">
              <p>
                MovieShop was developed as a portfolio project to demonstrate a
                comprehensive understanding of full-stack web development using
                the Next.js 15 App Router. The goal was to create a
                production-quality, feature-complete e-commerce application that
                not only looks great but also incorporates best practices in
                architecture, performance, and user experience.
              </p>
              <p>
                This project showcases everything from database design and
                server-side data fetching to secure authentication, complex
                state management, and a polished, responsive user interface. It
                serves as a testament to the skills required to build and deploy
                a modern, scalable web application from the ground up.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-4">
              Core Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard
                title="Full E-commerce Flow"
                description="From browsing and searching to adding items to a persistent cart and completing a simulated checkout."
              />
              <FeatureCard
                title="Advanced Admin Dashboard"
                description="A secure, role-protected area for administrators to perform CRUD operations on movies, people, and users."
              />
              <FeatureCard
                title="Robust Authentication"
                description="Secure user registration, login, and session management powered by Better Auth, with credential and OAuth providers."
              />
              <FeatureCard
                title="Dynamic Movie Collections"
                description="Explore curated collections like 'New Releases', 'Top Rated', and browse by genre, budget, and more."
              />
              <FeatureCard
                title="Optimistic UI & Skeletons"
                description="A seamless user experience with optimistic updates for actions like adding to cart, and consistent loading skeletons across all pages."
              />
              <FeatureCard
                title="Code Quality Assurance"
                description="Integrated Husky Git hooks to enforce linting and build checks, ensuring high-quality, error-free code commits."
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-4">
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
              className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800/50 text-sm text-zinc-200 px-6 py-3 hover:bg-zinc-800/80 transition-colors duration-300 font-semibold"
            >
              View Source Code on GitHub
            </a>
          </div>
        </Card>
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
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
    <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
    <p className="text-zinc-400 text-sm">{description}</p>
  </div>
);

const TechItem = ({ name, category }: { name: string; category: string }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col justify-center items-center">
    <p className="font-bold text-white">{name}</p>
    <p className="text-xs text-zinc-400">{category}</p>
  </div>
);
