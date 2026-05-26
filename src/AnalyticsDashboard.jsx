import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useEmotionalBaseline } from './hooks/useEmotionalBaseline';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const RELIEF_EMOJI = {
  breathe: '🌸',
  ground: '🧱',
  letgo: '💨',
  emdr: '🎧',
  somatic: '🧍',
  other: '✨',
};

const TREND_CONFIG = {
  improving: { label: 'Improving ↓', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400', desc: 'Your nervous system is finding more regulation over time.' },
  worsening: { label: 'Needs Attention ↑', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400', desc: 'Your load has been climbing. This is information, not a verdict.' },
  stable: { label: 'Stable →', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400', desc: 'Your nervous system is maintaining a consistent pattern.' },
};
function JourneyChart({ last7Days, isTriggered }) {
  if (last7Days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-300">
        <span className="text-5xl mb-3">📊</span>
        <p className="text-sm font-medium">Complete your first assessment to see your journey.</p>
      </div>
    );
  }

  const labels = last7Days.map(r => formatDateLabel(r.date));
  const scores = last7Days.map(r => r.score);

  const pointColors = scores.map((s, i) => {
    if (i === scores.length - 1 && isTriggered) return '#f59e0b';
    return '#818cf8';
  });

  const data = {
    labels,
    datasets: [{
      data: scores,
      fill: true,
      tension: 0.4,
      borderColor: '#818cf8',
      borderWidth: 2.5,
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(129, 140, 248, 0.25)');
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0)');
        return gradient;
      },
      pointBackgroundColor: pointColors,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'inherit', size: 11, weight: '600' } } },
      y: {
        min: 0, max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8', font: { family: 'inherit', size: 11 }, callback: (v) => `${v}`, stepSize: 25 },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff', titleColor: '#334155', bodyColor: '#64748b',
        borderColor: '#e2e8f0', borderWidth: 1, padding: 12, cornerRadius: 12,
        callbacks: { label: (ctx) => ` Nervous System Load: ${ctx.parsed.y}` },
      },
    },
  };

  return <div style={{ height: '200px' }}><Line data={data} options={options} /></div>;
}
function ScoreRing({ score }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 70 ? '#ef4444' : score > 45 ? '#818cf8' : '#34d399';

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="56" cy="56" r={radius} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black text-slate-800">{score}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Load</span>
      </div>
    </div>
  );
}
export default function AnalyticsDashboard({ onBack }) {
  const { history, last7Days, isTriggered, trendDirection, baseline, stdDev, isLoading } = useEmotionalBaseline();
  const [logs, setLogs] = useState([]);

  const trend = TREND_CONFIG[trendDirection] || TREND_CONFIG.stable;

  useEffect(() => {
    const saved = localStorage.getItem('unkahi_resilience_logs');
    if (saved) {
      try { setLogs(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const latestHistory = history[history.length - 1];
  const latestScore = latestHistory?.score ?? (last7Days.length > 0 ? last7Days[last7Days.length - 1].score : null);

  // Build unified timeline
  const assessmentEntries = history.map(h => ({
    id: `assessment-${h.date}-${h.score}`,
    type: 'assessment',
    date: h.date,
    score: h.score,
  }));

  const logEntries = logs.map(l => ({
    id: `log-${l.id}`,
    type: 'log',
    date: l.date,
    trigger: l.trigger,
    intensity: l.intensity,
    relief: l.relief,
  }));

  const timeline = [...assessmentEntries, ...logEntries].sort((a, b) => {
    // For assessment entries, date is "YYYY-MM-DD"; for log entries, date is a locale string
    // Both can be sorted by their position in the original arrays (assessments are most recent last)
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest text-xs transition-colors">
          ← Back
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Insights</h1>
          <p className="text-xs text-slate-400 font-medium">100% local · never uploaded</p>
        </div>
      </div>

      {/* Current State Overview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-xl shadow-indigo-500/5"
      >
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Current State Overview</h2>

        {isLoading ? (
          <p className="text-slate-300 text-sm animate-pulse">Reading local data…</p>
        ) : latestScore !== null ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

            {/* Score Ring */}
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={latestScore} />
              <p className="text-xs font-bold text-slate-500 text-center max-w-[7rem]">
                {latestScore > 70 ? 'High Load' : latestScore > 45 ? 'Moderate' : 'Well-Regulated'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">

              <div className={`${trend.bg} border ${trend.border} p-4 rounded-2xl flex flex-col gap-1`}>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Trend Direction</span>
                <span className={`text-lg font-black ${trend.color}`}>{trend.label}</span>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{trend.desc}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">7-Day Baseline</span>
                {baseline !== null ? (
                  <>
                    <span className="text-2xl font-black text-slate-700">{baseline.toFixed(0)} <span className="text-sm font-medium text-slate-400">avg</span></span>
                    {stdDev !== null && <p className="text-xs text-slate-400 font-medium">Variation: ±{stdDev.toFixed(0)}</p>}
                  </>
                ) : (
                  <span className="text-sm text-slate-400 font-medium">Need more check-ins</span>
                )}
              </div>

              {isTriggered && (
                <div className="sm:col-span-2 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-sm font-black text-amber-700">Shift Detected</p>
                    <p className="text-xs text-amber-600 font-medium leading-relaxed">Today is significantly above your usual variation. Your nervous system is communicating something important.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">🌱</p>
            <p className="text-slate-400 font-medium">Complete your first assessment to generate insights.</p>
          </div>
        )}
      </motion.div>

      {/* Journey Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-xl shadow-indigo-500/5"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">7-Day Journey</h2>
          <span className="text-xs font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            {last7Days.length} data point{last7Days.length !== 1 ? 's' : ''}
          </span>
        </div>
        <JourneyChart last7Days={last7Days} isTriggered={isTriggered} />
      </motion.div>

      {/* Unified Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-xl shadow-indigo-500/5"
      >
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Activity Timeline</h2>

        {timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-300">
            <span className="text-5xl mb-3">🕰️</span>
            <p className="text-sm font-medium text-center">Your timeline is empty.<br/>Take an assessment or log a trigger to start.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical guide line */}
            <div className="absolute left-5 top-3 bottom-3 w-px bg-slate-100" />

            <div className="flex flex-col gap-4">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 pl-1"
                >
                  {/* Icon bubble */}
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 shadow-sm
                    ${item.type === 'assessment' ? 'bg-indigo-100 border-2 border-indigo-200' : 'bg-emerald-100 border-2 border-emerald-200'}`}>
                    {item.type === 'assessment' ? '📋' : '📝'}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 p-4 rounded-2xl border
                    ${item.type === 'assessment' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>

                    {item.type === 'assessment' ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-black text-slate-700 text-sm">Assessment Complete</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{formatDateLabel(item.date)}</p>
                        </div>
                        <div className={`text-xl font-black px-3 py-1 rounded-xl
                          ${item.score > 70 ? 'bg-rose-100 text-rose-600' : item.score > 45 ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {item.score}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-black text-slate-700 text-sm">{item.trigger}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{item.date}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg
                            ${item.intensity > 7 ? 'bg-rose-100 text-rose-600' : item.intensity > 4 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            Level {item.intensity}
                          </span>
                          <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">
                            {RELIEF_EMOJI[item.relief] || '✨'} {item.relief}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Privacy Footer */}
      <p className="text-center text-xs text-slate-400 font-medium pb-4">
        🔒 All data lives exclusively on this device. Nothing is ever uploaded.
      </p>
    </div>
  );
}
