import React, { useState, useEffect } from 'react';
import { getOverview, getRiskStats, getDepartmentStats } from '../services/analyticsService';
import { getInterventions } from '../services/interventionService';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  AlertTriangle,
  HeartHandshake,
  UserCheck,
  TrendingDown,
  ShieldCheck,
  BrainCircuit,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [riskStats, setRiskStats] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ovData, rData, dData, intData] = await Promise.all([
        getOverview(),
        getRiskStats(),
        getDepartmentStats(),
        getInterventions()
      ]);
      setOverview(ovData);
      setRiskStats(rData);
      setDeptStats(dData);
      setInterventions(intData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner label="Compiling ML risk matrix & analytics..." />;

  // Monthly trend mock data
  const monthlyTrendData = [
    { month: 'Nov', low: 45, medium: 20, high: 8 },
    { month: 'Dec', low: 48, medium: 18, high: 9 },
    { month: 'Jan', low: 42, medium: 22, high: 12 },
    { month: 'Feb', low: 40, medium: 25, high: 14 },
    { month: 'Mar', low: 38, medium: 24, high: 16 },
    { month: 'Apr', low: 44, medium: 21, high: 10 }
  ];

  // Intervention Status summary
  const intStatusData = [
    { name: 'Pending', value: interventions.filter((i) => i.status === 'Pending').length, fill: '#F59E0B' },
    { name: 'In Progress', value: interventions.filter((i) => i.status === 'In Progress').length, fill: '#3B82F6' },
    { name: 'Completed', value: interventions.filter((i) => i.status === 'Completed').length, fill: '#10B981' },
    { name: 'Cancelled', value: interventions.filter((i) => i.status === 'Cancelled').length, fill: '#64748B' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Institutional Analytics Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ML dropout risk scoring & early intervention metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ML Model Active (v1.0.0)
          </span>
        </div>
      </div>

      {/* 6 Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={overview?.totalStudents || 0}
          subtitle="Enrolled candidates"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="High Risk"
          value={overview?.highRiskCount || 0}
          subtitle="Risk Score >= 70%"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Medium Risk"
          value={overview?.mediumRiskCount || 0}
          subtitle="Risk Score 40-69%"
          icon={TrendingDown}
          color="amber"
        />
        <StatCard
          title="Low Risk"
          value={overview?.lowRiskCount || 0}
          subtitle="Risk Score < 40%"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Active Interventions"
          value={overview?.activeInterventions || 0}
          subtitle="In progress / pending"
          icon={HeartHandshake}
          color="purple"
        />
        <StatCard
          title="Needs Attention"
          value={overview?.studentsRequiringAttention || 0}
          subtitle="Critical indicators"
          icon={BrainCircuit}
          color="red"
        />
      </div>

      {/* 6 Recharts Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Risk Distribution (Donut Chart) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-400" />
              1. Student Dropout Risk Distribution
            </h3>
            <span className="text-[11px] text-slate-400">Total: {overview?.totalStudents || 0}</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskStats?.riskDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(riskStats?.riskDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department-wise Risk Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              2. Department-Wise Risk Distribution
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="department" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="lowRisk" name="Low Risk" stackId="a" fill="#10B981" />
                <Bar dataKey="mediumRisk" name="Medium Risk" stackId="a" fill="#F59E0B" />
                <Bar dataKey="highRisk" name="High Risk" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Attendance vs Risk Score */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              3. Attendance % vs Calculated Risk Score
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" domain={[30, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="riskScore" name="Risk Score" unit="%" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Scatter name="Students" data={riskStats?.attendanceVsRisk || []} fill="#3B82F6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: GPA vs Risk Score */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              4. Current GPA vs Risk Score Correlation
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskStats?.gpaVsRisk || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="gpa" name="Current GPA (Scale 10)" fill="#8B5CF6" />
                <Bar dataKey="riskScore" name="Risk Score (%)" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Monthly Prediction Risk Trend */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              5. Monthly Risk Level Prediction Trend
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="high" name="High Risk" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="medium" name="Medium Risk" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                <Area type="monotone" dataKey="low" name="Low Risk" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Intervention Status Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-purple-400" />
              6. Early Intervention Progress Status
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="value" name="Interventions" radius={[0, 8, 8, 0]}>
                  {intStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
