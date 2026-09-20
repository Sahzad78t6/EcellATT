import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../api/userApi';
import { verticalApi } from '../../api/verticalApi';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UserPlus, Upload, Key, Edit, Power, X, AlertCircle, Copy, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export const UserManagementPage = () => {
  useDocumentTitle('User & Member Management');
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verticalFilter, setVerticalFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const [toggleActiveUser, setToggleActiveUser] = useState(null);
  const [tempPasswordModal, setTempPasswordModal] = useState(null); // { user, tempPassword }
  const [bulkResultModal, setBulkResultModal] = useState(null);

  // Fetch Verticals
  const { data: verticalsRes } = useQuery({
    queryKey: ['verticals'],
    queryFn: () => verticalApi.list()
  });
  const verticals = verticalsRes?.data || [];

  // Fetch Users
  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter, verticalFilter, activeFilter],
    queryFn: () =>
      userApi.list({
        page,
        limit: 15,
        search,
        role: roleFilter,
        vertical: verticalFilter,
        isActive: activeFilter
      })
  });
  const { users = [], pagination = { page: 1, totalPages: 1, total: 0 } } = usersRes?.data || {};

  // Single User Create Form
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isCreating }
  } = useForm();

  // User Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    formState: { errors: editErrors, isSubmitting: isEditing }
  } = useForm();

  // Reset Password Form
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    reset: resetResetForm,
    formState: { isSubmitting: isResetting }
  } = useForm();

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => userApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setCreateModalOpen(false);
      resetCreate();
      toast.success('User created successfully');
      setTempPasswordModal({
        user: res.data.user,
        tempPassword: res.data.tempPassword
      });
    },
    onError: (err) => toast.error(err.message || 'Failed to create user')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditUser(null);
      toast.success('User updated successfully');
    },
    onError: (err) => toast.error(err.message || 'Failed to update user')
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, data }) => userApi.resetPassword(id, data),
    onSuccess: (res) => {
      setPasswordResetUser(null);
      resetResetForm();
      toast.success('Password reset successfully');
      setTempPasswordModal({
        user: passwordResetUser,
        tempPassword: res.data.tempPassword
      });
    },
    onError: (err) => toast.error(err.message || 'Failed to reset password')
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => userApi.update(id, { isActive }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setToggleActiveUser(null);
      toast.success(`User ${vars.isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (err) => toast.error(err.message || 'Failed to change user status')
  });

  // Bulk CSV state & handler
  const [csvText, setCsvText] = useState('');
  const [sendBulkEmail, setSendBulkEmail] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCsvText(event.target?.result || '');
      reader.readAsText(file);
    }
  };

  const handleBulkSubmit = async () => {
    if (!csvText.trim()) {
      toast.error('Please upload a CSV file or paste CSV content');
      return;
    }
    setIsBulkUploading(true);
    try {
      const res = await userApi.bulkCreate({
        csvContent: csvText,
        sendEmailCredentials: sendBulkEmail
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setBulkModalOpen(false);
      setCsvText('');
      setBulkResultModal(res.data);
      toast.success(`Bulk import complete: ${res.data.importedCount} users imported.`);
    } catch (err) {
      toast.error(err.message || 'Failed to import CSV');
    } finally {
      setIsBulkUploading(false);
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setEditValue('name', user.name);
    setEditValue('email', user.email);
    setEditValue('memberId', user.memberId);
    setEditValue('role', user.role);
    setEditValue('vertical', user.vertical?._id || '');
    setEditValue('phone', user.phone || '');
    setEditValue('year', user.year || '');
    setEditValue('branch', user.branch || '');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const columns = [
    {
      title: 'Name & Contact',
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
        <span className="font-mono font-bold text-xs bg-surface-2 text-brand-glow px-2.5 py-1 rounded-md border border-brand-border/40">
          {row.memberId}
        </span>
      )
    },
    {
      title: 'Role',
      key: 'role',
      render: (row) => (
        <span className="text-xs font-bold text-brand-bright">
          {row.role}
        </span>
      )
    },
    {
      title: 'Vertical',
      key: 'vertical',
      render: (row) => (
        <span className="text-xs text-text-secondary font-medium">
          {row.vertical?.name || '—'}
        </span>
      )
    },
    {
      title: 'Year & Branch',
      key: 'year',
      render: (row) => (
        <span className="text-xs text-text-muted">
          {row.year || ''} {row.branch ? `• ${row.branch}` : ''}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'isActive',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? 'bg-status-present/10 text-status-present border border-status-present/20'
              : 'bg-surface-3 text-text-muted border border-white/5'
          }`}
        >
          {row.isActive ? 'Active' : 'Deactivated'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-text-muted hover:text-brand-glow hover:bg-surface-2 rounded-lg transition"
            title="Edit User"
            aria-label="Edit User"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPasswordResetUser(row)}
            className="p-2 text-text-muted hover:text-status-warning hover:bg-surface-2 rounded-lg transition"
            title="Reset Password"
            aria-label="Reset Password"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={() => setToggleActiveUser(row)}
            className={`p-2 rounded-lg transition ${
              row.isActive
                ? 'text-text-muted hover:text-status-absent hover:bg-status-absent/10'
                : 'text-text-muted hover:text-status-present hover:bg-status-present/10'
            }`}
            title={row.isActive ? 'Deactivate' : 'Reactivate'}
            aria-label={row.isActive ? 'Deactivate' : 'Reactivate'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Member Directory & Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary tracking-tight">
            User & Member Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Create single accounts or bulk import members via CSV with instant credential dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="btn-3d-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={() => {
              resetCreate();
              setCreateModalOpen(true);
            }}
            className="btn-3d-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 surface-card rounded-2xl border border-brand-border shadow-depth-sm">
        <div>
          <label className="block text-[11px] font-bold text-text-muted mb-1 uppercase tracking-wider">
            Role Filter
          </label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="input-3d text-xs font-semibold rounded-xl px-3 py-2 text-text-primary cursor-pointer w-full"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SECRETARY">SECRETARY</option>
            <option value="LEAD">LEAD</option>
            <option value="MEMBER">MEMBER</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-text-muted mb-1 uppercase tracking-wider">
            Vertical Filter
          </label>
          <select
            value={verticalFilter}
            onChange={(e) => {
              setVerticalFilter(e.target.value);
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
            Account Status
          </label>
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="input-3d text-xs font-semibold rounded-xl px-3 py-2 text-text-primary cursor-pointer w-full"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search by name, email, or member ID..."
      />

      {/* ================= MODAL: CREATE USER ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md animate-fade-in">
          <div className="surface-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/30">
              <h3 className="text-lg font-heading font-bold text-text-primary">Create New User</h3>
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
                  Full Name *
                </label>
                <input
                  type="text"
                  {...registerCreate('name', { required: 'Name is required' })}
                  placeholder="e.g. Rahul Sharma"
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                />
                {createErrors.name && (
                  <p className="text-xs text-status-absent mt-1">{createErrors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...registerCreate('email', { required: 'Email is required' })}
                    placeholder="member@ecell.org"
                    className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                  />
                  {createErrors.email && (
                    <p className="text-xs text-status-absent mt-1">{createErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Member ID *
                  </label>
                  <input
                    type="text"
                    {...registerCreate('memberId', { required: 'Member ID is required' })}
                    placeholder="e.g. EC24105"
                    className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl font-mono"
                  />
                  {createErrors.memberId && (
                    <p className="text-xs text-status-absent mt-1">{createErrors.memberId.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Role *
                  </label>
                  <select
                    {...registerCreate('role')}
                    defaultValue="MEMBER"
                    className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl cursor-pointer"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="LEAD">LEAD</option>
                    <option value="SECRETARY">SECRETARY</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Vertical
                  </label>
                  <select
                    {...registerCreate('vertical')}
                    className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl cursor-pointer"
                  >
                    <option value="">None (General/Admin)</option>
                    {verticals.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    {...registerCreate('phone')}
                    placeholder="+91..."
                    className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    {...registerCreate('year')}
                    placeholder="1st Year"
                    className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    {...registerCreate('branch')}
                    placeholder="CSE"
                    className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Custom Password (Optional)
                </label>
                <input
                  type="text"
                  {...registerCreate('password')}
                  placeholder="Leave empty to auto-generate temporary password"
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                />
              </div>

              {/* Email Login Credentials Checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="sendEmailCredentials"
                  {...registerCreate('sendEmailCredentials')}
                  className="w-4 h-4 rounded text-brand-primary focus:ring-brand-glow bg-surface-2 border-brand-border/40"
                />
                <label
                  htmlFor="sendEmailCredentials"
                  className="text-xs font-semibold text-text-secondary cursor-pointer"
                >
                  Email login credentials to the member
                </label>
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
                  {isCreating ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER ================= */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md animate-fade-in">
          <div className="surface-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/30">
              <h3 className="text-lg font-heading font-bold text-text-primary">Edit User Profile</h3>
              <button
                onClick={() => setEditUser(null)}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit((data) =>
                updateMutation.mutate({ id: editUser._id, data })
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  {...registerEdit('name', { required: 'Name is required' })}
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...registerEdit('email', { required: 'Email is required' })}
                    className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Member ID
                  </label>
                  <input
                    type="text"
                    {...registerEdit('memberId', { required: 'Member ID is required' })}
                    className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Role
                  </label>
                  <select
                    {...registerEdit('role')}
                    className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl cursor-pointer"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="LEAD">LEAD</option>
                    <option value="SECRETARY">SECRETARY</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                    Vertical
                  </label>
                  <select
                    {...registerEdit('vertical')}
                    className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl cursor-pointer"
                  >
                    <option value="">None (General/Admin)</option>
                    {verticals.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-border/30">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
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

      {/* ================= MODAL: BULK CSV IMPORT ================= */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md animate-fade-in">
          <div className="surface-card w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/30">
              <h3 className="text-lg font-heading font-bold text-text-primary">Bulk CSV User Import</h3>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-surface-1 rounded-xl border border-brand-border/40 text-xs text-text-secondary space-y-1">
              <p className="font-bold text-text-primary">CSV Format Specification:</p>
              <p className="font-mono text-[11px] text-brand-glow">
                name,email,memberId,role,vertical,phone,year,branch,password
              </p>
              <p className="text-[11px] text-text-muted">
                (Header row is required. Valid rows will import even if some rows contain errors.)
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="block w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-primary/20 file:text-brand-glow hover:file:bg-brand-primary/30 file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Or Paste CSV Text
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="name,email,memberId,role,vertical..."
                  className="input-3d w-full p-3 font-mono text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendBulkEmail"
                  checked={sendBulkEmail}
                  onChange={(e) => setSendBulkEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-primary focus:ring-brand-glow bg-surface-2 border-brand-border/40"
                />
                <label
                  htmlFor="sendBulkEmail"
                  className="text-xs font-semibold text-text-secondary cursor-pointer"
                >
                  Email login credentials to all imported members
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-border/30">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="btn-3d-secondary px-4 py-2.5 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={isBulkUploading}
                className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{isBulkUploading ? 'Importing CSV...' : 'Process & Import CSV'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BULK RESULT & ERROR REPORT ================= */}
      {bulkResultModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md animate-fade-in">
          <div className="surface-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/30">
              <h3 className="text-lg font-heading font-bold text-text-primary">Bulk Import Report</h3>
              <button
                onClick={() => setBulkResultModal(null)}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-status-present/10 border border-status-present/20 rounded-2xl text-center">
                <div className="text-2xl font-black font-mono text-status-present">
                  {bulkResultModal.importedCount}
                </div>
                <div className="text-xs font-bold text-status-present uppercase tracking-wider mt-0.5">
                  Imported
                </div>
              </div>
              <div className="p-3.5 bg-status-absent/10 border border-status-absent/20 rounded-2xl text-center">
                <div className="text-2xl font-black font-mono text-status-absent">
                  {bulkResultModal.failedCount}
                </div>
                <div className="text-xs font-bold text-status-absent uppercase tracking-wider mt-0.5">
                  Failed Rows
                </div>
              </div>
            </div>

            {bulkResultModal.errors && bulkResultModal.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-text-secondary">
                  Per-Row Error Diagnostics:
                </p>
                <div className="max-h-48 overflow-y-auto divide-y divide-white/[0.04] text-xs border border-brand-border/40 rounded-xl p-2 bg-surface-1/50">
                  {bulkResultModal.errors.map((err, idx) => (
                    <div key={idx} className="py-1.5 flex items-start gap-2 text-status-absent">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Row {err.row}</strong> ({err.email}): {err.error}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setBulkResultModal(null)}
              className="btn-3d-primary w-full py-2.5 rounded-xl text-xs font-bold"
            >
              Close Report
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: TEMPORARY PASSWORD DISPLAY ================= */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md animate-fade-in">
          <div className="surface-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border space-y-4 text-center">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />
            <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-primary/20 border border-brand-primary/30 text-brand-glow flex items-center justify-center shadow-glow-sm">
              <Key className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-heading font-bold text-text-primary">
              Temporary Login Password
            </h3>
            <p className="text-xs text-text-muted">
              Please share these credentials with <strong>{tempPasswordModal.user?.name}</strong>. This password is shown only once.
            </p>

            <div className="p-4 bg-surface-1 rounded-2xl flex items-center justify-between border border-brand-border/50">
              <span className="font-mono text-base font-extrabold text-brand-glow tracking-wider">
                {tempPasswordModal.tempPassword}
              </span>
              <button
                onClick={() => copyToClipboard(tempPasswordModal.tempPassword)}
                className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-2 transition"
                title="Copy Password"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setTempPasswordModal(null)}
              className="btn-3d-primary w-full py-2.5 rounded-xl text-xs font-bold"
            >
              I Have Saved This Password
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESET PASSWORD ================= */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md animate-fade-in">
          <div className="surface-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border space-y-4">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/30">
              <h3 className="text-lg font-heading font-bold text-text-primary">
                Reset Password for {passwordResetUser.name}
              </h3>
              <button
                onClick={() => setPasswordResetUser(null)}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleResetSubmit((data) =>
                resetPasswordMutation.mutate({ id: passwordResetUser._id, data })
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Custom Password (Optional)
                </label>
                <input
                  type="text"
                  {...registerReset('password')}
                  placeholder="Leave blank to auto-generate temporary password"
                  className="input-3d w-full px-3.5 py-2.5 text-sm rounded-xl"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="resetEmailCredentials"
                  {...registerReset('sendEmailCredentials')}
                  className="w-4 h-4 rounded text-brand-primary focus:ring-brand-glow bg-surface-2 border-brand-border/40"
                />
                <label
                  htmlFor="resetEmailCredentials"
                  className="text-xs font-semibold text-text-secondary cursor-pointer"
                >
                  Email new password to user
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-border/30">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="btn-3d-secondary px-4 py-2.5 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isResetting ? 'Resetting...' : 'Confirm Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CONFIRM: DEACTIVATE / REACTIVATE ================= */}
      <ConfirmDialog
        isOpen={!!toggleActiveUser}
        title={toggleActiveUser?.isActive ? 'Deactivate User Account' : 'Reactivate User Account'}
        message={`Are you sure you want to ${toggleActiveUser?.isActive ? 'deactivate' : 'reactivate'} ${toggleActiveUser?.name}? ${toggleActiveUser?.isActive ? 'They will no longer be able to log in.' : 'They will regain portal access.'}`}
        confirmText={toggleActiveUser?.isActive ? 'Deactivate' : 'Reactivate'}
        isDangerous={toggleActiveUser?.isActive}
        onConfirm={() =>
          toggleActiveMutation.mutate({
            id: toggleActiveUser._id,
            isActive: !toggleActiveUser.isActive
          })
        }
        onCancel={() => setToggleActiveUser(null)}
        loading={toggleActiveMutation.isPending}
      />
    </div>
  );
};
