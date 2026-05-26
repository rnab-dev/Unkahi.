import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { motion } from 'framer-motion';

export default function B2BSignup({ onBack }) {
  const [formData, setFormData] = useState({
    orgName: '',
    email: '',
    password: '',
    estimatedUsers: '10-50'
  });
  
  const [status, setStatus] = useState(null); // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // 1. Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Log the request in the b2b_requests queue
      const { error: dbError } = await supabase
        .from('b2b_requests')
        .insert([{
          org_name: formData.orgName,
          email: formData.email,
          estimated_users: formData.estimatedUsers,
          status: 'pending'
        }]);

      if (dbError) throw dbError;

      // Ensure they don't stay logged in as an unapproved user
      await supabase.auth.signOut();

      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during sign up.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl border border-slate-100 text-center"
        >
          <span className="text-6xl mb-6 block">✨</span>
          <h2 className="text-2xl font-black text-slate-800 mb-4">Application Received</h2>
          <p className="text-slate-600 font-medium mb-8">
            Thank you for choosing Unkahi. Your request for <strong>{formData.orgName}</strong> is currently under review by our team. You will be able to log in via the Organization Portal once approved.
          </p>
          <button 
            onClick={onBack}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
          >
            Return to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center p-4 pt-16 pb-12 relative z-20">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-slate-500 hover:text-slate-800 font-bold tracking-widest uppercase text-xs"
      >
        ← Back
      </button>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
        
        {/* Features Column (Visible on all screens, stacked on mobile) */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-center border border-slate-800">
          {/* Background decorations */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-teal-500/10 rounded-full blur-[80px]" />
          
          <span className="text-teal-400 font-black tracking-widest uppercase text-[10px] mb-4 relative z-10">Why Unkahi for Organizations?</span>
          <h2 className="text-3xl md:text-5xl font-black mb-10 leading-tight tracking-tight relative z-10">
            Scale Trauma-Informed Care.
          </h2>
          
          <div className="space-y-8 relative z-10">
            <div className="flex gap-5">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-100 mb-1.5">Deep ML Telemetry</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">Aggregate anonymous somatic footprint data across your entire cohort to identify burnout and systemic trauma trends before they escalate.</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                <span className="text-2xl">🚨</span>
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-100 mb-1.5">Predictive Crisis Alerts</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">Our local Edge AI detects severe distress patterns (like extreme hypervigilance) and securely alerts designated clinic administrators.</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-100 mb-1.5">Isolated Data Enclave</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">Zero-knowledge architecture. Your organization's data remains fully isolated, encrypted, and compliant with privacy standards.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="bg-white/80 backdrop-blur-xl w-full p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-indigo-500/10 border border-white flex flex-col justify-center">
          <div className="text-left mb-8">
            <span className="text-indigo-500 font-black tracking-widest uppercase text-[10px] mb-2 block">Enterprise SaaS</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Organization Application</h2>
            <p className="text-slate-500 text-sm font-medium">Apply for an isolated Unkahi telemetry environment for your cohort.</p>
          </div>

          {status === 'error' && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl mb-6 text-sm font-bold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Organization Name</label>
              <input 
                type="text" 
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                required
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3.5 text-slate-800 outline-none transition-all font-medium shadow-sm"
                placeholder="e.g., IIT Patna"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Admin Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3.5 text-slate-800 outline-none transition-all font-medium shadow-sm"
                placeholder="admin@university.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3.5 text-slate-800 outline-none transition-all font-medium shadow-sm"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Estimated Cohort Size</label>
              <select 
                name="estimatedUsers"
                value={formData.estimatedUsers}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3.5 text-slate-800 outline-none transition-all font-medium cursor-pointer shadow-sm appearance-none"
              >
                <option value="1-10">1 - 10 Users</option>
                <option value="10-50">10 - 50 Users (Pro)</option>
                <option value="50-200">50 - 200 Users (Enterprise)</option>
                <option value="200+">200+ Users (Enterprise)</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(79,70,229,0.25)] transition-all mt-4 hover:-translate-y-0.5"
            >
              {status === 'loading' ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
          
          <p className="text-center text-[10px] text-slate-400 mt-6 max-w-xs mx-auto font-medium">
            By applying, you agree to our Terms of Service and Privacy Policy regarding sensitive telemetry data.
          </p>
        </div>
      </div>
    </div>
  );
}
