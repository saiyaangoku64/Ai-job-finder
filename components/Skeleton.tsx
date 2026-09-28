import React from 'react';

export const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-neutral-900 rounded-lg ${className}`} />
);

export const JobCardSkeleton = () => (
  <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-2xl h-full flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 w-3/4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="space-y-2 flex-grow">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
    <div className="grid grid-cols-2 gap-3 mt-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

export const FeatureSkeleton = () => (
  <div className="space-y-4">
     <Skeleton className="h-8 w-1/2 mb-8" />
     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-4">
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-64 w-full rounded-xl" />
             <Skeleton className="h-12 w-full" />
         </div>
         <Skeleton className="h-full min-h-[400px] w-full rounded-xl" />
     </div>
  </div>
);