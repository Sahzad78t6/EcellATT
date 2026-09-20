import React from 'react';
import { formatDate } from '../../utils/formatters';

export const Heatmap = ({ events = [], matrix = [], loading = false }) => {
  if (loading) {
    return <div className="h-64 flex items-center justify-center text-sm text-slate-400">Loading Heatmap Matrix...</div>;
  }

  if (!events || events.length === 0 || !matrix || matrix.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-slate-500">
        No past closed events found for this vertical and session.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block min-w-full align-middle">
        <table className="border-collapse text-left text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-white dark:bg-slate-900 px-4 py-2 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 min-w-[160px]">
                Member Name
              </th>
              {events.map((ev) => (
                <th
                  key={ev._id}
                  className="px-2 py-2 font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-center min-w-[70px]"
                  title={`${ev.name} (${formatDate(ev.date)})`}
                >
                  <div className="truncate max-w-[70px] text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {ev.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {formatDate(ev.date, { day: '2-digit', month: '2-digit' })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {matrix.map((row) => (
              <tr key={row.member._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 px-4 py-2.5 font-medium text-slate-900 dark:text-slate-200 whitespace-nowrap border-r border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-xs">{row.member.name}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                    ({row.member.memberId})
                  </span>
                </td>
                {row.records.map((rec, rIdx) => {
                  let cellBg = 'bg-slate-100 dark:bg-slate-800 text-slate-400';
                  let label = '-';

                  if (rec.status === 'PRESENT') {
                    cellBg = 'bg-emerald-500 text-white font-bold';
                    label = 'P';
                  } else if (rec.status === 'ABSENT') {
                    cellBg = 'bg-rose-500 text-white font-bold';
                    label = 'A';
                  } else if (rec.status === 'NOT_JOINED') {
                    cellBg = 'bg-slate-200 dark:bg-slate-800/40 text-slate-400';
                    label = 'N/A';
                  }

                  return (
                    <td key={rIdx} className="p-1.5 text-center">
                      <div
                        className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-[11px] transition-transform hover:scale-110 shadow-xs cursor-default ${cellBg}`}
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
  );
};
