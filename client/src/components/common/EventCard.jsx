import React from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight, Edit, XCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
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
    <div className="surface-card border border-border-subtle hover:border-border-bright p-5 shadow-depth-2 hover:shadow-depth-3 transition-all flex flex-col justify-between space-y-4 rounded-2xl">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-surface-2 text-brand-ice border border-border-subtle text-xs font-bold">
            {event.type}
          </span>
          <StatusBadge status={event.status} />
        </div>

        <div>
          <h4 className="font-bold font-heading text-text-primary text-base sm:text-lg leading-snug">
            {event.name}
          </h4>
          {event.description && (
            <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        <div className="space-y-1.5 text-xs text-text-secondary pt-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-brand-glow shrink-0" />
            <span className="font-mono">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-brand-glow shrink-0" />
            <span className="font-mono">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
            <span className="truncate">{event.venue || 'E-Cell Hall'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-brand-glow shrink-0" />
            <span className="truncate">
              {isTargetAll
                ? 'All Verticals'
                : event.targetVerticals.map((v) => v.name || v).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
        {/* Head or Admin Mark Attendance Action for Open Event */}
        {(isHead || isAdmin) && event.status === 'OPEN' && onMarkAttendance && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onMarkAttendance(event)}
            icon={ArrowRight}
            iconPosition="right"
            className="w-full sm:w-auto flex-1 shadow-btn-3d"
          >
            Mark Attendance
          </Button>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-1.5 w-full justify-end text-xs">
            {event.status === 'SCHEDULED' && onOpen && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onOpen(event._id)}
              >
                Open Window
              </Button>
            )}
            {event.status === 'OPEN' && onClose && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onClose(event._id)}
              >
                Close & Finalize
              </Button>
            )}
            {event.status === 'CLOSED' && onReopen && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onReopen(event._id)}
              >
                Reopen
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(event)}
                icon={Edit}
              >
                Edit
              </Button>
            )}
            {event.status !== 'CANCELLED' && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(event._id)}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
