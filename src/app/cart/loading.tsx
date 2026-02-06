import { PageWrapper } from "@/components/PageThemeContext";

export default function CartLoading() {
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto px-4 md:px-0 flex flex-col md:flex-row gap-8 items-start">
        <main className="flex-1 bg-neutral-900/80 rounded-2xl shadow-sm p-6 md:p-8 border border-gray-800">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <div className="h-8 w-48 rounded-lg bg-neutral-700 animate-pulse"></div>
              <div className="h-5 w-64 mt-2 rounded-lg bg-neutral-700 animate-pulse"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="h-6 w-24 rounded-lg bg-neutral-700 animate-pulse"></div>
              <div className="h-4 w-32 ml-auto rounded-lg bg-neutral-700 animate-pulse"></div>
            </div>

            <div className="rounded-lg border border-slate-700 overflow-hidden">
              {/* Skeleton for a few cart items */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border-b border-slate-800 last:border-b-0"
                >
                  <div className="w-24 h-36 rounded-md bg-neutral-800 animate-pulse"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 rounded-lg bg-neutral-700 animate-pulse"></div>
                    <div className="h-4 w-1/4 rounded-lg bg-neutral-700 animate-pulse"></div>
                  </div>
                  <div className="h-10 w-24 rounded-lg bg-neutral-800 animate-pulse"></div>
                  <div className="h-6 w-16 rounded-lg bg-neutral-700 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <aside className="w-full md:w-96 sticky top-6 self-start">
          <div className="bg-neutral-900/80 rounded-2xl shadow-sm p-0 border border-gray-800 flex flex-col gap-4 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="h-7 w-32 rounded-lg bg-neutral-700 animate-pulse"></div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-5 w-20 rounded-lg bg-neutral-700 animate-pulse"></div>
                  <div className="h-5 w-16 rounded-lg bg-neutral-700 animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-5 w-24 rounded-lg bg-neutral-700 animate-pulse"></div>
                  <div className="h-5 w-12 rounded-lg bg-neutral-700 animate-pulse"></div>
                </div>
              </div>
              <div className="border-t border-slate-700 pt-4 flex justify-between">
                <div className="h-6 w-28 rounded-lg bg-neutral-700 animate-pulse"></div>
                <div className="h-6 w-20 rounded-lg bg-neutral-700 animate-pulse"></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700 px-6">
              <div className="h-12 w-full rounded-md bg-neutral-800 animate-pulse"></div>
              <div className="h-10 w-full mt-3 rounded-md bg-neutral-800 animate-pulse"></div>
            </div>

            <div className="text-xs text-slate-500 pt-2 px-6 pb-4">
              <div className="h-3 w-full rounded-lg bg-neutral-700 animate-pulse"></div>
              <div className="h-3 w-1/2 mt-2 rounded-lg bg-neutral-700 animate-pulse"></div>
            </div>
          </div>
        </aside>
      </div>
    </PageWrapper>
  );
}
