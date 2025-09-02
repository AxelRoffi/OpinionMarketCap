import React from 'react';

export default function PoolPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button Skeleton */}
        <div className="h-10 w-32 bg-slate-700 rounded animate-pulse mb-6"></div>

        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="h-8 w-64 bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="h-5 w-48 bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="h-6 w-16 bg-slate-700 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Main Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Section Skeleton */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-5 w-24 bg-slate-700 rounded animate-pulse"></div>
              </div>
              
              <div className="w-full bg-slate-700 rounded-full h-3 mb-4 animate-pulse"></div>
              
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Contributors Section Skeleton */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
              <div className="flex items-center mb-4">
                <div className="h-6 w-32 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-5 w-8 bg-slate-700 rounded-full animate-pulse ml-2"></div>
              </div>
              
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse mr-3"></div>
                      <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-16 bg-slate-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Join Pool Card Skeleton */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-slate-700 rounded animate-pulse mx-auto mb-4"></div>
                <div className="h-6 w-32 bg-slate-700 rounded animate-pulse mx-auto mb-2"></div>
                <div className="h-4 w-40 bg-slate-700 rounded animate-pulse mx-auto"></div>
              </div>

              <div className="h-12 w-full bg-slate-700 rounded animate-pulse mb-3"></div>
              <div className="h-3 w-24 bg-slate-700 rounded animate-pulse mx-auto"></div>
            </div>

            {/* Quick Stats Card Skeleton */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
              <div className="h-6 w-24 bg-slate-700 rounded animate-pulse mb-4"></div>
              
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-slate-700 rounded animate-pulse mr-2"></div>
                      <div className="h-4 w-20 bg-slate-700 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-16 bg-slate-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}