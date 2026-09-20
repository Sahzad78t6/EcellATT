import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Save, CheckCheck } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

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
      setRecords(
        roster.map((r) => ({
          memberId: r.member._id,
          name: r.member.name,
          studentId: r.member.memberId,
          email: r.member.email,
          role: r.member.role,
          status: r.status || 'ABSENT', // Unmarked default to ABSENT on save
          remarks: r.remarks || ''
        }))
      );
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

  const markAll = (statusToSet) => {
    if (isReadOnly) return;
    setRecords((prev) =>
      prev.map((r) => ({ ...r, status: statusToSet }))
    );
  };

  const handleRemarkChange = (memberId, remarks) => {
    if (isReadOnly) return;
    setRecords((prev) =>
      prev.map((r) => (r.memberId === memberId ? { ...r, remarks } : r))
    );
  };

  const filteredRecords = records.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-4 p-5 sm:p-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Member Attendance Checklist
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isReadOnly
              ? 'Attendance window is closed. View-only mode.'
              : 'Toggle status for each member and click Save Attendance.'}
          </p>
        </div>

        {/* Present / Absent Counters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4" />
            <span>{presentCount} Present</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
            <XCircle className="w-4 h-4" />
            <span>{absentCount} Absent</span>
          </div>
        </div>
      </div>

      {/* Action Bar: Search & Quick Mark Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member name or ID..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => markAll('PRESENT')}
              className="px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-xl border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Present</span>
            </button>
            <button
              type="button"
              onClick={() => markAll('ABSENT')}
              className="px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-xl border border-rose-200 dark:border-rose-800 transition"
            >
              Mark All Absent
            </button>
          </div>
        )}
      </div>

      {/* Roster List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[520px] overflow-y-auto pr-1">
        {filteredRecords.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-500">No members match your search.</p>
        ) : (
          filteredRecords.map((item) => {
            const isPresent = item.status === 'PRESENT';
            return (
              <div
                key={item.memberId}
                className="py-3 px-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      isPresent
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.studentId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.email}</p>
                  </div>
                </div>

                {/* Right controls: Toggle button & remarks */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {!isReadOnly ? (
                    <button
                      type="button"
                      onClick={() => toggleStatus(item.memberId)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
                        isPresent
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                          : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20'
                      }`}
                    >
                      {isPresent ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>PRESENT</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>ABSENT</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <StatusBadge status={item.status} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Save Button Bar */}
      {!isReadOnly && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Attendance...' : 'Save & Submit Attendance'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
