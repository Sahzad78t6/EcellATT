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
  BarChart3,
  LogOut,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = ({ className = '', onItemClick = null }) => {
  const { user, logout } = useAuth();
  const role = user?.role;
  const isSuperAdmin = user?.email?.toLowerCase() === 'admin@ecell.org' || user?.memberId === 'SUPERADMIN';

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
      { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
      ...(!isSuperAdmin ? [{ to: '/admin/profile', icon: UserIcon, label: 'My Profile' }] : [])
    ];
  } else if (role === 'SECRETARY' || role === 'LEAD') {
    links = [
      { to: '/head', icon: LayoutDashboard, label: 'Vertical Dashboard' },
      { to: '/head/members', icon: UserCheck, label: 'Vertical Members' },
      { to: '/head/analytics', icon: BarChart3, label: 'Vertical Analytics' },
      { to: '/head/profile', icon: UserIcon, label: 'My Profile' }
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
      className={clsx(
        'w-64 glass-sidebar flex flex-col justify-between py-6 px-4 shrink-0 z-20 select-none shadow-depth-2',
        className
      )}
    >
      <div className="space-y-6">
        {/* Portal Branding / Role Badge */}
        <div className="px-3.5 py-3 rounded-2xl bg-surface-2/80 border border-border-subtle flex items-center gap-3.5 shadow-depth-1">
          <img
            src="/logo.png"
            alt="E-Cell Logo"
            className="w-11 h-11 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold font-heading text-text-primary truncate">
              {role === 'ADMIN' ? 'Admin Portal' : role === 'MEMBER' ? 'Member Portal' : 'Head Portal'}
            </p>
            <p className="text-[10px] text-brand-glow font-medium truncate">
              {user?.vertical?.name || 'Executive Access'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
            Main Menu
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
                    clsx(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group relative',
                      isActive
                        ? 'bg-gradient-to-r from-brand-deep/80 to-surface-2 text-brand-ice border border-brand-bright/40 shadow-[0_0_16px_rgba(59,130,246,0.25)] font-bold'
                        : 'text-text-secondary hover:bg-surface-2/70 hover:text-text-primary hover:border-border-subtle border border-transparent'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Left Indicator Bar */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        className={clsx(
                          'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                          isActive ? 'text-brand-cyan' : 'text-text-muted group-hover:text-brand-glow'
                        )}
                      />
                      <span className="truncate">{link.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="space-y-3 pt-4 border-t border-border-subtle/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 transition-all shadow-sm group"
        >
          <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span>Sign Out</span>
        </button>

        <div className="px-3">
          <p className="text-[11px] text-text-muted font-medium">
            E-Cell Attendance System
          </p>
          <p className="text-[10px] text-brand-glow/80 font-mono">
            Session 2026-2027
          </p>
        </div>
      </div>
    </aside>
  );
};
