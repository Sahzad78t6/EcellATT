import React from 'react';
import { formatDate } from '../../utils/formatters';
import clsx from 'clsx';

export const Heatmap = ({ events = [], matrix = [], loading = false }) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-text-muted">
        Loading Heatmap Matrix...
      </div>
    );
  }

  if (!events || events.length === 0 || !matrix || matrix.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-text-muted text-center p-6">
        No past closed events found for this vertical and session.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2 border border-border-subtle rounded-xl bg-surface-1/60">
        <div className="inline-block min-w-full align-middle">
          <table className="border-collapse text-left text-xs w-full">
            <thead>
              <tr className="bg-surface-2/80 border-b border-border-subtle">
                <th className="sticky left-0 z-20 bg-surface-2/95 backdrop-blur-md px-4 py-3 font-bold font-heading text-text-secondary border-r border-border-subtle min-w-[180px]">
                  Member Name
                </th>
                {events.map((ev) => (
                  <th
                    key={ev._id}
                    className="px-2.5 py-2.5 font-semibold text-text-muted border-b border-border-subtle text-center min-w-[76px]"
                    title={`${ev.name} (${formatDate(ev.date)})`}
                  >
                    <div className="truncate max-w-[76px] text-[11px] font-bold text-text-primary">
                      {ev.name}
                    </div>
                    <div className="text-[10px] text-text-muted font-normal font-mono">
                      {formatDate(ev.date, { day: '2-digit', month: '2-digit' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40">
              {matrix.map((row) => (
                <tr key={row.member._id} className="hover:bg-surface-2/40 transition">
                  <td className="sticky left-0 z-10 bg-surface-1/95 backdrop-blur-md px-4 py-2.5 font-medium text-text-primary whitespace-nowrap border-r border-border-subtle">
                    <span className="font-bold text-xs">{row.member.name}</span>
                    <span className="text-[10px] text-brand-glow/80 ml-1.5 font-mono">
                      ({row.member.memberId})
                    </span>
                  </td>
                  {row.records.map((rec, rIdx) => {
                    let cellClasses = 'bg-surface-2 text-text-muted border border-border-subtle/50';
                    let label = '-';

                    if (rec.status === 'PRESENT') {
                      cellClasses = 'bg-gradient-to-br from-brand-bright to-brand-deep text-brand-ice font-bold border border-brand-glow/50 shadow-[0_0_10px_rgba(59,130,246,0.35)]';
                      label = 'P';
                    } else if (rec.status === 'ABSENT') {
                      cellClasses = 'bg-gradient-to-br from-rose-600 to-rose-950 text-white font-bold border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]';
                      label = 'A';
                    } else if (rec.status === 'NOT_JOINED') {
                      cellClasses = 'bg-surface-2/40 text-text-muted/60 border border-transparent';
                      label = 'N/A';
                    }

                    return (
                      <td key={rIdx} className="p-1.5 text-center">
                        <div
                          className={clsx(
                            'w-7 h-7 sm:w-8 sm:h-8 mx-auto rounded-lg flex items-center justify-center text-[10px] sm:text-[11px] transition-transform hover:scale-110 cursor-default select-none shadow-depth-1',
                            cellClasses
                          )}
                          title={`${row.member.name} • ${rec.eventName || 'Event'}: ${rec.status || 'No Record'}`}
                        >
                          {label}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-end gap-4 text-xs text-text-secondary pt-1 pr-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-gradient-to-br from-brand-bright to-brand-deep border border-brand-glow/50 shadow-sm" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-gradient-to-br from-rose-600 to-rose-950 border border-rose-500/40 shadow-sm" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-surface-2 border border-border-subtle" />
          <span>Not Joined</span>
        </div>
      </div>
    </div>
  );
};
