import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Layers } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

interface BatchSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchSessionFormModal: React.FC<BatchSessionModalProps> = ({ isOpen, onClose }) => {
  const { courses, addToast, currentUser } = useAttendance();

  const [sessionTitle, setSessionTitle] = useState('');
  const [courseCode, setCourseCode] = useState(courses[0]?.code || 'CS-301');
  const [sessionType, setSessionType] = useState<'lecture' | 'lab' | 'seminar' | 'midterm_exam'>('lecture');
  const [date, setDate] = useState('2026-09-24');
  const [timeSlot, setTimeSlot] = useState('14:00 - 15:30');
  const [room, setRoom] = useState('Hall 4-B');
  const [instructor, setInstructor] = useState(currentUser?.name || 'Professor Jaleel');
  const [attendanceWeight, setAttendanceWeight] = useState('1.0');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(
      'Session Docket Created',
      `Scheduled ${sessionType.toUpperCase()}: "${sessionTitle || 'Regular Lecture'}" for ${courseCode} on ${date}.`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#111622] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Create Lecture Session Docket</h3>
              <p className="text-xs text-slate-400">Form 03: Session Scheduler & Parameter Setup</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Session Topic / Agenda
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Asymptotic Complexity of Graph Neural Networks"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Course Code</label>
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>{c.code} — {c.title.substring(0, 20)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Session Modality</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as unknown as typeof sessionType)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
              >
                <option value="lecture">Standard Lecture</option>
                <option value="lab">Laboratory Practical</option>
                <option value="seminar">Colloquium / Seminar</option>
                <option value="midterm_exam">Midterm Examination</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Session Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Time Slot</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Lecture Hall / Room</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Attendance Credit Weight</label>
              <select
                value={attendanceWeight}
                onChange={(e) => setAttendanceWeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
              >
                <option value="1.0">1.0x (Standard Lecture)</option>
                <option value="1.5">1.5x (Extended Lab Block)</option>
                <option value="2.0">2.0x (Mandatory Seminar / Exam)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Lead Academic Instructor</label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-300 to-amber-500 hover:brightness-110 shadow-md"
            >
              Create & Publish Session
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
