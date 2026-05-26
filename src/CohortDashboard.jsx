import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function CohortDashboard() {
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState('');
  const [telemetryData, setTelemetryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCohorts();
  }, []);

  useEffect(() => {
    if (selectedCohort) {
      fetchTelemetry(selectedCohort);
    } else {
      setTelemetryData([]);
    }
  }, [selectedCohort]);

  const fetchCohorts = async () => {
    const { data } = await supabase
      .from('cohorts')
      .select('org_id, group_name')
      .order('created_at', { ascending: false });
    
    if (data) setCohorts(data);
  };

  const fetchTelemetry = async (orgId) => {
    setIsLoading(true);
    const { data } = await supabase
      .from('ml_telemetry')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (data) setTelemetryData(data);
    setIsLoading(false);
  };

  const downloadCSV = () => {
    if (!telemetryData.length) return;
    
    const headers = ['Timestamp', 'Session ID', 'Event Type', 'Anomaly Detected', 'Emotional Weight', 'Baseline Score', 'Std Deviation'];
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    telemetryData.forEach(row => {
      const values = [
        new Date(row.created_at).toISOString(),
        row.session_id,
        `"${row.event_type}"`,
        row.anomaly_detected,
        row.emotional_weight || '',
        row.baseline_score || '',
        row.std_deviation || ''
      ];
      csvRows.push(values.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `cohort_telemetry_${selectedCohort}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const metrics = useMemo(() => {
    if (!telemetryData.length) return null;
    
    const totalLogs = telemetryData.length;
    const uniqueSessions = new Set(telemetryData.map(d => d.session_id)).size;
    const anomalies = telemetryData.filter(d => d.anomaly_detected).length;
    const anomalyRate = Math.round((anomalies / totalLogs) * 100);
    
    const nlpData = telemetryData.filter(d => d.emotional_weight !== null);
    const avgWeight = nlpData.length 
      ? Math.round(nlpData.reduce((acc, curr) => acc + curr.emotional_weight, 0) / nlpData.length)
      : 0;

    // Chronological order for the chart (left to right)
    const chronoData = [...telemetryData].reverse();
    const lineChartData = {
      labels: chronoData.map((_, i) => `Log ${i + 1}`),
      datasets: [
        {
          label: 'NLP Emotional Weight',
          data: chronoData.map(d => d.emotional_weight || 0),
          borderColor: '#58a6ff',
          backgroundColor: 'rgba(88, 166, 255, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
        }
      ]
    };

    const doughnutData = {
      labels: ['Nominal', 'Critical Triggers'],
      datasets: [{
        data: [totalLogs - anomalies, anomalies],
        backgroundColor: ['#238636', '#da3633'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    };

    // Feature Usage (Bar Chart Data)
    const eventCounts = {};
    telemetryData.forEach(d => {
      const type = d.event_type || 'unknown';
      eventCounts[type] = (eventCounts[type] || 0) + 1;
    });
    const sortedEvents = Object.entries(eventCounts).sort((a,b) => b[1] - a[1]);
    
    const barChartData = {
      labels: sortedEvents.map(e => e[0]),
      datasets: [{
        label: 'Interactions',
        data: sortedEvents.map(e => e[1]),
        backgroundColor: 'rgba(137, 87, 229, 0.7)',
        borderColor: '#8957e5',
        borderWidth: 1,
        borderRadius: 4,
      }]
    };

    // Volatility Chart Data
    const volatilityChartData = {
      labels: chronoData.map((_, i) => `Log ${i + 1}`),
      datasets: [
        {
          label: 'Cohort Volatility (σ)',
          data: chronoData.map(d => d.std_deviation || 0),
          borderColor: '#d29922',
          backgroundColor: 'rgba(210, 153, 34, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderDash: [5, 5]
        }
      ]
    };

    return { totalLogs, uniqueSessions, anomalies, anomalyRate, avgWeight, lineChartData, doughnutData, barChartData, volatilityChartData };
  }, [telemetryData]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { display: false },
      y: { 
        grid: { color: '#30363d' },
        ticks: { color: '#8b949e', font: { family: 'monospace' } }
      }
    }
  };

  const doughnutOptions = {
    cutout: '75%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#8b949e', font: { family: 'monospace' } } }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#8b949e', font: { family: 'monospace', size: 10 } }
      },
      y: { 
        grid: { color: '#30363d' },
        ticks: { color: '#8b949e', font: { family: 'monospace' }, stepSize: 1 }
      }
    }
  };

  return (
    <div className="bg-[#0d1117] text-[#c9d1d9] font-mono p-4 sm:p-8 rounded-3xl min-h-[800px]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-[#30363d] gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Cohort Analytics</h1>
            <p className="text-[#8b949e] text-sm">Visualizing real-time nervous system telemetry for isolated B2B batches.</p>
          </div>
          
          <div className="flex flex-col w-full md:w-auto gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1 block">Active Organization</label>
              <div className="flex items-center gap-3">
                <select
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="bg-[#161b22] border border-[#30363d] text-[#c9d1d9] px-5 py-3 rounded-xl focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] shadow-sm cursor-pointer font-bold transition-all w-full md:w-64"
                >
                  <option value="">-- Select Cohort to Analyze --</option>
                  <option value="public">Public Sphere (Default)</option>
                  {cohorts.map((c) => (
                    <option key={c.org_id} value={c.org_id}>
                      {c.group_name} ({c.org_id.substring(0, 8)})
                    </option>
                  ))}
                </select>
                {selectedCohort && !isLoading && telemetryData.length > 0 && (
                  <button 
                    onClick={downloadCSV}
                    className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap"
                    title="Export to CSV"
                  >
                    <span>⬇️</span> CSV
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 text-[#8b949e]">
            <div className="animate-spin w-10 h-10 border-4 border-[#58a6ff] border-t-transparent rounded-full mb-6"></div>
            <p className="font-bold tracking-widest uppercase text-xs">Aggregating Telemetry Stream...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && selectedCohort && !metrics && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center shadow-lg">
            <span className="text-4xl block mb-4">📡</span>
            <h3 className="text-xl font-bold text-white mb-2">No Signal Detected</h3>
            <p className="text-[#8b949e] max-w-md mx-auto">This cohort routing ID has not generated any telemetry logs yet. Share the safe link to begin data aggregation.</p>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && metrics && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-[#58a6ff] transition-colors">
                <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1 relative z-10">Total Logs</p>
                <p className="text-3xl font-black text-white relative z-10">{metrics.totalLogs}</p>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-[#8957e5] transition-colors">
                <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1 relative z-10">Unique Sessions</p>
                <p className="text-3xl font-black text-white relative z-10">{metrics.uniqueSessions}</p>
              </div>
              <div className={`bg-[#161b22] border ${metrics.anomalies > 0 ? 'border-[#da3633]' : 'border-[#30363d]'} p-6 rounded-2xl shadow-lg relative overflow-hidden`}>
                <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1">Critical Triggers</p>
                <p className={`text-3xl font-black ${metrics.anomalies > 0 ? 'text-[#ff7b72]' : 'text-white'}`}>{metrics.anomalies}</p>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-[#3fb950] transition-colors">
                <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1 relative z-10">Avg NLP Weight</p>
                <p className="text-3xl font-black text-white relative z-10">{metrics.avgWeight}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Timeline Chart */}
              <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-lg p-6 flex flex-col h-[400px]">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Emotional Weight Trajectory</h3>
                  <p className="text-xs text-[#8b949e] mb-6">Longitudinal analysis of NLP sentiment intensity.</p>
                </div>
                <div className="flex-grow relative w-full h-full">
                  <Line data={metrics.lineChartData} options={lineOptions} />
                </div>
              </div>

              {/* Doughnut Chart */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center h-[400px] relative">
                <div className="absolute top-6 left-6 text-left w-full">
                  <h3 className="text-lg font-bold text-white mb-1">Health Distribution</h3>
                  <p className="text-xs text-[#8b949e]">Nominal baseline vs Anomalous spikes.</p>
                </div>
                <div className="w-[200px] h-[200px] relative mt-12">
                  <Doughnut data={metrics.doughnutData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-white">{metrics.anomalyRate}%</span>
                    <span className="text-[9px] font-bold text-[#8b949e] uppercase tracking-widest mt-1">Critical</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extended Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Feature Usage Bar Chart */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-lg p-6 flex flex-col h-[350px]">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Engagement Distribution</h3>
                  <p className="text-xs text-[#8b949e] mb-6">Frequency of therapeutic interactions by module.</p>
                </div>
                <div className="flex-grow relative w-full h-full">
                  <Bar data={metrics.barChartData} options={barOptions} />
                </div>
              </div>

              {/* Volatility Line Chart */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-lg p-6 flex flex-col h-[350px]">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Emotional Volatility Tracking</h3>
                  <p className="text-xs text-[#8b949e] mb-6">Standard deviation (σ) variance indicating system instability.</p>
                </div>
                <div className="flex-grow relative w-full h-full">
                  <Line data={metrics.volatilityChartData} options={lineOptions} />
                </div>
              </div>

            </div>

            {/* Recent Stream Table */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-lg mt-6">
              <div className="p-6 border-b border-[#30363d]">
                <h3 className="text-lg font-bold text-white">Raw Telemetry Stream</h3>
                <p className="text-xs text-[#8b949e]">Recent 50 logs from the zero-knowledge edge pipeline.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#21262d] text-[#8b949e] border-b border-[#30363d]">
                    <tr>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Timestamp (UTC)</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Anonymous ID</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Event Type</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">NLP Intensity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]">
                    {telemetryData.slice(0, 50).map((row) => (
                      <tr key={row.id} className="hover:bg-[#21262d] transition-colors group">
                        <td className="px-6 py-4 text-[#8b949e] text-xs whitespace-nowrap">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-[#58a6ff] text-xs opacity-80 group-hover:opacity-100 transition-opacity">
                          {row.session_id.substring(0, 12)}...
                        </td>
                        <td className="px-6 py-4 text-[#c9d1d9] text-xs font-semibold">
                          {row.event_type}
                        </td>
                        <td className="px-6 py-4">
                          {row.anomaly_detected ? (
                            <span className="bg-[#440f12] text-[#ff7b72] border border-[#ff7b72]/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                              Triggered
                            </span>
                          ) : (
                            <span className="bg-[#0f291e] text-[#3fb950] border border-[#3fb950]/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                              Nominal
                           </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[#c9d1d9] font-bold text-xs w-8">
                              {row.emotional_weight !== null ? row.emotional_weight.toFixed(1) : '-'}
                            </span>
                            {row.emotional_weight !== null && (
                              <div className="w-20 bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#58a6ff] rounded-full" 
                                  style={{ width: `${Math.min(100, (row.emotional_weight / 100) * 100)}%` }} 
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
