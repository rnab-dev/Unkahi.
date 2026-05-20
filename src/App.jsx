import React, { useState } from 'react';
import Assessment from './Assessment';
import Dashboard from './Dashboard';
import { BreathingRoom, GroundingMatrix, LetGoBox, BilateralStimulation } from './HealingTools';
import SomaticHealer from './SomaticHealer';
import KidsMode from './KidsMode';
import LandingPage from './LandingPage';
import NightWatch from './NightWatch';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentView, setCurrentView]       = useState('welcome');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [assessmentScores, setAssessmentScores] = useState([]);
  const [sosActive, setSosActive]           = useState(false);

  // Check if it's currently between 1 AM and 5 AM
  const currentHour = new Date().getHours();
  const isNightMode = currentHour >= 1 && currentHour < 5;

  const handleNavigate = (view) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(view);
      setIsTransitioning(false);
    }, 400); // Cross-fade duration
  };


  const renderToolsConfig = () => (
    <div className={`mx-auto max-w-2xl w-full p-8 md:p-12 text-center relative bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[2.5rem] transition-all duration-500 ease-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <button 
        onClick={() => handleNavigate('welcome')}
        className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-xs transition-colors"
      >
        ← Home
      </button>
      <h2 className="text-2xl font-extrabold mb-6 text-slate-700 tracking-tight">Immediate Triage</h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium text-sm">
        Choose a gentle anchor below to regulate your highly active nervous system.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <button onClick={() => handleNavigate('breathe')} className="bg-white/80 hover:bg-teal-50 border border-white p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md">
          <span className="text-3xl">🌸</span>
          <span className="font-bold text-teal-800 text-sm">Blooming Lotus</span>
        </button>
        <button onClick={() => handleNavigate('ground')} className="bg-white/80 hover:bg-purple-50 border border-white p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md">
          <span className="text-3xl">🧱</span>
          <span className="font-bold text-purple-800 text-sm">Grounding Matrix</span>
        </button>
        <button onClick={() => handleNavigate('letgo')} className="bg-white/80 hover:bg-pink-50 border border-white p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md">
          <span className="text-3xl">💨</span>
          <span className="font-bold text-pink-700 text-sm">"Let Go" Box</span>
        </button>
        <button onClick={() => handleNavigate('emdr')} className="bg-white/80 hover:bg-indigo-50 border border-white p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md">
          <span className="text-3xl">🎧</span>
          <span className="font-bold text-indigo-700 text-sm">Bilateral Audio</span>
        </button>
        <button onClick={() => handleNavigate('somatic')} className="bg-white/80 hover:bg-emerald-50 border border-white p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md col-span-1 sm:col-span-3 lg:col-span-1">
          <span className="text-3xl">🧬</span>
          <span className="font-bold text-emerald-700 text-sm">Somatic Healer</span>
        </button>
      </div>
    </div>
  );

  const viewMap = {
    welcome: () => (
      isNightMode ? (
        <NightWatch onNavigate={handleNavigate} isTransitioning={isTransitioning} />
      ) : (
        <LandingPage onNavigate={handleNavigate} isTransitioning={isTransitioning} />
      )
    ),
    assessment: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <Assessment
          onComplete={(scores, recommendedTool) => {
            if (scores) setAssessmentScores(scores);
            if (recommendedTool) {
              handleNavigate(recommendedTool);
            } else {
              handleNavigate('dashboard');
            }
          }}
        />
      </div>
    ),
    dashboard: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <Dashboard
          assessmentScores={assessmentScores}
          onNavigate={handleNavigate}
        />
      </div>
    ),
    // 'tools' kept as alias so any old reference doesn't crash
    tools: () => renderToolsConfig(),
    breathe: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <BreathingRoom onBack={() => handleNavigate('dashboard')} />
      </div>
    ),
    ground: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <GroundingMatrix onBack={() => handleNavigate('dashboard')} />
      </div>
    ),
    letgo: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <LetGoBox onBack={() => handleNavigate('dashboard')} />
      </div>
    ),
    emdr: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <BilateralStimulation onBack={() => handleNavigate('dashboard')} />
      </div>
    ),
    somatic: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <SomaticHealer onBack={() => handleNavigate('dashboard')} />
      </div>
    ),
    kids: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <KidsMode onBack={() => handleNavigate('welcome')} />
      </div>
    )
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden flex flex-col transition-colors duration-1000 ${
        isNightMode && currentView === 'welcome' 
          ? 'bg-slate-950'
          : currentView === 'assessment' 
          ? 'bg-gradient-to-br from-cyan-100 via-purple-200 to-pink-100' 
          : 'bg-gradient-to-br from-cyan-50 via-purple-100 to-pink-50'
      }`}
    >
      {/* ── SOS Override Overlay ── */}
      <AnimatePresence>
        {sosActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
          >
            <button 
              onClick={() => setSosActive(false)}
              className="absolute top-8 left-8 text-slate-500 hover:text-slate-300 font-bold tracking-widest uppercase text-sm"
            >
              ← Close
            </button>
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="w-48 h-48 rounded-full bg-indigo-500/20 blur-xl absolute"
            />
            <h2 className="text-3xl md:text-5xl font-black text-slate-200 mb-6 relative z-10">Breathe with the circle.</h2>
            <p className="text-xl text-slate-400 font-medium max-w-md relative z-10 mb-12">
              You are safe in this exact moment. Nothing is required of you right now.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm relative z-10">
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-slate-300 font-bold">5 Things you see</div>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-slate-300 font-bold">4 Things you feel</div>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-slate-300 font-bold">3 Things you hear</div>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-slate-300 font-bold">2 Things you smell</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Persistent SOS Button ── */}
      <button
        onClick={() => setSosActive(true)}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all group"
        title="SOS Grounding Override"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">⚓</span>
      </button>

      {currentView !== 'welcome' && (
        <div className="w-full flex flex-row items-center justify-between pt-6 px-6 md:px-10 mb-6 md:mb-8 max-w-6xl mx-auto z-10 transition-all duration-500 opacity-100">
          <div className="flex flex-col cursor-pointer" onClick={() => handleNavigate('welcome')}>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#475569] tracking-widest uppercase">UNKAHI</h1>
            <p className="text-[0.55rem] md:text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Interactive Psychological Safety</p>
          </div>
          <QuickExitButton />
        </div>
      )}
      
      <div className="w-full relative z-10 flex flex-col items-center justify-center flex-grow px-4 md:px-0">
        {viewMap[currentView]()}
      </div>

      <footer className="mt-auto py-6 text-center text-slate-500/80 font-medium text-xs tracking-widest z-10 relative flex flex-col items-center gap-2">
        <span className="uppercase">An Arnab Initiative</span>
        <span className="normal-case text-[0.65rem] max-w-md px-4 opacity-75 tracking-normal">
          🔒 Privacy Note: To help us understand and support our global community, we momentarily collect your approximate regional location (like city or country).
        </span>
      </footer>
    </div>
  );
}

const QuickExitButton = () => (
  <button 
    onClick={() => window.location.replace('https://www.google.com')}
    className="bg-red-500/90 backdrop-blur-sm border border-red-400 text-white font-bold py-2 px-6 rounded-full shadow-sm hover:shadow-md hover:bg-red-600 transition-all text-xs uppercase tracking-wide"
    title="Quick safe exit to Google"
  >
    Quick Exit
  </button>
);

export default App;
