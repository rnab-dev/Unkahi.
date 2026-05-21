import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ResilienceTracker({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [newTrigger, setNewTrigger] = useState('');
  const [newIntensity, setNewIntensity] = useState(5);
  const [selectedRelief, setSelectedRelief] = useState('breathe');

  useEffect(() => {
    const saved = localStorage.getItem('unkahi_resilience_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveLog = () => {
    if (!newTrigger.trim()) return;
    
    const logEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      trigger: newTrigger,
      intensity: newIntensity,
      relief: selectedRelief
    };

    const updated = [logEntry, ...logs].slice(0, 50); // Keep last 50
    setLogs(updated);
    localStorage.setItem('unkahi_resilience_logs', JSON.stringify(updated));
    
    setNewTrigger('');
    setNewIntensity(5);
  };

  const clearLogs = () => {
    if (window.confirm("Are you sure you want to delete all your logs? This cannot be undone.")) {
      setLogs([]);
      localStorage.removeItem('unkahi_resilience_logs');
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[3rem] px-6 py-10 sm:px-12 sm:pt-10 sm:pb-16 mt-6 sm:mt-10 max-w-4xl w-full mx-auto flex flex-col items-center transform-gpu relative overflow-hidden min-h-[650px]">
      
      <div className="flex items-start justify-between w-full relative z-10 mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest text-xs transition-colors">
          ← Return
        </button>
        {logs.length > 0 && (
          <button onClick={clearLogs} className="text-red-400 hover:text-red-600 font-bold uppercase tracking-widest text-xs transition-colors">
            Clear Data
          </button>
        )}
      </div>

      <div className="w-full relative z-10 text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-3">Resilience Tracker</h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Notice your patterns. Track what triggers your anxiety and which healing tools help you recover fastest. 
          <strong className="block mt-1 text-indigo-500">100% private. Saved only on this device.</strong>
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* Input Column */}
        <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-slate-100 flex flex-col h-fit">
          <h3 className="text-xl font-bold text-slate-700 mb-6">Log a Moment</h3>
          
          <label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">What triggered you?</label>
          <input 
            type="text" 
            value={newTrigger}
            onChange={(e) => setNewTrigger(e.target.value)}
            placeholder="e.g. A difficult conversation, loud noise..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          />

          <label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
            <span>Intensity</span>
            <span className="text-indigo-500">{newIntensity}/10</span>
          </label>
          <input 
            type="range" 
            min="1" max="10" 
            value={newIntensity}
            onChange={(e) => setNewIntensity(Number(e.target.value))}
            className="w-full mb-6 accent-indigo-500"
          />

          <label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">What helped you recover?</label>
          <select 
            value={selectedRelief}
            onChange={(e) => setSelectedRelief(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 mb-8 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="breathe">🌸 Breathing Room</option>
            <option value="ground">🧱 Grounding Matrix</option>
            <option value="letgo">💨 "Let Go" Box</option>
            <option value="emdr">🎧 Binaural EMDR</option>
            <option value="somatic">🧍 Body Map Release</option>
            <option value="other">Other / Just waited it out</option>
          </select>

          <button 
            onClick={saveLog}
            disabled={!newTrigger.trim()}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            Save Log
          </button>
        </div>

        {/* History Column */}
        <div className="bg-slate-50 rounded-[2rem] p-6 shadow-inner border border-slate-200 flex flex-col h-[500px] overflow-hidden">
          <h3 className="text-xl font-bold text-slate-700 mb-4 px-2">Your Journey</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <span className="text-4xl mb-3">🌱</span>
                <p className="font-medium text-center">No logs yet.<br/>Your history will appear here.</p>
              </div>
            ) : (
              logs.map((log) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  key={log.id} 
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{log.date}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${log.intensity > 7 ? 'bg-rose-100 text-rose-600' : log.intensity > 4 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      Level {log.intensity}
                    </span>
                  </div>
                  <p className="text-slate-800 font-bold mb-2">{log.trigger}</p>
                  <div className="flex items-center gap-2 text-xs font-medium text-indigo-500 bg-indigo-50 p-2 rounded-lg w-fit">
                    <span>Used:</span>
                    <span className="font-bold capitalize">{log.relief}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
