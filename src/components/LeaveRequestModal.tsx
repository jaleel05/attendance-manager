import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, ShieldCheck, Paperclip } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { LeaveApplication } from '../types/attendance';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose }) => {
  const { students, courses, leaves, submitLeave, reviewLeave } = useAttendance();

  const [activeTab, setActiveTab] = useState<'submit' | 'review'>('submit');

  // Submit form state
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [courseCode, setCourseCode] = useState(courses[0]?.code || 'CS-301');
  const [startDate, setStartDate] = useState('2026-09-25');
  const [endDate, setEndDate] = useState('2026-09-26');
  const [leaveType, setLeaveType] = useState<LeaveApplication['type']>('medical');
  const [reason, setReason] = useState('');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    submitLeave({
      studentId: student.id,
      studentName: student.name,
      studentRoll: student.rollNumber,
      courseCode,
      startDate,
      endDate,
      type: leaveType,
      reason,
      documentName: fileName || 'Verified_Documentation.pdf',
    });

    setReason('');
    setActiveTab('review');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#111622] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Leave & Attendance Exemption Portal</h3>
              <p className="text-xs text-slate-400">Form 04: Formal Academic Leave Request & Dean Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3">
          <button
            onClick={() => setActiveTab('submit')}
            className={`pb-3 px-4 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'submit'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Submit Exemption Request
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`pb-3 px-4 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'review'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Review & Approve Docket</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
              {leaves.length}
            </span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'submit' ? (
            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Matriculated Student</label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Applicable Course</label>
                  <select
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} — {c.title.substring(0, 24)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Exemption Category</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveApplication['type'])}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="medical">Medical Convalescence</option>
                    <option value="official_duty">University Representation</option>
                    <option value="conference">Academic Conference</option>
                    <option value="personal_emergency">Emergency Bereavement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Justification & Details
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the medical or official grounds for academic session exemption..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Supporting Documentation (Medical Certificate / Dean Memo)
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/60">
                  <Paperclip className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter document reference e.g. Hospital_Slip_Dr_Vance_0924.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-1 bg-transparent border-0 text-xs text-slate-200 focus:outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-300 to-cyan-500 hover:brightness-110 shadow-md"
                >
                  Submit Formal Request
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {leaves.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No active leave applications on file.
                </div>
              ) : (
                leaves.map((leave) => {
                  const isApproved = leave.status === 'approved';
                  const isPending = leave.status === 'pending';
                  const isRejected = leave.status === 'rejected';

                  return (
                    <div
                      key={leave.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white">{leave.studentName}</h4>
                            <span className="text-xs font-mono text-slate-400">({leave.studentRoll})</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Course: <span className="text-cyan-300 font-semibold">{leave.courseCode}</span> · Type: {leave.type.replace('_', ' ')}
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                            isApproved
                              ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                              : isPending
                              ? 'bg-amber-950 border border-amber-500/40 text-amber-300'
                              : 'bg-rose-950 border border-rose-500/40 text-rose-300'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950/70 text-xs text-slate-300 leading-relaxed">
                        "{leave.reason}"
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <div>
                          Duration: <span className="font-mono text-slate-300">{leave.startDate} to {leave.endDate}</span>
                          {leave.documentName && (
                            <span className="ml-2 text-cyan-400 underline">[{leave.documentName}]</span>
                          )}
                        </div>

                        {isPending && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => reviewLeave(leave.id, 'rejected')}
                              className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => reviewLeave(leave.id, 'approved')}
                              className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Grant Exemption</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
