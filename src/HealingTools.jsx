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
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-pink-500/10 rounded-[3rem] p-6 sm:p-12 mt-6 sm:mt-10 text-center relative max-w-2xl mx-auto flex flex-col items-center w-full overflow-hidden">
      <button onClick={onBack} className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20 text-slate-400 hover:text-pink-400 font-bold uppercase tracking-widest text-xs transition-colors">
        ← Return
      </button>
      <h2 className="text-3xl font-extrabold mb-4 text-pink-600 tracking-tight">The Blooming Lotus</h2>
      <p className="text-slate-500 mb-10 sm:mb-14 font-medium max-w-md">Follow the soft expansion of the petals to reset your vagus nerve.</p>

      <div className="relative w-[min(78vw,18rem)] sm:w-[18rem] aspect-square flex items-center justify-center mb-8 sm:mb-10">
        <div className="absolute inset-0 rounded-full bg-pink-200/30 blur-3xl" style={{ opacity: scale > 1 ? 0.7 : 0.35 }} />

        <svg
          viewBox="0 0 400 400"
          className="relative w-full h-full drop-shadow-[0_16px_35px_rgba(236,72,153,0.16)]"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="lotusCore" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
              <stop offset="55%" stopColor="rgba(253,242,248,0.95)" />
              <stop offset="100%" stopColor="rgba(244,114,182,0.25)" />
            </radialGradient>
            <linearGradient id="petalFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(253,242,248,0.98)" />
              <stop offset="55%" stopColor="rgba(244,114,182,0.8)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.34)" />
            </linearGradient>
            <linearGradient id="petalBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="55%" stopColor="rgba(251,207,232,0.72)" />
              <stop offset="100%" stopColor="rgba(196,181,253,0.28)" />
            </linearGradient>
          </defs>

          <g
            transform={`translate(200 200) scale(${scale > 1 ? 1.04 : 0.98})`}
            style={{ transition: 'transform 4000ms ease-in-out' }}
          >
            {[...Array(8)].map((_, i) => (
              <g key={`outer-${i}`} transform={`rotate(${i * 45})`}>
                <path
                  d="M0,-146 C34,-126 44,-68 0,-16 C-44,-68 -34,-126 0,-146 Z"
                  fill="url(#petalBack)"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="2"
                  style={{
                    transformOrigin: 'center',
                    transformBox: 'fill-box',
                    transform: `translateY(${scale > 1 ? -2 : 10}px) scale(${scale > 1 ? 1 : 0.92})`,
                    opacity: scale > 1 ? 0.96 : 0.72,
                    transition: 'transform 4000ms ease-in-out, opacity 4000ms ease-in-out'
                  }}
                />
              </g>
            ))}

            {[...Array(8)].map((_, i) => (
              <g key={`inner-${i}`} transform={`rotate(${i * 45 + 22.5})`}>
                <path
                  d="M0,-112 C26,-98 34,-52 0,-10 C-34,-52 -26,-98 0,-112 Z"
                  fill="url(#petalFront)"
                  stroke="rgba(255,255,255,0.92)"
                  strokeWidth="1.5"
                  style={{
                    transformOrigin: 'center',
                    transformBox: 'fill-box',
                    transform: `translateY(${scale > 1 ? -2 : 14}px) scale(${scale > 1 ? 1.02 : 0.9})`,
                    opacity: scale > 1 ? 1 : 0.78,
                    transition: 'transform 4000ms ease-in-out, opacity 4000ms ease-in-out'
                  }}
                />
              </g>
            ))}

            <circle
              r="58"
              fill="url(#lotusCore)"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="4"
              style={{
                transform: `scale(${scale > 1 ? 1.08 : 0.96})`,
                transformOrigin: 'center',
                transition: 'transform 4000ms ease-in-out'
              }}
            />
            <circle
              r="30"
              fill={color}
              style={{ filter: 'blur(6px)', opacity: 0.72 }}
            />
          </g>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_0_34px_rgba(236,72,153,0.2)] rounded-full px-5 py-3 sm:px-6 sm:py-4">
            <div className="text-sm sm:text-xl font-black text-pink-700 tracking-wide">{phase}</div>
          </div>
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
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[3rem] p-6 sm:p-10 mt-6 sm:mt-10 max-w-3xl w-full mx-auto relative">
      <button onClick={onBack} className="absolute top-6 left-6 sm:top-8 sm:left-8 text-slate-400 hover:text-purple-600 font-bold uppercase tracking-widest text-xs transition-colors">
        ← Return
      </button>
      <h2 className="text-3xl font-extrabold mb-4 text-[#81A1C1] tracking-tight text-center">The Grounding Matrix</h2>
      <p className="text-slate-500 text-center mb-12 text-lg font-medium">Click each soft glass to firmly anchor yourself back into reality.</p>
      
      <div className="grid grid-cols-1 gap-6">
        {matrixItems.map((item, idx) => {
          const isPressed = activeList.includes(idx);
          return (
            <button 
              key={idx}
              onClick={() => toggleItem(idx)}
              className={`w-full text-left p-6 rounded-2xl flex items-center gap-6 transition-all duration-300 ease-out cursor-pointer border ${isPressed ? 'bg-white/40 border-white/30 shadow-inner' : 'bg-white/80 border-white shadow-sm hover:shadow-md hover:-translate-y-1'}`}
            >
              <div className={`text-4xl font-extrabold transition-colors duration-300 w-12 text-center ${isPressed ? 'text-[#A3BE8C]' : 'text-slate-300'}`}>
                {item.title}
              </div>
              <div className={`text-xl font-bold transition-colors duration-300 ${isPressed ? 'text-slate-800' : 'text-slate-500'}`}>
                {item.text}
              </div>
              {isPressed && <span className="ml-auto text-[#A3BE8C] font-extrabold text-xl animate-pulse">✓ Done</span>}
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
    }, 4000); 
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[3rem] p-6 sm:p-12 mt-6 sm:mt-10 text-center max-w-2xl w-full mx-auto relative flex flex-col items-center">
      <button onClick={onBack} className="absolute top-6 left-6 sm:top-8 sm:left-8 text-slate-400 hover:text-pink-600 font-bold uppercase tracking-widest text-xs transition-colors">
        ← Return
      </button>
      <h2 className="text-3xl font-extrabold mb-4 text-[#B48EAD] tracking-tight">The "Let Go" Box</h2>
      <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg font-medium leading-relaxed">
        Write down a heavy thought. Click release, and watch it dissolve from your system permanently. (None of this is saved).
      </p>
      
      <div className="w-full relative mb-10">
        <textarea 
          style={{
            transform: isReleasing ? 'translateY(-60px) scale(0.9)' : 'translateY(0) scale(1)',
            opacity: isReleasing ? 0 : 1,
            filter: isReleasing ? 'blur(20px)' : 'blur(0)',
          }}
          className={`w-full h-48 p-8 text-slate-700 bg-white/50 backdrop-blur-sm border border-white/60 placeholder-slate-400 rounded-[2rem] shadow-inner focus:ring-2 focus:ring-purple-300 outline-none resize-none transition-all duration-[4000ms] ease-in-out text-lg font-medium`}
          placeholder="I have been carrying..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isReleasing}
        />
      </div>

      <button 
        onClick={handleRelease}
        disabled={!text.trim() || isReleasing}
        className="bg-purple-500 hover:bg-purple-600 text-white px-16 py-5 rounded-full font-extrabold text-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isReleasing ? 'Evaporating...' : 'Release'}
      </button>
    </div>
  );
}
