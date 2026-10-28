import React, { useState, useEffect } from 'react';
import { X, HeartHandshake } from 'lucide-react';
import { getMentors } from '../services/mentorService';

const InterventionModal = ({ isOpen, onClose, onSubmit, prefilledStudentId = '', defaultType = 'Academic counselling' }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    type: 'Academic counselling',
    mentorId: '',
    priority: 'High',
    description: '',
    deadline: ''
  });

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMentors();
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setFormData({
        studentId: prefilledStudentId || '',
        title: '',
        type: defaultType || 'Academic counselling',
        mentorId: '',
        priority: 'High',
        description: '',
        deadline: defaultDate.toISOString().split('T')[0]
      });
      setError('');
    }
  }, [isOpen, prefilledStudentId, defaultType]);

  const fetchMentors = async () => {
    try {
      const data = await getMentors();
      setMentors(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const selectedMentor = mentors.find(m => m._id === formData.mentorId);
      const payload = {
        ...formData,
        mentorName: selectedMentor ? selectedMentor.name : 'Unassigned'
      };

      await onSubmit(payload);
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create intervention');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">Assign Early-Warning Intervention</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Student ID *</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g. ST1001"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Intervention Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Weekly Remedial Tutoring & Study Support"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Intervention Category</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Academic counselling">Academic counselling</option>
                <option value="Faculty mentoring">Faculty mentoring</option>
                <option value="Remedial classes">Remedial classes</option>
                <option value="Attendance monitoring">Attendance monitoring</option>
                <option value="Assignment support">Assignment support</option>
                <option value="Peer mentoring">Peer mentoring</option>
                <option value="Parent/guardian meeting">Parent/guardian meeting</option>
                <option value="Financial guidance">Financial guidance</option>
                <option value="Career counselling">Career counselling</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Mentor</label>
              <select
                name="mentorId"
                value={formData.mentorId}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Action Plan & Notes</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe specific milestones, meeting schedules, or remedial strategies..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign Intervention'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterventionModal;
