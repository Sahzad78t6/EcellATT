import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  UserCheck,
  History,
  User as UserIcon,
  BarChart3,
  MoreHorizontal,
  X
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import clsx from 'clsx';

export const MobileNav = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const role = user?.role;

  const isDrawerOpen = isOpen || moreDrawerOpen;
  const handleCloseDrawer = () => {
    if (onClose) onClose();
    setMoreDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex transition-opacity"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-bg-0/80 backdrop-blur-md"
            onClick={handleCloseDrawer}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full glass-sidebar z-50 animate-in slide-in-from-left duration-200 shadow-depth-3 border-r border-border-bright">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="E-Cell Logo"
                  className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                />
                <span className="font-bold font-heading text-sm text-text-primary">E-Cell Portal</span>
              </div>
              <button
                onClick={handleCloseDrawer}
                aria-label="Close menu"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onItemClick={handleCloseDrawer} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Navigation Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-border-bright/80 px-2 py-1.5 flex items-center justify-around shadow-depth-3 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
        aria-label="Mobile Navigation"
      >
        {role === 'ADMIN' && (
          <>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all relative',
                  isActive ? 'text-brand-cyan' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard className={clsx('w-5 h-5 mb-0.5', isActive && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]')} />
                  <span>Overview</span>
                </>
              )}
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all relative',
                  isActive ? 'text-brand-cyan' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Users className={clsx('w-5 h-5 mb-0.5', isActive && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]')} />
                  <span>Users</span>
                </>
              )}
            </NavLink>
            <NavLink
              to="/admin/events"
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all relative',
                  isActive ? 'text-brand-cyan' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Calendar className={clsx('w-5 h-5 mb-0.5', isActive && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]')} />
                  <span>Events</span>
                </>
              )}
            </NavLink>
            <NavLink
              to="/admin/attendance"
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all relative',
                  isActive ? 'text-brand-cyan' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <ClipboardCheck className={clsx('w-5 h-5 mb-0.5', isActive && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]')} />
                  <span>Roster</span>
                </>
              )}
            </NavLink>
            <button
              onClick={() => setMoreDrawerOpen(true)}
              aria-label="More options"
              className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold text-text-muted hover:text-text-primary transition"
            >
              <MoreHorizontal className="w-5 h-5 mb-0.5" />
              <span>More</span>
            </button>
          </>
        )}

        {(role === 'SECRETARY' || role === 'LEAD') && (
          <>
            <NavLink
              to="/head"
              end
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-3 py-1 rounded-xl text-[10px] font-bold transition-all',
                  isActive ? 'text-brand-cyan' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard className={clsx('w-5 h-5 mb-0.5', isActive && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]')} />
                  <span>Dashboard</span>
                </>
              )}
            </NavLink>
            <NavLink
              to="/head/members"
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-3 py-1 rounded-xl text-[10px] font-bold transition-all',
                  isActive ? 'text-brand-cyan' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <UserCheck className={clsx('w-5 h-5 mb-0.5', isActive && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]')} />
                  <span>Members</span>
                </>
              )}
            </NavLink>
            <NavLink
              to="/head/analytics"
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all',
                  isActive ? 'text-brand-cyan' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <BarChart3 className={clsx('w-5 h-5 mb-0.5', isActive && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]')} />
                  <span>Analytics</span>
                </>
              )}
            </NavLink>
            <NavLink
              to="/head/profile"
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all',
                  isActive ? 'text-brand-cyan' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <UserIcon className={clsx('w-5 h-5 mb-0.5', isActive && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]')} />
                  <span>Profile</span>
                </>
              )}
            </NavLink>
          </>
        )}

        {role === 'MEMBER' && (
          <>
            <NavLink
              to="/member"
              end
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-3 py-1 rounded-xl text-[10px] font-bold transition-all',
                  isActive ? 'text-brand-cyan' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard className={clsx('w-5 h-5 mb-0.5', isActive && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]')} />
                  <span>Overview</span>
                </>
              )}
            </NavLink>
            <NavLink
              to="/member/history"
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-3 py-1 rounded-xl text-[10px] font-bold transition-all',
                  isActive ? 'text-brand-cyan' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <History className={clsx('w-5 h-5 mb-0.5', isActive && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]')} />
                  <span>History</span>
                </>
              )}
            </NavLink>
            <NavLink
              to="/member/profile"
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-3 py-1 rounded-xl text-[10px] font-bold transition-all',
                  isActive ? 'text-brand-cyan' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <UserIcon className={clsx('w-5 h-5 mb-0.5', isActive && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]')} />
                  <span>Profile</span>
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>
    </>
  );
};
