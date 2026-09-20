import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Shield, Layers, Calendar, Key, Mail, Phone, BookOpen, Sparkles } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one digit'),
    confirmPassword: z.string().min(1, 'Please confirm your new password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const MemberProfilePage = () => {
  useDocumentTitle('Member Profile & Settings');
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onChangePassword = async (data) => {
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully');
      reset();
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in pb-12">
      <div className="pb-2 border-b border-white/[0.06]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Account Security & Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
          Member Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          View your membership details and update your password.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 surface-card rounded-3xl p-6 border border-brand-border shadow-depth-md flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-bright to-brand-deep text-text-primary font-heading font-black text-2xl flex items-center justify-center border-2 border-brand-glow/40 shadow-glow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-heading font-bold text-text-primary">{user?.name}</h3>
            <p className="text-xs font-mono font-bold text-brand-glow">
              {user?.memberId}
            </p>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold bg-brand-primary/20 text-brand-glow border border-brand-primary/30">
              {user?.role}
            </span>
          </div>

          <div className="w-full pt-4 border-t border-white/[0.04] text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-text-secondary">
              <Mail className="w-3.5 h-3.5 text-brand-glow" />
              <span className="truncate">{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Phone className="w-3.5 h-3.5 text-brand-glow" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-text-secondary">
              <Layers className="w-3.5 h-3.5 text-brand-cyan" />
              <span>{user?.vertical?.name || 'No Vertical'}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <BookOpen className="w-3.5 h-3.5 text-brand-glow" />
              <span>{user?.year || '1st Year'} • {user?.branch || 'General'}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Calendar className="w-3.5 h-3.5 text-brand-glow" />
              <span>Joined: {formatDate(user?.joinedAt)}</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 surface-card rounded-3xl p-6 sm:p-8 border border-brand-border shadow-depth-md space-y-6">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-brand-border/30 text-brand-glow">
            <Key className="w-5 h-5" />
            <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-text-primary">
              Change Account Password
            </h3>
          </div>

          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Current Password *
              </label>
              <input
                type="password"
                {...register('currentPassword')}
                className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
              />
              {errors.currentPassword && (
                <p className="text-xs text-status-absent mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                New Password *
              </label>
              <input
                type="password"
                {...register('newPassword')}
                placeholder="Min 8 characters with upper, lower, digit"
                className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
              />
              {errors.newPassword && (
                <p className="text-xs text-status-absent mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-status-absent mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-3d-primary px-6 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
