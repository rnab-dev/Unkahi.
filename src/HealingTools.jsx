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
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-pink-500/10 rounded-[3rem] p-6 sm:p-12 mt-6 sm:mt-10 text-center relative max-w-2xl mx-auto flex flex-col items-center w-full">
      <button onClick={onBack} className="absolute top-6 left-6 sm:top-8 sm:left-8 text-slate-400 hover:text-pink-400 font-bold uppercase tracking-widest text-xs transition-colors">
        ← Return
      </button>
      <h2 className="text-3xl font-extrabold mb-4 text-pink-600 tracking-tight">The Blooming Lotus</h2>
      <p className="text-slate-500 mb-20 font-medium">Follow the soft expansion of the petals to reset your vagus nerve.</p>

      <div className="relative h-64 w-64 flex items-center justify-center mb-10">
        
        {/* The Petals */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-gradient-to-t from-pink-300 to-white/40 border border-white/60 shadow-lg shadow-pink-300/20 backdrop-blur-sm transition-all duration-[4000ms] ease-in-out"
              style={{
                width: '60px',
                height: '140px',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                transformOrigin: 'bottom center',
                transform: `rotate(${i * 45}deg) translateY(-50%) scaleY(${scale}) scaleX(${scale * 0.8}) rotateX(${scale > 1 ? 40 : 0}deg)`,
                opacity: scale > 1 ? 0.9 : 0.4,
                zIndex: 5
              }}
            />
          ))}
          {/* Inner Petals */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i + 8}
              className="absolute bg-gradient-to-t from-purple-300 to-pink-100/60 border border-white/40 shadow-md backdrop-blur-md transition-all duration-[4000ms] ease-in-out"
              style={{
                width: '45px',
                height: '110px',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                transformOrigin: 'bottom center',
                transform: `rotate(${i * 45 + 22.5}deg) translateY(-40%) scaleY(${scale * 0.9}) scaleX(${scale * 0.7}) rotateX(${scale > 1 ? 20 : 0}deg)`,
                opacity: scale > 1 ? 1 : 0.5,
                zIndex: 6
              }}
            />
          ))}
        </div>

        {/* Lotus Core / Center Glow */}
        <div 
          className="absolute w-28 h-28 rounded-full transition-all duration-[4000ms] ease-in-out flex items-center justify-center z-10 bg-white/80 backdrop-blur-xl border-4 border-white shadow-[0_0_40px_rgba(244,114,182,0.8)]"
          style={{ transform: `scale(${scale * 0.8})` }}
        >
          <div className="absolute inset-0 rounded-full animate-pulse opacity-50" style={{ backgroundColor: color, filter: 'blur(10px)' }}></div>
          <div className="text-xl font-black text-pink-700 tracking-wide z-20 drop-shadow-sm">{phase}</div>
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
