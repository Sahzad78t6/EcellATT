import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analyticsApi';
import { eventApi } from '../../api/eventApi';
import { StatCard } from '../../components/common/StatCard';
import { LiveEventBanner } from '../../components/common/LiveEventBanner';
import { EventCard } from '../../components/common/EventCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  Percent,
  Calendar,
  AlertTriangle,
  ClipboardCheck,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';

export const HeadDashboardPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Fetch scoped vertical summary
  const { data: summaryRes, isLoading } = useQuery({
    queryKey: ['vertical-summary'],
    queryFn: () => analyticsApi.getVerticalSummary()
  });
  const summary = summaryRes?.data || {};

  // Fetch open / live events targeting this vertical
  const { data: eventsRes } = useQuery({
    queryKey: ['head-open-events'],
    queryFn: () => eventApi.list({ status: 'OPEN', limit: 5 })
  });
  const openEvents = eventsRes?.data?.events || [];
  const activeLiveEvent = openEvents[0] || null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Live Event Banner with Countdown */}
      {activeLiveEvent && <LiveEventBanner event={activeLiveEvent} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {summary.vertical?.name || 'Vertical'} Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Head Leadership Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {activeLiveEvent && (
            <button
              onClick={() => navigate(`/head/mark/${activeLiveEvent._id}`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Mark Live Attendance</span>
            </button>
          )}

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-900/40 transition shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Average Attendance"
          value={isLoading ? '...' : `${summary.averageAttendance || 0}%`}
          subtitle={`Threshold: ${summary.threshold || 75}%`}
          icon={Percent}
          color="indigo"
        />
        <StatCard
          title="Vertical Members"
          value={isLoading ? '...' : summary.memberCount || 0}
          subtitle="Active members"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Upcoming Sessions"
          value={isLoading ? '...' : summary.upcomingEvents?.length || 0}
          subtitle="Scheduled events"
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="At-Risk Members"
          value={isLoading ? '...' : summary.atRiskCount || 0}
          subtitle="Below attendance threshold"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Grid: Upcoming Sessions & At-Risk Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events for This Vertical */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upcoming & Live Sessions
            </h3>
          </div>

          <div className="space-y-3">
            {!summary.upcomingEvents || summary.upcomingEvents.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No upcoming events scheduled.</p>
            ) : (
              summary.upcomingEvents.map((ev) => (
                <EventCard
                  key={ev._id}
                  event={ev}
                  isHead={true}
                  onMarkAttendance={() => navigate(`/head/mark/${ev._id}`)}
                />
              ))
            )}
          </div>
        </div>

        {/* At-Risk Members List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              At-Risk Vertical Members (&lt; {summary.threshold || 75}%)
            </h3>
            <button
              onClick={() => navigate('/head/members')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {!summary.atRiskMembers || summary.atRiskMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                🎉 All members in your vertical are currently in good attendance standing!
              </div>
            ) : (
              summary.atRiskMembers.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {m.memberId} • Attended {m.attendedCount} of {m.eligibleCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                      {formatPercentage(m.percentage)}
                    </span>
                    <StatusBadge status="AT RISK" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
