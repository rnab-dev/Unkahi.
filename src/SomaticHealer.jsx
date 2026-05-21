import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SomaticHealer({ onBack }) {
  const [phase, setPhase] = useState('intro'); // 'intro', 'polyvagal', 'pmr', 'done'

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-emerald-500/10 rounded-[3rem] px-6 py-10 sm:px-12 sm:pt-10 sm:pb-16 mt-6 sm:mt-10 max-w-4xl w-full mx-auto flex flex-col items-center transform-gpu relative overflow-hidden min-h-[600px]">
      
      {/* Background Ambience based on phase */}
      <AnimatePresence>
        {phase === 'polyvagal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-blue-100/50 to-transparent z-0 pointer-events-none"
          />
        )}
        {phase === 'pmr' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-emerald-100/50 to-transparent z-0 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex items-start justify-start w-full relative z-10">
        <button onClick={onBack} className="text-slate-400 hover:text-emerald-600 font-bold uppercase tracking-widest text-xs transition-colors mb-6 sm:mb-8">
          ← Return
        </button>
      </div>

      <div className="w-full flex-grow flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {phase === 'intro' && <IntroPhase onStart={() => setPhase('polyvagal')} key="intro" />}
          {phase === 'polyvagal' && <PolyvagalPhase onNext={() => setPhase('pmr')} key="polyvagal" />}
          {phase === 'pmr' && <PMRPhase onFinish={() => setPhase('done')} key="pmr" />}
          {phase === 'done' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center" key="done"
            >
              <h2 className="text-4xl font-extrabold text-emerald-600 mb-6">Restored.</h2>
              <p className="text-xl text-slate-500 font-medium max-w-md mx-auto mb-10">
                You have manually shifted your nervous system back into safety.
              </p>
              <button onClick={onBack} className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold shadow-md hover:bg-emerald-700 transition-all">
                Return to Your Data
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Intro Phase ─────────────────────────────────────────────────────────────
function IntroPhase({ onStart }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center flex flex-col items-center"
    >
      <span className="text-6xl mb-6">🧬</span>
      <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-700 tracking-tight mb-4">Somatic Healer</h2>
      <p className="text-slate-500 text-lg font-medium max-w-lg mb-10 leading-relaxed">
        Trauma isn't just in the mind; it's trapped in the body. This sequence will use mechanical eye movements and muscle flushing to force your nervous system out of "fight or flight".
      </p>
      <button 
        onClick={onStart}
        className="bg-slate-800 text-white px-12 py-5 rounded-full font-extrabold text-xl shadow-lg hover:bg-slate-700 hover:-translate-y-1 transition-all"
      >
        Begin Sequence
      </button>
    </motion.div>
  );
}

// ─── Phase 1: Polyvagal Eye Reset ────────────────────────────────────────────
function PolyvagalPhase({ onNext }) {
  const [step, setStep] = useState(0); // 0: init, 1: left, 2: center, 3: right, 4: done
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (step === 1 || step === 3) {
      setTimeLeft(30);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep(s => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (step === 2) {
      setTimeout(() => setStep(3), 3000); // 3 sec center pause
    } else if (step === 4) {
      setTimeout(() => onNext(), 3000);
    }
  }, [step, onNext]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col items-center text-center"
    >
      <h3 className="text-2xl font-black text-blue-600 mb-2 uppercase tracking-widest">Phase 1: Vagus Nerve Reset</h3>
      <p className="text-slate-500 font-medium mb-12 max-w-md h-12">
        {step === 0 && "Keep your head perfectly still facing forward."}
        {step === 1 && "Move only your eyes to look at the dot. Hold until you yawn or sigh."}
        {step === 2 && "Return eyes to center and breathe."}
        {step === 3 && "Now, move only your eyes to the right. Hold it."}
        {step === 4 && "Excellent. The parasympathetic system is engaging."}
      </p>

      <div className="w-full max-w-3xl h-32 bg-slate-100 rounded-[3rem] relative border border-slate-200 shadow-inner flex items-center mb-12">
        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-200 -translate-y-1/2" />
        <div className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-slate-300 -translate-x-1/2 -translate-y-1/2" />
        
        {step > 0 && step < 4 && (
          <motion.div
            initial={{ left: "50%" }}
            animate={{ 
              left: step === 1 ? "10%" : step === 3 ? "90%" : "50%",
              scale: (step === 1 || step === 3) ? [1, 1.2, 1] : 1
            }}
            transition={{ 
              left: { duration: 2, ease: "easeInOut" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="absolute w-12 h-12 bg-blue-500 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.6)] -translate-x-1/2 -translate-y-1/2 top-1/2 z-10"
          />
        )}
      </div>

      <div className="h-20">
        {step === 0 && (
          <button onClick={() => setStep(1)} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-blue-700">
            Start Eye Movement
          </button>
        )}
        {(step === 1 || step === 3) && (
          <div className="text-4xl font-black text-blue-400">{timeLeft}s</div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Phase 2: Progressive Muscle Relaxation (PMR) ─────────────────────────────
const BODY_PARTS = [
  { id: 'jaw', label: 'Jaw & Face' },
  { id: 'shoulders', label: 'Shoulders & Neck' },
  { id: 'fists', label: 'Hands & Fists' },
  { id: 'stomach', label: 'Stomach & Core' },
  { id: 'legs', label: 'Legs & Feet' },
];

function PMRPhase({ onFinish }) {
  const [partIndex, setPartIndex] = useState(-1);
  const [action, setAction] = useState('wait'); // 'wait', 'tense', 'release'
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (partIndex >= BODY_PARTS.length) {
      setTimeout(() => onFinish(), 2000);
      return;
    }

    if (action === 'tense') {
      setTimeLeft(5);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timer); setAction('release'); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (action === 'release') {
      setTimeLeft(10);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timer); setAction('wait'); setPartIndex(p => p + 1); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [action, partIndex, onFinish]);

  const startNext = () => {
    if (partIndex === -1) setPartIndex(0);
    setAction('tense');
  };

  const currentPart = BODY_PARTS[partIndex];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col items-center text-center"
    >
      <h3 className="text-2xl font-black text-emerald-600 mb-2 uppercase tracking-widest">Phase 2: Muscle Flush</h3>
      <p className="text-slate-500 font-medium mb-8 max-w-md h-12">
        We will squeeze trapped adrenaline out of the muscle tissue by tensing hard, then releasing completely.
      </p>

      <div className="w-full max-w-lg bg-slate-50 rounded-[2rem] p-8 border border-slate-200 flex flex-col items-center mb-8 relative overflow-hidden">
        
        {/* Dynamic Background Alertness */}
        <AnimatePresence>
          {action === 'tense' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-amber-100/50" 
            />
          )}
          {action === 'release' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-100/50" 
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 w-full">
          {partIndex >= BODY_PARTS.length ? (
            <h2 className="text-3xl font-black text-emerald-600 my-8">Scan Complete</h2>
          ) : partIndex === -1 ? (
            <h2 className="text-xl font-bold text-slate-600 my-8">Ready to flush cortisol?</h2>
          ) : (
            <>
              <h4 className="text-lg font-bold text-slate-400 uppercase tracking-wide mb-2">Focus on your</h4>
              <h2 className="text-4xl font-black text-slate-700 mb-8">{currentPart.label}</h2>
              
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className={`text-3xl font-black transition-colors ${action === 'tense' ? 'text-amber-500 scale-110' : 'text-slate-300'}`}>
                  TENSE
                </div>
                <div className="w-px h-8 bg-slate-300" />
                <div className={`text-3xl font-black transition-colors ${action === 'release' ? 'text-emerald-500 scale-110' : 'text-slate-300'}`}>
                  RELEASE
                </div>
              </div>

              {action !== 'wait' && (
                <div className={`text-6xl font-black ${action === 'tense' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {timeLeft}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="h-20">
        {(partIndex === -1 || action === 'wait') && partIndex < BODY_PARTS.length && (
          <button onClick={startNext} className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-emerald-700 transition-all">
            {partIndex === -1 ? 'Start Body Scan' : 'Next Muscle Group'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
