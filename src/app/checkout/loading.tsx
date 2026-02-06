import { PageWrapper } from "@/components/PageThemeContext";

export default function CheckoutLoading() {
  return (
    <PageWrapper>
      <div>
        <div className="w-full m-auto max-w-3xl">
          <div className="p-8 bg-neutral-900/80 border border-indigo-300 rounded-2xl shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <div className="h-10 w-48 rounded-lg bg-neutral-700 animate-pulse"></div>
                <div className="h-6 w-64 mt-3 rounded-lg bg-neutral-700 animate-pulse"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="h-12 rounded-lg bg-neutral-800 animate-pulse"></div>
                <div className="h-12 rounded-lg bg-neutral-800 animate-pulse"></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="h-24 rounded-lg bg-neutral-800 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="h-12 rounded-lg bg-neutral-800 animate-pulse sm:col-span-2"></div>
                  <div className="h-12 rounded-lg bg-neutral-800 animate-pulse"></div>
                  <div className="h-12 rounded-lg bg-neutral-800 animate-pulse"></div>
                  <div className="h-12 rounded-lg bg-neutral-800 animate-pulse"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
                <div className="h-12 rounded-lg bg-neutral-800 animate-pulse sm:col-span-2"></div>
                <div className="h-12 rounded-lg bg-neutral-800 animate-pulse"></div>
              </div>
            </div>

            <div className="mt-6 h-5 w-3/4 rounded-lg bg-neutral-700 animate-pulse"></div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
