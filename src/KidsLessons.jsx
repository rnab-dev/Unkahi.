import React, { useState } from 'react';
import { KIDS_LESSONS } from './AssessmentData';

export default function KidsLessons({ onBack }) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showingHint, setShowingHint] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isFading, setIsFading] = useState(false);

  const handleSelect = (idx) => {
    setSelectedOpt(idx);
    setShowingHint(true);
  };

  const handlenext = () => {
    setIsFading(true);
    setTimeout(() => {
      if (currentLesson < KIDS_LESSONS.length - 1) {
        setCurrentLesson(prev => prev + 1);
        setShowingHint(false);
        setSelectedOpt(null);
        setIsFading(false);
      } else {
        onBack();
      }
    }, 300);
  };

  const lesson = KIDS_LESSONS[currentLesson];

  return (
    <div className={`w-full transition-all duration-300 ease-in-out transform ${isFading ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
      
      <div className="flex justify-center mb-6 mt-2">
        <div className="text-7xl filter drop-shadow-md hover:scale-110 transition-transform">🧸</div>
      </div>
      
      <h2 className="text-3xl font-extrabold mb-4 text-red-400 text-center tracking-tight">{lesson.title}</h2>
      <p className="text-xl text-slate-700 mb-8 text-center font-bold px-2 leading-relaxed">
        {lesson.text}
      </p>

      <div className="flex flex-col gap-4">
        {lesson.options.map((opt, idx) => {
          const isSelected = selectedOpt === idx;
          const showThisHint = showingHint && isSelected;
          
          return (
            <div key={idx} className="flex flex-col gap-3">
              <button
                onClick={() => !showingHint && handleSelect(idx)}
                className={`w-full text-left p-5 rounded-[1.5rem] font-bold text-lg transition-all duration-300 border border-white ${
                  showingHint && !isSelected 
                    ? 'opacity-40 grayscale pointer-events-none bg-white/50' 
                    : isSelected 
                      ? 'bg-red-50 text-red-500 shadow-inner' 
                      : 'bg-white/80 text-slate-600 hover:text-red-500 hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {opt.text}
              </button>
              
              {showThisHint && (
                <div className="bg-green-50 rounded-2xl p-4 sm:p-5 border border-green-200 shadow-inner">
                  <p className="text-green-700 font-extrabold text-base sm:text-lg flex items-start gap-3">
                    <span className="text-xl sm:text-2xl h-full flex items-center mb-1">🌟</span>
                    <span>{opt.hint}</span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showingHint && (
        <div className="mt-8 text-center">
          <button 
            onClick={handlenext}
            className="bg-red-400 hover:bg-red-500 text-white rounded-full px-12 py-4 text-xl font-extrabold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            {currentLesson < KIDS_LESSONS.length - 1 ? 'Next Adventure →' : 'Finish Path 🌟'}
          </button>
        </div>
      )}
      
      <div className="mt-8 flex justify-center gap-2">
        {KIDS_LESSONS.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-3 w-3 rounded-full transition-all duration-500 ${idx === currentLesson ? 'bg-red-400 scale-125' : 'bg-slate-300'}`}
          />
        ))}
      </div>
    </div>
  );
}
