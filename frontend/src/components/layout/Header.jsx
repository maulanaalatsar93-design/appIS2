import React, { useState, useEffect, useContext } from 'react';
import { Bell, Database, Server, LogOut, User, Menu, Lock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { playSubmitSound, playSuccessSound, playErrorSound } from '../../utils/soundUtils';

export default function Header({ isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }) {
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
      case 'admin': return 'bg-industrial-navy/10 text-industrial-navy border-industrial-navy/20';
      case 'vp': return 'bg-industrial-orange/10 text-industrial-orange border-industrial-orange/20';
      case 'avp': return 'bg-industrial-amber/10 text-industrial-amber border-industrial-amber/20';
      default: return 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20';
    }
  };

  return (
    <header className="h-[72px] bg-gray-50/80 backdrop-blur-xl px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 border-b border-gray-200/60 print:hidden">

      {/* Left side: Breadcrumb & Mobile toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -ml-2 text-gray-400 hover:text-ink hover:bg-gray-200 rounded-xl transition-colors md:hidden pointer-events-auto"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center text-sm font-medium text-gray-500">
          <span className="hover:text-navy-600 cursor-pointer transition-colors">Home</span>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-ink font-bold capitalize">
            {location.pathname === '/' ? 'Overview' : location.pathname.split('/').pop().replace(/-/g, ' ')}
          </span>
        </div>
      </div>


      {/* Right side: Actions & User */}
      <div className="flex items-center gap-3 md:gap-4 relative">
        <button
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className="p-2 text-gray-400 hover:text-navy-600 hover:bg-white border border-transparent hover:border-gray-200 shadow-sm hover:shadow rounded-full transition-all relative"
          title="Notifikasi Sistem"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-orange-500 text-white text-[8px] font-bold rounded-full border border-white flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* NOTIFICATION POPUP DRAWER */}
        {isNotifOpen && (
          <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-orange-500" />
                <span className="text-xs font-bold text-ink">Notifikasi Sistem</span>
              </div>
              <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{unreadCount} Baru</span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors ${n.type === 'warning' ? 'border-l-4 border-l-red-500' : ''} ${n.type === 'info' ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-ink">{n.title}</span>
                    <span className="text-[9px] text-gray-500 font-medium">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">{n.desc}</p>
                  {n.action === 'start-pdm' && n.taskId && (
                    <button
                      onClick={() => handleStartPdm(n.taskId)}
                      className="mt-2 w-full text-center py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                    >
                      {n.actionLabel || 'Mulai Eksekusi'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-medium">Sistem Berjalan Normal</span>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="text-[10px] font-bold text-orange-500 hover:text-orange-600"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-gray-200">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-ink leading-tight capitalize">{user.name}</p>
                <p className="text-[9px] text-gray-400 font-medium leading-tight">NPK: {user.npk} &bull; {user.role}</p>
              </div>
              <div className="relative group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-navy-50 text-navy-600 border border-navy-100 flex items-center justify-center text-xs font-extrabold shadow-sm transition-transform group-hover:scale-105">
                  <User className="w-4 h-4" />
                </div>

                {/* Dropdown User Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-right">
                  <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-bold text-ink">{user.name}</p>
                    <p className="text-[10px] text-gray-500">{user.role}</p>
                  </div>
                  <div className="p-1">
                    <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-navy-600 rounded-lg transition-colors">
                      <Lock className="w-3.5 h-3.5" /> Ganti Password
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="group relative flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg bg-orange-500 hover:bg-orange-600"
            >
              <User className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Login</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL GANTI PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                <Lock className="w-4 h-4 text-navy-600" />
                Ganti Password
              </h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-ink text-lg font-display font-medium">×</button>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              {passwordError && (
                <div className="p-2.5 bg-red-50 text-red-600 text-[11px] rounded-xl border border-red-100 font-medium">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-600 text-[11px] rounded-xl border border-emerald-100 font-medium">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Password Lama</label>
                <input
                  type="password" required
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-navy-600 bg-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Password Baru</label>
                <input
                  type="password" required
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-navy-600 bg-white"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit" disabled={passwordLoading}
                  className="w-full py-3 bg-navy-600 text-white rounded-xl text-xs font-bold hover:bg-navy-950 transition-colors disabled:opacity-50 shadow-sm"
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
}
