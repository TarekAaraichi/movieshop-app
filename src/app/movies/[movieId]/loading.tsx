import { PageWrapper } from "@/components/PageThemeContext";

export default function MovieDetailLoading() {
  return (
    <PageWrapper>
      <div className="w-full mx-auto flex items-start gap-2 p-1 rounded-2xl">
        <aside className="shrink-0 p-2">
          <div className="w-64 min-w-66 h-94 rounded-xl bg-neutral-800 animate-pulse"></div>
          <div className="mt-4 w-64 min-w-66">
            <div className="h-12 rounded-xl bg-neutral-800 animate-pulse"></div>
            <div className="mt-3 h-12 rounded-xl bg-neutral-800 animate-pulse"></div>
          </div>
        </aside>
        <main className="w-full mx-auto grow p-2">
          <section className="flex flex-row gap-6 items-start p-5 rounded-[14px] bg-neutral-900/80 border border-neutral-800">
            <div className="flex-1 min-w-0">
              <div className="h-9 w-3/4 rounded-lg bg-neutral-700 animate-pulse"></div>
              <div className="h-5 w-1/2 mt-3 rounded-lg bg-neutral-700 animate-pulse"></div>

              <div className="mt-4 flex flex-wrap gap-2">
                <div className="h-7 w-20 rounded-full bg-neutral-700 animate-pulse"></div>
                <div className="h-7 w-24 rounded-full bg-neutral-700 animate-pulse"></div>
              </div>

              <div className="mt-4 flex gap-3 items-center">
                <div className="h-17.5 w-28 rounded-lg bg-neutral-800/50 animate-pulse"></div>
                <div className="h-17.5 w-28 rounded-lg bg-neutral-800/50 animate-pulse"></div>
                <div className="h-17.5 w-28 rounded-lg bg-neutral-800/50 animate-pulse"></div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="h-4 rounded-lg bg-neutral-700 animate-pulse"></div>
                <div className="h-4 rounded-lg bg-neutral-700 animate-pulse"></div>
                <div className="h-4 w-5/6 rounded-lg bg-neutral-700 animate-pulse"></div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="h-16 rounded-xl bg-neutral-900/60 animate-pulse"></div>
                <div className="h-16 rounded-xl bg-neutral-900/60 animate-pulse"></div>
              </div>

              <div className="mt-6 h-10 w-1/2 rounded-md bg-neutral-800/50 animate-pulse"></div>

              <div className="mt-6">
                <div className="h-5 w-16 mb-3 rounded-lg bg-neutral-700 animate-pulse"></div>
                <div className="flex flex-wrap gap-3 p-2">
                  <div className="h-16 w-48 rounded-lg bg-neutral-800 animate-pulse"></div>
                  <div className="h-16 w-48 rounded-lg bg-neutral-800 animate-pulse"></div>
                  <div className="h-16 w-48 rounded-lg bg-neutral-800 animate-pulse"></div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </PageWrapper>
  );
}
