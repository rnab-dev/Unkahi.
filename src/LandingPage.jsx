import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchClinicalPillars } from './utils/supabaseSync';

const DEFAULT_PILLARS = [
  { title: 'Intrusive Guilt', icon: '⚖️', desc: 'Carrying blame for things outside your control as a way to feel in control of uncontrollable pain.', tip: 'Use the "Let Go Box" to physically release a blame story.' },
  { title: 'Hypervigilance', icon: '👁️', desc: 'Your nervous system is on high alert, constantly scanning for danger. A brilliant survival mechanism that consumes energy.', tip: 'Try the Breathing Room to signal safety.' },
  { title: 'Boundary Collapse', icon: '🫂', desc: 'Over-accommodating others to keep the peace when asserting needs felt risky in the past.', tip: 'Practice saying "I need a moment to think".' },
  { title: 'Somatic Disconnect', icon: '🧊', desc: 'Feeling numb or floaty. This is your nervous system providing a protective buffer against overwhelming sensations.', tip: 'Use the Grounding Matrix.' }
];

export default function LandingPage({ onNavigate, isTransitioning }) {
  const [pillars, setPillars] = useState(DEFAULT_PILLARS);

  useEffect(() => {
    fetchClinicalPillars(DEFAULT_PILLARS).then(data => setPillars(data));
  }, []);


  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center transition-all duration-500 ease-out transform ${isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'} overflow-hidden`}>

      {/* 1. Ambient Breathing Orbs - Hardware Accelerated */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transform-gpu">
        <motion.div
          animate={{ scale: [1, 1.05, 1], y: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[20%] w-[150vw] h-[150vw] md:w-[60vw] md:h-[60vw] bg-purple-300/30 md:bg-purple-300/20 rounded-full blur-[80px] md:blur-[120px] will-change-transform"
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], x: [0, 15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] -right-[30%] w-[140vw] h-[140vw] md:w-[50vw] md:h-[50vw] bg-teal-200/30 md:bg-teal-200/20 rounded-full blur-[80px] md:blur-[140px] will-change-transform"
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], y: [0, 15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[20%] left-[10%] w-[160vw] h-[160vw] md:w-[70vw] md:h-[70vw] bg-rose-200/30 md:bg-rose-200/20 rounded-full blur-[80px] md:blur-[160px] will-change-transform"
        />
      </div>

      {/* 2. Cinematic Noise Overlay - Mobile Optimized */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-20 transform-gpu"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-start pb-24">

        {/* The Clarity Hero Section */}
        <nav className="w-full flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24 mt-8 px-4 md:px-8 gap-6 md:gap-0">
          <div className="flex flex-col text-center md:text-left relative">
            <h1 className="flex items-center justify-center md:justify-start gap-2 text-black mb-1">
              <span className="text-5xl md:text-6xl tracking-tight leading-none" style={{ fontFamily: '"London", serif', fontWeight: 900 }}>UN</span>
              <div className="h-10 md:h-12 w-[3px] bg-black mx-1" />
              <span className="text-5xl md:text-6xl tracking-tighter leading-none" style={{ fontFamily: '"Inknut Antiqua", serif', fontWeight: 800 }}>कही</span>
            </h1>
            <p className="text-[0.55rem] md:text-xs font-bold text-slate-500 uppercase tracking-[0.25em] mt-1">UNDERSTOOD WITHOUT A SINGLE WORD</p>
          </div>
          <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
            <button
              onClick={() => onNavigate('kids')}
              className="bg-purple-100/80 backdrop-blur-md border border-purple-200/50 hover:bg-purple-200 text-purple-700 font-bold py-2.5 px-5 md:px-6 rounded-full shadow-[0_4px_12px_rgba(168,85,247,0.15)] hover:shadow-[0_6px_16px_rgba(168,85,247,0.25)] transition-all text-xs md:text-sm uppercase tracking-wider"
            >
              🧸 Kids Mode
            </button>
            <button
              onClick={() => window.location.replace('https://www.google.com')}
              className="bg-gradient-to-r from-red-500 to-rose-600 border border-red-400 text-white font-bold py-2.5 px-5 md:px-6 rounded-full shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_16px_rgba(239,68,68,0.4)] transition-all text-xs md:text-sm uppercase tracking-wider"
            >
              Quick Exit
            </button>
          </div>
        </nav>

        <div className="w-full max-w-4xl text-center space-y-8 md:space-y-10 mb-20 md:mb-32 px-4 relative">
          {/* Subtle glow behind the text to enhance readability over the noise */}
          <div className="absolute inset-0 bg-white/20 blur-3xl -z-10 rounded-[100px] pointer-events-none" />

          <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-600 tracking-tighter leading-[1.15] drop-shadow-sm">
            Heal the unsaid, <br className="hidden md:block" /> without saying a word.
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium mx-auto max-w-[280px] sm:max-w-xs md:max-w-md drop-shadow-sm mt-6 md:mt-8">
            A gentle, 100% private space to understand your heavy emotions—no direct questions, no reliving the past.
          </p>

          <div className="pt-10 flex flex-col items-center w-full">
            <div className="relative group w-full px-4 sm:w-auto sm:px-0">
              <button
                onClick={() => onNavigate('assessment')}
                className="relative w-full sm:w-auto justify-center z-10 bg-gradient-to-b from-teal-500 to-teal-700 text-white px-8 py-4 md:px-12 md:py-5 font-black rounded-full text-lg md:text-2xl shadow-[0_8px_30px_rgba(13,148,136,0.3)] hover:shadow-[0_12px_40px_rgba(13,148,136,0.5)] hover:-translate-y-1 transition-all duration-300 border border-teal-400/50 tracking-wide flex items-center gap-3 overflow-hidden"
              >
                {/* Subtle shine sweep on hover */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <span className="relative z-10">Take the First Step</span>
                <span className="text-teal-200 group-hover:translate-x-1 transition-transform relative z-10">→</span>
              </button>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full px-4 sm:w-auto sm:px-0">
              <button
                onClick={() => onNavigate('support')}
                className="relative w-full sm:w-auto justify-center z-10 bg-white/70 hover:bg-white/90 text-rose-600 px-6 py-3.5 font-bold rounded-full text-sm md:text-base shadow-sm hover:shadow-md transition-all border border-rose-100 flex items-center gap-2"
              >
                <span className="text-lg">🚨</span> Crisis Helplines
              </button>

              <button
                onClick={() => onNavigate('legal')}
                className="relative w-full sm:w-auto justify-center z-10 bg-white/70 hover:bg-white/90 text-indigo-700 px-6 py-3.5 font-bold rounded-full text-sm md:text-base shadow-sm hover:shadow-md transition-all border border-indigo-100 flex items-center gap-2"
              >
                <span className="text-lg">⚖️</span> Know Your Rights
              </button>
            </div>

            <div className="flex items-center gap-1 md:gap-2 text-[0.65rem] md:text-sm text-slate-500 mt-6 relative z-10 bg-white/40 px-4 py-2 md:px-5 md:py-2 rounded-full backdrop-blur-sm border border-white/50 shadow-sm font-medium">
              <span>🔒</span>
              <span>100% Anonymous. Your data never leaves your device.</span>
            </div>
          </div>
        </div>

        {/* Detailed Project Insights & Clinical Blueprint */}
        <div className="w-full bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 p-10 md:p-16 mb-24 shadow-xl shadow-indigo-500/5">
          <h3 className="text-3xl font-extrabold text-slate-700 mb-6 text-center">About the Project</h3>
          <p className="text-lg text-slate-600 leading-relaxed font-medium text-center max-w-4xl mx-auto mb-16">
            This private, algorithmic tool analyzes your nervous system's behavior across a detailed 24-hour narrative. By exploring how you wake, move through the day, and prepare for sleep, we generate a highly accurate, non-invasive psychological footprint, distinguishing between routine stress and deep-seated fawning, hypervigilance, and somatic dissociation responses.
          </p>

          <h3 className="text-2xl font-extrabold text-slate-700 mb-8 text-center border-b border-white/50 pb-4 max-w-sm mx-auto">Clinical Pillars</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-lg border border-white p-8 rounded-[2.5rem] flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl drop-shadow-sm">{pillar.icon}</div>
                  <h4 className="text-xl font-black text-[#5C6E84] leading-tight">{pillar.title}</h4>
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed font-medium flex-grow">{pillar.desc}</p>
                <div className="bg-[#A3BE8C]/10 rounded-2xl p-4 border border-[#A3BE8C]/20">
                  <p className="text-xs font-black text-[#A3BE8C] uppercase tracking-wider mb-1">Actionable Tip</p>
                  <p className="text-sm text-slate-700 font-bold">{pillar.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Healing Tools & Kids Mode ('Little UNKAHI') */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
          <div className="bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 p-10 shadow-xl shadow-teal-500/5 text-center flex flex-col items-center">
            <span className="text-5xl mb-6">🌸</span>
            <h3 className="text-2xl font-extrabold text-teal-800 mb-4">Healing Tools</h3>
            <p className="text-slate-600 mb-8 font-medium">
              Discover the <strong>Breathing Room</strong> and <strong>The Let Go Box</strong> with beautiful, detailed Claymorphic CSS animations. Soft concentric glowing rings for breath, blurring and dissolving text for release.
            </p>
            <button
              onClick={() => onNavigate('tools')}
              className="mt-auto bg-white hover:bg-teal-50 text-teal-700 font-bold py-3 px-8 rounded-full border border-white shadow-sm hover:shadow hover:-translate-y-1 transition-all"
            >
              Explore Triage Tools
            </button>
          </div>

          <div className="bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 p-10 shadow-xl shadow-purple-500/5 text-center flex flex-col items-center">
            <span className="text-5xl mb-6">🧸</span>
            <h3 className="text-2xl font-extrabold text-purple-800 mb-4">Kids Mode (Little UNKAHI)</h3>
            <p className="text-slate-600 mb-8 font-medium">
              A dedicated, soft toy-box aesthetic to teach safe boundaries implicitly through the Brave Bear story game. A narrative expanded into 10 gentle lessons.
            </p>
            <button
              onClick={() => onNavigate('kids')}
              className="mt-auto bg-white hover:bg-purple-50 text-purple-700 font-bold py-3 px-8 rounded-full border border-white shadow-sm hover:shadow hover:-translate-y-1 transition-all"
            >
              Open Toy Box
            </button>
          </div>
        </div>

        {/* Pacing & Animations spacing bottom */}
        <div className="mt-16 text-slate-400 text-sm font-medium tracking-wide text-center">
          Take your time. You are safe here.
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4 max-w-4xl mx-auto px-4">
          <button onClick={() => onNavigate('safetyplan')} className="bg-white/40 hover:bg-white/80 border border-white/50 px-6 py-3 rounded-full text-slate-600 font-bold transition-all shadow-sm flex items-center gap-2">
            🛡️ Safety Plan
          </button>
          <button onClick={() => onNavigate('mooddiary')} className="bg-white/40 hover:bg-white/80 border border-white/50 px-6 py-3 rounded-full text-slate-600 font-bold transition-all shadow-sm flex items-center gap-2">
            📝 Mood Diary
          </button>
          <button onClick={() => onNavigate('psychoed')} className="bg-white/40 hover:bg-white/80 border border-white/50 px-6 py-3 rounded-full text-slate-600 font-bold transition-all shadow-sm flex items-center gap-2">
            🧠 Nervous System Ed
          </button>
          <button onClick={() => onNavigate('vault')} className="bg-white/40 hover:bg-white/80 border border-white/50 px-6 py-3 rounded-full text-slate-600 font-bold transition-all shadow-sm flex items-center gap-2">
            ✨ Safe Vault
          </button>
        </div>

        {/* Global Footer */}
        <footer className="mt-20 w-full border-t border-slate-200/50 pt-8 pb-4 flex flex-col md:flex-row items-center justify-between px-4">
          <button
            onClick={() => onNavigate('mydata')}
            className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity group"
          >
            <span className="text-xl">📊</span>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Your Data</p>
              <p className="text-slate-700 font-bold hover:text-indigo-600 transition-colors text-sm group-hover:text-indigo-600">
                View Unified Insights Dashboard →
              </p>
            </div>
          </button>
          <p className="text-xs font-medium text-slate-400 mt-6 md:mt-0">
            Unkahi © {new Date().getFullYear()} · Edge-AI Privacy
          </p>
        </footer>

      </div>
    </div>
  );
}
