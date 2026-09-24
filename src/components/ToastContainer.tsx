import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAttendance();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
                isSuccess
                  ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100'
                  : isWarning
                  ? 'bg-amber-950/80 border-amber-500/30 text-amber-100'
                  : isError
                  ? 'bg-rose-950/80 border-rose-500/30 text-rose-100'
                  : 'bg-slate-900/90 border-slate-700/60 text-slate-100'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {isError && <XCircle className="w-5 h-5 text-rose-400" />}
                {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-cyan-400" />}
              </div>

              <div className="flex-1 pr-2">
                <h4 className="text-sm font-semibold tracking-wide">{toast.title}</h4>
                <p className="text-xs text-slate-300/90 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
