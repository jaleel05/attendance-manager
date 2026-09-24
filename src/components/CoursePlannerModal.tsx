import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, BookOpen } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

interface CoursePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoursePlannerModal: React.FC<CoursePlannerModalProps> = ({ isOpen, onClose }) => {
  const { addCourse } = useAttendance();

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [credits, setCredits] = useState(4);
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:30 AM');
  const [minAttendancePercent, setMinAttendancePercent] = useState(75);
  const [scheduleDays, setScheduleDays] = useState<string[]>(['Monday', 'Wednesday']);

  if (!isOpen) return null;

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const toggleDay = (day: string) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCourse({
      code: code.toUpperCase().trim(),
      title,
      department,
      credits,
      instructor,
      room,
      scheduleDays,
      timeSlot,
      minAttendancePercent,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#111622] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Course Curriculum & Timetable Planner</h3>
              <p className="text-xs text-slate-400">Form 06: Institutional Module & Attendance Policy Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Module Code</label>
              <input
                type="text"
                required
                placeholder="e.g. CS-504"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono uppercase text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Course Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Quantum Information & Cryptography"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Min. Attendance Threshold (%)</label>
              <input
                type="number"
                min={50}
                max={100}
                value={minAttendancePercent}
                onChange={(e) => setMinAttendancePercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Faculty Instructor</label>
              <input
                type="text"
                required
                placeholder="e.g. Prof. Alan Turing, FRS"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Room / Amphitheater</label>
              <input
                type="text"
                required
                placeholder="e.g. Hall 2-A"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Schedule Days</label>
            <div className="flex flex-wrap gap-2">
              {daysList.map((day) => {
                const isSelected = scheduleDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
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
              className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-300 to-amber-500 hover:brightness-110 shadow-md"
            >
              Accredit & Save Course
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
