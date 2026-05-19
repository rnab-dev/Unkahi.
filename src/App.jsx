import React, { useState } from 'react';
import Assessment from './Assessment';
import { BreathingRoom, GroundingMatrix, LetGoBox } from './HealingTools';
import KidsMode from './KidsMode';
import LandingPage from './LandingPage';

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [isTransitioning, setIsTransitioning] = useState(false);

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
      </div>
    </div>
  );

  const viewMap = {
    welcome: () => (
      <LandingPage onNavigate={handleNavigate} isTransitioning={isTransitioning} />
    ),
    assessment: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <Assessment onComplete={() => handleNavigate('tools')} />
      </div>
    ),
    tools: renderToolsConfig,
    breathe: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <BreathingRoom onBack={() => handleNavigate('tools')} />
      </div>
    ),
    ground: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <GroundingMatrix onBack={() => handleNavigate('tools')} />
      </div>
    ),
    letgo: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <LetGoBox onBack={() => handleNavigate('tools')} />
      </div>
    ),
    kids: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <KidsMode onBack={() => handleNavigate('welcome')} />
      </div>
    )
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden flex flex-col p-4 md:p-8 transition-colors duration-1000 ${
        currentView === 'assessment' 
          ? 'bg-gradient-to-br from-cyan-100 via-purple-200 to-pink-100' 
          : 'bg-gradient-to-br from-cyan-50 via-purple-100 to-pink-50'
      }`}
    >
      {currentView !== 'welcome' && (
        <div className="w-full flex flex-row items-center justify-between mb-6 md:mb-8 max-w-6xl mx-auto z-10 transition-all duration-500 opacity-100">
          <div className="flex flex-col cursor-pointer" onClick={() => handleNavigate('welcome')}>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#475569] tracking-widest uppercase">UNKAHI</h1>
            <p className="text-[0.55rem] md:text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Interactive Psychological Safety</p>
          </div>
          <QuickExitButton />
        </div>
      )}
      
      <div className="w-full max-w-6xl relative z-10 flex flex-col items-center justify-center flex-grow mx-auto">
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
