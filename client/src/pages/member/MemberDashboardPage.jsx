import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analyticsApi';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard } from '../../components/common/ChartCard';
import { EventCard } from '../../components/common/EventCard';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { CheckCircle2, XCircle, Calendar, Percent, LogOut, Sparkles, PieChart as PieIcon, BarChart3 } from 'lucide-react';
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

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="surface-card p-3 rounded-xl shadow-2xl border border-brand-glow/30 backdrop-blur-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0]?.payload?.color }} />
          <span className="text-text-secondary">{payload[0]?.name}:</span>
          <span className="font-mono font-bold text-text-primary">
            {payload[0]?.value} sessions
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const MemberDashboardPage = () => {
  useDocumentTitle('My Attendance Dashboard');
  const { logout } = useAuth();
  const [session, setSession] = useState('2026-2027');

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
    { name: 'Missed (Absent)', value: absentCount, color: '#ef4444' }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personal Attendance Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
            My Attendance Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={logout}
            className="btn-3d-danger inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
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
          color="blue"
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
          icon={PieIcon}
        >
          {eligibleCount === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-text-muted">
              No closed eligible events recorded in this session.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-64">
              <div className="relative w-48 h-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-mono font-black text-text-primary tracking-tight">
                    {formatPercentage(percentage)}
                  </span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    Rate
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-1/80 border border-brand-border/40">
                  <span className="w-3 h-3 rounded-full bg-status-present shadow-glow-sm" />
                  <span className="text-text-secondary">
                    Present: <strong className="text-status-present font-mono">{attendedCount}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-1/80 border border-brand-border/40">
                  <span className="w-3 h-3 rounded-full bg-status-absent shadow-glow-sm" />
                  <span className="text-text-secondary">
                    Absent: <strong className="text-status-absent font-mono">{absentCount}</strong>
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
          icon={BarChart3}
        >
          {monthlyStats.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-text-muted">
              No monthly activity yet.
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(96, 165, 250, 0.08)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    stroke="rgba(96, 165, 250, 0.2)"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    stroke="rgba(96, 165, 250, 0.2)"
                  />
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Upcoming Events Section */}
      <div className="surface-card rounded-2xl p-5 sm:p-6 border border-brand-border shadow-depth-md space-y-4">
        <h3 className="text-base font-heading font-bold text-text-primary">
          Upcoming Scheduled Sessions For Your Vertical
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-text-muted py-8 text-center col-span-full bg-surface-1/50 rounded-xl border border-white/[0.04]">
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
