import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, UserPlus } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

interface StudentEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentEnrollmentModal: React.FC<StudentEnrollmentModalProps> = ({ isOpen, onClose }) => {
  const { courses, enrollNewStudent, departments } = useAttendance();

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState(`AU-CS-24${Math.floor(10 + Math.random() * 89)}`);
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<'Software Engineering' | 'Computer Science' | 'Artificial Intelligence'>('Computer Science');
  const [semester, setSemester] = useState(6);
  const [rfidTag, setRfidTag] = useState(`RFID-${Math.floor(100000 + Math.random() * 900000)}`);
  const [phone, setPhone] = useState('+1 (555) ');
  const [guardianContact, setGuardianContact] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>(['CS-301', 'CS-402']);

  if (!isOpen) return null;

  const handleToggleCourse = (code: string) => {
    setSelectedCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enrollNewStudent({
      name,
      rollNumber,
      email: email || `${name.toLowerCase().replace(' ', '.')}@attendance.edu`,
      department,
      semester,
      phone,
      guardianContact,
      rfidTag,
      enrolledCourseCodes: selectedCourses,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-[#111622] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Enroll New Student</h3>
              <p className="text-xs text-slate-400">Student Profile & Academic Setup</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Student Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sebastian Saint-Clair"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">University Roll Identifier</label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Academic Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current Semester</label>
              <input
                type="number"
                min={1}
                max={10}
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Student Card ID</label>
              <input
                type="text"
                value={rfidTag}
                onChange={(e) => setRfidTag(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Institutional Email</label>
              <input
                type="email"
                placeholder="s.name@aura.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Contact</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Contact</label>
              <input
                type="text"
                placeholder="e.g. Dr. H. Saint-Clair (+1 555...)"
                value={guardianContact}
                onChange={(e) => setGuardianContact(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Course Enrolments */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Enrolled Course Modules ({selectedCourses.length} selected)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {courses.map((c) => {
                const isSelected = selectedCourses.includes(c.code);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleToggleCourse(c.code)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-[11px] block">{c.code}</span>
                      <span className="truncate block max-w-[170px]">{c.title}</span>
                    </div>
                    {isSelected && <span className="text-amber-400 text-xs">✓</span>}
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
              Enroll Student
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
