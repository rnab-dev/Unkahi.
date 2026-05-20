import React, { useState, useEffect } from 'react';

export function BreathingRoom({ onBack }) {
  const [phase, setPhase] = useState('Breathe In'); 
  const [scale, setScale] = useState(1);
  const [color, setColor] = useState('rgba(122, 158, 158, 0.4)'); // Teal

  useEffect(() => {
    let timer;
    const breatheCycle = () => {
      setPhase('Inhale (4s)');
      setScale(1.5);
      setColor('rgba(236, 72, 153, 0.6)'); // Soft pink
      timer = setTimeout(() => {
        setPhase('Hold (7s)');
        setColor('rgba(168, 85, 247, 0.5)'); // Deep lotus purple
        timer = setTimeout(() => {
          setPhase('Exhale (8s)');
          setScale(1);
          setColor('rgba(129, 161, 193, 0.6)'); // Blue
          timer = setTimeout(breatheCycle, 8000); 
        }, 7000); 
      }, 4000); 
    };
    breatheCycle();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-pink-500/10 rounded-[3rem] px-6 py-10 sm:px-12 sm:pt-10 sm:pb-16 mt-6 sm:mt-10 max-w-2xl mx-auto flex flex-col items-center w-full overflow-hidden transform-gpu">
      {/* 1. Strict Toolbar Header (Isolated) */}
      <div className="flex items-start justify-start w-full">
        <button onClick={onBack} className="text-slate-400 hover:text-pink-400 font-bold uppercase tracking-widest text-xs transition-colors mb-6 sm:mb-8">
          ← Return
        </button>
      </div>
      
      {/* 2. Isolated Centered Title Contaner */}
      <div className="flex flex-col items-center justify-center text-center w-full pb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-600 tracking-tight">The Blooming Lotus</h2>
        <p className="text-slate-500 mt-4 text-lg font-medium max-w-md">
          Follow the soft expansion of the petals to reset your vagus nerve.
        </p>
      </div>

      {/* Visual Canvas */}
      <div className="relative w-[min(78vw,20rem)] sm:w-[20rem] aspect-square flex items-center justify-center mb-10 transform-gpu mx-auto">
        <div className="absolute inset-0 rounded-full bg-pink-200/30 blur-3xl transform-gpu" style={{ opacity: scale > 1 ? 0.7 : 0.35, transition: 'opacity 4000ms cubic-bezier(0.4, 0, 0.2, 1)' }} />

        {/* Concentric Rings Canvas */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Outer Ring */}
          <div 
            className="absolute rounded-full border-2 border-pink-300/40 transform-gpu will-change-transform"
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${scale > 1 ? 1.0 : 0.5}) translateZ(0)`,
              opacity: scale > 1 ? 0.8 : 0.2,
              transition: 'transform 4000ms cubic-bezier(0.4, 0, 0.2, 1), opacity 4000ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
          
          {/* Middle Ring */}
          <div 
            className="absolute rounded-full border-[3px] border-pink-400/50 transform-gpu will-change-transform"
            style={{
              width: '75%',
              height: '75%',
              transform: `scale(${scale > 1 ? 1.0 : 0.6}) translateZ(0)`,
              opacity: scale > 1 ? 0.9 : 0.3,
              transition: 'transform 4000ms cubic-bezier(0.4, 0, 0.2, 1), opacity 4000ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
          
          {/* Inner Ring */}
          <div 
            className="absolute rounded-full border-4 border-pink-500/60 transform-gpu will-change-transform"
            style={{
              width: '50%',
              height: '50%',
              transform: `scale(${scale > 1 ? 1.0 : 0.7}) translateZ(0)`,
              opacity: scale > 1 ? 1 : 0.4,
              transition: 'transform 4000ms cubic-bezier(0.4, 0, 0.2, 1), opacity 4000ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
          
          {/* Core Pulsing Center */}
          <div 
            className="absolute rounded-full shadow-[0_0_40px_rgba(236,72,153,0.5)] transform-gpu will-change-transform"
            style={{
              width: '25%',
              height: '25%',
              backgroundColor: color,
              transform: `scale(${scale > 1 ? 1.2 : 0.9}) translateZ(0)`,
              transition: 'transform 4000ms cubic-bezier(0.4, 0, 0.2, 1), background-color 4000ms ease-in-out'
            }}
          />
        </div>
      </div>

      {/* Button Phase Centered Below Text & Visual */}
      <div className="w-full flex items-center justify-center transform-gpu">
        <div className="bg-white/80 backdrop-blur-xl border border-white/70 shadow-sm rounded-full px-8 py-4">
          <div className="text-xl font-bold text-slate-700 tracking-wide">{phase}</div>
        </div>
      </div>
    </div>
  );
}

export function GroundingMatrix({ onBack }) {
  const matrixItems = [
    { title: "5", text: "Things you can visibly see" },
    { title: "4", text: "Physical sensations to feel" },
    { title: "3", text: "Sounds you can hear right now" },
    { title: "2", text: "Smells you can detect" },
    { title: "1", text: "Positive safe statement" }
  ];

  const [activeList, setActiveList] = useState([]);

  const toggleItem = (idx) => {
    setActiveList(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[3rem] px-6 py-10 sm:px-12 sm:pt-10 sm:pb-16 mt-6 sm:mt-10 max-w-3xl w-full mx-auto flex flex-col items-center transform-gpu">
      {/* 1. Strict Toolbar Header (Isolated) */}
      <div className="flex items-start justify-start w-full">
        <button onClick={onBack} className="text-slate-400 hover:text-purple-600 font-bold uppercase tracking-widest text-xs transition-colors mb-6 sm:mb-8">
          ← Return
        </button>
      </div>

      {/* 2. Isolated Centered Title Contaner */}
      <div className="flex flex-col items-center justify-center text-center w-full pb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#81A1C1] tracking-tight">The Grounding Matrix</h2>
        <p className="text-slate-500 mt-4 text-lg font-medium max-w-md">
          Click each soft glass to firmly anchor yourself back into reality.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 w-full max-w-xl">
        {matrixItems.map((item, idx) => {
          const isPressed = activeList.includes(idx);
          return (
            <button 
              key={idx}
              onClick={() => toggleItem(idx)}
              className={`w-full text-left p-6 rounded-2xl flex items-center gap-6 transition-all duration-300 ease-out cursor-pointer border transform-gpu will-change-transform ${isPressed ? 'bg-white/40 border-white/30 shadow-inner scale-100' : 'bg-white/80 border-white shadow-sm hover:shadow-md hover:scale-[1.02]'}`}
            >
              <div className={`text-4xl font-extrabold transition-colors duration-300 w-12 text-center ${isPressed ? 'text-[#A3BE8C]' : 'text-slate-300'}`}>
                {item.title}
              </div>
              <div className={`text-xl font-bold transition-colors duration-300 ${isPressed ? 'text-slate-800' : 'text-slate-500'}`}>
                {item.text}
              </div>
              {isPressed && <span className="ml-auto text-[#A3BE8C] font-extrabold text-xl">✓ Done</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LetGoBox({ onBack }) {
  const [text, setText] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);

  const handleRelease = () => {
    if (!text.trim()) return;
    setIsReleasing(true);
    setTimeout(() => {
      setText('');
      setIsReleasing(false);
    }, 1000); 
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[3rem] px-6 py-10 sm:px-12 sm:pt-10 sm:pb-16 mt-6 sm:mt-10 max-w-2xl w-full mx-auto flex flex-col items-center transform-gpu">
      {/* 1. Strict Toolbar Header (Isolated) */}
      <div className="flex items-start justify-start w-full">
        <button onClick={onBack} className="text-slate-400 hover:text-pink-600 font-bold uppercase tracking-widest text-xs transition-colors mb-6 sm:mb-8">
          ← Return
        </button>
      </div>

      {/* 2. Isolated Centered Title Contaner */}
      <div className="flex flex-col items-center justify-center text-center w-full pb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#B48EAD] tracking-tight">The "Let Go" Box</h2>
        <p className="text-slate-500 mt-4 text-center max-w-md mx-auto text-lg font-medium leading-relaxed">
          Write down a heavy thought. Click release, and watch it dissolve from your system permanently. (None of this is saved).
        </p>
      </div>
      
      <div className="w-full mb-10 overflow-hidden rounded-[2rem] bg-white/50 max-w-xl">
        <textarea 
          style={{
            opacity: isReleasing ? 0 : 1,
            transform: isReleasing ? 'translate3d(0, -20px, 0)' : 'translate3d(0, 0, 0)',
          }}
          className={`w-full h-48 p-8 text-slate-700 bg-transparent border border-white/60 placeholder-slate-400 shadow-inner focus:ring-2 focus:ring-purple-300 outline-none resize-none transition-all duration-300 ease-out text-lg font-medium transform-gpu will-change-transform`}
          placeholder="I have been carrying..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isReleasing}
        />
      </div>

      <button 
        onClick={handleRelease}
        disabled={!text.trim() || isReleasing}
        className="bg-purple-500 hover:bg-purple-600 text-white px-16 py-5 rounded-full font-extrabold text-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 transform-gpu will-change-transform"
      >
        {isReleasing ? 'Evaporating...' : 'Release'}
      </button>
    </div>
  );
}
