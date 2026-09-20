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
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-bright to-brand-deep flex items-center justify-center text-white font-black text-base shadow-[0_0_16px_rgba(59,130,246,0.6)] border border-brand-glow/40">
            E
          </div>
          <div>
            <span className="font-black font-heading text-base tracking-tight text-text-primary">
              E-CELL
            </span>{' '}
            <span className="text-xs text-brand-glow font-bold uppercase tracking-wider bg-brand-deep/50 px-2 py-0.5 rounded-md border border-brand-bright/30">
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
