import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../api/auditApi';
import { DataTable } from '../../components/common/DataTable';
import { Eye, X, Sparkles, Shield } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateTime } from '../../utils/formatters';

export const AuditLogsPage = () => {
  useDocumentTitle('Audit Trail');
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const { data: logsRes, isLoading } = useQuery({
    queryKey: ['audit-logs', page, actionFilter, entityTypeFilter],
    queryFn: () =>
      auditApi.list({
        page,
        limit: 20,
        action: actionFilter,
        entityType: entityTypeFilter
      })
  });
  const { logs = [], pagination = { page: 1, totalPages: 1, total: 0 } } =
    logsRes?.data || {};

  const columns = [
    {
      title: 'Actor',
      key: 'actor',
      render: (row) => (
        <div>
          <p className="font-bold text-text-primary">
            {row.actor?.name || 'System / Auto'}
          </p>
          <p className="text-xs text-text-muted font-mono">
            {row.actor?.role ? `${row.actor.role} • ` : ''}IP: {row.ip || '127.0.0.1'}
          </p>
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (row) => (
        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-brand-primary/15 text-brand-glow border border-brand-border/40">
          {row.action}
        </span>
      )
    },
    {
      title: 'Entity',
      key: 'entityType',
      render: (row) => (
        <span className="text-xs font-semibold text-text-secondary">
          {row.entityType} ({row.entityId ? row.entityId.substring(0, 8) : 'N/A'})
        </span>
      )
    },
    {
      title: 'Reason / Summary',
      key: 'reason',
      render: (row) => (
        <p className="text-xs text-text-muted max-w-sm truncate">
          {row.reason || '—'}
        </p>
      )
    },
    {
      title: 'Timestamp',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs text-text-muted">
          {formatDateTime(row.createdAt)}
        </span>
      )
    },
    {
      title: 'Payload',
      key: 'details',
      render: (row) =>
        row.before || row.after ? (
          <button
            onClick={() => setSelectedLog(row)}
            className="p-1.5 text-text-muted hover:text-brand-glow rounded-lg hover:bg-surface-2 transition"
            title="View Before / After Payload"
            aria-label="View Before / After Payload"
          >
            <Eye className="w-4 h-4" />
          </button>
        ) : null
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="pb-2 border-b border-white/[0.06]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Immutable Audit Compliance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
          System Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Complete immutable log of all administrative actions, user updates, attendance overrides, and system events.
        </p>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 surface-card rounded-2xl border border-brand-border shadow-depth-sm">
        <div>
          <label className="block text-[11px] font-bold text-text-muted mb-1 uppercase tracking-wider">
            Filter Action
          </label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="input-3d text-xs font-semibold rounded-xl px-3 py-2 text-text-primary cursor-pointer w-full"
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="ATTENDANCE_OVERRIDE">ATTENDANCE_OVERRIDE</option>
            <option value="PASSWORD_RESET">PASSWORD_RESET</option>
            <option value="BULK_IMPORT">BULK_IMPORT</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-text-muted mb-1 uppercase tracking-wider">
            Filter Entity Type
          </label>
          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="input-3d text-xs font-semibold rounded-xl px-3 py-2 text-text-primary cursor-pointer w-full"
          >
            <option value="">All Entity Types</option>
            <option value="User">User</option>
            <option value="Event">Event</option>
            <option value="Attendance">Attendance</option>
            <option value="Vertical">Vertical</option>
            <option value="Settings">Settings</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* ================= MODAL: AUDIT PAYLOAD DIFF ================= */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md animate-fade-in">
          <div className="surface-card w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/30">
              <div>
                <h3 className="text-lg font-heading font-bold text-text-primary">
                  Audit Snapshot Details
                </h3>
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  {selectedLog.action} on {selectedLog.entityType} ({selectedLog.entityId})
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedLog.reason && (
              <div className="p-3.5 bg-brand-primary/10 rounded-xl text-xs text-brand-glow border border-brand-primary/20">
                <strong className="text-text-primary">Reason / Notes:</strong> {selectedLog.reason}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-text-muted mb-1">State Before</h4>
                <pre className="p-3 bg-surface-1 text-[11px] font-mono rounded-xl border border-brand-border/40 overflow-x-auto max-h-60 text-text-secondary">
                  {JSON.stringify(selectedLog.before, null, 2) || 'null'}
                </pre>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-text-muted mb-1">State After</h4>
                <pre className="p-3 bg-surface-1 text-[11px] font-mono rounded-xl border border-brand-border/40 overflow-x-auto max-h-60 text-brand-ice">
                  {JSON.stringify(selectedLog.after, null, 2) || 'null'}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="btn-3d-secondary w-full py-2.5 rounded-xl text-xs font-bold"
            >
              Close Snapshot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
