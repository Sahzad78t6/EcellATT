import React from 'react';

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (normalized === 'PRESENT' || normalized === 'GOOD' || normalized === 'SENT') {
    styles = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  } else if (normalized === 'ABSENT' || normalized === 'AT RISK' || normalized === 'AT_RISK' || normalized === 'FAILED') {
    styles = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
  } else if (normalized === 'OPEN') {
    styles = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold animate-pulse';
  } else if (normalized === 'SCHEDULED') {
    styles = 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
  } else if (normalized === 'CLOSED') {
    styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  } else if (normalized === 'CANCELLED') {
    styles = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  } else if (normalized === 'SKIPPED') {
    styles = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      {status}
    </span>
  );
};
