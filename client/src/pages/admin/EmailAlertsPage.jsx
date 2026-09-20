import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailLogApi } from '../../api/emailLogApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Mail, Send, RotateCw, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const EmailAlertsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [forceCooldown, setForceCooldown] = useState(false);

  // Fetch Email Logs
  const { data: logsRes, isLoading } = useQuery({
    queryKey: ['email-logs', page, statusFilter],
    queryFn: () =>
      emailLogApi.list({
        page,
        limit: 20,
        status: statusFilter
      })
  });
  const { logs = [], pagination = { page: 1, totalPages: 1, total: 0 } } =
    logsRes?.data || {};

  // Mutation: Send alerts now to all at-risk members
  const sendNowMutation = useMutation({
    mutationFn: (data) => emailLogApi.sendAlertsNow(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
      setSendModalOpen(false);
      toast.success(res.message || 'Alert dispatch initiated successfully');
    },
    onError: (err) => toast.error(err.message || 'Failed to dispatch alerts')
  });

  // Mutation: Retry individual email
  const retryMutation = useMutation({
    mutationFn: (id) => emailLogApi.retry(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
      toast.success(res.message || 'Email retried successfully');
    },
    onError: (err) => toast.error(err.message || 'Failed to retry email')
  });

  const columns = [
    {
      title: 'Recipient Member',
      key: 'member',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.member?.name || 'Member'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {row.toEmail} {row.member?.memberId ? `(${row.member.memberId})` : ''}
          </p>
        </div>
      )
    },
    {
      title: 'Type',
      key: 'type',
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.type}
        </span>
      )
    },
    {
      title: 'Event / Reason',
      key: 'event',
      render: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {row.event?.name || 'Attendance Threshold Review'}
        </span>
      )
    },
    {
      title: 'Attendance %',
      key: 'attendancePercent',
      render: (row) => (
        <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
          {row.attendancePercent !== null && row.attendancePercent !== undefined
            ? `${row.attendancePercent}%`
            : '—'}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (row) => (
        <div>
          <StatusBadge status={row.status} />
          {row.error && (
            <p className="text-[10px] text-rose-500 mt-1 max-w-xs truncate" title={row.error}>
              {row.error}
            </p>
          )}
        </div>
      )
    },
    {
      title: 'Sent At',
      key: 'sentAt',
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDateTime(row.sentAt)}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (row) =>
        row.status === 'FAILED' ? (
          <button
            onClick={() => retryMutation.mutate(row._id)}
            disabled={retryMutation.isPending}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 rounded-lg transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        ) : null
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Email Alerts & Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track automated low-attendance warning emails, welcome credentials, and retry failed dispatches.
          </p>
        </div>

        <button
          onClick={() => setSendModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20 transition"
        >
          <Send className="w-4 h-4" />
          <span>Send Alert Now (All At-Risk)</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-500 px-2">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Logs</option>
          <option value="SENT">SENT Only</option>
          <option value="FAILED">FAILED Only</option>
          <option value="SKIPPED">SKIPPED (Cooldown) Only</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* ================= MODAL: SEND ALERT NOW ================= */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Dispatch Low-Attendance Alerts
              </h3>
              <button
                onClick={() => setSendModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will evaluate attendance percentages across all active members in the current session. An email alert will be sent to every member currently below the threshold.
            </p>

            <div className="flex items-center space-x-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <input
                type="checkbox"
                id="forceCooldown"
                checked={forceCooldown}
                onChange={(e) => setForceCooldown(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 dark:border-slate-700"
              />
              <label
                htmlFor="forceCooldown"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Bypass 7-day alert cooldown period
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSendModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => sendNowMutation.mutate({ forceCooldown })}
                disabled={sendNowMutation.isPending}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition disabled:opacity-50 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{sendNowMutation.isPending ? 'Sending Alerts...' : 'Confirm & Dispatch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
