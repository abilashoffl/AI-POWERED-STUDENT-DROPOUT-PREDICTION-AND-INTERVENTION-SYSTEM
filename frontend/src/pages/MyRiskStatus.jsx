import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentById, requestSupport } from '../services/studentService';
import { getPredictionHistoryByStudent, createPrediction, simulatePrediction } from '../services/predictionService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Brain, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Info,
  Sliders, ArrowRight, HeartHandshake, CheckCircle, HelpCircle, Send, X, Sparkles, TrendingDown,
  User, BarChart3, GraduationCap
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine
} from 'recharts';

const MyRiskStatus = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Help Request Modal
  const [showCounselingModal, setShowCounselingModal] = useState(false);
  const [counselingReason, setCounselingReason] = useState('');
  const [submittingCounseling, setSubmittingCounseling] = useState(false);

  // Live Simulator sliders
  const [simValues, setSimValues] = useState({
    attendance: 45,
    currentGpa: 4.8,
    backlogs: 4,
    assignmentCompletion: 38,
    internalMarks: 42,
    semesterMarks: 45,
    feeStatus: 0
  });

  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    const sid = user?.studentId || user?.studentProfile?.studentId;
    if (sid) {
      fetchData(sid);
    } else if (user?.studentProfile) {
      setStudent(user.studentProfile);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async (id) => {
    setLoading(true);
    try {
      const [sRes, pRes] = await Promise.all([
        getStudentById(id),
        getPredictionHistoryByStudent(id)
      ]);
      const resolvedStudent = sRes?.student || user?.studentProfile;
      setStudent(resolvedStudent);
      setPredictions(pRes || sRes?.predictions || []);
      if (resolvedStudent) {
        const initial = {
          attendance: resolvedStudent.attendance,
          currentGpa: resolvedStudent.currentGpa,
          backlogs: resolvedStudent.backlogs,
          assignmentCompletion: resolvedStudent.assignmentCompletion,
          internalMarks: resolvedStudent.internalMarks,
          semesterMarks: resolvedStudent.semesterMarks,
          feeStatus: resolvedStudent.feeStatus
        };
        setSimValues(initial);
        runLiveSim(initial, resolvedStudent);
      }
    } catch (e) {
      console.error(e);
      if (user?.studentProfile) {
        setStudent(user.studentProfile);
      }
    }
    setLoading(false);
  };

  const runLiveSim = async (vals, studentObj) => {
    const s = studentObj || student;
    try {
      const res = await simulatePrediction({
        attendance: vals.attendance,
        currentGpa: vals.currentGpa,
        previousGpa: s?.previousGpa || 5.6,
        backlogs: vals.backlogs,
        assignmentCompletion: vals.assignmentCompletion,
        internalMarks: vals.internalMarks,
        semesterMarks: vals.semesterMarks,
        participation: s?.participation || 50,
        feeStatus: vals.feeStatus
      });
      setSimResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecalculate = async () => {
    if (!student) return;
    setRecalculating(true);
    try {
      await createPrediction({
        studentId: student.studentId,
        attendance: simValues.attendance,
        currentGpa: simValues.currentGpa,
        backlogs: simValues.backlogs,
        assignmentCompletion: simValues.assignmentCompletion,
        internalMarks: simValues.internalMarks,
        feeStatus: simValues.feeStatus
      });
      await fetchData(student.studentId);
      showToast('AI Risk Assessment re-evaluated and saved!');
    } catch (e) {
      console.error(e);
      showToast('Failed to re-evaluate risk score.');
    }
    setRecalculating(false);
  };

  const handleCounselingRequest = async (e) => {
    e.preventDefault();
    setSubmittingCounseling(true);
    try {
      await requestSupport({
        studentId: user?.studentId || student?.studentId,
        title: 'Urgent Dropout Risk Counseling Request',
        type: 'Academic counselling',
        reason: counselingReason || 'Student requested immediate academic counselling regarding high risk indicators.',
        mentorName: 'Dr. Alan Turing'
      });
      showToast('Counseling request submitted to Dean & Mentors!');
      setShowCounselingModal(false);
      setCounselingReason('');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit counseling request.');
    }
    setSubmittingCounseling(false);
  };

  if (loading) return <LoadingSpinner label="Fetching AI risk assessment data..." />;
  if (!student) return <div className="text-slate-400 p-8">Profile not linked. Contact admin.</div>;

  const currentRiskScore = student.currentRiskScore || 0;
  const currentRiskLevel = student.currentRiskLevel || 'LOW';

  const riskColor = currentRiskLevel === 'HIGH' ? '#EF4444' : currentRiskLevel === 'MEDIUM' ? '#F59E0B' : '#10B981';
  const riskBg = currentRiskLevel === 'HIGH' ? 'from-rose-950/40 via-slate-900 to-rose-950/10 border-rose-500/30'
    : currentRiskLevel === 'MEDIUM' ? 'from-amber-950/40 via-slate-900 to-amber-950/10 border-amber-500/30'
    : 'from-emerald-950/40 via-slate-900 to-emerald-950/10 border-emerald-500/30';

  const trendData = predictions.map(p => ({
    date: new Date(p.predictionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    risk: p.riskScore,
  }));

  const gaugeAngle = (currentRiskScore / 100) * 180;
  const simGaugeAngle = simResult ? (simResult.simulatedRiskScore / 100) * 180 : gaugeAngle;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-indigo-400 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI Dropout Risk Assessment & Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Machine Learning early-warning model — evaluating attendance, GPA, backlogs, and assignment patterns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCounselingModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/25"
          >
            <HeartHandshake className="w-4 h-4" />
            Request Academic Counseling
          </button>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin text-purple-400' : ''}`} />
            {recalculating ? 'Evaluating...' : 'Refresh Score'}
          </button>
        </div>
      </div>

      {/* Linked Student Profile & Academic Hub Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white">{student.name}</span> ({student.studentId}) • {student.department} (Year {student.year})
            <div className="text-[11px] text-slate-400">
              GPA: <strong className="text-blue-400">{student.currentGpa.toFixed(1)}</strong> • Attendance: <strong className="text-emerald-400">{student.attendance}%</strong> • Backlogs: <strong className="text-rose-400">{student.backlogs}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student/profile"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>My Profile</span>
          </Link>
          <Link
            to="/student/performance"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-1.5 transition-all"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Academic Analytics ↗</span>
          </Link>
        </div>
      </div>

      {/* Main Dual Gauge & Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Baseline Risk Card */}
        <div className={`lg:col-span-6 glass-panel p-6 rounded-3xl bg-gradient-to-br ${riskBg} border text-center space-y-4 flex flex-col justify-between`}>
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 text-slate-300 border border-slate-700">
              Current Official Assessment
            </span>

            {/* Gauge */}
            <div className="flex justify-center mt-3">
              <div className="relative w-52 h-28 overflow-hidden">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 85 24" fill="none" stroke="#10B981" strokeWidth="16" strokeLinecap="round" opacity="0.3" />
                  <path d="M 85 24 A 80 80 0 0 1 155 36" fill="none" stroke="#F59E0B" strokeWidth="16" strokeLinecap="round" opacity="0.3" />
                  <path d="M 155 36 A 80 80 0 0 1 180 100" fill="none" stroke="#EF4444" strokeWidth="16" strokeLinecap="round" opacity="0.3" />
                  <line
                    x1="100" y1="100"
                    x2={100 + 70 * Math.cos(Math.PI - (gaugeAngle * Math.PI / 180))}
                    y2={100 - 70 * Math.sin(Math.PI - (gaugeAngle * Math.PI / 180))}
                    stroke={riskColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="100" r="6" fill={riskColor} />
                </svg>
              </div>
            </div>

            <div className="text-5xl font-black mt-2" style={{ color: riskColor }}>
              {currentRiskScore}%
            </div>
            <div className="text-base font-extrabold text-white mt-1">
              {currentRiskLevel === 'HIGH' ? '⚠️ HIGH RISK (ACTION REQUIRED)' : currentRiskLevel === 'MEDIUM' ? '⚡ MODERATE RISK' : '✅ LOW RISK (SAFE)'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Model: Random Forest Classifier v1.0.0 (Ensemble 100 Trees)
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left text-xs text-slate-300">
            {currentRiskLevel === 'HIGH'
              ? 'Your profile contains multiple critical risk factors (low attendance, active backlogs). Faculty mentoring is active.'
              : currentRiskLevel === 'MEDIUM'
              ? 'Moderate risk factors detected. Focus on attendance and coursework submission.'
              : 'Satisfactory academic progress. Keep maintaining this consistency!'}
          </div>
        </div>

        {/* Live Simulator Projected Gauge */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/20 border border-indigo-500/30 text-center space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Simulated Projection
              </span>
            </div>

            {/* Sim Gauge */}
            <div className="flex justify-center mt-3">
              <div className="relative w-52 h-28 overflow-hidden">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 85 24" fill="none" stroke="#10B981" strokeWidth="16" strokeLinecap="round" opacity="0.3" />
                  <path d="M 85 24 A 80 80 0 0 1 155 36" fill="none" stroke="#F59E0B" strokeWidth="16" strokeLinecap="round" opacity="0.3" />
                  <path d="M 155 36 A 80 80 0 0 1 180 100" fill="none" stroke="#EF4444" strokeWidth="16" strokeLinecap="round" opacity="0.3" />
                  <line
                    x1="100" y1="100"
                    x2={100 + 70 * Math.cos(Math.PI - (simGaugeAngle * Math.PI / 180))}
                    y2={100 - 70 * Math.sin(Math.PI - (simGaugeAngle * Math.PI / 180))}
                    stroke="#A855F7"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="100" r="6" fill="#A855F7" />
                </svg>
              </div>
            </div>

            <div className="text-5xl font-black text-purple-400 mt-2">
              {simResult ? simResult.simulatedRiskScore : currentRiskScore}%
            </div>
            <div className="text-base font-extrabold text-white mt-1">
              {simResult ? `${simResult.simulatedRiskLevel} RISK PROJECTED` : 'ADJUST SLIDERS BELOW'}
            </div>
            <div className="text-[11px] text-emerald-400 font-bold mt-1">
              Potential Risk Reduction: -{Math.max(0, currentRiskScore - (simResult?.simulatedRiskScore || currentRiskScore))}%
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-left text-xs text-indigo-200">
            💡 Move the interactive sliders below to discover exactly how many classes you need to attend or backlogs you need to clear to reach Low Risk!
          </div>
        </div>
      </div>

      {/* Interactive Sliders Control Deck */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            Interactive Risk Variable Adjustment Deck
          </h2>
          <button
            onClick={() => {
              const reset = {
                attendance: student.attendance,
                currentGpa: student.currentGpa,
                backlogs: student.backlogs,
                assignmentCompletion: student.assignmentCompletion,
                internalMarks: student.internalMarks,
                semesterMarks: student.semesterMarks,
                feeStatus: student.feeStatus
              };
              setSimValues(reset);
              runLiveSim(reset, student);
            }}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold"
          >
            Reset All Sliders
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Attendance Slider */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Attendance Rate</span>
              <span className="text-blue-400">{simValues.attendance}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              value={simValues.attendance}
              onChange={(e) => {
                const next = { ...simValues, attendance: Number(e.target.value) };
                setSimValues(next);
                runLiveSim(next);
              }}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">Weight: 28% in ML model</div>
          </div>

          {/* Current GPA Slider */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Academic GPA</span>
              <span className="text-purple-400">{simValues.currentGpa.toFixed(1)} / 10</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="10.0"
              step="0.1"
              value={simValues.currentGpa}
              onChange={(e) => {
                const next = { ...simValues, currentGpa: Number(e.target.value) };
                setSimValues(next);
                runLiveSim(next);
              }}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">Weight: 22% in ML model</div>
          </div>

          {/* Backlogs Slider */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Active Backlogs</span>
              <span className={simValues.backlogs > 0 ? 'text-rose-400' : 'text-emerald-400'}>{simValues.backlogs} subjects</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              value={simValues.backlogs}
              onChange={(e) => {
                const next = { ...simValues, backlogs: Number(e.target.value) };
                setSimValues(next);
                runLiveSim(next);
              }}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">Weight: 25% in ML model</div>
          </div>

          {/* Assignment Completion Slider */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Assignment Completion</span>
              <span className="text-amber-400">{simValues.assignmentCompletion}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={simValues.assignmentCompletion}
              onChange={(e) => {
                const next = { ...simValues, assignmentCompletion: Number(e.target.value) };
                setSimValues(next);
                runLiveSim(next);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">Weight: 15% in ML model</div>
          </div>

          {/* Internal Marks Slider */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Internal Marks</span>
              <span className="text-indigo-400">{simValues.internalMarks}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              value={simValues.internalMarks}
              onChange={(e) => {
                const next = { ...simValues, internalMarks: Number(e.target.value) };
                setSimValues(next);
                runLiveSim(next);
              }}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">Weight: 12% in ML model</div>
          </div>

          {/* Fee Status Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Tuition Fee Status</span>
              <span className={simValues.feeStatus === 1 ? 'text-emerald-400' : 'text-rose-400'}>
                {simValues.feeStatus === 1 ? 'Paid ✓' : 'Pending ✗'}
              </span>
            </div>
            <button
              onClick={() => {
                const next = { ...simValues, feeStatus: simValues.feeStatus === 1 ? 0 : 1 };
                setSimValues(next);
                runLiveSim(next);
              }}
              className={`w-full py-2 rounded-lg font-bold text-xs mt-2 border transition-all ${
                simValues.feeStatus === 1
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              Toggle: {simValues.feeStatus === 1 ? 'Switch to Pending' : 'Mark as Paid'}
            </button>
            <div className="text-[10px] text-slate-500 mt-1">Weight: 10% in ML model</div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Risk Mitigation Roadmap */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-emerald-400" />
          Recommended 4-Step Risk Mitigation Roadmap
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center">1</div>
            <div className="font-bold text-white">Attendance Recovery</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Attend the next 15 consecutive lectures without absence to raise aggregate to ≥65%.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center">2</div>
            <div className="font-bold text-white">Backlog Clearance</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Register for supplementary exams in Database Systems and OS to reduce backlogs from 4 to 2.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">3</div>
            <div className="font-bold text-white">Coursework Catch-up</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Complete pending assignments 2 and 4 to push assignment score from 38% to 65%.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">4</div>
            <div className="font-bold text-white">Fee Regularization</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Submit installment application or scholarship documentation to accounts office.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Risk Trend Chart */}
      {trendData.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Risk Score Trajectory Over Past Months</h2>
            <span className="text-xs text-purple-400 font-mono">Current: {currentRiskScore}%</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'HIGH (70%)', fill: '#EF4444', fontSize: 10 }} />
                <ReferenceLine y={40} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'MED (40%)', fill: '#F59E0B', fontSize: 10 }} />
                <Line type="monotone" dataKey="risk" name="Risk Score (%)" stroke="#A855F7" strokeWidth={3} dot={{ r: 5, fill: '#A855F7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* COUNSELING REQUEST MODAL */}
      {showCounselingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-700 w-full max-w-md space-y-4 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-purple-400" />
                  Request Academic Counseling
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Faculty Guidance & Support Session</p>
              </div>
              <button
                onClick={() => setShowCounselingModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCounselingRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason / Academic Challenge</label>
                <textarea
                  rows="4"
                  placeholder="Explain your situation (e.g. attendance shortfall due to personal circumstances, difficulty understanding coursework, exam stress)..."
                  value={counselingReason}
                  onChange={(e) => setCounselingReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 resize-none"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] leading-relaxed">
                Your request will be confidentially forwarded to your assigned mentor Dr. Alan Turing and academic counselor.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCounselingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCounseling}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submittingCounseling ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRiskStatus;
