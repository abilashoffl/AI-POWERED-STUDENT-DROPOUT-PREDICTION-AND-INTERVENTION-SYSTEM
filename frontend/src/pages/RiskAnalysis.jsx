import React, { useState, useEffect } from 'react';
import { getStudents } from '../services/studentService';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertTriangle, TrendingDown, Users, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RiskAnalysis = () => {
  const [highRiskStudents, setHighRiskStudents] = useState([]);
  const [mediumRiskStudents, setMediumRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const all = await getStudents();
      setHighRiskStudents(all.filter((s) => s.currentRiskLevel === 'HIGH'));
      setMediumRiskStudents(all.filter((s) => s.currentRiskLevel === 'MEDIUM'));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner label="Evaluating risk metrics..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          Student Risk Factor Analysis
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep-dive evaluation of high-risk indicators requiring immediate intervention
        </p>
      </div>

      {/* High Risk Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            Critical High Risk Candidates ({highRiskStudents.length})
          </h2>
          <span className="text-xs text-slate-400">Dropout Probability &ge; 70%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highRiskStudents.length === 0 ? (
            <p className="text-xs text-slate-400">No students currently flagged in High Risk category.</p>
          ) : (
            highRiskStudents.map((s) => (
              <div
                key={s._id}
                onClick={() => navigate(`/admin/students/${s.studentId}`)}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-rose-500/50 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm">{s.name}</span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">({s.studentId})</span>
                  </div>
                  <RiskBadge level={s.currentRiskLevel} score={s.currentRiskScore} />
                </div>
                <div className="text-xs text-slate-300">
                  {s.department} • Year {s.year} • GPA: {s.currentGpa.toFixed(1)} • Attendance: {s.attendance}%
                </div>
                <div className="pt-2 border-t border-slate-700/50">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">Key Triggers:</div>
                  <div className="flex flex-wrap gap-1">
                    {s.currentRiskFactors?.map((f, i) => (
                      <span key={i} className="text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Medium Risk Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            Moderate Risk Candidates ({mediumRiskStudents.length})
          </h2>
          <span className="text-xs text-slate-400">Dropout Probability 40-69%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mediumRiskStudents.map((s) => (
            <div
              key={s._id}
              onClick={() => navigate(`/admin/students/${s.studentId}`)}
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-amber-500/50 cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm">{s.name}</span>
                  <span className="text-xs text-slate-400 ml-2 font-mono">({s.studentId})</span>
                </div>
                <RiskBadge level={s.currentRiskLevel} score={s.currentRiskScore} />
              </div>
              <div className="text-xs text-slate-300">
                {s.department} • Year {s.year} • GPA: {s.currentGpa.toFixed(1)} • Attendance: {s.attendance}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
