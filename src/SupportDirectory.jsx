import React from 'react';
import { motion } from 'framer-motion';

const SUPPORT_CATEGORIES = [
  {
    title: 'Immediate Crisis & Suicide Prevention',
    color: 'from-rose-500 to-red-500',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    icon: '🚨',
    contacts: [
      { name: 'KIRAN (Govt. of India)', number: '1800-599-0019', description: '24/7 toll-free mental health rehabilitation helpline.' },
      { name: 'Vandrevala Foundation', number: '+91-9999-666-555', description: '24/7 crisis support. Also available on WhatsApp.' },
      { name: 'AASRA', number: '+91-9820466726', description: '24/7 confidential suicide prevention helpline.' }
    ]
  },
  {
    title: 'Domestic Violence & Safety',
    color: 'from-purple-500 to-fuchsia-500',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    icon: '🛡️',
    contacts: [
      { name: 'National Commission for Women (NCW)', number: '1091', description: '24/7 Women in Distress helpline.' },
      { name: 'NCW WhatsApp Helpline', number: '+91-7217735372', description: 'For reporting domestic violence cases.' }
    ]
  },
  {
    title: 'General Mental Health Support',
    color: 'from-teal-500 to-emerald-500',
    border: 'border-teal-200',
    bg: 'bg-teal-50',
    icon: '🫂',
    contacts: [
      { name: 'Snehi', number: '+91-9582208181', description: 'Support for psychological distress and mental health issues.' },
      { name: 'iCall (TISS)', number: '9152987821', description: 'Email and phone counseling services (Mon-Sat, 10 AM - 8 PM).' }
    ]
  }
];

export default function SupportDirectory({ onBack }) {
  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-[3rem] px-6 py-10 sm:px-12 sm:pt-10 sm:pb-16 mt-6 sm:mt-10 max-w-4xl w-full mx-auto flex flex-col items-center transform-gpu relative overflow-hidden min-h-[600px]">
      
      {/* Background Ambience */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent z-0 pointer-events-none"
      />

      <div className="flex items-start justify-start w-full relative z-10 mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest text-xs transition-colors">
          ← Return to Dashboard
        </button>
      </div>

      <div className="w-full relative z-10 text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-3">Support Directory</h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
          You don't have to carry this alone. Here are verified professional resources and helplines across India. 
          <strong className="text-slate-700 block mt-2">All calls are confidential.</strong>
        </p>
      </div>

      <div className="w-full relative z-10 space-y-8">
        {SUPPORT_CATEGORIES.map((category, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 rounded-3xl border ${category.border} bg-white shadow-lg`}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{category.icon}</span>
              <h3 className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${category.color}`}>
                {category.title}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.contacts.map((contact, cIdx) => (
                <div key={cIdx} className={`p-4 rounded-2xl ${category.bg} border ${category.border} flex flex-col justify-between`}>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">{contact.name}</h4>
                    <p className="text-xs text-slate-600 mb-4">{contact.description}</p>
                  </div>
                  <a 
                    href={`tel:${contact.number.replace(/[^\d+]/g, '')}`} 
                    className={`inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-white font-bold bg-gradient-to-r ${category.color} hover:opacity-90 transition-opacity shadow-sm hover:shadow-md`}
                  >
                    <span>📞</span> {contact.number}
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="w-full relative z-10 mt-12 pt-8 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">
          Need to close this screen quickly?
        </p>
        <button 
          onClick={() => window.location.replace('https://www.google.com')}
          className="bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/30 font-bold py-3 px-8 rounded-full shadow-sm transition-all uppercase tracking-wide"
        >
          Quick Exit
        </button>
      </div>

    </div>
  );
}
