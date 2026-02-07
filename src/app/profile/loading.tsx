import { PageWrapper } from "@/components/PageThemeContext";

export default function ProfileLoading() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto animate-pulse">
        <header className="mb-8">
          <div className="h-10 w-1/3 mb-3 rounded-lg bg-gray-200 dark:bg-neutral-700"></div>
          <div className="h-5 w-1/2 rounded-lg bg-gray-200 dark:bg-neutral-700"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-neutral-800/50 rounded-lg shadow-md p-6 text-center border border-neutral-200 dark:border-neutral-800">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-neutral-700"></div>
              <div className="h-6 w-3/4 mx-auto mb-2 rounded-lg bg-gray-200 dark:bg-neutral-700"></div>
              <div className="h-4 w-full mx-auto mb-4 rounded-lg bg-gray-200 dark:bg-neutral-700"></div>
              <div className="flex justify-center gap-2">
                <div className="h-10 w-24 rounded-md bg-gray-200 dark:bg-neutral-700"></div>
                <div className="h-10 w-24 rounded-md bg-gray-200 dark:bg-neutral-700"></div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <section className="mb-8">
              <div className="h-7 w-1/2 mb-4 rounded-lg bg-gray-200 dark:bg-neutral-700"></div>
              <div className="space-y-4">
                <div className="h-20 rounded-lg bg-gray-200 dark:bg-neutral-700"></div>
                <div className="h-20 rounded-lg bg-gray-200 dark:bg-neutral-700"></div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
