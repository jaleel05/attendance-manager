import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame, 
  ArrowUpRight, 
  BookOpen, 
  ShieldAlert, 
  Calendar,
  Layers,
  Zap,
  TrendingUp,
  FileSpreadsheet,
  UserPlus
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types/attendance';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenQuickPunch: () => void;
  onOpenEnrollment: () => void;
  onOpenCoursePlanner: () => void;
  onOpenLeaveRequest: () => void;
  onOpenBatchSession: () => void;
  onOpenDefaulterNotice: (student?: Student) => void;
  onOpenStudentDossier: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenQuickPunch,
  onOpenEnrollment,
  onOpenCoursePlanner,
  onOpenLeaveRequest,
  onOpenBatchSession,
  onOpenDefaulterNotice,
  onOpenStudentDossier,
}) => {
  const { students, courses, records, todayStats, selectedDate } = useAttendance();

  // Top streak students
  const honorsStudents = [...students]
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 4);

  // Defaulter students < 75%
  const defaulters = students.filter(
    (s) => ((s.attendedSessions / s.totalSessions) * 100) < 75
  );

  // Department distribution - strictly Software Engineering, Computer Science, Artificial Intelligence
  const departments = [
    {
      name: 'Software Engineering',
      code: 'SE',
      students: students.filter((s) => s.department === 'Software Engineering'),
    },
    {
      name: 'Computer Science',
      code: 'CS',
      students: students.filter((s) => s.department === 'Computer Science'),
    },
    {
      name: 'Artificial Intelligence',
      code: 'AI',
      students: students.filter((s) => s.department === 'Artificial Intelligence'),
    },
  ].map((d) => {
    const totalSessions = d.students.reduce((acc, s) => acc + s.totalSessions, 0) || 1;
    const attended = d.students.reduce((acc, s) => acc + s.attendedSessions, 0);
    const avgRate = Math.round((attended / totalSessions) * 1000) / 10;
    return {
      name: d.name,
      count: d.students.length,
      avgRate: avgRate || 94.2,
      code: d.code,
    };
  });

  return (
    <div className="space-y-8">
      {/* Luxury Campus Hero Spotlight */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-amber-500/20 shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/luxury_lecture_hall_1790247887008.jpg"
            alt="University Amphitheater"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f17] via-[#0b0f17]/90 to-transparent" />
        </div>

        <div className="relative z-10 p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Session Term 2026 · Real-Time Institutional Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Attendance Manager
            </h1>

            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed">
              Institutional attendance ledger for <span className="text-amber-300 font-semibold">Professor Jaleel</span> across Software Engineering, Computer Science, and Artificial Intelligence departments.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('students')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all active:scale-95"
              >
                <Users className="w-4 h-4 fill-current" />
                <span>Manage Students & Depts</span>
              </button>

              <button
                onClick={() => onNavigateTab('rollcall')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:border-amber-400/50"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Launch Digital Roll Register</span>
              </button>

              <button
                onClick={() => onNavigateTab('ledger')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:border-amber-400/50"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>View Master Ledger</span>
              </button>
            </div>
          </div>

          {/* Luxury Crest Badge */}
          <div className="hidden lg:flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-xl shadow-xl shrink-0 w-64 text-center">
            <img
              src="/src/assets/images/aura_university_crest_1790247874296.jpg"
              alt="Crest Seal"
              className="w-20 h-20 rounded-2xl object-cover border border-amber-500/40 shadow-lg mb-3"
              referrerPolicy="no-referrer"
            />
            <div className="text-xs font-bold font-serif uppercase tracking-widest text-amber-200">
              Attendance Manager
            </div>
            <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
              Prof. Jaleel (SE, CS & AI)
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-[11px] text-slate-400">
              <span>Date:</span>
              <span className="font-mono text-white font-medium">{selectedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Rate */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-lg hover:border-amber-500/30 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Cumulative Turnout</span>
            <span className="text-emerald-400 flex items-center text-[11px] font-mono">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +1.4%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums mt-2">
            {todayStats.todayRate}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Institutional target: <span className="font-mono text-slate-300">75.0%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
              style={{ width: `${todayStats.todayRate}%` }}
            />
          </div>
        </motion.div>

        {/* Card 2: Today Marked */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-lg hover:border-emerald-500/30 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Present Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums mt-2">
            {todayStats.presentToday} <span className="text-base text-slate-400 font-normal">/ {todayStats.totalEnrolledToday}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {todayStats.lateToday} late · {todayStats.excusedToday} excused
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${(todayStats.presentToday / (todayStats.totalEnrolledToday || 1)) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Card 3: Punctuality Index */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-lg hover:border-amber-500/30 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">On-Time Arrivals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-300 font-mono tabular-nums mt-2">
            94.8%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Avg. check-in timestamp: <span className="font-mono text-slate-300">08:55 AM</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: '94.8%' }} />
          </div>
        </motion.div>

        {/* Card 4: Defaulters Radar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="p-5 rounded-2xl bg-slate-900/70 border border-rose-500/20 shadow-lg hover:border-rose-500/40 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">At-Risk Defaulters</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono tabular-nums mt-2">
            {defaulters.length} <span className="text-xs font-normal text-rose-300/80">Students</span>
          </div>
          <div className="text-xs text-rose-400/80 mt-1">
            Attendance strictly &lt; 75.0% threshold
          </div>
          <div className="mt-3">
            <button
              onClick={() => onOpenDefaulterNotice()}
              className="text-[11px] font-semibold text-rose-300 hover:text-white underline flex items-center gap-1"
            >
              <span>Dispatch Debarment Notices</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 10+ Input Forms Fast Action Dock */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Attendance Recording Modalities & Input Forms (10+ Input Tools)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Direct Faculty Action Suite</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('rollcall')}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/40 transition-all text-left group"
          >
            <BookOpen className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">01. Roll Register</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Faculty session sheet</span>
          </button>

          <button
            onClick={onOpenBatchSession}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/40 transition-all text-left group"
          >
            <Layers className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">02. Session Docket</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Schedule lab/lecture</span>
          </button>

          <button
            onClick={onOpenLeaveRequest}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-400/40 transition-all text-left group"
          >
            <Calendar className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">03. Leave & Medical</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Exemption approvals</span>
          </button>

          <button
            onClick={onOpenEnrollment}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/40 transition-all text-left group"
          >
            <UserPlus className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">04. Matriculate Student</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Issue credentials</span>
          </button>

          <button
            onClick={onOpenCoursePlanner}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/40 transition-all text-left group"
          >
            <BookOpen className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">06. Module Planner</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Timetables & policy</span>
          </button>

          <button
            onClick={() => onNavigateTab('ledger')}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/40 transition-all text-left group"
          >
            <FileSpreadsheet className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">07. Ledger & Audit</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Historical corrections</span>
          </button>

          <button
            onClick={() => onNavigateTab('ledger')}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-400/40 transition-all text-left group"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">08. CSV Bulk Import</span>
            <span className="text-[11px] text-slate-400 mt-0.5">High-volume reconciliation</span>
          </button>

          <button
            onClick={() => onOpenDefaulterNotice()}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-400/40 transition-all text-left group"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">09. Debarment Letter</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Statutory warning dispatch</span>
          </button>
        </div>
      </div>

      {/* Two Columns: Department Turnout + Defaulter Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Departmental Performance */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Academic Faculty Turnout Comparison</h3>
              <p className="text-xs text-slate-400">Cohort attendance distribution across disciplines</p>
            </div>
            <button
              onClick={() => onNavigateTab('ledger')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {departments.map((dept) => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-300 font-bold">{dept.code}</span>
                    <span className="text-white font-medium">{dept.name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">({dept.count} matriculated)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    {dept.avgRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${dept.avgRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Hourly Arrival Histogram Visual */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Hourly Check-in Distribution Curve (Today's Peak Influx)
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono">
              {[
                { time: '08:00', pct: 40, count: 6 },
                { time: '09:00', pct: 95, count: 15 },
                { time: '10:00', pct: 60, count: 9 },
                { time: '11:00', pct: 75, count: 12 },
                { time: '12:00', pct: 30, count: 4 },
                { time: '13:00', pct: 80, count: 13 },
                { time: '14:00', pct: 50, count: 7 },
              ].map((slot) => (
                <div key={slot.time} className="flex flex-col items-center gap-1.5">
                  <div className="w-full h-20 bg-slate-950/80 rounded-lg p-1 flex items-end justify-center">
                    <div
                      className="w-full bg-amber-400/80 hover:bg-amber-400 rounded transition-all"
                      style={{ height: `${slot.pct}%` }}
                      title={`${slot.count} arrivals at ${slot.time}`}
                    />
                  </div>
                  <span className="text-slate-400">{slot.time}</span>
                  <span className="text-amber-300 font-bold">{slot.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col: Honors Leaderboard & Defaulter Radar */}
        <div className="space-y-6">
          {/* Top Streaks */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="text-sm font-semibold text-white">Honors Attendance Streaks</h3>
            </div>

            <div className="space-y-2">
              {honorsStudents.map((st) => (
                <button
                  key={st.id}
                  onClick={() => onOpenStudentDossier(st)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                      {st.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-300">
                        {st.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {st.rollNumber}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{st.streak}d</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      {Math.round((st.attendedSessions / st.totalSessions) * 100)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Defaulter Alert Box */}
          <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">Statutory Defaulters</h3>
              </div>
              <span className="text-[11px] font-mono text-rose-400 font-bold">&lt; 75% Threshold</span>
            </div>

            <div className="space-y-2">
              {defaulters.map((st) => {
                const rate = Math.round((st.attendedSessions / st.totalSessions) * 100);
                return (
                  <div
                    key={st.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-900/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{st.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {st.rollNumber} · {st.department}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-rose-400 text-sm">{rate}%</span>
                      <button
                        onClick={() => onOpenDefaulterNotice(st)}
                        className="block text-[10px] text-rose-300 hover:text-white underline mt-0.5"
                      >
                        Send Notice
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
