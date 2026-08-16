import React from 'react';
import Sparkline from './Sparkline';

export default function ScorecardGroup({ title, items = [] }) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8 space-y-6 relative overflow-hidden">

      {/* Title */}
      <h3 className="text-center text-xl font-display font-extrabold text-ink tracking-tight relative z-10">
        {title}
      </h3>

      {/* Symmetrical 3-Column Metric Items */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 relative z-10">
        {items.map((item, idx) => {
          const isDark = item.isDark;
          return (
            <div
              key={idx}
              className={`p-6 ${isDark ? (item.bgGradient || 'bg-[#193B8F]') + ' text-white' : 'bg-white text-slate-800'} border ${isDark ? 'border-transparent' : 'border-slate-200'} rounded-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group`}
              style={!isDark && item.color ? { borderTop: `4px solid ${item.color}` } : {}}
            >

              <div className="z-10 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.icon && (
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-inner ${isDark ? 'bg-white/10 ring-1 ring-white/20' : 'bg-gray-50 ring-1 ring-gray-100'}`}>
                        <item.icon className={`w-4 h-4 ${isDark ? 'text-white' : 'text-navy-600'}`} />
                      </div>
                    )}
                    <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.onInfoClick && (
                    <button
                      onClick={item.onInfoClick}
                      className={`p-1.5 rounded-full ${isDark ? 'bg-white/20 text-white hover:bg-white hover:text-navy-600' : 'bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50'} transition-all shadow-sm`}
                      title="Klik untuk detail"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                {item.subLabel && (
                   <div className={`text-[11px] font-semibold mt-2 ${isDark ? 'text-white/60' : 'text-gray-400'}`}>{item.subLabel}</div>
                )}
                
                <div className="flex items-baseline gap-2 mt-4 mb-3">
                  <p className={`text-4xl md:text-5xl font-display font-extrabold tracking-tight`}>
                    {item.value ? Number(item.value).toLocaleString('id-ID') : '0'}
                  </p>
                  <span className={`text-sm font-bold ${isDark ? 'text-white/60' : 'text-gray-400'}`}>{item.unit || 'WO'}</span>
                </div>

                {item.progress && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold ${isDark ? 'text-white/70' : 'text-gray-500'}`}>{item.progress.label}</span>
                      <span className={`text-xs font-extrabold ${item.progress.rate >= (item.progress.target || 90) ? (isDark ? 'text-emerald-300' : 'text-emerald-500') : (isDark ? 'text-orange-300' : 'text-orange-500')}`}>
                        {item.progress.rate}%
                      </span>
                    </div>
                    <div className={`relative w-full h-2.5 ${isDark ? 'bg-white/10 ring-1 ring-white/20' : 'bg-gray-100 ring-1 ring-gray-200/50'} rounded-full overflow-hidden`}>
                      <div
                        className="h-full rounded-full transition-all duration-700 shadow-inner"
                        style={{
                          width: `${Math.min(item.progress.rate, 100)}%`,
                          background: item.progress.rate >= (item.progress.target || 90)
                            ? '#10b981'
                            : '#f97316'
                        }}
                      />
                      {item.progress.target && (
                         <div className={`absolute top-0 h-full w-0.5 ${isDark ? 'bg-white/80' : 'bg-gray-400'}`} style={{ left: `${item.progress.target}%` }} />
                      )}
                    </div>
                    <div className="flex justify-between text-[9px] mt-1.5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-400'}>Target {item.progress.target || 90}%</span>
                      <span className={isDark ? 'text-white/60 font-bold' : 'text-gray-500 font-bold'}>{item.progress.count} / {item.progress.total}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`absolute bottom-0 left-0 right-0 ${item.progress ? 'h-10 opacity-30' : 'h-20 opacity-100'} z-0`}>
                <Sparkline
                  data={item.sparklineData}
                  color={isDark ? 'rgba(255,255,255,0.2)' : (item.color || '#1A4BC4')}
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
