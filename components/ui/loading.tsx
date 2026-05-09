export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/30 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function LoadingTable() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded flex-1"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded flex-1"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded flex-1"></div>
        </div>
      ))}
    </div>
  );
}
