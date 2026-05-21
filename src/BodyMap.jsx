import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ZONES = [
  {
    id: 'head',
    name: 'Head & Mind',
    symptoms: 'Racing thoughts, brain fog, tension headache',
    action: 'Grounding Matrix',
    toolId: 'ground',
    color: 'bg-purple-500',
    hover: 'hover:fill-purple-400',
    d: "M40 20 C40 5, 60 5, 60 20 C60 30, 55 35, 50 40 C45 35, 40 30, 40 20 Z"
  },
  {
    id: 'throat',
    name: 'Throat & Neck',
    symptoms: 'Tightness, lump in throat, unable to speak',
    action: 'Vagus Nerve Reset',
    toolId: 'breathe',
    color: 'bg-indigo-500',
    hover: 'hover:fill-indigo-400',
    d: "M45 40 L55 40 L55 48 L45 48 Z"
  },
  {
    id: 'chest',
    name: 'Heart & Chest',
    symptoms: 'Fast heartbeat, shallow breathing, panic',
    action: 'Binaural EMDR',
    toolId: 'emdr',
    color: 'bg-rose-500',
    hover: 'hover:fill-rose-400',
    d: "M35 50 C35 50, 65 50, 65 50 C70 60, 65 75, 50 75 C35 75, 30 60, 35 50 Z"
  },
  {
    id: 'stomach',
    name: 'Stomach & Gut',
    symptoms: 'Nausea, knots, butterflies, dread',
    action: '"Let Go" Vault',
    toolId: 'letgo',
    color: 'bg-amber-500',
    hover: 'hover:fill-amber-400',
    d: "M38 78 C38 78, 62 78, 62 78 C62 95, 55 105, 50 105 C45 105, 38 95, 38 78 Z"
  }
];

export default function BodyMap({ onBack, onNavigateTool }) {
  const [activeZone, setActiveZone] = useState(null);

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[3rem] px-6 py-10 sm:px-12 sm:pt-10 sm:pb-16 mt-6 sm:mt-10 max-w-4xl w-full mx-auto flex flex-col items-center transform-gpu relative overflow-hidden min-h-[650px]">
      
      <div className="flex items-start justify-start w-full relative z-10 mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest text-xs transition-colors">
          ← Return to Dashboard
        </button>
      </div>

      <div className="w-full relative z-10 text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-3">Somatic Body Map</h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Trauma and anxiety live in the physical body. Tap the area where you feel the most tension or discomfort right now, and we'll suggest a release technique.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full mt-4">
        
        {/* Interactive SVG Body */}
        <div className="relative w-48 h-80">
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Base Body Outline */}
            <path 
              d="M40 20 C40 5, 60 5, 60 20 C60 30, 55 35, 50 40 C45 35, 40 30, 40 20 Z M45 40 L55 40 L55 48 L45 48 Z M35 50 C35 50, 65 50, 65 50 C70 60, 65 75, 50 75 C35 75, 30 60, 35 50 Z M38 78 C38 78, 62 78, 62 78 C62 95, 55 105, 50 105 C45 105, 38 95, 38 78 Z M30 55 C20 60, 25 90, 25 90 L35 90 C35 90, 35 65, 35 55 Z M70 55 C80 60, 75 90, 75 90 L65 90 C65 90, 65 65, 65 55 Z M40 105 C35 115, 35 140, 35 140 L45 140 C45 140, 45 115, 50 105 Z M60 105 C65 115, 65 140, 65 140 L55 140 C55 140, 55 115, 50 105 Z" 
              fill="#e2e8f0" 
            />
            
            {/* Interactive Zones */}
            {ZONES.map(zone => (
              <motion.path
                key={zone.id}
                d={zone.d}
                fill={activeZone?.id === zone.id ? 'var(--active-color)' : '#cbd5e1'}
                className={`cursor-pointer transition-colors duration-300 ${zone.hover}`}
                style={{ '--active-color': zone.id === 'head' ? '#a855f7' : zone.id === 'throat' ? '#6366f1' : zone.id === 'chest' ? '#f43f5e' : '#f59e0b' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveZone(zone)}
              />
            ))}
          </svg>
        </div>

        {/* Selected Zone Info */}
        <div className="w-full md:w-96 min-h-[250px] bg-white rounded-[2rem] shadow-lg border border-slate-100 p-8 flex flex-col justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeZone ? (
              <motion.div
                key={activeZone.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                <div className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-4 ${activeZone.color}`}>
                  {activeZone.name}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Feeling it here?</h3>
                <p className="text-slate-500 font-medium mb-6">Common symptoms: {activeZone.symptoms}</p>
                
                <button 
                  onClick={() => onNavigateTool(activeZone.toolId)}
                  className={`w-full py-4 rounded-xl text-white font-bold shadow-md hover:-translate-y-1 transition-transform flex justify-between px-6 items-center ${activeZone.color}`}
                >
                  <span>Use: {activeZone.action}</span>
                  <span>→</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center opacity-50 relative z-10"
              >
                <span className="text-4xl mb-4 block">👆</span>
                <p className="text-slate-500 font-bold">Tap a highlighted area on the body to see relief options.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
