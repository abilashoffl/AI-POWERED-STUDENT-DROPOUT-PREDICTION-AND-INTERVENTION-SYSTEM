import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentById, requestSupport } from '../services/studentService';
import { studentInterventionAction } from '../services/interventionService';
import { simulatePrediction } from '../services/predictionService';
import RiskBadge from '../components/RiskBadge';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  GraduationCap,
  Brain,
  BookOpen,
  Calendar,
  AlertTriangle,
  Sparkles,
  HeartHandshake,
  CheckCircle,
  Clock,
  TrendingUp,
  FileCheck,
  PlusCircle,
  Sliders,
  Send,
  Download,
  CheckSquare,
  Square,
  MessageSquare,
  UserCheck,
  ArrowRight,
  X,
  HelpCircle,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(null); // holds intervention object
  const [noteText, setNoteText] = useState('');
  const [meetingDate, setMeetingDate] = useState('');

  // Support Request form state
  const [supportForm, setSupportForm] = useState({
    type: 'Academic counselling',
    title: '',
    reason: '',
    preferredDate: '',
    mentorName: 'Dr. Alan Turing'
  });
  const [submittingSupport, setSubmittingSupport] = useState(false);

  // Simulation form state
  const [simParams, setSimParams] = useState({
    attendance: 45,
    currentGpa: 4.8,
    backlogs: 4,
    assignmentCompletion: 38,
    internalMarks: 42,
    feeStatus: 0
  });
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Local checklist of action plans
  const [completedActions, setCompletedActions] = useState(() => {
    try {
      const saved = localStorage.getItem(`actions_${user?.studentId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const sid = user?.studentId || user?.studentProfile?.studentId;
    if (sid) {
      fetchStudentDetails(sid);
    } else if (user?.studentProfile) {
      setStudentData({ student: user.studentProfile });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchStudentDetails = async (studentId) => {
    setLoading(true);
    try {
      const data = await getStudentById(studentId);
      const studentObj = data?.student || user?.studentProfile;
      setStudentData(data?.student ? data : { student: studentObj });
      if (studentObj) {
        setSimParams({
          attendance: studentObj.attendance || 45,
          currentGpa: studentObj.currentGpa || 4.8,
          backlogs: studentObj.backlogs ?? 4,
          assignmentCompletion: studentObj.assignmentCompletion || 38,
          internalMarks: studentObj.internalMarks || 42,
          feeStatus: studentObj.feeStatus ?? 0
        });
      }
    } catch (e) {
      console.error(e);
      if (user?.studentProfile) {
        setStudentData({ student: user.studentProfile });
      }
    }
    setLoading(false);
  };

  const handleToggleAction = (idx) => {
    const updated = { ...completedActions, [idx]: !completedActions[idx] };
    setCompletedActions(updated);
    if (user?.studentId) {
      localStorage.setItem(`actions_${user.studentId}`, JSON.stringify(updated));
    }
    showToast(updated[idx] ? 'Action item marked as completed!' : 'Action item marked pending.');
  };

  const handleAcknowledgeIntervention = async (interventionId) => {
    try {
      await studentInterventionAction(interventionId, { action: 'acknowledge' });
      showToast('Intervention acknowledged & marked In Progress!');
      if (user?.studentId) fetchStudentDetails(user.studentId);
    } catch (e) {
      console.error(e);
      showToast('Failed to update intervention.');
    }
  };

  const handleAddInterventionNote = async () => {
    if (!showNoteModal || !noteText.trim()) return;
    try {
      await studentInterventionAction(showNoteModal._id, {
        note: noteText,
        action: meetingDate ? 'request_meeting' : 'note',
        meetingDate: meetingDate || null
      });
      showToast('Progress note submitted to your mentor!');
      setShowNoteModal(null);
      setNoteText('');
      setMeetingDate('');
      if (user?.studentId) fetchStudentDetails(user.studentId);
    } catch (e) {
      console.error(e);
      showToast('Failed to submit note.');
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSupport(true);
    try {
      await requestSupport({
        studentId: user.studentId,
        title: supportForm.title || `Support Request: ${supportForm.type}`,
        type: supportForm.type,
        reason: supportForm.reason,
        preferredDate: supportForm.preferredDate,
        mentorName: supportForm.mentorName
      });
      showToast('Support request submitted! Your mentor has been notified.');
      setShowSupportModal(false);
      setSupportForm({
        type: 'Academic counselling',
        title: '',
        reason: '',
        preferredDate: '',
        mentorName: 'Dr. Alan Turing'
      });
      if (user?.studentId) fetchStudentDetails(user.studentId);
    } catch (err) {
      console.error(err);
      showToast('Failed to submit support request.');
    }
    setSubmittingSupport(false);
  };

  const runLiveSimulation = async (updatedParams) => {
    const params = updatedParams || simParams;
    setSimulating(true);
    try {
      const res = await simulatePrediction({
        attendance: params.attendance,
        currentGpa: params.currentGpa,
        previousGpa: student?.previousGpa || 5.6,
        backlogs: params.backlogs,
        assignmentCompletion: params.assignmentCompletion,
        internalMarks: params.internalMarks,
        semesterMarks: student?.semesterMarks || 45,
        participation: student?.participation || 50,
        feeStatus: params.feeStatus
      });
      setSimResult(res);
    } catch (e) {
      console.error(e);
    }
    setSimulating(false);
  };

  const handleDownloadReport = () => {
    const content = `
=========================================
EDUPREDICT AI - STUDENT ACADEMIC DOSSIER
=========================================
Student Name: ${student.name}
Student ID: ${student.studentId}
Department: ${student.department} (Year ${student.year}, Sec ${student.section})
Date Generated: ${new Date().toLocaleString()}

-- ACADEMIC STATUS --
Current GPA: ${student.currentGpa} / 10
Attendance Rate: ${student.attendance}%
Active Backlogs: ${student.backlogs}
Assignment Completion: ${student.assignmentCompletion}%
Fee Status: ${student.feeStatus === 1 ? 'Paid' : 'Pending'}

-- AI DROPOUT RISK ASSESSMENT --
Risk Score: ${student.currentRiskScore}% (${student.currentRiskLevel} RISK)
Identified Risk Factors:
${student.currentRiskFactors?.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}

-- ACTIVE INTERVENTIONS --
${interventions.map((int, i) => `  [${i + 1}] ${int.title} (${int.type}) - Mentor: ${int.mentorName} [Status: ${int.status}]`).join('\n')}

Generated by EduPredict AI System
=========================================
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Academic_Dossier_${student.studentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Academic Dossier downloaded successfully!');
  };

  if (loading) return <LoadingSpinner label="Loading student performance portal..." />;

  const student = studentData?.student || user?.studentProfile;
  const interventions = studentData?.interventions || [];
  const recommendations = studentData?.recommendations || [];

  if (!student) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
        <GraduationCap className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Student Profile Not Linked</h3>
        <p className="text-xs text-slate-400">Please contact institution admin to map your student ID.</p>
      </div>
    );
  }

  // Academic charts data
  const gpaProgression = [
    { term: 'Sem 1', gpa: 7.8, target: 8.0 },
    { term: 'Sem 2', gpa: 7.5, target: 8.0 },
    { term: 'Sem 3', gpa: student.previousGpa || 7.2, target: 8.0 },
    { term: 'Sem 4 (Current)', gpa: student.currentGpa, target: 8.0 }
  ];

  const subjectPerformance = [
    { subject: 'Data Structures', internal: student.internalMarks, semester: student.semesterMarks },
    { subject: 'Algorithms', internal: Math.min(100, student.internalMarks + 8), semester: Math.min(100, student.semesterMarks + 5) },
    { subject: 'Database Systems', internal: Math.max(35, student.internalMarks - 6), semester: Math.max(35, student.semesterMarks - 4) },
    { subject: 'Operating Systems', internal: student.internalMarks, semester: student.semesterMarks },
    { subject: 'Networks & Security', internal: Math.min(100, student.internalMarks + 4), semester: Math.min(100, student.semesterMarks + 3) }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-indigo-400 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Welcome Banner with Quick Actions */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Student Dashboard
            </span>
            <span className="text-xs text-slate-400">• Year {student.year}, Section {student.section}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Welcome back, {student.name}!</h1>
          <p className="text-xs text-slate-400 mt-1">
            Student ID: <span className="font-mono text-blue-400 font-bold">{student.studentId}</span> • {student.department} • Status: <span className="text-emerald-400 font-semibold">Active Enrollment</span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setShowSimulatorModal(true);
              runLiveSimulation(simParams);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all shadow-lg shadow-purple-500/10"
          >
            <Sliders className="w-4 h-4 text-purple-400" />
            What-If Risk Simulator
          </button>

          <button
            onClick={() => setShowSupportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25"
          >
            <PlusCircle className="w-4 h-4" />
            Request Faculty Help
          </button>

          <button
            onClick={handleDownloadReport}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all"
            title="Download Academic Dossier"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Current GPA" value={student.currentGpa.toFixed(1)} subtitle="Scale 0 - 10" icon={BookOpen} color={student.currentGpa < 5.5 ? 'red' : 'blue'} />
        <StatCard title="Attendance Rate" value={`${student.attendance}%`} subtitle="Class attendance" icon={Calendar} color={student.attendance < 65 ? 'red' : student.attendance < 75 ? 'amber' : 'emerald'} />
        <StatCard title="Active Backlogs" value={student.backlogs} subtitle="Pending subjects" icon={AlertTriangle} color={student.backlogs > 0 ? 'red' : 'emerald'} />
        <StatCard title="Assignment Completion" value={`${student.assignmentCompletion}%`} subtitle="Submitted coursework" icon={FileCheck} color={student.assignmentCompletion < 50 ? 'red' : 'purple'} />
      </div>

      {/* AI Risk Card & Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Brain className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Current Academic Risk Assessment</h2>
            </div>
            <RiskBadge level={student.currentRiskLevel} score={student.currentRiskScore} />
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-300">Factors Influencing Your Current Risk Status:</div>
              <span className="text-[10px] text-purple-400 font-mono">Random Forest ML v1.0</span>
            </div>
            <ul className="space-y-2 text-xs">
              {student.currentRiskFactors && student.currentRiskFactors.length > 0 ? (
                student.currentRiskFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0 animate-pulse"></span>
                    <span className="font-semibold">{factor}</span>
                  </li>
                ))
              ) : (
                <li className="text-emerald-400 flex items-center gap-2 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4" /> Great job! You have zero risk alerts. Keep maintaining this standard!
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Personalized Interactive Action Plan */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Interactive Academic Action Plan</h2>
            </div>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Interactive Checklist
            </span>
          </div>

          <div className="space-y-2.5 text-xs max-h-[220px] overflow-y-auto pr-1">
            {recommendations.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 text-slate-400 text-center">
                Keep maintaining your attendance and grades above 75%.
              </div>
            ) : (
              recommendations.map((rec, idx) => {
                const isDone = !!completedActions[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleAction(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600 text-slate-200'
                    }`}
                  >
                    <button className="mt-0.5 text-amber-400 shrink-0">
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className={`font-bold ${isDone ? 'line-through opacity-75' : 'text-white'}`}>
                        {rec.title}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{rec.description}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Academic Performance Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Progression Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Semester GPA Trajectory vs Target
            </h3>
            <span className="text-[11px] text-blue-400 font-semibold font-mono">Current: {student.currentGpa.toFixed(1)}</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaProgression}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="term" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="gpa" name="Actual GPA" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, fill: '#3B82F6' }} />
                <Line type="monotone" dataKey="target" name="Target Benchmark (8.0)" stroke="#10B981" strokeDasharray="4 4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Internal vs Semester Marks */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Subject-wise Marks Breakdown (%)
            </h3>
            <span className="text-[11px] text-emerald-400 font-semibold font-mono">Passing: 40%</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="subject" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="internal" name="Internal Assessment" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="semester" name="Semester Exam" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Assigned Interventions with Direct Action Buttons */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-purple-400" />
            My Assigned Mentorship & Support Interventions ({interventions.length})
          </h3>
          <button
            onClick={() => setShowSupportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 text-xs font-bold border border-purple-500/30 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Request Session
          </button>
        </div>

        {interventions.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-800/30 border border-slate-700/40 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-300 font-semibold">No active support interventions assigned.</p>
            <p className="text-[11px] text-slate-500">You can request one at any time using the "Request Session" button.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interventions.map((int) => (
              <div key={int._id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{int.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      int.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {int.priority} Priority
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Mentor: <span className="font-semibold text-purple-300">{int.mentorName}</span> • Category: <span className="text-blue-400">{int.type}</span>
                  </div>
                  <p className="text-slate-400 text-xs">{int.description}</p>

                  {int.studentNotes && (
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-700 text-slate-300 text-[11px] mt-2 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-blue-400">Your Progress Note:</span> {int.studentNotes}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 pt-1">
                    Target Deadline: {new Date(int.deadline).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <span className={`px-3 py-1.5 rounded-xl text-center text-xs font-bold border ${
                    int.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    int.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {int.status}
                  </span>

                  {int.status === 'Pending' && !int.studentAcknowledged && (
                    <button
                      onClick={() => handleAcknowledgeIntervention(int._id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Acknowledge
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowNoteModal(int);
                      setNoteText(int.studentNotes || '');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    Add Note / Meeting
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Request Faculty Help / Support */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-700 w-full max-w-lg space-y-4 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-400" />
                Request Academic Support / Mentoring
              </h3>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Support Category</label>
                <select
                  value={supportForm.type}
                  onChange={(e) => setSupportForm({ ...supportForm, type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                >
                  <option value="Academic counselling">Academic Counselling</option>
                  <option value="Remedial classes">Remedial Classes / Tutoring</option>
                  <option value="Faculty mentoring">Faculty Mentoring</option>
                  <option value="Assignment support">Assignment & Coursework Assistance</option>
                  <option value="Financial guidance">Financial Aid & Scholarship Advisory</option>
                  <option value="Career counselling">Career Counselling</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title / Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Remedial guidance in Data Structures & Backlog clearance"
                  value={supportForm.title}
                  onChange={(e) => setSupportForm({ ...supportForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Mentor</label>
                <select
                  value={supportForm.mentorName}
                  onChange={(e) => setSupportForm({ ...supportForm, mentorName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                >
                  <option value="Dr. Alan Turing">Dr. Alan Turing (Computer Science HOD)</option>
                  <option value="Dr. Grace Hopper">Dr. Grace Hopper (Associate Professor)</option>
                  <option value="Prof. Richard Feynman">Prof. Richard Feynman (Electronics)</option>
                  <option value="Dr. Ada Lovelace">Dr. Ada Lovelace (Information Tech)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Reason / Problem Statement</label>
                <textarea
                  rows="3"
                  placeholder="Describe where you need help (e.g. missing lectures due to illness, struggling with exam preparation)..."
                  value={supportForm.reason}
                  onChange={(e) => setSupportForm({ ...supportForm, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preferred Meeting Date</label>
                <input
                  type="date"
                  value={supportForm.preferredDate}
                  onChange={(e) => setSupportForm({ ...supportForm, preferredDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSupport}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submittingSupport ? 'Submitting...' : 'Submit Support Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Intervention Note / Schedule Meeting */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-700 w-full max-w-md space-y-4 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  Intervention Progress Note
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{showNoteModal.title}</p>
              </div>
              <button
                onClick={() => setShowNoteModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Progress Update / Notes</label>
                <textarea
                  rows="4"
                  placeholder="e.g. Attended 2 remedial classes this week, submitted draft assignment for review..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Request 1-on-1 Mentor Meeting (Optional)</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddInterventionNote}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Save & Notify Mentor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Interactive What-If Risk Simulator */}
      {showSimulatorModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-700 w-full max-w-2xl space-y-5 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  Interactive "What-If" Academic Risk Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust metrics to simulate how improving attendance, clearing backlogs, or raising GPA instantly drops your risk score!
                </p>
              </div>
              <button
                onClick={() => setShowSimulatorModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Result Comparison Card */}
            {simResult && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Simulated AI Prediction</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-white">{simResult.simulatedRiskScore}%</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      simResult.simulatedRiskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-300' :
                      simResult.simulatedRiskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {simResult.simulatedRiskLevel} RISK
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Actual baseline: <span className="font-bold text-rose-400">{student.currentRiskScore}% ({student.currentRiskLevel})</span>
                    {' '}→ Projected reduction: <span className="font-bold text-emerald-400">{Math.max(0, student.currentRiskScore - simResult.simulatedRiskScore)}% reduction</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-400">ML Model Confidence</div>
                  <div className="text-xs font-bold text-emerald-400">94.8% Accuracy</div>
                </div>
              </div>
            )}

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Attendance */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">Simulated Attendance</span>
                  <span className="text-blue-400">{simParams.attendance}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={simParams.attendance}
                  onChange={(e) => {
                    const next = { ...simParams, attendance: Number(e.target.value) };
                    setSimParams(next);
                    runLiveSimulation(next);
                  }}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-400">Target ≥ 75% for zero attendance penalty</div>
              </div>

              {/* GPA */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">Simulated GPA (0 - 10)</span>
                  <span className="text-purple-400">{simParams.currentGpa.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="10.0"
                  step="0.1"
                  value={simParams.currentGpa}
                  onChange={(e) => {
                    const next = { ...simParams, currentGpa: Number(e.target.value) };
                    setSimParams(next);
                    runLiveSimulation(next);
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-400">Target ≥ 6.0 for satisfactory progress</div>
              </div>

              {/* Backlogs */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">Active Backlogs</span>
                  <span className={simParams.backlogs > 0 ? 'text-rose-400' : 'text-emerald-400'}>{simParams.backlogs} subjects</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={simParams.backlogs}
                  onChange={(e) => {
                    const next = { ...simParams, backlogs: Number(e.target.value) };
                    setSimParams(next);
                    runLiveSimulation(next);
                  }}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-400">Clearing backlogs directly cuts risk by up to 38%</div>
              </div>

              {/* Assignment Completion */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">Assignment Completion</span>
                  <span className="text-amber-400">{simParams.assignmentCompletion}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={simParams.assignmentCompletion}
                  onChange={(e) => {
                    const next = { ...simParams, assignmentCompletion: Number(e.target.value) };
                    setSimParams(next);
                    runLiveSimulation(next);
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-400">Target ≥ 80% for high internal evaluation</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => {
                  const reset = {
                    attendance: student.attendance,
                    currentGpa: student.currentGpa,
                    backlogs: student.backlogs,
                    assignmentCompletion: student.assignmentCompletion,
                    internalMarks: student.internalMarks,
                    feeStatus: student.feeStatus
                  };
                  setSimParams(reset);
                  runLiveSimulation(reset);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold"
              >
                Reset to Current Profile
              </button>

              <button
                onClick={() => {
                  setShowSimulatorModal(false);
                  showToast('Simulation complete! Work towards these targets in your study plan.');
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Apply as Target Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
