import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailLogApi } from '../../api/emailLogApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Send, RotateCw, X, Sparkles } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const EmailAlertsPage = () => {
  useDocumentTitle('Email Alerts & Logs');
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
          <p className="font-bold text-text-primary">{row.member?.name || 'Member'}</p>
          <p className="text-xs text-text-muted font-mono">
            {row.toEmail} {row.member?.memberId ? `(${row.member.memberId})` : ''}
          </p>
        </div>
      )
    },
    {
      title: 'Type',
      key: 'type',
      render: (row) => (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-surface-2 text-brand-glow border border-brand-border/40">
          {row.type}
        </span>
      )
    },
    {
      title: 'Event / Reason',
      key: 'event',
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {row.event?.name || 'Attendance Threshold Review'}
        </span>
      )
    },
    {
      title: 'Attendance %',
      key: 'attendancePercent',
      render: (row) => (
        <span className="text-xs font-mono font-extrabold text-status-absent">
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
            <p className="text-[10px] text-status-absent mt-1 max-w-xs truncate" title={row.error}>
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
        <span className="text-xs text-text-muted">
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
            className="btn-3d-secondary inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-status-warning"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        ) : null
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Communication & Notifications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
            Email Alerts & Notifications
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Track automated low-attendance warning emails, welcome credentials, and retry failed dispatches.
          </p>
        </div>

        <button
          onClick={() => setSendModalOpen(true)}
          className="btn-3d-danger inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>Send Alert Now (All At-Risk)</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-2 surface-card p-3 rounded-2xl border border-brand-border shadow-depth-sm">
        <span className="text-xs font-bold text-text-muted px-2">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-3d text-xs font-semibold rounded-xl px-3 py-1.5 text-text-primary cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md animate-fade-in">
          <div className="surface-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/30">
              <h3 className="text-lg font-heading font-bold text-text-primary">
                Dispatch Low-Attendance Alerts
              </h3>
              <button
                onClick={() => setSendModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              This will evaluate attendance percentages across all active members in the current session. An email alert will be sent to every member currently below the threshold.
            </p>

            <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-surface-1 border border-brand-border/40">
              <input
                type="checkbox"
                id="forceCooldown"
                checked={forceCooldown}
                onChange={(e) => setForceCooldown(e.target.checked)}
                className="w-4 h-4 rounded text-status-absent focus:ring-status-absent bg-surface-2 border-brand-border/40"
              />
              <label
                htmlFor="forceCooldown"
                className="text-xs font-semibold text-text-secondary cursor-pointer"
              >
                Bypass 7-day alert cooldown period
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-brand-border/30">
              <button
                type="button"
                onClick={() => setSendModalOpen(false)}
                className="btn-3d-secondary px-4 py-2.5 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => sendNowMutation.mutate({ forceCooldown })}
                disabled={sendNowMutation.isPending}
                className="btn-3d-danger px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center space-x-2"
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
