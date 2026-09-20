import React from 'react';

export const SkeletonLoader = ({ className = '', count = 1 }) => {
  if (count === 1) {
    return (
      <div
        className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`}
      />
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`}
        />
      ))}
    </div>
  );
};
