import { PageWrapper } from "@/components/PageThemeContext";

export default function AdminLoading() {
  return (
    <PageWrapper>
      <div className="rounded-3xl bg-transparent">
        <div className="min-h-screen space-y-8 text-zinc-100 p-4 sm:p-6 lg:p-8">
          <header className="max-w-7xl mx-auto">
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-neutral-900/80 p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <div className="h-6 w-32 rounded-full bg-neutral-700 animate-pulse"></div>
                  <div className="mt-3 h-10 w-64 rounded-lg bg-neutral-700 animate-pulse"></div>
                  <div className="mt-2 h-5 w-80 rounded-lg bg-neutral-700 animate-pulse"></div>
                </div>
              </div>
            </div>
          </header>

          <section className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg"
                >
                  <div className="h-6 w-20 rounded-full bg-neutral-700 animate-pulse"></div>
                  <div className="mt-4 h-9 w-16 rounded-lg bg-neutral-700 animate-pulse"></div>
                  <div className="mt-2 h-5 w-24 rounded-lg bg-neutral-700 animate-pulse"></div>
                </div>
              ))}
            </div>
          </section>

          <section className="max-w-7xl mx-auto">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg">
              {/* Tabs skeleton */}
              <div className="flex border-b border-zinc-700">
                <div className="h-10 w-24 bg-neutral-800 rounded-t-lg animate-pulse mr-2"></div>
                <div className="h-10 w-24 bg-neutral-800 rounded-t-lg animate-pulse mr-2"></div>
                <div className="h-10 w-24 bg-neutral-800 rounded-t-lg animate-pulse"></div>
              </div>
              {/* Search and filter bar skeleton */}
              <div className="mt-6 flex gap-4">
                <div className="h-10 grow rounded-lg bg-neutral-800 animate-pulse"></div>
                <div className="h-10 w-32 rounded-lg bg-neutral-800 animate-pulse"></div>
                <div className="h-10 w-32 rounded-lg bg-neutral-800 animate-pulse"></div>
              </div>
              {/* Table skeleton */}
              <div className="mt-6 space-y-2">
                <div className="h-12 rounded-lg bg-neutral-800 animate-pulse"></div>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-lg bg-neutral-800/50 animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
