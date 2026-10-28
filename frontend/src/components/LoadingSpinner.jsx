import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading analytics & ML data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-xs font-semibold text-slate-400 animate-pulse">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
