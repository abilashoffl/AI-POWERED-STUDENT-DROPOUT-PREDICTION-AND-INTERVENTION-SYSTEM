import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  ArrowRight,
  Brain,
  BookOpen,
  Users,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Lock
} from 'lucide-react';

const PortalSelection = () => {
  return (
    <div className="w-full max-w-5xl py-8">
      {/* Brand Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg mb-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold text-white tracking-tight">EduPredict AI</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
            Institutional Gateway
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
          Select Your Access Portal
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 max-w-xl mx-auto">
          Choose your institutional role below to proceed to your dedicated sign-in portal.
        </p>
      </div>

      {/* Two Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Student Portal */}
        <div className="group relative bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:shadow-emerald-500/10 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all"></div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <GraduationCap className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Students
              </span>
            </div>

            <h2 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">
              Student Academic Portal
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Dedicated portal for enrolled college students to track personal academic performance, view calculated dropout risk levels, and access assigned remedial mentoring.
            </p>

            <div className="space-y-3 pt-4 border-t border-slate-800/80 mb-8">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Attendance, GPA trajectory & backlog tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Personalized risk factor diagnosis & advice</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Assigned faculty mentor sessions & schedules</span>
              </div>
            </div>
          </div>

          <Link
            to="/student/login"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all duration-200 group-hover:gap-3"
          >
            <span>Proceed to Student Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Administrator & Faculty Portal */}
        <div className="group relative bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:shadow-blue-500/10 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/15 transition-all"></div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Shield className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Faculty & Staff
              </span>
            </div>

            <h2 className="text-2xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">
              Administrator & Faculty Portal
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Institutional command center for academic administrators, department heads, and faculty mentors to monitor at-risk cohorts and deploy automated interventions.
            </p>

            <div className="space-y-3 pt-4 border-t border-slate-800/80 mb-8">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Random Forest AI Dropout Risk Prediction (0–100%)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Student CRUD management & batch record audits</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Rule-based intervention workflows & mentor assignment</span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/login"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all duration-200 group-hover:gap-3"
          >
            <span>Proceed to Administrator Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-[11px] text-slate-500 flex items-center justify-center gap-4">
        <span>AI-Powered Student Dropout Prediction & Intervention System</span>
        <span>•</span>
        <span>Enterprise Gateway</span>
        <span>•</span>
        <span>Version 1.0</span>
      </div>
    </div>
  );
};

export default PortalSelection;
