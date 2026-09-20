import React from 'react';
import clsx from 'clsx';

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase().trim();

  let styles = 'bg-surface-2 text-text-secondary border-border-subtle';
  let dotColor = 'bg-slate-400';

  if (normalized === 'PRESENT' || normalized === 'GOOD' || normalized === 'SENT' || normalized === 'ACTIVE') {
    styles = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
    dotColor = 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]';
  } else if (normalized === 'ABSENT' || normalized === 'FAILED' || normalized === 'INACTIVE') {
    styles = 'bg-rose-950/60 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
    dotColor = 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]';
  } else if (normalized === 'AT RISK' || normalized === 'AT_RISK' || normalized === 'SKIPPED' || normalized === 'CANCELLED') {
    styles = 'bg-amber-950/60 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
    dotColor = 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]';
  } else if (normalized === 'OPEN' || normalized === 'LIVE') {
    styles = 'bg-brand-deep/60 text-brand-ice border-brand-bright/40 shadow-[0_0_14px_rgba(59,130,246,0.3)] animate-pulse';
    dotColor = 'bg-brand-cyan shadow-[0_0_8px_rgba(34,211,238,0.9)]';
  } else if (normalized === 'SCHEDULED') {
    styles = 'bg-surface-2 text-brand-ice border-border-bright';
    dotColor = 'bg-brand-bright';
  } else if (normalized === 'CLOSED') {
    styles = 'bg-surface-1 text-text-muted border-border-subtle';
    dotColor = 'bg-slate-500';
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-[11px] font-bold border tracking-wide uppercase shadow-sm select-none',
        styles,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
