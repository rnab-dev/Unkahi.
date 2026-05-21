import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KidsLessons from './KidsLessons';
import { BreathingBalloon, WorryMonster, FeelingsCanvas } from './KidsTools';

export default function KidsMode({ onBack }) {
  const [activeTool, setActiveTool] = useState(null);

  const renderTool = () => {
    switch (activeTool) {
      case 'lessons':
        return <KidsLessons onBack={() => setActiveTool(null)} />;
      case 'balloon':
        return <BreathingBalloon onBack={() => setActiveTool(null)} />;
      case 'monster':
        return <WorryMonster onBack={() => setActiveTool(null)} />;
      case 'canvas':
        return <FeelingsCanvas onBack={() => setActiveTool(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-4 border-white shadow-2xl shadow-rose-500/10 rounded-[3rem] p-6 sm:p-8 md:p-12 w-full max-w-4xl mx-auto relative overflow-hidden min-h-[600px] flex flex-col items-center">
      
      {/* Dynamic Header/Back Button */}
      <div className="flex w-full justify-start relative z-10 mb-4">
        {activeTool ? (
          <button onClick={() => setActiveTool(null)} className="text-slate-400 hover:text-rose-400 font-bold uppercase tracking-widest text-xs sm:text-sm transition-colors">
            ← Back to Kids Menu
          </button>
        ) : (
          <button onClick={onBack} className="text-slate-400 hover:text-rose-400 font-bold uppercase tracking-widest text-xs sm:text-sm transition-colors">
            ← Exit Kids Mode
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!activeTool ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col items-center"
          >
            <h2 className="text-4xl md:text-5xl font-black text-rose-400 mb-2 tracking-tight">Kids Safe Space 🏕️</h2>
            <p className="text-lg text-slate-500 font-bold mb-10 text-center max-w-lg">
              Pick a fun activity to help you feel better!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              
              <button onClick={() => setActiveTool('lessons')} className="bg-amber-100 hover:bg-amber-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border-4 border-amber-50 text-left group">
                <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform origin-left">🧸</span>
                <h3 className="text-2xl font-black text-amber-600">Story Quizzes</h3>
                <p className="text-amber-700/70 font-bold text-sm mt-1">Learn about big feelings!</p>
              </button>

              <button onClick={() => setActiveTool('balloon')} className="bg-teal-100 hover:bg-teal-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border-4 border-teal-50 text-left group">
                <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform origin-left">🎈</span>
                <h3 className="text-2xl font-black text-teal-600">Breathing Balloon</h3>
                <p className="text-teal-700/70 font-bold text-sm mt-1">Take a deep breath with me.</p>
              </button>

              <button onClick={() => setActiveTool('monster')} className="bg-indigo-100 hover:bg-indigo-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border-4 border-indigo-50 text-left group">
                <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform origin-left">👾</span>
                <h3 className="text-2xl font-black text-indigo-600">Worry Monster</h3>
                <p className="text-indigo-700/70 font-bold text-sm mt-1">Feed me your worries!</p>
              </button>

              <button onClick={() => setActiveTool('canvas')} className="bg-pink-100 hover:bg-pink-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border-4 border-pink-50 text-left group">
                <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform origin-left">🎨</span>
                <h3 className="text-2xl font-black text-pink-600">Feelings Canvas</h3>
                <p className="text-pink-700/70 font-bold text-sm mt-1">Draw out your emotions.</p>
              </button>

            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="tool"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: 20 }}
            className="w-full flex-grow flex flex-col items-center justify-center relative z-10"
          >
            {renderTool()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
