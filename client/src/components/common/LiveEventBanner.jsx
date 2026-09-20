import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Clock, ArrowRight } from 'lucide-react';
import { useEventCountdown } from '../../hooks/useEventCountdown';
import { Button } from './Button';

export const LiveEventBanner = ({ event, bufferMinutes = 30 }) => {
  const navigate = useNavigate();
  const countdown = useEventCountdown(event?.endTime, bufferMinutes);

  if (!event || event.status !== 'OPEN') return null;

  return (
    <div className="relative overflow-hidden surface-card border border-brand-glow/40 bg-gradient-to-r from-brand-deep/90 via-surface-2 to-surface-1 p-5 sm:p-6 rounded-2xl shadow-depth-3 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
      {/* Background Glow */}
      <div
        className="absolute -right-20 -top-20 w-52 h-52 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex items-start sm:items-center gap-3.5 relative z-10">
        <div className="p-3 bg-brand-cyan/20 border border-brand-cyan/40 rounded-xl text-brand-cyan shrink-0 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.4)]">
          <Radio className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-wider bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 px-2 py-0.5 rounded-md shadow-sm">
              Live Attendance Window Open
            </span>
            <span className="text-xs text-text-secondary flex items-center gap-1 font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-brand-glow" />
              <span>Closes in: <strong className="text-brand-ice">{countdown.formatted}</strong></span>
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold font-heading tracking-tight text-text-primary mt-1">
            {event.name}
          </h4>
        </div>
      </div>

      <div className="relative z-10 w-full md:w-auto">
        <Button
          variant="primary"
          onClick={() => navigate(`/head/mark/${event._id}`)}
          icon={ArrowRight}
          iconPosition="right"
          className="w-full md:w-auto shadow-btn-3d"
        >
          Mark Attendance Now
        </Button>
      </div>
    </div>
  );
};
