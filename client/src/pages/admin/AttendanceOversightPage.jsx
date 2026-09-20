import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendanceApi';
import { eventApi } from '../../api/eventApi';
import { verticalApi } from '../../api/verticalApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Edit3, ShieldAlert, X, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const AttendanceOversightPage = () => {
  useDocumentTitle('Attendance Oversight');
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
          <p className="font-bold text-text-primary">{row.member?.name}</p>
          <p className="text-xs text-text-muted font-mono">
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
          <p className="font-semibold text-text-primary">{row.event?.name}</p>
          <p className="text-[11px] text-text-muted">{row.event?.type} • {row.event?.session}</p>
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
          <span className="font-mono font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-surface-2 text-brand-glow border border-brand-border/30">
            {row.source}
          </span>
          <p className="text-[11px] text-text-muted mt-1">
            {formatDateTime(row.markedAt)}
            {row.markedBy && ` by ${row.markedBy.name}`}
          </p>
          {row.remarks && (
            <p className="text-[11px] text-text-secondary italic truncate max-w-xs">{row.remarks}</p>
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
          className="btn-3d-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
        >
          <Edit3 className="w-3.5 h-3.5 text-brand-glow" />
          <span>Edit</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Attendance Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
            Attendance Oversight & Override
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Review complete organization-wide attendance records and make audited administrative adjustments.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 surface-card rounded-2xl border border-brand-border shadow-depth-sm">
        <div>
          <label className="block text-[11px] font-bold text-text-muted mb-1 uppercase tracking-wider">
            Filter by Event
          </label>
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setPage(1);
            }}
            className="input-3d text-xs font-semibold rounded-xl px-3 py-2 text-text-primary cursor-pointer w-full"
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
          <label className="block text-[11px] font-bold text-text-muted mb-1 uppercase tracking-wider">
            Filter by Vertical
          </label>
          <select
            value={verticalId}
            onChange={(e) => {
              setVerticalId(e.target.value);
              setPage(1);
            }}
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

        <div>
          <label className="block text-[11px] font-bold text-text-muted mb-1 uppercase tracking-wider">
            Attendance Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input-3d text-xs font-semibold rounded-xl px-3 py-2 text-text-primary cursor-pointer w-full"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md animate-fade-in">
          <div className="surface-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/30">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-status-warning" />
                <h3 className="text-lg font-heading font-bold text-text-primary">
                  Audited Attendance Override
                </h3>
              </div>
              <button
                onClick={() => setEditRecord(null)}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-surface-1 rounded-xl text-xs space-y-1.5 border border-brand-border/40">
              <p><strong className="text-text-secondary">Member:</strong> <span className="text-text-primary font-semibold">{editRecord.member?.name}</span> <span className="font-mono text-text-muted">({editRecord.member?.memberId})</span></p>
              <p><strong className="text-text-secondary">Event:</strong> <span className="text-text-primary font-semibold">{editRecord.event?.name}</span></p>
              <div className="flex items-center gap-2 pt-0.5">
                <strong className="text-text-secondary">Current Status:</strong>
                <StatusBadge status={editRecord.status} />
              </div>
            </div>

            <form
              onSubmit={handleSubmit((data) =>
                editMutation.mutate({ id: editRecord._id, data })
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  New Status *
                </label>
                <select
                  {...register('status', { required: true })}
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl font-bold cursor-pointer"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Reason for Override * (Mandatory for Audit Trail)
                </label>
                <textarea
                  rows={3}
                  {...register('reason', {
                    required: 'A detailed reason is mandatory for audit compliance',
                    minLength: { value: 5, message: 'Reason must be at least 5 characters' }
                  })}
                  placeholder="e.g. Student was attending university exam, permission granted by Faculty Advisor."
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                />
                {errors.reason && (
                  <p className="text-xs text-status-absent mt-1">{errors.reason.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Public Remarks
                </label>
                <input
                  type="text"
                  {...register('remarks')}
                  placeholder="Optional remarks visible to user"
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-border/30">
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
                  className="btn-3d-secondary px-4 py-2.5 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
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
