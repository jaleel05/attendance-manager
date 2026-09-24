export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type VerificationMethod = 
  | 'biometric' 
  | 'rfid_badge' 
  | 'faculty_register' 
  | 'qr_mobile' 
  | 'kiosk_punch';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Teacher';
  department: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  department: 'Computer Science' | 'Software Engineering' | 'Artificial Intelligence' | string;
  semester: number;
  phone: string;
  guardianContact: string;
  rfidTag: string;
  enrolledCourseCodes: string[];
  totalSessions: number;
  attendedSessions: number;
  lateSessions: number;
  excusedSessions: number;
  streak: number;
  status: 'honors' | 'good' | 'warning' | 'critical';
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: 'Computer Science' | 'Software Engineering' | 'Artificial Intelligence' | string;
  credits: number;
  instructor: string;
  room: string;
  scheduleDays: string[];
  timeSlot: string;
  minAttendancePercent: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentRoll: string;
  studentName: string;
  courseCode: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  status: AttendanceStatus;
  checkInTime: string; // HH:mm:ss
  verificationMethod: VerificationMethod;
  notes?: string;
  markedBy: string;
  verifiedAt: string;
}

export interface LeaveApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  courseCode: string;
  startDate: string;
  endDate: string;
  type: 'medical' | 'official_duty' | 'conference' | 'personal_emergency';
  reason: string;
  documentName?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  recordId: string;
  oldStatus?: string;
  newStatus?: string;
  justification: string;
}

export interface DefaulterNotice {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  courseCode: string;
  currentRate: number;
  threshold: number;
  warningLevel: 'Advisory (Level 1)' | 'First Warning (Level 2)' | 'Debarment Notice (Level 3)';
  issuedDate: string;
  status: 'dispatched' | 'acknowledged';
}
