import React from 'react';
import { motion } from 'framer-motion';

export default function LegalDisclaimerModal({ onAccept }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-[2.5rem] w-full max-w-md overflow-hidden flex flex-col p-6 sm:p-8 text-center relative"
      >
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400" />
        
        <div className="flex flex-col items-center mb-6 mt-2">
          <span className="text-4xl mb-3 animate-pulse">⚠️</span>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Clinical & Privacy Notice</h2>
          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 mt-2">Active Telemetry Consent</span>
        </div>

        <div className="space-y-4 text-slate-600 text-xs font-semibold leading-relaxed text-left mb-8">
          <div className="flex gap-3 items-start">
            <span className="text-base leading-none">🚧</span>
            <p>
              <strong className="text-slate-800">Beta Assessment Phase:</strong> Unkahi is an experimental self-reflection tool under active development. Calculations may adjust over time.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-base leading-none">🚨</span>
            <p>
              <strong className="text-slate-800">Not a Crisis Service:</strong> This is a peer self-reflection tool, not a medical or emergency hotline. In immediate crisis, call <span className="text-rose-600 font-bold">112</span> or <span className="text-rose-600 font-bold">1800-599-0019</span> (KIRAN).
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-base leading-none">🔒</span>
            <p>
              <strong className="text-slate-800">On-Device Privacy First:</strong> Your answers are encrypted locally. However, if mandatory reporting thresholds are crossed (e.g. POCSO Act), we respect sovereign reporting compliance laws.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-center">
          <button
            onClick={() => window.location.replace('https://www.google.com')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full font-bold text-slate-400 hover:text-slate-600 transition-all text-xs"
          >
            Leave Site
          </button>
          <button
            onClick={onAccept}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold shadow-lg shadow-slate-800/10 transition-all text-xs flex items-center justify-center gap-1.5"
          >
            Accept & Enter <span>→</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
