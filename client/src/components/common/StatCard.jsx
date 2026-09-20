import React from 'react';
import { TiltCard } from './TiltCard';
import { useCountUp } from '../../hooks/useCountUp';
import clsx from 'clsx';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue', // 'blue', 'cyan', 'emerald', 'rose', 'amber'
  className = ''
}) => {
  // Extract number if value is string like "85.5%" or "183"
  const isPercent = typeof value === 'string' && value.endsWith('%');
  const numericVal = typeof value === 'number'
    ? value
    : typeof value === 'string' && !isNaN(parseFloat(value))
      ? parseFloat(value)
      : null;

  const animatedNumber = useCountUp(numericVal !== null ? numericVal : value, {
    decimals: isPercent && numericVal % 1 !== 0 ? 1 : 0
  });

  const displayValue = numericVal !== null
    ? `${animatedNumber}${isPercent ? '%' : ''}`
    : value;

  const orbVariants = {
    blue: 'from-brand-bright/25 to-surface-1 text-brand-glow border-brand-bright/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    cyan: 'from-brand-cyan/25 to-surface-1 text-brand-cyan border-brand-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]',
    emerald: 'from-emerald-500/25 to-surface-1 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    rose: 'from-rose-500/25 to-surface-1 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    amber: 'from-amber-500/25 to-surface-1 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
  };

  const activeOrb = orbVariants[color] || orbVariants.blue;

  return (
    <TiltCard
      className={clsx('p-5 sm:p-6 transition-all duration-300', className)}
      max={4}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-text-secondary truncate tracking-wide">
            {title}
          </p>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-2xl sm:text-3xl font-black font-heading tracking-tight bg-gradient-to-r from-white via-text-primary to-brand-ice bg-clip-text text-transparent tabular-nums">
              {displayValue}
            </h3>
            {trend && (
              <span
                className={clsx(
                  'text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-sm',
                  trend.type === 'down'
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                )}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-text-muted mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={clsx(
              'w-11 h-11 rounded-2xl bg-gradient-to-br border flex items-center justify-center shrink-0 shadow-depth-1',
              activeOrb
            )}
            aria-hidden="true"
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </TiltCard>
  );
};
