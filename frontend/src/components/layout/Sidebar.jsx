import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UploadCloud,
  ChevronLeft, ChevronRight, CalendarClock,
  MapPin, ClipboardList, BarChart3, BarChart2, Briefcase, Shield, Settings, TableProperties, Clock, AlertOctagon
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import brandIconImg from '../../assets/brand-icon.png';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const isAdmin = user && ['admin', 'superadmin', 'supervisor', 'manager', 'avp', 'vp'].includes(user.role);

  const menuGroups = [
    {
      label: 'Menu Utama',
      items: [
        { path: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
        { path: '/manpower', label: 'Man Power & Kalender', icon: Users },
        { path: '/sertifikasi', label: 'Sertifikasi Personel', icon: Shield },
        { path: '/performance-killer', label: 'Performance Killer', icon: AlertOctagon },
      ]
    },
    {
      label: 'PdM Rotating',
      items: [
        { path: '/pdm', label: 'Dashboard PdM', icon: BarChart3 },
        { path: '/pdm/area', label: 'Area Dashboard', icon: BarChart2 },
        { path: '/pdm/calendar', label: 'Kalender PdM', icon: CalendarClock },
        { path: '/pdm/roster',   label: 'Roster PIC',    icon: TableProperties },
        { path: '/pdm/tasks',    label: 'Task Board',    icon: ClipboardList },
        { path: '/pdm/man-hours', label: 'Man Hours (Daily Task)', icon: Clock },
        isAdmin ? { path: '/pdm/rules', label: 'Master Schedule', icon: Settings } : null,
      ].filter(Boolean)
    },
    {
      label: 'Workforce Management',
      items: [
        { path: '/wp/programs', label: 'Work Programs', icon: Briefcase },
        { path: '/wp/cube', label: 'Work Cube — My Tasks', icon: ClipboardList },
        { path: '/wp/monitor', label: 'KPI Monitor', icon: BarChart3 },
      ]
    },
    {
      label: 'Import data',
      items: [
        { path: '/import', label: 'Kelola & Import Data SAP', icon: UploadCloud },
      ]
    }
  ];

  return (
    <aside
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-industrial-primaryBase flex flex-col justify-between shrink-0 h-full transition-all duration-300 ease-in-out z-40 relative overflow-y-auto print:hidden`}
    >

      <div className="relative z-10 flex flex-col justify-between h-full p-2.5">
        <div>
          {/* Header & Logo */}
          <div className="h-16 flex items-center justify-between px-1 mb-2 border-b border-white/10">
            <div
              onClick={() => isCollapsed && setIsCollapsed && setIsCollapsed(false)}
              className={`flex items-center ${isCollapsed ? 'justify-center w-full cursor-pointer' : 'gap-3'}`}
              title={isCollapsed ? 'Perluas Sidebar' : undefined}
            >
              <div className="w-10 h-10 bg-industrial-primaryAccent text-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-300 hover:scale-105">
                <img
                  alt="Logo ISTEK 2"
                  className="w-7 h-7 object-contain brightness-0 invert"
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
                    // Gunakan exact match agar /pdm tidak overlap dengan /pdm/tasks dll
                    const isActive = location.pathname === item.path;

                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        title={isCollapsed ? item.label : undefined}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3' : 'space-x-3 px-4 py-3'
                          } rounded-none text-xs font-bold transition-all duration-300 ease-out border-l-4 ${isActive
                            ? 'bg-white/5 border-industrial-primaryAccent text-white'
                            : 'border-transparent text-industrial-muted hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <div className="shrink-0 flex items-center justify-center">
                          <Icon className={`w-5 h-5 transition-colors duration-300 ease-out ${isActive ? 'text-industrial-primaryAccent' : 'text-industrial-muted'}`} />
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

        {/* Support/Pro Card for Expanded state - Removed per user request */}
      </div>
    </aside>
  );
}
