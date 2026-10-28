import React, { useState, useEffect } from 'react';
import { getOverview, getRiskStats, getDepartmentStats } from '../services/analyticsService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import { BarChart3, PieChart as PieIcon, Layers, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [riskStats, setRiskStats] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [ovData, rData, dData] = await Promise.all([
        getOverview(),
        getRiskStats(),
        getDepartmentStats()
      ]);
      setOverview(ovData);
      setRiskStats(rData);
      setDeptStats(dData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner label="Calculating institutional predictive analytics..." />;

  const total = overview?.totalStudents || 1;
  const highRiskPct = Math.round(((overview?.highRiskCount || 0) / total) * 100);
  const medRiskPct = Math.round(((overview?.mediumRiskCount || 0) / total) * 100);
  const lowRiskPct = Math.round(((overview?.lowRiskCount || 0) / total) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Advanced Predictive Analytics & Metrics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Institutional metrics, risk ratios, backlog distribution, and intervention success rates
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="High Risk Ratio" value={`${highRiskPct}%`} subtitle={`${overview?.highRiskCount} candidates`} color="red" icon={BarChart3} />
        <StatCard title="Medium Risk Ratio" value={`${medRiskPct}%`} subtitle={`${overview?.mediumRiskCount} candidates`} color="amber" icon={PieIcon} />
        <StatCard title="Low Risk Ratio" value={`${lowRiskPct}%`} subtitle={`${overview?.lowRiskCount} candidates`} color="emerald" icon={Layers} />
        <StatCard title="Intervention Completion Rate" value={`${overview?.interventionCompletionRate || 0}%`} subtitle={`${overview?.completedInterventions} of ${overview?.totalInterventions} done`} color="purple" icon={TrendingUp} />
      </div>

      {/* Backlogs & Department Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backlog Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white">Backlog Distribution Across Roster</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskStats?.backlogRanges || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Student Count" fill="#EC4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Average Attendance & GPA */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white">Department Average GPA & Attendance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="department" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="avgGpa" name="Avg GPA (Scale 10)" fill="#6366F1" />
                <Bar dataKey="avgAttendance" name="Avg Attendance (%)" fill="#14B8A6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
