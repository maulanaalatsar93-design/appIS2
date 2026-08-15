import React, { useState, useEffect, useContext } from 'react';
import { Bell, Database, Server, LogOut, User, Menu, Lock, Settings } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { playSubmitSound, playSuccessSound, playErrorSound } from '../../utils/soundUtils';

export default function Header({ isCollapsed, setIsCollapsed }) {
  const [apiStatus, setApiStatus] = useState('checking');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    playSubmitSound();
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      });
      const data = await res.json();
      if (res.ok) {
        playSuccessSound();
        setPasswordSuccess('Password berhasil diubah!');
        setPasswordForm({ oldPassword: '', newPassword: '' });
        setTimeout(() => setShowPasswordModal(false), 2000);
      } else {
        playErrorSound();
        setPasswordError(data.message || 'Gagal mengubah password');
      }
    } catch (err) {
      playErrorSound();
      setPasswordError('Koneksi gagal');
    } finally {
      setPasswordLoading(false);
    }
  };

  const [notifications, setNotifications] = useState([
    { id: 'sys-load', title: 'Loading...', desc: 'Memeriksa notifikasi...', time: '', type: 'system' }
  ]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') setApiStatus('online');
        else setApiStatus('offline');
      })
      .catch(() => setApiStatus('offline'));
  }, []);

  useEffect(() => {
    if (user && token) {
      fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/dashboard/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          // Hitung yang unread, misal semua warning adalah unread
          const warnings = data.filter(n => n.type === 'warning').length;
          setUnreadCount(warnings > 0 ? warnings : 1);
        }
      })
      .catch(console.error);
    }
  }, [user, token]);

  const handleLogout = () => {
    playSubmitSound();
    logout();
    navigate('/login');
  };

  const handleStartPdm = async (taskId) => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/pdm-schedule/occurrences/' + taskId + '/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setIsNotifOpen(false);
        navigate('/pdm/tasks');
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal memulai task');
      }
    } catch (e) {
      console.error(e);
      alert('Koneksi bermasalah');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-navy/10 text-navy border-navy/20';
      case 'vp': return 'bg-accent/10 text-accent border-accent/20';
      case 'avp': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-navy/10 text-navy border-navy/20';
    }
  };

  return (
    <header className="h-[60px] bg-white border-b border-platinum-dark px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 print:hidden shadow-sm">
      <div className="flex items-center">
        {/* Hamburger menu for mobile */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="lg:hidden p-2 text-ink hover:bg-slate-100 rounded-md transition-colors mr-2"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Optional: Page Title could go here */}
      </div>
      <div className="flex items-center">
        {/* Right: Actions */}
        <div className="flex items-center space-x-4 relative justify-end flex-1">
          <button className="p-2.5 bg-platinum border border-platinum-dark text-ink hover:bg-platinum-dark/20 rounded-full transition-colors hidden sm:block">
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2.5 bg-platinum border border-platinum-dark text-ink hover:bg-platinum-dark/20 rounded-full transition-colors relative"
            title="Notifikasi Sistem"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-danger text-white text-[8px] font-bold rounded-full border border-white flex items-center justify-center animate-pulse">
              </span>
            )}
          </button>

          {/* NOTIFICATION POPUP DRAWER */}
          {isNotifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-[#FF5722]" />
                  <span className="text-xs font-bold text-[#0F172A]">Notifikasi Sistem</span>
                </div>
                <span className="text-[10px] font-bold bg-[#FF5722]/10 text-[#FF5722] px-2 py-0.5 rounded-full">{unreadCount} Baru</span>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-2.5 bg-[#F8FAFC] border border-slate-100 rounded-xl hover:bg-slate-100/80 transition-colors ${n.type === 'warning' ? 'border-l-4 border-l-red-500' : ''} ${n.type === 'info' ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#0F172A]">{n.title}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                    {n.action === 'start-pdm' && n.taskId && (
                      <button 
                        onClick={() => handleStartPdm(n.taskId)}
                        className="mt-2 w-full text-center py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[10px] font-bold transition-colors"
                      >
                        {n.actionLabel || 'Mulai Eksekusi'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Sistem Berjalan Normal</span>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[10px] font-bold text-[#FF5722] hover:underline"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-3 ml-2 border-l border-platinum-dark">
            {user ? (
              <div className="flex items-center gap-2 relative group cursor-pointer ml-2">
                <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-[11px] font-extrabold uppercase shadow-sm">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                {/* Minimal dropdown on hover for auth actions */}
                <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-xl shadow-soft border border-platinum-dark opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                  <div className="p-3 border-b border-platinum-dark bg-platinum/30">
                    <p className="text-xs font-bold text-ink truncate">{user.name}</p>
                    <p className="text-[10px] text-platinum-dark truncate">{user.role}</p>
                  </div>
                  <button onClick={() => setShowPasswordModal(true)} className="w-full text-left px-4 py-2 text-xs font-bold text-ink hover:bg-slate-50 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Ganti Password
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs font-bold text-danger hover:bg-red-50 flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="group relative flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-full overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg bg-navy"
              >
                <User className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL GANTI PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Ganti Password
              </h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-medium">×</button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              {passwordError && (
                <div className="p-2 bg-red-50 text-red-600 text-[11px] rounded-lg border border-red-100 font-medium">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-2 bg-emerald-50 text-emerald-600 text-[11px] rounded-lg border border-emerald-100 font-medium">
                  {passwordSuccess}
                </div>
              )}
              
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Password Lama</label>
                <input 
                  type="password" required
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Password Baru</label>
                <input 
                  type="password" required
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" disabled={passwordLoading}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
