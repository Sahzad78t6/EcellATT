import React from 'react';
import { Flame, Award } from 'lucide-react';

export const StreaksList = ({ members = [] }) => {
  const topStreaks = [...members]
    .filter((m) => m.currentStreak > 0 || m.bestStreak > 0)
    .sort((a, b) => b.currentStreak - a.currentStreak || b.bestStreak - a.bestStreak)
    .slice(0, 8);

  if (topStreaks.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-text-muted">
        No active streaks recorded for this session.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {topStreaks.map((m) => (
        <div
          key={m.memberId || m._id}
          className="flex items-center justify-between p-3 rounded-xl bg-surface-2/50 hover:bg-surface-2/90 border border-border-subtle transition-all duration-200"
        >
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs sm:text-sm font-bold font-heading text-text-primary truncate">
              {m.name}
            </p>
            <p className="text-[11px] text-text-muted truncate">
              {m.vertical?.name || 'Member'} • {m.studentId || ''}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
              <span className="tabular-nums">{m.currentStreak} active</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-text-muted font-mono font-medium">
              <Award className="w-3.5 h-3.5 text-brand-glow" />
              <span>Best: {m.bestStreak}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
