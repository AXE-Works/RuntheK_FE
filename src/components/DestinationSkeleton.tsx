import logo from '@/assets/ade16fc310679880d8b27a51a4119372559298ac.png';

/**
 * Loading skeleton for destination pages
 * Shows a placeholder UI while destination data is being fetched
 */
export function DestinationSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={logo}
                alt="RuntheK"
                className="h-6 w-auto object-contain"
              />
              <span className="ml-2 text-2xl font-semibold text-gray-900">Travel</span>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse" />
          </div>
        </div>
      </header>

      {/* Hero skeleton */}
      <div className="h-[50vh] min-h-[400px] bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-center px-4">
          <div className="h-12 w-80 bg-gray-300 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-8 w-32 bg-gray-300 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-6 w-96 bg-gray-300 rounded mx-auto animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About section skeleton */}
        <div className="mb-12">
          <div className="h-10 w-64 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Highlights section skeleton */}
        <div className="mb-12">
          <div className="h-10 w-72 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features section skeleton */}
        <div className="mb-12">
          <div className="h-10 w-96 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 animate-pulse" />
                <div className="h-6 w-40 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
                <div className="h-4 w-56 bg-gray-200 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA section skeleton */}
        <div className="bg-gray-200 rounded-2xl p-12 animate-pulse">
          <div className="text-center">
            <div className="h-10 w-64 bg-gray-300 rounded mx-auto mb-4" />
            <div className="h-4 w-96 bg-gray-300 rounded mx-auto mb-2" />
            <div className="h-4 w-80 bg-gray-300 rounded mx-auto mb-8" />
            <div className="h-14 w-48 bg-gray-300 rounded-lg mx-auto" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={logo}
                alt="RuntheK"
                className="h-5 w-auto object-contain"
              />
              <span className="ml-2 text-lg font-semibold text-gray-900">Travel</span>
            </div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  );
}
