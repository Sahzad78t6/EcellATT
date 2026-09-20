import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendanceApi';
import { useAuth } from '../../hooks/useAuth';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const MemberHistoryPage = () => {
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
          <p className="font-bold text-slate-900 dark:text-white">{row.event?.name}</p>
          <p className="text-xs text-slate-400">{row.event?.type} • {row.event?.venue}</p>
        </div>
      )
    },
    {
      title: 'Event Date',
      key: 'date',
      render: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {formatDate(row.event?.date)}
        </span>
      )
    },
    {
      title: 'Session',
      key: 'session',
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
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
        <div className="text-xs text-slate-400">
          <p>{formatDateTime(row.markedAt)}</p>
          {row.remarks && <p className="italic text-[11px] text-slate-400 truncate max-w-xs">{row.remarks}</p>}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Attendance History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete chronological record of all events attended and missed.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-500 px-2">Status Filter:</span>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100"
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
