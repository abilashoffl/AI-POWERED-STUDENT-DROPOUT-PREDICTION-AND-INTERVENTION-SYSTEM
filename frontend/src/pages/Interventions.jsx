import React, { useState, useEffect } from 'react';
import { getInterventions, createIntervention, updateIntervention, deleteIntervention } from '../services/interventionService';
import InterventionModal from '../components/InterventionModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HeartHandshake,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck,
  Trash2
} from 'lucide-react';

const Interventions = () => {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchInterventions();
  }, [statusFilter]);

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const data = await getInterventions({ status: statusFilter });
      setInterventions(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateIntervention(id, { status: newStatus });
      fetchInterventions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this intervention record?')) {
      try {
        await deleteIntervention(id);
        fetchInterventions();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleModalSubmit = async (payload) => {
    await createIntervention(payload);
    fetchInterventions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-purple-400" />
            Early Intervention Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track, assign faculty mentors, and manage action plans for at-risk candidates
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          Assign Intervention
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            {st} {st === 'All' ? `(${interventions.length})` : ''}
          </button>
        ))}
      </div>

      {/* Interventions List */}
      {loading ? (
        <LoadingSpinner label="Fetching intervention records..." />
      ) : interventions.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <HeartHandshake className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Interventions Found</h3>
          <p className="text-xs text-slate-400">Click 'Assign Intervention' to create a new action plan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interventions.map((item) => (
            <div key={item._id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      {item.type}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{item.title}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                    item.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    item.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {item.priority} Priority
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.description || 'No detailed notes provided.'}</p>

                <div className="pt-3 mt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Student ID:</span>
                    <span className="text-slate-200 font-mono ml-1.5">{item.studentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Assigned Mentor:</span>
                    <span className="text-slate-200 font-semibold ml-1.5">{item.mentorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Target Deadline:</span>
                    <span className="text-slate-200 ml-1.5">{new Date(item.deadline).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Created By:</span>
                    <span className="text-slate-400 ml-1.5">{item.createdBy}</span>
                  </div>
                </div>
              </div>

              {/* Status Selector & Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                  title="Remove record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <InterventionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default Interventions;
