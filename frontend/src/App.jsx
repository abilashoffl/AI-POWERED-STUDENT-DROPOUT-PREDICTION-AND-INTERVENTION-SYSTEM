import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Auth Pages
import PortalSelection from './pages/PortalSelection';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import StudentList from './pages/StudentList';
import StudentProfile from './pages/StudentProfile';
import RiskAnalysis from './pages/RiskAnalysis';
import Interventions from './pages/Interventions';
import Mentors from './pages/Mentors';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Student Pages — each sidebar item has its own dedicated page
import StudentDashboard from './pages/StudentDashboard';
import StudentProfilePage from './pages/StudentProfilePage';
import AcademicPerformance from './pages/AcademicPerformance';
import MyRiskStatus from './pages/MyRiskStatus';
import Recommendations from './pages/Recommendations';
import StudentInterventions from './pages/StudentInterventions';
import StudentNotifications from './pages/StudentNotifications';

// Route Guard component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-semibold animate-pulse">
        Restoring session & verifying access...
      </div>
    );
  }

  if (!user) {
    const redirectPath = allowedRole === 'admin' ? '/admin/login' : (allowedRole === 'student' ? '/student/login' : '/login');
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
};

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PortalSelection />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentList />} />
        <Route path="/admin/students/:id" element={<StudentProfile />} />
        <Route path="/admin/predictions" element={<RiskAnalysis />} />
        <Route path="/admin/risk-analysis" element={<RiskAnalysis />} />
        <Route path="/admin/interventions" element={<Interventions />} />
        <Route path="/admin/mentors" element={<Mentors />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/alerts" element={<Alerts />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      {/* Protected Student Routes — ALL sidebar items now have dedicated pages */}
      <Route
        element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfilePage />} />
        <Route path="/student/performance" element={<AcademicPerformance />} />
        <Route path="/student/risk-status" element={<MyRiskStatus />} />
        <Route path="/student/recommendations" element={<Recommendations />} />
        <Route path="/student/interventions" element={<StudentInterventions />} />
        <Route path="/student/notifications" element={<StudentNotifications />} />
        <Route path="/student/settings" element={<Settings />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route
        path="*"
        element={
          user ? (
            user.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/student/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
