import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  BookOpen,
  AlertCircle,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const StudentLogin = () => {
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

      // Verify that this account is a student
      if (data.user.role !== 'student') {
        logout();
        setLoading(false);
        setErrorMessage('Access Denied: Administrator account detected. Please use the Administrator Portal.');
        return;
      }

      setLoading(false);
      navigate('/student/dashboard');
    } catch (error) {
      setLoading(false);
      setErrorMessage(
        error.response?.data?.message || 'Invalid student credentials. Please verify your email and password.'
      );
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSuccess(`Password reset instructions sent to ${forgotEmail}. Please check your student inbox.`);
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Left Column: Student Academic Theme */}
      <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">EduPredict AI</h1>
              <p className="text-xs text-emerald-400 font-semibold">Student Academic Portal</p>
            </div>
          </div>

          <div className="space-y-4 my-8">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Student Access Only
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
              Track Your Progress & Stay On Course
            </h2>
            <p className="text-xs lg:text-sm text-slate-400 leading-relaxed">
              Log in to view your GPA progression, attendance metrics, active risk score indicators, and connect with faculty mentors for academic guidance.
            </p>
          </div>

          {/* Graphic Feature Cards */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
              <BookOpen className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-xs font-bold text-white">Academic Metrics</div>
              <div className="text-[11px] text-slate-400">Attendance, marks & backlog tracking</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-teal-400 mb-2" />
              <div className="text-xs font-bold text-white">Remedial Mentoring</div>
              <div className="text-[11px] text-slate-400">Personalized faculty intervention plans</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Student Information Portal</span>
          <span>Version 1.0</span>
        </div>
      </div>

      {/* Right Column: Student Login Form */}
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
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Student Verification
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white">Student Portal Sign In</h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter your college email and password to access your student profile
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
                Username / Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@student"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
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
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Verifying Student Account...' : 'Sign In to Student Portal'}
            </button>
          </form>

          {/* Quick link to admin login */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              to="/admin/login"
              className="text-xs text-slate-400 hover:text-blue-400 inline-flex items-center gap-1.5 transition-colors font-medium"
            >
              <span>Are you a faculty mentor or administrator?</span>
              <span className="font-bold underline">Go to Admin Portal →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-white">Reset Student Password</h3>
            <p className="text-xs text-slate-400">
              Enter your registered student email to receive recovery instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl">
                {forgotSuccess}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="alex.vance@student.college.edu"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
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

export default StudentLogin;
