import { Card } from "@/components/ui/card";

export default function CheckoutLoading() {
  return (
    <div className="w-full m-auto max-w-3xl animate-pulse">
      <Card className="p-8 bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="h-9 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            <div className="h-6 w-80 bg-neutral-200 dark:bg-neutral-700 rounded-md mt-3" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-32 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
              <div className="w-full h-6 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            </div>
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-32 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
              <div className="w-full h-6 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-4">
              <div className="w-32 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                <div className="h-5 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
              <div className="flex items-center gap-4 sm:col-span-2 min-w-0">
                <div className="w-32 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                <div className="w-full h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
              </div>

              <div className="flex items-center gap-4 min-w-0">
                <div className="w-32 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                <div className="w-full h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
              </div>

              <div className="flex items-center gap-4 min-w-0">
                <div className="w-32 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                <div className="w-full h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
              </div>

              <div className="flex items-center gap-4 min-w-0">
                <div className="w-32 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                <div className="w-full h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center pt-4">
            <div className="flex items-center gap-4 sm:col-span-2 min-w-0">
              <div className="w-32 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
              <div className="w-full h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
            </div>

            <div className="sm:col-span-1 flex items-center justify-end">
              <div className="w-full sm:w-44 h-11 bg-neutral-300 dark:bg-neutral-700 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="mt-6 h-5 w-96 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
      </Card>
    </div>
  );
}
