import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Check, Clock, UserX, ShieldCheck, Zap } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceStatus } from '../types/attendance';

interface QuickPunchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickPunchModal: React.FC<QuickPunchModalProps> = ({ isOpen, onClose }) => {
  const { students, courses, selectedCourseCode, markSingleAttendance } = useAttendance();
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('present');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  const activeStudent = students.find((s) => s.id === selectedStudentId) || filteredStudents[0];

  const handlePunch = (status: AttendanceStatus) => {
    if (!activeStudent) return;
    markSingleAttendance(activeStudent.id, status, 'kiosk_punch', notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-[#111622] border border-amber-500/20 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Instant Attendance Punch</h3>
              <p className="text-xs text-slate-400">Active Course: {selectedCourseCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition-colors"
              autoFocus
            />
          </div>

          {/* Student selection list */}
          <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/40">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No matching matriculated students found.
              </div>
            ) : (
              filteredStudents.slice(0, 6).map((student) => {
                const isSelected = activeStudent?.id === student.id;
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/30 text-white'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                        {student.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{student.name}</div>
                        <div className="text-[11px] text-slate-400 tabular-nums">
                          {student.rollNumber} · {student.department}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-amber-300">
                      {Math.round((student.attendedSessions / student.totalSessions) * 100)}%
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Operational Note / Remark (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Arrived via library permit, shuttle transit delay..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          {/* Quick Action Grid */}
          <div className="pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Select Attendance Status
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <button
                onClick={() => handlePunch('present')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Check className="w-5 h-5 mb-1 text-emerald-400" />
                <span className="text-xs font-bold">Present</span>
                <span className="text-[10px] text-emerald-400/70 mt-0.5">Key 'P'</span>
              </button>

              <button
                onClick={() => handlePunch('late')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Clock className="w-5 h-5 mb-1 text-amber-400" />
                <span className="text-xs font-bold">Late</span>
                <span className="text-[10px] text-amber-400/70 mt-0.5">Key 'L'</span>
              </button>

              <button
                onClick={() => handlePunch('absent')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserX className="w-5 h-5 mb-1 text-rose-400" />
                <span className="text-xs font-bold">Absent</span>
                <span className="text-[10px] text-rose-400/70 mt-0.5">Key 'A'</span>
              </button>

              <button
                onClick={() => handlePunch('excused')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldCheck className="w-5 h-5 mb-1 text-cyan-400" />
                <span className="text-xs font-bold">Excused</span>
                <span className="text-[10px] text-cyan-400/70 mt-0.5">Key 'E'</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
