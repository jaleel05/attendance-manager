import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Student, 
  Course, 
  AttendanceRecord, 
  LeaveApplication, 
  AuditLog, 
  DefaulterNotice,
  AttendanceStatus,
  VerificationMethod,
  User
} from '../types/attendance';
import { 
  INITIAL_STUDENTS, 
  INITIAL_COURSES, 
  INITIAL_ATTENDANCE_RECORDS, 
  INITIAL_LEAVES, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_DEFAULTERS 
} from '../data/initialData';
import { sound } from '../utils/audio';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

const DEFAULT_DEPARTMENTS = [
  'Software Engineering',
  'Computer Science',
  'Artificial Intelligence'
];

const DEFAULT_USER: User = {
  id: 'usr-jaleel',
  name: 'Professor Jaleel',
  email: 'prof.jaleel@attendance.edu',
  role: 'Teacher',
  department: 'All Departments (SE, CS, AI)'
};

interface AttendanceContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;

  students: Student[];
  courses: Course[];
  records: AttendanceRecord[];
  leaves: LeaveApplication[];
  auditLogs: AuditLog[];
  defaulters: DefaulterNotice[];
  
  departments: string[];
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;

  selectedCourseCode: string;
  setSelectedCourseCode: (code: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  
  // Student CRUD operations
  enrollNewStudent: (
    student: Omit<Student, 'id' | 'totalSessions' | 'attendedSessions' | 'lateSessions' | 'excusedSessions' | 'streak' | 'status'>
  ) => void;
  updateStudent: (studentId: string, updatedData: Partial<Student>) => void;
  deleteStudent: (studentId: string) => void;
  removeAllStudents: () => void;
  restoreDefaultStudents: () => void;

  // Attendance Handlers
  markSingleAttendance: (
    studentId: string, 
    status: AttendanceStatus, 
    method?: VerificationMethod, 
    notes?: string,
    checkInTimeStr?: string
  ) => void;
  batchCommitAttendance: (
    courseCode: string, 
    date: string, 
    studentStatusMap: Record<string, AttendanceStatus>,
    operatorName?: string
  ) => void;
  overrideAttendanceRecord: (
    recordId: string, 
    newStatus: AttendanceStatus, 
    justification: string, 
    operatorName?: string
  ) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  submitLeave: (leave: Omit<LeaveApplication, 'id' | 'submittedAt' | 'status'>) => void;
  reviewLeave: (leaveId: string, status: 'approved' | 'rejected', reviewerName?: string) => void;
  dispatchWarningNotice: (notice: Omit<DefaulterNotice, 'id' | 'issuedDate' | 'status'>) => void;
  importBulkRecords: (rows: Array<{ rollNumber: string; courseCode: string; date: string; status: AttendanceStatus }>) => number;
  
  // Analytics queries
  getStudentAttendanceRate: (studentId: string) => number;
  getCourseAttendanceStats: (courseCode: string) => {
    totalRecords: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    rate: number;
  };
  todayStats: {
    totalEnrolledToday: number;
    markedToday: number;
    presentToday: number;
    lateToday: number;
    absentToday: number;
    excusedToday: number;
    todayRate: number;
  };
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('attendance_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('attendance_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Auth state - exclusively Professor Jaleel
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('attendance_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.name.includes('Jaleel') || parsed.email.includes('jaleel'))) {
          return parsed;
        }
      } catch {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const login = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem('attendance_user', JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('attendance_user');
  }, []);

  // Core Data: strictly Software Engineering, Computer Science, and Artificial Intelligence
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('attendance_students_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some((s: Student) => s.department === 'Architecture & Design')) {
          return parsed;
        }
      } catch {
        return INITIAL_STUDENTS;
      }
    }
    return INITIAL_STUDENTS;
  });

  useEffect(() => {
    localStorage.setItem('attendance_students_v2', JSON.stringify(students));
  }, [students]);

  const [departments, setDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS);

  useEffect(() => {
    localStorage.setItem('attendance_departments', JSON.stringify(departments));
  }, [departments]);

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [leaves, setLeaves] = useState<LeaveApplication[]>(INITIAL_LEAVES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [defaulters, setDefaulters] = useState<DefaulterNotice[]>(INITIAL_DEFAULTERS);
  
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('CS-301');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-24');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleSound = useCallback(() => {
    const isMutedNow = sound.toggleMute();
    setSoundEnabled(!isMutedNow);
    addToast(
      !isMutedNow ? 'Acoustic Feedback Enabled' : 'Acoustic Feedback Muted',
      !isMutedNow ? 'Sound synthesize feedback is active' : 'All audio signals muted',
      'info'
    );
  }, [addToast]);

  const getStudentAttendanceRate = useCallback((studentId: string): number => {
    const student = students.find((s) => s.id === studentId);
    if (!student || student.totalSessions === 0) return 0;
    const effectiveAttended = student.attendedSessions + (student.lateSessions * 0.5);
    return Math.min(100, Math.round((effectiveAttended / student.totalSessions) * 1000) / 10);
  }, [students]);

  // Recalculate student stats after record additions or overrides
  const refreshStudentStats = useCallback((updatedRecords: AttendanceRecord[]) => {
    setStudents((prevStudents) => {
      return prevStudents.map((st) => {
        const studentRecs = updatedRecords.filter((r) => r.studentId === st.id);
        const presentCount = studentRecs.filter((r) => r.status === 'present').length;
        const lateCount = studentRecs.filter((r) => r.status === 'late').length;
        const excusedCount = studentRecs.filter((r) => r.status === 'excused').length;
        const absentCount = studentRecs.filter((r) => r.status === 'absent').length;

        const totalMarked = presentCount + lateCount + excusedCount + absentCount;
        const baseSessions = Math.max(st.totalSessions, totalMarked);
        const totalAttended = presentCount;

        const effectiveAttended = totalAttended + (lateCount * 0.5) + excusedCount;
        const rate = baseSessions > 0 ? (effectiveAttended / baseSessions) * 100 : 100;

        let status: Student['status'] = 'good';
        if (rate >= 92) status = 'honors';
        else if (rate >= 75) status = 'good';
        else if (rate >= 65) status = 'warning';
        else status = 'critical';

        return {
          ...st,
          totalSessions: baseSessions,
          attendedSessions: totalAttended,
          lateSessions: lateCount,
          excusedSessions: excusedCount,
          status,
        };
      });
    });
  }, []);

  // Student CRUD operations
  const enrollNewStudent = useCallback((
    studentData: Omit<Student, 'id' | 'totalSessions' | 'attendedSessions' | 'lateSessions' | 'excusedSessions' | 'streak' | 'status'>
  ) => {
    const newStudent: Student = {
      ...studentData,
      id: `s-${Date.now()}`,
      totalSessions: 1,
      attendedSessions: 1,
      lateSessions: 0,
      excusedSessions: 0,
      streak: 1,
      status: 'good'
    };

    setStudents((prev) => [newStudent, ...prev]);
    sound.playCheckInSuccess();
    addToast(
      'Student Added',
      `${newStudent.name} (${newStudent.rollNumber}) enrolled in ${newStudent.department}.`,
      'success'
    );
  }, [addToast]);

  const updateStudent = useCallback((studentId: string, updatedData: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...updatedData } : s))
    );
    sound.playTick();
    addToast('Student Updated', 'Student profile successfully updated.', 'info');
  }, [addToast]);

  const deleteStudent = useCallback((studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setRecords((prev) => prev.filter((r) => r.studentId !== studentId));
    sound.playAbsent();
    addToast(
      'Student Removed',
      target ? `${target.name} was removed from the roster.` : 'Student deleted.',
      'warning'
    );
  }, [students, addToast]);

  const removeAllStudents = useCallback(() => {
    const count = students.length;
    setStudents([]);
    setRecords([]);
    sound.playAbsent();
    addToast(
      'All Students Removed',
      `Purged all ${count} student records and attendance ledgers.`,
      'error'
    );
  }, [students.length, addToast]);

  const restoreDefaultStudents = useCallback(() => {
    setStudents(INITIAL_STUDENTS);
    setRecords(INITIAL_ATTENDANCE_RECORDS);
    sound.playFlourish();
    addToast(
      'Default Roster Restored',
      `Restored ${INITIAL_STUDENTS.length} sample matriculated students.`,
      'success'
    );
  }, [addToast]);

  // Attendance Handlers
  const markSingleAttendance = useCallback((
    studentId: string, 
    status: AttendanceStatus, 
    method: VerificationMethod = 'rfid_badge', 
    notes?: string,
    checkInTimeStr?: string
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const course = courses.find((c) => c.code === selectedCourseCode) || courses[0];
    const now = new Date();
    const timeFormatted = checkInTimeStr || now.toTimeString().split(' ')[0];

    const existingIndex = records.findIndex(
      (r) => r.studentId === studentId && r.courseCode === selectedCourseCode && r.date === selectedDate
    );

    let updatedRecords: AttendanceRecord[];

    if (existingIndex >= 0) {
      const oldRec = records[existingIndex];
      const updatedRec: AttendanceRecord = {
        ...oldRec,
        status,
        checkInTime: status === 'absent' ? '--:--:--' : timeFormatted,
        verificationMethod: method,
        notes: notes || oldRec.notes,
        verifiedAt: new Date().toISOString()
      };
      updatedRecords = [...records];
      updatedRecords[existingIndex] = updatedRec;
    } else {
      const newRec: AttendanceRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        studentId,
        studentRoll: student.rollNumber,
        studentName: student.name,
        courseCode: selectedCourseCode,
        date: selectedDate,
        timeSlot: course.timeSlot,
        status,
        checkInTime: status === 'absent' ? '--:--:--' : timeFormatted,
        verificationMethod: method,
        notes,
        markedBy: currentUser?.name || 'Faculty Instructor',
        verifiedAt: new Date().toISOString()
      };
      updatedRecords = [newRec, ...records];
    }

    setRecords(updatedRecords);
    refreshStudentStats(updatedRecords);

    if (status === 'present') {
      sound.playCheckInSuccess();
      addToast(
        'Attendance Recorded: Present',
        `${student.name} (${student.rollNumber}) marked present at ${timeFormatted}`,
        'success'
      );
    } else if (status === 'late') {
      sound.playLateWarning();
      addToast(
        'Attendance Recorded: Late Arrival',
        `${student.name} marked late at ${timeFormatted}`,
        'warning'
      );
    } else if (status === 'absent') {
      sound.playAbsent();
      addToast(
        'Attendance Recorded: Absent',
        `${student.name} marked absent for ${course.code}`,
        'error'
      );
    } else if (status === 'excused') {
      sound.playTick();
      addToast(
        'Attendance Recorded: Excused Leave',
        `${student.name} marked excused under official leave policy`,
        'info'
      );
    }
  }, [students, courses, selectedCourseCode, selectedDate, records, currentUser, refreshStudentStats, addToast]);

  const batchCommitAttendance = useCallback((
    courseCode: string, 
    date: string, 
    studentStatusMap: Record<string, AttendanceStatus>,
    operatorName?: string
  ) => {
    const course = courses.find((c) => c.code === courseCode) || courses[0];
    const now = new Date();
    const timeFormatted = now.toTimeString().split(' ')[0];

    const newRecords: AttendanceRecord[] = [];
    const updatedRecords = records.filter(
      (r) => !(r.courseCode === courseCode && r.date === date)
    );

    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    Object.entries(studentStatusMap).forEach(([studentId, status]) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;

      if (status === 'present') presentCount++;
      else if (status === 'late') lateCount++;
      else if (status === 'absent') absentCount++;
      else if (status === 'excused') excusedCount++;

      newRecords.push({
        id: `rec-batch-${Date.now()}-${studentId}`,
        studentId,
        studentRoll: student.rollNumber,
        studentName: student.name,
        courseCode,
        date,
        timeSlot: course.timeSlot,
        status,
        checkInTime: status === 'absent' ? '--:--:--' : timeFormatted,
        verificationMethod: 'faculty_register',
        notes: `Digitally signed by ${operatorName || currentUser?.name || 'Lead Instructor'}`,
        markedBy: operatorName || currentUser?.name || 'Lead Instructor',
        verifiedAt: new Date().toISOString()
      });
    });

    const finalRecords = [...newRecords, ...updatedRecords];
    setRecords(finalRecords);
    refreshStudentStats(finalRecords);

    sound.playFlourish();
    addToast(
      'Session Register Signed & Committed',
      `Committed ${newRecords.length} records (${presentCount} Present, ${lateCount} Late, ${absentCount} Absent, ${excusedCount} Excused).`,
      'success'
    );
  }, [courses, records, students, currentUser, refreshStudentStats, addToast]);

  const overrideAttendanceRecord = useCallback((
    recordId: string, 
    newStatus: AttendanceStatus, 
    justification: string, 
    operatorName?: string
  ) => {
    const oldRecord = records.find((r) => r.id === recordId);
    if (!oldRecord) return;

    const oldStatus = oldRecord.status;
    const updated = records.map((r) => {
      if (r.id !== recordId) return r;
      return {
        ...r,
        status: newStatus,
        notes: `Statutory Override by ${operatorName || currentUser?.name || 'Registrar'}: ${justification}`,
        verifiedAt: new Date().toISOString(),
      };
    });

    setRecords(updated);
    refreshStudentStats(updated);

    const logEntry: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: operatorName || currentUser?.name || 'Registrar',
      action: 'ATTENDANCE_OVERRIDE',
      recordId,
      oldStatus,
      newStatus,
      justification
    };
    setAuditLogs((prev) => [logEntry, ...prev]);

    sound.playTick();
    addToast(
      'Record Overridden & Audited',
      `Changed status for ${oldRecord.studentName} from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`,
      'info'
    );
  }, [records, currentUser, refreshStudentStats, addToast]);

  const addCourse = useCallback((courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `c-${Date.now()}`
    };
    setCourses((prev) => [...prev, newCourse]);
    sound.playTick();
    addToast(
      'Course Curriculum Added',
      `${newCourse.code}: ${newCourse.title} is now scheduled.`,
      'success'
    );
  }, [addToast]);

  const submitLeave = useCallback((
    leaveData: Omit<LeaveApplication, 'id' | 'submittedAt' | 'status'>
  ) => {
    const newLeave: LeaveApplication = {
      ...leaveData,
      id: `lv-${Date.now()}`,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending'
    };
    setLeaves((prev) => [newLeave, ...prev]);
    sound.playTick();
    addToast(
      'Leave Exemption Requested',
      `Exemption request logged for ${leaveData.studentName} (${leaveData.courseCode}).`,
      'info'
    );
  }, [addToast]);

  const reviewLeave = useCallback((leaveId: string, status: 'approved' | 'rejected', reviewerName: string = 'Dean of Academic Affairs') => {
    setLeaves((prev) => prev.map((lv) => {
      if (lv.id !== leaveId) return lv;
      return {
        ...lv,
        status,
        reviewedBy: reviewerName
      };
    }));

    if (status === 'approved') {
      const targetLeave = leaves.find((l) => l.id === leaveId);
      if (targetLeave) {
        setRecords((prevRecs) => prevRecs.map((r) => {
          if (r.studentId === targetLeave.studentId && r.courseCode === targetLeave.courseCode) {
            if (r.date >= targetLeave.startDate && r.date <= targetLeave.endDate) {
              return {
                ...r,
                status: 'excused',
                notes: `Approved Leave #${targetLeave.id}: ${targetLeave.reason}`
              };
            }
          }
          return r;
        }));
      }
    }

    sound.playTick();
    addToast(
      `Leave Request ${status.toUpperCase()}`,
      `Application updated by ${reviewerName}.`,
      status === 'approved' ? 'success' : 'warning'
    );
  }, [leaves, addToast]);

  const dispatchWarningNotice = useCallback((
    noticeData: Omit<DefaulterNotice, 'id' | 'issuedDate' | 'status'>
  ) => {
    const newNotice: DefaulterNotice = {
      ...noticeData,
      id: `def-${Date.now()}`,
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'dispatched'
    };
    setDefaulters((prev) => [newNotice, ...prev]);
    sound.playAbsent();
    addToast(
      'Official Defaulter Notice Dispatched',
      `${noticeData.warningLevel} sent to ${noticeData.studentName} (${noticeData.currentRate}% attendance).`,
      'warning'
    );
  }, [addToast]);

  const importBulkRecords = useCallback((rows: Array<{ rollNumber: string; courseCode: string; date: string; status: AttendanceStatus }>) => {
    let successCount = 0;
    const newRecords: AttendanceRecord[] = [];

    rows.forEach((row) => {
      const student = students.find((s) => s.rollNumber.trim().toLowerCase() === row.rollNumber.trim().toLowerCase());
      if (student) {
        newRecords.push({
          id: `rec-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          studentId: student.id,
          studentRoll: student.rollNumber,
          studentName: student.name,
          courseCode: row.courseCode.trim().toUpperCase(),
          date: row.date.trim(),
          timeSlot: '09:00 AM - 10:30 AM',
          status: row.status,
          checkInTime: row.status === 'absent' ? '--:--:--' : '09:00:00',
          verificationMethod: 'kiosk_punch',
          notes: 'Batch imported via CSV Ledger file',
          markedBy: 'Batch System Ingestion',
          verifiedAt: new Date().toISOString()
        });
        successCount++;
      }
    });

    if (successCount > 0) {
      const allUpdated = [...newRecords, ...records];
      setRecords(allUpdated);
      refreshStudentStats(allUpdated);
      sound.playFlourish();
      addToast(
        'CSV Ledger Ingestion Complete',
        `Successfully integrated ${successCount} attendance records.`,
        'success'
      );
    }
    return successCount;
  }, [students, records, refreshStudentStats, addToast]);

  const getCourseAttendanceStats = useCallback((courseCode: string) => {
    const courseRecs = records.filter((r) => r.courseCode === courseCode);
    const present = courseRecs.filter((r) => r.status === 'present').length;
    const late = courseRecs.filter((r) => r.status === 'late').length;
    const absent = courseRecs.filter((r) => r.status === 'absent').length;
    const excused = courseRecs.filter((r) => r.status === 'excused').length;
    const totalRecords = courseRecs.length;
    const effectiveAttended = present + (late * 0.5) + excused;
    const rate = totalRecords > 0 ? Math.round((effectiveAttended / totalRecords) * 1000) / 10 : 100;

    return { totalRecords, present, late, absent, excused, rate };
  }, [records]);

  const todayStats = useMemo(() => {
    const todayRecs = records.filter((r) => r.date === selectedDate);
    const presentToday = todayRecs.filter((r) => r.status === 'present').length;
    const lateToday = todayRecs.filter((r) => r.status === 'late').length;
    const absentToday = todayRecs.filter((r) => r.status === 'absent').length;
    const excusedToday = todayRecs.filter((r) => r.status === 'excused').length;
    const markedToday = todayRecs.length;
    const totalEnrolledToday = students.length;
    const effectivePresent = presentToday + (lateToday * 0.5) + excusedToday;
    const todayRate = markedToday > 0 ? Math.round((effectivePresent / markedToday) * 1000) / 10 : 94.2;

    return {
      totalEnrolledToday,
      markedToday,
      presentToday,
      lateToday,
      absentToday,
      excusedToday,
      todayRate
    };
  }, [records, selectedDate, students]);

  return (
    <AttendanceContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        login,
        logout,
        students,
        courses,
        records,
        leaves,
        auditLogs,
        defaulters,
        departments,
        selectedDepartment,
        setSelectedDepartment,
        selectedCourseCode,
        setSelectedCourseCode,
        selectedDate,
        setSelectedDate,
        soundEnabled,
        toggleSound,
        toasts,
        addToast,
        removeToast,
        enrollNewStudent,
        updateStudent,
        deleteStudent,
        removeAllStudents,
        restoreDefaultStudents,
        markSingleAttendance,
        batchCommitAttendance,
        overrideAttendanceRecord,
        addCourse,
        submitLeave,
        reviewLeave,
        dispatchWarningNotice,
        importBulkRecords,
        getStudentAttendanceRate,
        getCourseAttendanceStats,
        todayStats
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
