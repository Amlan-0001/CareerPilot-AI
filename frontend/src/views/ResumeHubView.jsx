import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Eye,
  ExternalLink,
  AlertTriangle,
  Lightbulb,
  Edit3,
  Save,
} from 'lucide-react';
import apiClient from '../api/client';

export default function ResumeHubView() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [parsingId, setParsingId] = useState(null);
  const [message, setMessage] = useState('');

  // Expand / View Modal State
  const [viewingResume, setViewingResume] = useState(null);
  const [resumeContent, setResumeContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'text'

  // Optimize Modal State
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [selectedBaseResume, setSelectedBaseResume] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);

  // Human-in-the-loop editable fields
  const [editableSummary, setEditableSummary] = useState('');
  const [editableBullets, setEditableBullets] = useState([]);
  const [savingVersion, setSavingVersion] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/resumes');
      setResumes(res.data || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are supported.');
      return;
    }

    setUploading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resume_name', file.name.replace('.pdf', ''));

    try {
      await apiClient.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('PDF Resume uploaded successfully as a new version!');
      fetchResumes();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Error uploading PDF resume:', err);
      const errMsg = err.response?.data?.detail || 'Failed to upload resume.';
      alert(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleParseResume = async (resumeId) => {
    setParsingId(resumeId);
    setMessage('');
    try {
      await apiClient.post('/agent/parse-resume', { resume_id: resumeId });
      setMessage('Resume successfully parsed by AI Agent! AI Memory updated.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Error parsing resume:', err);
      const errMsg = err.response?.data?.detail || 'Failed to parse resume.';
      alert(errMsg);
    } finally {
      setParsingId(null);
    }
  };

  const handleOpenExpandModal = async (resume) => {
    setViewingResume(resume);
    setViewMode('preview');
    setLoadingContent(true);
    try {
      const res = await apiClient.get(`/resumes/${resume.id}/content`);
      setResumeContent(res.data);
    } catch (err) {
      console.error('Error loading resume content:', err);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleOpenPdfNewTab = (resumeId) => {
    const token = localStorage.getItem('career_token');
    const pdfUrl = `http://localhost:8000/api/v1/resumes/${resumeId}/download?token=${token}`;
    window.open(pdfUrl, '_blank');
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume version?')) return;
    try {
      await apiClient.delete(`/resumes/${resumeId}`);
      setMessage('Resume version deleted successfully!');
      fetchResumes();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Error deleting resume:', err);
      const errMsg = err.response?.data?.detail || 'Failed to delete resume.';
      alert(errMsg);
    }
  };

  // Step 1: Initial AI Optimization Analysis (Preview Only - No DB write)
  const handleAnalyzeAndOptimize = async (e) => {
    e.preventDefault();
    if (!selectedBaseResume || !jobDescription) return;
    setOptimizing(true);
    try {
      const res = await apiClient.post('/agent/optimize-resume', {
        resume_id: selectedBaseResume,
        job_description: jobDescription,
        target_role: targetRole,
        target_company: targetCompany,
        preview_only: true,
      });
      setOptimizationResult(res.data);
      setEditableSummary(res.data.tailored_summary || '');
      setEditableBullets(res.data.tailored_bullet_points || []);
    } catch (err) {
      console.error('Error optimizing resume:', err);
      const errMsg = err.response?.data?.detail || 'Failed to analyze & optimize resume.';
      alert(errMsg);
    } finally {
      setOptimizing(false);
    }
  };

  // Step 2: Confirm & Save Tailored Version (Saves exactly 1 DB record and renders PDF)
  const handleConfirmAndSaveResume = async () => {
    if (!optimizationResult) return;
    setSavingVersion(true);
    try {
      await apiClient.post('/agent/optimize-resume', {
        resume_id: selectedBaseResume,
        job_description: jobDescription,
        target_role: targetRole,
        target_company: targetCompany,
        preview_only: false,
        custom_summary: editableSummary,
        custom_bullet_points: editableBullets,
      });
      fetchResumes();
      setMessage('New tailored PDF resume version generated and saved successfully!');
      setShowOptimizeModal(false);
      setOptimizationResult(null);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Error saving tailored resume version:', err);
      alert('Failed to save tailored resume version.');
    } finally {
      setSavingVersion(false);
    }
  };

  const handleBulletChange = (index, value) => {
    const updated = [...editableBullets];
    updated[index] = value;
    setEditableBullets(updated);
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-purple-400" /> Resume Version Management Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your master PDF resumes and generate tailored AI resume versions. Versioning guaranteed — existing resumes are never overwritten.
          </p>
        </div>

        <button
          onClick={() => {
            setShowOptimizeModal(true);
            setOptimizationResult(null);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" /> Tailor Resume for Job Description
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {message}
        </div>
      )}

      {/* PDF Upload Dropzone Card */}
      <div className="glass-panel p-8 rounded-2xl border border-dashed border-indigo-500/40 text-center space-y-4 relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-lg shadow-indigo-500/10">
          <Upload className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Upload PDF Resume Version</h3>
          <p className="text-xs text-slate-400 mt-1">
            Upload your master PDF resume. CareerPilot AI will parse its contents into permanent memory.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20 transition-all">
          <Upload className="w-4 h-4" /> {uploading ? 'Uploading PDF...' : 'Select PDF File'}
          <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {/* Resume Version Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Resume Versions ({resumes.length})</h3>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading resume versions...</div>
        ) : resumes.length === 0 ? (
          <div className="p-8 text-center border border-slate-800 rounded-xl text-slate-400 text-xs">
            No resume versions found. Upload a PDF resume above to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((res) => (
              <div
                key={res.id}
                className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      res.resume_source === 'AI Optimization'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                    }`}>
                      {res.resume_source || 'Master Upload'}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug">{res.resume_name}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteResume(res.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-950/40"
                    title="Delete Resume Version"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Uploaded: {new Date(res.created_at).toLocaleDateString()}
                </p>

                {/* Actions Toolbar */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenExpandModal(res)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                    >
                      <Eye className="w-3.5 h-3.5" /> Expand & View Resume
                    </button>

                    <button
                      onClick={() => handleOpenPdfNewTab(res.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Open Original PDF in New Tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleParseResume(res.id)}
                    disabled={parsingId === res.id}
                    className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${parsingId === res.id ? 'animate-spin' : ''}`} />
                    {parsingId === res.id ? 'Parsing...' : 'Sync Memory'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expand & View Resume Modal */}
      {viewingResume && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 relative max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{viewingResume.resume_name}</h3>
                  <span className="text-[11px] text-slate-400">
                    Source: {viewingResume.resume_source || 'PDF Upload'} • Created {new Date(viewingResume.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenPdfNewTab(viewingResume.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Raw PDF
                </button>
                <button
                  onClick={() => { setViewingResume(null); setResumeContent(null); }}
                  className="p-1 text-slate-400 hover:text-white font-bold text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 text-xs font-semibold">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'preview'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📄 PDF Viewer
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'text'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📝 Parsed Text & Details
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto min-h-[450px] rounded-xl bg-slate-950 p-4 border border-slate-800">
              {loadingContent ? (
                <div className="p-12 text-center text-slate-400 text-xs">Loading resume content...</div>
              ) : viewMode === 'preview' ? (
                <iframe
                  src={`http://localhost:8000/api/v1/resumes/${viewingResume.id}/download?token=${localStorage.getItem('career_token')}`}
                  className="w-full h-[520px] rounded-lg border-0 bg-white"
                  title="PDF Resume Preview"
                ></iframe>
              ) : (
                <div className="space-y-4 text-xs">
                  {viewingResume.job_description && (
                    <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-1">
                      <span className="font-bold text-purple-300 uppercase tracking-wider">Tailored Target Job Description</span>
                      <p className="text-slate-300 leading-relaxed">{viewingResume.job_description}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="font-bold text-slate-300 uppercase tracking-wider">Extracted Resume Text Content</span>
                    <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                      {resumeContent?.extracted_text || 'No text extracted.'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tailor Resume Modal with Human-in-the-Loop Feedback & Gaps Analysis */}
      {showOptimizeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> AI Resume Optimizer & Gap Analysis
              </h3>
              <button
                onClick={() => { setShowOptimizeModal(false); setOptimizationResult(null); }}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {!optimizationResult ? (
              <form onSubmit={handleAnalyzeAndOptimize} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Base Resume Version</label>
                  <select
                    required
                    value={selectedBaseResume}
                    onChange={(e) => setSelectedBaseResume(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select a base resume...</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>{r.resume_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Target Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Marketing Specialist"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Target Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Tech Startup"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Job Description</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Paste the target job description text here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={optimizing}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {optimizing ? 'Analyzing Gaps & Tailoring Resume...' : 'Analyze Gaps & Propose Tailored Resume'}
                  <Sparkles className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                {/* Score & Header Card */}
                <div className="p-4 rounded-xl bg-purple-950/50 border border-purple-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">AI Optimization Proposal</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{optimizationResult.resume_name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-emerald-400">{optimizationResult.ats_score}%</span>
                    <p className="text-[10px] text-slate-400 font-medium">ATS Match Score</p>
                  </div>
                </div>

                {/* Gaps / Lack in Current Resume */}
                {optimizationResult.missing_skills_or_lacks?.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 space-y-2">
                    <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> Issues & Missing Elements in Base Resume:
                    </h4>
                    <ul className="space-y-1 text-xs text-amber-200/90 list-disc pl-5">
                      {optimizationResult.missing_skills_or_lacks.map((lack, idx) => (
                        <li key={idx}>{lack}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Recommendations */}
                {optimizationResult.improvement_recommendations?.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-2">
                    <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-indigo-400" /> AI Critiques & Strategic Recommendations:
                    </h4>
                    <ul className="space-y-1 text-xs text-indigo-200/90 list-disc pl-5">
                      {optimizationResult.improvement_recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Human Review & Edit Step */}
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-purple-400" /> Human Review — Tweak AI Generated Content:
                    </h4>
                    <span className="text-[10px] text-slate-400">Edit before generating final PDF</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tailored Executive Summary</label>
                    <textarea
                      rows="3"
                      value={editableSummary}
                      onChange={(e) => setEditableSummary(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-purple-500 focus:outline-none leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-300">Tailored Resume Highlights & Bullet Points</label>
                    {editableBullets.map((bp, idx) => (
                      <textarea
                        key={idx}
                        rows="2"
                        value={bp}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-purple-500 focus:outline-none leading-relaxed"
                      />
                    ))}
                  </div>
                </div>

                {/* Final Confirm Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleConfirmAndSaveResume}
                    disabled={savingVersion}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {savingVersion ? 'Generating PDF & Saving Version...' : 'Approve & Generate New PDF Resume Version'}
                  </button>

                  <button
                    onClick={() => setOptimizationResult(null)}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl"
                  >
                    Re-Analyze
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
