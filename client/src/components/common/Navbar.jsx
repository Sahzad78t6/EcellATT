import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User as UserIcon, Menu, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-border-subtle h-16 px-4 sm:px-6 flex items-center justify-between shadow-depth-1">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary lg:hidden hover:bg-surface-2 transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-bright to-brand-deep flex items-center justify-center text-white font-black text-sm shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-brand-glow/40">
            E
          </div>
          <div className="hidden sm:block">
            <span className="font-black font-heading text-sm tracking-tight text-text-primary">
              E-CELL
            </span>{' '}
            <span className="text-[10px] text-brand-glow font-bold uppercase tracking-wider bg-brand-deep/50 px-1.5 py-0.5 rounded-md border border-brand-bright/30">
              Portal
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Direct Logout Button */}
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/50 transition shadow-sm"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-surface-2 transition text-left border border-transparent hover:border-border-subtle"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-deep to-surface-1 text-brand-glow font-bold flex items-center justify-center text-xs border border-brand-bright/30 shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-text-primary leading-tight">
                {user?.name}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <span className="font-semibold text-brand-glow">{user?.role}</span>
                {user?.vertical && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">{user.vertical.name}</span>
                  </>
                )}
              </div>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 surface-card border border-border-bright rounded-2xl shadow-depth-3 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-border-subtle/80">
                <p className="text-xs font-bold text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-muted truncate mt-0.5">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-brand-glow" />
                  <span className="text-[10px] font-bold text-brand-glow uppercase">
                    {user?.role} {user?.memberId ? `(${user.memberId})` : ''}
                  </span>
                </div>
              </div>

              <div className="py-1">
                {user?.role === 'MEMBER' && (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/member/profile');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-2 flex items-center gap-2.5 transition"
                  >
                    <UserIcon className="w-4 h-4 text-brand-glow" />
                    <span>My Profile</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-300 hover:bg-rose-950/40 flex items-center gap-2.5 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
