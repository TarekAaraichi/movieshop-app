import { PageWrapper } from "@/components/PageThemeContext";

const OrderDetailLoading = () => {
  return (
    <PageWrapper>
      <div className="animate-pulse">
        <div className="mb-8 flex gap-4 items-center">
          <div className="h-5 w-36 bg-popover rounded"></div>
          <div className="h-5 w-24 bg-popover rounded"></div>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-md p-6 mb-8">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <div className="h-8 w-48 bg-popover rounded mb-2"></div>
              <div className="h-4 w-32 bg-popover rounded"></div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="h-7 w-20 bg-popover rounded-full inline-block"></div>
              <div className="h-7 w-24 bg-popover rounded mt-2 ml-auto"></div>
            </div>
          </div>

          {/* Address Skeleton */}
          <div className="mb-6">
            <div className="h-6 w-32 bg-popover rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 w-1/2 bg-popover rounded"></div>
              <div className="h-4 w-2/3 bg-popover rounded"></div>
            </div>
          </div>

          {/* Items Skeleton */}
          <div>
            <div className="h-6 w-16 bg-popover rounded mb-4"></div>
            <ul className="divide-y divide-border">
              {[...Array(2)].map((_, i) => (
                <li key={i} className="flex items-center py-4 gap-4">
                  <div className="w-16 h-24 bg-popover rounded-md"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-popover rounded"></div>
                    <div className="h-4 w-1/4 bg-popover rounded"></div>
                    <div className="h-8 w-48 bg-popover rounded-lg"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-5 w-16 ml-auto bg-popover rounded"></div>
                    <div className="h-4 w-20 ml-auto bg-popover rounded"></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default OrderDetailLoading;
