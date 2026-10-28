import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorMap = {
    blue: 'from-blue-600/20 to-indigo-600/5 text-blue-400 border-blue-500/20',
    red: 'from-rose-600/20 to-pink-600/5 text-rose-400 border-rose-500/20',
    amber: 'from-amber-600/20 to-orange-600/5 text-amber-400 border-amber-500/20',
    emerald: 'from-emerald-600/20 to-teal-600/5 text-emerald-400 border-emerald-500/20',
    purple: 'from-purple-600/20 to-indigo-600/5 text-purple-400 border-purple-500/20'
  };

  const bgStyle = colorMap[color] || colorMap.blue;

  return (
    <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${bgStyle} border glass-card transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
