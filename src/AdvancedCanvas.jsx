import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOTIONAL_THEMES = [
  {
    id: 'storm',
    title: 'The Swirling Storm',
    subtitle: 'For venting anger, anxiety, or internal chaos.',
    emoji: '🌪️',
    gradient: 'from-slate-900 via-rose-950 to-slate-950',
    description: 'A dark, turbulent canvas primed to carry your heaviest somatic friction.'
  },
  {
    id: 'void',
    title: 'The Cold Void',
    subtitle: 'For expressing numbness, grief, or exhaustion.',
    emoji: '🧊',
    gradient: 'from-slate-950 via-indigo-950 to-slate-900',
    description: 'A quiet, deep space to lay down heavy sorrow, numbness, or disconnect.'
  },
  {
    id: 'harbor',
    title: 'The Safe Harbor',
    subtitle: 'For grounding, restoration, or finding safety.',
    emoji: '🌅',
    gradient: 'from-slate-950 via-teal-950 to-emerald-950',
    description: 'A warm, protective sanctuary designed to nurture calm breathing and integration.'
  },
  {
    id: 'blank',
    title: 'Free Slate',
    subtitle: 'A clean canvas for raw, unfiltered self-reflection.',
    emoji: '🎨',
    gradient: 'from-slate-900 via-slate-850 to-slate-950',
    description: 'An open, boundless surface to paint whatever you are holding inside today.'
  }
];

const EMOTIONAL_COLORS = [
  { id: 'anger', name: 'Rage / Friction', hex: '#f43f5e', icon: '🔥' },
  { id: 'fidget', name: 'Restless / Buzzing', hex: '#f97316', icon: '⚡' },
  { id: 'hope', name: 'Joy / Presence', hex: '#eab308', icon: '✨' },
  { id: 'safety', name: 'Calm / Grounded', hex: '#10b981', icon: '🌿' },
  { id: 'sorrow', name: 'Grief / Sorrow', hex: '#3b82f6', icon: '💧' },
  { id: 'fear', name: 'Fear / Agitation', hex: '#8b5cf6', icon: '👁️' },
  { id: 'numb', name: 'Numb / Void', hex: '#64748b', icon: '🌫️' }
];

const BRUSH_TYPES = [
  { id: 'standard', name: 'Fluid Paint', emoji: '🖌️', desc: 'Smooth, responsive continuous paint stroke.' },
  { id: 'spray', name: 'Distressed Spray', emoji: '💨', desc: 'Grainy, textured spray representing tension.' },
  { id: 'aura', name: 'Aura Mist', emoji: '✨', desc: 'Soft-edge glowing airbrush representing floaty feelings.' },
  { id: 'caligraphy', name: 'Calligraphy Ink', emoji: '✒️', desc: 'Sharp, elegant tapered strokes.' }
];

export default function AdvancedCanvas({ onBack, onNavigateTool }) {
  const [page, setPage] = useState('setup'); // 'setup' | 'canvas' | 'analysis'
  const [selectedTheme, setSelectedTheme] = useState(EMOTIONAL_THEMES[3]); // Default 'Free Slate'
  
  // Drawing Engine States
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(EMOTIONAL_COLORS[0]); // Default Rage Red
  const [brushType, setBrushType] = useState('standard');
  const [brushWidth, setBrushWidth] = useState(16);
  const [brushOpacity, setBrushOpacity] = useState(0.85);

  // Undo/Redo stack buffers
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Analytics Logs
  const [telemetry, setTelemetry] = useState({
    strokeCount: 0,
    colorCounts: {},
    brushSelectionCounts: {},
    themeSelected: ''
  });

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prev => [...prev, state]);
    // Clear redo stack on new action
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Save current state to redo
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setRedoStack(prev => [...prev, currentState]);

    // Retrieve previous state
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    ctx.putImageData(previousState, 0, 0);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));

    // Save current to undo
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prev => [...prev, currentState]);

    ctx.putImageData(nextState, 0, 0);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Capture state for undo before clearing
    saveCanvasState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Merge drawing canvas with theme background for export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');

    // Create background gradient matching chosen theme
    const grad = exportCtx.createLinearGradient(0, 0, 0, canvas.height);
    if (selectedTheme.id === 'storm') {
      grad.addColorStop(0, '#0f172a'); grad.addColorStop(0.5, '#450a0a'); grad.addColorStop(1, '#020617');
    } else if (selectedTheme.id === 'void') {
      grad.addColorStop(0, '#020617'); grad.addColorStop(0.5, '#1e1b4b'); grad.addColorStop(1, '#0f172a');
    } else if (selectedTheme.id === 'harbor') {
      grad.addColorStop(0, '#020617'); grad.addColorStop(0.5, '#042f2e'); grad.addColorStop(1, '#022c22');
    } else {
      grad.addColorStop(0, '#0f172a'); grad.addColorStop(0.5, '#1e293b'); grad.addColorStop(1, '#0f172a');
    }
    
    exportCtx.fillStyle = grad;
    exportCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw content on top
    exportCtx.drawImage(canvas, 0, 0);
    
    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `unkahi-feeling-canvas-${selectedTheme.id}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Initialize canvas drawing settings when page changes to canvas
  useEffect(() => {
    if (page !== 'canvas') return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [page]);

  const startDrawing = (e) => {
    saveCanvasState();
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);

    // Telemetry updates
    setTelemetry(prev => {
      const nextColors = { ...prev.colorCounts };
      nextColors[color.id] = (nextColors[color.id] || 0) + 1;
      const nextBrushes = { ...prev.brushSelectionCounts };
      nextBrushes[brushType] = (nextBrushes[brushType] || 0) + 1;

      return {
        ...prev,
        strokeCount: prev.strokeCount + 1,
        colorCounts: nextColors,
        brushSelectionCounts: nextBrushes
      };
    });
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Configure Context Colors & Transparency
    ctx.strokeStyle = color.hex;
    ctx.fillStyle = color.hex;
    ctx.globalAlpha = brushOpacity;

    if (brushType === 'standard') {
      ctx.lineWidth = brushWidth;
      ctx.shadowBlur = 0;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    } else if (brushType === 'spray') {
      // Distressed Spray paint rendering
      const density = 40;
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * brushWidth;
        const sprayX = offsetX + Math.cos(angle) * radius;
        const sprayY = offsetY + Math.sin(angle) * radius;
        ctx.fillRect(sprayX, sprayY, 1.5, 1.5);
      }
    } else if (brushType === 'aura') {
      // Glowing aura airbrush
      ctx.lineWidth = brushWidth;
      ctx.shadowBlur = brushWidth / 1.5;
      ctx.shadowColor = color.hex;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    } else if (brushType === 'caligraphy') {
      // Sleek tapered calligraphic style
      ctx.lineWidth = brushWidth * 0.8;
      ctx.shadowBlur = 0;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      // Side stroke offset for ink feel
      ctx.beginPath();
      ctx.moveTo(offsetX + 2, offsetY + 2);
      ctx.lineWidth = brushWidth * 0.2;
      ctx.lineTo(offsetX + 2, offsetY + 2);
      ctx.stroke();
    }
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

  // Perform stroke analysis based on polyvagal colors
  const compileAnalysis = () => {
    const totalStrokes = telemetry.strokeCount || 1;
    let highMobilization = 0; // anger, fear, fidget
    let lowMobilization = 0;  // numbness, sorrow
    let safetyGrounded = 0;   // calm, joy/hope

    Object.keys(telemetry.colorCounts).forEach(cid => {
      const count = telemetry.colorCounts[cid];
      if (['anger', 'fear', 'fidget'].includes(cid)) {
        highMobilization += count;
      } else if (['sorrow', 'numb'].includes(cid)) {
        lowMobilization += count;
      } else if (['safety', 'hope'].includes(cid)) {
        safetyGrounded += count;
      }
    });

    const highPct = Math.round((highMobilization / totalStrokes) * 100);
    const lowPct = Math.round((lowMobilization / totalStrokes) * 100);
    const safePct = Math.round((safetyGrounded / totalStrokes) * 100);

    let profile = {
      state: 'Mixed Somatic Integration',
      description: 'Your expressive strokes reflect a complex balance of different nervous system states. You are holding both mobilization and grounding at the same time.',
      emoji: '⚖️',
      suggestedToolId: 'somatic',
      suggestedToolName: 'Somatic Healer',
      themeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    };

    if (highPct > 45) {
      profile = {
        state: 'High Somatic Mobilization (Fight / Flight)',
        description: 'Your paint strokes reflect deep internal friction, rapid physical speed, or high cognitive agitation. Your sympathetic system is actively scanning for release.',
        emoji: '🔥',
        suggestedToolId: 'breathe',
        suggestedToolName: 'Blooming Lotus Breathing',
        themeColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
      };
    } else if (lowPct > 45) {
      profile = {
        state: 'Somatic Withdrawal (Freeze / Shutdown)',
        description: 'Your strokes are slow, soft, or heavy with dark hues. This reflects somatic conservation where the body shuts down to buffer against overwhelm.',
        emoji: '🧊',
        suggestedToolId: 'ground',
        suggestedToolName: 'Grounding Matrix',
        themeColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
      };
    } else if (safePct > 45) {
      profile = {
        state: 'Social Engagement & Grounded Integration',
        description: 'Your canvas is filled with soothing greens and hopeful golds, reflecting safe integration and calming somatic rhythms. Your nervous system is signaling rest and digest.',
        emoji: '🌿',
        suggestedToolId: 'letgo',
        suggestedToolName: 'Let Go Box',
        themeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      };
    }

    return {
      highPct,
      lowPct,
      safePct,
      ...profile
    };
  };

  const results = compileAnalysis();

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[550px] flex flex-col relative z-10">
      
      {/* 1. SETUP PAGE */}
      {page === 'setup' && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8 md:p-12 text-center w-full flex flex-col items-center flex-grow transition-all duration-300">
          <button 
            onClick={onBack} 
            className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-xs transition-colors"
          >
            ← Back
          </button>
          
          <div className="text-center mb-10 mt-4">
            <span className="text-5xl block mb-4 animate-bounce">🎨</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Feeling Canvas</h2>
            <p className="text-slate-500 font-medium text-sm max-w-md mx-auto">
              Welcome to your somatic canvas. Select an emotional frame backdrop below to begin expressing what words cannot carry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10 max-w-3xl">
            {EMOTIONAL_THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`p-6 rounded-[2rem] border text-left flex flex-col transition-all duration-300 group ${selectedTheme.id === theme.id ? 'bg-slate-900 border-slate-800 text-white shadow-xl scale-[1.02]' : 'bg-white hover:bg-slate-50 border-slate-200/60 shadow-sm'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{theme.emoji}</span>
                  <span className="font-extrabold text-lg">{theme.title}</span>
                </div>
                <p className={`text-xs leading-relaxed ${selectedTheme.id === theme.id ? 'text-slate-300' : 'text-slate-500'}`}>
                  {theme.subtitle}
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={() => { setPage('canvas'); setTelemetry(prev => ({ ...prev, themeSelected: selectedTheme.title })); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 font-black rounded-full text-lg shadow-md hover:-translate-y-0.5 transition-all w-full max-w-sm mt-auto"
          >
            Enter Expression Canvas →
          </button>
        </div>
      )}

      {/* 2. THE ART CANVAS PAGE */}
      {page === 'canvas' && (
        <div className="bg-slate-950/95 backdrop-blur-2xl border border-slate-800 shadow-2xl rounded-[2.5rem] w-full flex flex-col overflow-hidden flex-grow relative min-h-[500px] md:min-h-[650px] transition-all duration-300 mb-16 md:mb-0">
          
          {/* Header Row */}
          <div className="flex justify-between items-center bg-slate-900/60 border-b border-slate-800 p-3 sm:p-4 px-4 sm:px-6 relative z-30">
            <div className="flex items-center gap-1.5 min-w-0">
              <button 
                onClick={() => setPage('setup')}
                className="text-slate-400 hover:text-slate-200 font-bold uppercase tracking-widest text-[9px] sm:text-xs transition-colors flex items-center gap-0.5"
              >
                <span>←</span><span className="hidden sm:inline">Back</span>
              </button>
              <div className="h-3.5 w-px bg-slate-800" />
              <span className="text-[9px] sm:text-xs font-black text-slate-300 uppercase tracking-widest truncate max-w-[75px] sm:max-w-none">{selectedTheme.title}</span>
            </div>
            
            <div className="flex gap-1.5 flex-shrink-0">
              <button 
                onClick={handleUndo} 
                disabled={undoStack.length === 0}
                className="p-1 px-2 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-30"
              >
                Undo
              </button>
              <button 
                onClick={handleRedo} 
                disabled={redoStack.length === 0}
                className="p-1 px-2 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-30"
              >
                Redo
              </button>
              <button 
                onClick={handleClear} 
                className="p-1 px-2 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-rose-950/30 border border-rose-900/50 text-rose-300 rounded-xl hover:bg-rose-900/40 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
 
          <div className="flex flex-col md:flex-row flex-grow w-full relative min-h-0 min-w-0">
            
            {/* Draw Area */}
            <div className={`flex-grow relative h-[250px] sm:h-[320px] md:h-auto min-h-0 bg-gradient-to-b ${selectedTheme.gradient} touch-none overflow-hidden`}>
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
              />
            </div>

            {/* Advanced Tool Controls Sidebar */}
            <div className="w-full md:w-64 bg-slate-900/80 border-t md:border-t-0 md:border-l border-slate-800 p-5 flex flex-col justify-start gap-5 relative z-20 flex-shrink-0 max-h-[300px] md:max-h-none overflow-y-auto scrollbar-none">
              
              {/* Brushes */}
              <div>
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Brush Tool</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {BRUSH_TYPES.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setBrushType(b.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold text-left flex items-center gap-2 transition-all ${brushType === b.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20' : 'bg-slate-950/50 border-slate-850 text-slate-400 hover:text-slate-200'}`}
                      title={b.desc}
                    >
                      <span>{b.emoji}</span>
                      <span className="truncate">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity & Width Sliders */}
              <div className="space-y-3.5 border-t border-slate-800/60 pt-3.5">
                <div>
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    <span>Brush Width</span>
                    <span className="text-slate-400 font-bold">{brushWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="60"
                    value={brushWidth}
                    onChange={e => setBrushWidth(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-950 h-1 rounded-full appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    <span>Opacity</span>
                    <span className="text-slate-400 font-bold">{Math.round(brushOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={brushOpacity}
                    onChange={e => setBrushOpacity(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-950 h-1 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Palette */}
              <div className="border-t border-slate-800/60 pt-3.5">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Emotional Spectrum</span>
                <div className="grid grid-cols-4 gap-2">
                  {EMOTIONAL_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setColor(c)}
                      className={`h-11 w-full rounded-xl border-2 flex items-center justify-center text-sm shadow-sm hover:scale-105 transition-transform ${color.id === c.id ? 'border-indigo-400 ring-2 ring-indigo-500/10 scale-105' : 'border-slate-800'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      <span>{c.icon}</span>
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-slate-400 font-bold mt-2.5 text-center bg-slate-950/60 py-1.5 rounded-lg border border-slate-850">
                  Active: <span className="text-indigo-400 font-black">{color.name}</span>
                </div>
              </div>

              {/* Submit / Finish */}
              <div className="mt-auto border-t border-slate-800/60 pt-4 flex flex-col gap-2">
                <button
                  onClick={() => setPage('analysis')}
                  disabled={telemetry.strokeCount < 3}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  🔮 Analyze Telemetry
                </button>
                <button
                  onClick={handleExport}
                  className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  📥 Export Canvas
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. ANALYSIS PAGE */}
      {page === 'analysis' && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8 md:p-12 text-center w-full flex flex-col items-center flex-grow transition-all duration-300">
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-3xl">🔮</span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-500 text-left">Somatic Stroke Telemetry</p>
              <h2 className="text-2xl font-black text-slate-800 leading-tight">Polyvagal Canvas Feedback</h2>
            </div>
          </div>

          <div className="max-w-xl mx-auto w-full space-y-6 mb-10">
            {/* Somatic Profile Card */}
            <div className={`p-6 rounded-3xl border text-left ${results.themeColor} shadow-md`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{results.emoji}</span>
                <h4 className="text-lg font-black">{results.state}</h4>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                {results.description}
              </p>
            </div>

            {/* Spectrum charts */}
            <div className="bg-white/70 border border-slate-100 p-6 rounded-3xl text-left space-y-4 shadow-sm">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Somatic Energy Ratios</span>
              
              {/* High mobilization bar */}
              <div>
                <div className="flex justify-between text-xs font-black mb-1.5">
                  <span className="text-rose-600 flex items-center gap-1">🔥 Sympathetic Agitation (Red/Orange/Violet)</span>
                  <span className="text-slate-600">{results.highPct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: `${results.highPct}%` }} />
                </div>
              </div>

              {/* Low mobilization bar */}
              <div>
                <div className="flex justify-between text-xs font-black mb-1.5">
                  <span className="text-indigo-600 flex items-center gap-1">❄️ Conservation Shutdown (Blue/Gray)</span>
                  <span className="text-slate-600">{results.lowPct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${results.lowPct}%` }} />
                </div>
              </div>

              {/* Grounded bar */}
              <div>
                <div className="flex justify-between text-xs font-black mb-1.5">
                  <span className="text-emerald-600 flex items-center gap-1">🌿 Safe Integration (Green/Gold)</span>
                  <span className="text-slate-600">{results.safePct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${results.safePct}%` }} />
                </div>
              </div>
            </div>
            
            {/* Suggested Triage tool trigger */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-5 text-center flex flex-col items-center shadow-inner">
              <span className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1.5">Matched Triage Regulation</span>
              <p className="text-xs text-slate-500 mb-4 max-w-sm">Based on your paint speed, style, and telemetry, your nervous system would benefit from this regulation exercise now:</p>
              <button
                onClick={() => onNavigateTool(results.suggestedToolId)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3 px-8 rounded-full shadow-md hover:scale-102 transition-all flex items-center gap-2"
              >
                <span>🚀</span> Begin {results.suggestedToolName}
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-400 font-bold italic">
              *Note: Somatic brush telemetry translations are intended for peer-coping reflections and self-knowledge, not clinical diagnostics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <button
              onClick={() => { setPage('canvas'); setUndoStack([]); setRedoStack([]); }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-8 py-3 rounded-full text-xs uppercase tracking-wider transition-all"
            >
              🔄 Paint Again
            </button>
            <button
              onClick={onBack}
              className="bg-slate-800 hover:bg-slate-700 text-white font-black px-10 py-3.5 rounded-full text-xs uppercase tracking-widest shadow-md transition-all"
            >
              Finish Session
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
