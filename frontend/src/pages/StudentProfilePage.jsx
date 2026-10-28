import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentById, updateStudentProfile } from '../services/studentService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  User, Mail, Phone, Calendar, MapPin, GraduationCap,
  BookOpen, AlertTriangle, CheckCircle, DollarSign, Users, Edit3,
  Save, X, Download, Target, Award, ShieldCheck, HeartHandshake,
  Brain, BarChart3, ArrowRight, Sparkles, Sliders
} from 'lucide-react';

const StudentProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    bio: '',
    careerGoal: '',
    parentName: '',
    parentPhone: '',
    parentEmail: ''
  });

  useEffect(() => {
    const sid = user?.studentId || user?.studentProfile?.studentId;
    if (sid) {
      fetchData(sid);
    } else if (user?.studentProfile) {
      setData({ student: user.studentProfile });
      populateForm(user.studentProfile);
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
      setData(res);
      const studentObj = res?.student || user?.studentProfile;
      if (studentObj) {
        populateForm(studentObj);
      }
    } catch (e) {
      console.error(e);
      if (user?.studentProfile) {
        setData({ student: user.studentProfile });
        populateForm(user.studentProfile);
      }
    }
    setLoading(false);
  };

  const populateForm = (student) => {
    setFormData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      dob: student.dob || '',
      address: student.address || 'College Campus Dormitory, Block B',
      bio: student.bio || 'Undergraduate computer science student passionate about software systems and machine learning.',
      careerGoal: student.careerGoal || 'Full Stack Software Engineer & Cloud Solutions Specialist',
      parentName: student.parentContact?.name || '',
      parentPhone: student.parentContact?.phone || '',
      parentEmail: student.parentContact?.email || ''
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        phone: formData.phone,
        email: formData.email,
        dob: formData.dob,
        address: formData.address,
        bio: formData.bio,
        careerGoal: formData.careerGoal,
        parentContact: {
          name: formData.parentName,
          phone: formData.parentPhone,
          email: formData.parentEmail
        }
      };

      await updateStudentProfile(payload);
      showToast('Profile updated successfully!');
      setEditing(false);
      if (user?.studentId) await fetchData(user.studentId);
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error(err);
      showToast('Failed to save profile changes.');
    }
    setSaving(false);
  };

  const handleDownloadIdCard = () => {
    const student = data?.student || user?.studentProfile;
    if (!student) return;

    const idCardData = `
==============================================
    INSTITUTE OF TECHNOLOGY & SCIENCE
         OFFICIAL STUDENT ID CARD
==============================================
Name:          ${student.name}
Student ID:    ${student.studentId}
Department:    ${student.department}
Academic Year: Year ${student.year} (Section ${student.section})
Date of Birth: ${formData.dob || student.dob || '2004-03-15'}
Blood Group:   O+
Emergency Ph:  ${formData.parentPhone || student.parentContact?.phone || 'N/A'}
Card Issue:    2026-09-01
Valid Thru:    2027-06-30
==============================================
    Verified by EduPredict AI System
==============================================
`;
    const blob = new Blob([idCardData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_ID_Card_${student.studentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Digital ID Card generated and downloaded!');
  };

  if (loading) return <LoadingSpinner label="Loading your profile..." />;
  const student = data?.student || user?.studentProfile;
  if (!student) return <div className="text-slate-400 p-8">Profile not found. Contact administrator.</div>;

  const InfoRow = ({ icon: Icon, label, value, highlight }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
      <div className="flex items-center gap-2.5 text-slate-400">
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <span className={`text-xs font-bold ${highlight || 'text-slate-200'}`}>{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-indigo-400 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/20 shrink-0">
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">{student.name}</h1>
            <p className="text-sm text-slate-400 mt-1">
              <span className="font-mono text-blue-400 font-bold">{student.studentId}</span>
              {' '}•{' '}{student.department}
              {' '}•{' '}Year {student.year}, Section {student.section}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Link
                to="/student/risk-status"
                className={`px-3 py-1 rounded-full text-xs font-bold border hover:opacity-90 transition-all ${
                  student.currentRiskLevel === 'HIGH'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : student.currentRiskLevel === 'MEDIUM'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
                title="Click to view full Risk Status"
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                  student.currentRiskLevel === 'HIGH' ? 'bg-rose-500 animate-pulse' :
                  student.currentRiskLevel === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                }`}></span>
                {student.currentRiskLevel} RISK ({student.currentRiskScore}%) ↗
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {student.gender}
              </span>
              <Link
                to="/student/performance"
                className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                title="Click to view Academic Performance"
              >
                GPA: {student.currentGpa.toFixed(1)} ↗
              </Link>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              populateForm(student);
              setEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
          <button
            onClick={handleDownloadIdCard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all"
            title="Download Digital Student Card"
          >
            <Download className="w-4 h-4" />
            Student ID Card
          </button>
        </div>
      </div>

      {/* QUICK FEATURE LINK HUB: Direct Navigation to Risk Status & Academic Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Link Card 1: My Risk Status */}
        <div
          onClick={() => navigate('/student/risk-status')}
          className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 hover:border-purple-500/60 cursor-pointer transition-all hover:scale-[1.01] group space-y-3 shadow-lg shadow-purple-500/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  My Dropout Risk Status & Simulator
                </h3>
                <p className="text-[11px] text-slate-400">Interactive live AI risk calculation deck</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-purple-500/20 text-xs">
            <span className="text-slate-400">Current AI Evaluation:</span>
            <span className={`font-bold ${
              student.currentRiskLevel === 'HIGH' ? 'text-rose-400' :
              student.currentRiskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {student.currentRiskScore}% ({student.currentRiskLevel} RISK)
            </span>
          </div>
        </div>

        {/* Link Card 2: Academic Performance */}
        <div
          onClick={() => navigate('/student/performance')}
          className="glass-panel p-5 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/30 via-slate-900 to-slate-950 hover:border-blue-500/60 cursor-pointer transition-all hover:scale-[1.01] group space-y-3 shadow-lg shadow-blue-500/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  Academic Performance Analytics
                </h3>
                <p className="text-[11px] text-slate-400">Coursework marks, subject tutoring & transcripts</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-blue-500/20 text-xs">
            <span className="text-slate-400">Current Academic Standing:</span>
            <span className="font-bold text-blue-400">
              GPA: {student.currentGpa.toFixed(1)} • Att: {student.attendance}% • Backlogs: {student.backlogs}
            </span>
          </div>
        </div>
      </div>

      {/* Bio & Career Goal Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-purple-400 font-bold">
            <Award className="w-4 h-4" /> About & Bio
          </div>
          <p className="text-slate-300 leading-relaxed">
            {formData.bio || student.bio || 'Undergraduate student committed to academic excellence and computer systems.'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Target className="w-4 h-4" /> Career Aspiration & Goals
          </div>
          <p className="text-slate-300 leading-relaxed">
            {formData.careerGoal || student.careerGoal || 'Full Stack Software Engineer & Distributed Systems Specialist'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Information
            </h2>
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
            >
              Edit
            </button>
          </div>
          <InfoRow icon={User} label="Full Name" value={student.name} />
          <InfoRow icon={Mail} label="Email Address" value={formData.email || student.email} />
          <InfoRow icon={Phone} label="Phone Number" value={formData.phone || student.phone} />
          <InfoRow icon={Calendar} label="Date of Birth" value={formData.dob || student.dob} />
          <InfoRow icon={MapPin} label="Campus / Residential Address" value={formData.address || student.address} />
          <InfoRow icon={DollarSign} label="Tuition Fee Status"
            value={student.feeStatus === 1 ? 'Paid (Verified ✓)' : 'Pending (Due ✗)'}
            highlight={student.feeStatus === 1 ? 'text-emerald-400' : 'text-rose-400'}
          />
        </div>

        {/* Academic Information */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Academic Standing & Metrics
            </h2>
            <Link to="/student/performance" className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold">
              Open Analytics ↗
            </Link>
          </div>
          <InfoRow icon={BookOpen} label="Department" value={student.department} />
          <InfoRow icon={GraduationCap} label="Academic Year" value={`Year ${student.year}`} />
          <InfoRow icon={MapPin} label="Class Section" value={`Section ${student.section}`} />
          <InfoRow icon={BookOpen} label="Current Cumulative GPA"
            value={`${student.currentGpa?.toFixed(2)} / 10.0`}
            highlight={student.currentGpa < 5.5 ? 'text-rose-400' : 'text-emerald-400'}
          />
          <InfoRow icon={BookOpen} label="Previous Semester GPA" value={`${student.previousGpa?.toFixed(2)} / 10.0`} />
          <InfoRow icon={AlertTriangle} label="Active Course Backlogs"
            value={`${student.backlogs} subjects`}
            highlight={student.backlogs > 0 ? 'text-rose-400' : 'text-emerald-400'}
          />
        </div>

        {/* Performance Metrics Progress Bars */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Academic Evaluation Breakdown
            </h2>
            <Link to="/student/performance" className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold">
              View Breakdown ↗
            </Link>
          </div>
          {[
            { label: 'Attendance Rate', value: student.attendance, unit: '%', danger: 65, color: 'blue' },
            { label: 'Assignment Completion', value: student.assignmentCompletion, unit: '%', danger: 50, color: 'purple' },
            { label: 'Internal Marks', value: student.internalMarks, unit: '%', danger: 50, color: 'indigo' },
            { label: 'Semester Exam Marks', value: student.semesterMarks, unit: '%', danger: 50, color: 'cyan' },
            { label: 'Classroom Participation', value: student.participation, unit: '%', danger: 40, color: 'teal' },
          ].map((metric) => (
            <div key={metric.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-semibold">{metric.label}</span>
                <span className={`font-bold ${metric.value < metric.danger ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {metric.value}{metric.unit}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    metric.value < metric.danger ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Parent / Guardian Information */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Parent / Guardian Contact
            </h2>
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Edit
            </button>
          </div>
          <InfoRow icon={User} label="Guardian Full Name" value={formData.parentName || student.parentContact?.name} />
          <InfoRow icon={Phone} label="Guardian Phone" value={formData.parentPhone || student.parentContact?.phone} />
          <InfoRow icon={Mail} label="Guardian Email" value={formData.parentEmail || student.parentContact?.email} />
          <div className="pt-4 border-t border-slate-800 mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Academic Health Summary
            </h3>
            <InfoRow icon={BookOpen} label="Historical Trend" value={student.previousAcademicPerformance} />
            <InfoRow icon={HeartHandshake} label="Support Advisor" value="Dr. Alan Turing (Mentor)" />
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-700 w-full max-w-xl space-y-4 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                Edit Profile Information
              </h3>
              <button
                onClick={() => setEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                    placeholder="+1-555-0201"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                  placeholder="Street / Campus Dormitory"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student Bio / About</label>
                <textarea
                  rows="2"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium resize-none"
                  placeholder="A short note about yourself and your academic focus..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Career Aspiration / Target Role</label>
                <input
                  type="text"
                  value={formData.careerGoal}
                  onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                  placeholder="e.g. AI Research Engineer / Full Stack Developer"
                />
              </div>

              {/* Guardian Info */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Parent / Guardian Contact</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;
