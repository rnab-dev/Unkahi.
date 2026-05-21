/**
 * UnifiedDataPage.jsx — "Your Data" Hub
 * =========================================
 * Aggregates data from both assessments (basic + deep dive) and
 * shows a complete, detailed picture of the user's nervous system journey.
 * 100% local — no data ever uploaded.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, Bar } from 'react-chartjs-2';
import { useEmotionalBaseline } from './hooks/useEmotionalBaseline';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  RadialLinearScale,
  Legend,
  BarElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  LineElement, PointElement, LinearScale, CategoryScale,
  Filler, Tooltip, RadialLinearScale, Legend, BarElement
);

const DIMENSION_LABELS = [
  'Hypervigilance',
  'Boundary Collapse',
  'Intrusive Guilt',
  'Somatic Disconnect',
  'Relational Isolation',
  'Environment Control',
];

const INSIGHTS = {
  0: {
    title: 'Hypervigilance',
    icon: '👁️',
    color: '#E77A7A',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    desc: 'Your nervous system is on constant high alert, scanning for danger even in safe situations. This is a brilliant survival response — but it consumes immense energy and keeps you in chronic stress.',
    tip: 'Try the Blooming Lotus breathing tool. 4-7-8 breathing directly activates the parasympathetic nervous system and signals to your body that you are currently safe.',
    science: 'Linked to elevated cortisol and amygdala hyperactivity. Common in complex PTSD.',
  },
  1: {
    title: 'Boundary Collapse',
    icon: '🫂',
    color: '#D08770',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    desc: 'You may be over-accommodating others to keep the peace. When asserting your own needs felt risky in the past, blending in and pleasing others became a protective strategy — a form of fawning.',
    tip: 'Practice saying "I need a moment to think about it" before agreeing to new requests. This creates a pause between stimulus and response.',
    science: 'The "fawn" trauma response. Associated with the desire to appease perceived threats through compliance.',
  },
  2: {
    title: 'Intrusive Guilt',
    icon: '⚖️',
    color: '#A3BE8C',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    desc: 'You are carrying blame for things outside your control. The brain often creates guilt as a way to feel in control of uncontrollable pain — if it was your fault, then it could have been prevented.',
    tip: 'Use the "Let Go Box" to write down a specific blame story you are carrying, then release it. Externalising guilt helps loosen its grip.',
    science: 'Maladaptive guilt is a cognitive distortion common in abuse survivors. It is the mind\'s attempt to impose order on chaos.',
  },
  3: {
    title: 'Somatic Disconnect',
    icon: '🧊',
    color: '#B48EAD',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    desc: 'You might feel numb, floaty, or disconnected from your body. This is your nervous system\'s protective buffer — by dissociating from physical sensations, it reduces overwhelming pain.',
    tip: 'Use the Grounding Matrix (5-4-3-2-1). Physical sensory anchoring gently re-establishes the mind-body connection without forcing it.',
    science: 'Dissociation is a freeze response. The nervous system "checks out" when it cannot fight or flee.',
  },
  4: {
    title: 'Relational Isolation',
    icon: '🛡️',
    color: '#81A1C1',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    desc: 'You are pulling away from connection. When relationships have historically been a source of pain or unsafety, solitude feels like the most reliable shield. Isolation becomes a trauma response.',
    tip: 'You do not need to force connection. Start small — allow one person to witness one small authentic feeling. Safety is built incrementally.',
    science: 'Relational trauma creates a push-pull dynamic: yearning for connection but fearing it. A deeply human paradox.',
  },
  5: {
    title: 'Environment Control',
    icon: '🧩',
    color: '#7A9E9E',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    desc: 'You are trying to meticulously manage your surroundings. When internal experience felt chaotic or dangerous, controlling the external environment brought necessary predictability and a sense of safety.',
    tip: 'Allow one tiny, inconsequential thing to be "out of place" today and sit with the discomfort. Notice that you are still safe. This builds distress tolerance.',
    science: 'Hypercontrol is an anxiety management strategy. The underlying need is for predictability and safety — completely valid.',
  },
};

const TOOLS = [
  { id: 'breathe', name: 'Blooming Lotus', emoji: '🌸', color: 'from-pink-400 to-rose-400', desc: 'Vagus nerve reset with guided breath.' },
  { id: 'ground', name: 'Grounding Matrix', emoji: '🧱', color: 'from-indigo-400 to-blue-400', desc: 'Anchor back to the present moment.' },
  { id: 'letgo', name: 'Let Go Box', emoji: '💨', color: 'from-purple-400 to-violet-400', desc: 'Write, process and release.' },
  { id: 'emdr', name: 'Bilateral Audio', emoji: '🎧', color: 'from-indigo-500 to-blue-500', desc: 'Soothe the amygdala with EMDR audio.' },
  { id: 'somatic', name: 'Somatic Healer', emoji: '🧬', color: 'from-emerald-500 to-teal-500', desc: 'Polyvagal resets & muscle flushing.' },
  { id: 'mooddiary', name: 'Mood Diary', emoji: '📝', color: 'from-amber-400 to-orange-400', desc: 'Notice feelings without judgment.' },
  { id: 'psychoed', name: 'Nervous System Ed', emoji: '🧠', color: 'from-sky-400 to-blue-500', desc: 'Understand why your body reacts.' },
  { id: 'vault', name: 'Safe Vault', emoji: '✨', color: 'from-yellow-400 to-amber-500', desc: 'A safe place for good moments.' },
  { id: 'safetyplan', name: 'Safety Plan', emoji: '🛡️', color: 'from-slate-600 to-slate-800', desc: 'Your personal crisis support.' },
];

const TREND_CONFIG = {
  improving: { label: 'Improving ↓', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400', desc: 'Your nervous system is finding more regulation over time. This is meaningful progress.' },
  worsening: { label: 'Needs Attention ↑', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400', desc: 'Your load has been climbing. This is information, not a verdict. Be gentle.' },
  stable: { label: 'Stable →', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400', desc: 'Your nervous system is maintaining a consistent pattern.' },
};

const RELIEF_EMOJI = { breathe: '🌸', ground: '🧱', letgo: '💨', emdr: '🎧', somatic: '🧍', other: '✨' };

const formatDateLabel = (dateStr) => {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, label = 'Load', size = 112 }) {
  const radius = size * 0.36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 70 ? '#ef4444' : score > 45 ? '#818cf8' : '#34d399';
  const cx = size / 2;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={size * 0.09} />
        <circle cx={cx} cy={cx} r={radius} fill="none" stroke={color} strokeWidth={size * 0.09} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }} />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black text-slate-800">{score}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

// ─── Journey Chart ────────────────────────────────────────────────────────────
function JourneyChart({ last7Days, isTriggered }) {
  if (last7Days.length === 0) return (
    <div className="flex flex-col items-center justify-center h-48 text-slate-300">
      <span className="text-5xl mb-3">📊</span>
      <p className="text-sm font-medium">Complete your first assessment to see your journey.</p>
    </div>
  );
  const labels = last7Days.map(r => formatDateLabel(r.date));
  const scores = last7Days.map(r => r.score);
  const pointColors = scores.map((s, i) => i === scores.length - 1 && isTriggered ? '#f59e0b' : '#818cf8');
  const data = {
    labels,
    datasets: [{
      data: scores, fill: true, tension: 0.4, borderColor: '#818cf8', borderWidth: 2.5,
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(129, 140, 248, 0.25)');
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0)');
        return gradient;
      },
      pointBackgroundColor: pointColors, pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 8,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'inherit', size: 11, weight: '600' } } },
      y: { min: 0, max: 100, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { family: 'inherit', size: 11 }, stepSize: 25 } },
    },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#fff', titleColor: '#334155', bodyColor: '#64748b', borderColor: '#e2e8f0', borderWidth: 1, padding: 12, cornerRadius: 12, callbacks: { label: (ctx) => ` Nervous System Load: ${ctx.parsed.y}` } },
    },
  };
  return <div style={{ height: '200px' }}><Line data={data} options={options} /></div>;
}

// ─── Dimension Bar Chart ──────────────────────────────────────────────────────
function DimensionBars({ scores, label, maxVal }) {
  const max = maxVal || Math.max(8, ...scores);
  return (
    <div className="space-y-2.5">
      {scores.map((score, i) => {
        const pct = Math.min(100, (score / max) * 100);
        const ins = INSIGHTS[i];
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-base w-6 text-center">{ins.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-600">{ins.title}</span>
                <span className="text-xs font-black text-slate-500">{score}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${pct}%`, backgroundColor: ins.color }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Radar Chart ─────────────────────────────────────────────────────────────
function FootprintRadar({ scores, label = 'Emotional Footprint', colorRGB = '139, 92, 246' }) {
  const data = {
    labels: DIMENSION_LABELS,
    datasets: [{
      label,
      data: scores,
      backgroundColor: `rgba(${colorRGB}, 0.15)`,
      borderColor: `rgba(${colorRGB}, 0.8)`,
      borderWidth: 2.5,
      pointBackgroundColor: `rgba(${colorRGB}, 1)`,
      pointBorderColor: '#fff', pointRadius: 4,
    }],
  };
  const options = {
    scales: {
      r: {
        min: 0, max: Math.max(6, ...scores) + 2,
        ticks: { display: false },
        grid: { color: 'rgba(163, 177, 198, 0.2)' },
        angleLines: { color: 'rgba(163, 177, 198, 0.2)' },
        pointLabels: { color: '#81A1C1', font: { family: 'inherit', size: 11, weight: '800' } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#fff', titleColor: '#334155', bodyColor: '#64748b', borderColor: '#E2E8F0', borderWidth: 2, padding: 12, cornerRadius: 12, callbacks: { label: (ctx) => `Intensity: ${ctx.parsed.r}` } },
    },
  };
  return <Radar data={data} options={options} />;
}

// ─── Insight Card ─────────────────────────────────────────────────────────────
function InsightCard({ idx, rank, verified = false }) {
  const ins = INSIGHTS[idx];
  const [expanded, setExpanded] = useState(false);
  if (!ins) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.1 }}
      className={`${ins.bg} border ${ins.border} rounded-3xl p-6 flex flex-col`}
    >
      <div className="flex items-start gap-4 mb-4">
        <span className="text-3xl">{ins.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-black text-lg ${ins.text}`}>{ins.title}</h3>
            {rank === 0 && <span className="text-[10px] font-black uppercase tracking-widest bg-white/70 text-slate-600 px-2 py-0.5 rounded-full border border-white/50">Primary</span>}
            {verified && <span className="text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">✦ Cross-validated</span>}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5 italic">{ins.science}</p>
        </div>
      </div>

      <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4 flex-grow">{ins.desc}</p>

      <button
        onClick={() => setExpanded(!expanded)}
        className={`text-xs font-bold text-left transition-colors mb-3 ${ins.text} opacity-70 hover:opacity-100`}
      >
        {expanded ? '↑ Hide gentle tip' : '↓ Show gentle tip'}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/70 border border-white/50 rounded-2xl p-4"
        >
          <p className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-1.5">💚 Gentle Tip</p>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">{ins.tip}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UnifiedDataPage({ onNavigate, assessmentData }) {
  const { history, last7Days, isTriggered, trendDirection, baseline, stdDev, isLoading } = useEmotionalBaseline();
  const [logs, setLogs] = useState([]);
  const trend = TREND_CONFIG[trendDirection] || TREND_CONFIG.stable;

  useEffect(() => {
    const saved = localStorage.getItem('unkahi_resilience_logs');
    if (saved) { try { setLogs(JSON.parse(saved)); } catch (e) {} }
  }, []);

  const basicScores = assessmentData?.basicScores || [];
  const deepDiveScores = assessmentData?.deepDiveScores || [];
  const combinedScores = assessmentData?.combinedScores || [];
  const basicComplete = assessmentData?.basicComplete || false;
  const deepDiveComplete = assessmentData?.deepDiveComplete || false;

  const basicLoad = basicComplete
    ? Math.min(100, Math.round((basicScores.reduce((a, b) => a + b, 0) / 40) * 100))
    : null;
  const combinedLoad = deepDiveComplete
    ? Math.min(100, Math.round((combinedScores.reduce((a, b) => a + b, 0) / 80) * 100))
    : null;

  const latestHistory = history[history.length - 1];
  const displayScore = combinedLoad ?? basicLoad ?? latestHistory?.score ?? (last7Days.length > 0 ? last7Days[last7Days.length - 1].score : null);

  const getTopIndices = (scores) =>
    scores.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s).map(x => x.i);

  const topBasicIndices = basicComplete ? getTopIndices(basicScores) : [];
  const topCombinedIndices = deepDiveComplete ? getTopIndices(combinedScores) : topBasicIndices;
  const primaryIndices = topCombinedIndices.slice(0, 2);

  const assessmentEntries = history.map(h => ({ id: `a-${h.date}-${h.score}`, type: 'assessment', date: h.date, score: h.score }));
  const logEntries = logs.map(l => ({ id: `l-${l.id}`, type: 'log', date: l.date, trigger: l.trigger, intensity: l.intensity, relief: l.relief }));
  const timeline = [...assessmentEntries, ...logEntries].sort((a, b) => b.id.localeCompare(a.id));

  const hasAnyData = basicComplete || deepDiveComplete || displayScore !== null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 font-sans">

      {/* ── Header ────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <button onClick={() => onNavigate('welcome')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest text-xs transition-colors">
          ← Home
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Your Data</h1>
          <p className="text-xs text-slate-400 font-medium">100% local · never uploaded</p>
        </div>
      </motion.div>

      {/* ── Assessment Status Cards ──────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`rounded-3xl p-5 border flex items-start gap-4 ${basicComplete ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-3xl mt-0.5">{basicComplete ? '✅' : '📋'}</span>
          <div className="flex-1">
            <p className={`font-black text-sm ${basicComplete ? 'text-teal-700' : 'text-slate-500'}`}>Basic Assessment</p>
            {basicComplete ? (
              <>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Nervous System Load: <span className="font-black text-teal-700">{basicLoad}%</span></p>
                <p className="text-xs text-slate-400 mt-1">Primary: {topBasicIndices.slice(0, 2).map(i => INSIGHTS[i]?.title).join(' · ')}</p>
              </>
            ) : (
              <p className="text-xs text-slate-400 font-medium mt-0.5">Not yet completed</p>
            )}
          </div>
          {!basicComplete && (
            <button onClick={() => onNavigate('assessment')} className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all">
              Start →
            </button>
          )}
        </div>

        <div className={`rounded-3xl p-5 border flex items-start gap-4 ${deepDiveComplete ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-3xl mt-0.5">{deepDiveComplete ? '🔬' : '🌊'}</span>
          <div className="flex-1">
            <p className={`font-black text-sm ${deepDiveComplete ? 'text-purple-700' : 'text-slate-500'}`}>Deep Dive Assessment</p>
            {deepDiveComplete ? (
              <>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Combined Load: <span className="font-black text-purple-700">{combinedLoad}%</span></p>
                <p className="text-xs text-slate-400 mt-1">Cross-validated: {topCombinedIndices.slice(0, 2).map(i => INSIGHTS[i]?.title).join(' · ')}</p>
              </>
            ) : (
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {basicComplete ? 'Take the Deep Dive for a richer picture' : 'Complete Basic Assessment first'}
              </p>
            )}
          </div>
          {basicComplete && !deepDiveComplete && (
            <button onClick={() => onNavigate('assessment')} className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all">
              Dive →
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Current State Ring + Baseline ─────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-xl shadow-indigo-500/5">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Nervous System State</h2>

        {isLoading ? (
          <p className="text-slate-300 text-sm animate-pulse">Reading local data…</p>
        ) : displayScore !== null ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="flex flex-col items-center gap-3">
              <ScoreRing score={displayScore} />
              <p className="text-xs font-bold text-slate-500 text-center max-w-[7rem]">
                {displayScore > 70 ? '🔴 High Load' : displayScore > 45 ? '🟡 Moderate' : '🟢 Well-Regulated'}
              </p>
              {deepDiveComplete && combinedLoad !== null && (
                <div className="flex gap-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-medium">Basic</p>
                    <p className="text-lg font-black text-slate-600">{basicLoad}%</p>
                  </div>
                  <div className="w-px bg-slate-200" />
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-medium">Combined</p>
                    <p className="text-lg font-black text-purple-600">{combinedLoad}%</p>
                  </div>
                </div>
              )}
            </div>

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
                    {stdDev !== null && <p className="text-xs text-slate-400 font-medium">Variation: ±{stdDev.toFixed(0)} — {stdDev < 10 ? 'very consistent' : stdDev < 20 ? 'moderate variation' : 'high variation'}</p>}
                  </>
                ) : (
                  <span className="text-sm text-slate-400 font-medium">Need 2+ check-ins to compute</span>
                )}
              </div>

              {isTriggered && (
                <div className="sm:col-span-2 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-sm font-black text-amber-700">Significant Shift Detected</p>
                    <p className="text-xs text-amber-600 font-medium leading-relaxed">Today's load is more than 1.5× your usual variation. Your nervous system is communicating something important. This is not a crisis — it is information.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">🌱</p>
            <p className="text-slate-400 font-medium mb-4">Complete your first assessment to generate insights.</p>
            <button onClick={() => onNavigate('assessment')} className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:-translate-y-1 transition-all shadow-md">
              Take First Assessment →
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Emotional Footprint + Dimension Breakdown ────────────── */}
      {(basicComplete || deepDiveComplete) && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-xl shadow-indigo-500/5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {deepDiveComplete ? 'Cross-Validated Emotional Footprint' : 'Emotional Footprint'}
            </h2>
            {deepDiveComplete && (
              <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">🔬 Both assessments</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Radar */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
                {deepDiveComplete ? 'Combined Footprint' : 'Basic Footprint'}
              </p>
              <div className="w-full max-w-[260px] mx-auto">
                <FootprintRadar
                  scores={deepDiveComplete ? combinedScores : basicScores}
                  label={deepDiveComplete ? 'Cross-Validated' : 'Basic'}
                  colorRGB={deepDiveComplete ? '139, 92, 246' : '99, 179, 179'}
                />
              </div>
              {deepDiveComplete && basicComplete && (
                <p className="text-xs text-center text-purple-500 font-bold mt-3">
                  ✦ Two different lenses, same signal — high confidence reading
                </p>
              )}
            </div>

            {/* Dimension Bars */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dimension Intensity</p>
              <DimensionBars
                scores={deepDiveComplete ? combinedScores : basicScores}
                label={deepDiveComplete ? 'Combined' : 'Basic'}
                maxVal={deepDiveComplete ? 16 : 8}
              />

              {/* Compare basic vs combined if both done */}
              {deepDiveComplete && basicComplete && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Basic vs Deep Dive Δ</p>
                  <div className="space-y-1.5">
                    {basicScores.map((bScore, i) => {
                      const cScore = combinedScores[i] || 0;
                      const deepScore = cScore - bScore;
                      const isSame = Math.abs(deepScore - bScore) < 1.5;
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span>{INSIGHTS[i]?.icon}</span>
                          <span className="text-slate-500 font-medium flex-1">{INSIGHTS[i]?.title}</span>
                          <span className="font-bold text-slate-600">{bScore}</span>
                          <span className="text-slate-300">→</span>
                          <span className={`font-black ${deepScore > bScore ? 'text-amber-600' : deepScore < bScore ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {deepScore}
                          </span>
                          {isSame && <span className="text-purple-500 font-bold text-[10px]">✦ confirmed</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Primary Anchors — Detailed ───────────────────────────── */}
      {primaryIndices.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            {deepDiveComplete ? 'Cross-Validated Primary Anchors' : 'Your Primary Anchors'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primaryIndices.map((idx, rank) => (
              <InsightCard key={idx} idx={idx} rank={rank} verified={deepDiveComplete} />
            ))}
          </div>

          {/* Secondary anchors (collapsed) */}
          {topCombinedIndices.length > 2 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Other Active Dimensions</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {topCombinedIndices.slice(2, 6).map(idx => {
                  const ins = INSIGHTS[idx];
                  const score = (deepDiveComplete ? combinedScores : basicScores)[idx] || 0;
                  if (score === 0) return null;
                  return (
                    <div key={idx} className={`${ins.bg} border ${ins.border} rounded-2xl p-3 flex items-center gap-2`}>
                      <span className="text-lg">{ins.icon}</span>
                      <div>
                        <p className={`text-xs font-black ${ins.text}`}>{ins.title}</p>
                        <p className="text-xs text-slate-400 font-medium">Score: {score}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── 7-Day Journey Chart ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-xl shadow-indigo-500/5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">7-Day Journey</h2>
          <div className="flex items-center gap-2">
            {isTriggered && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              {last7Days.length} check-in{last7Days.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <JourneyChart last7Days={last7Days} isTriggered={isTriggered} />
        {last7Days.length > 1 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-2xl p-3 text-center">
              <p className="text-xs text-slate-400 font-medium">Peak Load</p>
              <p className="text-lg font-black text-slate-700">{Math.max(...last7Days.map(d => d.score))}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 text-center">
              <p className="text-xs text-slate-400 font-medium">Lowest</p>
              <p className="text-lg font-black text-slate-700">{Math.min(...last7Days.map(d => d.score))}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 text-center">
              <p className="text-xs text-slate-400 font-medium">Range</p>
              <p className="text-lg font-black text-slate-700">{Math.max(...last7Days.map(d => d.score)) - Math.min(...last7Days.map(d => d.score))}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Activity Timeline ────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-xl shadow-indigo-500/5">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Activity Timeline</h2>
        {timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-300">
            <span className="text-5xl mb-3">🕰️</span>
            <p className="text-sm font-medium text-center">Your timeline is empty.<br />Take an assessment or log a trigger to start.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-3 bottom-3 w-px bg-slate-100" />
            <div className="flex flex-col gap-4">
              {timeline.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-4 pl-1">
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 shadow-sm ${item.type === 'assessment' ? 'bg-indigo-100 border-2 border-indigo-200' : 'bg-emerald-100 border-2 border-emerald-200'}`}>
                    {item.type === 'assessment' ? '📋' : '📝'}
                  </div>
                  <div className={`flex-1 p-4 rounded-2xl border ${item.type === 'assessment' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                    {item.type === 'assessment' ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-black text-slate-700 text-sm">Assessment Complete</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{formatDateLabel(item.date)}</p>
                        </div>
                        <div className={`text-xl font-black px-3 py-1 rounded-xl ${item.score > 70 ? 'bg-rose-100 text-rose-600' : item.score > 45 ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {item.score}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-black text-slate-700 text-sm">{item.trigger}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{item.date}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${item.intensity > 7 ? 'bg-rose-100 text-rose-600' : item.intensity > 4 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
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

      {/* ── Quick-Launch Healing Tools ───────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-xl shadow-indigo-500/5">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Healing Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TOOLS.map(tool => (
            <button key={tool.id} onClick={() => onNavigate(tool.id)}
              className={`bg-gradient-to-br ${tool.color} p-4 rounded-2xl text-left hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
              <span className="text-2xl block mb-2">{tool.emoji}</span>
              <p className="text-white font-black text-xs">{tool.name}</p>
              <p className="text-white/70 text-[10px] font-medium mt-0.5 leading-snug">{tool.desc}</p>
            </button>
          ))}
        </div>

        {!basicComplete && (
          <div className="mt-4 bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-teal-700">Take an assessment first</p>
              <p className="text-xs text-teal-600 font-medium">We'll personalise which tool is best for your current state.</p>
            </div>
            <button onClick={() => onNavigate('assessment')} className="ml-auto shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors">
              Start →
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Take Assessment CTA (if none done) ──────────────────── */}
      {!hasAnyData && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.32 }}
          className="bg-gradient-to-br from-teal-50 to-indigo-50 border border-teal-200 rounded-3xl p-8 text-center">
          <p className="text-5xl mb-4">🌱</p>
          <h3 className="text-xl font-black text-slate-700 mb-2">Your data story starts here</h3>
          <p className="text-slate-500 font-medium mb-6 max-w-sm mx-auto text-sm leading-relaxed">
            Take your first assessment to generate a detailed psychological footprint. Each check-in adds a new data point to your journey.
          </p>
          <button onClick={() => onNavigate('assessment')} className="bg-teal-600 text-white px-8 py-4 rounded-full font-black text-lg shadow-md hover:shadow-[0_0_20px_rgba(13,148,136,0.4)] hover:-translate-y-1 transition-all">
            Take First Assessment →
          </button>
        </motion.div>
      )}

      {/* ── Privacy Footer ───────────────────────────────────────── */}
      <p className="text-center text-xs text-slate-400 font-medium pb-4">
        🔒 All data lives exclusively on this device. Nothing is ever uploaded or shared.
      </p>
    </div>
  );
}
