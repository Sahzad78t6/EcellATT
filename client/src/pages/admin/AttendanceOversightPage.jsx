import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendanceApi';
import { eventApi } from '../../api/eventApi';
import { verticalApi } from '../../api/verticalApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Edit3, CheckCircle2, XCircle, ShieldAlert, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const AttendanceOversightPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [eventId, setEventId] = useState('');
  const [verticalId, setVerticalId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [editRecord, setEditRecord] = useState(null);

  // Fetch Events & Verticals for filters
  const { data: eventsRes } = useQuery({
    queryKey: ['events-dropdown'],
    queryFn: () => eventApi.list({ limit: 100 })
  });
  const events = eventsRes?.data?.events || [];

  const { data: verticalsRes } = useQuery({
    queryKey: ['verticals'],
    queryFn: () => verticalApi.list()
  });
  const verticals = verticalsRes?.data || [];

  // Fetch Attendance Records
  const { data: recordsRes, isLoading } = useQuery({
    queryKey: ['attendance-records', page, eventId, verticalId, statusFilter],
    queryFn: () =>
      attendanceApi.listRecords({
        page,
        limit: 20,
        eventId,
        verticalId,
        status: statusFilter
      })
  });
  const { records = [], pagination = { page: 1, totalPages: 1, total: 0 } } =
    recordsRes?.data || {};

  // Form for Admin Edit
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  const editMutation = useMutation({
    mutationFn: ({ id, data }) => attendanceApi.adminEdit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      setEditRecord(null);
      reset();
      toast.success('Attendance record updated and audit logged');
    },
    onError: (err) => toast.error(err.message || 'Failed to update record')
  });

  const openEditModal = (rec) => {
    setEditRecord(rec);
    setValue('status', rec.status);
    setValue('reason', '');
    setValue('remarks', rec.remarks || '');
  };

  const columns = [
    {
      title: 'Member',
      key: 'member',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.member?.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {row.member?.memberId} • {row.vertical?.name || 'Unassigned'}
          </p>
        </div>
      )
    },
    {
      title: 'Event',
      key: 'event',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{row.event?.name}</p>
          <p className="text-[11px] text-slate-400">{row.event?.type} • {row.event?.session}</p>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      title: 'Source & Marking Info',
      key: 'source',
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {row.source}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {formatDateTime(row.markedAt)}
            {row.markedBy && ` by ${row.markedBy.name}`}
          </p>
          {row.remarks && (
            <p className="text-[11px] text-slate-400 italic truncate max-w-xs">{row.remarks}</p>
          )}
        </div>
      )
    },
    {
      title: 'Override',
      key: 'actions',
      render: (row) => (
        <button
          onClick={() => openEditModal(row)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Attendance Oversight & Override
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review complete organization-wide attendance records and make audited administrative adjustments.
        </p>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter by Event</label>
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
          >
            <option value="">All Events</option>
            {events.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name} ({e.session})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter by Vertical</label>
          <select
            value={verticalId}
            onChange={(e) => {
              setVerticalId(e.target.value);
              setPage(1);
            }}
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

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Attendance Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={records}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* ================= MODAL: ADMIN EDIT ATTENDANCE ================= */}
      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Audited Attendance Override
                </h3>
              </div>
              <button
                onClick={() => setEditRecord(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <p><strong>Member:</strong> {editRecord.member?.name} ({editRecord.member?.memberId})</p>
              <p><strong>Event:</strong> {editRecord.event?.name}</p>
              <p><strong>Current Status:</strong> <StatusBadge status={editRecord.status} /></p>
            </div>

            <form
              onSubmit={handleSubmit((data) =>
                editMutation.mutate({ id: editRecord._id, data })
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  New Status *
                </label>
                <select
                  {...register('status', { required: true })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Reason for Override * (Mandatory for Audit Trail)
                </label>
                <textarea
                  rows={3}
                  {...register('reason', {
                    required: 'A detailed reason is mandatory for audit compliance',
                    minLength: { value: 5, message: 'Reason must be at least 5 characters' }
                  })}
                  placeholder="e.g. Student was attending university exam, permission granted by Faculty Advisor."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
                {errors.reason && (
                  <p className="text-xs text-rose-600 mt-1">{errors.reason.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Public Remarks
                </label>
                <input
                  type="text"
                  {...register('remarks')}
                  placeholder="Optional remarks visible to user"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording Audit...' : 'Save & Log Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
