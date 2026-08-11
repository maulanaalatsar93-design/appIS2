import React from 'react';
import {
  LayoutDashboard, Users, UploadCloud,
  ChevronLeft, ChevronRight, CalendarClock,
  MapPin, ClipboardList, BarChart3, Briefcase, Shield, Settings
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import brandIconImg from '../../assets/brand-icon.png';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  const menuGroups = [
    {
      label: 'Menu Utama',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'manpower', label: 'Man Power & Kalender', icon: Users },
        { id: 'sertifikasi', label: 'Sertifikasi Personel', icon: Shield },
      ]
    },
    {
      label: 'PdM Rotating',
      items: [
        { id: 'pdm-dashboard', label: 'Dashboard PdM', icon: BarChart3 },
        { id: 'pdm-calendar', label: 'Kalender PdM', icon: CalendarClock },
        { id: 'pdm-tasks', label: 'Task Board', icon: ClipboardList },
        { id: 'pdm-rules', label: 'Master Schedule', icon: Settings },
      ]
    },
    {
      label: 'Workforce Management',
      items: [
        { id: 'wp-programs', label: 'Work Programs', icon: Briefcase },
        { id: 'wp-my-cube', label: 'Work Cube — My Tasks', icon: ClipboardList },
        { id: 'wp-monitor', label: 'KPI Monitor', icon: BarChart3 },
      ]
    },
    {
      label: 'Import data',
      items: [
        { id: 'import', label: 'Kelola & Import Data SAP', icon: UploadCloud },
      ]
    }
  ];

  return (
    <aside
      className={`${isCollapsed ? 'w-16' : 'w-64'
        } bg-[#050D1F]/95 backdrop-blur-xl bg-gradient-to-b from-[#0A1A4A] to-[#050D1F] border border-white/10 shadow-2xl flex flex-col justify-between shrink-0 h-[calc(100vh-1.5rem)] my-3 ml-3 rounded-2xl sticky top-3 transition-all duration-300 ease-in-out z-40 relative overflow-hidden print:hidden`}
    >
      {/* Grid lines overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full p-2.5">
        <div>
          {/* Header & Logo */}
          <div className="h-16 flex items-center justify-between px-1 mb-2 border-b border-white/10">
            <div
              onClick={() => isCollapsed && setIsCollapsed && setIsCollapsed(false)}
              className={`flex items-center ${isCollapsed ? 'justify-center w-full cursor-pointer' : 'gap-3'}`}
              title={isCollapsed ? 'Perluas Sidebar' : undefined}
            >
              <div className="w-10 h-10 bg-white/10 border border-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center overflow-hidden shadow-lg shrink-0 transition-transform duration-300 hover:scale-105">
                <img
                  src={logoImg}
                  alt="Logo ISTEK 2"
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = brandIconImg;
                  }}
                />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col justify-center">
                  <p className="text-white font-bold text-xs tracking-tight leading-tight">Inspeksi Teknik 2</p>
                  <p className="text-slate-400 text-[9px] font-medium mt-0.5">Sistem Monitoring</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed && setIsCollapsed(true)}
                className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Ciutkan Sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="space-y-4 mt-3 overflow-y-auto flex-1 pr-1">
            {menuGroups.map((group) => (
              <div key={group.label}>
                {!isCollapsed && (
                  <p className="px-3 text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">{group.label}</p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        title={isCollapsed ? item.label : undefined}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2' : 'space-x-3 px-3 py-2.5'
                          } rounded-xl text-xs font-bold transition-all duration-300 ease-out border ${isActive
                            ? 'bg-[#1A4BC4] text-white shadow-lg shadow-blue-900/40 border-blue-400/30'
                            : 'border-transparent text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                      >
                        <div
                          className={`shrink-0 flex items-center justify-center transition-all duration-300 ease-out ${isCollapsed ? 'w-9 h-9 rounded-full bg-white/5 border border-white/10' : ''
                            } ${isActive ? '!bg-white/15 !border-blue-300/30 text-white' : ''}`}
                        >
                          <Icon className={`w-4 h-4 transition-colors duration-300 ease-out ${isActive ? 'text-[#FF7B4F]' : 'text-white/60'}`} />
                        </div>
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Toggle for Collapsed state */}
        {isCollapsed && (
          <div className="flex justify-center pb-1">
            <button
              onClick={() => setIsCollapsed && setIsCollapsed(false)}
              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Perluas Sidebar"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Footer info minimalis for Expanded state */}
        {!isCollapsed && (
          <div className="p-2.5 text-center border-t border-white/10">
            <span className="text-[10px] text-white/30 font-semibold tracking-wider uppercase">
              Inspeksi Teknik 2
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
