import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentById } from '../services/studentService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Sparkles, CheckCircle, AlertTriangle, ArrowRight,
  BookOpen, Calendar, ClipboardList, UserCheck, DollarSign, Brain,
  CheckSquare, Square, Clock, PlusCircle, Download, ListFilter, X, Send, Target
} from 'lucide-react';

const INTERVENTION_ICONS = {
  'Attendance monitoring': Calendar,
  'Academic counselling': Brain,
  'Remedial classes': BookOpen,
  'Assignment support': ClipboardList,
  'Faculty mentoring': UserCheck,
  'Financial guidance': DollarSign,
  'Peer mentoring': UserCheck,
  'Parent/guardian meeting': UserCheck,
  'Career counselling': Sparkles,
};

const Recommendations = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  // Custom Goal Modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'Academics', detail: '', targetDate: '' });
  const [customGoals, setCustomGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(`custom_goals_${user?.studentId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Action status dictionary: { [id]: 'pending' | 'in_progress' | 'completed' }
  const [itemStatuses, setItemStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem(`rec_statuses_${user?.studentId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

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
      const res = await getStudentById(id);
      const resolvedStudent = res?.student || user?.studentProfile;
      setStudent(resolvedStudent);
      setRecommendations(res?.recommendations || []);
    } catch (e) {
      console.error(e);
      if (user?.studentProfile) {
        setStudent(user.studentProfile);
      }
    }
    setLoading(false);
  };

  const updateItemStatus = (key, nextStatus) => {
    const updated = { ...itemStatuses, [key]: nextStatus };
    setItemStatuses(updated);
    if (user?.studentId) {
      localStorage.setItem(`rec_statuses_${user.studentId}`, JSON.stringify(updated));
    }
    showToast(`Status updated to ${nextStatus.replace('_', ' ').toUpperCase()}!`);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;
    const item = {
      id: Date.now().toString(),
      title: newGoal.title,
      category: newGoal.category,
      detail: newGoal.detail,
      targetDate: newGoal.targetDate,
      status: 'pending'
    };
    const updated = [item, ...customGoals];
    setCustomGoals(updated);
    if (user?.studentId) {
      localStorage.setItem(`custom_goals_${user.studentId}`, JSON.stringify(updated));
    }
    showToast('Custom academic goal created!');
    setShowGoalModal(false);
    setNewGoal({ title: '', category: 'Academics', detail: '', targetDate: '' });
  };

  const handleDownloadTimetable = () => {
    const timetable = `
========================================================================
            EDUPREDICT AI - PERSONALIZED REVISION TIMETABLE
          Prepared for: ${student?.name} (ID: ${student?.studentId})
========================================================================
Weekly Focus: Clear 4 Backlogs & Bring Attendance to ≥ 75%

MONDAY:
  07:30 - 08:30 | Morning Attendance Prep & Concept Revision
  17:00 - 18:30 | Data Structures: Binary Trees & Graph Traversal (Backlog Revision)
  19:00 - 20:00 | Assignment Submissions & Coursework

TUESDAY:
  07:30 - 08:30 | Database Systems: SQL Normalization (Backlog Revision)
  17:00 - 18:30 | Remedial Session with Faculty Mentor
  19:00 - 20:00 | Lab Practical Exercise Prep

WEDNESDAY:
  07:30 - 08:30 | Operating Systems: CPU Scheduling Algorithms (Backlog Revision)
  17:00 - 18:30 | Discrete Mathematics: Graph Proofs
  19:00 - 20:00 | Weekly Quiz Practice

THURSDAY:
  07:30 - 08:30 | Algorithms Design & Complexity Analysis
  17:00 - 18:30 | Peer Group Discussion & Doubt Clearing
  19:00 - 20:00 | Coursework Submission Review

FRIDAY:
  07:30 - 08:30 | Weekly Revision & Mock Test Solving
  17:00 - 18:30 | Review with Mentor Dr. Alan Turing
  19:00 - 20:00 | Self-Assessment & Progress Tracking

WEEKEND (SAT-SUN):
  09:00 - 11:30 | High-Intensity Backlog Subject Practice Test
  14:00 - 16:00 | Assignment Completion & Project Coursework
  17:00 - 18:00 | Mental Wellness, Physical Exercise & Relaxation

Generated by EduPredict AI Personalized Learning Engine
========================================================================
`;
    const blob = new Blob([timetable], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Study_Timetable_${student?.studentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('AI Study Timetable downloaded successfully!');
  };

  if (loading) return <LoadingSpinner label="Loading personalized recommendations..." />;
  if (!student) return <div className="text-slate-400 p-8">Profile not linked. Contact admin.</div>;

  // Generate comprehensive personalized tips based on student data
  const personalTips = [];

  if (student.attendance < 65) {
    personalTips.push({
      id: 'rec_att_crit',
      category: 'Attendance',
      icon: Calendar,
      color: 'rose',
      title: 'Critical: Attend Next 15 Consecutive Lectures',
      detail: `Your aggregate attendance is ${student.attendance}% (below 65% minimum requirement). Missing more classes risks exam disqualification.`,
      actions: ['Attend all remaining classes this semester', 'Inform department office about legitimate medical leaves', 'Request attendance regularization review']
    });
  } else if (student.attendance < 75) {
    personalTips.push({
      id: 'rec_att_mod',
      category: 'Attendance',
      icon: Calendar,
      color: 'amber',
      title: 'Moderate: Increase Class Attendance to ≥ 75%',
      detail: `Your attendance is ${student.attendance}%. Achieving 75% protects against exam registration bars.`,
      actions: ['Set daily attendance reminders', 'Avoid casual leaves for the next 4 weeks']
    });
  }

  if (student.backlogs >= 3) {
    personalTips.push({
      id: 'rec_backlog_crit',
      category: 'Backlogs',
      icon: Brain,
      color: 'rose',
      title: 'High Priority: Prepare for 4 Supplementary Backlog Exams',
      detail: `You currently have ${student.backlogs} active backlogs. Uncleared backlogs delay graduation timeline and account for 38% of your dropout risk.`,
      actions: ['Schedule 2 hours daily for Database Systems & OS revision', 'Register for supplementary exam forms before deadline', 'Request peer study notes from batch topper']
    });
  } else if (student.backlogs > 0) {
    personalTips.push({
      id: 'rec_backlog_mod',
      category: 'Backlogs',
      icon: BookOpen,
      color: 'amber',
      title: 'Action Required: Clear Pending Backlogs',
      detail: `You have ${student.backlogs} backlog(s). Start revision to ensure 100% pass in the upcoming semester.`,
      actions: ['Schedule 1 hour daily revision', 'Solve previous 3 years examination papers']
    });
  }

  if (student.assignmentCompletion < 50) {
    personalTips.push({
      id: 'rec_assign_crit',
      category: 'Assignments',
      icon: ClipboardList,
      color: 'rose',
      title: 'Submit Pending Coursework to Boost Internals',
      detail: `Only ${student.assignmentCompletion}% of your assignments are submitted. Submitting the remaining 3 coursework sets will immediately boost internal marks above 60%.`,
      actions: ['Complete Assignment 2 (Knapsack DP) this weekend', 'Submit Database Schema assignment', 'Meet course faculty for extension approval if overdue']
    });
  }

  if (student.currentGpa < 5.5) {
    personalTips.push({
      id: 'rec_gpa_crit',
      category: 'GPA Improvement',
      icon: Brain,
      color: 'amber',
      title: 'Target Semester GPA Recovery to ≥ 6.5',
      detail: `Your cumulative GPA is ${student.currentGpa}. Scoring above 60% in upcoming internal assessments will pull your GPA into the safe zone.`,
      actions: ['Focus on high-weight internal tests', 'Attend weekly faculty mentoring check-in']
    });
  }

  if (student.feeStatus === 0) {
    personalTips.push({
      id: 'rec_fee_crit',
      category: 'Financial Guidance',
      icon: DollarSign,
      color: 'rose',
      title: 'Tuition Fee Regularization & Installment Option',
      detail: 'Tuition fee status is pending. Contact finance office to apply for installment schedule or institutional scholarship.',
      actions: ['Visit accounts department desk in Block A', 'Apply for need-based fee installment plan']
    });
  }

  // Wellness tip
  personalTips.push({
    id: 'rec_wellness',
    category: 'Well-being',
    icon: Sparkles,
    color: 'blue',
    title: 'Study-Life Balance & Stress Management',
    detail: 'Academic stress is manageable with structured time management and adequate rest.',
    actions: ['Maintain a 7-hour regular sleep schedule', 'Take 10-minute micro breaks during study sessions', 'Reach out to campus counseling whenever overwhelmed']
  });

  const allRecommendations = [
    ...personalTips,
    ...customGoals.map(g => ({
      id: g.id,
      category: g.category,
      icon: Target,
      color: 'purple',
      title: g.title,
      detail: g.detail || `Target Date: ${g.targetDate || 'Ongoing'}`,
      actions: []
    }))
  ];

  const filteredItems = activeFilter === 'All'
    ? allRecommendations
    : allRecommendations.filter(r => r.category.toLowerCase().includes(activeFilter.toLowerCase()));

  const colorMap = {
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' }
  };

  const categories = ['All', 'Attendance', 'Backlogs', 'Assignments', 'GPA Improvement', 'Well-being'];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-indigo-400 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Personalized Academic Action Plan
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AI-generated recommendations and interactive recovery roadmap tailored to your risk profile
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/25"
          >
            <PlusCircle className="w-4 h-4" />
            Add Custom Goal
          </button>
          <button
            onClick={handleDownloadTimetable}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25"
          >
            <Download className="w-4 h-4" />
            Download AI Study Timetable
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendations & Action Plan Cards */}
      <div className="space-y-4">
        {filteredItems.map((tip) => {
          const c = colorMap[tip.color] || colorMap.blue;
          const Icon = tip.icon;
          const currentStatus = itemStatuses[tip.id] || 'pending';

          return (
            <div key={tip.id} className={`glass-panel p-5 rounded-2xl border ${c.border} ${c.bg} space-y-3 transition-all`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2.5 rounded-xl bg-slate-800 ${c.text} shrink-0 mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{tip.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.badge}`}>
                        {tip.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{tip.detail}</p>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => updateItemStatus(tip.id, 'pending')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      currentStatus === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => updateItemStatus(tip.id, 'in_progress')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      currentStatus === 'in_progress'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateItemStatus(tip.id, 'completed')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      currentStatus === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Done ✓
                  </button>
                </div>
              </div>

              {tip.actions && tip.actions.length > 0 && (
                <div className="pl-12 space-y-1.5 pt-1">
                  {tip.actions.map((action, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${c.text}`} />
                      <span className="text-slate-300">{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD CUSTOM GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-700 w-full max-w-md space-y-4 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Add Personalized Academic Goal
              </h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Complete 50 LeetCode problems in Data Structures"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                >
                  <option value="Attendance">Attendance</option>
                  <option value="Backlogs">Backlogs</option>
                  <option value="Assignments">Assignments</option>
                  <option value="GPA Improvement">GPA Improvement</option>
                  <option value="Well-being">Well-being & Skills</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Details & Action Steps</label>
                <textarea
                  rows="3"
                  placeholder="Describe your target milestones..."
                  value={newGoal.detail}
                  onChange={(e) => setNewGoal({ ...newGoal, detail: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
