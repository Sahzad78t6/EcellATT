import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { verticalApi } from '../../api/verticalApi';
import { userApi } from '../../api/userApi';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Layers, Plus, Edit, Trash2, Users, UserCheck, Shield, X, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export const VerticalManagementPage = () => {
  useDocumentTitle('Vertical Management');
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editVertical, setEditVertical] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch Verticals
  const { data: verticalsRes } = useQuery({
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

  const deleteMutation = useMutation({
    mutationFn: (id) => verticalApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['verticals'] });
      setDeleteTarget(null);
      toast.success(data?.data?.message || 'Vertical deleted successfully');
    },
    onError: (err) => toast.error(err.message || 'Failed to delete vertical')
  });

  const openEdit = (vert) => {
    setEditVertical(vert);
    setEditValue('name', vert.name);
    setEditValue('description', vert.description || '');
    setEditValue('secretary', vert.secretary?._id || '');
    setEditValue('leads', vert.leads?.map((l) => l._id) || []);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Organizational Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
            Vertical Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage organizational branches, secretaries, and leadership leads.
          </p>
        </div>

        <button
          onClick={() => {
            resetCreate();
            setCreateModalOpen(true);
          }}
          className="btn-3d-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold self-start sm:self-auto"
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
            className="surface-card rounded-2xl p-5 border border-brand-border shadow-depth-sm hover:border-brand-glow/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="icon-orb text-brand-glow">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEdit(vert)}
                    className="p-1.5 text-text-muted hover:text-brand-glow hover:bg-surface-2 rounded-lg transition"
                    title="Edit Vertical"
                    aria-label="Edit Vertical"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(vert)}
                    className="p-1.5 text-text-muted hover:text-status-absent hover:bg-status-absent/10 rounded-lg transition"
                    title="Delete Vertical"
                    aria-label="Delete Vertical"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-heading font-bold text-text-primary leading-tight">
                  {vert.name}
                </h3>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">
                  {vert.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/[0.04] text-xs">
                {/* Secretary */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-text-muted flex items-center gap-1 font-medium shrink-0">
                    <Shield className="w-3.5 h-3.5 text-brand-glow" />
                    <span>Secretary:</span>
                  </span>
                  <span className="font-bold text-text-primary text-right truncate">
                    {vert.secretaries && vert.secretaries.length > 0
                      ? vert.secretaries.map((s) => s.name).join(', ')
                      : vert.secretary?.name || 'Unassigned'}
                  </span>
                </div>

                {/* Leads */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-text-muted flex items-center gap-1 font-medium shrink-0">
                    <UserCheck className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Leads:</span>
                  </span>
                  <span className="font-semibold text-text-secondary text-right truncate">
                    {vert.leads && vert.leads.length > 0
                      ? vert.leads.map((l) => l.name).join(', ')
                      : 'Unassigned'}
                  </span>
                </div>

                {/* Members */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-text-muted flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-text-muted" />
                    <span>Active Members:</span>
                  </span>
                  <span className="font-mono font-extrabold text-brand-glow text-sm">
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md animate-fade-in">
          <div className="surface-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/30">
              <h3 className="text-lg font-heading font-bold text-text-primary">Add New Vertical</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit((data) => createMutation.mutate(data))}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Vertical Name *
                </label>
                <input
                  type="text"
                  {...registerCreate('name', { required: true })}
                  placeholder="e.g. Strategic Partnerships"
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  {...registerCreate('description')}
                  placeholder="Brief summary of vertical duties..."
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Assign Secretary
                </label>
                <select
                  {...registerCreate('secretary')}
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl cursor-pointer"
                >
                  <option value="">None / Assign Later</option>
                  {allUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.memberId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-border/30">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-3d-secondary px-4 py-2.5 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md animate-fade-in">
          <div className="surface-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/30">
              <h3 className="text-lg font-heading font-bold text-text-primary">
                Edit {editVertical.name}
              </h3>
              <button
                onClick={() => setEditVertical(null)}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/5"
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
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Vertical Name
                </label>
                <input
                  type="text"
                  {...registerEdit('name', { required: true })}
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  {...registerEdit('description')}
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Assign Secretary
                </label>
                <select
                  {...registerEdit('secretary')}
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {allUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.memberId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-border/30">
                <button
                  type="button"
                  onClick={() => setEditVertical(null)}
                  className="btn-3d-secondary px-4 py-2.5 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CONFIRM DELETE DIALOG ================= */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete Vertical "${deleteTarget?.name}"`}
        message={`Are you sure you want to permanently delete the "${deleteTarget?.name}" vertical? Assigned members will be unassigned and removed from targeted events.`}
        confirmText="Delete Vertical"
        cancelText="Cancel"
        isDangerous={true}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget?._id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
