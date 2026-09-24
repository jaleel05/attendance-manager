import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, ShieldCheck, ArrowRight, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { User } from '../types/attendance';

export const LoginPage: React.FC = () => {
  const { login, addToast } = useAttendance();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sole authorized instructor for all departments (Software Engineering, Computer Science, and Artificial Intelligence)
  const PROFESSOR_JALEEL: User = {
    id: 'usr-jaleel',
    name: 'Professor Jaleel',
    email: 'prof.jaleel@attendance.edu',
    role: 'Teacher',
    department: 'Software Engineering, CS & AI'
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      ...PROFESSOR_JALEEL,
      email: email.trim() || PROFESSOR_JALEEL.email
    });
    addToast('Authenticated', 'Welcome back, Professor Jaleel', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-slate-900/90 border border-amber-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl relative z-10 space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            <GraduationCap className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold font-serif uppercase tracking-widest text-white mt-3">
            Attendance Manager
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Faculty & Teacher Portal</span>
          </div>
          <p className="text-xs text-slate-400">
            Instructor Portal · Software Engineering, Computer Science & AI
          </p>
        </div>

        {/* Exclusive Teacher Profile Card (NO PHOTO, NO PERSONAL EMAIL, NO EXPRESS BUTTON) */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-base flex items-center justify-center shrink-0 font-mono shadow-md">
              PJ
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white truncate">Professor Jaleel</h3>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <p className="text-xs text-amber-400 font-medium">Lead Instructor / Teacher</p>
              <p className="text-[11px] text-slate-400">Sole Authorized Academic Faculty</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1.5 font-mono uppercase tracking-wider">
              Assigned Academic Disciplines:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                Software Engineering
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                Computer Science
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                Artificial Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Teacher Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Teacher Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Enter teacher email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Sign In as Professor Jaleel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-1 text-[11px] text-slate-500 font-mono">
          Only Professor Jaleel is authorized to access and mark attendance.
        </div>
      </motion.div>
    </div>
  );
};
