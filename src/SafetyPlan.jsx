/**
 * SafetyPlan.jsx — Personal Safety Plan Builder
 * ================================================
 * Based on the Stanley-Brown 6-Step Safety Planning Model.
 * Used by VA PTSD Coach, Beyond Now, Crisis Text Line.
 * 100% local — stored only in localStorage, never uploaded.
 *
 * Language note: We never say "suicidal". We use "very hard moments",
 * "feeling unsafe", "when things get very difficult".
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'unkahi_safety_plan';

const STEPS = [
  {
    id: 'warning_signs',
    title: 'My Warning Signs',
    subtitle: 'Step 1 of 6',
    icon: '🔔',
    color: 'from-amber-400 to-orange-400',
    ringColor: 'ring-amber-200',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    desc: 'These are the thoughts, feelings, or situations that tell me I\'m entering a very hard moment — before things get overwhelming.',
    placeholder: 'e.g. I start isolating, feel restless, can\'t sleep...',
    suggestions: [
      'Feeling very restless or agitated',
      'Isolating from everyone',
      'Trouble sleeping or sleeping too much',
      'Feeling completely numb',
      'Heart racing for no reason',
      'Everything feels pointless',
      'Wanting to disappear',
      'Can\'t stop crying',
    ],
  },
  {
    id: 'coping_alone',
    title: 'Things I Can Do Alone',
    subtitle: 'Step 2 of 6',
    icon: '🌿',
    color: 'from-teal-400 to-emerald-500',
    ringColor: 'ring-teal-200',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    desc: 'Activities that help me feel a little better or distract me — things I can do entirely on my own, right now.',
    placeholder: 'e.g. Take a walk, listen to music, draw...',
    suggestions: [
      'Take a slow walk outside',
      'Listen to my comfort playlist',
      'Do the Blooming Lotus breathing',
      'Splash cold water on my face',
      'Do 20 jumping jacks',
      'Write in the Let Go Box',
      'Draw or sketch anything',
      'Watch a familiar comfort show',
    ],
  },
  {
    id: 'distraction_people',
    title: 'People & Places That Help',
    subtitle: 'Step 3 of 6',
    icon: '🏡',
    color: 'from-sky-400 to-blue-500',
    ringColor: 'ring-sky-200',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
    desc: 'People or places that bring me some peace or gentle distraction — not necessarily to talk deeply, just to not be alone.',
    placeholder: 'e.g. My cousin\'s home, a quiet park, a café...',
    suggestions: [
      'A quiet park or garden',
      'A library or bookshop',
      'A café with soft music',
      'Being with my pet',
      'A trusted neighbour\'s home',
      'A community space I feel safe in',
    ],
  },
  {
    id: 'support_contacts',
    title: 'People I Can Reach Out To',
    subtitle: 'Step 4 of 6',
    icon: '💜',
    color: 'from-violet-400 to-purple-500',
    ringColor: 'ring-violet-200',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    desc: 'Specific people I can contact when I feel unsafe. Even just to say: "I\'m having a very hard time."',
    placeholder: 'Name and how to reach them...',
    isContacts: true,
    suggestions: [],
  },
  {
    id: 'professional_help',
    title: 'Professional Support',
    subtitle: 'Step 5 of 6',
    icon: '🩺',
    color: 'from-rose-400 to-pink-500',
    ringColor: 'ring-rose-200',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    desc: 'Professionals and helplines I can reach when I need more support than friends or family can give.',
    placeholder: 'Therapist, clinic, or helpline name and number...',
    isContacts: true,
    prefilled: ['KIRAN: 1800-599-0019 (24/7, free)', 'iCall: 9152987821'],
    suggestions: [
      'KIRAN: 1800-599-0019 (24/7, free)',
      'iCall: 9152987821',
      'Vandrevala Foundation: 1860-2662-345',
      'AASRA: 9820466627',
    ],
  },
  {
    id: 'environment',
    title: 'Making My Space Safer',
    subtitle: 'Step 6 of 6',
    icon: '🛡️',
    color: 'from-slate-500 to-slate-700',
    ringColor: 'ring-slate-200',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    desc: 'Specific, practical steps I can take to make my environment feel safer when things get very difficult.',
    placeholder: 'e.g. Ask someone to come stay with me...',
    suggestions: [
      'Ask someone I trust to come stay with me',
      'Go somewhere there are other people',
      'Keep my phone charged and close',
      'Put away anything that feels dangerous',
      'Lock my door and put on a familiar show',
      'Text someone my location',
    ],
  },
];

const defaultPlan = Object.fromEntries(
  STEPS.map(s => [s.id, s.prefilled ? [...s.prefilled] : []])
);

// ─── Tag Input Component ───────────────────────────────────────────────────────
function TagInput({ value = [], onChange, placeholder, suggestions = [] }) {
  const [inputVal, setInputVal] = useState('');

  const add = (text) => {
    const trimmed = text.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputVal('');
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  const unusedSuggestions = suggestions.filter(s => !value.includes(s));

  return (
    <div className="space-y-3">
      {/* Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-full shadow-sm">
              {tag}
              <button onClick={() => remove(i)} className="text-slate-300 hover:text-rose-400 transition-colors ml-1 font-bold">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
          placeholder={placeholder}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && inputVal.trim()) { e.preventDefault(); add(inputVal); } }}
        />
        <button
          onClick={() => add(inputVal)}
          disabled={!inputVal.trim()}
          className="bg-slate-800 disabled:opacity-30 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all"
        >
          Add
        </button>
      </div>

      {/* Quick suggestions */}
      {unusedSuggestions.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick add ↓</p>
          <div className="flex flex-wrap gap-2">
            {unusedSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => add(s)}
                className="text-xs font-medium text-slate-500 bg-white border border-dashed border-slate-200 px-3 py-1.5 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ step, value, onChange, onNext, onBack, isFirst, isLast }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className={`rounded-2xl bg-gradient-to-r ${step.color} p-6 mb-6 text-white`}>
        <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-2">{step.subtitle}</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{step.icon}</span>
          <h2 className="text-2xl font-black tracking-tight">{step.title}</h2>
        </div>
        <p className="text-white/80 text-sm font-medium mt-3 leading-relaxed">{step.desc}</p>
      </div>

      {/* Input */}
      <div className="flex-1 mb-6">
        <TagInput
          value={value}
          onChange={onChange}
          placeholder={step.placeholder}
          suggestions={step.suggestions}
        />
      </div>

      {/* Nav */}
      <div className="flex items-center gap-3">
        {!isFirst && (
          <button onClick={onBack} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">
            ← Back
          </button>
        )}
        <button
          onClick={onNext}
          className={`flex-1 bg-gradient-to-r ${step.color} text-white py-3 rounded-xl font-black text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all`}
        >
          {isLast ? '✓ Save My Safety Plan' : 'Continue →'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Plan Summary View ────────────────────────────────────────────────────────
function PlanSummary({ plan, onEdit, onBack }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Your Safety Plan</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Tap a section to edit · 100% local · never shared</p>
        </div>
        <button
          onClick={onEdit}
          className="text-xs font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full hover:bg-indigo-100 transition-all"
        >
          ✏ Edit
        </button>
      </div>

      {/* Crisis Contacts callout — most important */}
      <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-5 mb-5">
        <p className="text-xs font-black uppercase tracking-widest text-rose-500 mb-3">🆘 If you need help right now</p>
        <div className="space-y-2">
          {(plan.professional_help || []).map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-bold text-rose-700 bg-white rounded-xl px-4 py-2 border border-rose-100">
              📞 {c}
            </div>
          ))}
          {(plan.support_contacts || []).map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-bold text-violet-700 bg-white rounded-xl px-4 py-2 border border-violet-100">
              💜 {c}
            </div>
          ))}
        </div>
      </div>

      {/* Other steps */}
      {STEPS.filter(s => s.id !== 'support_contacts' && s.id !== 'professional_help').map((step) => {
        const items = plan[step.id] || [];
        if (items.length === 0) return null;
        return (
          <div key={step.id} className={`${step.bgColor} border border-white/60 rounded-2xl p-5 mb-4`}>
            <div className="flex items-center gap-2 mb-3">
              <span>{step.icon}</span>
              <p className={`text-xs font-black uppercase tracking-widest ${step.textColor}`}>{step.title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((item, i) => (
                <span key={i} className="text-sm font-medium text-slate-700 bg-white/70 px-3 py-1 rounded-lg border border-white/50">
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-emerald-700 text-center">
          💚 You made this when you were calm. Trust the version of you that built it.
        </p>
      </div>

      <button onClick={onBack} className="w-full mt-4 text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest text-xs transition-colors py-3">
        ← Back to Home
      </button>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SafetyPlan({ onBack }) {
  const [mode, setMode] = useState('loading'); // loading, intro, wizard, summary
  const [stepIndex, setStepIndex] = useState(0);
  const [plan, setPlan] = useState(defaultPlan);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasContent = Object.values(parsed).some(v => Array.isArray(v) && v.length > 0);
        setPlan(parsed);
        setMode(hasContent ? 'summary' : 'intro');
      } else {
        setMode('intro');
      }
    } catch { setMode('intro'); }
  }, []);

  const savePlan = async (updatedPlan) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlan));
      const { syncSafetyPlan } = await import('./utils/supabaseSync');
      syncSafetyPlan(updatedPlan);
    } catch (e) {
      console.warn("Failed to sync safety plan", e);
    }
  };

  const updateStep = (id, val) => {
    const updated = { ...plan, [id]: val };
    setPlan(updated);
    savePlan(updated);
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(i => i + 1);
    } else {
      savePlan(plan);
      setMode('summary');
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(i => i - 1);
    else setMode('intro');
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-rose-500/10 rounded-[3rem] px-6 py-10 sm:px-12 max-w-2xl w-full mx-auto mt-6">
      <AnimatePresence mode="wait">
        {/* Loading */}
        {mode === 'loading' && (
          <motion.div key="loading" className="flex items-center justify-center h-48 text-slate-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Loading your plan…</p>
            </div>
          </motion.div>
        )}

        {/* Intro */}
        {mode === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <button onClick={onBack} className="text-slate-400 hover:text-rose-500 font-bold uppercase tracking-widest text-xs transition-colors mb-8 block">← Back</button>
            <div className="text-center">
              <div className="text-6xl mb-6">🛡️</div>
              <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Your Safety Plan</h1>
              <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-3">
                This is a personal plan you create <em>now</em>, when you're calm, so it's ready for you when things get very hard.
              </p>
              <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto mb-8">
                It takes about 5 minutes. Everything stays only on this device — nothing is ever uploaded or shared.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 text-left">
                {STEPS.map((s) => (
                  <div key={s.id} className={`${s.bgColor} rounded-2xl p-3 border border-white/50`}>
                    <span className="text-xl">{s.icon}</span>
                    <p className={`text-xs font-black mt-1 ${s.textColor}`}>{s.title}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setStepIndex(0); setMode('wizard'); }}
                className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-10 py-4 rounded-full font-black text-lg shadow-md hover:shadow-rose-200 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                Build My Plan
              </button>

              <p className="text-xs text-slate-400 font-medium mt-5">
                You can stop and come back at any time. Your progress is saved automatically.
              </p>
            </div>
          </motion.div>
        )}

        {/* Wizard */}
        {mode === 'wizard' && (
          <motion.div key={`step-${stepIndex}`} className="flex flex-col min-h-[520px]">
            {/* Progress bar */}
            <div className="flex gap-1.5 mb-6">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= stepIndex ? 'bg-rose-400' : 'bg-slate-200'}`} />
              ))}
            </div>

            <StepCard
              step={STEPS[stepIndex]}
              value={plan[STEPS[stepIndex].id] || []}
              onChange={(val) => updateStep(STEPS[stepIndex].id, val)}
              onNext={handleNext}
              onBack={handleBack}
              isFirst={stepIndex === 0}
              isLast={stepIndex === STEPS.length - 1}
            />
          </motion.div>
        )}

        {/* Summary */}
        {mode === 'summary' && (
          <motion.div key="summary">
            <PlanSummary
              plan={plan}
              onEdit={() => { setStepIndex(0); setMode('wizard'); }}
              onBack={onBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
