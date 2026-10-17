import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import AIMemoryView from './views/AIMemoryView';
import ResumeHubView from './views/ResumeHubView';
import JDMatcherView from './views/JDMatcherView';
import ApplicationTrackerView from './views/ApplicationTrackerView';
import ChromeExtensionView from './views/ChromeExtensionView';
import { LoginView, RegisterView } from './views/AuthViews';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for authenticated user token
    const token = localStorage.getItem('career_token');
    const storedUser = localStorage.getItem('career_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('career_token');
        localStorage.removeItem('career_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('career_token');
    localStorage.removeItem('career_user');
    setUser(null);
    setAuthMode('login');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Initializing Career OS...</div>;
  }

  // Unauthenticated State
  if (!user) {
    return authMode === 'login' ? (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthMode('register')}
      />
    ) : (
      <RegisterView
        onRegisterSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setAuthMode('login')}
      />
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <DashboardView user={user} setActiveTab={setActiveTab} />}
          {activeTab === 'memory' && <AIMemoryView />}
          {activeTab === 'resumes' && <ResumeHubView />}
          {activeTab === 'matcher' && <JDMatcherView setActiveTab={setActiveTab} />}
          {activeTab === 'applications' && <ApplicationTrackerView />}
          {activeTab === 'extension' && <ChromeExtensionView />}
        </div>
      </main>
    </div>
  );
}
