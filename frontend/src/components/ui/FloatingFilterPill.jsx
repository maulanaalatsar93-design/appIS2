import React from 'react';
import { Filter, X } from 'lucide-react';

export default function FloatingFilterPill({ 
  isCollapsed, 
  setIsCollapsed, 
  children, 
  activeCount = 0,
  position = 'bottom-6 right-6'
}) {
  return (
    <div
      className={`fixed ${position} z-40 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-2xl rounded-full p-1.5 transition-all duration-300 ${
        isCollapsed ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="relative flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        title={isCollapsed ? 'Buka Filter' : 'Tutup Filter'}
      >
        {isCollapsed ? <Filter size={14} /> : <X size={14} />}
        {isCollapsed && activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5722] text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm">
            {activeCount}
          </span>
        )}
      </button>

      {!isCollapsed && (
        <div className="flex items-center gap-1.5 pr-1 animate-in fade-in slide-in-from-right-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
