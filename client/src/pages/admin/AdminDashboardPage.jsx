import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analyticsApi';
import { verticalApi } from '../../api/verticalApi';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard } from '../../components/common/ChartCard';
import { Leaderboard } from '../../components/analytics/Leaderboard';
import { StreaksList } from '../../components/analytics/StreaksList';
import { Heatmap } from '../../components/analytics/Heatmap';
import { EventCard } from '../../components/common/EventCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  Calendar,
  Percent,
  AlertTriangle,
  Layers,
  Flame,
  Grid,
  LogOut
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatDate, formatPercentage } from '../../utils/formatters';

export const AdminDashboardPage = () => {
  const { logout } = useAuth();
  const [session, setSession] = useState('2026-2027');
  const [heatmapVerticalId, setHeatmapVerticalId] = useState('');

  // Fetch Verticals for dropdowns
  const { data: verticalsRes } = useQuery({
    queryKey: ['verticals'],
    queryFn: () => verticalApi.list()
  });
  const verticals = verticalsRes?.data || [];

  // Set default vertical for heatmap if empty
  const activeHeatmapVertical = heatmapVerticalId || (verticals[0]?._id || '');

  // 1. Overview KPIs
  const { data: overviewRes, isLoading: loadingOverview } = useQuery({
    queryKey: ['admin-overview', session],
    queryFn: () => analyticsApi.getAdminOverview({ session })
  });
  const overview = overviewRes?.data || {};

  // 2. Attendance Trends
  const { data: trendsRes, isLoading: loadingTrends } = useQuery({
    queryKey: ['admin-trends', session],
    queryFn: () => analyticsApi.getTrends({ session })
  });
  const trends = trendsRes?.data || [];

  // 3. Vertical Comparison
  const { data: vertCompRes, isLoading: loadingVertComp } = useQuery({
    queryKey: ['admin-vertical-comparison', session],
    queryFn: () => analyticsApi.getVerticalComparison({ session })
  });
  const verticalComparison = vertCompRes?.data || [];

  // 4. Vertical Leaderboard
  const { data: vLeaderRes, isLoading: loadingVLeader } = useQuery({
    queryKey: ['admin-vertical-leaderboard', session],
    queryFn: () => analyticsApi.getVerticalLeaderboard({ session })
  });
  const verticalLeaderboard = vLeaderRes?.data || [];

  // 5. Member Leaderboard & Streaks
  const { data: mLeaderRes, isLoading: loadingMLeader } = useQuery({
    queryKey: ['admin-member-leaderboard', session],
    queryFn: () => analyticsApi.getMemberLeaderboard({ session })
  });
  const memberLeaderboard = mLeaderRes?.data || [];

  // 6. Heatmap Data
  const { data: heatmapRes, isLoading: loadingHeatmap } = useQuery({
    queryKey: ['admin-heatmap', activeHeatmapVertical, session],
    queryFn: () => analyticsApi.getHeatmap({ verticalId: activeHeatmapVertical, session, limit: 15 }),
    enabled: !!activeHeatmapVertical
  });
  const heatmapData = heatmapRes?.data || { events: [], matrix: [] };

  // 7. At Risk Members
  const { data: atRiskRes, isLoading: loadingAtRisk } = useQuery({
    queryKey: ['admin-at-risk', session],
    queryFn: () => analyticsApi.getAtRiskMembers({ session })
  });
  const atRiskMembers = atRiskRes?.data || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Academic Session Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Admin Analytics & Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time attendance metrics, trends, leaderboards, and vertical insights.
          </p>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-3">
          {/* Academic Session Selector */}
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 px-2.5">Session:</span>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            >
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-900/40 transition shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Members"
          value={loadingOverview ? '...' : overview.totalMembers || 0}
          subtitle="Across 8 verticals"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Events"
          value={loadingOverview ? '...' : overview.totalEvents || 0}
          subtitle={`${overview.closedEventsCount || 0} past / closed`}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Overall Attendance"
          value={loadingOverview ? '...' : `${overview.overallAttendancePercent || 0}%`}
          subtitle={`Threshold: ${overview.threshold || 75}%`}
          icon={Percent}
          color="emerald"
        />
        <StatCard
          title="Below Threshold"
          value={loadingOverview ? '...' : overview.membersBelowThresholdCount || 0}
          subtitle="At risk of ineligibility"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Charts Row: Attendance Trends & Cross-Vertical Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Line Chart */}
        <ChartCard
          title="Attendance Trend Over Time"
          subtitle="Average attendance percentage per closed event"
          loading={loadingTrends}
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => (val.length > 12 ? `${val.substring(0, 10)}...` : val)}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val) => [`${val}%`, 'Attendance']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4f46e5' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cross-Vertical Comparison Bar Chart */}
        <ChartCard
          title="Vertical Attendance Comparison"
          subtitle="Average attendance % across all 8 verticals"
          loading={loadingVertComp}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={verticalComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                tickFormatter={(val) => val.split(' ')[0]}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val) => [`${val}%`, 'Avg Attendance']}
                contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="averageAttendance" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Leaderboards & Streaks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vertical Leaderboard */}
        <ChartCard
          title="Vertical Leaderboard"
          subtitle="Ranked by average attendance percentage"
          loading={loadingVLeader}
        >
          <Leaderboard items={verticalLeaderboard} isVertical={true} />
        </ChartCard>

        {/* Member Leaderboard */}
        <ChartCard
          title="Top Member Leaderboard"
          subtitle="Ranked by individual attendance %"
          loading={loadingMLeader}
        >
          <Leaderboard items={memberLeaderboard} isVertical={false} />
        </ChartCard>

        {/* Member Streaks */}
        <ChartCard
          title="Attendance Streaks"
          subtitle="Active consecutive present events"
          loading={loadingMLeader}
        >
          <StreaksList members={memberLeaderboard} />
        </ChartCard>
      </div>

      {/* Attendance Heatmap Matrix (Members x Events) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Vertical Attendance Heatmap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed 2D matrix of members vs. recent closed events (Present / Absent)
              </p>
            </div>
          </div>

          {/* Vertical Selector for Heatmap */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Vertical:</span>
            <select
              value={activeHeatmapVertical}
              onChange={(e) => setHeatmapVerticalId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            >
              {verticals.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Heatmap
          events={heatmapData.events}
          matrix={heatmapData.matrix}
          loading={loadingHeatmap}
        />
      </div>

      {/* At-Risk Members Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Members Below Threshold ({overview.threshold || 75}%)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {atRiskMembers.length} active member(s) currently at risk of attendance ineligibility
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Member ID</th>
                <th className="px-4 py-3">Vertical</th>
                <th className="px-4 py-3 text-center">Attended / Eligible</th>
                <th className="px-4 py-3 text-center">Attendance %</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {atRiskMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    🎉 Excellent! No members are currently below the required threshold.
                  </td>
                </tr>
              ) : (
                atRiskMembers.map((item) => (
                  <tr key={item.member._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {item.member.name}
                      <p className="text-[11px] font-normal text-slate-400">{item.member.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-600 dark:text-slate-300">
                      {item.member.memberId}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {item.member.vertical?.name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {item.attendedCount} / {item.eligibleCount}
                    </td>
                    <td className="px-4 py-3 text-center font-extrabold text-rose-600 dark:text-rose-400">
                      {item.percentage}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status="AT RISK" />
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
