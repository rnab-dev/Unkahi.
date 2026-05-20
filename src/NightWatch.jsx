import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function NightWatch({ onNavigate, isTransitioning }) {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} bg-slate-950 overflow-hidden`}>
      
      {/* Deep Night Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-[20%] w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] bg-indigo-900/40 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-1/4 -right-[20%] w-[120vw] h-[120vw] md:w-[70vw] md:h-[70vw] bg-slate-800/60 rounded-full blur-[140px]"
        />
      </div>

      {/* Cinematic Noise (Darker for night) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-2xl px-6 py-12 flex flex-col items-center text-center">
        {!hasInteracted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h1 className="text-3xl md:text-5xl font-black text-slate-300 tracking-tight mb-16 leading-tight">
              It's late. <br/>
              <span className="text-slate-500 font-medium text-2xl md:text-3xl mt-4 block">Are you safe, or are you just awake?</span>
            </h1>

            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
              <button 
                onClick={() => setHasInteracted('awake')}
                className="flex-1 border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-bold py-5 px-6 rounded-2xl transition-all"
              >
                Just awake.
              </button>
              <button 
                onClick={() => setHasInteracted('unsafe')}
                className="flex-1 border border-indigo-900/50 bg-indigo-950/30 hover:bg-indigo-900/60 text-indigo-300 font-bold py-5 px-6 rounded-2xl transition-all"
              >
                I don't feel safe.
              </button>
            </div>
          </motion.div>
        ) : hasInteracted === 'awake' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center"
          >
            <p className="text-xl text-slate-400 font-medium mb-12">
              The world is quiet right now. Let's just breathe until you're ready to rest.
            </p>
            <button 
              onClick={() => onNavigate('breathe')}
              className="bg-indigo-900/50 border border-indigo-700/50 text-indigo-200 font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-indigo-900/20 transition-all"
            >
              Open Breathing Room
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center"
          >
            <p className="text-xl text-slate-400 font-medium mb-12">
              You are not alone in the dark. Let's anchor you back to the present.
            </p>
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <button 
                onClick={() => onNavigate('ground')}
                className="w-full bg-slate-800 border border-slate-600 text-slate-200 font-bold py-4 px-8 rounded-xl hover:bg-slate-700 transition-all"
              >
                Grounding Matrix
              </button>
              <button 
                onClick={() => onNavigate('letgo')}
                className="w-full bg-slate-800/50 border border-slate-700 text-slate-400 font-bold py-4 px-8 rounded-xl hover:bg-slate-700 transition-all"
              >
                Let Go Box
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
