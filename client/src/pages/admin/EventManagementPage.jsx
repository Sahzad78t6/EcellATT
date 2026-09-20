import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../../api/eventApi';
import { verticalApi } from '../../api/verticalApi';
import { EventCard } from '../../components/common/EventCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Calendar, Plus, Filter, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export const EventManagementPage = () => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState('2026-2027');
  const [statusFilter, setStatusFilter] = useState('');
  const [verticalFilter, setVerticalFilter] = useState('');

  // Modals & Action confirmations
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [confirmCloseId, setConfirmCloseId] = useState(null);
  const [confirmOpenId, setConfirmOpenId] = useState(null);
  const [confirmReopenId, setConfirmReopenId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  // Fetch Verticals
  const { data: verticalsRes } = useQuery({
    queryKey: ['verticals'],
    queryFn: () => verticalApi.list()
  });
  const verticals = verticalsRes?.data || [];

  // Fetch Events
  const { data: eventsRes, isLoading } = useQuery({
    queryKey: ['events', session, statusFilter, verticalFilter],
    queryFn: () =>
      eventApi.list({
        session,
        status: statusFilter,
        vertical: verticalFilter,
        limit: 50
      })
  });
  const events = eventsRes?.data?.events || [];

  // Forms
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isCreating }
  } = useForm();

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    formState: { errors: editErrors, isSubmitting: isEditing }
  } = useForm();

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => eventApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setCreateModalOpen(false);
      resetCreate();
      toast.success('Event scheduled successfully');
    },
    onError: (err) => toast.error(err.message || 'Failed to create event')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => eventApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setEditEvent(null);
      toast.success('Event updated successfully');
    },
    onError: (err) => toast.error(err.message || 'Failed to update event')
  });

  const openMutation = useMutation({
    mutationFn: (id) => eventApi.open(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setConfirmOpenId(null);
      toast.success('Attendance window opened!');
    },
    onError: (err) => toast.error(err.message || 'Failed to open event')
  });

  const closeMutation = useMutation({
    mutationFn: (id) => eventApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setConfirmCloseId(null);
      toast.success('Event closed. Unmarked members auto-marked absent and alerts dispatched.');
    },
    onError: (err) => toast.error(err.message || 'Failed to close event')
  });

  const reopenMutation = useMutation({
    mutationFn: (id) => eventApi.reopen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setConfirmReopenId(null);
      toast.success('Attendance window reopened!');
    },
    onError: (err) => toast.error(err.message || 'Failed to reopen event')
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => eventApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setConfirmCancelId(null);
      toast.success('Event cancelled');
    },
    onError: (err) => toast.error(err.message || 'Failed to cancel event')
  });

  const openEdit = (event) => {
    setEditEvent(event);
    setEditValue('name', event.name);
    setEditValue('description', event.description || '');
    setEditValue('type', event.type);
    setEditValue('venue', event.venue || '');
    setEditValue('session', event.session);
    setEditValue(
      'targetVerticals',
      event.targetVerticals?.map((v) => v._id || v) || []
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Event Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Schedule events, manage attendance windows, and oversee session lifecycles.
          </p>
        </div>

        <button
          onClick={() => {
            resetCreate();
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Event</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Academic Session</label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
          >
            <option value="2026-2027">2026-2027 (Current)</option>
            <option value="2027-2028">2027-2028</option>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="OPEN">OPEN (Live)</option>
            <option value="CLOSED">CLOSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Vertical Scope</label>
          <select
            value={verticalFilter}
            onChange={(e) => setVerticalFilter(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
          >
            <option value="">All Verticals / Scope</option>
            {verticals.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4"
            >
              <SkeletonLoader className="h-6 w-1/3" />
              <SkeletonLoader className="h-5 w-3/4" />
              <SkeletonLoader className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="There are no events matching your selected filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              isAdmin={true}
              onOpen={() => setConfirmOpenId(event._id)}
              onClose={() => setConfirmCloseId(event._id)}
              onReopen={() => setConfirmReopenId(event._id)}
              onCancel={() => setConfirmCancelId(event._id)}
              onEdit={() => openEdit(event)}
            />
          ))}
        </div>
      )}

      {/* ================= MODAL: SCHEDULE EVENT ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule New Event</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit((data) => createMutation.mutate(data))}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  {...registerCreate('name', { required: 'Title is required' })}
                  placeholder="e.g. Annual GBM & Milestone Review"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Event Type *
                  </label>
                  <select
                    {...registerCreate('type')}
                    defaultValue="Event"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="General Body Meeting">General Body Meeting</option>
                    <option value="Vertical Meeting">Vertical Meeting</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Event">Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Academic Session *
                  </label>
                  <input
                    type="text"
                    {...registerCreate('session')}
                    defaultValue="2026-2027"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  {...registerCreate('date', { required: 'Date is required' })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    {...registerCreate('startTime', { required: 'Start time is required' })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    {...registerCreate('endTime', { required: 'End time is required' })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  {...registerCreate('venue')}
                  placeholder="Main Auditorium / Online"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Target Scope (Select Verticals, or leave empty for All Verticals)
                </label>
                <select
                  multiple
                  {...registerCreate('targetVerticals')}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 h-28"
                >
                  {verticals.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Hold Ctrl/Cmd to select multiple. If none selected, event targets all verticals.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  {...registerCreate('description')}
                  placeholder="Agenda and details..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {isCreating ? 'Scheduling...' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT EVENT ================= */}
      {editEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Event Details</h3>
              <button
                onClick={() => setEditEvent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit((data) =>
                updateMutation.mutate({ id: editEvent._id, data })
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  {...registerEdit('name', { required: true })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Event Type
                  </label>
                  <select
                    {...registerEdit('type')}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="General Body Meeting">General Body Meeting</option>
                    <option value="Vertical Meeting">Vertical Meeting</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Event">Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    {...registerEdit('venue')}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  {...registerEdit('description')}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditEvent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmDialog
        isOpen={!!confirmOpenId}
        title="Open Attendance Window"
        message="This will immediately open the attendance marking window for all targeted vertical heads and members."
        confirmText="Open Window"
        onConfirm={() => openMutation.mutate(confirmOpenId)}
        onCancel={() => setConfirmOpenId(null)}
        loading={openMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!confirmCloseId}
        title="Close Event & Finalize Attendance"
        message="Closing this event will automatically mark all unmarked active members as ABSENT, finalize records, and dispatch low-attendance warning emails to any at-risk members."
        confirmText="Close & Finalize"
        isDangerous={true}
        onConfirm={() => closeMutation.mutate(confirmCloseId)}
        onCancel={() => setConfirmCloseId(null)}
        loading={closeMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!confirmReopenId}
        title="Reopen Attendance Window"
        message="Reopening this event will allow vertical heads to make edits to the roster attendance."
        confirmText="Reopen"
        onConfirm={() => reopenMutation.mutate(confirmReopenId)}
        onCancel={() => setConfirmReopenId(null)}
        loading={reopenMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!confirmCancelId}
        title="Cancel Event"
        message="Are you sure you want to cancel this event? Cancelled events are excluded from member attendance percentage calculations."
        confirmText="Cancel Event"
        isDangerous={true}
        onConfirm={() => cancelMutation.mutate(confirmCancelId)}
        onCancel={() => setConfirmCancelId(null)}
        loading={cancelMutation.isPending}
      />
    </div>
  );
};
