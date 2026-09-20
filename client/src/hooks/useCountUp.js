import { useState, useEffect, useRef } from 'react';

/**
 * Animated number count-up hook with easeOutExpo.
 * Directly shows final value if prefers-reduced-motion is active.
 */
export function useCountUp(targetValue, { duration = 1200, decimals = 0 } = {}) {
  const [value, setValue] = useState(() => (typeof targetValue === 'number' ? 0 : targetValue));
  const rafRef = useRef(null);

  useEffect(() => {
    if (typeof targetValue !== 'number' || isNaN(targetValue)) {
      setValue(targetValue);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(targetValue);
      return;
    }

    const startTime = performance.now();
    const startVal = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = startVal + (targetValue - startVal) * ease;

      setValue(Number(currentVal.toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(targetValue);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, duration, decimals]);

  return value;
}
