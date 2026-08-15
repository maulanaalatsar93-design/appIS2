import React from 'react';
import Sparkline from './Sparkline';

export default function ScorecardGroup({ title, items = [] }) {
  return (
    <div className="bg-white border border-platinum-dark rounded-[24px] p-6 shadow-soft-card space-y-4">
      {/* Title */}
      <h3 className="text-center text-lg font-extrabold text-ink tracking-tight">
        {title}
      </h3>

      {/* Symmetrical 3-Column Metric Items */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        {items.map((item, idx) => {
          const isDark = item.isDark;
          return (
            <div
              key={idx}
              className={`p-5 ${item.bgGradient || 'bg-[#F8FAFC]'} border ${item.borderColor || 'border-platinum-dark'} rounded-[18px] flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              style={!isDark ? { borderTop: `3.5px solid ${item.color || '#0F172A'}` } : {}}
            >
              <div className="z-10 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.icon && (
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-platinum-dark'}`}>
                        <item.icon className={`w-3.5 h-3.5 ${isDark ? 'text-white/80' : 'text-slate-600'}`} />
                      </div>
                    )}
                    <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-white/70' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.onInfoClick && (
                    <button
                      onClick={item.onInfoClick}
                      className={`p-1 rounded-full ${isDark ? 'bg-white/20 text-white hover:bg-white hover:text-ink' : 'bg-white/80 text-slate-500 hover:text-[#FF5722] hover:bg-white'} transition-all shadow-xs`}
                      title="Klik untuk detail"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                {item.subLabel && (
                   <div className={`text-[11px] mt-1 ${isDark ? 'text-white/60' : 'text-slate-400'}`}>{item.subLabel}</div>
                )}
                
                <div className="flex items-baseline gap-1.5 my-2.5">
                  <p className={`text-3xl md:text-4xl font-extrabold ${item.textColor || (isDark ? 'text-white' : 'text-ink')} tracking-tight`}>
                    {item.value ? Number(item.value).toLocaleString('id-ID') : '0'}
                  </p>
                  <span className={`text-sm font-bold ${isDark ? 'text-white/50' : 'text-slate-400'}`}>{item.unit || 'WO'}</span>
                </div>

                {item.progress && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold ${isDark ? 'text-white/70' : 'text-slate-500'}`}>{item.progress.label}</span>
                      <span className={`text-xs font-extrabold ${item.progress.rate >= (item.progress.target || 90) ? (isDark ? 'text-emerald-300' : 'text-emerald-600') : (isDark ? 'text-amber-300' : 'text-amber-600')}`}>
                        {item.progress.rate}%
                      </span>
                    </div>
                    <div className={`relative w-full h-2.5 ${isDark ? 'bg-white/20' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(item.progress.rate, 100)}%`,
                          background: item.progress.rate >= (item.progress.target || 90)
                            ? 'linear-gradient(90deg,#34d399,#10b981)'
                            : 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                        }}
                      />
                      {item.progress.target && (
                         <div className={`absolute top-0 h-full w-0.5 ${isDark ? 'bg-yellow-300' : 'bg-slate-600'}`} style={{ left: `${item.progress.target}%` }} />
                      )}
                    </div>
                    <div className="flex justify-between text-[9px] mt-1">
                      <span className={isDark ? 'text-white/50' : 'text-slate-400'}>Target {item.progress.target || 90}%</span>
                      <span className={isDark ? 'text-white/60 font-bold' : 'text-slate-600 font-bold'}>{item.progress.count} / {item.progress.total}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`absolute bottom-0 left-0 right-0 ${item.progress ? 'h-10 opacity-40' : 'h-16 opacity-100'} z-0`}>
                <Sparkline
                  data={item.sparklineData}
                  color={isDark ? 'rgba(255,255,255,0.25)' : (item.color || '#2563EB')}
                  strokeWidth={isDark ? 2 : 2.5}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

