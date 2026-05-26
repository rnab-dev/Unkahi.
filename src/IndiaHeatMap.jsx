import React from 'react';
import { motion } from 'framer-motion';

export default function IndiaHeatMap({ regionData }) {
  // Convert regionData to an array and sort by avgScore descending
  const nodes = Object.keys(regionData || {}).map(region => ({
    region,
    ...regionData[region]
  })).sort((a, b) => b.avgScore - a.avgScore);

  if (!nodes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-full text-slate-400 p-8 text-center bg-slate-900 rounded-3xl border border-slate-800">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin opacity-50 mb-4" />
        <p className="font-bold tracking-widest uppercase text-xs">Waiting for Telemetry Grid Data...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-900 rounded-3xl p-6 md:p-8 overflow-hidden relative border border-slate-800 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] flex flex-col">
      {/* Radar Sweeper Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0,transparent_70%)] pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-4 relative z-10">
        <div>
          <h3 className="text-white font-black tracking-widest uppercase text-sm md:text-base flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" /> 
            Live Telemetry Grid
          </h3>
          <p className="text-slate-400 text-[10px] md:text-xs font-semibold mt-1">Active regional nervous system loads detected in real-time.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Active Regions</p>
          <span className="text-2xl font-black text-indigo-400">{nodes.length}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4 relative z-10" style={{ maxHeight: '400px' }}>
        {nodes.map((node, i) => {
          let color = "bg-emerald-500";
          let textColor = "text-emerald-300";
          let glow = "shadow-[0_0_15px_rgba(16,185,129,0.3)]";
          let status = "BASELINE";
          
          if (node.avgScore >= 80) { 
            color = "bg-rose-500"; 
            textColor = "text-rose-200"; 
            glow = "shadow-[0_0_25px_rgba(244,63,94,0.8)] animate-pulse"; 
            status = "CRITICAL"; 
          } else if (node.avgScore >= 60) { 
            color = "bg-orange-500"; 
            textColor = "text-orange-200"; 
            glow = "shadow-[0_0_15px_rgba(249,115,22,0.5)]"; 
            status = "ELEVATED"; 
          } else if (node.avgScore >= 40) { 
            color = "bg-yellow-500"; 
            textColor = "text-yellow-200"; 
            status = "MODERATE"; 
          }
 
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.05, 0.5) }} // Cap delay so it loads fast
              key={node.region} 
              className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center relative group hover:border-slate-600 transition-colors"
            >
              {/* Blinking indicator dot */}
              <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${color} ${glow}`} />
              
              <h4 className="text-white font-bold text-sm md:text-base mb-1 w-full truncate px-3">{node.region}</h4>
              <p className={`text-[9px] font-black tracking-widest ${textColor} mb-3 uppercase`}>{status}</p>
              
              <div className="grid grid-cols-2 divide-x divide-slate-700/60 w-full bg-slate-900/50 rounded-xl py-2 mt-1">
                <div className="text-center px-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Load</p>
                  <p className="text-base md:text-lg font-black text-white">{node.avgScore}%</p>
                </div>
                <div className="text-center px-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Logs</p>
                  <p className="text-base md:text-lg font-black text-slate-400">{node.count}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
