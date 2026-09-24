import React from 'react';
import { motion } from 'motion/react';
import { X, Flame, AlertTriangle, FileBadge } from 'lucide-react';
import { Student } from '../types/attendance';
import { useAttendance } from '../context/AttendanceContext';

interface StudentDossierModalProps {
  student: Student | null;
  onClose: () => void;
  onOpenDefaulterNotice: (student: Student) => void;
}

export const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  student,
  onClose,
  onOpenDefaulterNotice,
}) => {
  const { records, courses, addToast } = useAttendance();

  if (!student) return null;

  const attendanceRate = Math.round((student.attendedSessions / student.totalSessions) * 100);
  const studentRecords = records.filter((r) => r.studentId === student.id);

  // Generate 28-day activity heatmap blocks
  const activityDays = Array.from({ length: 28 }).map((_, i) => {
    // Generate dates backwards from 2026-09-24
    const d = new Date(2026, 8, 24 - (27 - i));
    const dateStr = d.toISOString().split('T')[0];
    const rec = studentRecords.find((r) => r.date === dateStr);

    let status: 'present' | 'late' | 'absent' | 'excused' | 'no_class' = 'no_class';
    if (rec) {
      status = rec.status;
    } else {
      // Simulate historical regular weekday attendance based on student rate
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        status = attendanceRate > 75 ? (i % 7 === 0 ? 'late' : 'present') : (i % 4 === 0 ? 'absent' : 'present');
      }
    }

    return { date: dateStr, status };
  });

  const handleDownloadCertificate = () => {
    addToast(
      'Attendance Certificate Generated',
      `Official sealed transcript for ${student.name} (${attendanceRate}%) is ready for download.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#111622] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Profile Bar */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-[#131b2e] to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-400/80 text-amber-300 font-bold text-lg flex items-center justify-center font-mono shadow-md">
                {student.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px] text-white font-bold">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{student.name}</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  {student.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {student.rollNumber} · {student.department} · Sem {student.semester}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                <span>{student.email}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300/80 font-mono">Card: {student.rfidTag}</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Top KPI Metrics Grid */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Compliance Rate</div>
              <div className="text-2xl font-bold font-mono text-amber-300 mt-0.5">
                {attendanceRate}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Min. Required: 75%</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Classes Attended</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                {student.attendedSessions} <span className="text-xs text-slate-400 font-normal">/ {student.totalSessions}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Total Sem Sessions</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Late Arrivals</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5">
                {student.lateSessions}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">0.5 Weight Credit</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Attendance Streak</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>{student.streak}d</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Consecutive Days</div>
            </div>
          </div>

          {/* 28-Day Attendance Heat Grid */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                28-Day Longitudinal Attendance Heatmap
              </span>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Present
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" /> Late
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Absent
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block" /> Excused
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 pt-2">
              {activityDays.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.date}: ${day.status.toUpperCase()}`}
                  className={`h-7 rounded flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                    day.status === 'present'
                      ? 'bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 hover:scale-105'
                      : day.status === 'late'
                      ? 'bg-amber-500/25 border border-amber-500/50 text-amber-300 hover:scale-105'
                      : day.status === 'absent'
                      ? 'bg-rose-500/25 border border-rose-500/50 text-rose-300 hover:scale-105'
                      : day.status === 'excused'
                      ? 'bg-cyan-500/25 border border-cyan-500/50 text-cyan-300 hover:scale-105'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-600'
                  }`}
                >
                  {day.date.split('-')[2]}
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Courses Breakdown */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Enrolled Modules & Subject Performance
            </h4>
            <div className="space-y-2">
              {student.enrolledCourseCodes.map((code) => {
                const course = courses.find((c) => c.code === code);
                const isWarning = attendanceRate < (course?.minAttendancePercent || 75);

                return (
                  <div
                    key={code}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{code} — {course?.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {course?.instructor} · {course?.room}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold text-sm ${isWarning ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {attendanceRate}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Req: {course?.minAttendancePercent || 75}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Emergency Contact: <span className="text-slate-200">{student.guardianContact}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {attendanceRate < 75 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDefaulterNotice(student);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Issue Warning Notice</span>
              </button>
            )}

            <button
              onClick={handleDownloadCertificate}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 text-xs font-semibold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <FileBadge className="w-3.5 h-3.5" />
              <span>Official Certificate</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
