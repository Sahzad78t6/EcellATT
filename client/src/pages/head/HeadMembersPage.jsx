import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analyticsApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Sparkles } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatPercentage } from '../../utils/formatters';

export const HeadMembersPage = () => {
  useDocumentTitle('Vertical Members Roster');
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
          <p className="font-bold text-text-primary">{row.name}</p>
          <p className="text-xs text-text-muted">{row.email}</p>
        </div>
      )
    },
    {
      title: 'Member ID',
      key: 'memberId',
      render: (row) => (
        <span className="font-mono font-bold text-xs bg-surface-2 text-brand-glow px-2.5 py-0.5 rounded-md border border-brand-border/40">
          {row.memberId}
        </span>
      )
    },
    {
      title: 'Role',
      key: 'role',
      render: (row) => (
        <span className="text-xs font-semibold text-brand-bright">
          {row.role || 'MEMBER'}
        </span>
      )
    },
    {
      title: 'Eligible Sessions',
      key: 'eligibleCount',
      render: (row) => (
        <span className="text-xs font-mono font-medium text-text-secondary">
          {row.eligibleCount}
        </span>
      )
    },
    {
      title: 'Attended',
      key: 'attendedCount',
      render: (row) => (
        <span className="text-xs font-mono font-bold text-status-present">
          {row.attendedCount}
        </span>
      )
    },
    {
      title: 'Missed',
      key: 'absentCount',
      render: (row) => (
        <span className="text-xs font-mono font-bold text-status-absent">
          {row.absentCount}
        </span>
      )
    },
    {
      title: 'Attendance %',
      key: 'percentage',
      render: (row) => (
        <span
          className={`text-sm font-mono font-extrabold ${
            row.isAtRisk ? 'text-status-absent' : 'text-brand-glow'
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
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="pb-2 border-b border-white/[0.06]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Team Attendance Oversight</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
          Vertical Members Roster
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
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
