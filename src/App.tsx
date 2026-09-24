import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { StudentManagementView } from './components/StudentManagementView';
import { RollCallRegisterView } from './components/RollCallRegisterView';
import { MasterLedgerView } from './components/MasterLedgerView';
import { QuickPunchModal } from './components/QuickPunchModal';
import { BatchSessionFormModal } from './components/BatchSessionFormModal';
import { LeaveRequestModal } from './components/LeaveRequestModal';
import { StudentEnrollmentModal } from './components/StudentEnrollmentModal';
import { CoursePlannerModal } from './components/CoursePlannerModal';
import { AttendanceCorrectionModal } from './components/AttendanceCorrectionModal';
import { CsvImportModal } from './components/CsvImportModal';
import { DefaulterNoticeModal } from './components/DefaulterNoticeModal';
import { StudentDossierModal } from './components/StudentDossierModal';
import { PrintableLedgerModal } from './components/PrintableLedgerModal';
import { Student } from './types/attendance';

export function AttendanceApp() {
  const { currentUser, setSelectedDepartment, theme } = useAttendance();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isQuickPunchOpen, setIsQuickPunchOpen] = useState(false);
  const [isBatchSessionOpen, setIsBatchSessionOpen] = useState(false);
  const [isLeaveRequestOpen, setIsLeaveRequestOpen] = useState(false);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [isCoursePlannerOpen, setIsCoursePlannerOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [correctionRecordId, setCorrectionRecordId] = useState<string | undefined>();
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isDefaulterNoticeOpen, setIsDefaulterNoticeOpen] = useState(false);
  const [defaulterTargetStudent, setDefaulterTargetStudent] = useState<Student | undefined>();
  const [selectedDossierStudent, setSelectedDossierStudent] = useState<Student | null>(null);
  const [isPrintableLedgerOpen, setIsPrintableLedgerOpen] = useState(false);

  // If user is not logged in, show Login Page!
  if (!currentUser) {
    return (
      <div className={theme === 'light' ? 'light-theme' : 'dark'}>
        <LoginPage />
        <ToastContainer />
      </div>
    );
  }

  // Handlers
  const handleOpenCorrection = (recordId: string) => {
    setCorrectionRecordId(recordId);
    setIsCorrectionOpen(true);
  };

  const handleOpenDefaulterNotice = (student?: Student) => {
    setDefaulterTargetStudent(student);
    setIsDefaulterNoticeOpen(true);
  };

  const handleNavigateToRollCallForDept = (dept: string) => {
    setSelectedDepartment(dept);
    setActiveTab('rollcall');
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'light-theme bg-slate-50 text-slate-900' : 'dark bg-[#0b0f17] text-slate-100'} flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 transition-colors`}>
      {/* Top Bar Navigation: Attendance Manager + Light/Dark Theme + Students Page */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickPunch={() => setIsQuickPunchOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={setActiveTab}
                onOpenQuickPunch={() => setIsQuickPunchOpen(true)}
                onOpenEnrollment={() => setIsEnrollmentOpen(true)}
                onOpenCoursePlanner={() => setIsCoursePlannerOpen(true)}
                onOpenLeaveRequest={() => setIsLeaveRequestOpen(true)}
                onOpenBatchSession={() => setIsBatchSessionOpen(true)}
                onOpenDefaulterNotice={handleOpenDefaulterNotice}
                onOpenStudentDossier={(st) => setSelectedDossierStudent(st)}
              />
            )}

            {activeTab === 'students' && (
              <StudentManagementView
                onNavigateToRollCallForDept={handleNavigateToRollCallForDept}
                onOpenStudentDossier={(st) => setSelectedDossierStudent(st)}
                onOpenEnrollmentModal={() => setIsEnrollmentOpen(true)}
              />
            )}

            {activeTab === 'rollcall' && <RollCallRegisterView />}

            {activeTab === 'ledger' && (
              <MasterLedgerView
                onOpenCorrection={handleOpenCorrection}
                onOpenStudentDossier={(st) => setSelectedDossierStudent(st)}
                onOpenPrintableLedger={() => setIsPrintableLedgerOpen(true)}
                onOpenCsvImport={() => setIsCsvImportOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 px-4 sm:px-6 lg:px-8 print:hidden text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-amber-400">Attendance Manager</span>
            <span>· Academic Turnout Intelligence & Department Registry</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Software Engineering</span>
            <span aria-hidden="true">·</span>
            <span>Computer Science</span>
            <span aria-hidden="true">·</span>
            <span>Artificial Intelligence</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <QuickPunchModal
        isOpen={isQuickPunchOpen}
        onClose={() => setIsQuickPunchOpen(false)}
      />

      <BatchSessionFormModal
        isOpen={isBatchSessionOpen}
        onClose={() => setIsBatchSessionOpen(false)}
      />

      <LeaveRequestModal
        isOpen={isLeaveRequestOpen}
        onClose={() => setIsLeaveRequestOpen(false)}
      />

      <StudentEnrollmentModal
        isOpen={isEnrollmentOpen}
        onClose={() => setIsEnrollmentOpen(false)}
      />

      <CoursePlannerModal
        isOpen={isCoursePlannerOpen}
        onClose={() => setIsCoursePlannerOpen(false)}
      />

      <AttendanceCorrectionModal
        isOpen={isCorrectionOpen}
        onClose={() => {
          setIsCorrectionOpen(false);
          setCorrectionRecordId(undefined);
        }}
        initialRecordId={correctionRecordId}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />

      <DefaulterNoticeModal
        isOpen={isDefaulterNoticeOpen}
        onClose={() => {
          setIsDefaulterNoticeOpen(false);
          setDefaulterTargetStudent(undefined);
        }}
        targetStudent={defaulterTargetStudent}
      />

      <StudentDossierModal
        student={selectedDossierStudent}
        onClose={() => setSelectedDossierStudent(null)}
        onOpenDefaulterNotice={handleOpenDefaulterNotice}
      />

      <PrintableLedgerModal
        isOpen={isPrintableLedgerOpen}
        onClose={() => setIsPrintableLedgerOpen(false)}
      />

      {/* Toast Notification Stack */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <AttendanceApp />
    </AttendanceProvider>
  );
}
