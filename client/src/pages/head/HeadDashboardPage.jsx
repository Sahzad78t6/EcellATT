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
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  Users,
  Percent,
  Calendar,
  AlertTriangle,
  ClipboardCheck,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';

export const HeadDashboardPage = () => {
  useDocumentTitle('Vertical Head Dashboard');
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
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Live Event Banner with Countdown */}
      {activeLiveEvent && <LiveEventBanner event={activeLiveEvent} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{summary.vertical?.name || 'Vertical'} Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
            Head Leadership Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {activeLiveEvent && (
            <button
              onClick={() => navigate(`/head/mark/${activeLiveEvent._id}`)}
              className="btn-3d-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-glow-sm"
            >
              <ClipboardCheck className="w-4 h-4 text-status-present" />
              <span>Mark Live Attendance</span>
            </button>
          )}

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Average Attendance"
          value={isLoading ? '...' : `${summary.averageAttendance || 0}%`}
          subtitle={`Threshold: ${summary.threshold || 75}%`}
          icon={Percent}
          color="blue"
        />
        <StatCard
          title="Vertical Members"
          value={isLoading ? '...' : summary.memberCount || 0}
          subtitle="Active members"
          icon={Users}
          color="cyan"
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
        <div className="surface-card rounded-2xl p-5 sm:p-6 border border-brand-border shadow-depth-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-heading font-bold text-text-primary">
              Upcoming & Live Sessions
            </h3>
          </div>

          <div className="space-y-3">
            {!summary.upcomingEvents || summary.upcomingEvents.length === 0 ? (
              <p className="text-xs text-text-muted py-8 text-center bg-surface-1/50 rounded-xl border border-white/[0.04]">
                No upcoming events scheduled.
              </p>
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
        <div className="surface-card rounded-2xl p-5 sm:p-6 border border-brand-border shadow-depth-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-heading font-bold text-text-primary">
              At-Risk Vertical Members (&lt; {summary.threshold || 75}%)
            </h3>
            <button
              onClick={() => navigate('/head/members')}
              className="text-xs font-bold text-brand-glow hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {!summary.atRiskMembers || summary.atRiskMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted bg-surface-1/50 rounded-xl border border-white/[0.04]">
                🎉 All members in your vertical are currently in good attendance standing!
              </div>
            ) : (
              summary.atRiskMembers.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface-1/80 border border-brand-border/40 hover:border-brand-border transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-text-primary">{m.name}</p>
                    <p className="text-[11px] text-text-muted font-mono mt-0.5">
                      {m.memberId} • Attended {m.attendedCount} of {m.eligibleCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-status-absent">
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
