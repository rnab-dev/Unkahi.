import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLegalScenarios } from './utils/supabaseSync';

const DEFAULT_SCENARIOS = [
  {
    id: 1,
    title: "The Late Night Colleague",
    situation: "A male colleague repeatedly messages you late at night about non-work topics, even after you've stopped replying.",
    law: "POSH Act (Prevention of Sexual Harassment)",
    explanation: "This is a form of verbal/digital sexual harassment. The POSH Act covers harassment via electronic communication by a colleague. You have the right to file a complaint with your company's Internal Complaints Committee (ICC).",
    misuse: "Filing a POSH complaint against a manager simply because you received a poor performance review, without any actual harassment occurring, is a misuse of the law and can lead to disciplinary action against you.",
    type: "Illegal"
  },
  {
    id: 2,
    title: "The Dowry Threat",
    situation: "Your in-laws are constantly insulting you and demanding your parents buy them a car, threatening to throw you out if they don't.",
    law: "Section 498A (Cruelty) & Dowry Prohibition Act",
    explanation: "This is illegal. Mental cruelty and demands for property/money from a woman or her family are punishable under Section 498A and the Dowry Prohibition Act.",
    misuse: "Filing a 498A case against elderly in-laws or relatives who live in a different city and have no interaction with you, purely as leverage in a divorce settlement, is a gross misuse of the law and is viewed strictly by courts.",
    type: "Illegal"
  },
  {
    id: 3,
    title: "The Ex's Revenge",
    situation: "An ex-partner threatens to post private, intimate photos of you online unless you agree to meet them.",
    law: "IT Act Section 66E & Section 67",
    explanation: "This is Cyberstalking and Non-Consensual Image Sharing (Revenge Porn). It is a severe criminal offense in India. You can report this immediately to the National Cyber Crime portal.",
    misuse: "Threatening to file a false rape or harassment case against an ex-partner purely because the relationship ended mutually but bitterly.",
    type: "Illegal"
  },
  {
    id: 4,
    title: "The Unhelpful Police",
    situation: "You go to a police station to report stalking, but they tell you the incident happened in a different area and refuse to write the FIR.",
    law: "Zero FIR",
    explanation: "Police cannot refuse! You have the right to file a 'Zero FIR' at ANY police station in India, regardless of jurisdiction. The police must register it and transfer it to the correct station themselves.",
    misuse: "N/A - This is a procedural right.",
    type: "Illegal Practice by Police"
  }
];

const FlipCard = ({ scenario }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-full h-[460px] sm:h-[420px] md:h-[400px]" style={{ perspective: 1000 }}>
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <div 
          className="absolute w-full h-full bg-white border border-slate-200 rounded-[2rem] shadow-lg p-6 md:p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-xl transition-shadow"
          style={{ backfaceVisibility: 'hidden' }}
          onClick={() => setIsFlipped(true)}
        >
          <span className="text-4xl mb-4">🤔</span>
          <h3 className="text-xl font-black text-slate-800 mb-4">{scenario.title}</h3>
          <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed">
            "{scenario.situation}"
          </p>
          <button className="mt-8 bg-indigo-50 text-indigo-600 font-bold py-2 px-6 rounded-full hover:bg-indigo-100 transition-colors">
            Tap to Reveal Truth
          </button>
        </div>

        {/* Back of Card */}
        <div 
          className="absolute w-full h-full bg-indigo-600 rounded-[2rem] shadow-xl p-6 md:p-8 flex flex-col justify-start text-left overflow-y-auto custom-card-scroll"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex flex-row items-center justify-between gap-2 mb-4 w-full relative z-20 flex-wrap sm:flex-nowrap">
            <div className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit">
              {scenario.law}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest transition-all bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer"
            >
              ← Scenario
            </button>
          </div>

          <p className="text-white text-sm md:text-base font-medium mb-4 leading-relaxed pr-1">
            <strong className="block text-indigo-200 mb-1">The Reality:</strong>
            {scenario.explanation}
          </p>
          
          {scenario.misuse !== "N/A - This is a procedural right." && (
            <div className="mt-auto bg-slate-900/40 p-4 rounded-xl border border-white/10">
              <strong className="block text-rose-300 text-xs uppercase tracking-widest mb-1">The Ethical Boundary (Misuse)</strong>
              <p className="text-slate-300 text-xs leading-relaxed">
                {scenario.misuse}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function LegalRights({ onBack }) {
  const [activeTab, setActiveTab] = useState('scenarios');
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);

  useEffect(() => {
    fetchLegalScenarios(DEFAULT_SCENARIOS).then(data => setScenarios(data));
  }, []);

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[3rem] px-6 py-10 sm:px-12 sm:pt-10 sm:pb-16 mt-6 sm:mt-10 max-w-5xl w-full mx-auto flex flex-col items-center transform-gpu relative overflow-hidden min-h-[700px]">
      
      <div className="flex items-start justify-start w-full relative z-10 mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest text-xs transition-colors">
          ← Return to Dashboard
        </button>
      </div>

      <div className="w-full relative z-10 text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-3">Know Your Rights</h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
          Empower yourself with legal literacy. Understand how the law protects you in India, and learn the ethical boundary between asserting your rights and misusing them.
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex gap-3 text-left">
        <span className="text-amber-500 text-xl">⚠️</span>
        <p className="text-xs text-amber-700 font-medium leading-relaxed">
          <strong>Disclaimer:</strong> The information provided here is for educational purposes and legal literacy only. It does not constitute professional legal advice. Laws are complex and subject to change. Always consult a qualified lawyer or the police for your specific situation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-full w-full max-w-md mx-auto mb-8 relative z-10">
        <button 
          onClick={() => setActiveTab('scenarios')}
          className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all ${activeTab === 'scenarios' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Interactive Scenarios
        </button>
        <button 
          onClick={() => setActiveTab('glossary')}
          className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all ${activeTab === 'glossary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Quick Glossary
        </button>
      </div>

      <div className="w-full relative z-10 flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'scenarios' ? (
            <motion.div 
              key="scenarios"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
            >
              {scenarios.map(s => <FlipCard key={s.id} scenario={s} />)}
            </motion.div>
          ) : (
            <motion.div 
              key="glossary"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col gap-6 text-left"
            >
              <div>
                <h4 className="text-lg font-black text-slate-800 flex items-center gap-2"><span className="text-rose-500">🛡️</span> Zero FIR</h4>
                <p className="text-slate-600 text-sm font-medium mt-1">A police complaint that can be registered at any police station irrespective of the jurisdiction where the incident occurred. Helpful in emergencies.</p>
              </div>
              <div className="h-px w-full bg-slate-100" />
              <div>
                <h4 className="text-lg font-black text-slate-800 flex items-center gap-2"><span className="text-purple-500">🏢</span> ICC (Internal Complaints Committee)</h4>
                <p className="text-slate-600 text-sm font-medium mt-1">Under the POSH Act, every organization with 10 or more employees must have an ICC to handle sexual harassment complaints internally.</p>
              </div>
              <div className="h-px w-full bg-slate-100" />
              <div>
                <h4 className="text-lg font-black text-slate-800 flex items-center gap-2"><span className="text-teal-500">🚫</span> Right to Privacy (Article 21)</h4>
                <p className="text-slate-600 text-sm font-medium mt-1">A fundamental right in India. Sharing private photos without consent, stalking, or tapping phones without authorization violates this right.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
