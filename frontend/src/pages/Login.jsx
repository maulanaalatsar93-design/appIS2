import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, Cpu, Activity, BarChart2, User } from 'lucide-react';
import logoImg from '../assets/logo.png';
import brandIconImg from '../assets/brand-icon.png';
import { playSubmitSound, playSuccessSound, playErrorSound } from '../utils/soundUtils';

export default function Login() {
  const [npk, setNpk] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    playSubmitSound();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npk, password }),
      });
      const data = await response.json();
      if (response.ok) {
        playSuccessSound();
        login(data.token, data.user);
        navigate('/');
      } else {
        playErrorSound();
        setError(data.message || 'Login gagal. Periksa NPK & password Anda.');
      }
    } catch (err) {
      playErrorSound();
      setError('Koneksi gagal. Coba lagi beberapa saat.');
    } finally {
      setLoading(false);
    }
  };

  const fillAccount = (npkVal, passVal) => {
    setNpk(npkVal);
    setPassword(passVal);
  };

  return (
    <div className="min-h-screen flex bg-[#050D1F] font-sans overflow-hidden">

      {/* === LEFT: Animated Branding Panel === */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-14 overflow-hidden">
        {/* Deep background radial glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1A4A] via-[#071228] to-[#050D1F]" />

        {/* Glowing orbs */}
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#1A4BC4]/20 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-[#D9650F]/15 blur-[80px] pointer-events-none" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-[#2563EB]/10 blur-[60px] pointer-events-none" />

        {/* Grid lines overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Brand header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/10 border border-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
            <img
              src={logoImg}
              alt="Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = brandIconImg; }}
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">ISTEK 2 Dashboard</p>
            <p className="text-slate-400 text-[10px] font-medium">Sistem Monitoring</p>
          </div>
        </div>

        {/* Main hero text */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold tracking-wider uppercase">Sistem Online</span>
          </div>

          <h1 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
            Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A9EFF] to-[#A78BFA]">Monitoring</span><br />
            Inspeksi Teknik 2
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Monitoring Work Order, Rekomendasi SAP, dan Manpower dari satu dasbor.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { icon: BarChart2, label: 'Analisis' },
              { icon: Activity, label: 'Monitoring' },
              { icon: Cpu, label: 'Data SAP' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <Icon className="w-3 h-3 text-blue-400" />
                <span className="text-slate-300 text-[11px] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Abstract dashboard mockup */}
        <div className="relative z-10 w-full">
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 shadow-2xl">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400/60" />
                <div className="w-2 h-2 rounded-full bg-amber-400/60" />
                <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
              </div>
              <div className="h-2 w-24 bg-white/10 rounded-full" />
            </div>
            {/* KPI cards row */}
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              {['Work Order', 'Rekomendasi', 'Man Power'].map((label, i) => (
                <div key={label} className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <div className="h-1.5 w-8 bg-blue-400/40 rounded mb-2" />
                  <div className="h-5 w-12 bg-white/30 rounded font-bold" />
                  <div className="h-1.5 w-10 bg-white/10 rounded mt-1.5" />
                </div>
              ))}
            </div>
            {/* Chart area */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-end gap-1.5 h-16">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 88].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-blue-500/60 to-blue-400/20"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === RIGHT: Login Form Panel === */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 md:px-16 relative bg-white">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1A4BC4] via-[#4A9EFF] to-[#D9650F]" />

        <div className="w-full max-w-sm mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
              <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src = brandIconImg; }} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Departemen Inspeksi Teknik 2</p>
              <p className="text-slate-500 text-[10px]">Sistem Keandalan Operasional</p>
            </div>
          </div>

          {/* Header text */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-4">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span className="text-blue-700 text-[10px] font-bold uppercase tracking-wider">Akses Departemen ISTEK 2</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Masuk ke Akun Anda</h2>
            <p className="text-slate-500 text-sm">Gunakan NPK & password yang terdaftar di sistem.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              <div className="w-4 h-4 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 font-black text-[9px]">!</span>
              </div>
              <span className="font-medium leading-tight">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">NPK</label>
              <div className={`relative flex items-center rounded-xl border-2 transition-all duration-200 bg-white ${focusedField === 'npk' ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="pl-4 shrink-0">
                  <User className={`w-4 h-4 transition-colors ${focusedField === 'npk' ? 'text-blue-500' : 'text-slate-400'}`} />
                </div>
                <input
                  type="text"
                  required
                  value={npk}
                  onChange={(e) => setNpk(e.target.value)}
                  onFocus={() => setFocusedField('npk')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-3 pr-4 py-3 bg-transparent text-slate-900 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
                  placeholder="Masukkan NPK Anda"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className={`relative flex items-center rounded-xl border-2 transition-all duration-200 bg-white ${focusedField === 'password' ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="pl-4 shrink-0">
                  <Lock className={`w-4 h-4 transition-colors ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-400'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-3 pr-3 py-3 bg-transparent text-slate-900 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-4 shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <button 
                  type="button" 
                  onClick={() => alert('Untuk mereset password Anda, silakan hubungi Administrator (Maulana Cipta P).')}
                  className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                >
                  Lupa Password?
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 relative overflow-hidden flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-bold text-white transition-all duration-300 bg-gradient-to-r from-[#0F2052] via-[#1A4BC4] to-[#2563EB] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Quick Access</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Quick login cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { role: 'Administrator', npk: 'admin1', pass: 'password123', color: 'from-[#0F2052] to-[#1A3580]', textColor: 'text-white', badgeColor: 'bg-white/20 text-white' },
              { role: 'Vice President', npk: 'vp1', pass: 'password123', color: 'from-[#D9650F] to-[#E07820]', textColor: 'text-white', badgeColor: 'bg-white/20 text-white' },
            ].map(({ role, npk: e, pass, color, textColor, badgeColor }) => (
              <button
                key={role}
                type="button"
                onClick={() => fillAccount(e, pass)}
                className={`group relative bg-gradient-to-br ${color} rounded-xl p-3.5 text-left hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10" />
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${badgeColor} inline-flex rounded-full px-1.5 py-0.5`}>{role}</div>
                <p className={`text-[10px] ${textColor} opacity-70 truncate mt-1`}>NPK: {e}</p>
                <p className={`text-[10px] ${textColor} opacity-50`}>Pass: {pass}</p>
              </button>
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-[10px] text-slate-400">
            Hanya untuk pengguna yang berwenang di departemen ISTEK 2.<br />
            <span className="text-slate-500 font-medium">PT Pupuk Kujang Cikampek</span>
          </p>

          {/* Guest access */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-slate-200 hover:border-[#1A4BC4] text-slate-500 hover:text-[#1A4BC4] text-xs font-semibold transition-all duration-200 hover:bg-blue-50 group"
            >
              <span>Lihat Dashboard Publik tanpa login</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
