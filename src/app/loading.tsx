import { PageWrapper } from "@/components/PageThemeContext";

function CarouselSkeleton() {
  return (
    <div>
      <div className="h-8 w-1/4 mb-4 rounded-lg sk-rect animate-pulse"></div>
      <div className="flex space-x-6 overflow-hidden">
        {[...Array(5)].map((_, j) => (
          <div
            key={j}
            className="h-80 w-52 shrink-0 rounded-lg sk-rect-2 animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
}

export default function HomeLoading() {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 rounded-2xl">
        {/* Theme-aware skeleton variables: supports OS prefers-color-scheme and `.dark` class */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .skeleton { --sk-1: #e6e6e6; --sk-2: #d1d5db; --sk-3: #f3f4f6; }
          .dark .skeleton { --sk-1: #27272a; --sk-2: #111827; --sk-3: #0b1220; }
          .skeleton .sk-rect { background-color: var(--sk-1) }
          .skeleton .sk-rect-2 { background-color: var(--sk-2) }
          .skeleton .sk-hero { background-color: var(--sk-3) }
`,
          }}
        />

        <div className="skeleton">
          {/* Hero Section Skeleton */}
          <section className="relative overflow-hidden rounded-lg sk-hero p-8 sm:p-16 text-center mb-12 border border-primary/30">
            <div className="relative z-10">
              <div className="h-12 sm:h-16 w-3/4 mx-auto rounded-lg sk-rect animate-pulse"></div>
              <div className="mt-6 h-6 w-full max-w-2xl mx-auto rounded-lg sk-rect animate-pulse"></div>
              <div className="mt-2 h-6 w-1/2 max-w-2xl mx-auto rounded-lg sk-rect animate-pulse"></div>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <div className="h-12 w-40 rounded-md sk-rect animate-pulse"></div>
                <div className="h-12 w-32 rounded-md sk-rect animate-pulse"></div>
              </div>
            </div>
          </section>

          {/* Movie Carousels Skeleton */}
          <div className="space-y-12">
            <CarouselSkeleton />
            <CarouselSkeleton />
            <CarouselSkeleton />
            <CarouselSkeleton />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
