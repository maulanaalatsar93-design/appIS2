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

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
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
    <div className="flex h-screen shrink-0 relative z-40 bg-gray-50 overflow-hidden print:hidden">
      
      {/* === Primary Sidebar (Thin) === */}
      <aside className="w-[84px] bg-white border-r border-gray-200 flex flex-col items-center py-5 justify-between shrink-0 h-full z-20">
        <div className="w-full flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-shadow">
            <img
              src={logoImg}
              alt="Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = brandIconImg; }}
            />
          </div>

          {/* Primary Nav Icons */}
          <div className="flex flex-col gap-2 w-full px-3">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategoryId === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setIsCollapsed(false); 
                  }}
                  className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                    isActive 
                      ? 'bg-navy-600 text-white shadow-lg shadow-navy-600/30' 
                      : 'text-gray-400 hover:text-navy-600 hover:bg-navy-50'
                  }`}
                  title={cat.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className={`text-[9px] font-semibold tracking-wide ${isActive ? 'text-white' : 'text-gray-400'}`}>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-3 w-full px-3">
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full mx-auto bg-gray-200 border-2 border-white shadow-sm overflow-hidden mt-1 flex items-center justify-center text-orange-600 font-bold text-sm" style={{ background: '#FDEAE0' }}>
            {user?.nama?.charAt(0) || user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </aside>

      {/* === Secondary Sidebar (Expandable) === */}
      <aside 
        className={`bg-white border-r border-gray-200 flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'w-0 border-r-0' : 'w-[280px]'
        }`}
      >
        <div className="flex-1 overflow-hidden flex flex-col min-w-[280px]">
          
          {/* Header of Secondary Sidebar */}
          <div className="h-[84px] px-6 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xl font-display font-bold text-ink tracking-tight">{activeCategory.label}</h2>
              <p className="text-xs text-gray-400 font-medium tracking-wide">Menu & Modul Navigasi</p>
            </div>
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 text-gray-400 hover:text-ink hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar mock (kosmetik/fungsional) */}
          <div className="px-5 mb-4 shrink-0">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-navy-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Cari menu..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-navy-600 focus:bg-white transition-all placeholder:text-gray-400 font-medium shadow-sm"
              />
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="px-3 flex-1 overflow-y-auto space-y-5 pb-6 custom-scrollbar">
            {activeCategory.groups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{group.label}</p>
                
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-navy-50 text-navy-600'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-ink'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-navy-600' : 'text-gray-400'}`} />
                          <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
                        </div>
                        {isActive && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Card in secondary sidebar */}
          <div className="p-5 mt-auto shrink-0 border-t border-gray-100">
            <div className="bg-gradient-to-br from-navy-50 to-white border border-navy-100 rounded-2xl p-4 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-navy-600/5 rounded-full blur-xl group-hover:bg-navy-600/10 transition-colors" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-navy-600 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">Work Order</p>
                  <p className="text-[10px] text-gray-500 font-medium">Buat Baru</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </div>
  );
}
