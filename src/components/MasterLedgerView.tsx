import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2,
  Clock,
  UserX,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceRecord, AttendanceStatus, Student } from '../types/attendance';

interface MasterLedgerProps {
  onOpenCorrection: (recordId: string) => void;
  onOpenStudentDossier: (student: Student) => void;
  onOpenPrintableLedger: () => void;
  onOpenCsvImport: () => void;
}

export const MasterLedgerView: React.FC<MasterLedgerProps> = ({
  onOpenCorrection,
  onOpenStudentDossier,
  onOpenPrintableLedger,
  onOpenCsvImport
}) => {
  const { records, courses, students, addToast } = useAttendance();

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [sortField, setSortField] = useState<'date' | 'studentName' | 'courseCode' | 'checkInTime'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        rec.studentName.toLowerCase().includes(search.toLowerCase()) ||
        rec.studentRoll.toLowerCase().includes(search.toLowerCase()) ||
        rec.courseCode.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (courseFilter !== 'all' && rec.courseCode !== courseFilter) return false;
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;

      return true;
    });
  }, [records, search, courseFilter, statusFilter]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortField === 'studentName') {
        comparison = a.studentName.localeCompare(b.studentName);
      } else if (sortField === 'courseCode') {
        comparison = a.courseCode.localeCompare(b.courseCode);
      } else if (sortField === 'checkInTime') {
        comparison = a.checkInTime.localeCompare(b.checkInTime);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredRecords, sortField, sortDirection]);

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, page]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;

  const handleExportCsv = () => {
    const headers = 'ID,Roll Number,Name,Course,Date,Time Slot,Status,CheckIn Time,Method,Marked By\n';
    const rows = sortedRecords
      .map(
        (r) =>
          `"${r.id}","${r.studentRoll}","${r.studentName}","${r.courseCode}","${r.date}","${r.timeSlot}","${r.status}","${r.checkInTime}","${r.verificationMethod}","${r.markedBy}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_attendance_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    addToast('Ledger CSV Exported', `Generated export of ${sortedRecords.length} records.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Ledger Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Master Institutional Ledger · Permanent Records</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Student Attendance Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete high-density tabular record of daily rolls, biometric stamps, and statutory overrides.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenCsvImport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenPrintableLedger}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 text-xs font-bold hover:brightness-110 shadow-md transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Register</span>
          </button>
        </div>
      </div>

      {/* Filter and Query Strip */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll, or module..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
          >
            <option value="all">All Modules ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>{c.code} · {c.title.substring(0, 20)}...</option>
            ))}
          </select>

          {/* Status filter buttons */}
          <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800">
            {(['all', 'present', 'late', 'absent', 'excused'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors capitalize ${
                  statusFilter === st
                    ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* High-Density Ledger Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th
                  onClick={() => handleSort('date')}
                  className="p-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1 font-mono">
                    <span>Date</span>
                    {sortField === 'date' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('studentName')}
                  className="p-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Matriculated Student</span>
                    {sortField === 'studentName' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('courseCode')}
                  className="p-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1 font-mono">
                    <span>Module</span>
                    {sortField === 'courseCode' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="p-3.5">Status</th>
                <th
                  onClick={() => handleSort('checkInTime')}
                  className="p-3.5 cursor-pointer hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1 font-mono">
                    <span>Check-in Time</span>
                    {sortField === 'checkInTime' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="p-3.5">Verification Mode</th>
                <th className="p-3.5">Marked / Verified By</th>
                <th className="p-3.5 text-right">Audit / Rectify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans text-xs">
                    No attendance ledger records match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => {
                  const studentObj = students.find((s) => s.id === rec.studentId);

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="p-3.5 text-slate-300 tabular-nums">
                        {rec.date}
                      </td>

                      <td className="p-3.5 font-sans">
                        <button
                          onClick={() => studentObj && onOpenStudentDossier(studentObj)}
                          className="flex items-center gap-2.5 text-left hover:text-amber-300 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 font-mono">
                            {rec.studentName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-amber-300">
                              {rec.studentName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {rec.studentRoll}
                            </div>
                          </div>
                        </button>
                      </td>

                      <td className="p-3.5 text-amber-300 font-bold">
                        {rec.courseCode}
                      </td>

                      <td className="p-3.5 font-sans">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                            rec.status === 'present'
                              ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                              : rec.status === 'late'
                              ? 'bg-amber-950/60 border border-amber-500/30 text-amber-300'
                              : rec.status === 'absent'
                              ? 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
                              : 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-300'
                          }`}
                        >
                          {rec.status === 'present' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {rec.status === 'late' && <Clock className="w-3 h-3 text-amber-400" />}
                          {rec.status === 'absent' && <UserX className="w-3 h-3 text-rose-400" />}
                          {rec.status === 'excused' && <ShieldCheck className="w-3 h-3 text-cyan-400" />}
                          <span>{rec.status}</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-center tabular-nums text-slate-200">
                        {rec.checkInTime}
                      </td>

                      <td className="p-3.5 text-[10px] uppercase text-slate-400">
                        {rec.verificationMethod.replace('_', ' ')}
                      </td>

                      <td className="p-3.5 font-sans text-xs text-slate-300 truncate max-w-[140px]">
                        {rec.markedBy}
                      </td>

                      <td className="p-3.5 text-right font-sans">
                        <button
                          onClick={() => onOpenCorrection(rec.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                          title="Override & Correct Record"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400 font-mono">
          <div>
            Showing <span className="text-white font-bold">{Math.min(sortedRecords.length, (page - 1) * pageSize + 1)}</span> to{' '}
            <span className="text-white font-bold">{Math.min(sortedRecords.length, page * pageSize)}</span> of{' '}
            <span className="text-white font-bold">{sortedRecords.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-lg border border-slate-700 bg-slate-900 ${
                page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800 text-white'
              }`}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`px-3 py-1 rounded-lg border border-slate-700 bg-slate-900 ${
                page >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800 text-white'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
