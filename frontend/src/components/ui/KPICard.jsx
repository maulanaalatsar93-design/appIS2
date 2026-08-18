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
      case 'navy': return 'bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] shadow-lg shadow-blue-900/20 border-transparent text-white';
      case 'blue': return 'bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] shadow-lg shadow-blue-500/20 border-transparent text-white';
      case 'teal': return 'bg-gradient-to-br from-[#0d9488] to-[#0f766e] shadow-lg shadow-teal-500/20 border-transparent text-white';
      case 'orange': return 'bg-gradient-to-br from-[#ea580c] to-[#c2410c] shadow-lg shadow-orange-500/20 border-transparent text-white';
      case 'red': 
      case 'rose': return 'bg-gradient-to-br from-[#e11d48] to-[#be123c] shadow-lg shadow-rose-500/20 border-transparent text-white';
      default: return 'bg-white border-slate-200/60 shadow-sm hover:shadow-md ring-1 ring-slate-100 text-slate-800';
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
    <div className={`${getContainerStyles()} border p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group ${className}`}>
      
      {/* Premium Decorative Background Pattern */}
      {isDark && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        </>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5">
          {Icon && (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${isDark ? 'bg-white/10 ring-1 ring-white/20 backdrop-blur-md' : 'bg-slate-50 ring-1 ring-slate-200/50'}`}>
              <Icon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-600'}`} />
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

