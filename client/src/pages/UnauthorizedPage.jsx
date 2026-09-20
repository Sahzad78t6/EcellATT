import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, getDefaultRedirect } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <ShieldX className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Access Denied</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          You do not have permission to view this resource.
        </p>
        <button
          onClick={() => navigate(user ? getDefaultRedirect(user.role) : '/login')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Your Dashboard</span>
        </button>
      </div>
    </div>
  );
};
