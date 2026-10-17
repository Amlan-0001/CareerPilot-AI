import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
} from 'lucide-react';
import apiClient from '../api/client';

export default function ApplicationTrackerView() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    job_role: '',
    platform: 'LinkedIn',
    application_status: 'Applied',
    match_score: '',
    notes: '',
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/applications');
      setApplications(res.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        match_score: formData.match_score ? parseFloat(formData.match_score) : null,
      };

      if (editingId) {
        await apiClient.put(`/applications/${editingId}`, payload);
      } else {
        await apiClient.post('/applications', payload);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({
        company: '',
        job_role: '',
        platform: 'LinkedIn',
        application_status: 'Applied',
        match_score: '',
        notes: '',
      });
      fetchApplications();
    } catch (err) {
      console.error('Error saving application:', err);
      alert('Failed to save application entry.');
    }
  };

  const handleEdit = (app) => {
    setEditingId(app.id);
    setFormData({
      company: app.company,
      job_role: app.job_role,
      platform: app.platform,
      application_status: app.application_status,
      match_score: app.match_score || '',
      notes: app.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this application record?')) return;
    try {
      await apiClient.delete(`/applications/${appId}`);
      fetchApplications();
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  const statuses = ['Applied', 'Interview Scheduled', 'Offer', 'Rejected'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Interview Scheduled':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/50';
      case 'Offer':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50';
      case 'Rejected':
        return 'bg-red-950/80 text-red-300 border-red-800/50';
      default:
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800/50';
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-indigo-400" /> Job Application History Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track and manage your submitted job applications, interview stages, offer statuses, and notes.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              company: '',
              job_role: '',
              platform: 'LinkedIn',
              application_status: 'Applied',
              match_score: '',
              notes: '',
            });
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Log New Application
        </button>
      </div>

      {/* Applications Data Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading application records...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center border border-slate-800 rounded-xl text-slate-400 text-xs">
            No applications logged yet. Click "Log New Application" to add your first entry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="pb-3 px-3">Company</th>
                  <th className="pb-3 px-3">Role Title</th>
                  <th className="pb-3 px-3">Platform</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Match Score</th>
                  <th className="pb-3 px-3">Submitted Date</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-white">{app.company}</td>
                    <td className="py-3.5 px-3 text-slate-300 font-medium">{app.job_role}</td>
                    <td className="py-3.5 px-3 text-slate-400">{app.platform}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(app.application_status)}`}>
                        {app.application_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-200">
                      {app.match_score ? `${app.match_score}%` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(app)}
                        className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Log/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Application Record' : 'Log New Application'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Stripe"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Job Role</label>
                  <input
                    type="text"
                    required
                    placeholder="Backend Software Engineer"
                    value={formData.job_role}
                    onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Google Forms">Google Forms</option>
                    <option value="Company Careers">Company Careers</option>
                    <option value="Glassdoor">Glassdoor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.application_status}
                    onChange={(e) => setFormData({ ...formData, application_status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Match Score %</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="92.5"
                    value={formData.match_score}
                    onChange={(e) => setFormData({ ...formData, match_score: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes & Follow-ups</label>
                <textarea
                  rows="3"
                  placeholder="Referral contact, application link, or interview date..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
