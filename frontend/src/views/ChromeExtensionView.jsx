import React, { useState } from 'react';
import {
  Chrome,
  CheckCircle2,
  Sparkles,
  Play,
  Copy,
  Zap,
  Terminal,
} from 'lucide-react';
import apiClient from '../api/client';

export default function ChromeExtensionView() {
  const [testQuestion, setTestQuestion] = useState('Why are you the ideal candidate for this Software Engineer role?');
  const [testJD, setTestJD] = useState('Senior Backend Engineer proficient in Python, FastAPI, and PostgreSQL microservices.');
  const [generating, setGenerating] = useState(false);
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTestAnswer = async (e) => {
    e.preventDefault();
    if (!testQuestion) return;
    setGenerating(true);
    setGeneratedAnswer('');
    try {
      const res = await apiClient.post('/agent/generate-answer', {
        question: testQuestion,
        job_description: testJD,
      });
      setGeneratedAnswer(res.data.answer);
    } catch (err) {
      console.error('Error generating AI answer:', err);
      alert('Failed to generate answer.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Chrome className="w-7 h-7 text-indigo-400" /> Chrome Extension Assistant & API Bridge
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connects your browser application forms directly to CareerPilot AI for 1-click job description extraction and smart form autofill.
          </p>
        </div>
      </div>

      {/* Extension Bridge Status Card */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 flex items-center justify-between relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> API Gateway Active
          </div>
          <h3 className="text-lg font-bold text-white">Extension Backend Listener Online</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            The Chrome Extension communicates with <code className="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">/api/v1/extension/extract-jd</code> and <code className="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">/api/v1/extension/fill-form</code> to automatically fill Google Forms and ATS portals.
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Zap className="w-8 h-8" />
        </div>
      </div>

      {/* Interactive Form Autofill Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" /> Interactive AI Application Question Simulator
            </h3>

            <form onSubmit={handleTestAnswer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Application Question</label>
                <input
                  type="text"
                  required
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Job Context / Description</label>
                <textarea
                  rows="4"
                  value={testJD}
                  onChange={(e) => setTestJD(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {generating ? 'Generating AI Answer...' : 'Generate Tailored Answer'}
                <Play className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Generated Response
              </h3>
              {generatedAnswer && (
                <button
                  onClick={handleCopy}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy Answer'}
                </button>
              )}
            </div>

            <div className="flex-1 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans min-h-[160px]">
              {generatedAnswer ? (
                generatedAnswer
              ) : (
                <span className="text-slate-500 italic">
                  Answer output will appear here. Submit a test question on the left to test Question Answer Agent responses.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
