import React from 'react';
import { Outlet } from 'react-router-dom';
import { BackgroundScene } from '../components/common/BackgroundScene';

export const AuthLayout = () => {
  return (
    <div className="min-h-dvh flex flex-col justify-between bg-bg-0 text-text-primary relative overflow-hidden selection:bg-brand-primary/30 selection:text-brand-ice">
      {/* 3D Background Scene */}
      <BackgroundScene />

      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="E-Cell Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.7)]"
          />
          <div>
            <span className="font-black font-heading text-base sm:text-lg tracking-tight text-text-primary">
              E-CELL
            </span>{' '}
            <span className="text-[11px] sm:text-xs text-brand-glow font-bold uppercase tracking-wider bg-brand-deep/50 px-2 py-0.5 rounded-md border border-brand-bright/30">
              Attendance Portal
            </span>
          </div>
        </div>
      </header>

      {/* Centered Auth Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-4 sm:my-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-text-muted z-10">
        Entrepreneurship Cell • Student Attendance Management System • Session 2026-2027
      </footer>
    </div>
  );
};
