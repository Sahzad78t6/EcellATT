import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { verticalApi } from '../../api/verticalApi';
import { userApi } from '../../api/userApi';
import { Layers, Plus, Edit, Users, UserCheck, Shield, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export const VerticalManagementPage = () => {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editVertical, setEditVertical] = useState(null);

  // Fetch Verticals
  const { data: verticalsRes, isLoading } = useQuery({
    queryKey: ['verticals'],
    queryFn: () => verticalApi.list()
  });
  const verticals = verticalsRes?.data || [];

  // Fetch all users for assigning secretary / leads
  const { data: usersRes } = useQuery({
    queryKey: ['all-users-dropdown'],
    queryFn: () => userApi.list({ limit: 200, isActive: 'true' })
  });
  const allUsers = usersRes?.data?.users || [];

  // Create Form
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { isSubmitting: isCreating }
  } = useForm();

  // Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    formState: { isSubmitting: isEditing }
  } = useForm();

  const createMutation = useMutation({
    mutationFn: (data) => verticalApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verticals'] });
      setCreateModalOpen(false);
      resetCreate();
      toast.success('Vertical created successfully');
    },
    onError: (err) => toast.error(err.message || 'Failed to create vertical')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => verticalApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verticals'] });
      setEditVertical(null);
      toast.success('Vertical updated successfully');
    },
    onError: (err) => toast.error(err.message || 'Failed to update vertical')
  });

  const openEdit = (vert) => {
    setEditVertical(vert);
    setEditValue('name', vert.name);
    setEditValue('description', vert.description || '');
    setEditValue('secretary', vert.secretary?._id || '');
    setEditValue('leads', vert.leads?.map((l) => l._id) || []);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Vertical Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage the 8 organizational branches, secretaries, and leadership leads.
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
          <span>Add Vertical</span>
        </button>
      </div>

      {/* Verticals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {verticals.map((vert) => (
          <div
            key={vert._id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <button
                  onClick={() => openEdit(vert)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Edit Vertical"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {vert.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {vert.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {/* Secretary */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1 font-medium">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Secretary:</span>
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {vert.secretary?.name || 'Unassigned'}
                  </span>
                </div>

                {/* Leads */}
                <div className="flex items-start justify-between">
                  <span className="text-slate-400 flex items-center gap-1 font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-teal-500" />
                    <span>Leads:</span>
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                    {vert.leads && vert.leads.length > 0
                      ? vert.leads.map((l) => l.name).join(', ')
                      : 'Unassigned'}
                  </span>
                </div>

                {/* Members */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Active Members:</span>
                  </span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    {vert.memberCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL: CREATE VERTICAL ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Vertical</h3>
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
                  Vertical Name *
                </label>
                <input
                  type="text"
                  {...registerCreate('name', { required: true })}
                  placeholder="e.g. Strategic Partnerships"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  {...registerCreate('description')}
                  placeholder="Brief summary of vertical duties..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Assign Secretary
                </label>
                <select
                  {...registerCreate('secretary')}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="">None / Assign Later</option>
                  {allUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.memberId})
                    </option>
                  ))}
                </select>
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
                  {isCreating ? 'Creating...' : 'Create Vertical'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT VERTICAL ================= */}
      {editVertical && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit {editVertical.name}
              </h3>
              <button
                onClick={() => setEditVertical(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit((data) =>
                updateMutation.mutate({ id: editVertical._id, data })
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Vertical Name
                </label>
                <input
                  type="text"
                  {...registerEdit('name', { required: true })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  {...registerEdit('description')}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Assign Secretary
                </label>
                <select
                  {...registerEdit('secretary')}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="">Unassigned</option>
                  {allUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.memberId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditVertical(null)}
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
    </div>
  );
};
