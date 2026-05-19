import React, { useState, useEffect } from 'react';
import { Radar, Bar } from 'react-chartjs-2';
import { STORY_PHASES } from './AssessmentData';
import { supabase } from './supabaseClient';
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

export default function Assessment({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0, 0, 0]); 
  const [responses, setResponses] = useState([]);
  const [isFading, setIsFading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loadPercentage, setLoadPercentage] = useState(0);
  const [resonance, setResonance] = useState(null);

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

        // Fetch IP and save to Supabase
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          const userIp = ipData.ip;
          
          // Calculate the updated scores accurately for saving
          const finalScores = scores.map((score, idx) => score + weights[idx]);
          const finalResponses = [...responses, { step: currentStep + 1, option_selected: optionIndex, answer_text: optionText }];

          const { error } = await supabase
            .from('surveys')
            .insert([
              { 
                ip_address: userIp, 
                survey_data: { 
                  scores: finalScores,
                  answers: finalResponses
                }
              }
            ]);
            
          if (error) {
            console.error("Supabase Error saving survey:", error.message);
          } else {
            console.log("Survey successfully saved to Supabase!");
          }
        } catch (err) {
          console.error("Fetch/IP error saving survey:", err);
        }
      }
    }, 300); 
  };

  useEffect(() => {
    if (isFinished) {
      const totalScore = scores.reduce((a, b) => a + b, 0);
      const assumedMax = 40; 
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

  if (isFinished) {
    const topIndices = scores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(item => item.index);

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
            <button onClick={() => setResonance('yes')} className={`rounded-full px-8 py-4 font-extrabold text-lg transition-all duration-300 w-full sm:w-auto shadow-sm ${resonance === 'yes' ? 'bg-[#A3BE8C] text-white shadow-lg -translate-y-1' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>👍 Yes, accurate</button>
            <button onClick={() => setResonance('no')} className={`rounded-full px-8 py-4 font-extrabold text-lg transition-all duration-300 w-full sm:w-auto shadow-sm ${resonance === 'no' ? 'bg-[#B48EAD] text-white shadow-lg -translate-y-1' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>👎 Not quite right</button>
          </div>
          <div className={`overflow-hidden transition-all duration-500 ${resonance ? 'max-h-20 opacity-100 mb-10' : 'max-h-0 opacity-0'}`}><p className="text-[#D08770] font-extrabold text-xl">Thank you for tuning in to yourself.</p></div>
          <button onClick={onComplete} className="bg-teal-700 text-white px-12 py-5 font-extrabold rounded-full text-xl shadow-md hover:shadow-[0_0_15px_rgba(13,148,136,0.6)] hover:-translate-y-1 w-full md:w-auto transition-all">Explore Healing Tools</button>
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
