import React from 'react';

/**
 * 3D Ambient Black + Blue background scene with drifting radial orbs and perspective grid.
 * Degrades to static gradient on mobile and under prefers-reduced-motion.
 */
export const BackgroundScene = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Deep Black Canvas */}
      <div className="absolute inset-0 bg-[#02040a]" />

      {/* Primary Blue Ambient Orb - Top Right */}
      <div
        className="absolute -top-32 -right-32 w-[34rem] sm:w-[48rem] h-[34rem] sm:h-[48rem] rounded-full opacity-35 blur-[100px] sm:blur-[140px] pointer-events-none transition-transform duration-1000 hidden md:block animate-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, rgba(30, 58, 138, 0.15) 50%, transparent 75%)',
          willChange: 'transform',
        }}
      />

      {/* Cyan Accent Ambient Orb - Bottom Left */}
      <div
        className="absolute -bottom-32 -left-32 w-[28rem] sm:w-[42rem] h-[28rem] sm:h-[42rem] rounded-full opacity-25 blur-[90px] sm:blur-[130px] pointer-events-none hidden md:block animate-float-reverse"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.35) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 75%)',
          willChange: 'transform',
        }}
      />

      {/* Static Subtle Mobile Glow (<768px) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[32rem] opacity-30 blur-[80px] md:hidden pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(37, 99, 235, 0.4) 0%, rgba(6, 11, 22, 0) 70%)',
        }}
      />

      {/* Perspective Floor Grid */}
      <div className="absolute inset-0 bg-perspective-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      {/* Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, transparent 40%, #02040a 95%)',
        }}
      />

      {/* Micro Noise Texture Overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none opacity-40" />
    </div>
  );
};
