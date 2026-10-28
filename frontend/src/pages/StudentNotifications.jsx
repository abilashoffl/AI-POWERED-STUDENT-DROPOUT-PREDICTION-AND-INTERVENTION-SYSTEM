import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Bell, AlertTriangle, Clock, CheckCircle, Info, BellOff,
  Trash2, Filter, ArrowRight, CheckCheck, RefreshCw, Send, PlusCircle
} from 'lucide-react';

const StudentNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (user?.studentId) {
      fetchNotifications(user.studentId);
    } else {
      setLoading(false);
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchNotifications = async (sid) => {
    setLoading(true);
    try {
      const data = await getNotifications();
      const filtered = (data.notifications || []).filter(
        n => !n.studentId || n.studentId === sid
      );
      setNotifications(filtered);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      showToast('Notification marked as read.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) {
      await markNotificationRead(n._id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read!');
  };

  const handleActionNavigate = (type) => {
    if (type === 'risk_alert') {
      navigate('/student/risk-status');
    } else if (type === 'attendance_alert') {
      navigate('/student/performance');
    } else if (type === 'intervention_deadline') {
      navigate('/student/interventions');
    } else {
      navigate('/student/recommendations');
    }
  };

  if (loading) return <LoadingSpinner label="Loading your notifications..." />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'risk_alert': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'attendance_alert': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'intervention_deadline': return <Bell className="w-4 h-4 text-blue-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeBg = (type) => {
    switch (type) {
      case 'risk_alert': return 'bg-rose-500/10 border-rose-500/20';
      case 'attendance_alert': return 'bg-amber-500/10 border-amber-500/20';
      case 'intervention_deadline': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-slate-800/40 border-slate-700/40';
    }
  };

  const filtered = activeFilter === 'All'
    ? notifications
    : activeFilter === 'Unread'
    ? notifications.filter(n => !n.isRead)
    : activeFilter === 'Alerts'
    ? notifications.filter(n => n.type === 'risk_alert' || n.type === 'attendance_alert')
    : notifications.filter(n => n.type === 'intervention_deadline');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            <Bell className="w-6 h-6 text-amber-400" />
            Notifications & System Alerts
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time dropout alerts, mentor updates, and deadline reminders
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/20"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}

          <button
            onClick={() => user?.studentId && fetchNotifications(user.studentId)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Unread', 'Alerts', 'Deadlines & Mentorship'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <BellOff className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Notifications Found</h3>
          <p className="text-xs text-slate-400">You are completely up to date. No pending alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <div
              key={n._id}
              className={`glass-panel p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                getTypeBg(n.type)
              } ${n.isRead ? 'opacity-70' : 'border-blue-500/40 shadow-sm'}`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="p-2.5 rounded-xl bg-slate-800/80 shrink-0 mt-0.5">
                  {getTypeIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{n.title}</span>
                    {!n.isRead && (
                      <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-2">
                    <span>{new Date(n.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}</span>
                    <span>•</span>
                    <span className="capitalize">{n.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 justify-end pl-12 sm:pl-0">
                <button
                  onClick={() => handleActionNavigate(n.type)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-blue-300 flex items-center gap-1 border border-slate-700 transition-all"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-xs font-bold text-blue-300 border border-blue-500/30 transition-all flex items-center gap-1"
                    title="Mark as read"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Read</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
