import React from 'react';
import { SkeletonLoader } from './SkeletonLoader';

export const ChartCard = ({
  title,
  subtitle,
  children,
  action = null,
  loading = false,
  className = ''
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="flex-1 min-h-[260px] w-full">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <SkeletonLoader className="h-56 w-full" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
