import { PageWrapper } from "@/components/PageThemeContext";

const ProfileEditLoading = () => {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto animate-pulse">
        <header className="mb-8">
          <div className="h-10 w-1/3 bg-popover rounded-lg"></div>
          <div className="h-4 w-1/2 bg-popover rounded mt-3"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Skeleton */}
          <div className="md:col-span-1">
            <div className="bg-card border border-border rounded-lg shadow-md p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 bg-popover rounded-full"></div>
              <div className="h-6 w-3/4 mx-auto bg-popover rounded"></div>
              <div className="h-4 w-1/2 mx-auto bg-popover rounded mt-2"></div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <div className="h-5 w-24 bg-popover rounded mb-1"></div>
                <div className="h-10 bg-popover rounded-lg"></div>
              </div>
              <div className="flex flex-col">
                <div className="h-5 w-24 bg-popover rounded mb-1"></div>
                <div className="h-10 bg-popover rounded-lg"></div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="h-5 w-16 bg-popover rounded mb-1"></div>
              <div className="h-24 bg-popover rounded-lg"></div>
            </div>

            <fieldset className="rounded-md border border-border p-4">
              <legend className="px-2 h-5 w-28 bg-popover rounded"></legend>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-10 bg-popover rounded-lg"></div>
                <div className="h-10 bg-popover rounded-lg"></div>
                <div className="h-10 bg-popover rounded-lg"></div>
                <div className="h-10 bg-popover rounded-lg"></div>
                <div className="h-10 bg-popover rounded-lg col-span-1 sm:col-span-2"></div>
              </div>
            </fieldset>

            <div className="flex items-center justify-between">
              <div className="h-5 w-48 bg-popover rounded"></div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-24 bg-popover rounded-md"></div>
                <div className="h-10 w-20 bg-popover rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProfileEditLoading;
