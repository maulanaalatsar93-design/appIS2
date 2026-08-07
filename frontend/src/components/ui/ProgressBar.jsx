import React from 'react';

export default function ProgressBar({ 
  value, 
  max = 100, 
  status = 'normal', // normal, success, warning, critical
  label,
  showPercentage = true
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getColor = () => {
    switch (status) {
      case 'success': return 'bg-industrial-green';
      case 'warning': return 'bg-industrial-orange';
      case 'critical': return 'bg-industrial-red';
      case 'normal':
      default: return 'bg-industrial-blue';
    }
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-industrial-text">{label}</span>}
          {showPercentage && <span className="text-xs font-bold text-industrial-text">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-industrial-border rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
