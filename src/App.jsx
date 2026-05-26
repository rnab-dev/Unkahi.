import React, { useState, useEffect } from 'react';
import Assessment from './Assessment';
import Dashboard from './Dashboard';
import SupportDirectory from './SupportDirectory';
import BodyMap from './BodyMap';
import ResilienceTracker from './ResilienceTracker';
import LegalRights from './LegalRights';
import AnalyticsDashboard from './AnalyticsDashboard';
import UnifiedDataPage from './UnifiedDataPage';
import { BreathingRoom, GroundingMatrix, LetGoBox, BilateralStimulation } from './HealingTools';
import SomaticHealer from './SomaticHealer';
import KidsMode from './KidsMode';
import LandingPage from './LandingPage';
import NightWatch from './NightWatch';
import SafetyPlan from './SafetyPlan';
import MoodDiary from './MoodDiary';
import PsychoEducation from './PsychoEducation';
import GratitudeVault from './GratitudeVault';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPanel from './AdminPanel';
import B2BSignup from './B2BSignup';
import LegalDisclaimerModal from './LegalDisclaimerModal';
import AdvancedCanvas from './AdvancedCanvas';

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
    return localStorage.getItem('unkahi_terms_accepted') === 'true';
  });

  const handleAcceptTerms = () => {
    localStorage.setItem('unkahi_terms_accepted', 'true');
    setHasAcceptedTerms(true);
  };
  const [assessmentData, setAssessmentData] = useState({
    basicScores: [],
    deepDiveScores: [],
    combinedScores: [],
    suggestedTool: null,
    basicComplete: false,
    deepDiveComplete: false,
  });
  // Keep legacy assessmentScores for Dashboard compatibility
  const [assessmentScores, setAssessmentScores] = useState([]);
  const [sosActive, setSosActive] = useState(false);

  // Check if it's currently between 1 AM and 5 AM
  const currentHour = new Date().getHours();
  const isNightMode = currentHour >= 1 && currentHour < 5;
  // NightWatch shows as an overlay — user can dismiss it to reach the landing page
  const [nightWatchDismissed, setNightWatchDismissed] = useState(false);
  const showNightWatch = isNightMode && !nightWatchDismissed && currentView === 'welcome';

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
      <LandingPage onNavigate={handleNavigate} isTransitioning={isTransitioning} />
    ),
    assessment: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <Assessment
          onNavigate={handleNavigate}
          onComplete={(scores, recommendedTool, type) => {
            if (scores) {
              setAssessmentScores(scores);
              if (type === 'deepdive') {
                // Deep dive just completed — scores are already combined
                setAssessmentData(prev => ({
                  ...prev,
                  combinedScores: scores,
                  deepDiveScores: scores.map((s, i) => s - (prev.basicScores[i] || 0)),
                  deepDiveComplete: true,
                  suggestedTool: recommendedTool ?? prev.suggestedTool,
                }));
              } else if (type === 'basic') {
                // Basic assessment just completed
                setAssessmentData(prev => ({
                  ...prev,
                  basicScores: scores,
                  basicComplete: true,
                  suggestedTool: recommendedTool ?? prev.suggestedTool,
                }));
              } else {
                // Legacy path (no type): detect by whether basic is already done
                if (assessmentData.basicComplete) {
                  setAssessmentData(prev => ({
                    ...prev,
                    combinedScores: scores,
                    deepDiveScores: scores.map((s, i) => s - (prev.basicScores[i] || 0)),
                    deepDiveComplete: true,
                    suggestedTool: recommendedTool ?? prev.suggestedTool,
                  }));
                } else {
                  setAssessmentData(prev => ({
                    ...prev,
                    basicScores: scores,
                    basicComplete: true,
                    suggestedTool: recommendedTool ?? prev.suggestedTool,
                  }));
                }
              }
            }
            // Navigate to the recommended tool if provided
            if (recommendedTool) {
              handleNavigate(recommendedTool);
            }
          }}
        />
      </div>
    ),
    // 'dashboard' is an alias for mydata (unified data page)
    dashboard: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <UnifiedDataPage
          onNavigate={handleNavigate}
          assessmentData={assessmentData}
        />
      </div>
    ),
    mydata: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <UnifiedDataPage
          onNavigate={handleNavigate}
          assessmentData={assessmentData}
        />
      </div>
    ),
    // 'tools' kept as alias so any old reference doesn't crash
    tools: () => renderToolsConfig(),
    breathe: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <BreathingRoom onBack={() => handleNavigate('mydata')} />
      </div>
    ),
    ground: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <GroundingMatrix onBack={() => handleNavigate('mydata')} />
      </div>
    ),
    letgo: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <LetGoBox onBack={() => handleNavigate('mydata')} />
      </div>
    ),
    emdr: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <BilateralStimulation onBack={() => handleNavigate('mydata')} />
      </div>
    ),
    somatic: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <SomaticHealer onBack={() => handleNavigate('mydata')} />
      </div>
    ),
    kids: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <KidsMode onBack={() => handleNavigate('welcome')} />
      </div>
    ),
    support: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <SupportDirectory onBack={() => handleNavigate('dashboard')} />
      </div>
    ),
    bodymap: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <BodyMap onBack={() => handleNavigate('dashboard')} onNavigateTool={handleNavigate} />
      </div>
    ),
    tracker: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <ResilienceTracker onBack={() => handleNavigate('dashboard')} />
      </div>
    ),
    legal: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <LegalRights onBack={() => handleNavigate('dashboard')} />
      </div>
    ),
    analytics: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <AnalyticsDashboard onBack={() => handleNavigate('mydata')} />
      </div>
    ),
    safetyplan: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <SafetyPlan onBack={() => handleNavigate('welcome')} />
      </div>
    ),
    mooddiary: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <MoodDiary onBack={() => handleNavigate('dashboard')} onNavigate={handleNavigate} />
      </div>
    ),
    psychoed: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <PsychoEducation onBack={() => handleNavigate('dashboard')} />
      </div>
    ),
    vault: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <GratitudeVault onBack={() => handleNavigate('dashboard')} />
      </div>
    ),
    admin: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <AdminPanel onBack={() => handleNavigate('welcome')} />
      </div>
    ),
    b2bsignup: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <B2BSignup onBack={() => handleNavigate('welcome')} />
      </div>
    ),
    feelingcanvas: () => (
      <div className={`transition-all duration-500 w-full ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <AdvancedCanvas onBack={() => handleNavigate('welcome')} onNavigateTool={handleNavigate} />
      </div>
    )
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden flex flex-col transition-colors duration-1000 bg-mesh-animated ${currentView === 'assessment'
      ? 'bg-gradient-to-br from-slate-100 via-indigo-100 to-rose-100'
      : 'bg-gradient-to-br from-slate-50 via-purple-50 to-teal-50'
      }`}
    >
      <AnimatePresence>
        {!hasAcceptedTerms && (
          <LegalDisclaimerModal onAccept={handleAcceptTerms} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {sosActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto flex flex-col items-center justify-start py-8 px-4 md:px-6 text-center"
          >
            {/* Top Navigation Row */}
            <div className="w-full max-w-lg flex items-center justify-between mb-8 md:mb-12 relative z-20">
              <button
                onClick={() => setSosActive(false)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 font-bold tracking-widest uppercase text-xs bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full transition-all duration-300 shadow-md"
              >
                <span>←</span> Close
              </button>
              <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full text-rose-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Active Triage
              </div>
            </div>

            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="w-48 h-48 rounded-full bg-indigo-500/20 blur-xl absolute top-12"
            />
            <h2 className="text-3xl md:text-5xl font-black text-slate-200 mb-4 relative z-10 tracking-tight">TIPP Emergency Protocol</h2>
            <p className="text-sm md:text-lg text-slate-400 font-medium max-w-md relative z-10 mb-8 px-2 leading-relaxed">
              Your nervous system is overwhelmed. Do one of these right now to reset.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg relative z-10 mb-8 text-left">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-300 shadow-lg">
                <span className="text-blue-400 font-bold block mb-1">❄️ Temperature</span>
                <span className="text-xs leading-relaxed text-slate-400">Hold an ice cube or splash cold water on your face.</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-300 shadow-lg">
                <span className="text-rose-400 font-bold block mb-1">🏃‍♂️ Intense Exercise</span>
                <span className="text-xs leading-relaxed text-slate-400">Do 20 jumping jacks or sprint in place for 30 seconds.</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-300 shadow-lg">
                <span className="text-emerald-400 font-bold block mb-1">🫁 Paced Breathing</span>
                <span className="text-xs leading-relaxed text-slate-400">Breathe in for 4, hold for 7, out for 8.</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-300 shadow-lg">
                <span className="text-indigo-400 font-bold block mb-1">🧘 Paired Relaxation</span>
                <span className="text-xs leading-relaxed text-slate-400">Tense your hands and feet tight, then release fully.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full max-w-lg justify-center mb-8">
              <a
                href="tel:18005990019"
                className="bg-rose-600 hover:bg-rose-500 text-white font-black py-4 px-6 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                <span className="text-xl animate-pulse">📞</span> KIRAN (1800-599-0019)
              </a>
              <button
                onClick={() => { setSosActive(false); handleNavigate('safetyplan'); }}
                className="bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 font-black py-4 px-6 rounded-full transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                <span className="text-xl">🛡️</span> View My Safety Plan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showNightWatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-slate-950/95 backdrop-blur-sm"
          >
            <button
              onClick={() => setNightWatchDismissed(true)}
              className="absolute top-6 right-6 text-slate-500 hover:text-slate-300 font-bold tracking-widest uppercase text-xs border border-slate-700 px-3 py-2 rounded-full transition-colors"
            >
              Skip →
            </button>
            <NightWatch
              onNavigate={(view) => {
                setNightWatchDismissed(true);
                handleNavigate(view);
              }}
              onDismiss={() => setNightWatchDismissed(true)}
              isTransitioning={isTransitioning}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setSosActive(true)}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all group"
        title="SOS Grounding Override"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">⚓</span>
      </button>

      <FloatingToolsMenu onNavigate={handleNavigate} />

      {currentView !== 'welcome' && (
        <div className="w-full flex flex-row items-center justify-between pt-6 px-6 md:px-10 mb-6 md:mb-8 max-w-6xl mx-auto z-10 transition-all duration-500 opacity-100">
          <div className="flex flex-col cursor-pointer" onClick={() => handleNavigate('welcome')}>
            <h1 className="flex items-center gap-1.5 text-black mb-1">
              <span className="text-2xl md:text-3xl tracking-tight leading-none" style={{ fontFamily: '"London", serif', fontWeight: 900 }}>UN</span>
              <div className="h-6 md:h-7 w-[2.5px] bg-black" />
              <span className="text-2xl md:text-3xl tracking-tighter leading-none" style={{ fontFamily: '"Inknut Antiqua", serif', fontWeight: 800 }}>कही</span>
            </h1>
            <p className="text-[0.45rem] md:text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5">UNDERSTOOD WITHOUT A SINGLE WORD</p>
          </div>
          <QuickExitButton />
        </div>
      )}

      <main className="w-full relative z-10 flex flex-col items-center justify-center flex-grow px-4 md:px-0 pb-24 md:pb-12">
        {viewMap[currentView]()}
      </main>

      <footer className="mt-auto py-6 text-center text-slate-500/80 font-medium text-xs tracking-widest z-10 relative flex flex-col items-center gap-2">
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

const FloatingToolsMenu = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [safeContacts, setSafeContacts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('unkahi_safety_plan');
        if (saved) {
          const plan = JSON.parse(saved);
          if (plan.support_contacts && Array.isArray(plan.support_contacts)) {
            setSafeContacts(plan.support_contacts);
          }
        }
      } catch (e) {
        console.error("Failed to load safety plan for floating menu:", e);
      }
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 left-6 z-[90] flex flex-col-reverse gap-3 items-start">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all group"
        title="Your Place"
      >
        <span className={`text-2xl group-hover:scale-110 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
          {isOpen ? '✖' : '🧭'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, originY: 1, originX: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex flex-col gap-1 mb-2 bg-white/90 backdrop-blur-xl p-3 rounded-[2rem] border border-slate-200/50 shadow-2xl origin-bottom-left max-h-[70vh] overflow-y-auto"
          >
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-3 pt-2">Your Place</p>
            
            <button onClick={() => { setIsOpen(false); onNavigate('safetyplan'); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-2xl transition-colors text-left group">
              <span className="text-xl group-hover:scale-110 transition-transform">🛡️</span>
              <span className="text-sm font-bold text-slate-700">Safety Plan</span>
            </button>
            <button onClick={() => { setIsOpen(false); onNavigate('mooddiary'); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-2xl transition-colors text-left group">
              <span className="text-xl group-hover:scale-110 transition-transform">📝</span>
              <span className="text-sm font-bold text-slate-700">Mood Diary</span>
            </button>
            <button onClick={() => { setIsOpen(false); onNavigate('psychoed'); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-2xl transition-colors text-left group">
              <span className="text-xl group-hover:scale-110 transition-transform">🧠</span>
              <span className="text-sm font-bold text-slate-700">Nervous System Ed</span>
            </button>
            <button onClick={() => { setIsOpen(false); onNavigate('vault'); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-2xl transition-colors text-left group">
              <span className="text-xl group-hover:scale-110 transition-transform">✨</span>
              <span className="text-sm font-bold text-slate-700">Safe Vault</span>
            </button>
            <button onClick={() => { setIsOpen(false); onNavigate('feelingcanvas'); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-2xl transition-colors text-left group">
              <span className="text-xl group-hover:scale-110 transition-transform">🎨</span>
              <span className="text-sm font-bold text-slate-700">Feeling Canvas</span>
            </button>

            {safeContacts.length > 0 && (
              <>
                <div className="h-px w-full bg-slate-200 my-2" />
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 px-3">Safe Contacts</p>
                {safeContacts.map((contact, idx) => {
                  // Extract digits (and + sign) to create a valid phone link
                  const numStr = contact.replace(/[^\d+]/g, '');
                  if (numStr.length >= 3) {
                    return (
                      <a key={idx} href={`tel:${numStr}`} className="flex items-center gap-3 px-4 py-2 hover:bg-rose-50 rounded-2xl transition-colors text-left group">
                        <span className="text-xl group-hover:scale-110 transition-transform text-rose-500">📞</span>
                        <span className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{contact}</span>
                      </a>
                    );
                  }
                  // If there are no recognizable numbers, just render the name
                  return (
                    <div key={idx} className="flex items-center gap-3 px-4 py-2 hover:bg-rose-50 rounded-2xl transition-colors text-left group cursor-default">
                      <span className="text-xl group-hover:scale-110 transition-transform text-slate-400">👤</span>
                      <span className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{contact}</span>
                    </div>
                  );
                })}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
