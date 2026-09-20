import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { BackgroundScene } from '../components/common/BackgroundScene';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const UnauthorizedPage = () => {
  useDocumentTitle('Access Denied');
  const navigate = useNavigate();
  const { user, getDefaultRedirect } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-0 text-center relative overflow-hidden">
      <BackgroundScene />
      <div className="surface-card rounded-3xl p-8 sm:p-12 max-w-md w-full border border-brand-border shadow-depth-lg space-y-5 relative z-10">
        <div className="icon-orb w-16 h-16 mx-auto text-status-absent shadow-glow-sm">
          <ShieldX className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-heading font-black text-text-primary tracking-tight">Access Denied</h1>
        <p className="text-xs text-text-muted leading-relaxed">
          You do not have permission to view this resource.
        </p>
        <button
          onClick={() => navigate(user ? getDefaultRedirect(user.role) : '/login')}
          className="btn-3d-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-glow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Your Dashboard</span>
        </button>
      </div>
    </div>
  );
};
