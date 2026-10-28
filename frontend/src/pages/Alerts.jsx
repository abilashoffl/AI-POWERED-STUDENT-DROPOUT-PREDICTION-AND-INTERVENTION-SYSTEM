import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const Alerts = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <LoadingSpinner label="Fetching system alert logs..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          System Risk Notifications & Alerts
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated triggers for high risk escalation, attendance drops, and intervention deadlines
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No active alert logs recorded</div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className={`p-4 flex items-start justify-between gap-4 transition-colors ${n.isRead ? 'opacity-60' : 'bg-slate-800/30'}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {n.type === 'risk_alert' ? (
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {n.title}
                    {!n.isRead && (
                      <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.2 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                  <div className="text-[10px] text-slate-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 shrink-0"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
