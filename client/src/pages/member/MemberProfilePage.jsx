import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Shield,
  Layers,
  Calendar,
  Key,
  Mail,
  Phone,
  BookOpen,
  Sparkles,
  Pencil,
  Check,
  X,
  Loader2
} from 'lucide-react';
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

const getRoleHeading = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'Admin Profile & Settings';
    case 'LEAD':
      return 'Lead Profile & Settings';
    case 'SECRETARY':
      return 'Secretary Profile & Settings';
    case 'MEMBER':
    default:
      return 'Member Profile & Settings';
  }
};

export const MemberProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const roleHeading = getRoleHeading(user?.role);
  useDocumentTitle(roleHeading);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    year: '',
    branch: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        year: user.year || '',
        branch: user.branch || ''
      });
    }
  }, [user]);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      await authApi.updateMe({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        year: profileForm.year.trim(),
        branch: profileForm.branch.trim()
      });
      await refreshUser();
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        year: user.year || '',
        branch: user.branch || ''
      });
    }
    setIsEditing(false);
  };

  // Password Form State
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
      {/* Header */}
      <div className="pb-2 border-b border-border-subtle">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Account Security & Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
          {roleHeading}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          View and edit your personal details, and update your account password.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card (View or Edit Mode) */}
        <div className="md:col-span-1 surface-card rounded-3xl p-6 border border-brand-border shadow-depth-md flex flex-col space-y-4">
          {!isEditing ? (
            /* View Mode */
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-full flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-ice bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/40 transition shadow-sm"
                  title="Edit Profile Details"
                >
                  <Pencil className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Edit Details</span>
                </button>
              </div>

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

              <div className="w-full pt-4 border-t border-border-subtle text-left space-y-3 text-xs">
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <Mail className="w-4 h-4 text-brand-glow shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <Phone className="w-4 h-4 text-brand-glow shrink-0" />
                  <span>{user?.phone || <span className="text-text-muted italic">No phone set</span>}</span>
                </div>
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <Layers className="w-4 h-4 text-brand-cyan shrink-0" />
                  <span>{user?.vertical?.name || 'No Vertical Assigned'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <BookOpen className="w-4 h-4 text-brand-glow shrink-0" />
                  <span>
                    {(user?.year || '1st Year')} • {(user?.branch || 'General')}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <Calendar className="w-4 h-4 text-brand-glow shrink-0" />
                  <span>Joined: {formatDate(user?.joinedAt)}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <div className="flex items-center gap-2 text-brand-cyan">
                  <Pencil className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    Edit Profile
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Read-Only Badges */}
              <div className="p-2.5 rounded-xl bg-surface-2/60 border border-border-subtle space-y-1 text-[11px]">
                <div className="flex justify-between items-center text-text-muted">
                  <span>Member ID:</span>
                  <span className="font-mono font-bold text-brand-glow">{user?.memberId}</span>
                </div>
                <div className="flex justify-between items-center text-text-muted">
                  <span>Role:</span>
                  <span className="font-semibold text-brand-ice">{user?.role}</span>
                </div>
                <div className="flex justify-between items-center text-text-muted">
                  <span>Email:</span>
                  <span className="truncate max-w-[140px] text-text-secondary">{user?.email}</span>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileInputChange}
                  required
                  className="input-3d w-full px-3 py-2 text-xs rounded-xl"
                  placeholder="Enter full name"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileInputChange}
                  className="input-3d w-full px-3 py-2 text-xs rounded-xl"
                  placeholder="e.g. 9876543210"
                />
              </div>

              {/* Year Field */}
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Year / Academic Year
                </label>
                <input
                  type="text"
                  name="year"
                  value={profileForm.year}
                  onChange={handleProfileInputChange}
                  className="input-3d w-full px-3 py-2 text-xs rounded-xl"
                  placeholder="e.g. 1st Year, 2nd Year, III, IV"
                />
              </div>

              {/* Branch Field */}
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Branch / Specialization
                </label>
                <input
                  type="text"
                  name="branch"
                  value={profileForm.branch}
                  onChange={handleProfileInputChange}
                  className="input-3d w-full px-3 py-2 text-xs rounded-xl"
                  placeholder="e.g. CSE, ECE, Mechanical"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="btn-3d-primary flex-1 py-2 rounded-xl text-xs font-bold disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isUpdatingProfile}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary bg-surface-2 hover:bg-surface-3 border border-border-subtle transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 surface-card rounded-3xl p-6 sm:p-8 border border-brand-border shadow-depth-md space-y-6">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-border-subtle text-brand-glow">
            <Key className="w-5 h-5 text-brand-cyan" />
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
                placeholder="Enter current password"
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
                placeholder="Repeat new password"
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

export default MemberProfilePage;
