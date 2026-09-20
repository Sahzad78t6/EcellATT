import React from 'react';
import { Trophy, Medal, Flame } from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';
import clsx from 'clsx';

export const Leaderboard = ({ items = [], isVertical = false }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-text-muted">
        No leaderboard data available for this session.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 10).map((item, idx) => {
        const rank = idx + 1;
        let rankBadge = (
          <span className="w-6 h-6 rounded-full bg-surface-2 text-text-muted font-mono font-bold text-xs flex items-center justify-center border border-border-subtle shrink-0">
            {rank}
          </span>
        );

        if (rank === 1) {
          rankBadge = (
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.5)] shrink-0">
              <Trophy className="w-3.5 h-3.5" />
            </span>
          );
        } else if (rank === 2) {
          rankBadge = (
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm shrink-0">
              <Medal className="w-3.5 h-3.5" />
            </span>
          );
        } else if (rank === 3) {
          rankBadge = (
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 font-black text-xs flex items-center justify-center shadow-sm shrink-0">
              <Medal className="w-3.5 h-3.5" />
            </span>
          );
        }

        const name = isVertical ? item.name : item.name;
        const sub = isVertical
          ? `${item.memberCount} members`
          : `${item.vertical?.name || 'Member'} • ${item.studentId || ''}`;
        const percent = isVertical ? item.averageAttendance : item.percentage;

        return (
          <div
            key={item._id || item.verticalId || idx}
            className="flex items-center justify-between p-3 rounded-xl bg-surface-2/50 hover:bg-surface-2/90 border border-border-subtle transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {rankBadge}
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold font-heading text-text-primary truncate">
                  {name}
                </p>
                <p className="text-[11px] text-text-muted truncate">{sub}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {!isVertical && item.currentStreak > 0 && (
                <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                  <span>{item.currentStreak}</span>
                </div>
              )}
              <div className="text-right">
                <span className="text-xs sm:text-sm font-extrabold font-heading text-brand-cyan tabular-nums">
                  {formatPercentage(percent)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
