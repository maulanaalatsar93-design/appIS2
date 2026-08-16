import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, Cpu, Activity, BarChart2, User } from 'lucide-react';
import logoImg from '../assets/logo.png';
import brandIconImg from '../assets/brand-icon.png';
import { playSubmitSound, playSuccessSound, playErrorSound, playSiuuuSound } from '../utils/soundUtils';

export default function Login() {
  const [npk, setNpk] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedNpk = localStorage.getItem('istek_saved_npk');
    const savedPassword = localStorage.getItem('istek_saved_password');
    if (savedNpk && savedPassword) {
      setNpk(savedNpk);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    playSubmitSound();
    setError('');
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npk, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.user?.npk === 'K257612' || data.user?.npk?.toUpperCase() === 'K257612') {
          playSiuuuSound();
        } else {
          playSuccessSound();
        }
        
        if (rememberMe) {
          localStorage.setItem('istek_saved_npk', npk);
          localStorage.setItem('istek_saved_password', password);
        } else {
          localStorage.removeItem('istek_saved_npk');
          localStorage.removeItem('istek_saved_password');
        }

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
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FB] font-sans p-4 sm:p-6 lg:p-8 overflow-hidden relative">

      {/* Background ambient glows for the whole page */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-navy-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container - Floating Card */}
      <div className="w-full max-w-[1400px] h-[85vh] min-h-[700px] max-h-[900px] flex rounded-[32px] overflow-hidden shadow-[0_24px_80px_-12px_rgba(11,13,18,0.15)] bg-white relative z-10 border border-white ring-1 ring-gray-200/50">

        {/* === LEFT: Premium Branding Panel === */}
        <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16 xl:p-20 overflow-hidden">

          {/* Deep elegant background */}
          <div className="absolute inset-0 bg-[#070F22]" />
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-[#0A1530] to-[#040812]" />

          {/* Animated/Glowing Orbs */}
          <div className="absolute top-[-10%] left-[10%] w-[60%] h-[60%] bg-[#2563EB]/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#EA853C]/15 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
          <div className="absolute top-[40%] left-[-10%] w-[40%] h-[40%] bg-[#4F46E5]/15 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }}
          />

          {/* Top: Logo */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center rounded-2xl shadow-2xl ring-1 ring-white/20">
              <img
                src={logoImg}
                alt="Logo"
                className="w-8 h-8 object-contain drop-shadow-lg"
                onError={(e) => { e.target.onerror = null; e.target.src = brandIconImg; }}
              />
            </div>
            <div>
              <p className="text-white font-display font-extrabold text-xl tracking-tight">ISTEK2</p>
              <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase mt-0.5">Inspeksi Teknik 2 Dashboard</p>
            </div>
          </div>

          {/* Middle: Text & Glassmorphism Card */}
          <div className="relative z-10 flex flex-col gap-12 mt-[-40px]">
            <div className="space-y-6 max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                <span className="text-emerald-300 text-[11px] font-bold tracking-widest uppercase">Sistem Online</span>
              </div>
              <h1 className="text-[52px] font-display font-extrabold text-white leading-[1.1] tracking-tight">
                Monitoring Dashboard <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#A78BFA] to-[#FCA5A5]">
                  Inspeksi Teknik 2.
                </span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed font-body max-w-md">
                Platform terpadu untuk monitoring jadwal PdM, eksekusi Work Order, dan manajemen Man Power.
              </p>
            </div>

            {/* Premium Glassmorphic Stats Card */}
            <div className="w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-lg rounded-[24px] p-6 shadow-2xl ring-1 ring-white/5 group hover:bg-white/10 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm tracking-wide">Target Orders</div>
                    <div className="text-gray-400 text-xs font-medium">Progress status</div>
                  </div>
                </div>
                <div className="text-orange-400 font-extrabold text-xl font-display">99.8%</div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-400 w-[99.8%] rounded-full shadow-[0_0_10px_rgba(234,133,60,0.5)]" />
              </div>
            </div>
          </div>

          {/* Bottom: Footer */}
          <div className="relative z-10 flex items-center justify-between">
            <p className="text-gray-500 text-sm font-medium">
              PT. Pupuk Kalimantan Timur
            </p>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="w-2 h-2 rounded-full bg-white/60" />
            </div>
          </div>
        </div>

        {/* === RIGHT: Premium Form Panel === */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center relative bg-white px-8 sm:px-16 xl:px-24">
          
          {/* Top Right Public Dashboard Toggle */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center bg-navy-600 p-1.5 rounded-full shadow-lg border border-navy-600/50 z-50">
            <div className="px-5 py-2 bg-[#FF7410] text-white text-sm font-bold rounded-full shadow-sm cursor-default">
              Login Page
            </div>
            <button 
              type="button"
              onClick={() => navigate('/public')}
              className="px-5 py-2 text-white/70 hover:text-white text-sm font-bold rounded-full transition-colors"
            >
              Dashboard
            </button>
          </div>

          <div className="w-full max-w-[420px] mx-auto">
            {/* Mobile logo */}
            <div className="flex items-center gap-4 mb-10 lg:hidden">
              <div className="w-12 h-12 bg-white shadow-md border border-gray-100 flex items-center justify-center rounded-2xl">
                <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = brandIconImg; }} />
              </div>
              <div>
                <p className="text-ink font-display font-extrabold text-xl tracking-tight">KENDALIKAN</p>
                <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase mt-0.5">Industrial Dashboard</p>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-4xl font-display font-extrabold text-ink tracking-tight mb-3">Selamat Datang</h2>
              <p className="text-gray-500 text-base font-body">Masuk ke dashboard Anda untuk melanjutkan.</p>
            </div>

            {error && (
              <div className="mb-8 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100/50 text-danger text-sm shadow-sm">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <span className="text-danger font-bold text-xs">!</span>
                </div>
                <span className="font-semibold leading-relaxed pt-0.5">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <label className="block text-sm font-bold text-ink">NPK Karyawan</label>
                <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-300 bg-[#F8FAFC] ${focusedField === 'npk' ? 'border-navy-600 bg-white shadow-[0_4px_20px_-4px_rgba(24,70,139,0.15)] ring-4 ring-navy-600/10' : 'border-gray-100 hover:border-gray-300 hover:bg-white'}`}>
                  <div className="pl-5 shrink-0">
                    <User className={`w-5 h-5 transition-colors ${focusedField === 'npk' ? 'text-navy-600' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    required
                    value={npk}
                    onChange={(e) => setNpk(e.target.value)}
                    onFocus={() => setFocusedField('npk')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-3 pr-5 py-4 bg-transparent text-ink text-base focus:outline-none placeholder:text-gray-400 font-semibold"
                    placeholder="Masukkan NPK Anda"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="block text-sm font-bold text-ink">Kata Sandi</label>
                <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-300 bg-[#F8FAFC] ${focusedField === 'password' ? 'border-navy-600 bg-white shadow-[0_4px_20px_-4px_rgba(24,70,139,0.15)] ring-4 ring-navy-600/10' : 'border-gray-100 hover:border-gray-300 hover:bg-white'}`}>
                  <div className="pl-5 shrink-0">
                    <Lock className={`w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-navy-600' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-3 pr-3 py-4 bg-transparent text-ink text-base focus:outline-none placeholder:text-gray-400 font-semibold"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-5 shrink-0 text-gray-400 hover:text-navy-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${rememberMe ? 'bg-navy-600 border-navy-600' : 'bg-white border-gray-300 group-hover:border-navy-600'}`}>
                      {rememberMe && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-ink transition-colors">Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Untuk mereset password Anda, silakan hubungi Administrator (Maulana Cipta P).')}
                  className="text-sm text-navy-600 font-bold hover:text-navy-950 transition-colors"
                >
                  Lupa Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 relative overflow-hidden flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-base font-bold text-white transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(234,133,60,0.5)] hover:shadow-[0_12px_24px_-6px_rgba(234,133,60,0.6)] group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                    <span className="relative z-10">Memproses...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Masuk Sekarang</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
