import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentById, requestSupport } from '../services/studentService';
import { getPredictionHistoryByStudent } from '../services/predictionService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  TrendingUp, BarChart3, Calendar, BookOpen, ClipboardCheck, Users,
  Sliders, Download, CheckCircle, Clock, AlertCircle, FileText, Send, X, PlusCircle,
  User, Brain
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

const AcademicPerformance = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Subject Help Modal
  const [helpSubject, setHelpSubject] = useState(null);
  const [helpReason, setHelpReason] = useState('');
  const [submittingHelp, setSubmittingHelp] = useState(false);

  // Assignment submissions local state
  const [assignments, setAssignments] = useState([
    { id: 'A1', subject: 'Data Structures', title: 'Binary Search Tree & Red-Black Tree Implementation', due: '2026-10-05', status: 'Submitted', marks: 18, maxMarks: 20 },
    { id: 'A2', subject: 'Algorithms', title: 'Dynamic Programming - Knapsack & Graph Shortest Path', due: '2026-10-12', status: 'Pending', marks: null, maxMarks: 20 },
    { id: 'A3', subject: 'Database Systems', title: 'SQL Query Optimization & Normalization Schema', due: '2026-10-18', status: 'In Review', marks: null, maxMarks: 20 },
    { id: 'A4', subject: 'Operating Systems', title: 'CPU Scheduling & Memory Management Simulation', due: '2026-10-25', status: 'Pending', marks: null, maxMarks: 20 },
    { id: 'A5', subject: 'Discrete Mathematics', title: 'Graph Theory & Combinatorics Proofs', due: '2026-10-30', status: 'Submitted', marks: 16, maxMarks: 20 }
  ]);

  // Live Simulator state
  const [simAttendance, setSimAttendance] = useState(45);
  const [simSemesterMarks, setSimSemesterMarks] = useState(45);
  const [simClearedBacklogs, setSimClearedBacklogs] = useState(0);

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
        setSimAttendance(resolvedStudent.attendance || 45);
        setSimSemesterMarks(resolvedStudent.semesterMarks || 45);
      }
    } catch (e) {
      console.error(e);
      if (user?.studentProfile) {
        setStudent(user.studentProfile);
      }
    }
    setLoading(false);
  };

  const handleToggleAssignment = (id) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'Submitted' ? 'Pending' : 'Submitted';
        showToast(`Assignment "${a.title.slice(0, 24)}..." marked as ${nextStatus}!`);
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const handleRequestSubjectTutoring = async (e) => {
    e.preventDefault();
    if (!helpSubject) return;
    setSubmittingHelp(true);
    try {
      await requestSupport({
        studentId: user?.studentId || student?.studentId,
        title: `Remedial Tutoring Request: ${helpSubject.name}`,
        type: 'Remedial classes',
        reason: helpReason || `Student requested specialized assistance for course: ${helpSubject.name}.`,
        mentorName: helpSubject.faculty
      });
      showToast(`Tutoring request sent to ${helpSubject.faculty}!`);
      setHelpSubject(null);
      setHelpReason('');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit request.');
    }
    setSubmittingHelp(false);
  };

  const handleDownloadTranscript = () => {
    if (!student) return;
    const transcriptText = `
============================================================
              OFFICIAL ACADEMIC TRANSCRIPT
        INSTITUTE OF TECHNOLOGY & SCIENCE (2026-27)
============================================================
Student Name:     ${student.name}
Student ID:       ${student.studentId}
Department:       ${student.department}
Academic Year:    Year ${student.year}, Section ${student.section}
Cumulative GPA:   ${student.currentGpa.toFixed(2)} / 10.0
Current Backlogs: ${student.backlogs}

-- COURSEWISE BREAKDOWN --
1. Data Structures & Algorithms   | Internal: ${student.internalMarks}% | Semester: ${student.semesterMarks}% | Status: Regular
2. Advanced Algorithm Design       | Internal: ${Math.min(100, student.internalMarks + 8)}% | Semester: ${Math.min(100, student.semesterMarks + 5)}% | Status: Regular
3. Database Management Systems    | Internal: ${Math.max(25, student.internalMarks - 6)}% | Semester: ${Math.max(25, student.semesterMarks - 4)}% | Status: Backlog
4. Operating Systems & Shell       | Internal: ${student.internalMarks}% | Semester: ${student.semesterMarks}% | Status: Regular
5. Discrete Mathematics           | Internal: ${Math.max(30, student.internalMarks - 5)}% | Semester: ${Math.max(30, student.semesterMarks - 3)}% | Status: Backlog

-- ATTENDANCE & CONDUCT --
Aggregate Attendance: ${student.attendance}%
Assignment Submissions: ${student.assignmentCompletion}%
Conduct & Disciplinary: Exemplary

Authenticated by Office of Academic Affairs
EduPredict AI Automated Verification
============================================================
`;
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Academic_Transcript_${student.studentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Academic Transcript downloaded successfully!');
  };

  if (loading) return <LoadingSpinner label="Loading academic performance analytics..." />;
  if (!student) return <div className="text-slate-400 p-8">Profile not linked. Contact administrator.</div>;

  // Registered courses with faculty details
  const registeredCourses = [
    { code: 'CS401', name: 'Data Structures & Algorithms', faculty: 'Dr. Alan Turing', internal: student.internalMarks, semester: student.semesterMarks, attendance: student.attendance, status: student.internalMarks < 50 ? 'Needs Tutoring' : 'Good' },
    { code: 'CS402', name: 'Advanced Algorithm Design', faculty: 'Dr. Grace Hopper', internal: Math.min(100, student.internalMarks + 8), semester: Math.min(100, student.semesterMarks + 5), attendance: Math.min(100, student.attendance + 10), status: 'Good' },
    { code: 'CS403', name: 'Database Management Systems', faculty: 'Dr. Ada Lovelace', internal: Math.max(30, student.internalMarks - 6), semester: Math.max(30, student.semesterMarks - 4), attendance: Math.max(25, student.attendance - 12), status: 'Critical Support' },
    { code: 'CS404', name: 'Operating Systems & Networks', faculty: 'Prof. Richard Feynman', internal: student.internalMarks, semester: student.semesterMarks, attendance: student.attendance, status: student.internalMarks < 50 ? 'Needs Tutoring' : 'Good' },
    { code: 'MA401', name: 'Discrete Mathematics', faculty: 'Prof. Nikola Tesla', internal: Math.max(35, student.internalMarks - 5), semester: Math.max(35, student.semesterMarks - 3), attendance: Math.max(30, student.attendance - 8), status: 'Needs Tutoring' }
  ];

  // Simulated calculations
  const remainingBacklogs = Math.max(0, student.backlogs - simClearedBacklogs);
  const simulatedGpa = Math.min(10, (student.currentGpa + (simSemesterMarks - 40) * 0.04 + simClearedBacklogs * 0.45));
  const rawSimRisk = Math.max(5, Math.min(95, Math.round(
    (100 - simAttendance) * 0.28 +
    (10 - simulatedGpa) * 6.0 +
    remainingBacklogs * 9.5 +
    (100 - student.assignmentCompletion) * 0.15 +
    (100 - simSemesterMarks) * 0.12 +
    (1 - student.feeStatus) * 12
  )));

  // GPA progression
  const gpaData = [
    { term: 'Sem 1', gpa: 7.8, attendance: 82 },
    { term: 'Sem 2', gpa: 7.5, attendance: 76 },
    { term: 'Sem 3', gpa: student.previousGpa || 5.6, attendance: 62 },
    { term: 'Current', gpa: student.currentGpa, attendance: student.attendance },
  ];

  // Subject-wise marks
  const subjectData = [
    { subject: 'Data Structures', internal: student.internalMarks, semester: student.semesterMarks },
    { subject: 'Algorithms', internal: Math.min(100, student.internalMarks + 8), semester: Math.min(100, student.semesterMarks + 5) },
    { subject: 'Database Systems', internal: Math.max(25, student.internalMarks - 6), semester: Math.max(25, student.semesterMarks - 4) },
    { subject: 'OS & Networks', internal: student.internalMarks, semester: student.semesterMarks },
    { subject: 'Mathematics', internal: Math.max(30, student.internalMarks - 5), semester: Math.max(30, student.semesterMarks - 3) },
  ];

  // Risk trend from predictions
  const riskTrendData = predictions.map(p => ({
    date: new Date(p.predictionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    risk: p.riskScore
  }));

  // Radar chart
  const radarData = [
    { metric: 'Attendance', value: student.attendance },
    { metric: 'GPA Score', value: student.currentGpa * 10 },
    { metric: 'Assignments', value: student.assignmentCompletion },
    { metric: 'Internals', value: student.internalMarks },
    { metric: 'Semester Exam', value: student.semesterMarks },
    { metric: 'Class Participation', value: student.participation },
  ];

  const chartTooltipStyle = {
    backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px'
  };

  return (
    <div className="space-y-6">
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
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Academic Performance Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time GPA tracking, course marks breakdown, interactive grade simulator, and coursework manager
          </p>
        </div>

        <button
          onClick={handleDownloadTranscript}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25 shrink-0"
        >
          <Download className="w-4 h-4" />
          Download Transcript (PDF)
        </button>
      </div>

      {/* Linked Profile & Risk Status Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white">{student.name}</span> ({student.studentId}) • {student.department} (Year {student.year})
            <div className="text-[11px] text-slate-400">
              Risk Assessment: <strong className={student.currentRiskLevel === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'}>
                {student.currentRiskLevel} ({student.currentRiskScore}%)
              </strong> • Backlogs: <strong className="text-rose-400">{student.backlogs}</strong>
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
            to="/student/risk-status"
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1.5 transition-all"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Risk Status & Simulator ↗</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Current GPA', value: student.currentGpa?.toFixed(1), unit: '/ 10', color: student.currentGpa < 5.5 ? 'text-rose-400' : 'text-emerald-400' },
          { label: 'Attendance Rate', value: `${student.attendance}`, unit: '%', color: student.attendance < 65 ? 'text-rose-400' : 'text-emerald-400' },
          { label: 'Internal Marks', value: `${student.internalMarks}`, unit: '%', color: student.internalMarks < 50 ? 'text-rose-400' : 'text-blue-400' },
          { label: 'Semester Marks', value: `${student.semesterMarks}`, unit: '%', color: student.semesterMarks < 50 ? 'text-rose-400' : 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}<span className="text-sm text-slate-400 ml-1">{s.unit}</span></div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE FEATURE: Grade & Risk Projected Simulator */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-slate-900 to-slate-950 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              Live Interactive Grade & Dropout Risk Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Move sliders below to test how improving study habits reduces your dropout probability!
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 w-fit">
            Real-Time AI Projection
          </span>
        </div>

        {/* Projection Comparison Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center space-y-1">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Projected GPA</div>
            <div className="text-2xl font-black text-blue-400">{simulatedGpa.toFixed(2)} <span className="text-xs text-slate-400">/ 10</span></div>
            <div className="text-[10px] text-emerald-400">
              +{Math.max(0, simulatedGpa - student.currentGpa).toFixed(2)} increase from baseline
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center space-y-1">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Projected Dropout Risk</div>
            <div className="text-2xl font-black text-purple-400">{rawSimRisk}%</div>
            <div className="text-[10px] text-emerald-400">
              -{Math.max(0, student.currentRiskScore - rawSimRisk)}% reduction from {student.currentRiskScore}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center space-y-1">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Projected Status</div>
            <div className={`text-lg font-black ${
              rawSimRisk >= 70 ? 'text-rose-400' : rawSimRisk >= 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {rawSimRisk >= 70 ? 'HIGH RISK' : rawSimRisk >= 40 ? 'MEDIUM RISK' : 'LOW RISK (SAFE)'}
            </div>
            <div className="text-[10px] text-slate-400">
              {rawSimRisk < 40 ? 'Eligible for Academic Honors' : 'Target ≥75% attendance for Low Risk'}
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-850/60 border border-slate-800">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Simulated Attendance</span>
              <span className="text-blue-400">{simAttendance}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={simAttendance}
              onChange={(e) => setSimAttendance(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">Current: {student.attendance}%</div>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-850/60 border border-slate-800">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Target Semester Exam Marks</span>
              <span className="text-emerald-400">{simSemesterMarks}%</span>
            </div>
            <input
              type="range"
              min="35"
              max="95"
              value={simSemesterMarks}
              onChange={(e) => setSimSemesterMarks(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">Current: {student.semesterMarks}%</div>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-850/60 border border-slate-800">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Backlogs Cleared</span>
              <span className="text-purple-400">{simClearedBacklogs} of {student.backlogs}</span>
            </div>
            <input
              type="range"
              min="0"
              max={student.backlogs || 1}
              value={simClearedBacklogs}
              onChange={(e) => setSimClearedBacklogs(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">{remainingBacklogs} backlogs remaining</div>
          </div>
        </div>
      </div>

      {/* Registered Courses Table with Help Request Action */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Registered Courses & Subject Performance ({registeredCourses.length})
          </h2>
          <span className="text-[11px] text-slate-400">Semester {student.year * 2}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Faculty Instructor</th>
                <th className="py-2.5 px-3">Internals</th>
                <th className="py-2.5 px-3">Semester Exam</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Support Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {registeredCourses.map((c) => (
                <tr key={c.code} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{c.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{c.code}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{c.faculty}</td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${c.internal < 50 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {c.internal}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${c.semester < 50 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {c.semester}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${c.attendance < 65 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {c.attendance}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'Critical Support' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      c.status === 'Needs Tutoring' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setHelpSubject(c)}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold transition-all text-[11px]"
                    >
                      Request Tutoring
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Tracker Checklist */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-amber-400" />
            Coursework & Assignment Submissions Tracker ({assignments.length})
          </h2>
          <span className="text-xs text-slate-400">Click row to toggle submission status</span>
        </div>

        <div className="space-y-2.5">
          {assignments.map((a) => (
            <div
              key={a.id}
              onClick={() => handleToggleAssignment(a.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                a.status === 'Submitted'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-200'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <button className="mt-0.5 text-emerald-400 shrink-0">
                  {a.status === 'Submitted' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                </button>
                <div>
                  <div className="text-[11px] font-bold text-purple-400">{a.subject}</div>
                  <div className={`font-bold text-sm ${a.status === 'Submitted' ? 'text-white' : 'text-slate-200'}`}>{a.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Due: {a.due}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 justify-end">
                {a.marks !== null && (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                    Score: {a.marks} / {a.maxMarks}
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  a.status === 'Submitted' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  a.status === 'In Review' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: GPA Progression */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Semester GPA Progression
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="term" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="gpa" name="GPA" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Attendance Trend */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" /> Attendance History Trend
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gpaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="term" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="attendance" name="Attendance %" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Subject Marks Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" /> Subject-wise Evaluation (%)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="subject" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="internal" name="Internal" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="semester" name="Semester Exam" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Radar Health */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Overall Academic Radar
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar name="Performance" dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip contentStyle={chartTooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* REQUEST SUBJECT TUTORING MODAL */}
      {helpSubject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-700 w-full max-w-md space-y-4 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Request Subject Tutoring
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{helpSubject.name} ({helpSubject.code})</p>
              </div>
              <button
                onClick={() => setHelpSubject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSubjectTutoring} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Instructor</label>
                <input
                  type="text"
                  value={helpSubject.faculty}
                  disabled
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Topics You Need Help With</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Concept revision for binary trees, exam question paper solving, lab assignment guidance..."
                  value={helpReason}
                  onChange={(e) => setHelpReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setHelpSubject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingHelp}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submittingHelp ? 'Submitting...' : 'Send Tutoring Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicPerformance;
