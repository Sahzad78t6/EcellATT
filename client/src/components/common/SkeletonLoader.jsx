import React from 'react';
import clsx from 'clsx';

export const SkeletonLoader = ({ className = 'h-6 w-full', count = 1 }) => {
  const shimmerClasses =
    'relative overflow-hidden bg-surface-2/80 rounded-xl border border-border-subtle/50 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-brand-bright/10 before:to-transparent';

  if (count === 1) {
    return <div className={clsx(shimmerClasses, className)} aria-hidden="true" />;
  }

  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={clsx(shimmerClasses, className)} />
      ))}
    </div>
  );
};
