import { Skeleton } from '@/components/ui/skeleton';

export function OpinionDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Hero Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-4">
            {/* Price Bar Skeleton */}
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-7 w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Skeleton */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-28" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
              <Skeleton className="h-64 lg:h-72 w-full rounded" />
            </div>

            {/* Answer History Skeleton */}
            <div className="bg-card rounded-lg border border-border p-4">
              <Skeleton className="h-4 w-32 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            </div>

            {/* Activity Skeleton */}
            <div className="bg-card rounded-lg border border-border p-6">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton (Desktop) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <Skeleton className="h-10 w-28 mx-auto" />
                <Skeleton className="h-3 w-32 mx-auto mt-2" />
              </div>
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-20 w-full rounded" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OpinionCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-full mb-3" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function OpinionListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <OpinionCardSkeleton key={i} />
      ))}
    </div>
  );
}
