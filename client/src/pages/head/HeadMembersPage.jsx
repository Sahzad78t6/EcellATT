import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analyticsApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatPercentage } from '../../utils/formatters';

export const HeadMembersPage = () => {
  const [search, setSearch] = useState('');

  const { data: summaryRes, isLoading } = useQuery({
    queryKey: ['vertical-summary'],
    queryFn: () => analyticsApi.getVerticalSummary()
  });
  const memberSummary = (summaryRes?.data?.memberSummary || []).filter(
    (m) => !m.role || m.role === 'MEMBER'
  );

  const filtered = memberSummary.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Member',
      key: 'name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
        </div>
      )
    },
    {
      title: 'Member ID',
      key: 'memberId',
      render: (row) => (
        <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
          {row.memberId}
        </span>
      )
    },
    {
      title: 'Role',
      key: 'role',
      render: (row) => (
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          {row.role}
        </span>
      )
    },
    {
      title: 'Eligible Sessions',
      key: 'eligibleCount',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.eligibleCount}
        </span>
      )
    },
    {
      title: 'Attended',
      key: 'attendedCount',
      render: (row) => (
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {row.attendedCount}
        </span>
      )
    },
    {
      title: 'Missed',
      key: 'absentCount',
      render: (row) => (
        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
          {row.absentCount}
        </span>
      )
    },
    {
      title: 'Attendance %',
      key: 'percentage',
      render: (row) => (
        <span
          className={`text-sm font-extrabold ${
            row.isAtRisk ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {formatPercentage(row.percentage)}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (row) => (
        <StatusBadge status={row.isAtRisk ? 'AT RISK' : 'GOOD'} />
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Vertical Members Roster
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Attendance tracking and performance monitoring for members in your vertical.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search vertical members..."
      />
    </div>
  );
};
