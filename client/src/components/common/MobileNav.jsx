import React from 'react';
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
  X
} from 'lucide-react';
import { Sidebar } from './Sidebar';

export const MobileNav = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 z-50">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  E
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">E-Cell Portal</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onItemClick={onClose} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around text-slate-500 dark:text-slate-400">
        {role === 'ADMIN' && (
          <>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Overview</span>
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`
              }
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
            </NavLink>
            <NavLink
              to="/admin/events"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`
              }
            >
              <Calendar className="w-5 h-5" />
              <span>Events</span>
            </NavLink>
            <NavLink
              to="/admin/attendance"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`
              }
            >
              <ClipboardCheck className="w-5 h-5" />
              <span>Attendance</span>
            </NavLink>
          </>
        )}

        {(role === 'SECRETARY' || role === 'LEAD') && (
          <>
            <NavLink
              to="/head"
              end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Overview</span>
            </NavLink>
            <NavLink
              to="/head/members"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`
              }
            >
              <UserCheck className="w-5 h-5" />
              <span>Members</span>
            </NavLink>
          </>
        )}

        {role === 'MEMBER' && (
          <>
            <NavLink
              to="/member"
              end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Attendance</span>
            </NavLink>
            <NavLink
              to="/member/history"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`
              }
            >
              <History className="w-5 h-5" />
              <span>History</span>
            </NavLink>
            <NavLink
              to="/member/profile"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`
              }
            >
              <UserIcon className="w-5 h-5" />
              <span>Profile</span>
            </NavLink>
          </>
        )}
      </nav>
    </>
  );
};
