import React from 'react';
import { motion } from 'framer-motion';

export default function LegalDisclaimerModal({ onAccept }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 md:p-8 overflow-y-auto custom-card-scroll flex-1">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Important Notice</h2>
          </div>
          
          <div className="space-y-6 text-slate-600 text-sm md:text-base font-medium">
            <div className="bg-amber-50 border border-amber-200/50 p-5 rounded-3xl shadow-sm">
              <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                <span>🚧</span> Beta Testing Phase
              </h3>
              <p className="text-amber-800/80 leading-relaxed text-sm">
                Unkahi is currently in Beta. The platform is provided "as-is" for testing purposes. You may encounter bugs, and data may occasionally be reset. We are not liable for any damages or data loss during this phase.
              </p>
            </div>

            <div className="bg-rose-50 border border-rose-200/50 p-5 rounded-3xl shadow-sm">
              <h3 className="font-bold text-rose-900 mb-2 flex items-center gap-2">
                <span>🚨</span> Not an Emergency Service
              </h3>
              <p className="text-rose-800/80 leading-relaxed text-sm">
                Unkahi is an informational support tool, <strong>not a crisis intervention hotline or medical service.</strong> If you are in immediate danger or experiencing a medical emergency, please contact professional services immediately.
                <br/><br/>
                <strong>In India, please call: 112 (National Emergency), 1098 (Childline), or 181 (Women Helpline).</strong>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-3xl shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span>⚖️</span> Legal & Confidentiality Limits
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                While we strive to protect your privacy, we may be legally mandated under Indian law (including the POCSO Act) to report instances of child abuse or imminent threat to life to appropriate authorities.
              </p>
            </div>
            
            <p className="text-xs text-slate-400 italic text-center pt-2">
              By continuing, you acknowledge that you have read and understood these terms and agree that Unkahi is not a substitute for professional medical or legal advice.
            </p>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-white/50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-end">
          <button
            onClick={() => window.location.replace('https://www.google.com')}
            className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm"
          >
            Leave Site
          </button>
          <button
            onClick={onAccept}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold shadow-lg shadow-slate-800/20 transition-all text-sm flex items-center justify-center gap-2"
          >
            I Understand & Agree <span className="text-lg">→</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
