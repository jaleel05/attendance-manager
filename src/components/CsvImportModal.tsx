import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, UploadCloud, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceStatus } from '../types/attendance';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importBulkRecords, students } = useAttendance();

  const sampleCsv = `AU-CS-2401,CS-301,2026-09-24,present
AU-CS-2402,CS-301,2026-09-24,present
AU-CS-2403,CS-301,2026-09-24,late
AU-CS-2405,CS-301,2026-09-24,absent
AU-CS-2406,CS-301,2026-09-24,absent
AU-AI-2407,CS-301,2026-09-24,present`;

  const [csvContent, setCsvContent] = useState(sampleCsv);
  const [parsedRows, setParsedRows] = useState<Array<{ rollNumber: string; courseCode: string; date: string; status: AttendanceStatus; valid: boolean; studentName?: string }>>([]);

  const handleParse = () => {
    const lines = csvContent.trim().split('\n');
    const parsed = lines.map((line) => {
      const [roll, course, date, status] = line.split(',').map((s) => s?.trim());
      const normalizedStatus = (['present', 'late', 'absent', 'excused'].includes(status?.toLowerCase()) 
        ? status.toLowerCase() 
        : 'present') as AttendanceStatus;

      const studentMatch = students.find((s) => s.rollNumber.toLowerCase() === roll?.toLowerCase());

      return {
        rollNumber: roll || '',
        courseCode: course || 'CS-301',
        date: date || '2026-09-24',
        status: normalizedStatus,
        valid: !!studentMatch,
        studentName: studentMatch?.name
      };
    });

    setParsedRows(parsed);
  };

  React.useEffect(() => {
    handleParse();
  }, [csvContent]);

  if (!isOpen) return null;

  const validCount = parsedRows.filter((r) => r.valid).length;

  const handleCommit = () => {
    const validRows = parsedRows.filter((r) => r.valid);
    importBulkRecords(validRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#111622] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Batch CSV Attendance Ledger Import</h3>
              <p className="text-xs text-slate-400">Form 08: High-Volume Attendance Ingestion & Roster Reconciliation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">
                Paste CSV Data (Format: <code className="text-amber-300">RollNumber, CourseCode, Date, Status</code>)
              </label>
              <button
                type="button"
                onClick={() => setCsvContent(sampleCsv)}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Reset to Sample Roster
              </button>
            </div>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Validation Preview Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pre-Ingestion Validation ({validCount}/{parsedRows.length} Valid Records)
              </h4>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden max-h-52 overflow-y-auto bg-slate-950/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
                  <tr>
                    <th className="p-2.5">Roll No</th>
                    <th className="p-2.5">Matched Student</th>
                    <th className="p-2.5">Course</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Validity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-2.5 text-slate-300">{row.rollNumber}</td>
                      <td className="p-2.5 font-sans text-white">{row.studentName || '—'}</td>
                      <td className="p-2.5 text-slate-400">{row.courseCode}</td>
                      <td className="p-2.5 text-slate-400">{row.date}</td>
                      <td className="p-2.5">
                        <span className={`uppercase font-bold ${
                          row.status === 'present' ? 'text-emerald-400' :
                          row.status === 'late' ? 'text-amber-400' :
                          row.status === 'absent' ? 'text-rose-400' : 'text-cyan-400'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-sans">
                        {row.valid ? (
                          <span className="text-emerald-400 inline-flex items-center gap-1 text-[10px]">
                            <Check className="w-3 h-3" /> Valid
                          </span>
                        ) : (
                          <span className="text-rose-400 inline-flex items-center gap-1 text-[10px]">
                            <AlertCircle className="w-3 h-3" /> Unknown Roll
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              type="button"
              onClick={handleCommit}
              disabled={validCount === 0}
              className={`px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-300 to-amber-500 hover:brightness-110 shadow-md flex items-center gap-1.5 ${
                validCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Commit Ingestion ({validCount} Records)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
