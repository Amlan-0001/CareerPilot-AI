import React, { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  Save,
  Code,
  FolderGit2,
  Briefcase,
  Star,
  CheckCircle2,
} from 'lucide-react';
import apiClient from '../api/client';

export default function AIMemoryView() {
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // New Skill Modal / Form state
  const [newSkill, setNewSkill] = useState({ skill_name: '', skill_type: 'Programming', proficiency: 4 });
  // New Project Form state
  const [newProject, setNewProject] = useState({ title: '', description: '', technologies: '' });
  // New Experience Form state
  const [newExp, setNewExp] = useState({ company: '', role: '', description: '', start_date: '2025-01-01' });

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/memory');
      setMemory(res.data);
    } catch (err) {
      console.error('Error loading AI Memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemory = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await apiClient.put('/memory', {
        phone: memory.phone,
        college: memory.college,
        degree: memory.degree,
        branch: memory.branch,
        cgpa: memory.cgpa ? parseFloat(memory.cgpa) : None,
        graduation_year: memory.graduation_year ? parseInt(memory.graduation_year) : None,
        linkedin_url: memory.linkedin_url,
        github_url: memory.github_url,
        portfolio_url: memory.portfolio_url,
        summary: memory.summary,
        preferred_role: memory.preferred_role,
        preferred_location: memory.preferred_location,
      });
      setMemory(res.data);
      setMessage('AI Memory Profile saved successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Error saving memory:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.skill_name) return;
    try {
      await apiClient.post('/memory/skills', newSkill);
      setNewSkill({ skill_name: '', skill_type: 'Programming', proficiency: 4 });
      fetchMemory();
    } catch (err) {
      console.error('Error adding skill:', err);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await apiClient.delete(`/memory/skills/${skillId}`);
      fetchMemory();
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title) return;
    try {
      await apiClient.post('/memory/projects', newProject);
      setNewProject({ title: '', description: '', technologies: '' });
      fetchMemory();
    } catch (err) {
      console.error('Error adding project:', err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await apiClient.delete(`/memory/projects/${projectId}`);
      fetchMemory();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!newExp.company || !newExp.role) return;
    try {
      await apiClient.post('/memory/experiences', newExp);
      setNewExp({ company: '', role: '', description: '', start_date: '2025-01-01' });
      fetchMemory();
    } catch (err) {
      console.error('Error adding experience:', err);
    }
  };

  const handleDeleteExperience = async (expId) => {
    try {
      await apiClient.delete(`/memory/experiences/${expId}`);
      fetchMemory();
    } catch (err) {
      console.error('Error deleting experience:', err);
    }
  };

  if (loading || !memory) {
    return <div className="p-8 text-center text-slate-400">Loading AI Memory Profile...</div>;
  }

  return (
    <div className="space-y-8">
      {/* View Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-indigo-400" /> AI Memory Profile Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Permanent memory bank utilized by CareerPilot AI agents for tailoring resumes, answering questions, and match scoring.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {message}
        </div>
      )}

      {/* Core Profile Details Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Personal & Educational Background</h3>
        
        <form onSubmit={handleUpdateMemory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={memory.phone || ''}
                onChange={(e) => setMemory({ ...memory, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">College / University</label>
              <input
                type="text"
                value={memory.college || ''}
                onChange={(e) => setMemory({ ...memory, college: e.target.value })}
                placeholder="Massachusetts Institute of Technology"
                className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Degree & Major</label>
              <input
                type="text"
                value={memory.degree || ''}
                onChange={(e) => setMemory({ ...memory, degree: e.target.value })}
                placeholder="B.S. Computer Science"
                className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn Profile URL</label>
              <input
                type="text"
                value={memory.linkedin_url || ''}
                onChange={(e) => setMemory({ ...memory, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Profile URL</label>
              <input
                type="text"
                value={memory.github_url || ''}
                onChange={(e) => setMemory({ ...memory, github_url: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Job Role</label>
              <input
                type="text"
                value={memory.preferred_role || ''}
                onChange={(e) => setMemory({ ...memory, preferred_role: e.target.value })}
                placeholder="Senior Backend Engineer"
                className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Professional Executive Summary</label>
            <textarea
              rows="3"
              value={memory.summary || ''}
              onChange={(e) => setMemory({ ...memory, summary: e.target.value })}
              placeholder="Software Engineer with expertise in building distributed backend services, REST APIs, and AI integrations..."
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Skills Manager */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-400" /> Skill Index ({memory.skills?.length || 0})
          </h3>
        </div>

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
          <input
            type="text"
            placeholder="Skill Name (e.g. FastAPI)"
            value={newSkill.skill_name}
            onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
          <select
            value={newSkill.skill_type}
            onChange={(e) => setNewSkill({ ...newSkill, skill_type: e.target.value })}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="Programming">Programming</option>
            <option value="Framework">Framework</option>
            <option value="Database">Database</option>
            <option value="Cloud/DevOps">Cloud/DevOps</option>
            <option value="AI/ML">AI/ML</option>
          </select>
          <select
            value={newSkill.proficiency}
            onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value={5}>5 Stars (Expert)</option>
            <option value={4}>4 Stars (Advanced)</option>
            <option value={3}>3 Stars (Intermediate)</option>
            <option value={2}>2 Stars (Basic)</option>
          </select>
          <button
            type="submit"
            className="py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Skill
          </button>
        </form>

        {/* Skills Grid */}
        <div className="flex flex-wrap gap-2.5">
          {memory.skills?.map((skill) => (
            <div
              key={skill.id}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 group hover:border-purple-500/40 transition-all"
            >
              <span className="text-xs font-semibold text-white">{skill.skill_name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-medium">
                {skill.skill_type}
              </span>
              <button
                onClick={() => handleDeleteSkill(skill.id)}
                className="text-slate-500 hover:text-red-400 transition-colors ml-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Manager */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-cyan-400" /> Portfolio Projects ({memory.projects?.length || 0})
        </h3>

        <form onSubmit={handleAddProject} className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Project Title"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Technologies Used (e.g. FastAPI, React, PostgreSQL)"
              value={newProject.technologies}
              onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <input
            type="text"
            placeholder="Project Description / Key Highlights"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Project
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memory.projects?.map((proj) => (
            <div key={proj.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 relative group">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                <button
                  onClick={() => handleDeleteProject(proj.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300">{proj.description}</p>
              <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded inline-block">
                {proj.technologies}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
