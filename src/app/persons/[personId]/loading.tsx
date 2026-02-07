import { PageWrapper } from "@/components/PageThemeContext";

export default function PersonDetailLoading() {
  return (
    <PageWrapper>
      <div className="w-full mx-auto flex items-start gap-2 p-1 rounded-2xl">
        <aside className="shrink-0 p-2">
          <div className="w-64 h-64 rounded-full bg-gray-200 dark:bg-neutral-800 animate-pulse"></div>
          <div className="mt-4 w-64 min-w-66">
            <div className="mt-3 h-12 rounded-xl bg-gray-200 dark:bg-neutral-800 animate-pulse"></div>
            <div className="mt-3 h-12 rounded-xl bg-gray-200 dark:bg-neutral-800 animate-pulse"></div>
          </div>
        </aside>
        <main className="w-full mx-auto grow p-2">
          <section className="flex flex-col gap-6 items-start p-5 rounded-[14px] bg-white dark:bg-neutral-900/80 border border-gray-200 dark:border-neutral-700">
            <div className="flex-1 min-w-0">
              <div className="h-9 w-1/2 rounded-lg bg-gray-300 dark:bg-neutral-700 animate-pulse"></div>
              <div className="mt-3 space-y-2">
                <div className="h-4 rounded-lg bg-gray-300 dark:bg-neutral-700 animate-pulse"></div>
                <div className="h-4 w-5/6 rounded-lg bg-gray-300 dark:bg-neutral-700 animate-pulse"></div>
              </div>
            </div>

            <div className="w-full">
              <div className="h-5 w-24 mt-5 mb-2 rounded-lg bg-gray-300 dark:bg-neutral-700 animate-pulse"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 p-3">
                <div className="h-80 rounded-lg bg-gray-200 dark:bg-neutral-800 animate-pulse"></div>
                <div className="h-80 rounded-lg bg-gray-200 dark:bg-neutral-800 animate-pulse"></div>
                <div className="h-80 rounded-lg bg-gray-200 dark:bg-neutral-800 animate-pulse"></div>
                <div className="h-80 rounded-lg bg-gray-200 dark:bg-neutral-800 animate-pulse"></div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </PageWrapper>
  );
}
