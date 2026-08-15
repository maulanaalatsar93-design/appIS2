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
      case 'navy': return 'bg-industrial-navy border-industrial-navy/20 shadow-lg';
      case 'blue': return 'bg-industrial-navy border-industrial-navy/20 shadow-lg'; // Mapped to Navy
      case 'teal': return 'bg-industrial-navy border-industrial-navy/20 shadow-lg'; // Mapped to Navy
      case 'orange': return 'bg-industrial-orange border-industrial-orange/20 shadow-lg';
      case 'red': return 'bg-industrial-red border-industrial-red/20 shadow-lg';
      case 'rose': return 'bg-industrial-red border-industrial-red/20 shadow-lg';
      default: return 'bg-white border-industrial-border shadow-sm-subtle';
    }
  };

  const getIconContainerStyles = () => {
    if (isDark) return 'bg-white/10 text-white/80';
    return '';
  };

  const getTrendColor = () => {
    if (trendDir === 'up') return isDark ? 'text-emerald-300 bg-emerald-400/20' : 'text-industrial-green bg-industrial-green/10';
    if (trendDir === 'down') return isDark ? 'text-rose-300 bg-rose-400/20' : 'text-industrial-red bg-industrial-red/10';
    return isDark ? 'text-white/70 bg-white/10' : 'text-industrial-muted bg-industrial-background';
  };

  const renderTrendIcon = () => {
    if (trendDir === 'up') return <TrendingUp className="w-3.5 h-3.5 mr-1" />;
    if (trendDir === 'down') return <TrendingDown className="w-3.5 h-3.5 mr-1" />;
    return <Minus className="w-3.5 h-3.5 mr-1" />;
  };

  return (
    <div className={`${getContainerStyles()} border p-5 rounded-[18px] flex flex-col justify-between transition-transform hover:-translate-y-1 relative overflow-hidden ${className}`}>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          {Icon && (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10' : variant === 'orange' ? 'bg-black/10' : 'bg-slate-100'}`}>
              <Icon className={`w-4 h-4 ${isDark ? 'text-white/80' : variant === 'orange' ? 'text-black/80' : 'text-slate-600'}`} />
            </div>
          )}
          <span className={`text-[11px] font-extrabold uppercase tracking-widest ${isDark ? 'text-white/60' : variant === 'orange' ? 'text-black/60' : 'text-slate-500'}`}>
            {label}
          </span>
        </div>
        
        <div className="flex items-baseline gap-2 mb-4">
          <span className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-industrial-ink'}`}>{value}</span>
          {unit && <span className={`text-sm font-bold ${isDark ? 'text-white/50' : variant === 'orange' ? 'text-black/50' : 'text-slate-400'}`}>{unit}</span>}
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
