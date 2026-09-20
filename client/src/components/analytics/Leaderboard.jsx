import React from 'react';
import { Trophy, Medal, Flame } from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';

export const Leaderboard = ({ items = [], isVertical = false }) => {
  if (!items || items.length === 0) {
    return <div className="text-center py-6 text-xs text-slate-400">No leaderboard data available.</div>;
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 10).map((item, idx) => {
        const rank = idx + 1;
        let rankBadge = (
          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center">
            {rank}
          </span>
        );

        if (rank === 1) {
          rankBadge = (
            <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5" />
            </span>
          );
        } else if (rank === 2) {
          rankBadge = (
            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              <Medal className="w-3.5 h-3.5" />
            </span>
          );
        } else if (rank === 3) {
          rankBadge = (
            <span className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-500 flex items-center justify-center">
              <Medal className="w-3.5 h-3.5" />
            </span>
          );
        }

        const name = isVertical ? item.name : item.name;
        const sub = isVertical
          ? `${item.memberCount} members`
          : `${item.vertical?.name || 'Unassigned'} • ID: ${item.studentId}`;
        const percent = isVertical ? item.averageAttendance : item.percentage;

        return (
          <div
            key={item._id || item.verticalId || idx}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition"
          >
            <div className="flex items-center space-x-3">
              {rankBadge}
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{sub}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isVertical && item.currentStreak > 0 && (
                <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>{item.currentStreak} streak</span>
                </div>
              )}
              <div className="text-right">
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
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
