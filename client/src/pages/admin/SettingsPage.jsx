import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../api/settingsApi';
import { useForm } from 'react-hook-form';
import { Sliders, Save, Bell, Clock, ShieldCheck, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
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
    return <div className="p-8 text-center text-slate-400">Loading system settings...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          System Settings & Thresholds
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure attendance criteria, email alert schedules, automated closing buffers, and active session defaults.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Attendance Thresholds */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Attendance Evaluation Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Low-Attendance Threshold (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                {...register('lowAttendanceThreshold', { required: true })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Members below this percentage trigger warning flags and alerts (default: 75%).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Minimum Eligible Events
              </label>
              <input
                type="number"
                min="1"
                {...register('minEventsForAlert', { required: true })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Minimum closed events required before alert dispatch starts (default: 3).
              </p>
            </div>
          </div>
        </div>

        {/* Email Alert Configuration */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
            <Bell className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Email Notifications & Cooldown
            </h3>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="emailAlertsEnabled"
              {...register('emailAlertsEnabled')}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
            />
            <div>
              <label
                htmlFor="emailAlertsEnabled"
                className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                Enable Automated Low-Attendance Email Warnings
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                When enabled, closing an event automatically evaluates at-risk members and dispatches email alerts.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Alert Cooldown Period (Days)
            </label>
            <input
              type="number"
              min="0"
              {...register('alertCooldownDays', { required: true })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Prevents spamming the same member within this number of days (default: 7).
            </p>
          </div>
        </div>

        {/* Automation & Session Defaults */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Automation & Academic Session
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Auto-Close Buffer (Minutes)
              </label>
              <input
                type="number"
                min="0"
                {...register('autoCloseBufferMinutes', { required: true })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Additional grace period after event end time before auto-closure (default: 30 mins).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Current Academic Session
              </label>
              <input
                type="text"
                {...register('currentSession', { required: true })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Default session tag for new events and analytics (e.g. 2026-2027).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Server Timezone
            </label>
            <input
              type="text"
              {...register('timezone')}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
