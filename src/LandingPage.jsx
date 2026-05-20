import React from 'react';

export default function LandingPage({ onNavigate, isTransitioning }) {
  const pillars = [
    { title: 'Intrusive Guilt', icon: '⚖️', desc: 'Carrying blame for things outside your control as a way to feel in control of uncontrollable pain.', tip: 'Use the "Let Go Box" to physically release a blame story.' },
    { title: 'Hypervigilance', icon: '👁️', desc: 'Your nervous system is on high alert, constantly scanning for danger. A brilliant survival mechanism that consumes energy.', tip: 'Try the Breathing Room to signal safety.' },
    { title: 'Boundary Collapse', icon: '🫂', desc: 'Over-accommodating others to keep the peace when asserting needs felt risky in the past.', tip: 'Practice saying "I need a moment to think".' },
    { title: 'Somatic Disconnect', icon: '🧊', desc: 'Feeling numb or floaty. This is your nervous system providing a protective buffer against overwhelming sensations.', tip: 'Use the Grounding Matrix.' }
  ];

  return (
    <div className={`w-full max-w-6xl mx-auto flex flex-col items-center justify-start pb-24 transition-all duration-500 ease-out transform ${isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
      
      {/* 2. The Clarity Hero Section */}
      <nav className="w-full flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24 mt-8 px-4 md:px-8 gap-6 md:gap-0">
        <div className="flex flex-col text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#475569] tracking-widest uppercase">UNKAHI</h1>
          <p className="text-[0.65rem] md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Interactive Psychological Safety</p>
        </div>
        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
          <button 
            onClick={() => onNavigate('kids')}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold py-2 px-4 md:px-6 rounded-full shadow-sm hover:shadow-md transition-all text-xs md:text-sm uppercase tracking-wide"
          >
            🧸 Kids Mode
          </button>
          <button 
            onClick={() => window.location.replace('https://www.google.com')}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 md:px-6 rounded-full shadow-sm hover:shadow-md transition-all text-xs md:text-sm uppercase tracking-wide"
          >
            Quick Exit
          </button>
        </div>
      </nav>

      <div className="w-full max-w-3xl text-center space-y-6 md:space-y-8 mb-20 md:mb-32 px-4">
        <h2 className="text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight">
          कुछ बातें Unkahi हैं... and that's okay.
        </h2>
        <p className="text-xl text-slate-600 leading-relaxed font-medium mx-auto max-w-2xl">
          पर उन्हें अकेले carry करना ज़रूरी नहीं। A 100% safe, private space for those heavy emotions जो किसी को समझा नहीं सकते। Let's untangle them together.
        </p>
        <div className="pt-8 flex flex-col items-center">
          <button 
            onClick={() => onNavigate('assessment')}
            className="bg-teal-700 text-white px-12 py-5 font-extrabold rounded-full text-xl shadow-md hover:shadow-[0_0_15px_rgba(13,148,136,0.6)] hover:-translate-y-1 transition-all"
          >
            Take the First Step
          </button>
          <p className="text-xs text-slate-500 mt-3">
            🔒 100% Anonymous. Your data never leaves your device.
          </p>
        </div>
      </div>

      {/* 3. Detailed Project Insights & Clinical Blueprint */}
      <div className="w-full bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 p-10 md:p-16 mb-24 shadow-xl shadow-indigo-500/5">
        <h3 className="text-3xl font-extrabold text-slate-700 mb-6 text-center">About the Project</h3>
        <p className="text-lg text-slate-600 leading-relaxed font-medium text-center max-w-4xl mx-auto mb-16">
          This private, algorithmic tool analyzes your nervous system's behavior across a detailed 24-hour narrative. By exploring how you wake, move through the day, and prepare for sleep, we generate a highly accurate, non-invasive psychological footprint, distinguishing between routine stress and deep-seated fawning, hypervigilance, and somatic dissociation responses.
        </p>
        
        <h3 className="text-2xl font-extrabold text-slate-700 mb-8 text-center border-b border-white/50 pb-4 max-w-sm mx-auto">Clinical Pillars</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="bg-white/60 backdrop-blur-lg border border-white p-8 rounded-[2.5rem] flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl drop-shadow-sm">{pillar.icon}</div>
                <h4 className="text-xl font-black text-[#5C6E84] leading-tight">{pillar.title}</h4>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed font-medium flex-grow">{pillar.desc}</p>
              <div className="bg-[#A3BE8C]/10 rounded-2xl p-4 border border-[#A3BE8C]/20">
                <p className="text-xs font-black text-[#A3BE8C] uppercase tracking-wider mb-1">Actionable Tip</p>
                <p className="text-sm text-slate-700 font-bold">{pillar.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Healing Tools & Kids Mode ('Little UNKAHI') */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
        <div className="bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 p-10 shadow-xl shadow-teal-500/5 text-center flex flex-col items-center">
          <span className="text-5xl mb-6">🌸</span>
          <h3 className="text-2xl font-extrabold text-teal-800 mb-4">Healing Tools</h3>
          <p className="text-slate-600 mb-8 font-medium">
            Discover the <strong>Breathing Room</strong> and <strong>The Let Go Box</strong> with beautiful, detailed Claymorphic CSS animations. Soft concentric glowing rings for breath, blurring and dissolving text for release.
          </p>
          <button 
            onClick={() => onNavigate('tools')}
            className="mt-auto bg-white hover:bg-teal-50 text-teal-700 font-bold py-3 px-8 rounded-full border border-white shadow-sm hover:shadow hover:-translate-y-1 transition-all"
          >
            Explore Triage Tools
          </button>
        </div>
        
        <div className="bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 p-10 shadow-xl shadow-purple-500/5 text-center flex flex-col items-center">
          <span className="text-5xl mb-6">🧸</span>
          <h3 className="text-2xl font-extrabold text-purple-800 mb-4">Kids Mode (Little UNKAHI)</h3>
          <p className="text-slate-600 mb-8 font-medium">
            A dedicated, soft toy-box aesthetic to teach safe boundaries implicitly through the Brave Bear story game. A narrative expanded into 10 gentle lessons.
          </p>
          <button 
            onClick={() => onNavigate('kids')}
            className="mt-auto bg-white hover:bg-purple-50 text-purple-700 font-bold py-3 px-8 rounded-full border border-white shadow-sm hover:shadow hover:-translate-y-1 transition-all"
          >
            Open Toy Box
          </button>
        </div>
      </div>
{/* 5. Pacing & Animations spacing bottom */}
      <div className="mt-16 text-slate-400 text-sm font-medium tracking-wide">
        Take your time. You are safe here.
      </div>
    </div>
  );
}
