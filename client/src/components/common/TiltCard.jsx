import React from 'react';
import { useTilt } from '../../hooks/useTilt';
import clsx from 'clsx';

/**
 * 3D Tilt Card with specular highlight reflection
 */
export const TiltCard = ({
  children,
  className = '',
  max = 5,
  perspective = 1000,
  interactive = true,
  ...props
}) => {
  const { elementRef, specular } = useTilt({ max, perspective });

  return (
    <div
      ref={elementRef}
      className={clsx(
        'surface-card relative overflow-hidden',
        interactive && 'surface-card-interactive',
        className
      )}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {/* Specular light highlight that tracks pointer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(400px circle at ${specular.x}% ${specular.y}%, rgba(96, 165, 250, ${specular.opacity}), transparent 60%)`,
        }}
        aria-hidden="true"
      />

      {/* Card Content with slight depth */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
