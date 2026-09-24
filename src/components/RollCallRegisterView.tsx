import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Clock, 
  UserX, 
  ShieldCheck, 
  RotateCcw, 
  Save, 
  Filter, 
  Search, 
  BookOpen
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceStatus } from '../types/attendance';

export const RollCallRegisterView: React.FC = () => {
  const { 
    students, 
    courses, 
    selectedCourseCode, 
    setSelectedCourseCode, 
    selectedDate, 
    setSelectedDate,
    records,
    batchCommitAttendance,
    departments,
    selectedDepartment,
    setSelectedDepartment,
    currentUser
  } = useAttendance();

  const activeCourse = courses.find((c) => c.code === selectedCourseCode) || courses[0];

  // Students enrolled in active course & matched department
  const enrolledStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesCourse = s.enrolledCourseCodes.includes(selectedCourseCode);
      const matchesDept = selectedDepartment === 'all' || s.department.toLowerCase() === selectedDepartment.toLowerCase();
      return matchesCourse && matchesDept;
    });
  }, [students, selectedCourseCode, selectedDepartment]);

  // Current session attendance map (studentId -> status)
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    const map: Record<string, AttendanceStatus> = {};
    // Load from existing records if any
    records
      .filter((r) => r.courseCode === selectedCourseCode && r.date === selectedDate)
      .forEach((r) => {
        map[r.studentId] = r.status;
      });
    return map;
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureName, setSignatureName] = useState(currentUser?.name || 'Professor Jaleel');
  const [showSignModal, setShowSignModal] = useState(false);

  // Sync state if course/date changes
  React.useEffect(() => {
    const map: Record<string, AttendanceStatus> = {};
    records
      .filter((r) => r.courseCode === selectedCourseCode && r.date === selectedDate)
      .forEach((r) => {
        map[r.studentId] = r.status;
      });
    setAttendanceMap(map);
  }, [selectedCourseCode, selectedDate, records]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return enrolledStudents.filter((student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      return attendanceMap[student.id] === statusFilter;
    });
  }, [enrolledStudents, search, statusFilter, attendanceMap]);

  // Statistics calculation
  const stats = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let excused = 0;
    let unmarked = 0;

    enrolledStudents.forEach((st) => {
      const stStatus = attendanceMap[st.id];
      if (stStatus === 'present') present++;
      else if (stStatus === 'late') late++;
      else if (stStatus === 'absent') absent++;
      else if (stStatus === 'excused') excused++;
      else unmarked++;
    });

    const total = enrolledStudents.length;
    const marked = total - unmarked;
    const rate = marked > 0 ? Math.round(((present + late * 0.5 + excused) / total) * 100) : 0;

    return { present, late, absent, excused, unmarked, total, marked, rate };
  }, [enrolledStudents, attendanceMap]);

  // Actions
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach((st) => {
      // Don't overwrite excused students who have approved leave
      if (attendanceMap[st.id] === 'excused') {
        updated[st.id] = 'excused';
      } else {
        updated[st.id] = 'present';
      }
    });
    setAttendanceMap(updated);
  };

  const handleClearAll = () => {
    setAttendanceMap({});
  };

  const handleCommitRegister = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      batchCommitAttendance(selectedCourseCode, selectedDate, attendanceMap, signatureName);
      setIsSubmitting(false);
      setShowSignModal(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Session Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#131a29] to-slate-900 border border-slate-800/80 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Interactive Roll-Call Register · Lecture Session</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {activeCourse.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-mono text-slate-300 font-medium">{activeCourse.code}</span>
              <span aria-hidden="true">·</span>
              <span>{activeCourse.instructor}</span>
              <span aria-hidden="true">·</span>
              <span>{activeCourse.room}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{activeCourse.timeSlot}</span>
            </div>
          </div>

          {/* Session Switchers */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Filter Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-amber-300 focus:outline-none focus:border-amber-400/60"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Select Course
              </label>
              <select
                value={selectedCourseCode}
                onChange={(e) => setSelectedCourseCode(e.target.value)}
                className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-400/60"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code} — {c.title.substring(0, 28)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Register Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400/60"
              />
            </div>
          </div>
        </div>

        {/* Live Status Counter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400">Total Enrolled</div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
              {stats.total}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <div className="text-[11px] font-medium text-emerald-400 flex items-center justify-between">
              <span>Present</span>
              <Check className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold text-emerald-300 font-mono tabular-nums mt-0.5">
              {stats.present}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
            <div className="text-[11px] font-medium text-amber-400 flex items-center justify-between">
              <span>Late</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold text-amber-300 font-mono tabular-nums mt-0.5">
              {stats.late}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20">
            <div className="text-[11px] font-medium text-rose-400 flex items-center justify-between">
              <span>Absent</span>
              <UserX className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold text-rose-300 font-mono tabular-nums mt-0.5">
              {stats.absent}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-medium text-cyan-400 flex items-center justify-between">
              <span>Excused</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold text-cyan-300 font-mono tabular-nums mt-0.5">
              {stats.excused}
            </div>
          </div>
        </div>
      </div>

      {/* Control & Filter Strip */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search enrolled students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-slate-950/60 rounded-lg border border-slate-800">
          {(['all', 'present', 'late', 'absent', 'excused'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Batch actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 text-xs font-medium transition-colors whitespace-nowrap"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
            title="Reset active register marks"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowSignModal(true)}
            disabled={stats.marked === 0}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-[0.98] transition-all shadow-md whitespace-nowrap ${
              stats.marked === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Sign & Commit Register ({stats.marked}/{stats.total})</span>
          </button>
        </div>
      </div>

      {/* Student Roll Call Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            No students found matching your criteria.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const currentStatus = attendanceMap[student.id];

            return (
              <motion.div
                key={student.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`relative p-4 rounded-xl border transition-all ${
                  currentStatus === 'present'
                    ? 'bg-slate-900/80 border-emerald-500/40 shadow-[0_4px_20px_-8px_rgba(16,185,129,0.15)]'
                    : currentStatus === 'late'
                    ? 'bg-slate-900/80 border-amber-500/40 shadow-[0_4px_20px_-8px_rgba(245,158,11,0.15)]'
                    : currentStatus === 'absent'
                    ? 'bg-slate-900/80 border-rose-500/40 shadow-[0_4px_20px_-8px_rgba(244,63,94,0.15)]'
                    : currentStatus === 'excused'
                    ? 'bg-slate-900/80 border-cyan-500/40 shadow-[0_4px_20px_-8px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-900/40 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 font-mono shadow-sm">
                      {student.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    {currentStatus && (
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-950 ${
                          currentStatus === 'present'
                            ? 'bg-emerald-400'
                            : currentStatus === 'late'
                            ? 'bg-amber-400'
                            : currentStatus === 'absent'
                            ? 'bg-rose-400 text-white'
                            : 'bg-cyan-400'
                        }`}
                      >
                        {currentStatus === 'present' ? 'P' : currentStatus === 'late' ? 'L' : currentStatus === 'absent' ? 'A' : 'E'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {student.name}
                      </h4>
                      <span className="text-[11px] font-mono tabular-nums text-amber-300/90 shrink-0">
                        {Math.round((student.attendedSessions / student.totalSessions) * 100)}%
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 tabular-nums">
                      {student.rollNumber}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span className="text-amber-300/80 font-medium truncate max-w-[120px]">{student.department}</span>
                      <span aria-hidden="true">·</span>
                      <span>{student.streak}d streak</span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Row */}
                <div className="grid grid-cols-4 gap-1.5 mt-3.5 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleSetStatus(student.id, 'present')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-950/60 hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-300 border border-slate-800'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>P</span>
                  </button>

                  <button
                    onClick={() => handleSetStatus(student.id, 'late')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      currentStatus === 'late'
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-950/60 hover:bg-amber-950/40 text-slate-400 hover:text-amber-300 border border-slate-800'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>L</span>
                  </button>

                  <button
                    onClick={() => handleSetStatus(student.id, 'absent')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      currentStatus === 'absent'
                        ? 'bg-rose-500 text-white font-bold shadow-sm'
                        : 'bg-slate-950/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800'
                    }`}
                  >
                    <UserX className="w-3 h-3" />
                    <span>A</span>
                  </button>

                  <button
                    onClick={() => handleSetStatus(student.id, 'excused')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      currentStatus === 'excused'
                        ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-950/60 hover:bg-cyan-950/40 text-slate-400 hover:text-cyan-300 border border-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>E</span>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Signature & Confirmation Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#111622] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Finalize & Sign Attendance Register</h3>
                <p className="text-xs text-slate-400">Course {activeCourse.code} · Date {selectedDate}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span>Present Students:</span>
                <span className="font-mono text-emerald-400 font-semibold">{stats.present}</span>
              </div>
              <div className="flex justify-between">
                <span>Late Arrivals:</span>
                <span className="font-mono text-amber-400 font-semibold">{stats.late}</span>
              </div>
              <div className="flex justify-between">
                <span>Absent Students:</span>
                <span className="font-mono text-rose-400 font-semibold">{stats.absent}</span>
              </div>
              <div className="flex justify-between">
                <span>Excused Leaves:</span>
                <span className="font-mono text-cyan-400 font-semibold">{stats.excused}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                <span>Overall Session Attendance Rate:</span>
                <span className="font-mono text-amber-300">{stats.rate}%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Faculty Instructor Signature
              </label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400/60 font-serif italic"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSignModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCommitRegister}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-300 to-amber-500 hover:brightness-110 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Signing Ledger...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Digitally Sign & Commit to SQL</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
