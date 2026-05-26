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

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

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

  const [hasSynced, setHasSynced] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'ok' | 'fail'
  const syncCalledRef = useRef(false);
  const latestScore = assessmentScores.length > 0
    ? Math.min(100, Math.round(
      (assessmentScores.reduce((a, b) => a + b, 0) / 40) * 100
    ))
    : (last7Days.length > 0 ? last7Days[last7Days.length - 1].score : 50);
  // Assessment.jsx already calls saveScore() + logAssessmentComplete() before
  // navigating here. Dashboard only reads the result — no double-write.
  useEffect(() => {
    if (assessmentScores.length === 0 || syncCalledRef.current) return;
    syncCalledRef.current = true;
    setSyncStatus('ok');
    setHasSynced(true);
  }, [assessmentScores]);
  const recommendedToolId = getRecommendedTool(isTriggered, trendDirection, latestScore);
  const recommendedTool = TOOLS.find(t => t.id === recommendedToolId);
  const trendCfg = TREND_CONFIG[trendDirection] || TREND_CONFIG.stable;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 font-sans">
      <CheckInBanner daysSince={daysSinceLastCheckIn} onNavigate={onNavigate} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Journey Chart Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-700">Your Journey & Insights</h2>
              <p className="text-xs text-slate-400 font-medium">View your full analytics history</p>
            </div>
            {/* Trend direction badge */}
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${trendCfg.bg} ${trendCfg.border} ${trendCfg.color}`}>
              {trendCfg.label}
            </span>
          </div>

          <div className="flex-grow flex items-center justify-center my-4">
            <button
              onClick={() => onNavigate('analytics')}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all border border-indigo-100 shadow-sm"
            >
              <span>📊</span> View Detailed Insights
            </button>
          </div>

          {/* Trend interpretation */}
          <p className="text-xs text-slate-400 font-medium mt-auto italic text-center">
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
        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
          <span className="text-xl">💡</span>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            <strong>Did you know?</strong> Your nervous system's primary job is keeping you alive, not making you happy. When you feel overwhelmed, it's just your body's alarm system working exactly as designed. Healing is learning to gently turn off the false alarms.
          </p>
        </div>
      </div>
      <div className="mb-10">
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
          Education & Empowerment
        </h2>
        <button
          onClick={() => onNavigate('legal')}
          className="w-full text-left bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">⚖️</span>
            <div>
              <p className="text-white font-black text-lg">Know Your Rights (India)</p>
              <p className="text-blue-100 text-xs font-medium mt-1">Interactive legal scenarios: Know the law, and don't misuse it.</p>
            </div>
          </div>
          <span className="text-white/60 group-hover:text-white text-2xl font-black transition-all group-hover:translate-x-1">→</span>
        </button>
      </div>
      <div className="mb-10">
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
          Advanced Healing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('bodymap')}
            className="w-full text-left bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🧍</span>
              <div>
                <p className="text-white font-black text-lg">Interactive Body Map</p>
                <p className="text-indigo-100 text-xs font-medium mt-1">Tap where you feel it.</p>
              </div>
            </div>
            <span className="text-white/60 group-hover:text-white text-2xl font-black transition-all group-hover:translate-x-1">→</span>
          </button>

          <button
            onClick={() => onNavigate('tracker')}
            className="w-full text-left bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📈</span>
              <div>
                <p className="text-white font-black text-lg">Resilience Tracker</p>
                <p className="text-emerald-100 text-xs font-medium mt-1">Track triggers and relief secretly.</p>
              </div>
            </div>
            <span className="text-white/60 group-hover:text-white text-2xl font-black transition-all group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
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
      <div className="mt-8">
        <button
          onClick={() => onNavigate('support')}
          className="w-full text-left bg-white/70 backdrop-blur-xl border border-rose-100 p-6 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🚨</span>
            <div>
              <p className="text-slate-800 font-black text-lg">Crisis Support & Helplines</p>
              <p className="text-slate-500 text-xs font-medium">Access verified professional resources in India (24/7)</p>
            </div>
          </div>
          <span className="text-slate-400 group-hover:text-rose-500 text-2xl font-black transition-all group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>

    </div>
  );
}
