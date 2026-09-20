import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Save, CheckCheck, User } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import clsx from 'clsx';

export const AttendanceChecklist = ({
  roster = [],
  event = null,
  onSave,
  saving = false,
  isReadOnly = false
}) => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (roster && roster.length > 0) {
      const memberOnlyRoster = roster.filter(
        (r) => !r.member?.role || r.member.role === 'MEMBER'
      );
      setRecords(
        memberOnlyRoster.map((r) => ({
          memberId: r.member._id,
          name: r.member.name,
          studentId: r.member.memberId,
          email: r.member.email,
          role: r.member.role,
          status: r.status || 'ABSENT', // Unmarked default to ABSENT on save
          remarks: r.remarks || ''
        }))
      );
    } else {
      setRecords([]);
    }
  }, [roster]);

  const toggleStatus = (memberId) => {
    if (isReadOnly) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.memberId === memberId
          ? { ...r, status: r.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' }
          : r
      )
    );
  };

  const setStatus = (memberId, targetStatus) => {
    if (isReadOnly) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.memberId === memberId ? { ...r, status: targetStatus } : r
      )
    );
  };

  const markAll = (statusToSet) => {
    if (isReadOnly) return;
    setRecords((prev) =>
      prev.map((r) => ({ ...r, status: statusToSet }))
    );
  };

  const filteredRecords = records.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = records.length - presentCount;

  const handleSave = () => {
    const payload = records.map((r) => ({
      memberId: r.memberId,
      status: r.status,
      remarks: r.remarks
    }));
    onSave(payload);
  };

  return (
    <div className="surface-card border border-border-bright rounded-2xl shadow-depth-2 overflow-hidden flex flex-col relative pb-20 sm:pb-0">
      {/* Header & Stats Bar */}
      <div className="p-4 sm:p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-2/40">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-heading text-text-primary">
            Member Attendance Checklist
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {isReadOnly
              ? 'Attendance window is closed. View-only mode.'
              : 'Tap to toggle Present / Absent for each student member and save.'}
          </p>
        </div>

        {/* Present / Absent Counters */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 text-xs font-bold border border-emerald-500/40 shadow-sm tabular-nums">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{presentCount} Present</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 text-rose-300 text-xs font-bold border border-rose-500/40 shadow-sm tabular-nums">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>{absentCount} Absent</span>
          </div>
        </div>
      </div>

      {/* Sticky Search & Quick Mark Action Bar */}
      <div className="p-3 sm:p-4 border-b border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-2/70 sticky top-16 z-20 backdrop-blur-md">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member name or ID..."
            className="input-3d w-full pl-10 pr-4 text-sm"
          />
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markAll('PRESENT')}
              icon={CheckCheck}
              className="flex-1 sm:flex-initial text-emerald-300 hover:text-emerald-200 hover:border-emerald-500/40"
            >
              Mark All Present
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markAll('ABSENT')}
              className="flex-1 sm:flex-initial text-rose-300 hover:text-rose-200 hover:border-rose-500/40"
            >
              Mark All Absent
            </Button>
          </div>
        )}
      </div>

      {/* Member Checklist Items */}
      <div className="divide-y divide-border-subtle/50 max-h-[580px] overflow-y-auto px-3 sm:px-4 py-2">
        {filteredRecords.length === 0 ? (
          <p className="text-center py-12 text-sm text-text-muted">
            No members match your search criteria.
          </p>
        ) : (
          filteredRecords.map((item) => {
            const isPresent = item.status === 'PRESENT';
            return (
              <div
                key={item.memberId}
                className="py-3.5 px-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-2/50 transition-all group"
              >
                {/* Member Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-depth-1 border transition-colors select-none',
                      isPresent
                        ? 'bg-gradient-to-br from-emerald-600 to-emerald-950 text-emerald-100 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-gradient-to-br from-rose-600 to-rose-950 text-rose-100 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                    )}
                  >
                    {item.name ? item.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-text-primary font-heading truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-surface-3 text-brand-ice border border-border-subtle">
                        {item.studentId}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate mt-0.5">{item.email}</p>
                  </div>
                </div>

                {/* Status Segmented Toggle Button */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  {!isReadOnly ? (
                    <div className="flex items-center p-1 rounded-xl bg-surface-1 border border-border-subtle shadow-inner">
                      <button
                        type="button"
                        onClick={() => setStatus(item.memberId, 'PRESENT')}
                        className={clsx(
                          'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all select-none min-h-[36px]',
                          isPresent
                            ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-btn-3d border border-emerald-400/40'
                            : 'text-text-muted hover:text-text-primary'
                        )}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PRESENT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(item.memberId, 'ABSENT')}
                        className={clsx(
                          'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all select-none min-h-[36px]',
                          !isPresent
                            ? 'bg-gradient-to-b from-rose-600 to-rose-800 text-white shadow-btn-3d border border-rose-400/40'
                            : 'text-text-muted hover:text-text-primary'
                        )}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ABSENT</span>
                      </button>
                    </div>
                  ) : (
                    <StatusBadge status={item.status} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Save Bar */}
      {!isReadOnly && (
        <div className="hidden sm:flex p-4 sm:p-5 border-t border-border-subtle items-center justify-between bg-surface-2/40">
          <div className="text-xs text-text-secondary font-mono">
            <strong>{presentCount}</strong> of <strong>{records.length}</strong> marked present
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            loading={saving}
            icon={Save}
            className="shadow-btn-3d px-6"
          >
            Save Attendance
          </Button>
        </div>
      )}

      {/* Mobile Sticky Bottom Floating Save Bar */}
      {!isReadOnly && (
        <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 p-3 glass-panel border-t border-border-bright flex items-center justify-between gap-3 shadow-depth-3">
          <div className="text-xs font-mono font-bold text-text-primary">
            <span className="text-emerald-400">{presentCount}</span> / {records.length} Present
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            loading={saving}
            icon={Save}
            className="shadow-btn-3d"
          >
            Save Attendance
          </Button>
        </div>
      )}
    </div>
  );
};
