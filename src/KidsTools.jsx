import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Breathing Balloon ---
export function BreathingBalloon({ onBack }) {
  const [phase, setPhase] = useState('ready'); // ready, in, hold1, out, hold2
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    let timer;
    const runCycle = () => {
      setPhase('in');
      timer = setTimeout(() => {
        setPhase('hold1');
        timer = setTimeout(() => {
          setPhase('out');
          timer = setTimeout(() => {
            setPhase('hold2');
            timer = setTimeout(runCycle, 4000);
          }, 4000);
        }, 4000);
      }, 4000);
    };

    runCycle();
    return () => clearTimeout(timer);
  }, [isActive]);

  const getInstructions = () => {
    switch(phase) {
      case 'in': return 'Breathe in... fill the balloon!';
      case 'hold1': return 'Hold it... keep it full!';
      case 'out': return 'Breathe out... let the air out.';
      case 'hold2': return 'Hold... wait for the next breath.';
      default: return 'Ready to breathe?';
    }
  };

  const getScale = () => {
    switch(phase) {
      case 'in': return 1.5;
      case 'hold1': return 1.5;
      case 'out': return 0.8;
      case 'hold2': return 0.8;
      default: return 1;
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-3xl font-black text-teal-600 mb-2">Breathing Balloon</h2>
      <p className="text-slate-500 font-bold mb-12">Let's blow up the balloon together!</p>

      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        <motion.div 
          animate={{ scale: getScale() }}
          transition={{ duration: phase === 'hold1' || phase === 'hold2' ? 0 : 4, ease: "easeInOut" }}
          className="text-9xl relative z-10"
        >
          🎈
        </motion.div>
        
        {/* Glow effect */}
        <motion.div 
          animate={{ scale: getScale(), opacity: isActive ? 0.3 : 0 }}
          transition={{ duration: phase.includes('hold') ? 0 : 4, ease: "easeInOut" }}
          className="absolute inset-0 bg-teal-300 rounded-full blur-3xl"
        />
      </div>

      <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-6 w-full max-w-sm text-center mb-8 h-24 flex items-center justify-center">
        <h3 className="text-xl font-bold text-teal-700">{getInstructions()}</h3>
      </div>

      <button 
        onClick={() => setIsActive(!isActive)}
        className={`${isActive ? 'bg-rose-400 hover:bg-rose-500' : 'bg-teal-400 hover:bg-teal-500'} text-white px-12 py-4 rounded-full font-black text-xl shadow-md hover:-translate-y-1 transition-all`}
      >
        {isActive ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}

// --- Worry Monster ---
export function WorryMonster({ onBack }) {
  const [worry, setWorry] = useState('');
  const [state, setState] = useState('idle'); // idle, eating, burping

  const feedMonster = () => {
    if (!worry.trim()) return;
    setState('eating');
    
    setTimeout(() => {
      setWorry('');
      setState('burping');
      
      setTimeout(() => {
        setState('idle');
      }, 3000);
    }, 1500); // Eating duration
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-3xl font-black text-indigo-600 mb-2">Worry Monster</h2>
      <p className="text-slate-500 font-bold mb-8">Type your worry, and I will eat it!</p>

      <div className="relative w-full max-w-md bg-indigo-50 border-4 border-indigo-100 p-6 rounded-3xl mb-8 flex flex-col items-center overflow-hidden">
        
        <AnimatePresence>
          {state === 'eating' && (
            <motion.div
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ y: 150, opacity: 0, scale: 0.2, rotate: 180 }}
              transition={{ duration: 1 }}
              className="absolute z-20 text-indigo-800 font-bold text-center w-3/4 bg-white p-3 rounded-lg shadow-md border border-indigo-200"
            >
              {worry}
            </motion.div>
          )}
        </AnimatePresence>

        <textarea 
          value={worry}
          onChange={(e) => setWorry(e.target.value)}
          placeholder="I'm worried about..."
          disabled={state !== 'idle'}
          className={`w-full h-32 p-4 rounded-xl resize-none text-slate-700 font-bold bg-white border-2 border-indigo-200 focus:outline-none focus:border-indigo-400 transition-all ${state !== 'idle' ? 'opacity-0' : 'opacity-100'}`}
        />

        <div className="mt-8 relative h-40 w-40 flex items-center justify-center">
          <motion.div 
            animate={{ 
              scale: state === 'eating' ? [1, 1.2, 0.9, 1.1, 1] : state === 'burping' ? [1, 1.3, 1] : 1,
              rotate: state === 'eating' ? [0, -10, 10, -5, 5, 0] : 0
            }}
            transition={{ duration: state === 'eating' ? 1.5 : 0.5 }}
            className="text-8xl relative z-10"
          >
            {state === 'idle' ? '👾' : state === 'eating' ? '👹' : '😋'}
          </motion.div>
          
          <AnimatePresence>
            {state === 'burping' && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: -40, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 right-0 bg-white px-3 py-1 rounded-full text-sm font-black text-indigo-500 shadow-md border-2 border-indigo-100 z-20"
              >
                *BURP!* Yummy!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button 
        onClick={feedMonster}
        disabled={!worry.trim() || state !== 'idle'}
        className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-12 py-4 rounded-full font-black text-xl shadow-md hover:-translate-y-1 transition-all"
      >
        Feed the Monster!
      </button>
    </div>
  );
}

// --- Feelings Canvas ---
export function FeelingsCanvas({ onBack }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ef4444'); // Default red

  const colors = [
    { name: 'Angry (Red)', hex: '#ef4444' },
    { name: 'Sad (Blue)', hex: '#3b82f6' },
    { name: 'Worried (Yellow)', hex: '#eab308' },
    { name: 'Scared (Purple)', hex: '#a855f7' },
    { name: 'Calm (Green)', hex: '#22c55e' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineWidth = 15; // Thick, playful lines
    }
  }, []);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const getCoordinates = (event) => {
    if (!canvasRef.current) return { offsetX: 0, offsetY: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if (event.touches && event.touches.length > 0) {
      return {
        offsetX: event.touches[0].clientX - rect.left,
        offsetY: event.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: event.nativeEvent.offsetX,
      offsetY: event.nativeEvent.offsetY
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-3xl font-black text-pink-600 mb-2">Feelings Canvas</h2>
      <p className="text-slate-500 font-bold mb-6">Pick a feeling and scribble it out!</p>

      {/* Color Palette */}
      <div className="flex flex-wrap justify-center gap-3 mb-6 w-full max-w-md">
        {colors.map((c) => (
          <button
            key={c.hex}
            onClick={() => setColor(c.hex)}
            className={`h-12 w-12 rounded-full border-4 shadow-sm hover:scale-110 transition-transform ${color === c.hex ? 'border-slate-800 scale-110' : 'border-white'}`}
            style={{ backgroundColor: c.hex }}
            title={c.name}
          />
        ))}
      </div>

      <div className="w-full max-w-lg h-64 bg-white border-4 border-slate-200 rounded-3xl overflow-hidden shadow-inner mb-6 touch-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>

      <button 
        onClick={clearCanvas}
        className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-black text-lg shadow-md hover:-translate-y-1 transition-all flex items-center gap-2"
      >
        <span>🧼</span> Wash it away
      </button>
    </div>
  );
}
