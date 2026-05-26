import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NightWatch({ onNavigate, isTransitioning, onDismiss }) {
  const [stage, setStage] = useState('initial'); // 'initial' | 'awake' | 'unsafe_triage' | 'somatic_question' | 'danger_emergency'
  const [somaticChoice, setSomaticChoice] = useState(null); // 'racing' | 'numb'

  const HELPLINES = [
    { name: '🚨 Women Helpline (India Wide)', number: '1091', desc: '24/7 dedicated national helpline for women in distress.' },
    { name: '🛡️ Domestic Abuse & Violence Helpline', number: '181', desc: 'Government of India crisis intervention support.' },
    { name: '📞 central mental rehabilitation (KIRAN)', number: '18005990019', desc: 'Toll-free 24/7 psychological triage and stabilization.' },
    { name: '🚨 National Emergency Police Response', number: '112', desc: 'Direct access to local safety enforcement teams.' }
  ];

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} bg-slate-950 overflow-hidden`}>
      
      {/* Skip/Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-6 right-6 z-50 text-slate-500 hover:text-slate-200 font-bold uppercase tracking-widest text-[10px] sm:text-xs border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-full transition-all"
        >
          Skip →
        </button>
      )}
      
      {/* Deep Night Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-[20%] w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] bg-indigo-900/45 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-1/4 -right-[20%] w-[120vw] h-[120vw] md:w-[70vw] md:h-[70vw] bg-slate-900/60 rounded-full blur-[140px]"
        />
      </div>

      {/* Cinematic Noise (Darker for night) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6 py-12 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          
          {/* Stage 1: INITIAL QUESTION */}
          {stage === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center w-full"
            >
              <h1 className="text-3xl md:text-5xl font-black text-slate-300 tracking-tight mb-12 sm:mb-16 leading-tight">
                It's late. <br/>
                <span className="text-slate-500 font-medium text-2xl md:text-3xl mt-4 block">Are you safe, or are you just awake?</span>
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-md">
                <button 
                  onClick={() => setStage('awake')}
                  className="flex-1 border border-slate-800 bg-slate-900/40 hover:bg-slate-850/60 text-slate-300 font-bold py-5 px-6 rounded-2xl transition-all shadow-md"
                >
                  Just awake.
                </button>
                <button 
                  onClick={() => setStage('unsafe_triage')}
                  className="flex-1 border border-indigo-950 bg-indigo-950/20 hover:bg-indigo-900/40 text-indigo-300 font-bold py-5 px-6 rounded-2xl transition-all shadow-md"
                >
                  I don't feel safe.
                </button>
              </div>
            </motion.div>
          )}

          {/* Stage 2: JUST AWAKE */}
          {stage === 'awake' && (
            <motion.div
              key="awake"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center w-full"
            >
              <p className="text-lg sm:text-xl text-slate-400 font-medium mb-12 leading-relaxed max-w-md">
                The world is quiet right now. Let's just breathe until you're ready to rest.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                  onClick={() => onNavigate('breathe')}
                  className="bg-indigo-600 border border-indigo-500 text-white font-extrabold py-4 px-10 rounded-full shadow-lg hover:shadow-indigo-600/30 transition-all text-sm uppercase tracking-wider"
                >
                  🌸 Open Breathing Room
                </button>
                <button 
                  onClick={() => setStage('initial')}
                  className="text-slate-500 hover:text-slate-400 font-bold text-xs uppercase tracking-widest py-2 transition-colors"
                >
                  ← Go back
                </button>
              </div>
            </motion.div>
          )}

          {/* Stage 3: UNSAFE TRIAGE (The smart filter) */}
          {stage === 'unsafe_triage' && (
            <motion.div
              key="triage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center w-full"
            >
              <span className="text-4xl block mb-6 animate-pulse">⚓</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-300 tracking-tight mb-4">You are safe with us.</h2>
              <p className="text-slate-400 text-xs sm:text-sm font-semibold max-w-md leading-relaxed mb-10 px-2">
                Help us guide you to the right place. What best describes the kind of safety you need right now?
              </p>

              <div className="flex flex-col gap-4 w-full max-w-md">
                <button 
                  onClick={() => setStage('somatic_question')}
                  className="w-full text-left p-5 border border-indigo-900 bg-indigo-950/20 hover:bg-indigo-900/30 rounded-2xl flex items-start gap-4 transition-all shadow-md group"
                >
                  <span className="text-2xl group-hover:scale-105 transition-transform">🧠</span>
                  <div>
                    <strong className="text-indigo-200 font-extrabold block text-sm mb-0.5">Emotional Safety Support</strong>
                    <span className="text-xs text-slate-400 leading-relaxed font-medium">I am physically safe in my room, but experiencing heavy thoughts, painful memories, or anxiety.</span>
                  </div>
                </button>

                <button 
                  onClick={() => setStage('danger_emergency')}
                  className="w-full text-left p-5 border border-rose-950 bg-rose-950/15 hover:bg-rose-900/30 rounded-2xl flex items-start gap-4 transition-all shadow-md group"
                >
                  <span className="text-2xl group-hover:scale-105 transition-transform">🚨</span>
                  <div>
                    <strong className="text-rose-300 font-extrabold block text-sm mb-0.5">Urgent Safety / Active Danger</strong>
                    <span className="text-xs text-slate-400 leading-relaxed font-medium">I am facing active distress, domestic threat, or danger (harassment, stalking, or physical unsafety).</span>
                  </div>
                </button>

                <button 
                  onClick={() => setStage('initial')}
                  className="text-slate-500 hover:text-slate-400 font-bold text-xs uppercase tracking-widest mt-6 transition-colors"
                >
                  ← Go back
                </button>
              </div>
            </motion.div>
          )}

          {/* Stage 4: OPTION A - SOMATIC INTERVIEWS */}
          {stage === 'somatic_question' && (
            <motion.div
              key="somatic_q"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center w-full"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-slate-300 mb-4 tracking-tight">Let's check in with your body.</h2>
              <p className="text-slate-400 text-sm font-semibold max-w-sm mb-10 leading-relaxed">
                Take a deep breath. Which of these somatic sensations describes how you feel right now?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mb-8">
                <button
                  onClick={() => setSomaticChoice('racing')}
                  className={`p-6 border rounded-2xl text-center flex flex-col items-center gap-3 transition-all ${somaticChoice === 'racing' ? 'bg-amber-500/10 border-amber-500 text-amber-200' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <span className="text-3xl">🌪️</span>
                  <div>
                    <strong className="block text-xs uppercase tracking-widest font-black mb-1">Buzzing / Heart Racing</strong>
                    <span className="text-[10px] leading-snug block opacity-85">My mind is racing, hyperventilating, or scanning for danger.</span>
                  </div>
                </button>

                <button
                  onClick={() => setSomaticChoice('numb')}
                  className={`p-6 border rounded-2xl text-center flex flex-col items-center gap-3 transition-all ${somaticChoice === 'numb' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-200' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <span className="text-3xl">🧊</span>
                  <div>
                    <strong className="block text-xs uppercase tracking-widest font-black mb-1">Frozen / Numb</strong>
                    <span className="text-[10px] leading-snug block opacity-85">I feel floaty, disconnected, cold, or entirely shut down.</span>
                  </div>
                </button>
              </div>

              {somaticChoice && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl max-w-sm w-full mb-8 text-center"
                >
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Suggested Triage Path</span>
                  <p className="text-xs text-slate-300 font-bold leading-relaxed">
                    {somaticChoice === 'racing' 
                      ? 'We suggest resetting the vagus nerve with slow exhalations or bilateral audio.'
                      : 'We suggest gentle, non-verbal sensory anchors to bring warmth back to your body.'}
                  </p>
                </motion.div>
              )}

              <div className="flex flex-col gap-3 w-full max-w-xs justify-center items-center">
                {somaticChoice && (
                  <button
                    onClick={() => onNavigate(somaticChoice === 'racing' ? 'breathe' : 'ground')}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-8 rounded-full shadow-lg hover:shadow-indigo-600/30 transition-all text-xs uppercase tracking-widest"
                  >
                    Open {somaticChoice === 'racing' ? 'Blooming Lotus' : 'Grounding Matrix'} →
                  </button>
                )}
                <button 
                  onClick={() => { setStage('unsafe_triage'); setSomaticChoice(null); }}
                  className="text-slate-500 hover:text-slate-400 font-bold text-xs uppercase tracking-widest py-2 transition-colors mt-2"
                >
                  ← Go back
                </button>
              </div>
            </motion.div>
          )}

          {/* Stage 5: OPTION B - CRITICAL DANGER HELPLINES */}
          {stage === 'danger_emergency' && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mb-4 text-rose-500 animate-pulse">
                <span>⚠️</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-rose-400 mb-2 tracking-tight">Active Emergency Triage</h2>
              <p className="text-slate-400 text-xs sm:text-sm font-semibold max-w-md mb-8 leading-relaxed px-2">
                You do not have to carry this alone. Please click any helpline below to call instantly, or launch your private safety plan.
              </p>

              <div className="flex flex-col gap-3 w-full max-w-md mb-8 max-h-[300px] overflow-y-auto pr-1">
                {HELPLINES.map((line, idx) => (
                  <a
                    key={idx}
                    href={`tel:${line.number}`}
                    className="w-full text-left p-4 bg-slate-900 border border-slate-800/80 hover:bg-rose-950/20 hover:border-rose-900/50 rounded-xl flex items-center justify-between transition-all group shadow-sm"
                  >
                    <div>
                      <strong className="text-slate-200 group-hover:text-rose-300 font-bold text-xs sm:text-sm transition-colors">{line.name}</strong>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{line.desc}</p>
                    </div>
                    <span className="text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-black group-hover:scale-105 transition-transform flex items-center gap-1.5 flex-shrink-0 ml-4">
                      📞 {line.number}
                    </span>
                  </a>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
                <button
                  onClick={() => onNavigate('safetyplan')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 px-6 rounded-full transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                >
                  🛡️ Open My Safety Plan
                </button>
                <button
                  onClick={() => setStage('unsafe_triage')}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 font-bold py-3.5 px-6 rounded-full transition-all text-xs uppercase tracking-widest"
                >
                  ← Other options
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
