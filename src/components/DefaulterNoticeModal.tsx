import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Send, ShieldAlert } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types/attendance';

interface DefaulterNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudent?: Student;
}

export const DefaulterNoticeModal: React.FC<DefaulterNoticeModalProps> = ({
  isOpen,
  onClose,
  targetStudent
}) => {
  const { students, courses, dispatchWarningNotice } = useAttendance();

  // Find all students < 75% or warning status
  const defaulterCandidates = students.filter(
    (s) => s.status === 'warning' || s.status === 'critical' || ((s.attendedSessions / s.totalSessions) * 100) < 75
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    targetStudent?.id || defaulterCandidates[0]?.id || students[0]?.id || ''
  );
  const [courseCode, setCourseCode] = useState('CS-301');
  const [warningTier, setWarningTier] = useState<'Advisory (Level 1)' | 'First Warning (Level 2)' | 'Debarment Notice (Level 3)'>('First Warning (Level 2)');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSmsGuardian, setSendSmsGuardian] = useState(true);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const currentRate = currentStudent
    ? Math.round((currentStudent.attendedSessions / currentStudent.totalSessions) * 100)
    : 65;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    dispatchWarningNotice({
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentRoll: currentStudent.rollNumber,
      courseCode,
      currentRate,
      threshold: 75.0,
      warningLevel: warningTier,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-[#111622] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Statutory Attendance Defaulter Escalation</h3>
              <p className="text-xs text-slate-400">Form 09: Formal Debarment Warning & Guardian Notice Dispatch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleDispatch} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Defaulter Student Candidate
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-400"
            >
              {defaulterCandidates.map((s) => {
                const rate = Math.round((s.attendedSessions / s.totalSessions) * 100);
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNumber}) — {rate}% Rate ({s.status.toUpperCase()})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject Course</label>
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-400"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>{c.code} — {c.title.substring(0, 20)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Escalation Severity Tier</label>
              <select
                value={warningTier}
                onChange={(e) => setWarningTier(e.target.value as unknown as typeof warningTier)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-400"
              >
                <option value="Advisory (Level 1)">Advisory Notice (Tier 1)</option>
                <option value="First Warning (Level 2)">First Formal Warning (Tier 2)</option>
                <option value="Debarment Notice (Level 3)">Final Examination Debarment (Tier 3)</option>
              </select>
            </div>
          </div>

          {/* Letter Preview Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-serif text-slate-300">
            <div className="border-b border-slate-800 pb-2 text-[11px] font-sans text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Official Institutional Notice Letter Preview</span>
              <span className="text-rose-400 font-semibold">{warningTier}</span>
            </div>
            <p className="text-slate-200 font-sans text-xs">
              <strong>To:</strong> {currentStudent?.name} ({currentStudent?.rollNumber})<br />
              <strong>Guardian:</strong> {currentStudent?.guardianContact}<br />
              <strong>Department:</strong> {currentStudent?.department}
            </p>
            <p className="italic text-slate-400 leading-relaxed text-[12px]">
              "This letter serves as a formal statutory notice from the Office of Academic Affairs. Your cumulative attendance for <strong className="text-white">{courseCode}</strong> stands at <span className="text-rose-400 font-bold font-mono">{currentRate}%</span>, which is strictly below the mandatory institutional threshold of <span className="font-mono text-white">75.0%</span>. Continued absence will lead to immediate debarment from the final semester examination session."
            </p>
          </div>

          {/* Dispatch Channels */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-medium text-slate-300">
              Notification Channels
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>Email Student ({currentStudent?.email})</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendSmsGuardian}
                  onChange={(e) => setSendSmsGuardian(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>SMS Alert to Guardian</span>
              </label>
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
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 shadow-md flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue & Dispatch Notice</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
