import { useState, useEffect } from 'react';

export const useEventCountdown = (endTime, bufferMinutes = 30) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    formatted: ''
  });

  useEffect(() => {
    if (!endTime) return;

    const calculate = () => {
      const end = new Date(endTime).getTime();
      const closeTime = end + bufferMinutes * 60 * 1000;
      const now = Date.now();
      const diff = closeTime - now;

      if (diff <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          formatted: 'Closing now'
        });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formatted = `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;

      setTimeLeft({
        hours,
        minutes,
        seconds,
        isExpired: false,
        formatted
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endTime, bufferMinutes]);

  return timeLeft;
};
