import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Search, 
  Building2, 
  AlertTriangle, 
  RotateCcw, 
  X, 
  BookOpen, 
  Phone, 
  Mail, 
  CreditCard,
  Flame,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types/attendance';

interface StudentManagementViewProps {
  onNavigateToRollCallForDept: (dept: string) => void;
  onOpenStudentDossier: (student: Student) => void;
  onOpenEnrollmentModal: () => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  onNavigateToRollCallForDept,
  onOpenStudentDossier,
  onOpenEnrollmentModal,
}) => {
  const { 
    students, 
    departments, 
    selectedDepartment, 
    setSelectedDepartment, 
    deleteStudent, 
    removeAllStudents, 
    restoreDefaultStudents, 
    updateStudent,
    courses,
    addToast
  } = useAttendance();

  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');

  // State for Remove All Confirmation Modal
  const [showRemoveAllConfirm, setShowRemoveAllConfirm] = useState(false);

  // State for Editing Student Modal
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Filter students based on department, search, semester
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesDept = selectedDepartment === 'all' || s.department.toLowerCase() === selectedDepartment.toLowerCase();
      const matchesSearch = 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase());
      const matchesSemester = semesterFilter === 'all' || s.semester.toString() === semesterFilter;

      return matchesDept && matchesSearch && matchesSemester;
    });
  }, [students, selectedDepartment, search, semesterFilter]);

  const handleUpdateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent.id, editingStudent);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Academic Registry & Student Directory</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Student Management & Department Roster
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage matriculated students, assign academic departments, update records, and run departmental attendance rolls.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenEnrollmentModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 text-xs font-bold hover:brightness-110 shadow-md transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>

          {students.length > 0 ? (
            <button
              onClick={() => setShowRemoveAllConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-medium transition-colors"
              title="Purge all current student records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove All Students ({students.length})</span>
            </button>
          ) : (
            <button
              onClick={restoreDefaultStudents}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Sample Roster</span>
            </button>
          )}
        </div>
      </div>

      {/* Department Selector Strip & Direct Roll Call Action */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Department Filter & Attendance Dispatch
            </span>
          </div>

          {selectedDepartment !== 'all' && (
            <button
              onClick={() => onNavigateToRollCallForDept(selectedDepartment)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-xs font-bold hover:brightness-110 shadow-sm transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Perform Attendance for "{selectedDepartment}"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <button
            onClick={() => setSelectedDepartment('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedDepartment === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Departments ({students.length})
          </button>

          {departments.map((dept) => {
            const count = students.filter((s) => s.department.toLowerCase() === dept.toLowerCase()).length;
            const isSelected = selectedDepartment === dept;

            return (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{dept}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-900 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, roll number, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="text-xs text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Semester:</span>
          </label>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Semesters</option>
            <option value="1">Sem 1</option>
            <option value="2">Sem 2</option>
            <option value="3">Sem 3</option>
            <option value="4">Sem 4</option>
            <option value="5">Sem 5</option>
            <option value="6">Sem 6</option>
            <option value="7">Sem 7</option>
            <option value="8">Sem 8</option>
          </select>
        </div>
      </div>

      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No Students Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {students.length === 0
              ? 'All student records have been removed. Click "Restore Sample Roster" or "Add New Student" to begin.'
              : 'No students match the current department or search criteria.'}
          </p>
          {students.length === 0 ? (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={restoreDefaultStudents}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:brightness-110 shadow-md"
              >
                Restore Sample Roster
              </button>
              <button
                onClick={onOpenEnrollmentModal}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Add Student Manually
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setSelectedDepartment('all');
                setSearch('');
                setSemesterFilter('all');
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((st) => {
            const attendancePct = Math.round((st.attendedSessions / (st.totalSessions || 1)) * 100);

            return (
              <motion.div
                key={st.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-lg space-y-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-sm flex items-center justify-center shrink-0 font-mono shadow-sm">
                      {st.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {st.name}
                      </h3>
                      <div className="text-xs font-mono text-slate-400">
                        {st.rollNumber}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        {st.department}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-bold font-mono ${
                      attendancePct >= 90 ? 'text-emerald-400' :
                      attendancePct >= 75 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {attendancePct}%
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Sem {st.semester}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{st.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{st.phone}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <CreditCard className="w-3 h-3 text-amber-400" />
                      {st.rfidTag}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      {st.streak}d streak
                    </span>
                  </div>
                </div>

                {/* Card Action Strip */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onOpenStudentDossier(st)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    View Dossier
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingStudent(st)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                      title="Update Student Information"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteStudent(st.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Remove All Confirmation Modal */}
      {showRemoveAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#161214] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Remove All Student Records?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will permanently delete all <strong className="text-white">{students.length} matriculated students</strong> and purge their attendance ledgers. You can restore sample students at any time.
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowRemoveAllConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeAllStudents();
                  setShowRemoveAllConfirm(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md"
              >
                Yes, Remove All Students
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl bg-[#111622] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-semibold text-white">Update Student Profile</h3>
                  <p className="text-xs text-slate-400">Edit details for {editingStudent.name}</p>
                </div>
              </div>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudentSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Student Name</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">University Roll Identifier</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.rollNumber}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Department</label>
                  <select
                    value={editingStudent.department}
                    onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editingStudent.semester}
                    onChange={(e) => setEditingStudent({ ...editingStudent, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Student Card ID</label>
                  <input
                    type="text"
                    value={editingStudent.rfidTag}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rfidTag: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Emergency Contact</label>
                  <input
                    type="text"
                    value={editingStudent.guardianContact}
                    onChange={(e) => setEditingStudent({ ...editingStudent, guardianContact: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-300 to-amber-500 hover:brightness-110 shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
