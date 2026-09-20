import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analyticsApi';
import { ChartCard } from '../../components/common/ChartCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { formatDate } from '../../utils/formatters';

export const HeadAnalyticsPage = () => {
  const [session, setSession] = useState('2026-2027');

  const { data: summaryRes, isLoading } = useQuery({
    queryKey: ['vertical-summary', session],
    queryFn: () => analyticsApi.getVerticalSummary({ session })
  });

  const summary = summaryRes?.data || {};
  const eventWiseStats = summary.eventWiseStats || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Vertical Attendance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Session-by-session attendance analytics for {summary.vertical?.name || 'your vertical'}.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 px-2.5">Session:</span>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none text-slate-900 dark:text-slate-100"
          >
            <option value="2026-2027">2026-2027 (Current)</option>
            <option value="2027-2028">2027-2028</option>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>
      </div>

      {/* Event Attendance % Chart */}
      <ChartCard
        title="Event-Wise Attendance Percentage"
        subtitle="Attendance % across past closed sessions"
        loading={isLoading}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={eventWiseStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              tickFormatter={(val) => (val.length > 12 ? `${val.substring(0, 10)}...` : val)}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(val) => [`${val}%`, 'Attendance']}
              contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
            />
            <Bar dataKey="percentage" fill="#4f46e5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Past Events Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Past Events Attendance Summary
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Event Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Present</th>
                <th className="px-4 py-3 text-center">Absent</th>
                <th className="px-4 py-3 text-center">Total Marked</th>
                <th className="px-4 py-3 text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {eventWiseStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No past closed events found for this session.
                  </td>
                </tr>
              ) : (
                eventWiseStats.map((e) => (
                  <tr key={e.eventId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{e.name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {e.present}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-rose-600 dark:text-rose-400">
                      {e.absent}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {e.total}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                      {e.percentage}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
