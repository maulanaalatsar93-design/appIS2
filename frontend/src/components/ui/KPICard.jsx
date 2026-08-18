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
  const isDark = variant !== 'default';

  const getContainerStyles = () => {
    switch(variant) {
      case 'navy': return 'bg-[#193B8F] border-transparent text-white shadow-sm';
      case 'blue': return 'bg-[#3047D8] border-transparent text-white shadow-sm';
      case 'teal': return 'bg-[#168477] border-transparent text-white shadow-sm';
      case 'orange': return 'bg-[#FF7410] border-transparent text-white shadow-sm';
      case 'red': return 'bg-[#D92D20] border-transparent text-white shadow-sm';
      case 'rose': return 'bg-[#D92D20] border-transparent text-white shadow-sm'; // Mapping rose to red semantic
      default: return 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm text-[#172033]';
    }
  };

  const getTrendColor = () => {
    if (trendDir === 'up') return isDark ? 'text-emerald-300 bg-emerald-400/20 ring-1 ring-emerald-400/30' : 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100';
    if (trendDir === 'down') return isDark ? 'text-rose-300 bg-rose-400/20 ring-1 ring-rose-400/30' : 'text-rose-600 bg-rose-50 ring-1 ring-rose-100';
    return isDark ? 'text-white/80 bg-white/10 ring-1 ring-white/20' : 'text-gray-500 bg-gray-50 ring-1 ring-gray-100';
  };

  const renderTrendIcon = () => {
    if (trendDir === 'up') return <TrendingUp className="w-3.5 h-3.5 mr-1" />;
    if (trendDir === 'down') return <TrendingDown className="w-3.5 h-3.5 mr-1" />;
    return <Minus className="w-3.5 h-3.5 mr-1" />;
  };

  return (
    <div className={`${getContainerStyles()} border p-5 rounded-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group ${className}`}>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5">
          {Icon && (
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-inner ${isDark ? 'bg-white/10 ring-1 ring-white/20 backdrop-blur-sm' : 'bg-gray-50 ring-1 ring-gray-100'}`}>
              <Icon className={`w-4 h-4 ${isDark ? 'text-white' : 'text-navy-600'}`} />
            </div>
          )}
          <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/80' : 'text-gray-500'}`}>
            {label}
          </span>
        </div>
        
        <div className="flex items-baseline gap-2 mb-4">
          <span className={`text-4xl md:text-5xl font-display font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>{value}</span>
          {unit && <span className={`text-sm font-bold ${isDark ? 'text-white/60' : 'text-gray-400'}`}>{unit}</span>}
        </div>
        
        {(trendValue || trendLabel) && (
          <div className="flex items-center mt-2">
            {trendValue && (
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-extrabold shadow-sm ${getTrendColor()}`}>
                {renderTrendIcon()}
                {trendValue}
              </span>
            )}
            {trendLabel && <span className={`text-[10px] font-semibold ml-2 ${isDark ? 'text-white/60' : 'text-gray-400'}`}>{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

