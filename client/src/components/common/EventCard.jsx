import React from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatTime } from '../../utils/formatters';

export const EventCard = ({
  event,
  onMarkAttendance = null,
  onOpen = null,
  onClose = null,
  onReopen = null,
  onCancel = null,
  onEdit = null,
  isAdmin = false,
  isHead = false
}) => {
  const isTargetAll = !event.targetVerticals || event.targetVerticals.length === 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            {event.type}
          </span>
          <StatusBadge status={event.status} />
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
            {event.name}
          </h4>
          {event.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
              {event.description}
            </p>
          )}
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{event.venue || 'E-Cell Boardroom'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {isTargetAll
                ? 'All Verticals'
                : event.targetVerticals.map((v) => v.name || v).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        {/* Head or Admin Mark Attendance Action for Open Event */}
        {(isHead || isAdmin) && event.status === 'OPEN' && onMarkAttendance && (
          <button
            onClick={() => onMarkAttendance(event)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <span>Mark Attendance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 w-full justify-end text-xs">
            {event.status === 'SCHEDULED' && onOpen && (
              <button
                onClick={() => onOpen(event._id)}
                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold rounded-lg hover:bg-emerald-100 transition"
              >
                Open Window
              </button>
            )}
            {event.status === 'OPEN' && onClose && (
              <button
                onClick={() => onClose(event._id)}
                className="px-2.5 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold rounded-lg hover:bg-rose-100 transition"
              >
                Close & Finalize
              </button>
            )}
            {event.status === 'CLOSED' && onReopen && (
              <button
                onClick={() => onReopen(event._id)}
                className="px-2.5 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold rounded-lg hover:bg-amber-100 transition"
              >
                Reopen
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="px-2.5 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Edit
              </button>
            )}
            {event.status !== 'CANCELLED' && onCancel && (
              <button
                onClick={() => onCancel(event._id)}
                className="px-2.5 py-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
