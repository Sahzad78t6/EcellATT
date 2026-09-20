import React from 'react';
import { Flame, Award } from 'lucide-react';

export const StreaksList = ({ members = [] }) => {
  const topStreaks = [...members]
    .filter((m) => m.currentStreak > 0 || m.bestStreak > 0)
    .sort((a, b) => b.currentStreak - a.currentStreak || b.bestStreak - a.bestStreak)
    .slice(0, 8);

  if (topStreaks.length === 0) {
    return <div className="text-center py-6 text-xs text-slate-400">No active streaks recorded yet.</div>;
  }

  return (
    <div className="space-y-2.5">
      {topStreaks.map((m) => (
        <div
          key={m.memberId || m._id}
          className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
        >
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {m.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {m.vertical?.name || 'Member'} • {m.studentId}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-xs font-extrabold shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{m.currentStreak} current</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Best: {m.bestStreak}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
