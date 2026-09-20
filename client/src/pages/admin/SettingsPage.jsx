import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../api/settingsApi';
import { useForm } from 'react-hook-form';
import { Save, Bell, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  useDocumentTitle('System Settings');
  const queryClient = useQueryClient();

  const { data: settingsRes, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get()
  });
  const settings = settingsRes?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm();

  useEffect(() => {
    if (settings) {
      reset({
        lowAttendanceThreshold: settings.lowAttendanceThreshold,
        minEventsForAlert: settings.minEventsForAlert,
        alertCooldownDays: settings.alertCooldownDays,
        autoCloseBufferMinutes: settings.autoCloseBufferMinutes,
        emailAlertsEnabled: settings.emailAlertsEnabled,
        currentSession: settings.currentSession,
        timezone: settings.timezone
      });
    }
  }, [settings, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) =>
      settingsApi.update({
        ...data,
        lowAttendanceThreshold: Number(data.lowAttendanceThreshold),
        minEventsForAlert: Number(data.minEventsForAlert),
        alertCooldownDays: Number(data.alertCooldownDays),
        autoCloseBufferMinutes: Number(data.autoCloseBufferMinutes)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated and audit logged');
    },
    onError: (err) => toast.error(err.message || 'Failed to update settings')
  });

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted text-sm">Loading system settings...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in pb-12">
      <div className="pb-2 border-b border-white/[0.06]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>System Governance & Policies</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
          System Settings & Thresholds
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Configure attendance criteria, email alert schedules, automated closing buffers, and active session defaults.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
        className="surface-card rounded-3xl p-6 sm:p-8 border border-brand-border shadow-depth-md space-y-6"
      >
        {/* Attendance Thresholds */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-brand-border/30 text-brand-glow">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-text-primary">
              Attendance Evaluation Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Low-Attendance Threshold (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                {...register('lowAttendanceThreshold', { required: true })}
                className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl font-bold font-mono"
              />
              <p className="text-[11px] text-text-muted mt-1">
                Members below this percentage trigger warning flags and alerts (default: 75%).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Minimum Eligible Events
              </label>
              <input
                type="number"
                min="1"
                {...register('minEventsForAlert', { required: true })}
                className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl font-bold font-mono"
              />
              <p className="text-[11px] text-text-muted mt-1">
                Minimum closed events required before alert dispatch starts (default: 3).
              </p>
            </div>
          </div>
        </div>

        {/* Email Alert Configuration */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-brand-border/30 text-brand-glow">
            <Bell className="w-5 h-5" />
            <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-text-primary">
              Email Notifications & Cooldown
            </h3>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-surface-1 border border-brand-border/40">
            <input
              type="checkbox"
              id="emailAlertsEnabled"
              {...register('emailAlertsEnabled')}
              className="w-5 h-5 rounded text-brand-primary focus:ring-brand-glow bg-surface-2 border-brand-border/40"
            />
            <div>
              <label
                htmlFor="emailAlertsEnabled"
                className="text-sm font-bold text-text-primary cursor-pointer"
              >
                Enable Automated Low-Attendance Email Warnings
              </label>
              <p className="text-xs text-text-muted mt-0.5">
                When enabled, closing an event automatically evaluates at-risk members and dispatches email alerts.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Alert Cooldown Period (Days)
            </label>
            <input
              type="number"
              min="0"
              {...register('alertCooldownDays', { required: true })}
              className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl font-bold font-mono"
            />
            <p className="text-[11px] text-text-muted mt-1">
              Prevents spamming the same member within this number of days (default: 7).
            </p>
          </div>
        </div>

        {/* Automation & Session Defaults */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-brand-border/30 text-brand-glow">
            <Clock className="w-5 h-5" />
            <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-text-primary">
              Automation & Academic Session
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Auto-Close Buffer (Minutes)
              </label>
              <input
                type="number"
                min="0"
                {...register('autoCloseBufferMinutes', { required: true })}
                className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl font-bold font-mono"
              />
              <p className="text-[11px] text-text-muted mt-1">
                Grace period after event end time before auto-closure (default: 30 mins).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Current Academic Session
              </label>
              <input
                type="text"
                {...register('currentSession', { required: true })}
                className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl font-bold"
              />
              <p className="text-[11px] text-text-muted mt-1">
                Default session tag for new events and analytics (e.g. 2026-2027).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Server Timezone
            </label>
            <input
              type="text"
              {...register('timezone')}
              className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-brand-border/30 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-3d-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
