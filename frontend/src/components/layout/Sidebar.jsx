import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UploadCloud,
  ChevronLeft, ChevronRight, CalendarClock,
  ClipboardList, BarChart3, BarChart2, Briefcase, Shield, Settings, TableProperties, Clock, AlertOctagon,
  Search, Plus, Folder, FileText
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import brandIconImg from '../../assets/brand-icon.png';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const isAdmin = user && ['admin', 'superadmin', 'supervisor', 'manager', 'avp', 'vp'].includes(user.role);

  const CATEGORIES = [
    {
      id: 'main',
      label: 'Overview',
      icon: LayoutDashboard,
      groups: [
        {
          label: 'Menu Utama',
          items: [
            { path: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
            { path: '/manpower', label: 'Man Power & Kalender', icon: Users },
            { path: '/sertifikasi', label: 'Sertifikasi Personel', icon: Shield },
            { path: '/performance-killer', label: 'Performance Killer', icon: AlertOctagon },
          ]
        }
      ]
    },
    {
      id: 'pdm',
      label: 'PdM Rotating',
      icon: FileText,
      groups: [
        {
          label: 'PdM Operations',
          items: [
            { path: '/pdm', label: 'Dashboard PdM', icon: BarChart3 },
            { path: '/pdm/area', label: 'Area Dashboard', icon: BarChart2 },
            { path: '/pdm/calendar', label: 'Kalender PdM', icon: CalendarClock },
            { path: '/pdm/roster',   label: 'Roster PIC',    icon: TableProperties },
            { path: '/pdm/tasks',    label: 'Task Board',    icon: ClipboardList },
            { path: '/pdm/man-hours', label: 'Man Hours (Daily Task)', icon: Clock },
            isAdmin ? { path: '/pdm/rules', label: 'Master Schedule', icon: Settings } : null,
          ].filter(Boolean)
        }
      ]
    },
    {
      id: 'wfm',
      label: 'Workforce',
      icon: Briefcase,
      groups: [
        {
          label: 'Workforce Management',
          items: [
            { path: '/wp/programs', label: 'Work Programs', icon: Briefcase },
            { path: '/wp/cube', label: 'Work Cube — My Tasks', icon: ClipboardList },
            { path: '/wp/monitor', label: 'KPI Monitor', icon: BarChart3 },
          ]
        }
      ]
    },
    {
      id: 'data',
      label: 'Data',
      icon: Folder,
      groups: [
        {
          label: 'Import Data',
          items: [
            { path: '/import', label: 'Kelola & Import Data SAP', icon: UploadCloud },
          ]
        }
      ]
    }
  ];

  const [activeCategoryId, setActiveCategoryId] = useState('main');

  useEffect(() => {
    let found = false;
    for (const cat of CATEGORIES) {
      for (const group of cat.groups) {
        if (group.items.some(item => item.path === location.pathname || (item.path !== '/' && location.pathname.startsWith(item.path + '/')))) {
          setActiveCategoryId(cat.id);
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }, [location.pathname]);

  const activeCategory = CATEGORIES.find(c => c.id === activeCategoryId) || CATEGORIES[0];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-800/50 backdrop-blur-sm z-40 md:hidden pointer-events-auto"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 flex h-screen shrink-0 z-50 pointer-events-none print:hidden transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full'}`}>
        
        {/* === Primary Sidebar (Thin) === */}
        <aside className="w-[72px] bg-white border-r border-slate-200/80 flex flex-col items-center py-5 justify-start shrink-0 h-full z-20 pointer-events-auto shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="w-full flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="w-12 h-12 bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 rounded-2xl flex items-center justify-center cursor-pointer shadow-sm shadow-slate-200/50 hover:shadow-md transition-all group hover:-translate-y-0.5 ring-1 ring-white">
            <img
              src={logoImg}
              alt="Logo"
              className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
              onError={(e) => { e.target.onerror = null; e.target.src = brandIconImg; }}
            />
          </div>

          {/* Primary Nav Icons */}
          <div className="flex flex-col gap-3 w-full items-center">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategoryId === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setIsCollapsed(false); 
                    if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                  }}
                  className={`relative w-[46px] h-[46px] rounded-2xl flex items-center justify-center transition-all duration-300 group ${
                    isActive 
                      ? 'bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] text-white shadow-lg shadow-blue-900/30 ring-1 ring-navy-800' 
                      : 'text-slate-400 hover:text-navy-700 hover:bg-slate-50'
                  }`}
                  title={cat.label}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-orange-500 rounded-r-full shadow-[0_0_8px_rgba(234,88,12,0.6)]" />}
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                </button>
              );
            })}
          </div>
        </div>

      </aside>

      {/* === Secondary Sidebar (Expandable) === */}
      <aside 
        className={`bg-white/95 backdrop-blur-md border-r border-gray-200 flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out overflow-hidden pointer-events-auto shadow-xl ${
          isCollapsed ? 'w-0 border-r-0' : 'w-60'
        }`}
      >
        <div className="flex-1 overflow-hidden flex flex-col min-w-[15rem]">
          
          {/* Header of Secondary Sidebar */}
          <div className="h-[88px] px-6 flex items-center justify-between shrink-0 border-b border-slate-100/60 bg-white/50">
            <div>
              <h2 className="text-xl font-display font-extrabold bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">{activeCategory.label}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Menu & Modul Navigasi</p>
            </div>
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="px-4 py-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
            {activeCategory.groups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2 px-3 mb-2">
                  <div className="w-1 h-3.5 bg-blue-500/40 rounded-full"></div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{group.label}</p>
                </div>
                
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                        navigate(item.path);
                        if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                      }}
                        className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 overflow-hidden ${
                          isActive
                            ? 'bg-blue-50/60 text-blue-700 ring-1 ring-blue-100/50'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"></div>}
                        <div className="flex items-center gap-3 relative z-10">
                          <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
                        </div>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.4)] relative z-10" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
        </aside>
      </div>
    </>
  );
}
