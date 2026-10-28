import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead } from '../services/notificationService';
import { Bell, User, LogOut, Menu, Shield, GraduationCap, CheckCircle } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      let list = data.notifications || [];
      if (user?.role === 'student' && user?.studentId) {
        list = list.filter(n => !n.studentId || n.studentId === user.studentId);
      }
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">EduPredict AI</h1>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Dropout Prevention & Intervention Portal</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-300">System Notifications</span>
                <span className="text-[11px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} Unread
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">No active notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3.5 flex items-start gap-3 transition-colors ${
                        n.isRead ? 'bg-slate-900/40 opacity-70' : 'bg-slate-800/40'
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'risk_alert' ? (
                          <span className="w-2 h-2 rounded-full bg-rose-500 block"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-400 block"></span>
                        )}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-slate-200">{n.title}</div>
                        <div className="text-slate-400 mt-0.5 leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="text-slate-500 hover:text-blue-400 p-1"
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Role Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <Link
            to={user?.role === 'admin' ? '/admin/settings' : '/student/profile'}
            className="text-right hidden sm:block hover:opacity-80 transition-opacity"
            title="View Profile"
          >
            <div className="text-xs font-bold text-slate-200">{user?.name || 'User'}</div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {user?.role === 'admin' ? (
                <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded">
                  ADMIN
                </span>
              ) : (
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                  STUDENT
                </span>
              )}
            </div>
          </Link>
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
