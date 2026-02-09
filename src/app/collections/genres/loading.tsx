import { PageWrapper } from "@/components/PageThemeContext";

export default function GenresLoading() {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 rounded-2xl">
        <header className="mb-8 text-center relative">
          <div className="h-12 w-1/2 mx-auto rounded-lg bg-popover animate-pulse" aria-hidden />
        </header>
        <div className="space-y-12">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-8 w-1/4 mb-4 rounded-lg bg-popover animate-pulse" aria-hidden />
              <div className="flex space-x-6 overflow-hidden">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="h-80 w-52 shrink-0 rounded-lg bg-card animate-pulse"
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
