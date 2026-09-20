import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendanceApi';
import { useAuth } from '../../hooks/useAuth';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Sparkles } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const MemberHistoryPage = () => {
  useDocumentTitle('Attendance History');
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: historyRes, isLoading } = useQuery({
    queryKey: ['member-history', user?._id, page, statusFilter],
    queryFn: () =>
      attendanceApi.listRecords({
        memberId: user?._id,
        status: statusFilter,
        page,
        limit: 15
      }),
    enabled: !!user?._id
  });

  const { records = [], pagination = { page: 1, totalPages: 1, total: 0 } } =
    historyRes?.data || {};

  const columns = [
    {
      title: 'Event Name',
      key: 'event',
      render: (row) => (
        <div>
          <p className="font-bold text-text-primary">{row.event?.name}</p>
          <p className="text-xs text-text-muted">{row.event?.type} • {row.event?.venue || 'Online'}</p>
        </div>
      )
    },
    {
      title: 'Event Date',
      key: 'date',
      render: (row) => (
        <span className="text-xs text-text-secondary font-medium">
          {formatDate(row.event?.date)}
        </span>
      )
    },
    {
      title: 'Session',
      key: 'session',
      render: (row) => (
        <span className="text-xs text-text-muted font-mono">
          {row.event?.session || '2026-2027'}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      title: 'Marked At',
      key: 'markedAt',
      render: (row) => (
        <div className="text-xs text-text-muted">
          <p>{formatDateTime(row.markedAt)}</p>
          {row.remarks && <p className="italic text-[11px] text-text-secondary truncate max-w-xs">{row.remarks}</p>}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="pb-2 border-b border-white/[0.06]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personal Activity Record</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
          Attendance History
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Complete chronological record of all events attended and missed.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-2 surface-card p-3 rounded-2xl border border-brand-border shadow-depth-sm">
        <span className="text-xs font-bold text-text-muted px-2">Status Filter:</span>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-3d text-xs font-semibold rounded-xl px-3 py-1.5 text-text-primary cursor-pointer"
        >
          <option value="">All Records</option>
          <option value="PRESENT">Present Only</option>
          <option value="ABSENT">Absent Only</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={records}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle="No attendance records found"
      />
    </div>
  );
};
