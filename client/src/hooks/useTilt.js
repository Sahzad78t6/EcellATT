import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Performant 3D tilt hook using CSS transforms and requestAnimationFrame.
 * Automatically disabled on touch devices and under prefers-reduced-motion.
 */
export function useTilt({ max = 6, perspective = 1000, speed = 400 } = {}) {
  const elementRef = useRef(null);
  const [specular, setSpecular] = useState({ x: 50, y: 50, opacity: 0 });
  const rafId = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!elementRef.current) return;

    // Check device capabilities
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const el = elementRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -((y - centerY) / centerY) * max;
      const rotateY = ((x - centerX) / centerX) * max;

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
      el.style.transition = 'transform 80ms ease-out';

      const specX = ((x / rect.width) * 100).toFixed(1);
      const specY = ((y / rect.height) * 100).toFixed(1);
      setSpecular({ x: specX, y: specY, opacity: 0.18 });
    });
  }, [max, perspective]);

  const handleMouseLeave = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const el = elementRef.current;
    if (!el) return;
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    el.style.transition = `transform ${speed}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    setSpecular((prev) => ({ ...prev, opacity: 0 }));
  }, [perspective, speed]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { elementRef, specular };
}
