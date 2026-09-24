import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, Download, Check } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

interface PrintableLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableLedgerModal: React.FC<PrintableLedgerModalProps> = ({ isOpen, onClose }) => {
  const { students, courses, selectedCourseCode, selectedDate, records, addToast } = useAttendance();

  if (!isOpen) return null;

  const activeCourse = courses.find((c) => c.code === selectedCourseCode) || courses[0];
  const enrolledStudents = students.filter((s) => s.enrolledCourseCodes.includes(selectedCourseCode));

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    addToast(
      'Exporting Official PDF Ledger',
      `Document generated for ${selectedCourseCode} (${selectedDate}). Ready for registrar archive.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md print:p-0 print:bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:border-0 print:max-h-none print:shadow-none print:bg-white"
      >
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Printable Archival Attendance Ledger
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 text-xs font-bold hover:brightness-110 transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Register</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Archival Ledger Sheet */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-6 print:overflow-visible">
          {/* Official University Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600 font-serif">
              Office of the Academic Registrar & Student Affairs
            </div>
            <h1 className="text-2xl font-serif font-extrabold tracking-wide uppercase text-slate-900 mt-1">
              Aura University of Advanced Sciences
            </h1>
            <div className="text-xs text-slate-600 font-serif italic mt-0.5">
              Official Sealed Roll-Call Attendance Dossier & Course Register
            </div>
          </div>

          {/* Session Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs mb-6">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Course Module:</span>
              <span className="font-bold text-slate-900">{activeCourse.code}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Instructor:</span>
              <span className="font-medium text-slate-900">{activeCourse.instructor}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Session Date:</span>
              <span className="font-mono font-medium text-slate-900">{selectedDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Lecture Venue:</span>
              <span className="text-slate-900">{activeCourse.room}</span>
            </div>
          </div>

          {/* Ledger Table */}
          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead className="bg-slate-100 text-slate-700 text-[11px] uppercase font-semibold">
              <tr>
                <th className="border border-slate-300 p-2 text-center w-10">#</th>
                <th className="border border-slate-300 p-2">Student Roll ID</th>
                <th className="border border-slate-300 p-2">Matriculated Name</th>
                <th className="border border-slate-300 p-2">Department</th>
                <th className="border border-slate-300 p-2 text-center">Check-In Time</th>
                <th className="border border-slate-300 p-2 text-center">Method</th>
                <th className="border border-slate-300 p-2 text-center">Status</th>
                <th className="border border-slate-300 p-2 text-right">Cum. %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {enrolledStudents.map((st, idx) => {
                const rec = records.find(
                  (r) => r.studentId === st.id && r.courseCode === selectedCourseCode && r.date === selectedDate
                );
                const status = rec?.status || 'unmarked';
                const rate = Math.round((st.attendedSessions / st.totalSessions) * 100);

                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center font-mono text-[10px] text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 p-2 font-mono font-medium text-slate-900">
                      {st.rollNumber}
                    </td>
                    <td className="border border-slate-300 p-2 font-medium text-slate-900">
                      {st.name}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-600">
                      {st.department}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono tabular-nums text-slate-700">
                      {rec?.checkInTime || '--:--:--'}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono text-[10px] text-slate-600 uppercase">
                      {rec?.verificationMethod ? rec.verificationMethod.replace('_', ' ') : 'REGISTER'}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold uppercase text-[11px]">
                      <span className={
                        status === 'present' ? 'text-emerald-700' :
                        status === 'late' ? 'text-amber-700' :
                        status === 'absent' ? 'text-rose-700' :
                        status === 'excused' ? 'text-sky-700' : 'text-slate-400'
                      }>
                        {status}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Signatures & Seal Block */}
          <div className="grid grid-cols-3 gap-6 pt-10 mt-8 border-t border-slate-300 text-xs text-slate-700">
            <div className="text-center pt-8 border-t border-slate-400">
              <div className="font-serif italic text-sm text-slate-900 font-bold">Professor Jaleel</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Lead Instructor (SE, CS, AI)</div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600 flex items-center justify-center text-amber-700 font-serif font-bold text-xs uppercase text-center p-2">
                AURA SEAL
              </div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 mt-1">Official Registry Stamp</div>
            </div>

            <div className="text-center pt-8 border-t border-slate-400">
              <div className="font-serif italic text-sm text-slate-900">Dr. M. Kensington</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Dean of Academic Affairs</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
