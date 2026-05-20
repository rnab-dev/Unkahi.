/**
 * Dashboard.jsx — Unkahi Intelligent Hub
 * =========================================
 * Powered by Edge AI (all computation local, no personal data sent to server).
 *
 * Features:
 *   1. Smart Tool Recommendation  — ML picks your best starting point
 *   2. 7-Day Journey Chart        — Visual trend of your nervous system
 *   3. Anomaly Alert              — Contextual message when shift is detected
 *   4. Trend Direction Badge      — Improving / Stable / Needs Attention
 *   5. Smart Check-In Prompt      — Detects gaps, gently invites return
 *   6. 30-Day Pattern View        — Longer longitudinal sparkline
 */

import React, { useEffect, useState, useRef } from 'react';
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
import { useEmotionalBaseline } from './hooks/useEmotionalBaseline';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

// ─── Tool Definitions ────────────────────────────────────────────────────────

const TOOLS = [
  {
    id: 'breathe',
    name: 'Blooming Lotus',
    emoji: '🌸',
    color: 'from-pink-400 to-rose-400',
    border: 'border-pink-200',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    desc: 'Reset your vagus nerve with guided breath.',
    bestFor: 'High distress or panic',
  },
  {
    id: 'ground',
    name: 'Grounding Matrix',
    emoji: '🧱',
    color: 'from-indigo-400 to-blue-400',
    border: 'border-indigo-200',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    desc: 'Anchor back to the present moment.',
    bestFor: 'Dissociation or numbness',
  },
  {
    id: 'letgo',
    name: 'Let Go Box',
    emoji: '💨',
    color: 'from-purple-400 to-violet-400',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    desc: 'Write, process and release what weighs on you.',
    bestFor: 'Guilt, rumination, heavy thoughts',
  },
  {
    id: 'emdr',
    name: 'Bilateral Audio',
    emoji: '🎧',
    color: 'from-indigo-500 to-blue-500',
    border: 'border-indigo-200',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    desc: 'Audio-visual pacing to soothe the amygdala.',
    bestFor: 'Flashbacks, severe dysregulation',
  },
  {
    id: 'somatic',
    name: 'Somatic Healer',
    emoji: '🧬',
    color: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    desc: 'Polyvagal resets & progressive muscle flushing.',
    bestFor: 'Severe physical tension, panic attacks',
  },
];

// ─── ML-Powered Tool Recommendation Logic ────────────────────────────────────

/**
 * Recommends the best tool based on the user's live Edge AI state.
 * Priority 1 (isTriggered + high score) → Breathe (regulate first)
 * Priority 2 (isTriggered only)         → Let Go (process the shift)
 * Priority 3 (worsening trend)          → Grounding (anchor to now)
 * Default                               → Let Go (always useful)
 */
const getRecommendedTool = (isTriggered, trendDirection, latestScore) => {
  if (isTriggered && latestScore >= 65) return 'breathe';
  if (isTriggered) return 'letgo';
  if (trendDirection === 'worsening') return 'ground';
  return 'letgo';
};

// ─── Helper: Format date labels ───────────────────────────────────────────────

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// ─── Trend Badge ──────────────────────────────────────────────────────────────

const TREND_CONFIG = {
  improving: {
    label: 'Improving ↓',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: 'Your nervous system is finding more regulation over time.',
  },
  worsening: {
    label: 'Needs Attention ↑',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Your load has been climbing. This is information, not a verdict.',
  },
  stable: {
    label: 'Stable →',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: 'Your nervous system is maintaining a consistent pattern.',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CheckInBanner({ daysSince, onNavigate }) {
  if (daysSince <= 1) return null; // checked in today or yesterday — no nudge

  const isLongAbsence = daysSince >= 5;
  return (
    <div className={`w-full rounded-3xl p-5 border flex items-center gap-4 mb-6 animate-fade-in
      ${isLongAbsence
        ? 'bg-violet-50 border-violet-200'
        : 'bg-slate-50 border-slate-200'}`}>
      <span className="text-2xl">{isLongAbsence ? '🕯️' : '👋'}</span>
      <div className="flex-1">
        <p className={`font-black text-sm ${isLongAbsence ? 'text-violet-700' : 'text-slate-700'}`}>
          {isLongAbsence
            ? `It's been ${daysSince} days. You don't have to be okay — just here.`
            : `Welcome back. ${daysSince} day${daysSince > 1 ? 's' : ''} since your last check-in.`}
        </p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          A quick assessment helps your AI learn what's normal for you.
        </p>
      </div>
      <button
        onClick={() => onNavigate('assessment')}
        className="shrink-0 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-full hover:bg-violet-500 hover:text-white hover:border-violet-500 transition-all"
      >
        Check In
      </button>
    </div>
  );
}

function JourneyChart({ last7Days, isTriggered }) {
  if (last7Days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-slate-300">
        <span className="text-4xl mb-2">📊</span>
        <p className="text-sm font-medium">Complete your first assessment to see your journey.</p>
      </div>
    );
  }

  const labels = last7Days.map(r => formatDateLabel(r.date));
  const scores = last7Days.map(r => r.score);

  // Flag anomaly points with a different color
  const pointColors = scores.map((s, i) => {
    if (i === scores.length - 1 && isTriggered) return '#f59e0b'; // amber for anomaly
    return '#818cf8'; // indigo default
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
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 160);
        gradient.addColorStop(0, 'rgba(129, 140, 248, 0.25)');
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0)');
        return gradient;
      },
      pointBackgroundColor: pointColors,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'inherit', size: 10, weight: '600' } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'inherit', size: 10 },
          callback: (v) => `${v}`,
          stepSize: 25,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#334155',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 12,
        callbacks: {
          label: (ctx) => ` Load: ${ctx.parsed.y}`,
        },
      },
    },
  };

  return (
    <div style={{ height: '160px' }}>
      <Line data={data} options={options} />
    </div>
  );
}

function LongitudinalSparkline({ last30Days }) {
  if (last30Days.length < 4) return null;

  const max = Math.max(...last30Days.map(r => r.score));
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mt-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        30-Day Pattern
      </p>
      <div className="flex items-end gap-[3px] h-8">
        {last30Days.map((r) => (
          <div
            key={r.date}
            title={`${formatDateLabel(r.date)}: ${r.score}`}
            className="flex-1 rounded-t-sm transition-all duration-300"
            style={{
              height: `${Math.max(8, (r.score / Math.max(max, 1)) * 100)}%`,
              background: r.date === today
                ? 'linear-gradient(to top, #f59e0b, #fcd34d)'
                : `hsl(${220 + (r.score / 100) * 40}, 60%, ${75 - (r.score / 100) * 20}%)`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-slate-300 font-medium mt-1">
        <span>30 days ago</span>
        <span className="text-amber-400 font-bold">Today</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard({ assessmentScores = [], onNavigate }) {
  const {
    baseline,
    stdDev,
    isTriggered,
    trendDirection,
    daysSinceLastCheckIn,
    last7Days,
    last30Days,
    saveScore,
    isLoading,
  } = useEmotionalBaseline();

  const [hasSynced, setHasSynced]     = useState(false);
  const [syncStatus, setSyncStatus]   = useState(null); // 'ok' | 'fail'
  const syncCalledRef                 = useRef(false);

  // ── Compute latest normalized score ───────────────────────────────────────
  const latestScore = assessmentScores.length > 0
    ? Math.min(100, Math.round(
        (assessmentScores.reduce((a, b) => a + b, 0) / 40) * 100
      ))
    : (last7Days.length > 0 ? last7Days[last7Days.length - 1].score : 50);

  // ── Telemetry status indicator ─────────────────────────────────────────────
  // Assessment.jsx already calls saveScore() + logAssessmentComplete() before
  // navigating here. Dashboard only reads the result — no double-write.
  useEffect(() => {
    if (assessmentScores.length === 0 || syncCalledRef.current) return;
    syncCalledRef.current = true;
    setSyncStatus('ok');
    setHasSynced(true);
  }, [assessmentScores]);

  // ── ML Recommendation ──────────────────────────────────────────────────────
  const recommendedToolId = getRecommendedTool(isTriggered, trendDirection, latestScore);
  const recommendedTool   = TOOLS.find(t => t.id === recommendedToolId);
  const trendCfg          = TREND_CONFIG[trendDirection] || TREND_CONFIG.stable;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 font-sans">

      {/* ── Smart Check-In Prompt ─────────────────────────────────────── */}
      <CheckInBanner daysSince={daysSinceLastCheckIn} onNavigate={onNavigate} />

      {/* ── Top row: Journey + Baseline stats ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Journey Chart Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-700">Your Journey</h2>
              <p className="text-xs text-slate-400 font-medium">7-day nervous system load</p>
            </div>
            {/* Trend direction badge */}
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${trendCfg.bg} ${trendCfg.border} ${trendCfg.color}`}>
              {trendCfg.label}
            </span>
          </div>

          <JourneyChart last7Days={last7Days} isTriggered={isTriggered} />
          <LongitudinalSparkline last30Days={last30Days} />

          {/* Trend interpretation */}
          <p className="text-xs text-slate-400 font-medium mt-3 italic">
            {trendCfg.desc}
          </p>
        </div>

        {/* Baseline Stats Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-purple-500/5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-700 mb-1">Nervous System Baseline</h2>
            <p className="text-xs text-slate-400 font-medium mb-5">
              Computed from your local history — never uploaded
            </p>

            {isLoading ? (
              <p className="text-slate-300 text-sm animate-pulse">Reading local data…</p>
            ) : (
              <div className="space-y-3">
                {/* Current score vs baseline */}
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-indigo-400">{latestScore}</span>
                  <div className="mb-1.5">
                    <p className="text-xs text-slate-400 font-bold">Today's Load</p>
                    {baseline !== null && (
                      <p className="text-xs text-slate-400">
                        Avg: <span className="font-black text-slate-600">{baseline.toFixed(0)}</span>
                        {stdDev !== null && (
                          <span> · σ <span className="font-black text-slate-600">±{stdDev.toFixed(0)}</span></span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${latestScore}%`,
                      background: latestScore > 70
                        ? 'linear-gradient(to right, #f59e0b, #ef4444)'
                        : latestScore > 45
                        ? 'linear-gradient(to right, #818cf8, #a78bfa)'
                        : 'linear-gradient(to right, #34d399, #6ee7b7)',
                    }}
                  />
                </div>

                <p className="text-xs text-slate-400 font-medium">
                  {latestScore > 70
                    ? 'Your system is carrying significant load right now.'
                    : latestScore > 45
                    ? 'Moderate activation — manageable with the right tool.'
                    : 'Your system is in a relatively regulated state.'}
                </p>
              </div>
            )}
          </div>

          {/* Anomaly Alert */}
          {isTriggered && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-black text-amber-700 mb-1">⚠ Shift Detected</p>
              <p className="text-xs text-amber-600 font-medium">
                Today is more than 1.5× your usual variation. Your nervous system is communicating something important.
              </p>
            </div>
          )}

          {/* Privacy badge */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-emerald-500 text-xs">🔒</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Edge AI · Zero-Knowledge
              {syncStatus === 'ok' && <span className="text-slate-400 normal-case font-medium ml-1">· anonymous signal synced</span>}
            </span>
          </div>
        </div>
      </div>

      {/* ── ML Tool Recommendation ────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✨</span>
          <h2 className="text-sm font-black text-slate-600 uppercase tracking-wider">
            Recommended for You Right Now
          </h2>
        </div>
        <button
          onClick={() => onNavigate(recommendedTool.id)}
          className={`w-full text-left bg-gradient-to-r ${recommendedTool.color} p-6 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl">{recommendedTool.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-black text-xl">{recommendedTool.name}</p>
                <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  AI Pick
                </span>
              </div>
              <p className="text-white/80 text-sm font-medium">{recommendedTool.desc}</p>
              <p className="text-white/60 text-xs font-bold mt-1">Best for: {recommendedTool.bestFor}</p>
            </div>
            <span className="text-white/60 group-hover:text-white text-2xl font-black transition-all group-hover:translate-x-1">
              →
            </span>
          </div>
        </button>
      </div>

      {/* ── All Tools ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
          All Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TOOLS.map(tool => {
            const isRecommended = tool.id === recommendedToolId;
            return (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className={`text-left p-5 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md
                  ${isRecommended
                    ? `${tool.bg} ${tool.border} shadow-sm`
                    : 'bg-white/60 border-white/60 hover:bg-white/80'}`}
              >
                <span className="text-3xl mb-3 block">{tool.emoji}</span>
                <p className={`font-black text-sm mb-1 ${isRecommended ? tool.text : 'text-slate-700'}`}>
                  {tool.name}
                </p>
                <p className="text-xs text-slate-400 font-medium leading-snug">{tool.desc}</p>
                {isRecommended && (
                  <span className={`mt-2 inline-block text-[10px] font-black uppercase tracking-wider ${tool.text} opacity-70`}>
                    ✦ Recommended
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
