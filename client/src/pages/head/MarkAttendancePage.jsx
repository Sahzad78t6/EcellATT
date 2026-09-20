import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendanceApi';
import { AttendanceChecklist } from '../../components/attendance/AttendanceChecklist';
import { ArrowLeft, Clock, MapPin, Calendar } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';
import { useEventCountdown } from '../../hooks/useEventCountdown';
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
    return <div className="p-8 text-center text-slate-400">Loading event roster...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-600 font-bold">{error.message || 'Unable to load roster'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isReadOnly = event?.status !== 'OPEN';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Top Breadcrumb & Event Summary Header */}
      <div className="space-y-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Attendance Marking
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {event?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(event?.date)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(event?.startTime)} - {formatTime(event?.endTime)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event?.venue}
              </span>
            </div>
          </div>

          {/* Window Countdown Timer */}
          {event?.status === 'OPEN' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center shrink-0">
              <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                Window Closes In
              </div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
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
