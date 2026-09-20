import React from 'react';
import { SkeletonLoader } from './SkeletonLoader';
import clsx from 'clsx';

export const ChartCard = ({
  title,
  subtitle,
  children,
  action = null,
  loading = false,
  minHeight = '300px',
  className = ''
}) => {
  return (
    <div
      className={clsx(
        'surface-card p-5 sm:p-6 flex flex-col justify-between overflow-hidden',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="space-y-0.5">
          <h3 className="text-sm sm:text-base font-bold font-heading text-text-primary tracking-wide">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-text-muted">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div
        className="flex-1 w-full relative"
        style={{ minHeight }}
      >
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <SkeletonLoader className="h-full w-full rounded-xl" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
