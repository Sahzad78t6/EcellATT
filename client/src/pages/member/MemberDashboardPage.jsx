import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analyticsApi';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard } from '../../components/common/ChartCard';
import { EventCard } from '../../components/common/EventCard';
import { CheckCircle2, XCircle, Calendar, Percent } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatPercentage } from '../../utils/formatters';

export const MemberDashboardPage = () => {
  const [session, setSession] = useState('2024-2025');

  const { data: memberRes, isLoading } = useQuery({
    queryKey: ['member-summary', session],
    queryFn: () => analyticsApi.getMemberSummary({ session })
  });

  const summary = memberRes?.data || {};
  const {
    eligibleCount = 0,
    attendedCount = 0,
    absentCount = 0,
    percentage = null,
    monthlyStats = [],
    upcomingEvents = []
  } = summary;

  // Donut chart data
  const donutData = [
    { name: 'Attended (Present)', value: attendedCount, color: '#10b981' },
    { name: 'Missed (Absent)', value: absentCount, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Personal Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            My Attendance Overview
          </h1>
        </div>

        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 px-2.5">Session:</span>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none text-slate-900 dark:text-slate-100"
          >
            <option value="2024-2025">2024-2025 (Current)</option>
            <option value="2023-2024">2023-2024</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Overall Attendance"
          value={isLoading ? '...' : formatPercentage(percentage)}
          subtitle={`Target: ${summary.threshold || 75}%`}
          icon={Percent}
          color={percentage !== null && percentage < (summary.threshold || 75) ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Eligible Sessions"
          value={isLoading ? '...' : eligibleCount}
          subtitle="Closed sessions since join"
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          title="Sessions Attended"
          value={isLoading ? '...' : attendedCount}
          subtitle="Marked Present"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Sessions Missed"
          value={isLoading ? '...' : absentCount}
          subtitle="Marked Absent"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radial / Donut Chart */}
        <ChartCard
          title="Attendance Breakdown"
          subtitle="Proportion of attended vs missed sessions"
          loading={isLoading}
        >
          {eligibleCount === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No closed eligible events recorded in this session.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-64">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatPercentage(percentage)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Rate
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Present: <strong>{attendedCount}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Absent: <strong>{absentCount}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </ChartCard>

        {/* Monthly Trend Grouped Bar Chart */}
        <ChartCard
          title="Monthly Attendance History"
          subtitle="Present vs Absent distribution per month"
          loading={isLoading}
        >
          {monthlyStats.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No monthly activity yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Upcoming Scheduled Sessions For Your Vertical
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center col-span-full">
              No upcoming events scheduled at this time.
            </p>
          ) : (
            upcomingEvents.map((ev) => <EventCard key={ev._id} event={ev} />)
          )}
        </div>
      </div>
    </div>
  );
};
