export default function OrdersLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 w-1/4 mb-8 rounded-lg bg-neutral-700 animate-pulse"></div>
      <div className="space-y-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-gray-900 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="h-8 w-32 rounded-lg bg-neutral-700 animate-pulse"></div>
                <div className="h-5 w-24 mt-2 rounded-lg bg-neutral-700 animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="h-7 w-28 rounded-lg bg-neutral-700 animate-pulse"></div>
                <div className="h-5 w-20 mt-2 rounded-lg bg-neutral-700 animate-pulse"></div>
              </div>
            </div>
            <div>
              {[...Array(2)].map((_, j) => (
                <div
                  key={j}
                  className="flex items-center py-2 border-b last:border-b-0 border-gray-700"
                >
                  <div className="w-16 h-24 rounded-md bg-neutral-800 animate-pulse mr-4"></div>
                  <div className="space-y-2">
                    <div className="h-6 w-48 rounded-lg bg-neutral-700 animate-pulse"></div>
                    <div className="h-5 w-20 rounded-lg bg-neutral-700 animate-pulse"></div>
                  </div>
                  <div className="ml-auto h-6 w-16 rounded-lg bg-neutral-700 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
