import React from 'react';
import { Volume2, VolumeX, Zap, Sun, Moon, LogOut } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  onOpenQuickPunch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  onOpenQuickPunch
}) => {
  const handleTabChange = onSelectTab || setActiveTab || (() => {});
  const { 
    soundEnabled, 
    toggleSound, 
    theme, 
    toggleTheme, 
    currentUser, 
    logout 
  } = useAttendance();

  // Navigation Links: SQL Explorer removed, Students page added!
  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'students', label: 'Students' },
    { id: 'rollcall', label: 'Roll Register' },
    { id: 'ledger', label: 'Master Ledger' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0f17]/90 dark:bg-[#0b0f17]/90 bg-white/90 backdrop-blur-xl border-b border-slate-800/80 dark:border-slate-800/80 border-slate-200 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark: Attendance Manager */}
        <button
          onClick={() => handleTabChange('dashboard')}
          className="text-lg font-bold tracking-tight text-white dark:text-white text-slate-900 hover:text-amber-400 transition-colors flex items-center gap-2 text-left shrink-0"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
          <span className="font-serif tracking-wider uppercase text-base bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 dark:from-amber-200 dark:via-yellow-100 dark:to-amber-400 from-amber-600 to-amber-700 bg-clip-text text-transparent">
            Attendance Manager
          </span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400 dark:text-slate-400 text-slate-600">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleTabChange(link.id)}
                className={`relative py-1 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-amber-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 dark:text-slate-400 dark:hover:text-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions & User Bar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Change Toggle Button (Light or Dark) */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2 rounded-xl border border-slate-800 dark:border-slate-800 border-slate-300 bg-slate-900/60 dark:bg-slate-900/60 bg-slate-100 text-slate-300 dark:text-slate-300 text-slate-700 hover:text-amber-400 transition-all active:scale-95"
            title={`Active Theme: ${theme.toUpperCase()}. Click to switch.`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in fade-in" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 animate-in fade-in" />
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute audio feedback' : 'Enable audio feedback'}
            className="p-2 rounded-xl border border-slate-800 dark:border-slate-800 border-slate-300 bg-slate-900/60 dark:bg-slate-900/60 bg-slate-100 text-slate-400 hover:text-amber-400 transition-colors"
            title={soundEnabled ? 'Acoustic Feedback: ON' : 'Acoustic Feedback: OFF'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quick Punch Action CTA */}
          <button
            onClick={onOpenQuickPunch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Quick Punch</span>
          </button>

          {/* Teacher Profile & Logout (NO PHOTO) */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800 dark:border-slate-800 border-slate-300">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                {currentUser.name.includes('Jaleel') ? 'PJ' : currentUser.name.replace(/^(Prof\.|Dr\.|Professor)\s*/, '').trim().substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-white dark:text-white text-slate-900 truncate max-w-[140px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {currentUser.role} · SE, CS & AI
                </span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                title="Sign out of Attendance Manager"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="flex lg:hidden items-center justify-around gap-1 pt-2.5 mt-2 border-t border-slate-800/60 dark:border-slate-800/60 border-slate-200 text-xs">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => handleTabChange(link.id)}
              className={`px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'bg-amber-400/15 text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
