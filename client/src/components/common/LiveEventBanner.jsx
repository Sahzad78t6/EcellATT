import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Clock, ArrowRight } from 'lucide-react';
import { useEventCountdown } from '../../hooks/useEventCountdown';

export const LiveEventBanner = ({ event, bufferMinutes = 30 }) => {
  const navigate = useNavigate();
  const countdown = useEventCountdown(event?.endTime, bufferMinutes);

  if (!event || event.status !== 'OPEN') return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-4 sm:p-5 rounded-2xl shadow-lg mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shrink-0 animate-pulse">
          <Radio className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
              Live Attendance Window Open
            </span>
            <span className="text-xs text-emerald-100 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Closes in: <strong>{countdown.formatted}</strong></span>
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
            {event.name}
          </h4>
        </div>
      </div>

      <button
        onClick={() => navigate(`/head/mark/${event._id}`)}
        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition shrink-0"
      >
        <span>Mark Attendance Now</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
