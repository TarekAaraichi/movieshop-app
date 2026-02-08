const CartLoading = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-0 flex flex-col md:flex-row gap-8 items-start animate-pulse">
      {/* Main Content Skeleton */}
      <main className="flex-1 bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            <div className="h-5 w-80 bg-neutral-200 dark:bg-neutral-700 rounded-md mt-2" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-slate-700 pb-3">
            <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-slate-700 overflow-hidden">
            {/* Cart Item Skeleton */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border-b border-neutral-200 dark:border-slate-700 last:border-b-0"
              >
                <div className="w-16 h-24 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                  <div className="h-4 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                </div>
                <div className="w-24 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Aside Skeleton */}
      <aside className="w-full md:w-96 sticky top-6 self-start">
        <div className="bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-0 flex flex-col gap-4 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            <div className="h-6 w-1/2 ml-auto bg-neutral-200 dark:bg-neutral-700 rounded-md mt-2" />
          </div>
          <div className="pt-3 border-t border-neutral-200 dark:border-slate-700 px-6 pb-4">
            <div className="h-10 w-full bg-neutral-300 dark:bg-neutral-700 rounded-md" />
            <div className="h-10 w-full bg-neutral-300 dark:bg-neutral-700 rounded-md mt-3" />
            <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded-md mt-4" />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CartLoading;
