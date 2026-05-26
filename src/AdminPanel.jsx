import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import { STORY_PHASES, DEEP_DIVE_PHASES } from './AssessmentData';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import IndiaHeatMap from './IndiaHeatMap';
import CohortGenerator from './CohortGenerator';
import CohortDashboard from './CohortDashboard';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

function AdminFootprintRadar({ scores }) {
  if (!scores || scores.length === 0) return null;
  const DIMENSION_LABELS = ['Hypervigilance', 'Boundary Collapse', 'Intrusive Guilt', 'Somatic Disconnect', 'Isolation', 'Env. Control'];
  const colorRGB = '99, 102, 241'; // Indigo-500
  const data = {
    labels: DIMENSION_LABELS,
    datasets: [{
      label: 'Footprint',
      data: scores,
      backgroundColor: `rgba(${colorRGB}, 0.15)`,
      borderColor: `rgba(${colorRGB}, 0.8)`,
      borderWidth: 2,
      pointBackgroundColor: `rgba(${colorRGB}, 1)`,
      pointBorderColor: '#fff', pointRadius: 3,
    }],
  };
  const options = {
    scales: {
      r: {
        min: 0, max: Math.max(6, ...scores) + 2,
        ticks: { display: false },
        grid: { color: 'rgba(163, 177, 198, 0.2)' },
        angleLines: { color: 'rgba(163, 177, 198, 0.2)' },
        pointLabels: { color: '#64748b', font: { family: 'inherit', size: 9, weight: '700' } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#fff', titleColor: '#334155', bodyColor: '#64748b', borderColor: '#E2E8F0', borderWidth: 1, padding: 8, cornerRadius: 8, callbacks: { label: (ctx) => `Intensity: ${ctx.parsed.r}` } },
    },
  };
  return <div className="w-full max-w-[220px] mx-auto"><Radar data={data} options={options} /></div>;
}

export default function AdminPanel({ onBack }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [adminOrgId, setAdminOrgId] = useState('');
  const [authError, setAuthError] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, pillars, scenarios, psychoed
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Form State
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Database Content State
  const [pillars, setPillars] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [cards, setCards] = useState([]);
  const [surveysList, setSurveysList] = useState([]);
  const [b2bRequests, setB2bRequests] = useState([]);
  const [dashboardError, setDashboardError] = useState(null);

  // Aggregated India Heatmap Data
  const regionHeatData = React.useMemo(() => {
    const data = {};
    surveysList.forEach(s => {
      if (s.region && s.survey_data?.score_normalized) {
        if (!data[s.region]) {
          data[s.region] = { totalScore: 0, count: 0 };
        }
        data[s.region].totalScore += s.survey_data.score_normalized;
        data[s.region].count += 1;
      }
    });

    const finalData = {};
    Object.keys(data).forEach(region => {
      finalData[region] = {
        avgScore: Math.round(data[region].totalScore / data[region].count),
        count: data[region].count
      };
    });
    return finalData;
  }, [surveysList]);

  const [expandedSurveyId, setExpandedSurveyId] = useState(null);
  const [resonanceFilter, setResonanceFilter] = useState('All');

  // Analytics Metrics State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    totalMoodLogs: 0,
    safetyPlanCount: 0,
    wotZones: { hyper: 0, optimal: 0, hypo: 0 },
    anomalyRate: 0,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    recentAlerts: []
  });

  // Editor states (for CRUD)
  const [editingItem, setEditingItem] = useState(null); // holds item being edited
  const [newPillar, setNewPillar] = useState({ title: '', icon: '', desc_text: '', tip: '' });
  const [newScenario, setNewScenario] = useState({ title: '', situation: '', law: '', explanation: '', misuse: '', type: 'Illegal' });
  const [newCard, setNewCard] = useState({ title: '', emoji: '', content: '' });

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session) => {
    setSession(session);
    if (session?.user) {
      setIsLoading(true);
      try {
        // Validate against admin_users whitelist
        const { data, error } = await supabase
          .from('admin_users')
          .select('email, role, org_id')
          .eq('email', session.user.email)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setIsAdmin(true);
          setAdminEmail(session.user.email);
          setAdminRole(data.role || 'super_admin');
          setAdminOrgId(data.org_id);
          setAuthError(null);
          
          if (data.role === 'org_admin') {
            setActiveTab('cohort_dash');
          }
          
          loadAllData(data.role || 'super_admin', data.org_id);
        } else {
          // Check if they are a pending B2B request
          const { data: pendingData } = await supabase
            .from('b2b_requests')
            .select('status')
            .eq('email', session.user.email)
            .maybeSingle();

          setIsAdmin(false);
          if (pendingData && pendingData.status === 'pending') {
            setAuthError('Your B2B SaaS application is currently under review. Please wait for approval.');
          } else {
            setAuthError('Access Denied: You are not whitelisted as an administrator.');
          }
          await supabase.auth.signOut();
        }
      } catch (err) {
        setAuthError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      if (error) throw error;
    } catch (err) {
      setAuthError(err.message);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
  };

  const loadAllData = async (role = adminRole, orgId = adminOrgId) => {
    setIsLoading(true);
    setDashboardError(null);
    try {
      // 1. Fetch Dynamic Site Content
      const { data: pillarsData } = await supabase.from('clinical_pillars').select('*').order('created_at', { ascending: true });
      const { data: scenariosData } = await supabase.from('legal_scenarios').select('*').order('created_at', { ascending: true });
      const { data: cardsData } = await supabase.from('psycho_education_cards').select('*').order('created_at', { ascending: true });

      setPillars(pillarsData || []);
      setScenarios(scenariosData || []);
      setCards(cardsData || []);

      // 2. Fetch Anonymous Analytics Logs
      const { data: moodDiary } = await supabase.from('mood_diary').select('wot, logged_date');
      const { data: telemetry } = await supabase.from('ml_telemetry').select('anomaly_detected, event_type, session_id');
      const { data: plans } = await supabase.from('safety_plans').select('id');
      const { data: surveysData, error: surveysErr } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (surveysErr) throw surveysErr;
      
      const filteredSurveys = role === 'org_admin' 
        ? (surveysData || []).filter(s => s.survey_data?.org_id === orgId)
        : (surveysData || []);
      setSurveysList(filteredSurveys);

      const { data: b2bData } = await supabase.from('b2b_requests').select('*').order('created_at', { ascending: false });
      setB2bRequests(role === 'org_admin' ? [] : (b2bData || []));

      // Calculate Metrics
      const totalMood = moodDiary?.length || 0;
      const totalSurveys = surveysData?.length || 0;
      const safetyPlans = plans?.length || 0;

      // Unique users count based on unique session_ids in telemetry
      const uniqueUsers = new Set(telemetry?.map(t => t.session_id) || []).size;

      // Window of Tolerance Zones Breakdown
      let hyper = 0, optimal = 0, hypo = 0;
      moodDiary?.forEach(log => {
        if (log.wot >= 8) hyper++;
        else if (log.wot <= 3) hypo++;
        else optimal++;
      });

      // Anomaly trigger rates from NLP telemetry
      const anomalyCount = telemetry?.filter(t => t.anomaly_detected).length || 0;
      const anomalyRate = telemetry?.length ? Math.round((anomalyCount / telemetry.length) * 100) : 0;

      // Activity over last 7 days (Monday - Sunday)
      const weekly = [0, 0, 0, 0, 0, 0, 0];
      moodDiary?.forEach(log => {
        const day = new Date(log.logged_date).getDay(); // 0 is Sunday
        const mappedDay = day === 0 ? 6 : day - 1; // Map Sunday to index 6, Monday to index 0
        if (mappedDay >= 0 && mappedDay < 7) {
          weekly[mappedDay]++;
        }
      });

      // Fetch Cohort Mapping
      const { data: cohortsData } = await supabase.from('cohorts').select('org_id, group_name');
      const cohortMap = {};
      if (cohortsData) {
        cohortsData.forEach(c => cohortMap[c.org_id] = c.group_name);
      }

      // Fetch Recent Critical Telemetry
      const { data: criticalLogs } = await supabase
        .from('ml_telemetry')
        .select('*')
        .eq('anomaly_detected', true)
        .order('created_at', { ascending: false })
        .limit(3);

      const recentAlerts = (criticalLogs || []).map(log => ({
        ...log,
        cohort_name: cohortMap[log.org_id] || (log.org_id === 'public' ? 'Public Sphere' : log.org_id)
      }));

      setStats({
        totalUsers: uniqueUsers || 1,
        totalAssessments: totalSurveys,
        totalMoodLogs: totalMood,
        safetyPlanCount: safetyPlans,
        wotZones: { hyper, optimal, hypo },
        anomalyRate,
        weeklyActivity: weekly,
        recentAlerts: recentAlerts
      });

    } catch (err) {
      console.error('Error loading admin panel database:', err.message);
      setDashboardError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Clinical Pillars CRUD
  const savePillar = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('clinical_pillars')
          .update({
            title: newPillar.title,
            icon: newPillar.icon,
            desc_text: newPillar.desc_text,
            tip: newPillar.tip,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clinical_pillars')
          .insert([newPillar]);
        if (error) throw error;
      }
      setNewPillar({ title: '', icon: '', desc_text: '', tip: '' });
      setEditingItem(null);
      loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const deletePillar = async (id) => {
    if (!confirm('Are you sure you want to delete this pillar?')) return;
    try {
      const { error } = await supabase.from('clinical_pillars').delete().eq('id', id);
      if (error) throw error;
      loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. Legal Scenarios CRUD
  const saveScenario = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('legal_scenarios')
          .update({
            title: newScenario.title,
            situation: newScenario.situation,
            law: newScenario.law,
            explanation: newScenario.explanation,
            misuse: newScenario.misuse,
            type: newScenario.type,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('legal_scenarios')
          .insert([newScenario]);
        if (error) throw error;
      }
      setNewScenario({ title: '', situation: '', law: '', explanation: '', misuse: '', type: 'Illegal' });
      setEditingItem(null);
      loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteScenario = async (id) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;
    try {
      const { error } = await supabase.from('legal_scenarios').delete().eq('id', id);
      if (error) throw error;
      loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. PsychoEducation Cards CRUD
  const saveCard = async (e) => {
    e.preventDefault();
    try {
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteCard = async (id) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    try {
      const { error } = await supabase.from('psycho_education_cards').delete().eq('id', id);
      if (error) throw error;
      loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };
  useEffect(() => {
    const hasUnsavedChanges =
      editingItem !== null ||
      newPillar.title.trim() !== '' ||
      newScenario.title.trim() !== '' ||
      newCard.title.trim() !== '';

    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editingItem, newPillar, newScenario, newCard]);
  const handleExport = (format) => {
    setShowExportMenu(false);
    if (format === 'pdf') {
      window.print();
    } else if (format === 'json') {
      const dataStr = JSON.stringify(surveysList, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', 'unkahi_telemetry_export.json');
      linkElement.click();
    } else if (format === 'csv') {
      const headers = ['ID', 'Date', 'Region', 'Country', 'Normalized Score', 'Dimension Count'];
      const csvContent = [
        headers.join(','),
        ...surveysList.map(s => [
          s.id,
          new Date(s.created_at).toISOString(),
          `"${s.region || ''}"`,
          `"${s.country || ''}"`,
          s.survey_data?.score_normalized || '',
          s.survey_data?.dimension_count || ''
        ].join(','))
      ].join('\n');
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', 'unkahi_telemetry_export.csv');
      linkElement.click();
    } else if (format === 'csv_responses') {
      const qHeaders = Array.from({ length: 24 }, (_, i) => `Q${i + 1}`);
      const headers = ['ID', 'Date', 'Region', 'Country', 'Normalized Score', ...qHeaders];
      const csvContent = [
        headers.join(','),
        ...surveysList.map(s => {
          const res = s.survey_data?.responses || [];
          const paddedRes = Array.from({ length: 24 }, (_, i) => res[i] !== undefined ? res[i] : '');
          return [
            s.id,
            new Date(s.created_at).toISOString(),
            `"${s.region || ''}"`,
            `"${s.country || ''}"`,
            s.survey_data?.score_normalized || '',
            ...paddedRes
          ].join(',');
        })
      ].join('\n');
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', 'unkahi_assessment_responses.csv');
      linkElement.click();
    }
  };

  const handleApproveB2BRequest = async (request) => {
    setIsLoading(true);
    try {
      const orgId = crypto.randomUUID();
      
      const { error: cohortError } = await supabase
        .from('cohorts')
        .insert([{ org_id: orgId, group_name: request.org_name }]);
      if (cohortError) throw cohortError;

      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([{ email: request.email, role: 'org_admin', org_id: orgId }]);
      if (adminError) throw adminError;

      const { error: updateError } = await supabase
        .from('b2b_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);
      if (updateError) throw updateError;

      await loadAllData();
    } catch (err) {
      alert(`Approval Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[550px] max-w-md w-full mx-auto bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[3rem] p-8 flex flex-col justify-center relative overflow-hidden">
        <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest text-xs transition-colors">
          ← Dashboard
        </button>
        <div className="text-center mt-6">
          <span className="text-5xl block mb-4">🔐</span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Admin Portal</h2>
          <p className="text-slate-500 font-medium text-sm mb-6">Authorized administrator access only.</p>
        </div>

        {authError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold p-4 rounded-xl text-center mb-6 leading-relaxed">
            {authError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={loginForm.email}
              onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="admin@unkahi.com"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
            <input
              type="password"
              required
              value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    );
  }

  // Admin Dashboard Rendered
  return (
    <div className="w-full max-w-[1400px] mx-auto bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[3rem] px-6 py-10 sm:px-12 sm:pb-16 mt-6 relative overflow-hidden min-h-[800px] flex flex-col">

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full relative z-10 border-b border-slate-200/50 pb-6 mb-8 gap-4 sm:gap-0 flex-shrink-0">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2 justify-center sm:justify-start">
            <span>🛡️</span> Admin Console
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Welcome back, <span className="text-indigo-600 font-black">{adminEmail || 'Administrator'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all">
            ← Home Site
          </button>
          <button onClick={handleLogout} className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all">
            Sign Out
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-[80] flex items-center justify-center">
          <span className="text-3xl animate-spin">🌀</span>
        </div>
      )}



      {dashboardError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl mb-6 font-bold text-sm">
          Error loading dashboard data: {dashboardError}
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex flex-col lg:flex-row gap-8 w-full relative z-10 flex-grow">

        {/* Vertical Sidebar */}
        <div className="flex flex-col bg-slate-100/50 backdrop-blur-md p-3 rounded-3xl w-full lg:w-64 flex-shrink-0 space-y-1 border border-slate-200/50 h-fit">
          {[
            { id: 'analytics', label: '📊 Telemetry Charts', adminOnly: true },
            { id: 'surveys', label: '📋 Assessment Logs', adminOnly: true },
            { id: 'feedback', label: '🗣️ User Feedback', adminOnly: true },
            { id: 'pillars', label: '🌸 Clinical Pillars', adminOnly: true },
            { id: 'scenarios', label: '⚖️ Scenarios', adminOnly: true },
            { id: 'psychoed', label: '🧠 Library', adminOnly: true },
            { id: 'cohort_gen', label: '🔗 B2B Links', adminOnly: true },
            { id: 'cohort_dash', label: '🏢 B2B Telemetry', adminOnly: false },
            { id: 'b2b_requests', label: '🔔 B2B Requests', adminOnly: true }
          ]
          .filter(t => adminRole === 'super_admin' || !t.adminOnly)
          .map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setEditingItem(null); }}
              className={`text-left w-full py-3.5 px-4 rounded-2xl text-sm font-black transition-all ${activeTab === t.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow w-full relative min-w-0">
          <AnimatePresence mode="wait">

            {/* Tab 1: TELEMETRY & ANALYTICS VISUALISATIONS */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">

                {/* Executive Actions Bar (Pitch Feature) */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-indigo-600 rounded-3xl p-6 text-white shadow-lg">
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Executive Telemetry Dashboard</h3>
                    <p className="text-indigo-200 text-xs font-medium mt-1">Real-time population mental health monitoring network.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="flex-1 sm:flex-none bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-indigo-50 transition-colors shadow-sm whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      📥 Export As...
                    </button>

                    {/* Export Dropdown */}
                    <AnimatePresence>
                      {showExportMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full mt-2 right-0 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden flex flex-col z-50 min-w-[200px]"
                        >
                          <button onClick={() => handleExport('pdf')} className="text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-slate-50 flex items-center gap-2"><span>📄</span> PDF Dashboard Report</button>
                          <button onClick={() => handleExport('csv')} className="text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-slate-50 flex items-center gap-2"><span>📊</span> Base Telemetry (CSV)</button>
                          <button onClick={() => handleExport('csv_responses')} className="text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-slate-50 flex items-center gap-2"><span>📝</span> Assessment Answers (CSV)</button>
                          <button onClick={() => handleExport('json')} className="text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2"><span>{`{}`}</span> JSON Database Dump</button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button className="flex-1 sm:flex-none bg-indigo-500 border border-indigo-400 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-indigo-400 transition-colors shadow-sm whitespace-nowrap">
                      ⚙️ Alerts
                    </button>
                  </div>
                </div>

                {/* Analytics Summary Stats Grid */}
                {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <span className="text-3xl block mb-2">🫂</span>
                    <p className="text-2xl font-black text-slate-800">{stats.totalUsers}</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">Unique Devices</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <span className="text-3xl block mb-2">🗒️</span>
                    <p className="text-2xl font-black text-slate-800">{stats.totalAssessments}</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">Assessments Completed</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <span className="text-3xl block mb-2">📝</span>
                    <p className="text-2xl font-black text-slate-800">{stats.totalMoodLogs}</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">Mood Checks</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <span className="text-3xl block mb-2">🛡️</span>
                    <p className="text-2xl font-black text-slate-800">{stats.safetyPlanCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">Safety Plans Built</p>
                  </div>
                </div>
                )}

                {/* Visualization Visuals Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                  {/* 1. Stress / Activity Timeline (Custom responsive SVG Line Chart) */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 mb-4">Mood Checks Frequency (Weekly Pattern)</h3>
                    <div className="relative flex-grow h-[220px] flex items-end">
                      <svg viewBox="0 0 600 200" className="w-full h-full">
                        {/* Grid Lines */}
                        <line x1="0" y1="50" x2="600" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="150" x2="600" y2="150" stroke="#f1f5f9" strokeWidth="1" />

                        {/* SVG Line chart Path */}
                        <path
                          d={`M 50,${200 - Math.min(180, stats.weeklyActivity[0] * 35)} 
                           L 133,${200 - Math.min(180, stats.weeklyActivity[1] * 35)} 
                           L 216,${200 - Math.min(180, stats.weeklyActivity[2] * 35)} 
                           L 299,${200 - Math.min(180, stats.weeklyActivity[3] * 35)} 
                           L 382,${200 - Math.min(180, stats.weeklyActivity[4] * 35)} 
                           L 465,${200 - Math.min(180, stats.weeklyActivity[5] * 35)} 
                           L 550,${200 - Math.min(180, stats.weeklyActivity[6] * 35)}`}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Dots and Labels */}
                        {stats.weeklyActivity.map((count, idx) => {
                          const x = 50 + idx * 83.3;
                          const y = 200 - Math.min(180, count * 35);
                          return (
                            <g key={idx}>
                              <circle cx={x} cy={y} r="6" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                              <text x={x} y={y - 12} fontSize="10" fontWeight="900" fill="#4f46e5" textAnchor="middle">{count}</text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                    <div className="flex justify-between px-6 text-xs font-black text-slate-400 tracking-wider mt-4">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  {/* 2. Window of Tolerance Zones Spread (SVG bar metrics visual) */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 mb-1">Window of Tolerance Zone Spread</h3>
                      <p className="text-xs font-medium text-slate-400 mb-6">Biological state logs recorded in the daily diary cards</p>
                    </div>

                    <div className="space-y-6">
                      {/* Hyperarousal */}
                      <div>
                        <div className="flex justify-between text-xs font-black mb-1.5">
                          <span className="text-rose-600">Hyperarousal (Fight/Flight)</span>
                          <span className="text-slate-600">{stats.wotZones.hyper} logs</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${(stats.wotZones.hyper / (stats.totalMoodLogs || 1)) * 100}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Optimal */}
                      <div>
                        <div className="flex justify-between text-xs font-black mb-1.5">
                          <span className="text-emerald-600">Optimal zone (Window of Tolerance)</span>
                          <span className="text-slate-600">{stats.wotZones.optimal} logs</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${(stats.wotZones.optimal / (stats.totalMoodLogs || 1)) * 100}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Hypoarousal */}
                      <div>
                        <div className="flex justify-between text-xs font-black mb-1.5">
                          <span className="text-indigo-600">Hypoarousal (Freeze/Shut down)</span>
                          <span className="text-slate-600">{stats.wotZones.hypo} logs</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${(stats.wotZones.hypo / (stats.totalMoodLogs || 1)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#4f46e5]/5 border border-[#4f46e5]/10 rounded-2xl p-4 flex items-center justify-between mt-6">
                      <div>
                        <p className="text-xs font-black text-[#4f46e5] uppercase tracking-wider mb-0.5">High Emotional Weight</p>
                        <p className="text-xs text-slate-500 font-bold">Anomalous triggers flagged by Local NLP</p>
                      </div>
                      <span className="text-2xl font-black text-[#4f46e5]">{stats.anomalyRate}%</span>
                    </div>
                  </div>

                </div>

                {/* B2B Map & Anomalies Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: National Heatmap */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 mb-1">National Trauma Hotspots</h3>
                      <p className="text-xs font-medium text-slate-400 mb-6">Real-time geographical tracking of high nervous system loads.</p>
                    </div>
                    <div className="flex-grow bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden relative">
                      <IndiaHeatMap regionData={regionHeatData} />
                    </div>
                  </div>

                  {/* Right: Predictive Anomalies Feed */}
                  <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col">
                    <div>
                      <h3 className="text-lg font-black text-rose-900 mb-1 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                        Predictive Alerts
                      </h3>
                      <p className="text-xs font-bold text-rose-600/70 mb-6">AI Early Warning System</p>
                    </div>

                    <div className="space-y-3">
                      {stats.recentAlerts && stats.recentAlerts.length > 0 ? (
                        stats.recentAlerts.map(alert => (
                          <div key={alert.id} className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[9px] font-black uppercase text-rose-500 tracking-widest block">Critical Spike</span>
                              <span className="text-[9px] font-bold text-slate-400">{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-700 leading-snug">
                              High NLP Anomaly (<span className="text-rose-600 font-black">{alert.emotional_weight?.toFixed(1)}</span> weight) detected in <span className="text-slate-900 font-black">{alert.cohort_name}</span>.
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">Context: {alert.event_type}</p>
                            <button onClick={() => setActiveTab('cohort_dash')} className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-3 hover:text-rose-700 transition-colors">Analyze Cohort →</button>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm opacity-70 text-center py-8">
                          <span className="text-2xl block mb-2">🌿</span>
                          <p className="text-xs font-bold text-slate-700 leading-snug">No critical anomalies detected recently.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 5: ANONYMOUS ASSESSMENT LOGS AUDIT */}
            {activeTab === 'surveys' && (() => {
              const filteredSurveys = surveysList.filter(s => {
                if (s.survey_data?.type === 'quick_resonance' || s.survey_data?.type === 'feedback_submission') return false;
                if (resonanceFilter === 'All') return true;
                if (resonanceFilter === 'Unrated') return !s.resonance;
                return s.resonance === resonanceFilter;
              });
              return (
                <motion.div key="surveys" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">

                  {/* Header Info */}
                  <div className="bg-[#4f46e5]/5 border border-[#4f46e5]/10 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">📋 Early-Launch Diagnostic Audit Logs</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed max-w-xl">
                        Verify clinical diagnostic accuracy, review raw question responses, and monitor real-time user geolocations (IP, country, city) without compromising individual anonymity.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm text-center min-w-[100px]">
                        <span className="text-xl block">📝</span>
                        <span className="text-lg font-black text-slate-800">{surveysList.filter(s => s.survey_data?.type !== 'quick_resonance' && s.survey_data?.type !== 'feedback_submission').length}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider mt-0.5">Total Runs</span>
                      </div>
                      <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm text-center min-w-[100px]">
                        <span className="text-xl block">💚</span>
                        <span className="text-lg font-black text-emerald-600">
                          {Math.round((surveysList.filter(s => s.resonance === 'Accurate').length / (surveysList.filter(s => s.resonance).length || 1)) * 100)}%
                        </span>
                        <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider mt-0.5">Accuracy</span>
                      </div>
                    </div>
                  </div>

                  {/* Filters Panel */}
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white/40 border border-slate-200/50 backdrop-blur-md rounded-2xl p-4 gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Filter Feedback:</span>
                      <div className="flex flex-wrap gap-1">
                        {['All', 'Accurate', 'Partially Accurate', 'Inaccurate', 'Unrated'].map(filter => (
                          <button
                            key={filter}
                            onClick={() => {
                              setResonanceFilter(filter);
                              setExpandedSurveyId(null);
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all border ${resonanceFilter === filter
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                              : 'bg-white/70 hover:bg-slate-200 text-slate-600 border-slate-200/60'
                              }`}
                          >
                            {filter === 'All' && '🌐 All'}
                            {filter === 'Accurate' && '💚 Accurate'}
                            {filter === 'Partially Accurate' && '💛 Partially'}
                            {filter === 'Inaccurate' && '❤️ Inaccurate'}
                            {filter === 'Unrated' && '◽ Unrated'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-400 font-black uppercase tracking-widest">
                      Showing {filteredSurveys.length} of {surveysList.length} assessment logs
                    </div>
                  </div>

                  {/* Surveys Log List */}
                  <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2">
                    {filteredSurveys.length === 0 ? (
                      <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm text-slate-400 font-bold">
                        No matching assessment logs found in database.
                      </div>
                    ) : (
                      filteredSurveys.map(s => {
                        const scoreVal = s.survey_data?.score_normalized ?? 'N/A';
                        const hasDetails = s.survey_data && (s.survey_data.scores || s.survey_data.responses);
                        const isExpanded = expandedSurveyId === s.id;
                        const dateFormatted = new Date(s.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });

                        // Location String
                        const locationParts = [s.city, s.region, s.country].filter(Boolean);
                        const locationStr = locationParts.length > 0 ? locationParts.join(', ') : '';

                        return (
                          <div
                            key={s.id}
                            className={`bg-white border rounded-3xl overflow-hidden hover:shadow-lg transition-all ${isExpanded ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-md' : 'border-slate-100 shadow-sm'
                              }`}
                          >
                            {/* Header Panel */}
                            <div
                              onClick={() => setExpandedSurveyId(isExpanded ? null : s.id)}
                              className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`text-slate-400 text-lg transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                                  ▶
                                </span>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                      ID: {s.id.slice(0, 8)}...
                                    </span>
                                    <span className="text-slate-400 text-[10px] font-bold">|</span>
                                    <span className="text-slate-500 text-xs font-bold">{dateFormatted}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-slate-700 font-black text-sm">
                                      {locationStr ? `🌍 ${locationStr}` : '🌍 Estimated Location Unavailable'}
                                    </span>
                                    {s.ip_address && (
                                      <span className="text-[10px] text-slate-400 font-mono">({s.ip_address})</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2.5">
                                {/* Score badge */}
                                <div className="bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
                                  <span className="text-indigo-600 font-black text-xs">Score:</span>
                                  <span className="text-indigo-700 font-black text-sm">{scoreVal}%</span>
                                </div>

                                {/* Resonance badge */}
                                {s.resonance === 'Accurate' && (
                                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    💚 Accurate
                                  </span>
                                )}
                                {s.resonance === 'Partially Accurate' && (
                                  <span className="bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    💛 Partially
                                  </span>
                                )}
                                {s.resonance === 'Inaccurate' && (
                                  <span className="bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    ❤️ Inaccurate
                                  </span>
                                )}
                                {!s.resonance && (
                                  <span className="bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    ◽ Unrated
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Expanded Section */}
                            {isExpanded && (
                              <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-6">
                                {!hasDetails ? (
                                  <div className="py-8 text-center text-slate-400 font-bold text-xs">
                                    No detailed clinical scores or response arrays captured for this diagnostic session (legacy log).
                                  </div>
                                ) : (
                                  <>
                                    {/* Trait and Location Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                      {/* Col 1: Radar Chart */}
                                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest w-full text-left border-b border-slate-100 pb-2 mb-3">
                                          🕸️ Visual Footprint
                                        </h4>
                                        <AdminFootprintRadar scores={s.survey_data.scores || []} />
                                      </div>

                                      {/* Col 2: Trait Breakdown */}
                                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">
                                          📊 Intensity Metrics
                                        </h4>
                                        <div className="space-y-3.5">
                                          {s.survey_data.scores?.map((scoreVal, index) => {
                                            const traitLabels = [
                                              'Hypervigilance 🧊',
                                              'Boundary Collapse 🌸',
                                              'Intrusive Guilt 🎗️',
                                              'Somatic Disconnect 🕸️',
                                              'Relational Isolation 🚪',
                                              'Environment Control ⚙️'
                                            ];
                                            const label = traitLabels[index] || `Trait ${index + 1}`;
                                            const pct = Math.min(100, Math.round((scoreVal / 10) * 100));
                                            return (
                                              <div key={index} className="space-y-1">
                                                <div className="flex justify-between text-xs font-bold text-slate-600">
                                                  <span>{label}</span>
                                                  <span>Intensity: {scoreVal}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                                  <div
                                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                  />
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Right: Technical Geolocation Metadata */}
                                      <div className="flex flex-col justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <div>
                                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">
                                            🌍 Estimated Geolocation Metadata
                                          </h4>
                                          <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                                            <div>
                                              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">IP Address</span>
                                              <span className="font-mono text-slate-700 font-black">{s.ip_address || 'Not Logged'}</span>
                                            </div>
                                            <div>
                                              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Country</span>
                                              <span className="text-slate-700 font-bold">{s.country || 'Not Logged'}</span>
                                            </div>
                                            <div>
                                              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Region</span>
                                              <span className="text-slate-700 font-bold">{s.region || 'Not Logged'}</span>
                                            </div>
                                            <div>
                                              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">City</span>
                                              <span className="text-slate-700 font-bold">{s.city || 'Not Logged'}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-6 text-xs text-slate-500 space-y-2 leading-relaxed">
                                          <p className="font-bold flex items-center gap-1.5">
                                            <span>🛡️</span> Privacy-First Telemetry
                                          </p>
                                          <p className="text-[11px] font-medium">
                                            Geolocated IP strings are calculated using high-accuracy RIPS nodes to estimate city/region. The data is entirely disconnected from user identity profiles to preserve complete mental safety.
                                          </p>
                                        </div>
                                      </div>

                                    </div>

                                    {/* Bottom: Detailed Question Audit */}
                                    <div className="space-y-4">
                                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                                        📝 Detailed Response Selection Checklist
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {s.survey_data.responses?.map((resp, rIdx) => {
                                          const questionMeta = STORY_PHASES[resp.step - 1] || DEEP_DIVE_PHASES[resp.step - 1 - STORY_PHASES.length];
                                          return (
                                            <div
                                              key={rIdx}
                                              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between"
                                            >
                                              <div className="space-y-2">
                                                <div className="flex justify-between items-start gap-2">
                                                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    {questionMeta ? questionMeta.title : `Question ${resp.step}`}
                                                  </span>
                                                  {questionMeta && (
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                      {questionMeta.phase}
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                                  {questionMeta ? questionMeta.text : "Question text unavailable."}
                                                </p>
                                              </div>

                                              <div className="mt-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl px-4 py-2.5 flex items-start gap-2.5">
                                                <span className="text-indigo-500 text-xs mt-0.5">✅</span>
                                                <div>
                                                  <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Chosen Option (Index: {resp.option_selected})</p>
                                                  <p className="text-[11px] font-bold text-slate-800 leading-tight">{resp.answer_text}</p>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                </motion.div>
              );
            })()}

            {/* Tab: FEEDBACK */}
            {activeTab === 'feedback' && (
              <motion.div key="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg mb-8">
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-2"><span>🗣️</span> User Feedback Inbox</h3>
                  <p className="text-indigo-200 text-xs font-medium mt-1">
                    Direct anonymous suggestions and accuracy reports from users.
                  </p>
                </div>

                <div className="grid gap-4">
                  {surveysList.filter(s => s.survey_data?.feedback).length === 0 ? (
                    <div className="text-center p-12 bg-slate-50 rounded-3xl border border-slate-100">
                      <span className="text-4xl mb-4 block">📭</span>
                      <p className="text-slate-500 font-medium">No user feedback received yet.</p>
                    </div>
                  ) : (
                    surveysList
                      .filter(s => s.survey_data?.feedback)
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .map(s => {
                        const topPillarIdx = s.survey_data?.scores ? s.survey_data.scores.indexOf(Math.max(...s.survey_data.scores)) : -1;
                        const DIMENSION_LABELS = ['Hypervigilance', 'Boundary Collapse', 'Intrusive Guilt', 'Somatic Disconnect', 'Isolation', 'Env. Control'];

                        return (
                          <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                              <div className="flex gap-2 items-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${s.resonance === 'Accurate' ? 'bg-green-100 text-green-700' :
                                  s.resonance === 'Inaccurate' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                  {s.resonance || 'Unrated'}
                                </span>
                                <span className="text-xs font-bold text-slate-400">
                                  {new Date(s.created_at).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Trait</p>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                                  {topPillarIdx >= 0 ? DIMENSION_LABELS[topPillarIdx] : 'Unknown'}
                                </span>
                              </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <p className="text-slate-700 text-sm font-medium leading-relaxed italic">
                                "{s.survey_data.feedback}"
                              </p>
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                              <span className="mr-3">📍 {s.city || 'Unknown'}, {s.region || 'Unknown'}</span>
                              <span>Score: {s.survey_data?.score_normalized || 0}%</span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab 2: CLINICAL PILLARS CONTENT CRUD */}
            {activeTab === 'pillars' && (
              <motion.div key="pillars" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">

                {/* Form Column */}
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
                  <h3 className="text-lg font-black text-slate-800 mb-6">{editingItem ? 'Edit Pillar' : 'Add New Clinical Pillar'}</h3>
                  <form onSubmit={savePillar} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Title</label>
                      <input
                        type="text" required value={newPillar.title}
                        onChange={e => setNewPillar({ ...newPillar, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="e.g. Somatic Disconnect"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Icon (Emoji)</label>
                      <input
                        type="text" required value={newPillar.icon}
                        onChange={e => setNewPillar({ ...newPillar, icon: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="e.g. 🧊"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</label>
                      <textarea
                        required value={newPillar.desc_text} rows={3}
                        onChange={e => setNewPillar({ ...newPillar, desc_text: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="Pillar clinical explanation..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Actionable Tip</label>
                      <input
                        type="text" required value={newPillar.tip}
                        onChange={e => setNewPillar({ ...newPillar, tip: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="Recommended therapeutic exercise..."
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      {editingItem && (
                        <button
                          type="button"
                          onClick={() => { setEditingItem(null); setNewPillar({ title: '', icon: '', desc_text: '', tip: '' }); }}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs"
                        >
                          Cancel
                        </button>
                      )}
                      <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all">
                        {editingItem ? 'Save Updates' : 'Add Pillar'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Data Items List Column */}
                <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {pillars.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm text-slate-400 font-bold">
                      No pillars loaded from database. Using fallback arrays.
                    </div>
                  ) : (
                    pillars.map(p => (
                      <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <span className="text-4xl">{p.icon}</span>
                          <div>
                            <h4 className="font-black text-slate-800">{p.title}</h4>
                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{p.desc_text}</p>
                            <p className="text-emerald-500 text-xs font-bold mt-2">💡 Tip: {p.tip}</p>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => { setEditingItem(p); setNewPillar({ title: p.title, icon: p.icon, desc_text: p.desc_text, tip: p.tip }); }}
                            className="flex-1 sm:flex-initial bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePillar(p.id)}
                            className="flex-1 sm:flex-initial bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </motion.div>
            )}

            {/* Tab 3: LEGAL SCENARIOS CONTENT CRUD */}
            {activeTab === 'scenarios' && (
              <motion.div key="scenarios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">

                {/* Form Column */}
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
                  <h3 className="text-lg font-black text-slate-800 mb-6">{editingItem ? 'Edit Scenario' : 'Add New Scenario'}</h3>
                  <form onSubmit={saveScenario} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scenario Title</label>
                      <input
                        type="text" required value={newScenario.title}
                        onChange={e => setNewScenario({ ...newScenario, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="e.g. The Dowry Threat"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stated Situation</label>
                      <textarea
                        required value={newScenario.situation} rows={2}
                        onChange={e => setNewScenario({ ...newScenario, situation: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="Describe the situation detail..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Applicable Law / Act</label>
                      <input
                        type="text" required value={newScenario.law}
                        onChange={e => setNewScenario({ ...newScenario, law: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="e.g. Section 498A (Cruelty)"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">The Reality (Legal Explanation)</label>
                      <textarea
                        required value={newScenario.explanation} rows={3}
                        onChange={e => setNewScenario({ ...newScenario, explanation: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="Provide simple legal details..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ethical Boundary (Misuse Detail)</label>
                      <textarea
                        required value={newScenario.misuse} rows={3}
                        onChange={e => setNewScenario({ ...newScenario, misuse: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="Define the misuse boundary..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Law Violation Type</label>
                      <select
                        value={newScenario.type}
                        onChange={e => setNewScenario({ ...newScenario, type: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        <option value="Illegal">Illegal</option>
                        <option value="Illegal Practice by Police">Illegal Practice by Police</option>
                        <option value="Rights Protection">Rights Protection</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {editingItem && (
                        <button
                          type="button"
                          onClick={() => { setEditingItem(null); setNewScenario({ title: '', situation: '', law: '', explanation: '', misuse: '', type: 'Illegal' }); }}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs"
                        >
                          Cancel
                        </button>
                      )}
                      <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all">
                        {editingItem ? 'Save Updates' : 'Add Scenario'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Data Items List Column */}
                <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {scenarios.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm text-slate-400 font-bold">
                      No scenarios loaded from database. Using fallback arrays.
                    </div>
                  ) : (
                    scenarios.map(s => (
                      <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between sm:flex-row items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {s.law}
                            </span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {s.type}
                            </span>
                          </div>
                          <h4 className="font-black text-slate-800 text-lg">{s.title}</h4>
                          <p className="text-slate-600 text-xs font-bold leading-relaxed italic mt-1.5">"{s.situation}"</p>
                          <p className="text-slate-500 text-xs mt-3 leading-relaxed"><strong>Reality:</strong> {s.explanation}</p>
                          {s.misuse !== "N/A - This is a procedural right." && (
                            <p className="text-rose-500 text-xs font-bold mt-2">🚨 Misuse: {s.misuse}</p>
                          )}
                        </div>
                        <div className="flex sm:flex-col gap-2 w-full sm:w-auto pt-4 sm:pt-0">
                          <button
                            onClick={() => { setEditingItem(s); setNewScenario({ title: s.title, situation: s.situation, law: s.law, explanation: s.explanation, misuse: s.misuse, type: s.type }); }}
                            className="flex-1 sm:flex-initial bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteScenario(s.id)}
                            className="flex-1 sm:flex-initial bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </motion.div>
            )}

            {/* Tab 4: PSYCHOEDUCATION LIBRARY CONTENT CRUD */}
            {activeTab === 'psychoed' && (
              <motion.div key="psychoed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">

                {/* Form Column */}
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
                  <h3 className="text-lg font-black text-slate-800 mb-6">{editingItem ? 'Edit Card' : 'Add New Library Card'}</h3>
                  <form onSubmit={saveCard} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Card Title</label>
                      <input
                        type="text" required value={newCard.title}
                        onChange={e => setNewCard({ ...newCard, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="e.g. Window of Tolerance"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Icon Emoji</label>
                      <input
                        type="text" required value={newCard.emoji}
                        onChange={e => setNewCard({ ...newCard, emoji: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="e.g. 🧠"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Card Content</label>
                      <textarea
                        required value={newCard.content} rows={4}
                        onChange={e => setNewCard({ ...newCard, content: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="Biologically centered trauma facts..."
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      {editingItem && (
                        <button
                          type="button"
                          onClick={() => { setEditingItem(null); setNewCard({ title: '', emoji: '', content: '' }); }}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs"
                        >
                          Cancel
                        </button>
                      )}
                      <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all">
                        {editingItem ? 'Save Updates' : 'Add Card'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Data Items List Column */}
                <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {cards.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm text-slate-400 font-bold">
                      No library cards loaded from database. Using fallback arrays.
                    </div>
                  ) : (
                    cards.map(c => (
                      <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <span className="text-4xl">{c.emoji}</span>
                          <div>
                            <h4 className="font-black text-slate-800">{c.title}</h4>
                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{c.content}</p>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => { setEditingItem(c); setNewCard({ title: c.title, emoji: c.emoji, content: c.content }); }}
                            className="flex-1 sm:flex-initial bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCard(c.id)}
                            className="flex-1 sm:flex-initial bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </motion.div>
            )}

            {/* Tab 6: B2B Cohort Link Generator */}
            {activeTab === 'cohort_gen' && (
              <motion.div key="cohort_gen" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-left">
                <CohortGenerator />
              </motion.div>
            )}

            {/* Tab 7: B2B Telemetry Dashboard */}
            {activeTab === 'cohort_dash' && (
              <motion.div key="cohort_dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-left">
                <CohortDashboard />
              </motion.div>
            )}

            {/* Tab 9: B2B REQUESTS */}
            {activeTab === 'b2b_requests' && (
              <motion.div key="b2b_requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">B2B SaaS Applications</h3>
                    <p className="text-slate-500 font-medium">Review and approve self-serve enterprise onboarding requests.</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400">
                        <th className="pb-4">Organization</th>
                        <th className="pb-4">Admin Email</th>
                        <th className="pb-4">Size</th>
                        <th className="pb-4">Date</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium text-slate-700 divide-y divide-slate-50">
                      {b2bRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 font-bold text-slate-900">{req.org_name}</td>
                          <td className="py-4 text-slate-500">{req.email}</td>
                          <td className="py-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold">{req.estimated_users}</span>
                          </td>
                          <td className="py-4 text-slate-400">{new Date(req.created_at).toLocaleDateString()}</td>
                          <td className="py-4">
                            {req.status === 'pending' && <span className="text-amber-500 font-black uppercase tracking-widest text-[10px] bg-amber-50 px-2 py-1 rounded-full">Pending</span>}
                            {req.status === 'approved' && <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px] bg-emerald-50 px-2 py-1 rounded-full">Approved</span>}
                            {req.status === 'rejected' && <span className="text-rose-500 font-black uppercase tracking-widest text-[10px] bg-rose-50 px-2 py-1 rounded-full">Rejected</span>}
                          </td>
                          <td className="py-4 text-right">
                            {req.status === 'pending' && (
                              <button 
                                onClick={() => handleApproveB2BRequest(req)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                              >
                                Approve →
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {b2bRequests.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">No B2B requests pending.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
