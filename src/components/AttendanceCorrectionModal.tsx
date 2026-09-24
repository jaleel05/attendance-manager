import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, History, Check } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceStatus } from '../types/attendance';

interface AttendanceCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecordId?: string;
}

export const AttendanceCorrectionModal: React.FC<AttendanceCorrectionModalProps> = ({
  isOpen,
  onClose,
  initialRecordId
}) => {
  const { records, overrideAttendanceRecord, auditLogs } = useAttendance();

  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    initialRecordId || records[0]?.id || ''
  );
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('present');
  const [justification, setJustification] = useState('');
  const [operator, setOperator] = useState('Academic Registrar');

  if (!isOpen) return null;

  const currentRecord = records.find((r) => r.id === selectedRecordId) || records[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecord) return;
    overrideAttendanceRecord(currentRecord.id, newStatus, justification, operator);
    setJustification('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-[#111622] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Attendance Rectification & Audit Log</h3>
              <p className="text-xs text-slate-400">Form 07: SOX/FERPA Compliant Record Correction Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Record Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Attendance Record to Rectify
            </label>
            <select
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {records.slice(0, 15).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.date} · {r.studentName} ({r.courseCode}) — Current: {r.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Current record details pill */}
          {currentRecord && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="text-white font-medium">{currentRecord.studentName} ({currentRecord.studentRoll})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Course & Date:</span>
                <span className="text-white font-mono">{currentRecord.courseCode} · {currentRecord.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-semibold uppercase tracking-wider text-amber-300">
                  {currentRecord.status}
                </span>
              </div>
            </div>
          )}

          {/* New Status */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Target Corrected Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['present', 'late', 'absent', 'excused'] as AttendanceStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setNewStatus(st)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize transition-all ${
                    newStatus === st
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Mandatory Justification */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Statutory Justification Reason <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide verifiable reason (e.g. Student transit delayed by university shuttle; confirmed by Transportation dispatch)..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Authorized Registrar Operator Name
            </label>
            <input
              type="text"
              required
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
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
              className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-300 to-amber-500 hover:brightness-110 shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Commit Audit Override</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
