import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Brain,
  ShieldCheck,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const data = await login(email, password);

      // Verify that this account is an administrator
      if (data.user.role !== 'admin') {
        logout();
        setLoading(false);
        setErrorMessage('Access Denied: This account does not have administrator privileges. Please use the Student Portal.');
        return;
      }

      setLoading(false);
      navigate('/admin/dashboard');
    } catch (error) {
      setLoading(false);
      setErrorMessage(
        error.response?.data?.message || 'Invalid administrator credentials. Please verify your email and password.'
      );
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSuccess(`Password recovery link sent to ${forgotEmail}. Please check your administrator inbox.`);
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Left Column: Admin & Institutional Intelligence Theme */}
      <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">EduPredict AI</h1>
              <p className="text-xs text-blue-400 font-semibold">Administrator & Faculty Portal</p>
            </div>
          </div>

          <div className="space-y-4 my-8">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Institutional Staff & Mentors
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
              Early Warning Intelligence & Intervention Management
            </h2>
            <p className="text-xs lg:text-sm text-slate-400 leading-relaxed">
              Institutional command platform for faculty committees, student counselors, and academic administrators to run ML predictive models and assign remedial workflows.
            </p>
          </div>

          {/* Graphic Feature Cards */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
              <Brain className="w-5 h-5 text-blue-400 mb-2" />
              <div className="text-xs font-bold text-white">Random Forest ML</div>
              <div className="text-[11px] text-slate-400">Dropout risk score calculation</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-indigo-400 mb-2" />
              <div className="text-xs font-bold text-white">Intervention Engine</div>
              <div className="text-[11px] text-slate-400">Targeted mentor allocation</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Enterprise Academic System</span>
          <span>Version 1.0</span>
        </div>
      </div>

      {/* Right Column: Admin Login Form */}
      <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-slate-900">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Back Navigation */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Portal Selection</span>
          </Link>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Staff Authentication
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white">Administrator Portal Sign In</h3>
            <p className="text-xs text-slate-400 mt-1">
              Sign in with institutional administrator or faculty credentials
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Administrator / Faculty Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@college.edu"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-400 hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Authenticating Staff Profile...' : 'Sign In to Administrator Dashboard'}
            </button>
          </form>

          {/* Quick link to student login */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              to="/student/login"
              className="text-xs text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1.5 transition-colors font-medium"
            >
              <span>Are you an enrolled student?</span>
              <span className="font-bold underline">Go to Student Portal →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-white">Reset Administrator Password</h3>
            <p className="text-xs text-slate-400">
              Enter your registered administrator email to receive recovery instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded-xl">
                {forgotSuccess}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@college.edu"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Send Recovery Link
                </button>
              </form>
            )}

            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccess('');
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
