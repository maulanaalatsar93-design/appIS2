import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ 
  icon: Icon, 
  label, 
  value, 
  unit = '', 
  trendValue, 
  trendDir = 'neutral', // up, down, neutral
  trendLabel = 'vs last month',
  className = '',
  variant = 'default' // default, navy, blue, teal, orange, red
}) {
  const isDark = variant === 'navy' || variant === 'blue' || variant === 'teal' || variant === 'red' || variant === 'rose';
  // Orange is bright, so it uses dark text (isDark = false) but has a colored background.

  const getContainerStyles = () => {
    switch(variant) {
      case 'navy': return 'bg-navy border-navy shadow-lg';
      case 'blue': return 'bg-navy border-navy shadow-lg';
      case 'teal': return 'bg-navy border-navy shadow-lg';
      case 'orange': return 'bg-accent border-accent shadow-lg';
      case 'red': return 'bg-danger border-danger shadow-lg';
      case 'rose': return 'bg-danger border-danger shadow-lg';
      default: return 'bg-white border-platinum-dark';
    }
  };

  const getIconContainerStyles = () => {
    if (isDark) return 'bg-white/10 text-white/80';
    return '';
  };

  const getTrendColor = () => {
    if (trendDir === 'up') return isDark ? 'text-emerald-300 bg-emerald-400/20' : 'text-success bg-success/10';
    if (trendDir === 'down') return isDark ? 'text-rose-300 bg-rose-400/20' : 'text-danger bg-danger/10';
    return isDark ? 'text-white/70 bg-white/10' : 'text-platinum-dark bg-platinum';
  };

  const renderTrendIcon = () => {
    if (trendDir === 'up') return <TrendingUp className="w-3.5 h-3.5 mr-1" />;
    if (trendDir === 'down') return <TrendingDown className="w-3.5 h-3.5 mr-1" />;
    return <Minus className="w-3.5 h-3.5 mr-1" />;
  };

  return (
    <div className={`${getContainerStyles()} border p-[20px] rounded-[14px] flex flex-col justify-between transition-transform hover:-translate-y-1 relative overflow-hidden ${className}`}>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          {Icon && (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10' : variant === 'orange' ? 'bg-black/10' : 'bg-platinum'}`}>
              <Icon className={`w-4 h-4 ${isDark ? 'text-white/80' : variant === 'orange' ? 'text-black/80' : 'text-platinum-dark'}`} />
            </div>
          )}
          <span className={`text-[12px] font-medium uppercase tracking-[0.5px] ${isDark ? 'text-white/60' : variant === 'orange' ? 'text-black/60' : 'text-platinum-dark'}`}>
            {label}
          </span>
        </div>
        
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-[32px] font-bold font-mono tracking-tight ${isDark ? 'text-white' : 'text-navy'}`}>{value}</span>
          {unit && <span className={`text-sm font-bold ${isDark ? 'text-white/50' : variant === 'orange' ? 'text-black/50' : 'text-platinum-dark'}`}>{unit}</span>}
        </div>
        
        {(trendValue || trendLabel) && (
          <div className="flex items-center mt-2">
            {trendValue && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold ${getTrendColor()}`}>
                {renderTrendIcon()}
                {trendValue}
              </span>
            )}
            {trendLabel && <span className={`text-[10px] ml-2 ${isDark ? 'text-white/50' : variant === 'orange' ? 'text-black/50' : 'text-slate-400'}`}>{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

