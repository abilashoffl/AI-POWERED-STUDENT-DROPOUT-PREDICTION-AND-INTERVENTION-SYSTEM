import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInterventions, studentInterventionAction } from '../services/interventionService';
import { requestSupport } from '../services/studentService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HeartHandshake, Calendar, UserCheck, Info,
  Clock, CheckCircle, XCircle, AlertCircle, PlusCircle,
  MessageSquare, Send, X, Filter, Sparkles, Phone, Mail
} from 'lucide-react';

const StudentInterventions = () => {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal 1: Request Support
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    type: 'Academic counselling',
    title: '',
    mentorName: 'Dr. Alan Turing',
    reason: '',
    preferredDate: ''
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Modal 2: Progress Note & Meeting Request
  const [activeInterventionModal, setActiveInterventionModal] = useState(null);
  const [modalMode, setModalMode] = useState('note'); // 'note' | 'meeting' | 'complete'
  const [noteText, setNoteText] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    if (user?.studentId) fetchData(user.studentId);
    else setLoading(false);
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async (studentId) => {
    setLoading(true);
    try {
      const data = await getInterventions({ studentId });
      setInterventions(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAcknowledge = async (id) => {
    try {
      await studentInterventionAction(id, { action: 'acknowledge' });
      showToast('Intervention acknowledged and active!');
      if (user?.studentId) fetchData(user.studentId);
    } catch (e) {
      console.error(e);
      showToast('Failed to acknowledge intervention.');
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!activeInterventionModal) return;
    setSubmittingAction(true);
    try {
      if (modalMode === 'note') {
        await studentInterventionAction(activeInterventionModal._id, {
          note: noteText,
          action: 'note'
        });
        showToast('Progress note logged and sent to your mentor!');
      } else if (modalMode === 'meeting') {
        await studentInterventionAction(activeInterventionModal._id, {
          action: 'request_meeting',
          meetingDate: meetingDate,
          meetingNotes: noteText
        });
        showToast('Meeting request sent to mentor!');
      } else if (modalMode === 'complete') {
        await studentInterventionAction(activeInterventionModal._id, {
          status: 'Completed',
          note: noteText || 'Student marked requirements as fulfilled.'
        });
        showToast('Intervention marked as completed!');
      }

      setActiveInterventionModal(null);
      setNoteText('');
      setMeetingDate('');
      if (user?.studentId) fetchData(user.studentId);
    } catch (err) {
      console.error(err);
      showToast('Failed to update intervention.');
    }
    setSubmittingAction(false);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmittingRequest(true);
    try {
      await requestSupport({
        studentId: user?.studentId,
        title: requestForm.title || `Support: ${requestForm.type}`,
        type: requestForm.type,
        mentorName: requestForm.mentorName,
        reason: requestForm.reason,
        preferredDate: requestForm.preferredDate
      });
      showToast('Support request submitted! Mentor will follow up.');
      setShowRequestModal(false);
      setRequestForm({
        type: 'Academic counselling',
        title: '',
        mentorName: 'Dr. Alan Turing',
        reason: '',
        preferredDate: ''
      });
      if (user?.studentId) fetchData(user.studentId);
    } catch (err) {
      console.error(err);
      showToast('Failed to submit support request.');
    }
    setSubmittingRequest(false);
  };

  if (loading) return <LoadingSpinner label="Fetching your assigned interventions..." />;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'Cancelled': return <XCircle className="w-5 h-5 text-slate-500" />;
      default: return <AlertCircle className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'In Progress': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Cancelled': return 'bg-slate-700/50 text-slate-500 border-slate-700/30';
      default: return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const isOverdue = (deadline) => deadline && new Date(deadline) < new Date();
  const daysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const active = interventions.filter(i => ['Pending', 'In Progress'].includes(i.status));
  const completed = interventions.filter(i => i.status === 'Completed');

  const filteredInterventions = activeTab === 'All'
    ? interventions
    : activeTab === 'Active'
    ? active
    : activeTab === 'Completed'
    ? completed
    : interventions.filter(i => i.type.toLowerCase().includes(activeTab.toLowerCase()));

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
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-purple-400" />
            My Support & Mentorship Interventions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Faculty mentorship programs, remedial courses, and academic recovery milestones
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/25 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Request Support Session
        </button>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Support Programs', value: active.length, color: 'blue' },
          { label: 'Completed Interventions', value: completed.length, color: 'emerald' },
          { label: 'Total Assigned Records', value: interventions.length, color: 'purple' },
        ].map(s => (
          <div key={s.label} className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <div className={`text-2xl font-black text-${s.color}-400`}>{s.value}</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Active', 'Completed', 'Academic counselling', 'Remedial classes', 'Attendance monitoring'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Interventions List */}
      {filteredInterventions.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <HeartHandshake className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Interventions in this Category</h3>
          <p className="text-xs text-slate-400">Use the "Request Support Session" button if you need assistance from faculty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInterventions.map((item) => {
            const days = daysUntilDeadline(item.deadline);
            const overdue = isOverdue(item.deadline) && item.status !== 'Completed';

            return (
              <div key={item._id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 transition-all">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">{item.type}</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{item.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getPriorityStyle(item.priority)}`}>
                      {item.priority} Priority
                    </span>
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-xs text-slate-300 leading-relaxed pl-8">{item.description}</p>
                )}

                {/* Student Note Display */}
                {item.studentNotes && (
                  <div className="ml-8 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Your Progress Note:
                    </div>
                    <p className="text-slate-300">{item.studentNotes}</p>
                  </div>
                )}

                {/* Scheduled Meeting Info */}
                {item.meetingRequested && item.meetingDate && (
                  <div className="ml-8 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>Mentor Meeting Requested for: <strong>{new Date(item.meetingDate).toLocaleDateString()}</strong></span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Meeting Scheduled
                    </span>
                  </div>
                )}

                {/* Meta details & Direct Action Buttons */}
                <div className="pl-8 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Mentor: <strong className="text-slate-200">{item.mentorName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Deadline: <strong className={overdue ? 'text-rose-400' : 'text-slate-200'}>
                        {new Date(item.deadline).toLocaleDateString()} {overdue ? '(Overdue!)' : days !== null && days <= 5 ? `(${days}d left)` : ''}
                      </strong></span>
                    </div>
                  </div>

                  {/* Student Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.status === 'Pending' && !item.studentAcknowledged && (
                      <button
                        onClick={() => handleAcknowledge(item._id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
                      >
                        Acknowledge
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveInterventionModal(item);
                        setModalMode('note');
                        setNoteText(item.studentNotes || '');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      Log Note
                    </button>

                    <button
                      onClick={() => {
                        setActiveInterventionModal(item);
                        setModalMode('meeting');
                        setNoteText('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Request Meeting
                    </button>

                    {item.status !== 'Completed' && (
                      <button
                        onClick={() => {
                          setActiveInterventionModal(item);
                          setModalMode('complete');
                          setNoteText('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REQUEST SUPPORT MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-700 w-full max-w-md space-y-4 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-400" />
                Request Support or Remedial Session
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Support Category</label>
                <select
                  value={requestForm.type}
                  onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                >
                  <option value="Academic counselling">Academic Counselling</option>
                  <option value="Remedial classes">Remedial Classes</option>
                  <option value="Faculty mentoring">Faculty Mentoring</option>
                  <option value="Assignment support">Assignment Support</option>
                  <option value="Financial guidance">Financial Guidance</option>
                  <option value="Career counselling">Career Counselling</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Guidance on Backlog Exam Preparation"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Mentor</label>
                <select
                  value={requestForm.mentorName}
                  onChange={(e) => setRequestForm({ ...requestForm, mentorName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                >
                  <option value="Dr. Alan Turing">Dr. Alan Turing (Computer Science HOD)</option>
                  <option value="Dr. Grace Hopper">Dr. Grace Hopper (Associate Professor)</option>
                  <option value="Prof. Richard Feynman">Prof. Richard Feynman (Electronics)</option>
                  <option value="Dr. Ada Lovelace">Dr. Ada Lovelace (Information Tech)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Reason</label>
                <textarea
                  rows="3"
                  placeholder="Describe your current academic challenges or goals..."
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preferred Meeting Date</label>
                <input
                  type="date"
                  value={requestForm.preferredDate}
                  onChange={(e) => setRequestForm({ ...requestForm, preferredDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Progress Note / Meeting / Complete */}
      {activeInterventionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-700 w-full max-w-md space-y-4 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {modalMode === 'meeting' ? (
                    <><Calendar className="w-5 h-5 text-purple-400" /> Schedule Mentor Check-in</>
                  ) : modalMode === 'complete' ? (
                    <><CheckCircle className="w-5 h-5 text-emerald-400" /> Mark Intervention Completed</>
                  ) : (
                    <><MessageSquare className="w-5 h-5 text-blue-400" /> Log Progress Note</>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeInterventionModal.title}</p>
              </div>
              <button
                onClick={() => setActiveInterventionModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-3.5 text-xs">
              {modalMode === 'meeting' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Proposed Meeting Date</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {modalMode === 'meeting' ? 'Topics / Questions for Meeting' : modalMode === 'complete' ? 'Completion Feedback & Outcome' : 'Progress Note'}
                </label>
                <textarea
                  rows="3"
                  placeholder={
                    modalMode === 'meeting'
                      ? 'e.g. Want to review last exam answers and plan backlog study timeline...'
                      : modalMode === 'complete'
                      ? 'e.g. Attended all 8 remedial classes, cleared backlog exam registration...'
                      : 'e.g. Attended 2 tutoring sessions this week, completed practice set...'
                  }
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium resize-none"
                  required={modalMode === 'note'}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveInterventionModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submittingAction ? 'Updating...' : 'Confirm & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInterventions;
