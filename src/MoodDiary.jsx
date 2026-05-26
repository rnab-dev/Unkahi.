import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STORAGE_KEY = 'unkahi_mood_diary';

const WOT_ZONES = [
  { id: 'hyper', label: 'Hyperarousal (Fight/Flight)', desc: 'Anxious, panicky, angry, overwhelmed, racing thoughts.', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', tool: 'breathe' },
  { id: 'wot', label: 'Window of Tolerance', desc: 'Calm, present, able to think and feel simultaneously.', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', tool: 'vault' },
  { id: 'hypo', label: 'Hypoarousal (Freeze/Shut down)', desc: 'Numb, disconnected, exhausted, dissociated, empty.', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', tool: 'ground' },
];

export default function MoodDiary({ onBack, onNavigate }) {
  const [entries, setEntries] = useState([]);
  const [step, setStep] = useState('list'); // list, new
  const [form, setForm] = useState({ wot: 5, emotions: [], notes: '' });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEntries(JSON.parse(saved));
    } catch {}
  }, []);

  const saveEntry = async () => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...form
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Abstract analytics push to Supabase
    try {
      const { syncMoodDiaryEntry } = await import('./utils/supabaseSync');
      syncMoodDiaryEntry(newEntry);
    } catch (e) {
      console.warn("Failed to sync mood diary to telemetry", e);
    }

    setStep('list');
    setForm({ wot: 5, emotions: [], notes: '' });
  };

  const getWotZone = (val) => {
    if (val >= 8) return WOT_ZONES[0];
    if (val <= 3) return WOT_ZONES[2];
    return WOT_ZONES[1];
  };

  const currentZone = getWotZone(form.wot);

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-emerald-500/10 rounded-[3rem] px-6 py-10 sm:px-12 max-w-2xl w-full mx-auto mt-6">
      <button onClick={onBack} className="text-slate-400 hover:text-emerald-500 font-bold uppercase tracking-widest text-xs transition-colors mb-8 block">← Back</button>
      
      {step === 'list' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Mood Diary</h1>
              <p className="text-slate-500 font-medium text-sm">A safe space to notice how you feel.</p>
            </div>
            <button onClick={() => setStep('new')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md transition-all">
              + Check In
            </button>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100">
              <span className="text-4xl mb-3 block">🌱</span>
              <p className="text-slate-500 font-medium">Your diary is empty.</p>
              <p className="text-slate-400 text-sm mt-1">Check in when you're ready. No pressure, no streaks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map(e => {
                const zone = getWotZone(e.wot);
                return (
                  <div key={e.id} className={`${zone.bg} border ${zone.border} p-5 rounded-2xl`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className={`font-black text-sm ${zone.color}`}>{zone.label}</p>
                      <p className="text-xs font-bold text-slate-400">{new Date(e.date).toLocaleDateString()}</p>
                    </div>
                    {e.notes && <p className="text-slate-600 text-sm font-medium mt-2">{e.notes}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {step === 'new' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-black text-slate-800 mb-6">How is your nervous system right now?</h2>
          
          {/* Window of Tolerance Slider */}
          <div className="mb-8">
            <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Window of Tolerance</label>
            <input 
              type="range" min="1" max="10" value={form.wot} 
              onChange={e => setForm({...form, wot: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
              <span>Hypoarousal (Freeze)</span>
              <span>Window of Tolerance</span>
              <span>Hyperarousal (Fight/Flight)</span>
            </div>
          </div>

          <div className={`${currentZone.bg} border ${currentZone.border} p-5 rounded-2xl mb-8`}>
            <p className={`font-black ${currentZone.color}`}>{currentZone.label}</p>
            <p className="text-sm font-medium text-slate-600 mt-1 mb-3">{currentZone.desc}</p>
            <button 
              onClick={() => onNavigate(currentZone.tool)}
              className="text-xs font-bold bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              Try a helpful tool →
            </button>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Notes (Optional)</label>
            <textarea 
              value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="What's on your mind? Only you can see this."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('list')} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50">Cancel</button>
            <button onClick={saveEntry} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-black shadow-md">Save Entry</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
