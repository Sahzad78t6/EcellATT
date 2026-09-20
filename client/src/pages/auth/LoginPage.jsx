import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LogIn, Key, Mail, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button } from '../../components/common/Button';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Member ID is required'),
  password: z.string().min(1, 'Password is required')
});

export const LoginPage = () => {
  useDocumentTitle('Sign In');
  const { login, getDefaultRedirect } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setAuthError('');
    try {
      const user = await login(data.identifier, data.password);
      if (user.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate(getDefaultRedirect(user.role));
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 3D Floating Hero Showcase Panels (Desktop & Tablet) */}
      <div className="relative mb-8 text-center" style={{ perspective: '1000px' }}>
        {/* Floating Mini 3D Badge 1 - Left */}


        {/* Floating Mini 3D Badge 2 - Right */}


        <div className="flex justify-center mb-5">
          <div className="p-3.5 rounded-3xl bg-surface-1/90 border border-brand-glow/30 shadow-[0_0_30px_rgba(59,130,246,0.35)] backdrop-blur-xl transition-transform hover:scale-105 duration-300">
            <img
              src="/logo.png"
              alt="E-Cell Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_0_16px_rgba(59,130,246,0.8)]"
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-deep/40 border border-brand-bright/30 text-brand-glow text-xs font-bold mb-3 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Official Portal Access • 2026-2027</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight bg-gradient-to-r from-white via-text-primary to-brand-ice bg-clip-text text-transparent">
          Welcome to E-Cell Portal
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-1.5">
          Sign in with your official E-Cell email or Student Member ID
        </p>
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="surface-card border border-border-bright/90 rounded-3xl p-6 sm:p-8 shadow-depth-3 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle Conic Glow Behind Card */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 bg-brand-bright/20 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {authError && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/70 border border-rose-600/40 flex items-start gap-3 text-rose-300 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 font-semibold leading-relaxed">{authError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
              Email or Member ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                autoComplete="username"
                {...register('identifier')}
                placeholder="e.g. nikhilesh@ecell.org or ECELL_001"
                className="input-3d w-full pl-10 pr-4"
              />
            </div>
            {errors.identifier && (
              <p className="text-xs text-rose-400 font-semibold">{errors.identifier.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                placeholder="Enter your password"
                className="input-3d w-full pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400 font-semibold">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              icon={LogIn}
              className="w-full shadow-btn-3d"
            >
              Sign In to Dashboard
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-border-subtle text-center text-xs text-text-muted leading-relaxed">
          <p>
            First time logging in? Student members use their default registration password.<br />
            Need help? Contact your <strong>Vertical Secretary</strong> or <strong>Admin</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
