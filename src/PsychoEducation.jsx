/**
 * PsychoEducation.jsx — Nervous System Education Library
 * ==============================================================
 * 10-card swipable education module. Validated trauma-informed psychoeducation.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPsychoEducationCards } from './utils/supabaseSync';

const DEFAULT_CARDS = [
  { id: 1, title: 'What is trauma?', emoji: '🧠', content: 'Trauma is not just the event that happened to you. It is what happens inside your nervous system as a result of the event. It is a biological response, not a personal failure.' },
  { id: 2, title: 'The Window of Tolerance', emoji: '🪟', content: 'We all have an optimal zone where we can handle stress. Trauma shrinks this window. Healing is about slowly expanding your window so you can feel safe in your body again.' },
  { id: 3, title: 'Hyperarousal (Fight/Flight)', emoji: '🔥', content: 'When you feel panicked, angry, or constantly on edge, your nervous system is stuck on the "accelerator". It is scanning for danger to keep you safe.' },
  { id: 4, title: 'Hypoarousal (Freeze/Fawn)', emoji: '🧊', content: 'When you feel numb, disconnected, or exhausted, your nervous system has hit the "brakes". It shuts down to protect you from overwhelming pain.' },
  { id: 5, title: 'Why guilt is not your fault', emoji: '⚖️', content: 'After trauma, the brain often creates guilt. It\'s an attempt to feel in control—because if it was your fault, it means you could have prevented it. This is a survival trick, not the truth.' },
  { id: 6, title: 'Somatic Memory', emoji: '🧬', content: 'The body remembers what the mind tries to forget. Trauma is stored in muscle tension, posture, and physiological reactions. Healing requires involving the body.' }
];

export default function PsychoEducation({ onBack }) {
  const [index, setIndex] = useState(0);
  const [cards, setCards] = useState(DEFAULT_CARDS);

  useEffect(() => {
    fetchPsychoEducationCards(DEFAULT_CARDS).then(data => setCards(data));
  }, []);

  const next = () => { if (index < cards.length - 1) setIndex(index + 1); };
  const prev = () => { if (index > 0) setIndex(index - 1); };

  const card = cards[index] || cards[0] || DEFAULT_CARDS[0];

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-sky-500/10 rounded-[3rem] px-6 py-10 sm:px-12 max-w-xl w-full mx-auto mt-6 text-center">
      <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-sky-500 font-bold uppercase tracking-widest text-xs transition-colors">← Back</button>
      
      <p className="text-xs font-black uppercase tracking-widest text-sky-400 mb-8">Nervous System Library</p>

      <AnimatePresence mode="wait">
        <motion.div key={card.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[300px] flex flex-col items-center justify-center">
          <span className="text-6xl mb-6">{card.emoji}</span>
          <h2 className="text-2xl font-black text-slate-800 mb-4">{card.title}</h2>
          <p className="text-slate-600 font-medium leading-relaxed">{card.content}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-8">
        <button onClick={prev} disabled={index === 0} className="px-6 py-3 rounded-full font-bold text-sm bg-slate-100 text-slate-500 disabled:opacity-30">Previous</button>
        <span className="text-xs font-black text-slate-300 tracking-widest">{index + 1} / {cards.length}</span>
        <button onClick={next} disabled={index === cards.length - 1} className="px-6 py-3 rounded-full font-bold text-sm bg-sky-500 text-white disabled:opacity-30">Next</button>
      </div>
      
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8">This is your nervous system protecting you. It is doing its job.</p>
    </div>
  );
}
