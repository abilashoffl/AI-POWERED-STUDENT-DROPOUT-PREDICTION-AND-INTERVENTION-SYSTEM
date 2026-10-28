import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById } from '../services/studentService';
import { createPrediction } from '../services/predictionService';
import { createIntervention } from '../services/interventionService';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import InterventionModal from '../components/InterventionModal';
import {
  User,
  GraduationCap,
  Brain,
  AlertCircle,
  CheckCircle2,
  HeartHandshake,
  TrendingDown,
  Sparkles,
  Calendar,
  Phone,
  Mail,
  ArrowLeft,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [intModalOpen, setIntModalOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getStudentById(id);
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleRecalculateRisk = async () => {
    if (!data?.student) return;
    setPredicting(true);
    try {
      await createPrediction({ studentId: data.student.studentId });
      await fetchProfile();
    } catch (e) {
      console.error(e);
    }
    setPredicting(false);
  };

  const handleCreateInterventionFromRec = (rec) => {
    setSelectedRecommendation(rec);
    setIntModalOpen(true);
  };

  const handleInterventionSubmit = async (payload) => {
    await createIntervention(payload);
    await fetchProfile();
  };

  if (loading) return <LoadingSpinner label="Loading student academic profile & ML logs..." />;

  if (!data?.student) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Student Record Not Found</h3>
        <button
          onClick={() => navigate('/admin/students')}
          className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
        >
          Return to Roster
        </button>
      </div>
    );
  }

  const { student, predictions = [], interventions = [], recommendations = [] } = data;

  // Chart data mapping
  const chartData = predictions.map((p) => ({
    date: new Date(p.predictionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    riskScore: p.riskScore
  }));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/students')}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              {student.name}
              <RiskBadge level={student.currentRiskLevel} score={student.currentRiskScore} />
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ID: <span className="font-mono text-slate-300">{student.studentId}</span> • {student.department} • Year {student.year} (Sec {student.section})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculateRisk}
            disabled={predicting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
          >
            <Brain className="w-4 h-4 text-purple-400" />
            {predicting ? 'Running ML Model...' : 'Trigger AI Prediction'}
          </button>
          <button
            onClick={() => {
              setSelectedRecommendation(null);
              setIntModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
          >
            <HeartHandshake className="w-4 h-4" />
            Assign Intervention
          </button>
        </div>
      </div>

      {/* Grid: Overview Cards & AI Risk Model Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal & Academic Metrics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              Personal & Guardian Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Gender & DOB:</span>
                <span>{student.gender} • {student.dob || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Student Email:</span>
                <span className="font-mono">{student.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Phone:</span>
                <span>{student.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Tuition Fee Status:</span>
                <span className={student.feeStatus === 1 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {student.feeStatus === 1 ? 'Paid' : 'Pending Dues'}
                </span>
              </div>
              {student.parentContact && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Guardian Contact</div>
                  <div className="text-slate-200 font-semibold">{student.parentContact.name || 'N/A'}</div>
                  <div className="text-slate-400">{student.parentContact.phone}</div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              Academic Performance Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-xl">
                <div className="text-[11px] text-slate-400">Attendance</div>
                <div className={`text-xl font-bold ${student.attendance < 65 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {student.attendance}%
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl">
                <div className="text-[11px] text-slate-400">Current GPA</div>
                <div className="text-xl font-bold text-white">{student.currentGpa.toFixed(1)}</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl">
                <div className="text-[11px] text-slate-400">Previous GPA</div>
                <div className="text-xl font-bold text-slate-300">{student.previousGpa?.toFixed(1) || 'N/A'}</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl">
                <div className="text-[11px] text-slate-400">Backlogs</div>
                <div className={`text-xl font-bold ${student.backlogs > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {student.backlogs}
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl">
                <div className="text-[11px] text-slate-400">Assignments</div>
                <div className="text-xl font-bold text-slate-200">{student.assignmentCompletion}%</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl">
                <div className="text-[11px] text-slate-400">Internal Marks</div>
                <div className="text-xl font-bold text-slate-200">{student.internalMarks}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Prediction & Risk Factors */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Prediction Highlight Box */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-850 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Dropout Risk Prediction</h2>
                  <p className="text-[11px] text-slate-400">Early-warning machine learning risk analysis</p>
                </div>
              </div>
              <RiskBadge level={student.currentRiskLevel} score={student.currentRiskScore} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                <div className="text-xs text-slate-400">Calculated Risk Score</div>
                <div className="text-3xl font-black text-white mt-1">{student.currentRiskScore}%</div>
                <div className="text-[10px] text-slate-500 mt-1">Random Forest Model v1.0</div>
              </div>
              <div className="md:col-span-2 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-2">
                <div className="text-xs font-bold text-slate-300">Major Influencing Risk Factors:</div>
                <ul className="space-y-1 text-xs">
                  {student.currentRiskFactors && student.currentRiskFactors.length > 0 ? (
                    student.currentRiskFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-rose-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        {factor}
                      </li>
                    ))
                  ) : (
                    <li className="text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> No high-risk factors detected
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 italic">
              * Note: This score is an early-warning risk estimation designed for academic guidance and does not guarantee student dropout.
            </div>
          </div>

          {/* Automatic Intervention Recommendations */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Automated Intervention Recommendations
            </h3>
            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-xs text-slate-400">No active intervention triggers at this time.</p>
              ) : (
                recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{rec.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          rec.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
                    </div>
                    <button
                      onClick={() => handleCreateInterventionFromRec(rec)}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
                    >
                      Implement Plan
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Prediction History Graph */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Risk Progression Trajectory Over Time
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="riskScore" name="Risk Score (%)" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interventions Timeline */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assigned Interventions ({interventions.length})
            </h3>
            <div className="space-y-3">
              {interventions.length === 0 ? (
                <p className="text-xs text-slate-400">No interventions assigned yet.</p>
              ) : (
                interventions.map((int) => (
                  <div key={int._id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{int.title}</div>
                      <div className="text-slate-400 mt-0.5">
                        Mentor: <span className="text-slate-200">{int.mentorName}</span> • Category: {int.type}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      int.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      int.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {int.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal to Assign Intervention */}
      <InterventionModal
        isOpen={intModalOpen}
        onClose={() => setIntModalOpen(false)}
        onSubmit={handleInterventionSubmit}
        prefilledStudentId={student.studentId}
        defaultType={selectedRecommendation?.type}
      />
    </div>
  );
};

export default StudentProfile;
