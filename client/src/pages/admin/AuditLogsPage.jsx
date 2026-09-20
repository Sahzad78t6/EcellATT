import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../api/auditApi';
import { DataTable } from '../../components/common/DataTable';
import { FileText, Shield, Eye, X } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const AuditLogsPage = () => {
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
          <p className="font-bold text-slate-900 dark:text-white">
            {row.actor?.name || 'System / Auto'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {row.actor?.role ? `${row.actor.role} • ` : ''}IP: {row.ip || '127.0.0.1'}
          </p>
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (row) => (
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          {row.action}
        </span>
      )
    },
    {
      title: 'Entity',
      key: 'entityType',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.entityType} ({row.entityId ? row.entityId.substring(0, 8) : 'N/A'})
        </span>
      )
    },
    {
      title: 'Reason / Summary',
      key: 'reason',
      render: (row) => (
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm truncate">
          {row.reason || '—'}
        </p>
      )
    },
    {
      title: 'Timestamp',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
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
            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="View Before / After Payload"
          >
            <Eye className="w-4 h-4" />
          </button>
        ) : null
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          System Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete immutable log of all administrative actions, user updates, attendance overrides, and system events.
        </p>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter Action</label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
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
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter Entity Type</label>
          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Audit Snapshot Details
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedLog.action} on {selectedLog.entityType} ({selectedLog.entityId})
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedLog.reason && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200">
                <strong>Reason / Notes:</strong> {selectedLog.reason}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">State Before</h4>
                <pre className="p-3 bg-slate-50 dark:bg-slate-800 text-[11px] font-mono rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto max-h-60 text-slate-800 dark:text-slate-200">
                  {JSON.stringify(selectedLog.before, null, 2) || 'null'}
                </pre>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">State After</h4>
                <pre className="p-3 bg-slate-50 dark:bg-slate-800 text-[11px] font-mono rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto max-h-60 text-slate-800 dark:text-slate-200">
                  {JSON.stringify(selectedLog.after, null, 2) || 'null'}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
