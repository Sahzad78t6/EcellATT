import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { BackgroundScene } from '../components/common/BackgroundScene';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const NotFoundPage = () => {
  useDocumentTitle('404 - Page Not Found');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-0 text-center relative overflow-hidden">
      <BackgroundScene />
      <div className="surface-card rounded-3xl p-8 sm:p-12 max-w-md w-full border border-brand-border shadow-depth-lg space-y-5 relative z-10">
        <div className="icon-orb w-16 h-16 mx-auto text-brand-glow shadow-glow-sm">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-heading font-black text-brand-glow tracking-tight">404</h1>
        <h2 className="text-xl font-heading font-bold text-text-primary">Page Not Found</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-3d-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-glow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>
      </div>
    </div>
  );
};
