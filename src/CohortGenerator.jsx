import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function CohortGenerator() {
  const [groupName, setGroupName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [cohorts, setCohorts] = useState([]);
  const [usageCounts, setUsageCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    setIsLoading(true);
    try {
      const { data: cohortData } = await supabase
        .from('cohorts')
        .select('*')
        .order('created_at', { ascending: false });

      if (cohortData) {
        setCohorts(cohortData);

        // Fetch all telemetry org_ids to calculate usage counts
        const { data: telemetryData } = await supabase
          .from('ml_telemetry')
          .select('org_id');

        if (telemetryData) {
          const counts = {};
          telemetryData.forEach(t => {
            counts[t.org_id] = (counts[t.org_id] || 0) + 1;
          });
          setUsageCounts(counts);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setIsGenerating(true);
    setError(null);

    const orgId = crypto.randomUUID();

    try {
      const { error: dbError } = await supabase
        .from('cohorts')
        .insert([{ org_id: orgId, group_name: groupName.trim() }]);

      if (dbError) throw dbError;

      const link = `${window.location.origin}/safe/${orgId}`;
      setGeneratedLink(link);
      setGroupName('');
      fetchCohorts(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (linkText) => {
    navigator.clipboard.writeText(linkText);
  };

  return (
    <div className="bg-[#0d1117] text-[#c9d1d9] font-mono p-4 sm:p-8 rounded-3xl min-h-[800px] flex flex-col gap-8">

      {/* Top Section: Generator */}
      <div className="w-full max-w-3xl bg-[#161b22] border border-[#30363d] rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Initialize Cohort</h2>
        <p className="text-[#8b949e] text-sm mb-6">Generate a secure routing link for organization batches.</p>

        {error && (
          <div className="bg-[#440f12] border border-[#ff7b72] text-[#ff7b72] p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
              Cohort Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. IITP-Aryabhatta"
              className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] px-4 py-3 rounded-md focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !groupName.trim()}
            className="w-full bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-semibold py-3 rounded-md transition-colors"
          >
            {isGenerating ? 'Provisioning...' : 'Generate Secure Link'}
          </button>
        </form>

        {generatedLink && (
          <div className="mt-8 pt-6 border-t border-[#30363d]">
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
              Generated Route
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 bg-[#0d1117] border border-[#30363d] text-[#58a6ff] px-4 py-3 rounded-md outline-none"
              />
              <button
                onClick={() => copyToClipboard(generatedLink)}
                className="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-[#c9d1d9] px-5 py-3 rounded-md font-semibold transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Active Links Table */}
      <div className="w-full max-w-5xl bg-[#161b22] border border-[#30363d] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#30363d] flex justify-between items-center bg-[#21262d]">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Active B2B Links</h3>
            <p className="text-xs text-[#8b949e]">Manage routing URLs and view raw session entry volumes.</p>
          </div>
          <button onClick={fetchCohorts} className="text-xs font-bold text-[#58a6ff] hover:text-white uppercase tracking-wider">
            ↻ Refresh Data
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-[#8b949e]">Loading active links...</div>
          ) : cohorts.length === 0 ? (
            <div className="text-center py-12 text-[#8b949e]">No cohorts generated yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161b22] text-[#8b949e] border-b border-[#30363d]">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Cohort Name</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Created</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Active Route</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Telemetry Entries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {cohorts.map((cohort) => {
                  const link = `${window.location.origin}/safe/${cohort.org_id}`;
                  const count = usageCounts[cohort.org_id] || 0;
                  return (
                    <tr key={cohort.id} className="hover:bg-[#21262d] transition-colors group">
                      <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                        {cohort.group_name}
                      </td>
                      <td className="px-6 py-4 text-[#8b949e] text-xs">
                        {new Date(cohort.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[#58a6ff] font-mono text-xs opacity-80 cursor-pointer truncate max-w-[200px]" title={link}>
                            {link}
                          </span>
                          <button onClick={() => copyToClipboard(link)} className="text-[#8b949e] hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            [COPY]
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${count > 0 ? 'bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/30' : 'bg-transparent text-[#8b949e]'}`}>
                          {count}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
