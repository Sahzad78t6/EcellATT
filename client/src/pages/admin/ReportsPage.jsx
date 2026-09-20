import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../../api/reportApi';
import { verticalApi } from '../../api/verticalApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FileSpreadsheet, Download, FileText, Sparkles } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export const ReportsPage = () => {
  useDocumentTitle('Reports & Export');
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'events', 'verticals'
  const [session, setSession] = useState('2026-2027');
  const [verticalId, setVerticalId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch Verticals
  const { data: verticalsRes } = useQuery({
    queryKey: ['verticals'],
    queryFn: () => verticalApi.list()
  });
  const verticals = verticalsRes?.data || [];

  // 1. Member-wise Report Query
  const { data: memberReportRes, isLoading: loadingMembers } = useQuery({
    queryKey: ['report-members', session, verticalId, statusFilter],
    queryFn: () => reportApi.getMemberWise({ session, verticalId, statusFilter }),
    enabled: activeTab === 'members'
  });
  const memberReport = memberReportRes?.data || [];

  // 2. Event-wise Report Query
  const { data: eventReportRes, isLoading: loadingEvents } = useQuery({
    queryKey: ['report-events', session, verticalId],
    queryFn: () => reportApi.getEventWise({ session, verticalId }),
    enabled: activeTab === 'events'
  });
  const eventReport = eventReportRes?.data || [];

  // 3. Vertical-wise Report Query
  const { data: verticalReportRes, isLoading: loadingVerticals } = useQuery({
    queryKey: ['report-verticals', session],
    queryFn: () => reportApi.getVerticalWise({ session }),
    enabled: activeTab === 'verticals'
  });
  const verticalReport = verticalReportRes?.data || [];

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      let endpoint = '/reports/members';
      let params = { session, verticalId, statusFilter };
      let defaultFilename = `ecell_member_attendance_${session}`;

      if (activeTab === 'events') {
        endpoint = '/reports/events';
        params = { session, verticalId };
        defaultFilename = `ecell_event_attendance_${session}`;
      } else if (activeTab === 'verticals') {
        endpoint = '/reports/verticals';
        params = { session };
        defaultFilename = `ecell_vertical_attendance_${session}`;
      }

      await reportApi.downloadExport(endpoint, params, format, defaultFilename);
      toast.success(`Exported ${format.toUpperCase()} successfully!`);
    } catch (err) {
      toast.error(err.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const memberColumns = [
    {
      title: 'Member ID',
      key: 'memberId',
      render: (r) => <span className="font-mono font-bold text-xs text-brand-glow">{r.memberId}</span>
    },
    {
      title: 'Full Name',
      key: 'name',
      render: (r) => <span className="font-bold text-text-primary">{r.name}</span>
    },
    {
      title: 'Email',
      key: 'email',
      render: (r) => <span className="text-text-muted">{r.email}</span>
    },
    {
      title: 'Vertical',
      key: 'vertical',
      render: (r) => <span className="text-text-secondary">{r.vertical}</span>
    },
    {
      title: 'Eligible',
      key: 'eligibleEvents',
      render: (r) => <span className="font-mono font-medium">{r.eligibleEvents}</span>
    },
    {
      title: 'Attended',
      key: 'attendedEvents',
      render: (r) => <span className="font-mono font-semibold text-status-present">{r.attendedEvents}</span>
    },
    {
      title: 'Missed',
      key: 'missedEvents',
      render: (r) => <span className="font-mono font-semibold text-status-absent">{r.missedEvents}</span>
    },
    {
      title: 'Percentage',
      key: 'attendancePercentage',
      render: (r) => (
        <span className="font-mono font-bold text-brand-glow text-sm">
          {r.attendancePercentage}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  const eventColumns = [
    {
      title: 'Event Name',
      key: 'eventName',
      render: (r) => <span className="font-bold text-text-primary">{r.eventName}</span>
    },
    {
      title: 'Type',
      key: 'type',
      render: (r) => <span className="text-text-secondary">{r.type}</span>
    },
    {
      title: 'Date',
      key: 'date',
      render: (r) => <span className="text-text-muted">{r.date}</span>
    },
    {
      title: 'Target Scope',
      key: 'targetScope',
      render: (r) => <span className="text-text-secondary">{r.targetScope}</span>
    },
    {
      title: 'Present',
      key: 'presentCount',
      render: (r) => <span className="font-mono font-bold text-status-present">{r.presentCount}</span>
    },
    {
      title: 'Absent',
      key: 'absentCount',
      render: (r) => <span className="font-mono font-bold text-status-absent">{r.absentCount}</span>
    },
    {
      title: 'Total Marked',
      key: 'totalMarked',
      render: (r) => <span className="font-mono font-medium text-text-primary">{r.totalMarked}</span>
    },
    {
      title: 'Attendance %',
      key: 'attendancePercentage',
      render: (r) => (
        <span className="font-mono font-bold text-brand-glow text-sm">
          {r.attendancePercentage}
        </span>
      )
    }
  ];

  const verticalColumns = [
    {
      title: 'Vertical Name',
      key: 'verticalName',
      render: (r) => <span className="font-bold text-text-primary">{r.verticalName}</span>
    },
    {
      title: 'Total Members',
      key: 'totalMembers',
      render: (r) => <span className="font-mono">{r.totalMembers}</span>
    },
    {
      title: 'Records Count',
      key: 'totalAttendanceRecords',
      render: (r) => <span className="font-mono">{r.totalAttendanceRecords}</span>
    },
    {
      title: 'Total Present',
      key: 'totalPresent',
      render: (r) => <span className="font-mono font-bold text-status-present">{r.totalPresent}</span>
    },
    {
      title: 'Total Absent',
      key: 'totalAbsent',
      render: (r) => <span className="font-mono font-bold text-status-absent">{r.totalAbsent}</span>
    },
    {
      title: 'Average %',
      key: 'averagePercentage',
      render: (r) => (
        <span className="font-mono font-bold text-brand-glow text-sm">
          {r.averagePercentage}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Attendance Intelligence & Export</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
            Reports & Data Export
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Generate detailed audit-ready attendance rosters and export to CSV or Excel (.xlsx).
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="btn-3d-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={isExporting}
            className="btn-3d-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="space-y-4">
        {/* Report Tabs */}
        <div className="flex items-center space-x-2 border-b border-brand-border/30 overflow-x-auto pb-0.5">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-4 text-xs sm:text-sm font-heading font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'members'
                ? 'border-brand-glow text-brand-glow'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Member-Wise Report
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 px-4 text-xs sm:text-sm font-heading font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'events'
                ? 'border-brand-glow text-brand-glow'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Event-Wise Report
          </button>
          <button
            onClick={() => setActiveTab('verticals')}
            className={`pb-3 px-4 text-xs sm:text-sm font-heading font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'verticals'
                ? 'border-brand-glow text-brand-glow'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Vertical-Wise Report
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 surface-card rounded-2xl border border-brand-border shadow-depth-sm">
          <div>
            <label className="block text-[11px] font-bold text-text-muted mb-1 uppercase tracking-wider">
              Academic Session
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="input-3d text-xs font-semibold rounded-xl px-3 py-2 text-text-primary cursor-pointer w-full"
            >
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>

          {activeTab !== 'verticals' && (
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-1 uppercase tracking-wider">
                Vertical Scope
              </label>
              <select
                value={verticalId}
                onChange={(e) => setVerticalId(e.target.value)}
                className="input-3d text-xs font-semibold rounded-xl px-3 py-2 text-text-primary cursor-pointer w-full"
              >
                <option value="">All Verticals</option>
                {verticals.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-1 uppercase tracking-wider">
                Member Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-3d text-xs font-semibold rounded-xl px-3 py-2 text-text-primary cursor-pointer w-full"
              >
                <option value="ALL">All Members</option>
                <option value="AT_RISK">At Risk (&lt; 75%)</option>
                <option value="GOOD">Good Standing (≥ 75%)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Active Report Table */}
      {activeTab === 'members' && (
        <DataTable
          columns={memberColumns}
          data={memberReport}
          loading={loadingMembers}
          emptyTitle="No member records found"
        />
      )}

      {activeTab === 'events' && (
        <DataTable
          columns={eventColumns}
          data={eventReport}
          loading={loadingEvents}
          emptyTitle="No event records found"
        />
      )}

      {activeTab === 'verticals' && (
        <DataTable
          columns={verticalColumns}
          data={verticalReport}
          loading={loadingVerticals}
          emptyTitle="No vertical records found"
        />
      )}
    </div>
  );
};
