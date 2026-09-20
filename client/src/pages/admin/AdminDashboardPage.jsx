import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analyticsApi';
import { verticalApi } from '../../api/verticalApi';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard } from '../../components/common/ChartCard';
import { Leaderboard } from '../../components/analytics/Leaderboard';
import { StreaksList } from '../../components/analytics/StreaksList';
import { Heatmap } from '../../components/analytics/Heatmap';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  Users,
  Calendar,
  Percent,
  AlertTriangle,
  Grid,
  LogOut,
  Sparkles,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

// Custom dark glass tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label, unit = '%' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="surface-card p-3 rounded-xl shadow-2xl border border-brand-glow/30 backdrop-blur-xl text-xs">
        <p className="font-semibold text-text-primary mb-1">{payload[0]?.payload?.name || label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-glow shadow-glow-sm" />
          <span className="text-text-secondary">{payload[0]?.name || 'Value'}:</span>
          <span className="font-mono font-bold text-brand-glow">
            {payload[0]?.value}{unit}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const AdminDashboardPage = () => {
  useDocumentTitle('Admin Overview');
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
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header with Academic Session Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Attendance Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
            Admin Analytics & Overview
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time attendance metrics, trends, leaderboards, and vertical insights.
          </p>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-3">
          {/* Academic Session Selector */}
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
          title="Active Members"
          value={loadingOverview ? '...' : overview.totalMembers || 0}
          subtitle="Across 8 verticals"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Events"
          value={loadingOverview ? '...' : overview.totalEvents || 0}
          subtitle={`${overview.closedEventsCount || 0} past / closed`}
          icon={Calendar}
          color="cyan"
        />
        <StatCard
          title="Overall Attendance"
          value={loadingOverview ? '...' : `${overview.overallAttendancePercent || 0}%`}
          subtitle={`Required threshold: ${overview.threshold || 75}%`}
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
        {/* Attendance Trend Line/Area Chart */}
        <ChartCard
          title="Attendance Trend Over Time"
          subtitle="Average attendance percentage per closed event"
          loading={loadingTrends}
          icon={TrendingUp}
        >
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(96, 165, 250, 0.08)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(val) => (val?.length > 12 ? `${val.substring(0, 10)}...` : val)}
                  stroke="rgba(96, 165, 250, 0.2)"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  stroke="rgba(96, 165, 250, 0.2)"
                />
                <Tooltip content={<CustomChartTooltip unit="%" />} />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  name="Attendance"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#trendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Cross-Vertical Comparison Bar Chart */}
        <ChartCard
          title="Vertical Attendance Comparison"
          subtitle="Average attendance % across all verticals"
          loading={loadingVertComp}
          icon={BarChart3}
        >
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={verticalComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(96, 165, 250, 0.08)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => val?.split(' ')[0] || ''}
                  stroke="rgba(96, 165, 250, 0.2)"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  stroke="rgba(96, 165, 250, 0.2)"
                />
                <Tooltip content={<CustomChartTooltip unit="%" />} />
                <Bar
                  dataKey="averageAttendance"
                  name="Avg Attendance"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
      <div className="surface-card p-4 sm:p-6 rounded-2xl space-y-4 border border-brand-border shadow-depth-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="icon-orb text-brand-glow">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-text-primary">
                Vertical Attendance Heatmap
              </h3>
              <p className="text-xs text-text-muted">
                2D matrix of members vs. recent closed events (Present / Absent)
              </p>
            </div>
          </div>

          {/* Vertical Selector for Heatmap */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-text-secondary">Vertical:</span>
            <select
              value={activeHeatmapVertical}
              onChange={(e) => setHeatmapVerticalId(e.target.value)}
              className="input-3d text-xs font-semibold rounded-xl px-3 py-1.5 text-text-primary cursor-pointer"
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
      <div className="surface-card p-4 sm:p-6 rounded-2xl space-y-4 border border-brand-border shadow-depth-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="icon-orb text-status-absent">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-text-primary">
                Members Below Threshold ({overview.threshold || 75}%)
              </h3>
              <p className="text-xs text-text-muted">
                {atRiskMembers.length} active member(s) currently at risk of attendance ineligibility
              </p>
            </div>
          </div>
        </div>

        {/* Mobile View: Stacked Cards */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {atRiskMembers.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-xs bg-surface-1/50 rounded-xl border border-white/[0.04]">
              🎉 Excellent! No members are currently below the required threshold.
            </div>
          ) : (
            atRiskMembers.map((item) => (
              <div key={item.member._id} className="p-3.5 rounded-xl bg-surface-2/60 border border-brand-border/40 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{item.member.name}</h4>
                    <p className="text-[11px] text-text-muted font-mono">{item.member.memberId}</p>
                    <p className="text-[11px] text-text-secondary">{item.member.email}</p>
                  </div>
                  <StatusBadge status="AT RISK" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
                  <span className="text-text-muted">Vertical: {item.member.vertical?.name || 'Unassigned'}</span>
                  <div className="text-right">
                    <span className="font-bold text-status-absent text-sm">{item.percentage}%</span>
                    <span className="text-[10px] text-text-muted ml-1">({item.attendedCount}/{item.eligibleCount})</span>
                  </div>
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
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Member ID</th>
                <th className="px-4 py-3">Vertical</th>
                <th className="px-4 py-3 text-center">Attended / Eligible</th>
                <th className="px-4 py-3 text-center">Attendance %</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {atRiskMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    🎉 Excellent! No members are currently below the required threshold.
                  </td>
                </tr>
              ) : (
                atRiskMembers.map((item) => (
                  <tr key={item.member._id} className="hover:bg-brand-primary/[0.06] transition-colors">
                    <td className="px-4 py-3 font-bold text-text-primary">
                      {item.member.name}
                      <p className="text-[11px] font-normal text-text-muted">{item.member.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-text-secondary">
                      {item.member.memberId}
                    </td>
                    <td className="px-4 py-3 font-medium text-text-secondary">
                      {item.member.vertical?.name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-text-primary">
                      {item.attendedCount} / {item.eligibleCount}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-extrabold text-status-absent">
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
