/**
 * GratitudeVault.jsx — Safe Moments Vault
 * ==============================================================
 * A safe, offline collection of positive memories and moments of safety.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'unkahi_vault';

export default function GratitudeVault({ onBack }) {
  const [entries, setEntries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newEntry, setNewEntry] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEntries(JSON.parse(saved));
    } catch {}
  }, []);

  const saveEntry = () => {
    if (!newEntry.trim()) return;
    const updated = [{ id: Date.now(), text: newEntry, date: new Date().toISOString() }, ...entries];
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewEntry('');
    setIsOpen(false);
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-yellow-500/10 rounded-[3rem] px-6 py-10 sm:px-12 max-w-2xl w-full mx-auto mt-6">
      <button onClick={onBack} className="text-slate-400 hover:text-yellow-500 font-bold uppercase tracking-widest text-xs transition-colors mb-8 block">← Back</button>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">The Safe Vault</h1>
          <p className="text-slate-500 font-medium text-sm">A private collection of moments that felt safe or good.</p>
        </div>
        {!isOpen && (
          <button onClick={() => setIsOpen(true)} className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-5 py-2.5 rounded-full font-black text-sm shadow-md transition-all">
            + Add Memory
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
            <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl">
              <p className="text-xs font-black uppercase tracking-widest text-yellow-600 mb-3">Notice a small good thing</p>
              <textarea 
                value={newEntry} onChange={e => setNewEntry(e.target.value)}
                placeholder="A kind word, a warm cup of tea, a moment of quiet..."
                className="w-full bg-white border border-yellow-100 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-3"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-500 font-bold text-sm">Cancel</button>
                <button onClick={saveEntry} className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm">Store in Vault</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100">
          <span className="text-4xl mb-3 block">✨</span>
          <p className="text-slate-500 font-medium">Your vault is empty right now.</p>
          <p className="text-slate-400 text-sm mt-1">When you notice a safe or peaceful moment, store it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {entries.map(e => (
            <div key={e.id} className="bg-white border border-slate-100 shadow-sm p-5 rounded-2xl">
              <p className="text-slate-700 font-medium leading-relaxed mb-3">{e.text}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{new Date(e.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
