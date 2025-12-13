export default function FilterSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search skeleton */}
        <div className="relative">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        
        {/* Category filter skeleton */}
        <div className="relative">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        
        {/* Status filter skeleton */}
        <div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
      
      {/* Results count skeleton */}
      <div className="mt-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    </div>
  );
}

