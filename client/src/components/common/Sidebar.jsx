import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Layers,
  Calendar,
  ClipboardCheck,
  FileSpreadsheet,
  Mail,
  Sliders,
  FileText,
  UserCheck,
  History,
  User as UserIcon,
  BarChart3
} from 'lucide-react';

export const Sidebar = ({ className = '', onItemClick = null }) => {
  const { user } = useAuth();
  const role = user?.role;

  let links = [];

  if (role === 'ADMIN') {
    links = [
      { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
      { to: '/admin/users', icon: Users, label: 'Users & Members' },
      { to: '/admin/verticals', icon: Layers, label: 'Verticals' },
      { to: '/admin/events', icon: Calendar, label: 'Events' },
      { to: '/admin/attendance', icon: ClipboardCheck, label: 'Attendance Oversight' },
      { to: '/admin/reports', icon: FileSpreadsheet, label: 'Reports & Export' },
      { to: '/admin/alerts', icon: Mail, label: 'Email Alerts' },
      { to: '/admin/settings', icon: Sliders, label: 'Settings' },
      { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' }
    ];
  } else if (role === 'SECRETARY' || role === 'LEAD') {
    links = [
      { to: '/head', icon: LayoutDashboard, label: 'Vertical Dashboard' },
      { to: '/head/members', icon: UserCheck, label: 'Vertical Members' },
      { to: '/head/analytics', icon: BarChart3, label: 'Vertical Analytics' }
    ];
  } else if (role === 'MEMBER') {
    links = [
      { to: '/member', icon: LayoutDashboard, label: 'My Attendance' },
      { to: '/member/history', icon: History, label: 'Attendance History' },
      { to: '/member/profile', icon: UserIcon, label: 'My Profile' }
    ];
  }

  return (
    <aside
      className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between py-6 px-4 shrink-0 ${className}`}
    >
      <div className="space-y-6">
        {/* Navigation Group */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/admin' || link.to === '/head' || link.to === '/member'}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          E-Cell Attendance System v1.0
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-600">
          Academic Year 2024-2025
        </p>
      </div>
    </aside>
  );
};
