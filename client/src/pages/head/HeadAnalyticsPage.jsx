import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analyticsApi';
import { ChartCard } from '../../components/common/ChartCard';
import { Sparkles, BarChart3 } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
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

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="surface-card p-3 rounded-xl shadow-2xl border border-brand-glow/30 backdrop-blur-xl text-xs">
        <p className="font-semibold text-text-primary mb-1">{payload[0]?.payload?.name || label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-glow shadow-glow-sm" />
          <span className="text-text-secondary">Attendance:</span>
          <span className="font-mono font-bold text-brand-glow">
            {payload[0]?.value}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const HeadAnalyticsPage = () => {
  useDocumentTitle('Vertical Attendance Analytics');
  const [session, setSession] = useState('2026-2027');

  const { data: summaryRes, isLoading } = useQuery({
    queryKey: ['vertical-summary', session],
    queryFn: () => analyticsApi.getVerticalSummary({ session })
  });

  const summary = summaryRes?.data || {};
  const eventWiseStats = summary.eventWiseStats || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vertical Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
            Vertical Attendance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Session-by-session attendance analytics for {summary.vertical?.name || 'your vertical'}.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-surface-1 border border-brand-border rounded-xl p-1.5 shadow-depth-sm">
          <span className="text-xs font-bold text-text-muted px-2.5">Session:</span>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="input-3d text-xs font-bold rounded-lg px-3 py-1.5 text-text-primary cursor-pointer"
          >
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>
      </div>

      {/* Event Attendance % Chart */}
      <ChartCard
        title="Event-Wise Attendance Percentage"
        subtitle="Attendance % across past closed sessions"
        loading={isLoading}
        icon={BarChart3}
      >
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eventWiseStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="headBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(96, 165, 250, 0.08)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={(val) => (val?.length > 12 ? `${val.substring(0, 10)}...` : val)}
                stroke="rgba(96, 165, 250, 0.2)"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                stroke="rgba(96, 165, 250, 0.2)"
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Bar
                dataKey="percentage"
                name="Attendance"
                fill="url(#headBarGradient)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Past Events Breakdown */}
      <div className="surface-card rounded-2xl p-4 sm:p-6 border border-brand-border shadow-depth-md space-y-4">
        <h3 className="text-base font-heading font-bold text-text-primary">
          Past Events Attendance Summary
        </h3>

        {/* Mobile View: Stacked Cards */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {eventWiseStats.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-xs bg-surface-1/50 rounded-xl border border-white/[0.04]">
              No past closed events found for this session.
            </div>
          ) : (
            eventWiseStats.map((e) => (
              <div key={e.eventId} className="p-3.5 rounded-xl bg-surface-2/60 border border-brand-border/40 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-text-primary">{e.name}</h4>
                  <span className="text-xs font-mono font-bold text-brand-glow">{e.percentage}%</span>
                </div>
                <p className="text-xs text-text-muted">{formatDate(e.date)}</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
                  <span className="text-status-present font-bold">Present: {e.present}</span>
                  <span className="text-status-absent font-bold">Absent: {e.absent}</span>
                  <span className="text-text-secondary font-medium">Total: {e.total}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-1/80 uppercase font-semibold text-text-muted border-b border-brand-border/30">
              <tr>
                <th className="px-4 py-3">Event Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Present</th>
                <th className="px-4 py-3 text-center">Absent</th>
                <th className="px-4 py-3 text-center">Total Marked</th>
                <th className="px-4 py-3 text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {eventWiseStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No past closed events found for this session.
                  </td>
                </tr>
              ) : (
                eventWiseStats.map((e) => (
                  <tr key={e.eventId} className="hover:bg-brand-primary/[0.06] transition-colors">
                    <td className="px-4 py-3 font-bold text-text-primary">{e.name}</td>
                    <td className="px-4 py-3 text-text-muted">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-status-present">
                      {e.present}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-status-absent">
                      {e.absent}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-semibold text-text-secondary">
                      {e.total}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-extrabold text-brand-glow">
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
