import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchClinicalPillars } from './utils/supabaseSync';
import { supabase } from './supabaseClient';

const DEFAULT_PILLARS = [
  { title: 'Intrusive Guilt', response: 'Self-Blame / Fawn', icon: '⚖️', desc: 'Carrying blame for things outside your control as a way to feel in control of uncontrollable pain.', tip: 'Use the "Let Go Box" to physically release a blame story.' },
  { title: 'Hypervigilance', response: 'Fight / Flight', icon: '👁️', desc: 'Your nervous system is on high alert, constantly scanning for danger. A brilliant survival mechanism that consumes energy.', tip: 'Try the Breathing Room to signal safety.' },
  { title: 'Boundary Collapse', response: 'Fawn / Pleasing', icon: '🫂', desc: 'Over-accommodating others to keep the peace when asserting needs felt risky in the past.', tip: 'Practice saying "I need a moment to think".' },
  { title: 'Somatic Disconnect', response: 'Freeze / Numbness', icon: '🧊', desc: 'Feeling numb or floaty. This is your nervous system providing a protective buffer against overwhelming sensations.', tip: 'Use the Grounding Matrix.' }
];

const SHUFFLE_WORDS = ['word.', 'sentence.', 'syllable.', 'thing.', 'sound.'];

export default function LandingPage({ onNavigate, isTransitioning }) {
  const [pillars, setPillars] = useState(DEFAULT_PILLARS);
  const [wordIndex, setWordIndex] = useState(0);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activePricingTab, setActivePricingTab] = useState('pro');

  useEffect(() => {
    // Silently check if an admin session is currently active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAdminLoggedIn(true);
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % SHUFFLE_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchClinicalPillars(DEFAULT_PILLARS).then(data => setPillars(data));
  }, []);


  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center transition-all duration-500 ease-out transform ${isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'} overflow-hidden`}>

      {/* Admin Session Banner (Enterprise Feature) */}
      <AnimatePresence>
        {isAdminLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="w-full bg-slate-900 text-white p-3 flex flex-col sm:flex-row items-center justify-between z-[200] border-b border-rose-500 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <span className="text-rose-500 animate-pulse">⚠️</span>
              <span className="text-xs font-black uppercase tracking-widest text-rose-100">Admin Mode Active:</span>
              <span className="text-xs font-medium text-slate-300">You are currently logged into the Central Command.</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('admin')}
                className="text-[10px] font-black uppercase tracking-widest bg-white text-slate-900 px-4 py-1.5 rounded-md hover:bg-slate-200 transition-colors"
              >
                Return to Dashboard
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setIsAdminLoggedIn(false);
                }}
                className="text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white px-4 py-1.5 rounded-md hover:bg-rose-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <span className="text-4xl md:text-5xl tracking-tight leading-none" style={{ fontFamily: '"London", serif', fontWeight: 900 }}>UN</span>
              <div className="h-8 md:h-10 w-[3px] bg-black mx-1" />
              <span className="text-4xl md:text-5xl tracking-tighter leading-none" style={{ fontFamily: '"Inknut Antiqua", serif', fontWeight: 800 }}>कही</span>
            </h1>
            <p className="text-[0.55rem] md:text-xs font-bold text-slate-500 uppercase tracking-[0.25em] mt-4">UNDERSTOOD WITHOUT A SINGLE WORD</p>
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

          <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-600 tracking-tighter leading-[1.15] drop-shadow-sm flex flex-col md:inline-block items-center">
            Heal the unsaid, <br className="hidden md:block" /> without saying a{' '}
            <span className="relative inline-flex flex-col overflow-hidden h-[1.1em] text-teal-600 bg-clip-text bg-gradient-to-br from-teal-500 to-teal-800 align-bottom justify-center min-w-[200px] md:min-w-[300px] text-center md:text-left">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={wordIndex}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute inset-x-0 bottom-0 text-center md:text-left"
                >
                  {SHUFFLE_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
              <span className="opacity-0 pointer-events-none select-none text-center md:text-left">{SHUFFLE_WORDS[0]}</span>
            </span>
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
        <div className="w-full relative z-10 mb-24 px-4 md:px-0">
          {/* Ambient Glow behind the section */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-purple-50/50 to-teal-50/50 -z-10 rounded-[4rem]" />
          
          <div className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-16 shadow-sm overflow-hidden relative">

            <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 mb-8 text-center tracking-tight">
              About the Project
            </h3>
            
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium text-center max-w-4xl mx-auto mb-20 drop-shadow-sm relative">
              <span className="text-4xl absolute -top-6 -left-6 text-slate-200 pointer-events-none">"</span>
              This private, algorithmic tool analyzes your nervous system's behavior across a detailed 24-hour narrative. By exploring how you wake, move through the day, and prepare for sleep, we generate a highly accurate, non-invasive psychological footprint, distinguishing between routine stress and deep-seated fawning, hypervigilance, and somatic dissociation responses.
              <span className="text-4xl absolute -bottom-8 -right-4 text-slate-200 pointer-events-none">"</span>
            </p>

            {/* Visual 3-Step Journey */}
            <div className="mb-20">
              <div className="flex items-center justify-center gap-3 md:gap-4 mb-12 px-2 w-full">
                <div className="h-px flex-1 max-w-[3rem] md:max-w-[4rem] bg-gradient-to-r from-transparent to-slate-300" />
                <h3 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest md:tracking-[0.3em] whitespace-nowrap text-center">
                  How it works
                </h3>
                <div className="h-px flex-1 max-w-[3rem] md:max-w-[4rem] bg-gradient-to-l from-transparent to-slate-300" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Step 1 */}
                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 font-black rounded-full flex items-center justify-center text-sm mb-4 shadow-inner">
                    1
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mb-2">Map Your Day</h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Spend 3 minutes answering gentle, non-invasive questions about your sleep cycles, energy spikes, and bodily reactions. Zero pressure, zero reliving of past memories.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 font-black rounded-full flex items-center justify-center text-sm mb-4 shadow-inner">
                    2
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mb-2">Decode Your State</h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Our local-first, zero-knowledge algorithm maps your somatic telemetry to identify if your body is operating in a state of Fight, Flight, Freeze, or Fawn.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-rose-100 text-rose-700 font-black rounded-full flex items-center justify-center text-sm mb-4 shadow-inner">
                    3
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mb-2">Regulate Safely</h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Get custom-matched interactive somatic tools like the Breathing Room or Let Go Box, designed specifically to bring your nervous system back to safety.
                  </p>
                </div>
              </div>

              {/* B2B / Enterprise Privacy Promise */}
              <div className="max-w-xl mx-auto mt-8 p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 flex gap-3 text-left">
                <span className="text-lg leading-none">🔒</span>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                  <strong className="text-indigo-950 font-bold block mb-0.5">Enterprise-Grade Confidentiality</strong>
                  Your answers never leave your browser. Only anonymous, high-level percentages (e.g. general group stress trends) are shown to cohort managers, guaranteeing your personal privacy.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 md:gap-4 mb-12 px-2 w-full">
              <div className="h-px flex-1 max-w-[3rem] md:max-w-[4rem] bg-gradient-to-r from-transparent to-slate-300" />
              <h3 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest md:tracking-[0.3em] whitespace-nowrap text-center">
                Core Clinical Pillars
              </h3>
              <div className="h-px flex-1 max-w-[3rem] md:max-w-[4rem] bg-gradient-to-l from-transparent to-slate-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 relative z-10">
              {pillars.map((pillar, idx) => {
                // Dynamically assign subtle glow colors based on index to make them pop
                const glowColors = ['bg-rose-400/20', 'bg-blue-400/20', 'bg-amber-400/20', 'bg-emerald-400/20'];
                const accentTextColors = ['text-rose-600', 'text-blue-600', 'text-amber-600', 'text-emerald-600'];
                const accentBgColors = ['bg-rose-50', 'bg-blue-50', 'bg-amber-50', 'bg-emerald-50'];
                const accentBorderColors = ['border-rose-100', 'border-blue-100', 'border-amber-100', 'border-emerald-100'];
                const glow = glowColors[idx % glowColors.length];
                const tColor = accentTextColors[idx % accentTextColors.length];
                const bColor = accentBgColors[idx % accentBgColors.length];
                const borderC = accentBorderColors[idx % accentBorderColors.length];

                return (
                  <div 
                    key={idx} 
                    className="relative bg-white border border-slate-100 p-8 rounded-[2.5rem] flex flex-col shadow-sm z-10"
                  >
                    <div className="flex items-start gap-5 mb-5">
                      <div className="text-4xl md:text-5xl drop-shadow-sm">
                        {pillar.icon}
                      </div>
                      <div>
                        <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-slate-100 ${tColor} mb-1.5`}>
                          {pillar.response || 'Somatic Response'}
                        </span>
                        <h4 className="text-xl md:text-2xl font-black text-slate-700 leading-tight">
                          {pillar.title}
                        </h4>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 mb-8 leading-relaxed font-medium flex-grow text-sm md:text-base">
                      {pillar.desc}
                    </p>
                    
                    <div className={`mt-auto rounded-2xl p-5 border ${bColor} ${borderC} shadow-inner`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-2 ${tColor}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        Actionable Tip
                      </p>
                      <p className="text-sm text-slate-800 font-bold leading-snug">{pillar.tip}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enterprise Pricing Section */}
        <div className="w-full max-w-5xl mx-auto mb-24 px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Scale Healing Across Your Organization</h3>
            <p className="text-slate-600 font-medium max-w-2xl mx-auto">Zero-knowledge telemetry and enterprise-grade isolation. Deploy Unkahi to your cohort today.</p>
          </div>

          {/* Mobile Pricing Tab Switcher */}
          <div className="flex justify-center md:hidden mb-8 px-2">
            <div className="inline-flex p-1 bg-slate-100/80 backdrop-blur-md rounded-full border border-slate-200/50 shadow-inner relative w-full sm:w-auto justify-between">
              {[
                { id: 'individual', label: 'Individual' },
                { id: 'pro', label: 'Pro Clinic' },
                { id: 'enterprise', label: 'Enterprise' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePricingTab(tab.id)}
                  className={`relative flex-1 sm:flex-none px-3 sm:px-4 py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full transition-colors duration-300 z-10 outline-none ${
                    activePricingTab === tab.id
                      ? (tab.id === 'pro' ? 'text-white' : 'text-slate-800')
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {activePricingTab === tab.id && (
                    <motion.div
                      layoutId="pricingTabActive"
                      className={`absolute inset-0 rounded-full shadow-sm -z-10 ${tab.id === 'pro' ? 'bg-indigo-600' : 'bg-white border border-slate-200/30'}`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-20 whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

            {/* Tier 1 */}
            <div className={`${activePricingTab === 'individual' ? 'flex' : 'hidden'} md:flex bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-3xl p-8 shadow-sm flex-col`}>
              <span className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2 block">Individual</span>
              <h4 className="text-4xl font-black text-slate-800 mb-2">₹0<span className="text-sm font-medium text-slate-500">/forever</span></h4>
              <p className="text-slate-500 text-sm mb-6 pb-6 border-b border-slate-200/50">For personal healing and grounding.</p>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex gap-3 text-sm text-slate-700 font-medium"><span className="text-teal-500">✓</span> Full access to Healing Tools</li>
                <li className="flex gap-3 text-sm text-slate-700 font-medium"><span className="text-teal-500">✓</span> Local-first Mood Diary</li>
                <li className="flex gap-3 text-sm text-slate-700 font-medium"><span className="text-teal-500">✓</span> 100% On-device Privacy</li>
              </ul>
              <button onClick={() => onNavigate('assessment')} className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">Start Healing</button>
            </div>

            {/* Tier 2: Pro */}
            <div className={`${activePricingTab === 'pro' ? 'flex' : 'hidden'} md:flex bg-gradient-to-b from-indigo-500 to-indigo-700 border border-indigo-400 rounded-3xl p-8 shadow-xl flex-col relative transform md:-translate-y-4`}>
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">Most Popular</div>
              <span className="text-sm font-black uppercase tracking-widest text-indigo-200 mb-2 block">Pro Clinic</span>
              <h4 className="text-4xl font-black text-white mb-2">₹4,999<span className="text-sm font-medium text-indigo-300">/mo</span></h4>
              <p className="text-indigo-200 text-sm mb-6 pb-6 border-b border-indigo-400/50">For small clinics and therapy groups.</p>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex gap-3 text-sm text-white font-medium"><span className="text-indigo-300">✓</span> Up to 50 active users</li>
                <li className="flex gap-3 text-sm text-white font-medium"><span className="text-indigo-300">✓</span> Basic Cohort Dashboard</li>
                <li className="flex gap-3 text-sm text-white font-medium"><span className="text-indigo-300">✓</span> Monthly CSV Exports</li>
              </ul>
              <button onClick={() => onNavigate('b2bsignup')} className="w-full bg-white hover:bg-indigo-50 text-indigo-600 font-bold py-3 rounded-xl transition-colors shadow-lg">Apply for Access</button>
            </div>

            {/* Tier 3 */}
            <div className={`${activePricingTab === 'enterprise' ? 'flex' : 'hidden'} md:flex bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-3xl p-8 shadow-sm flex-col`}>
              <span className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2 block">Enterprise B2B</span>
              <h4 className="text-4xl font-black text-slate-800 mb-2">₹19,999<span className="text-sm font-medium text-slate-500">/mo</span></h4>
              <p className="text-slate-500 text-sm mb-6 pb-6 border-b border-slate-200/50">For universities and massive organizations.</p>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex gap-3 text-sm text-slate-700 font-medium"><span className="text-teal-500">✓</span> Unlimited users</li>
                <li className="flex gap-3 text-sm text-slate-700 font-medium"><span className="text-teal-500">✓</span> Real-time ML Telemetry</li>
                <li className="flex gap-3 text-sm text-slate-700 font-medium"><span className="text-teal-500">✓</span> Predictive Crisis Alerts</li>
                <li className="flex gap-3 text-sm text-slate-700 font-medium"><span className="text-teal-500">✓</span> Isolated Data Enclave</li>
              </ul>
              <button onClick={() => onNavigate('b2bsignup')} className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">Contact Sales</button>
            </div>

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
        <footer className="mt-20 w-full border-t border-slate-200/50 pt-12 pb-8 flex flex-col items-center justify-center px-4 relative z-10 bg-white/30 backdrop-blur-md rounded-t-[3rem]">
          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl mb-8 gap-8">
            <div className="text-center md:text-left">
              <h1 className="flex items-center justify-center md:justify-start gap-1 text-slate-800 mb-2">
                <span className="text-2xl tracking-tight leading-none" style={{ fontFamily: '"London", serif', fontWeight: 900 }}>UN</span>
                <div className="h-5 w-[2px] bg-slate-800 mx-1" />
                <span className="text-2xl tracking-tighter leading-none" style={{ fontFamily: '"Inknut Antiqua", serif', fontWeight: 800 }}>कही</span>
              </h1>
              <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">For the society by ASA</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={() => onNavigate('b2bsignup')}
                className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Apply for B2B SaaS
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors"
              >
                Organization Login
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
              >
                Super Admin Login
              </button>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-400">
            Unkahi © {new Date().getFullYear()} · Edge-AI Privacy
          </p>
        </footer>

      </div>
    </div>
  );
}
