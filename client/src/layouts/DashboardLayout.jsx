import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { MobileNav } from '../components/common/MobileNav';
import { BackgroundScene } from '../components/common/BackgroundScene';

export const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col bg-bg-0 text-text-primary relative selection:bg-brand-primary/30 selection:text-brand-ice">
      {/* 3D Ambient Layered Background */}
      <BackgroundScene />

      {/* Top Navbar */}
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar className="h-[calc(100dvh-4rem)] sticky top-16" />
        </div>

        {/* Mobile Navigation Drawer & Bottom Bar */}
        <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
