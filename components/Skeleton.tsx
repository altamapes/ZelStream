import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-brand-card rounded-md overflow-hidden animate-pulse">
    <div className="aspect-poster bg-gray-800"></div>
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-800 rounded w-1/4"></div>
        <div className="h-3 bg-gray-800 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
    <div className="h-[50vh] bg-gray-800 rounded-xl mb-8"></div>
    <div className="space-y-4">
      <div className="h-8 bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-800 rounded w-full"></div>
      <div className="h-4 bg-gray-800 rounded w-full"></div>
      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
    </div>
  </div>
);
