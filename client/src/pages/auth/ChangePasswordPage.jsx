import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

const changePasswordSchema = z
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

export const ChangePasswordPage = () => {
  useDocumentTitle('Update Password');
  const { user, refreshUser, getDefaultRedirect } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(changePasswordSchema)
  });

  const onSubmit = async (data) => {
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully! Welcome aboard.');
      const updatedUser = await refreshUser();
      navigate(getDefaultRedirect(updatedUser?.role || user?.role));
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="surface-card border border-border-bright rounded-3xl p-6 sm:p-8 shadow-depth-3 space-y-6 backdrop-blur-xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-depth-1">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black font-heading tracking-tight text-text-primary">
          Update Temporary Password
        </h2>
        <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
          For your account security, you are required to set a permanent password on your first login.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            Current / Temporary Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            {...register('currentPassword')}
            placeholder="Enter current password"
            className="input-3d w-full"
          />
          {errors.currentPassword && (
            <p className="text-xs text-rose-400 font-semibold">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            New Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
            placeholder="Min 8 chars, uppercase, lowercase, digit"
            className="input-3d w-full"
          />
          {errors.newPassword && (
            <p className="text-xs text-rose-400 font-semibold">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            Confirm New Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            placeholder="Re-type new password"
            className="input-3d w-full"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-rose-400 font-semibold">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            icon={ShieldCheck}
            className="w-full shadow-btn-3d"
          >
            Set Password & Continue
          </Button>
        </div>
      </form>
    </div>
  );
};
