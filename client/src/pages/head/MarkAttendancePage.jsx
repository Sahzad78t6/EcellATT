import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendanceApi';
import { AttendanceChecklist } from '../../components/attendance/AttendanceChecklist';
import { ArrowLeft, Clock, MapPin, Calendar, Sparkles } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';
import { useEventCountdown } from '../../hooks/useEventCountdown';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export const MarkAttendancePage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rosterRes, isLoading, error } = useQuery({
    queryKey: ['roster', eventId],
    queryFn: () => attendanceApi.getRoster(eventId)
  });

  const rosterData = rosterRes?.data || {};
  const event = rosterData.event;
  const roster = rosterData.roster || [];

  useDocumentTitle(event?.name ? `Mark: ${event.name}` : 'Mark Attendance');

  const countdown = useEventCountdown(event?.endTime, 30);

  const saveMutation = useMutation({
    mutationFn: (records) => attendanceApi.saveRoster(eventId, { records }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roster', eventId] });
      queryClient.invalidateQueries({ queryKey: ['vertical-summary'] });
      toast.success('Attendance saved successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save attendance');
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted text-sm">Loading event roster...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4 surface-card rounded-2xl border border-brand-border">
        <p className="text-status-absent font-bold">{error.message || 'Unable to load roster'}</p>
        <button
          onClick={() => navigate(-1)}
          className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isReadOnly = event?.status !== 'OPEN';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      {/* Top Breadcrumb & Event Summary Header */}
      <div className="space-y-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="surface-card rounded-2xl p-5 sm:p-6 border border-brand-border shadow-depth-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Event Attendance Marking Window</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-text-primary">
              {event?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary pt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-glow" />
                {formatDate(event?.date)}
              </span>
              <span className="text-text-muted">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                {formatTime(event?.startTime)} - {formatTime(event?.endTime)}
              </span>
              {event?.venue && (
                <>
                  <span className="text-text-muted">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-glow" />
                    {event.venue}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Window Countdown Timer */}
          {event?.status === 'OPEN' && (
            <div className="p-3.5 rounded-xl bg-status-present/10 border border-status-present/20 text-center shrink-0">
              <div className="text-[10px] uppercase font-bold text-status-present tracking-wider">
                Window Closes In
              </div>
              <div className="text-base font-mono font-black text-status-present mt-0.5">
                {countdown.formatted}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Checklist Component */}
      <AttendanceChecklist
        roster={roster}
        event={event}
        onSave={(records) => saveMutation.mutate(records)}
        saving={saveMutation.isPending}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};
