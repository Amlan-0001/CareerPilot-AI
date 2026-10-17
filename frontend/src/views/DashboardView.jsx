import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Brain,
  FileText,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';
import apiClient from '../api/client';

export default function DashboardView({ user, setActiveTab }) {
  const [stats, setStats] = useState({
    applicationsCount: 0,
    resumesCount: 0,
    skillsCount: 0,
    memoryScore: 0,
  });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [appsRes, resumesRes, memRes] = await Promise.all([
        apiClient.get('/applications'),
        apiClient.get('/resumes'),
        apiClient.get('/memory'),
      ]);

      const apps = appsRes.data || [];
      const resumes = resumesRes.data || [];
      const mem = memRes.data || {};
      const skills = mem.skills || [];

      // Calculate memory completion score heuristics
      let score = 0;
      if (mem.college) score += 20;
      if (mem.degree) score += 20;
      if (mem.summary) score += 20;
      if (skills.length > 0) score += 20;
      if ((mem.projects || []).length > 0) score += 20;

      setStats({
        applicationsCount: apps.length,
        resumesCount: resumes.length,
        skillsCount: skills.length,
        memoryScore: score,
      });

      setRecentApps(apps.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" /> AI Executive Assistant Active
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{user?.full_name || 'Candidate'}</span>!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            CareerPilot AI is actively optimizing your resume versions, matching target job descriptions, and streamlining your job application pipeline.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Total Applications</span>
            <p className="text-3xl font-bold text-white">{stats.applicationsCount}</p>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> Tracked pipeline
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Resumes Managed</span>
            <p className="text-3xl font-bold text-white">{stats.resumesCount}</p>
            <span className="text-[11px] text-indigo-400 font-medium">Master & AI Tailored</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">AI Memory Profile</span>
            <p className="text-3xl font-bold text-white">{stats.memoryScore}%</p>
            <span className="text-[11px] text-cyan-400 font-medium">{stats.skillsCount} skills indexed</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Brain className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Chrome Assistant</span>
            <p className="text-xl font-bold text-emerald-400">Connected</p>
            <span className="text-[11px] text-slate-400">Auto-fill Ready</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide uppercase">Quick AI Workflows</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('matcher')}
            className="p-4 rounded-xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
            <h4 className="text-sm font-semibold text-white">Analyze Job Description</h4>
            <p className="text-xs text-slate-400 mt-1">Compute match score & missing skills</p>
          </button>

          <button
            onClick={() => setActiveTab('resumes')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
            <h4 className="text-sm font-semibold text-white">Tailor Resume Version</h4>
            <p className="text-xs text-slate-400 mt-1">Generate AI tailored resume PDF</p>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
            <h4 className="text-sm font-semibold text-white">Log Application</h4>
            <p className="text-xs text-slate-400 mt-1">Record job application status</p>
          </button>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Recent Applications</h3>
          <button
            onClick={() => setActiveTab('applications')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentApps.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-400 text-sm">
            No applications logged yet. Click "Log Application" to add your first job entry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="pb-3 px-2">Company</th>
                  <th className="pb-3 px-2">Job Role</th>
                  <th className="pb-3 px-2">Platform</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Match Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-2 font-semibold text-white">{app.company}</td>
                    <td className="py-3 px-2 text-slate-300">{app.job_role}</td>
                    <td className="py-3 px-2 text-slate-400">{app.platform}</td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        {app.application_status}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-200">
                      {app.match_score ? `${app.match_score}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
