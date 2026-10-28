import React from 'react';

const RiskBadge = ({ level, score, showScore = true }) => {
  const normLevel = (level || 'LOW').toUpperCase();

  let colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let dotColor = 'bg-emerald-400';

  if (normLevel === 'HIGH') {
    colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    dotColor = 'bg-rose-500 animate-pulse';
  } else if (normLevel === 'MEDIUM') {
    colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-400';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClasses}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
      {normLevel} RISK
      {showScore && score !== undefined && score !== null && (
        <span className="ml-1 opacity-80">({score}%)</span>
      )}
    </span>
  );
};

export default RiskBadge;
