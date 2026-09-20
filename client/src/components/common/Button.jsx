import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost', 'success'
  size = 'md', // 'sm', 'md', 'lg'
  icon: Icon = null,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all select-none min-h-[40px] sm:min-h-[38px] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 min-h-[36px]',
    md: 'text-xs sm:text-sm px-4 py-2 sm:py-2.5 rounded-xl gap-2 min-h-[42px] sm:min-h-[40px]',
    lg: 'text-sm sm:text-base px-5 py-3 rounded-xl gap-2.5 min-h-[48px]',
  };

  const variantClasses = {
    primary: 'btn-3d-primary',
    secondary: 'btn-3d-secondary',
    danger: 'btn-3d-danger',
    success: 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white border border-emerald-400/40 shadow-btn-3d hover:brightness-110 active:translate-y-0.5 rounded-xl text-shadow-sm',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-2/70 border border-transparent hover:border-border-subtle rounded-xl',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
          <span>{typeof children === 'string' ? 'Loading...' : children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};
