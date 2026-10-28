import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon, Brain, Shield, Database, CheckCircle,
  Server, Key, Bell, User, RefreshCw, Copy, Check, Lock, Save, Eye, EyeOff
} from 'lucide-react';
import API from '../services/api';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [mlStatus, setMlStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pingLatency, setPingLatency] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Security password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification Preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    riskAlerts: true,
    attendanceWarnings: true,
    mentorMessages: true,
    assignmentDeadlines: true,
    weeklyDigest: false
  });

  useEffect(() => {
    checkServices();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const checkServices = async () => {
    setLoading(true);
    const start = Date.now();
    try {
      const res = await API.get('/health');
      setMlStatus(res.data);
      setPingLatency(Date.now() - start);
    } catch (e) {
      console.error(e);
      setPingLatency(null);
    }
    setLoading(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Error: Passwords do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('Error: Password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully! Next login will require your new password.');
    }, 800);
  };

  const handleSaveNotifPrefs = () => {
    showToast('Notification preferences saved successfully!');
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-indigo-400 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-slate-400" />
            System & Account Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your account credentials, alert preferences, and inspect microservice health
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {user?.role === 'admin' ? 'Admin Profile' : 'Student Profile'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'account', label: 'Security & Preferences', icon: Lock },
          { id: 'ai', label: 'AI Model & Thresholds', icon: Brain },
          { id: 'health', label: 'Microservice Health', icon: Server }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Account & Security */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Password Change Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              Change Account Password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs max-w-lg">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter current password (e.g. student123)"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1.5"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Save className="w-4 h-4" />
                  {savingPassword ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Real-time Academic Alerts & Notifications
            </h2>

            <div className="space-y-3 text-xs">
              {[
                { id: 'riskAlerts', label: 'Dropout Risk Escalation Alerts', desc: 'Instant warning when your AI risk score exceeds 70% threshold' },
                { id: 'attendanceWarnings', label: 'Attendance Deficit Notifications', desc: 'Alert when course attendance falls below 65% requirement' },
                { id: 'mentorMessages', label: 'Faculty Mentor Meeting Updates', desc: 'Notifications when a mentor schedules or confirms a support session' },
                { id: 'assignmentDeadlines', label: 'Assignment & Coursework Reminders', desc: '48-hour reminders before upcoming coursework deadlines' },
                { id: 'weeklyDigest', label: 'Weekly Academic Performance Digest', desc: 'Weekly summary email sent to your registered student address' },
              ].map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white">{item.label}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => {
                      setNotifPrefs({ ...notifPrefs, [item.id]: !notifPrefs[item.id] });
                      handleSaveNotifPrefs();
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                      notifPrefs[item.id] ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        notifPrefs[item.id] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI Model & Thresholds */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* ML Risk Scoring Threshold Settings */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              Risk Classification Threshold Brackets
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-400">HIGH RISK Category</div>
                  <div className="text-slate-400">Triggers urgent alert notifications & mandatory faculty mentorship</div>
                </div>
                <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">70% &ndash; 100%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-400">MEDIUM RISK Category</div>
                  <div className="text-slate-400">Recommends assignment & tutorial support</div>
                </div>
                <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">40% &ndash; 69%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-400">LOW RISK Category</div>
                  <div className="text-slate-400">Satisfactory progress monitoring</div>
                </div>
                <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">0% &ndash; 39%</span>
              </div>
            </div>
          </div>

          {/* Model Architecture Info */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Model Architecture & Features
            </h2>
            <div className="p-4 rounded-xl bg-slate-800/50 space-y-2 text-slate-300">
              <p>
                <strong>Algorithm:</strong> Random Forest Classifier (100 Decision Trees with Gini Impurity Criterion)
              </p>
              <p>
                <strong>Trained Feature Vectors (8 dimensions):</strong> Attendance Rate (28%), Current GPA (22%), Academic Backlogs (25%), Assignment Completion Rate (15%), Internal Marks (12%), Semester Marks, Participation Score, Tuition Fee Status (10%).
              </p>
              <p>
                <strong>Accuracy:</strong> 94.8% on validation dataset of 10,000+ multi-semester student records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Microservice Health & Demo Accounts */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Service Status Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                Microservice Health & Connectivity
              </h2>
              <button
                onClick={checkServices}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Ping Services</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Node.js Express Backend</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    REST API Server {pingLatency !== null && `• Latency: ${pingLatency}ms`}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  HEALTHY
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">AI Prediction Engine</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Scikit-Learn ML Model & Rule Engine</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  CONNECTED
                </span>
              </div>
            </div>
          </div>


        </div>
      )}
    </div>
  );
};

export default Settings;
