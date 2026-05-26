import React, { useState, useEffect } from 'react';
import { Radar, Bar } from 'react-chartjs-2';
import { STORY_PHASES, DEEP_DIVE_PHASES } from './AssessmentData';
import { supabase } from './supabaseClient';
import { useEmotionalBaseline } from './hooks/useEmotionalBaseline';
import { logAssessmentComplete, getGeoIPDetails } from './utils/supabaseTelemetry';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const INSIGHTS = {
  0: { title: 'Hypervigilance', icon: '👁️', desc: 'Your nervous system is on high alert, constantly scanning for danger. This is a brilliant survival mechanism to keep you safe, but it consumes immense energy.', tip: 'Try the Breathing Room tool to signal to your body that you are currently safe.' },
  1: { title: 'Boundary Collapse', icon: '🫂', desc: 'You may be over-accommodating others to keep the peace. When asserting needs felt risky in the past, blending in became a protective strategy.', tip: 'Practice saying "I need a moment to think about it" before agreeing to new requests.' },
  2: { title: 'Intrusive Guilt', icon: '⚖️', desc: 'You are carrying blame for things outside your control. Our brains often create guilt as a way to feel in control of uncontrollable pain.', tip: 'Use the "Let Go Box" to physically release a blame story you are holding.' },
  3: { title: 'Somatic Disconnect', icon: '🧊', desc: 'You might feel numb, floaty, or disconnected from your body. This is your nervous system providing a protective buffer against overwhelming sensations.', tip: 'Use the Grounding Matrix to gently anchor yourself back to the present.' },
  4: { title: 'Relational Isolation', icon: '🛡️', desc: 'You are pulling away from connection. When relationships have historically been a source of unsafety, solitude feels like the most reliable shield.', tip: 'You do not need to force connection. Focus on feeling safe in your own presence first.' },
  5: { title: 'Environment Control', icon: '🧩', desc: 'You are trying to meticulously manage your surroundings. This micromanagement brings a necessary sense of predictability amidst chaos.', tip: 'Allow one tiny, inconsequential thing to be "out of place" today and notice that you are still safe.' }
};

const TOOLS = [
  { id: 'breathe', name: 'Blooming Lotus', emoji: '🌸', color: 'from-pink-400 to-rose-400', desc: 'Vagus nerve reset with guided breath.' },
  { id: 'ground', name: 'Grounding Matrix', emoji: '🧱', color: 'from-indigo-400 to-blue-400', desc: 'Anchor back to the present moment.' },
  { id: 'letgo', name: 'Let Go Box', emoji: '💨', color: 'from-purple-400 to-violet-400', desc: 'Write, process and release what weighs on you.' },
  { id: 'emdr', name: 'Bilateral Audio', emoji: '🎧', color: 'from-indigo-500 to-blue-500', desc: 'Audio-visual pacing to soothe the amygdala.' },
  { id: 'somatic', name: 'Somatic Healer', emoji: '🧬', color: 'from-emerald-500 to-teal-500', desc: 'Polyvagal resets & progressive muscle flushing.' },
];

export default function Assessment({ onComplete, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedSomatic, setHasCompletedSomatic] = useState(false);
  const [selectedSomatic, setSelectedSomatic] = useState([]);
  const [scores, setScores] = useState([0, 0, 0, 0, 0, 0]);
  const [responses, setResponses] = useState([]);
  const [isFading, setIsFading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loadPercentage, setLoadPercentage] = useState(0);
  const [resonance, setResonance] = useState(null);
  const [surveyId, setSurveyId] = useState(null); // Holds the Supabase row ID for resonance update
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [deepDiveState, setDeepDiveState] = useState('idle'); // 'idle' | 'warning' | 'active' | 'done'
  const [deepDiveStep, setDeepDiveStep] = useState(0);
  const [deepDiveScores, setDeepDiveScores] = useState([0, 0, 0, 0, 0, 0]);
  const [deepDiveResponses, setDeepDiveResponses] = useState([]);

  const SOMATIC_OPTIONS = [
    { id: 'chest', label: 'Tight Chest / Heart Racing', icon: '🫀', weights: [3, 0, 0, 0, 0, 0] }, // Hypervigilance
    { id: 'numb', label: 'Numb / Floaty / Disconnected', icon: '🧊', weights: [0, 0, 0, 4, 0, 0] }, // Somatic Disconnect
    { id: 'stomach', label: 'Heavy Stomach / Nausea', icon: '🦋', weights: [0, 0, 3, 0, 0, 0] }, // Guilt
    { id: 'jaw', label: 'Clenched Jaw / Shoulders', icon: '⚡', weights: [1, 0, 0, 0, 0, 2] }, // Env Control
    { id: 'eyes', label: 'Averting Eyes / Hiding', icon: '🙈', weights: [0, 2, 0, 0, 2, 0] }, // Collapse / Isolation
    { id: 'fidget', label: 'Pacing / Can\'t Sit Still', icon: '🌪️', weights: [2, 0, 0, 0, 0, 1] }
  ];

  const handleSomaticSubmit = () => {
    setIsFading(true);

    // Apply selected weights
    let newScores = [...scores];
    selectedSomatic.forEach(id => {
      const opt = SOMATIC_OPTIONS.find(o => o.id === id);
      if (opt) {
        newScores = newScores.map((s, idx) => s + opt.weights[idx]);
      }
    });
    setScores(newScores);

    setTimeout(() => {
      setHasCompletedSomatic(true);
      setIsFading(false);
    }, 400);
  };
  // The hook reads from IndexedDB on mount and exposes saveScore() + baseline data.
  // All raw score history stays local — only abstract telemetry goes to Supabase.
  const { saveScore, isTriggered, baseline, stdDev } = useEmotionalBaseline();

  const handleOptionSelect = (weights, optionIndex, optionText) => {
    setIsFading(true);
    setScores(prev => prev.map((score, idx) => score + weights[idx]));
    setResponses(prev => [...prev, { step: currentStep + 1, option_selected: optionIndex, answer_text: optionText }]);

    setTimeout(async () => {
      if (currentStep < STORY_PHASES.length - 1) {
        setCurrentStep(prev => prev + 1);
        setIsFading(false);
      } else {
        setIsFinished(true);
        setIsFading(false);
        const finalScores = scores.map((score, idx) => score + weights[idx]);
        const finalResponses = [...responses, { step: currentStep + 1, option_selected: optionIndex, answer_text: optionText }];
        onComplete && onComplete(finalScores, null, 'basic');
        const assumedMax = 60; // Increased to yield a lower, less alarming score
        const normalizedScore = Math.min(100, Math.round(
          (finalScores.reduce((a, b) => a + b, 0) / assumedMax) * 100
        ));

        await saveScore(normalizedScore);
        logAssessmentComplete({ isTriggered, baseline, stdDev })
          .then(({ success, error: telErr }) => {
            if (success) {
              console.log('[Unkahi] ✅ Anonymous telemetry synced to Supabase.');
            } else {
              console.warn('[Unkahi] Telemetry sync failed (non-critical):', telErr);
            }
          });
        try {
          const geo = await getGeoIPDetails();
          const currentOrgId = sessionStorage.getItem('unkahi_org_id') || 'public';
          
          // Fallback UUID generator for testing on mobile over HTTP (non-secure context)
          const newSurveyId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = Math.random() * 16 | 0;
              return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });

          const { error } = await supabase
            .from('surveys')
            .insert([{
              id: newSurveyId,
              survey_data: {
                score_normalized: normalizedScore,
                dimension_count: finalScores.length,
                scores: finalScores, // Tracks category scores for validating question weights
                responses: finalResponses, // Tracks exact answers chosen to analyze question accuracy
                org_id: currentOrgId // Link this survey to the B2B cohort!
              },
              ip_address: geo.ip,
              country: geo.country,
              city: geo.city,
              region: geo.region
            }]);

          if (error) {
            console.error('Supabase Error saving survey:', error.message);
          } else {
            console.log('Survey record saved to Supabase with geolocation.');
            setSurveyId(newSurveyId);
          }
        } catch (err) {
          console.error('Error saving survey record:', err);
        }
      }
    }, 300);
  };

  useEffect(() => {
    if (isFinished) {
      const totalScore = scores.reduce((a, b) => a + b, 0);
      const assumedMax = 60; // Increased to yield a lower, less alarming score
      setTimeout(() => {
        setLoadPercentage(Math.min(100, Math.round((totalScore / assumedMax) * 100)));
      }, 300);
    }
  }, [isFinished, scores]);

  const labels = ['Hypervigilance', 'Boundary Collapse', 'Intrusive Guilt', 'Somatic Disconnect', 'Isolation', 'Env. Control'];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Emotional Footprint',
        data: scores,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 0.8)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
        pointRadius: 5,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        min: 0,
        max: Math.max(6, ...scores) + 2,
        ticks: { display: false },
        grid: { color: 'rgba(163, 177, 198, 0.2)' },
        angleLines: { color: 'rgba(163, 177, 198, 0.2)' },
        pointLabels: {
          color: '#81A1C1',
          font: { family: 'inherit', size: 12, weight: '800' }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#334155',
        bodyColor: '#64748b',
        borderColor: '#E2E8F0',
        borderWidth: 2,
        padding: 16,
        cornerRadius: 16,
        displayColors: false,
        callbacks: {
          label: (context) => `Intensity Level: ${context.parsed.r}`
        }
      }
    }
  };

  const barData = {
    labels,
    datasets: [{
      label: 'Trait Intensity',
      data: scores,
      backgroundColor: ['#E77A7A', '#D08770', '#A3BE8C', '#B48EAD', '#81A1C1', '#7A9E9E'],
      borderRadius: 9999,
      borderSkipped: false
    }]
  };

  const barOptions = {
    indexAxis: 'y',
    scales: {
      x: { display: false, grid: { display: false } },
      y: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'inherit', weight: '700', size: 12 } } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#FFFFFF', titleColor: '#334155', bodyColor: '#64748b', borderColor: '#E2E8F0', borderWidth: 2, cornerRadius: 16, padding: 12 }
    }
  };

  const handleResonance = async (value) => {
    setResonance(value);
    if (surveyId) {
      const dbValue = value === 'yes' ? 'Accurate' : 'Inaccurate';

      const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

      const geo = await getGeoIPDetails();
      const { error } = await supabase
        .from('surveys')
        .insert([{
          id: newId,
          resonance: dbValue,
          survey_data: { type: 'quick_resonance', parent_survey_id: surveyId },
          ip_address: geo.ip,
          country: geo.country,
          city: geo.city,
          region: geo.region
        }]);

      if (error) console.error("Error inserting resonance:", error.message);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim() || !surveyId) return;
    try {
      const totalScore = scores.reduce((a, b) => a + b, 0);
      const assumedMax = 60; // Increased to yield a lower, less alarming score
      const normalizedScore = Math.min(100, Math.round((totalScore / assumedMax) * 100));

      const newData = {
        type: 'feedback_submission',
        parent_survey_id: surveyId,
        score_normalized: normalizedScore,
        dimension_count: scores.length,
        scores: scores,
        responses: responses,
        feedback: feedbackText.trim()
      };

      const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

      const geo = await getGeoIPDetails();
      const { error: insertError } = await supabase
        .from('surveys')
        .insert([{
          id: newId,
          survey_data: newData,
          resonance: resonance === 'yes' ? 'Accurate' : resonance === 'no' ? 'Inaccurate' : null,
          ip_address: geo.ip,
          country: geo.country,
          city: geo.city,
          region: geo.region
        }]);

      if (insertError) throw insertError;

      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Error submitting feedback:", err.message);
    }
  };

  if (isFinished && deepDiveState === 'idle') {
    const topIndices = scores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(item => item.index);

    // Map the highest scoring category to a specific triage tool
    const TOOL_MAP = [
      { id: 'somatic', name: 'Somatic Healer', emoji: '🧬' }, // Hypervigilance
      { id: 'ground', name: 'Grounding Matrix', emoji: '🧱' }, // Boundary Collapse
      { id: 'letgo', name: 'Let Go Box', emoji: '💨' }, // Intrusive Guilt
      { id: 'ground', name: 'Grounding Matrix', emoji: '🧱' }, // Somatic Disconnect
      { id: 'emdr', name: 'Bilateral Audio', emoji: '🎧' }, // Isolation (Panic)
      { id: 'breathe', name: 'Blooming Lotus', emoji: '🌸' } // Env. Control
    ];

    const suggestedTool = TOOL_MAP[topIndices[0]];

    return (
      <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[2.5rem] p-8 md:p-12 mt-4 opacity-100 max-w-4xl mx-auto w-full transition-all duration-500">
        {/* Results view logic is unchanged from before, kept for component integrity */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-2xl font-extrabold text-slate-700 tracking-tight">Nervous System Load</h3>
            <span className="text-4xl font-black text-[#81A1C1] drop-shadow-sm">{loadPercentage}%</span>
          </div>
          <div className="h-8 w-full bg-[#E2E8F0] rounded-full overflow-hidden shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]">
            <div className="h-full transition-all duration-[1500ms] ease-out shadow-sm rounded-full" style={{ width: `${loadPercentage}%`, background: 'linear-gradient(to right, #81A1C1, #B48EAD, #D08770)' }}></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <div className="bg-white/60 backdrop-blur-lg border border-white p-6 flex flex-col items-center justify-center rounded-[2rem] shadow-sm">
            <h4 className="text-lg font-bold text-slate-600 mb-6 text-center w-full border-b border-white/50 pb-4">Emotional Footprint</h4>
            <div className="w-full max-w-[280px]"><Radar data={chartData} options={chartOptions} /></div>
          </div>
          <div className="bg-white/60 backdrop-blur-lg border border-white p-6 flex flex-col justify-center rounded-[2rem] shadow-sm">
            <h4 className="text-lg font-bold text-slate-600 mb-6 text-center w-full border-b border-white/50 pb-4">Specific Pillars</h4>
            <div className="w-full pt-2"><Bar data={barData} options={barOptions} /></div>
          </div>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-700 tracking-tight mb-8 border-b border-white/50 pb-4">Your Primary Anchors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {topIndices.map(idx => {
            const insight = INSIGHTS[idx];
            return (
              <div key={idx} className="bg-white/60 backdrop-blur-lg border border-white p-8 rounded-[2.5rem] flex flex-col shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl filter drop-shadow-sm">{insight.icon}</div>
                  <h4 className="text-xl font-black text-[#81A1C1] leading-tight">{insight.title}</h4>
                </div>
                <p className="text-slate-600 mb-8 leading-relaxed font-medium flex-grow">{insight.desc}</p>
                <div className="bg-white/80 rounded-2xl p-5 border border-white/50"><p className="text-xs font-black text-[#A3BE8C] uppercase tracking-wider mb-2">Gentle Tip</p><p className="text-sm text-slate-700 font-bold">{insight.tip}</p></div>
              </div>
            );
          })}
        </div>
        <div className="pt-8 text-center bg-white/40 border border-white/50 rounded-[3rem] p-10 shadow-sm backdrop-blur-md">
          <h4 className="text-2xl font-extrabold text-slate-700 mb-4">Resonance Check</h4>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto font-medium text-lg">Psychology is complex, and you know yourself best. Does this emotional footprint resonate with how you are feeling?</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
            <button onClick={() => handleResonance('yes')} className={`rounded-full px-6 py-3 md:px-8 md:py-4 font-extrabold text-base md:text-lg transition-all duration-300 w-full sm:w-auto shadow-sm ${resonance === 'yes' ? 'bg-[#A3BE8C] text-white shadow-lg -translate-y-1' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>👍 Yes, accurate</button>
            <button onClick={() => handleResonance('no')} className={`rounded-full px-6 py-3 md:px-8 md:py-4 font-extrabold text-base md:text-lg transition-all duration-300 w-full sm:w-auto shadow-sm ${resonance === 'no' ? 'bg-[#B48EAD] text-white shadow-lg -translate-y-1' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>👎 Not quite right</button>
          </div>

          <div className={`overflow-hidden transition-all duration-500 ${resonance ? 'max-h-96 opacity-100 mb-10' : 'max-h-0 opacity-0'}`}>
            <p className="text-[#D08770] font-extrabold text-xl mb-4">Thank you for tuning in to yourself.</p>
            {!feedbackSubmitted ? (
              <div className="max-w-lg mx-auto bg-white/60 p-6 rounded-3xl border border-white/50 shadow-sm mt-4">
                <p className="text-slate-600 font-bold mb-3">How can we improve this assessment?</p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Your completely anonymous feedback helps us refine the algorithm..."
                  className="w-full h-24 p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none bg-white text-slate-700 text-sm font-medium mb-3"
                ></textarea>
                <button
                  onClick={submitFeedback}
                  className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors w-full"
                >
                  Submit Anonymous Feedback
                </button>
              </div>
            ) : (
              <div className="max-w-lg mx-auto bg-green-50 p-4 rounded-3xl border border-green-100 shadow-sm mt-4">
                <p className="text-green-700 font-bold">Feedback received. Thank you for making Unkahi better.</p>
              </div>
            )}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 md:p-6 mb-8 max-w-sm mx-auto w-full">
            <p className="text-teal-700 font-bold text-xs md:text-sm uppercase tracking-wider mb-2">Recommended for You Now</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl md:text-4xl">{suggestedTool.emoji}</span>
              <span className="text-xl md:text-2xl font-black text-teal-900">{suggestedTool.name}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center flex-wrap w-full">
            <button
              onClick={() => { onComplete && onComplete(scores, suggestedTool.id); if (onNavigate) onNavigate(suggestedTool.id); }}
              className="bg-teal-700 text-white w-full sm:w-auto px-6 py-3 md:px-10 md:py-4 font-extrabold rounded-full text-base md:text-lg shadow-md hover:shadow-[0_0_15px_rgba(13,148,136,0.6)] hover:-translate-y-1 transition-all"
            >
              Begin {suggestedTool.name}
            </button>
            <button
              onClick={() => setDeepDiveState('warning')}
              className="bg-white border-2 border-purple-200 text-purple-700 w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 font-extrabold rounded-full text-xs md:text-sm hover:bg-purple-50 hover:-translate-y-1 transition-all shadow-sm"
            >
              🔬 Go Deeper — I want more clarity
            </button>
          </div>
          {loadPercentage >= 40 && (
            <p className="text-xs text-purple-400 font-bold mt-4 text-center">
              ✦ Our system detected something worth exploring further. The deeper assessment uses a different psychological lens.
            </p>
          )}
        </div>
        <div className="mt-10 pt-8 border-t border-white/50">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Or choose your own path</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TOOLS.map(tool => (
              <button
                key={tool.id}
                onClick={() => { onComplete && onComplete(scores, tool.id); if (onNavigate) onNavigate(tool.id); }}
                className={`bg-gradient-to-br ${tool.color} p-4 rounded-2xl text-left hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group`}
              >
                <span className="text-2xl block mb-2">{tool.emoji}</span>
                <p className="text-white font-black text-xs">{tool.name}</p>
              </button>
            ))}
          </div>
        </div>
        {onNavigate && (
          <div className="mt-8 pt-6 border-t border-white/50 flex justify-center">
            <button
              onClick={() => onNavigate('mydata')}
              className="flex items-center gap-3 bg-white/70 hover:bg-indigo-50 border border-indigo-200 text-indigo-700 px-8 py-4 rounded-full font-bold transition-all hover:-translate-y-1 shadow-sm hover:shadow-md text-sm"
            >
              <span>📊</span>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Your Data</p>
                <p className="font-bold">View Unified Insights Dashboard →</p>
              </div>
            </button>
          </div>
        )}

      </div>
    );
  }
  if (deepDiveState === 'warning') {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-purple-500/10 rounded-[2.5rem] p-8 md:p-12 max-w-4xl w-full mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="text-5xl mb-6">🌊</div>
          <div className="mb-3 text-[10px] font-bold tracking-widest text-purple-400 uppercase bg-purple-50 border border-purple-100 py-1.5 px-4 rounded-full">
            Phase 2 · Deeper Look
          </div>
          <h2 className="text-3xl font-black text-slate-700 mb-4 leading-tight">Going a little deeper.</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed mb-2">
            The next 10 questions use a different technique — they ask about imagery, memory, and feelings rather than situations.
          </p>
          <p className="text-slate-400 text-sm font-bold mb-10">
            Take a breath. There are no right or wrong answers. You can stop at any time.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 max-w-md w-full mb-10">
            <p className="text-amber-700 font-bold text-sm">⚠ Some questions may bring up old memories or feelings. If at any point you feel overwhelmed, please close the assessment and use the Grounding Matrix or Breathing Room tools.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setDeepDiveState('active')}
              className="bg-purple-600 text-white px-10 py-4 font-extrabold rounded-full text-lg shadow-md hover:-translate-y-1 transition-all"
            >
              I'm ready — let's go deeper
            </button>
            <button
              onClick={() => setDeepDiveState('idle')}
              className="bg-white border border-slate-200 text-slate-500 px-8 py-4 font-bold rounded-full text-sm hover:bg-slate-50 transition-all"
            >
              Go back to results
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (deepDiveState === 'active') {
    const deepPhase = DEEP_DIVE_PHASES[deepDiveStep];

    const handleDeepDiveSelect = (weights, optionIndex, optionText) => {
      setIsFading(true);
      const updatedScores = deepDiveScores.map((s, i) => s + weights[i]);

      const currentDeepDiveResponse = {
        step: STORY_PHASES.length + deepDiveStep + 1,
        option_selected: optionIndex,
        answer_text: optionText
      };
      const updatedDeepDiveResponses = [...deepDiveResponses, currentDeepDiveResponse];

      setTimeout(() => {
        if (deepDiveStep < DEEP_DIVE_PHASES.length - 1) {
          setDeepDiveScores(updatedScores);
          setDeepDiveResponses(updatedDeepDiveResponses);
          setDeepDiveStep(prev => prev + 1);
          setIsFading(false);
        } else {
          setDeepDiveScores(updatedScores);
          setDeepDiveResponses(updatedDeepDiveResponses);
          setDeepDiveState('done');
          setIsFading(false);

          // Notify App.jsx immediately with combined scores
          const combined = scores.map((s, i) => s + updatedScores[i]);
          const combinedResponses = [...responses, ...updatedDeepDiveResponses];
          onComplete && onComplete(combined, null, 'deepdive');

          // Update Supabase with the highly accurate combined footprint and full responses
          if (surveyId) {
            const newScoreNormalized = Math.min(100, Math.round((combined.reduce((a, b) => a + b, 0) / 64) * 100));
            supabase.from('surveys').update({
              survey_data: {
                score_normalized: newScoreNormalized,
                dimension_count: combined.length,
                scores: combined,
                responses: combinedResponses
              }
            }).eq('id', surveyId).then(({ error }) => {
              if (error) console.error("Error saving deep dive scores:", error.message);
            });
          }
        }
      }, 300);
    };

    return (
      <div className={`bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-purple-500/10 rounded-[2.5rem] p-6 md:p-10 max-w-4xl w-full mx-auto transition-all duration-300 ease-in-out transform ${isFading ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}>
        <div className="w-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[10px] font-bold tracking-widest text-purple-400 uppercase bg-purple-50 border border-purple-100 py-1.5 px-3 rounded-full">
              {deepPhase.phase} · {deepDiveStep + 1} of {DEEP_DIVE_PHASES.length}
            </div>
            <button onClick={() => setDeepDiveState('idle')} className="text-slate-300 hover:text-slate-500 text-xs font-bold uppercase tracking-widest transition-colors">
              ✕ Stop
            </button>
          </div>

          <p className="text-xl md:text-2xl text-slate-700 mb-10 leading-relaxed text-center font-extrabold px-2 md:px-6">
            {deepPhase.text}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deepPhase.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleDeepDiveSelect(opt.weights, idx, opt.text)}
                className="bg-white/80 hover:bg-purple-50 rounded-[1.5rem] w-full h-auto min-h-[4rem] text-left p-4 sm:p-5 text-sm sm:text-base font-bold text-slate-600 hover:text-purple-700 flex items-center justify-between group shadow-sm border border-white hover:border-purple-200 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <span className="pr-4 leading-snug">{opt.text}</span>
                <span className="opacity-0 group-hover:opacity-100 text-purple-500 transition-opacity font-black text-xl">→</span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {DEEP_DIVE_PHASES.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all duration-500 ${idx === deepDiveStep ? 'bg-purple-500 scale-150 shadow-sm' :
                    idx < deepDiveStep ? 'bg-purple-300' : 'bg-slate-200'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (deepDiveState === 'done') {
    const combined = scores.map((s, i) => s + deepDiveScores[i]);
    const combinedTotal = combined.reduce((a, b) => a + b, 0);
    const combinedMax = 120; // Increased to yield a lower, less alarming score
    const combinedLoad = Math.min(100, Math.round((combinedTotal / combinedMax) * 100));

    const topCombined = combined
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(item => item.index);

    const TOOL_MAP_COMBINED = [
      { id: 'somatic', name: 'Somatic Healer', emoji: '🧬' },
      { id: 'ground', name: 'Grounding Matrix', emoji: '🧱' },
      { id: 'letgo', name: 'Let Go Box', emoji: '💨' },
      { id: 'ground', name: 'Grounding Matrix', emoji: '🧱' },
      { id: 'emdr', name: 'Bilateral Audio', emoji: '🎧' },
      { id: 'breathe', name: 'Blooming Lotus', emoji: '🌸' }
    ];
    const finalTool = TOOL_MAP_COMBINED[topCombined[0]];

    const combinedChartData = {
      labels: ['Hypervigilance', 'Boundary Collapse', 'Intrusive Guilt', 'Somatic Disconnect', 'Isolation', 'Env. Control'],
      datasets: [{
        label: 'Cross-Validated Footprint',
        data: combined,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 0.8)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#fff',
        pointRadius: 5,
      }]
    };

    return (
      <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-purple-500/10 rounded-[2.5rem] p-8 md:p-12 mt-4 max-w-4xl mx-auto w-full">
        {/* Cross-validated badge */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="text-3xl">🔬</span>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-purple-500">Cross-Validated Reading</p>
            <h2 className="text-2xl font-black text-slate-700 leading-tight">Deeper Analysis Complete</h2>
          </div>
        </div>

        <p className="text-center text-slate-400 font-medium text-sm mb-10 max-w-lg mx-auto">
          This combines two different psychological measurement approaches — behavioural scenario responses and projective imagery. Together they give a more complete picture.
        </p>

        {/* Combined load bar */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-lg font-extrabold text-slate-700">Combined Nervous System Load</h3>
            <span className="text-4xl font-black text-purple-400">{combinedLoad}%</span>
          </div>
          <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-[1500ms] ease-out"
              style={{ width: `${combinedLoad}%`, background: 'linear-gradient(to right, #a78bfa, #818cf8, #c084fc)' }}
            />
          </div>
        </div>

        {/* Radar chart */}
        <div className="bg-white/60 border border-white p-6 rounded-[2rem] shadow-sm mb-10 flex flex-col items-center">
          <h4 className="text-base font-bold text-slate-600 mb-4">Cross-Validated Emotional Footprint</h4>
          <div className="w-full max-w-[280px]">
            <Radar data={combinedChartData} options={chartOptions} />
          </div>
        </div>

        {/* Top insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {topCombined.map(idx => {
            const insight = INSIGHTS[idx];
            return (
              <div key={idx} className="bg-white/60 border border-white p-6 rounded-[2rem] shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{insight.icon}</span>
                  <h4 className="text-lg font-black text-purple-500">{insight.title}</h4>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed flex-grow mb-4">{insight.desc}</p>
                <div className="bg-white/80 rounded-xl p-4 border border-white/50">
                  <p className="text-xs font-black text-emerald-500 uppercase tracking-wider mb-1">Gentle Tip</p>
                  <p className="text-sm text-slate-700 font-bold">{insight.tip}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-slate-400 font-bold mb-6">✦ Both assessments point in the same direction. This is your path forward.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => { onComplete && onComplete(combined, finalTool.id); if (onNavigate) onNavigate(finalTool.id); }}
              className="bg-purple-600 text-white px-12 py-5 font-extrabold rounded-full text-xl shadow-md hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:-translate-y-1 transition-all"
            >
              {finalTool.emoji} Begin {finalTool.name}
            </button>
            {onNavigate && (
              <button
                onClick={() => { onComplete && onComplete(combined, null); onNavigate('mydata'); }}
                className="flex items-center gap-2 bg-white/70 hover:bg-indigo-50 border border-indigo-200 text-indigo-700 px-6 py-4 rounded-full font-bold transition-all hover:-translate-y-1 shadow-sm text-sm"
              >
                <span>📊</span> View Your Data
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!hasCompletedSomatic) {
    return (
      <div className={`bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[2.5rem] p-6 md:p-10 max-w-4xl w-full mx-auto transition-all duration-300 ease-in-out transform box-border ${isFading ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
        <div className="w-full flex-col flex h-full items-center text-center">
          <div className="mb-4 text-[10px] sm:text-xs font-bold tracking-widest text-[#D08770] uppercase text-center bg-white/70 py-2 px-4 rounded-full inline-block mx-auto border border-white shadow-sm">
            Phase 0 | The Body Speaks First
          </div>
          <p className="text-xl md:text-2xl text-slate-700 mb-2 leading-relaxed font-extrabold px-2 md:px-6">
            Where are you holding tension right now?
          </p>
          <p className="text-sm text-slate-500 font-medium mb-8">Trauma lives in the body. Select any physical sensations you feel (or skip if none).</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mb-8">
            {SOMATIC_OPTIONS.map(opt => {
              const isSelected = selectedSomatic.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedSomatic(prev =>
                      prev.includes(opt.id) ? prev.filter(id => id !== opt.id) : [...prev, opt.id]
                    );
                  }}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 border ${isSelected
                      ? 'bg-teal-50 border-teal-200 shadow-inner scale-95'
                      : 'bg-white/80 border-white shadow-sm hover:shadow-md hover:-translate-y-1'
                    }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-teal-700' : 'text-slate-600'}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSomaticSubmit}
            className="bg-slate-800 text-white px-10 py-4 font-extrabold rounded-full text-lg shadow-md hover:bg-slate-700 hover:-translate-y-1 transition-all"
          >
            {selectedSomatic.length > 0 ? 'Continue' : 'I feel neutral right now'}
          </button>
        </div>
      </div>
    );
  }

  const phase = STORY_PHASES[currentStep];

  return (
    <div className={`bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[2.5rem] p-6 md:p-10 max-w-4xl w-full mx-auto transition-all duration-300 ease-in-out transform box-border ${isFading ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
      <div className="w-full flex-col flex h-full">
        <div className="mb-4 text-[10px] sm:text-xs font-bold tracking-widest text-[#B48EAD] uppercase text-center bg-white/70 py-2 px-4 rounded-full inline-block mx-auto border border-white shadow-sm max-w-[80%] whitespace-normal leading-snug">
          {phase.phase} | {phase.title}
        </div>
        <p className="text-xl md:text-2xl text-slate-700 mb-8 leading-relaxed text-center font-extrabold px-2 md:px-6">
          {phase.text}
        </p>

        {/* Optimized Grid Layout for buttons within single viewable space */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phase.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(opt.weights, idx, opt.text)}
              className="bg-white/80 hover:bg-white rounded-[1.5rem] w-full h-auto min-h-[4rem] text-left p-4 sm:p-5 text-sm sm:text-base font-bold text-slate-600 hover:text-teal-700 flex items-center justify-between group shadow-sm border border-white transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <span className="pr-4 leading-snug">{opt.text}</span>
              <span className="opacity-0 group-hover:opacity-100 text-teal-600 transition-opacity font-black text-xl">→</span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {STORY_PHASES.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-full transition-all duration-500 ${idx === currentStep ? 'bg-purple-500 scale-150 shadow-sm' : idx < currentStep ? 'bg-teal-400' : 'bg-slate-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
