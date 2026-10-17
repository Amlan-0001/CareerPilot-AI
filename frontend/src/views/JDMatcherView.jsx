import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Gauge,
  Briefcase,
} from 'lucide-react';
import apiClient from '../api/client';

export default function JDMatcherView({ setActiveTab }) {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobDescription) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/agent/analyze-jd', {
        job_description: jobDescription,
        job_title: jobTitle,
        company_name: companyName,
      });
      setAnalysis(res.data);
    } catch (err) {
      console.error('Error analyzing job description:', err);
      alert('Failed to analyze job description.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-indigo-400" /> Job Description Matcher & Analysis Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluates target job requirements against your AI Memory profile, calculates match percentage, highlights missing skills, and delivers actionable recommendations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Target Job Details</h3>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Job Title / Role</label>
                <input
                  type="text"
                  placeholder="Backend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="Tech Innovators Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Job Description</label>
                <textarea
                  rows="8"
                  required
                  placeholder="Paste complete job description requirements here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Analyzing Profile Match...' : 'Compute JD Match Score'}
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Match Analysis Results */}
        <div className="lg:col-span-7 space-y-6">
          {!analysis ? (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <Gauge className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">No Analysis Executed Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Paste a Job Description on the left and click "Compute JD Match Score" to inspect candidate match analytics.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Match Score Card */}
              <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 flex items-center justify-between relative overflow-hidden">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Candidate Match Index</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">{analysis.match_score}%</span>
                    <span className="text-xs text-slate-400 font-medium">compatibility score</span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-md">{analysis.summary}</p>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-indigo-500 flex items-center justify-center bg-indigo-950/50 shadow-xl shadow-indigo-500/20">
                  <span className="text-xl font-black text-indigo-300">{analysis.match_score}%</span>
                </div>
              </div>

              {/* Key Skills & Missing Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Key Skills Required
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.key_skills?.map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/50 text-emerald-300 text-xs font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Missing / Gap Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missing_skills?.length === 0 ? (
                      <span className="text-xs text-slate-400">No major skill gaps detected!</span>
                    ) : (
                      analysis.missing_skills?.map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800/50 text-amber-300 text-xs font-medium">
                          {sk}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations Card */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> Actionable Resume Recommendations
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {analysis.recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setActiveTab('resumes')}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all mt-2"
                >
                  Tailor Resume for this Job Description <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
