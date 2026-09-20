import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../../api/reportApi';
import { verticalApi } from '../../api/verticalApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FileSpreadsheet, Download, FileText, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportsPage = () => {
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
      render: (r) => <span className="font-mono font-bold text-xs">{r.memberId}</span>
    },
    { title: 'Full Name', key: 'name' },
    { title: 'Email', key: 'email' },
    { title: 'Vertical', key: 'vertical' },
    { title: 'Eligible', key: 'eligibleEvents' },
    { title: 'Attended', key: 'attendedEvents' },
    { title: 'Missed', key: 'missedEvents' },
    {
      title: 'Percentage',
      key: 'attendancePercentage',
      render: (r) => <span className="font-bold text-indigo-600 dark:text-indigo-400">{r.attendancePercentage}</span>
    },
    {
      title: 'Status',
      key: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  const eventColumns = [
    { title: 'Event Name', key: 'eventName' },
    { title: 'Type', key: 'type' },
    { title: 'Date', key: 'date' },
    { title: 'Target Scope', key: 'targetScope' },
    { title: 'Present', key: 'presentCount' },
    { title: 'Absent', key: 'absentCount' },
    { title: 'Total Marked', key: 'totalMarked' },
    {
      title: 'Attendance %',
      key: 'attendancePercentage',
      render: (r) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{r.attendancePercentage}</span>
    }
  ];

  const verticalColumns = [
    { title: 'Vertical Name', key: 'verticalName' },
    { title: 'Total Members', key: 'totalMembers' },
    { title: 'Records Count', key: 'totalAttendanceRecords' },
    { title: 'Total Present', key: 'totalPresent' },
    { title: 'Total Absent', key: 'totalAbsent' },
    {
      title: 'Average %',
      key: 'averagePercentage',
      render: (r) => <span className="font-bold text-indigo-600 dark:text-indigo-400">{r.averagePercentage}</span>
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Reports & Data Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate detailed audit-ready attendance rosters and export to CSV or Excel (.xlsx).
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs sm:text-sm font-bold transition disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="space-y-4">
        {/* Report Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Member-Wise Report
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'events'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Event-Wise Report
          </button>
          <button
            onClick={() => setActiveTab('verticals')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'verticals'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Vertical-Wise Report
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Academic Session</label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
            >
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>

          {activeTab !== 'verticals' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Vertical Scope</label>
              <select
                value={verticalId}
                onChange={(e) => setVerticalId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
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
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Member Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
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
