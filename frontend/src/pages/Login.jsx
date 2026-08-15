import React, { useState, useContext } from 'react';
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
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* === LEFT: Animated Branding Panel === */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden bg-navy-950">
        
        {/* Subtle gauge-ring decorative motif */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
          <svg viewBox="0 0 800 800" className="w-[120%] h-[120%] stroke-gray-500 fill-none" strokeWidth="1">
            <circle cx="400" cy="400" r="300" strokeDasharray="10 20" />
            <circle cx="400" cy="400" r="250" opacity="0.5" />
            <circle cx="400" cy="400" r="200" strokeDasharray="4 8" opacity="0.3" />
            <path d="M400 100 L400 120 M400 680 L400 700 M100 400 L120 400 M680 400 L700 400" strokeWidth="2" opacity="0.8" />
            <path d="M187 187 L202 202 M613 613 L598 598 M187 613 L202 598 M613 187 L598 202" strokeWidth="2" opacity="0.5" />
          </svg>
        </div>

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white flex items-center justify-center rounded-xl shadow-sm">
            <img
              src={logoImg}
              alt="Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = brandIconImg; }}
            />
          </div>
          <div>
            <p className="text-white font-display font-bold text-lg tracking-tight">KENDALIKAN</p>
            <p className="text-gray-400 text-xs font-medium tracking-widest uppercase">Industrial Dashboard</p>
          </div>
        </div>

        {/* Middle: Text */}
        <div className="relative z-10 space-y-6 max-w-md mt-[-80px]">
          <h1 className="text-[44px] font-display font-extrabold text-white leading-[1.15] tracking-tight">
            Kendalikan jadwal PdM & manpower dari satu tempat.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed font-body">
            Optimization, efficiency, and real-time insights for PdM schedules and workforce management.
          </p>
        </div>

        {/* Bottom: Footer */}
        <div className="relative z-10">
          <p className="text-gray-500 text-sm font-medium">
            © 2024 PT. Pupuk Kalimantan Timur. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* === RIGHT: Login Form Panel === */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 relative bg-white">
        <div className="w-full max-w-[420px] mx-auto">
          
          {/* Mobile logo */}
          <div className="flex items-center gap-4 mb-10 lg:hidden">
            <div className="w-12 h-12 bg-white shadow-sm border border-gray-200 flex items-center justify-center rounded-xl">
              <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src = brandIconImg; }} />
            </div>
            <div>
              <p className="text-ink font-display font-bold text-lg tracking-tight">KENDALIKAN</p>
              <p className="text-gray-500 text-xs font-medium tracking-widest uppercase">Industrial Dashboard</p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-display font-extrabold text-ink tracking-tight mb-3">Selamat Datang</h2>
            <p className="text-gray-500 text-base font-body">Masuk ke dashboard Anda untuk melanjutkan.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-danger text-sm">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-danger font-bold text-xs">!</span>
              </div>
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">NPK</label>
              <div className={`relative flex items-center rounded-lg border-2 transition-all duration-200 bg-white ${focusedField === 'npk' ? 'border-navy-600 shadow-[0_0_0_3px_rgba(24,70,139,0.1)]' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="pl-4 shrink-0">
                  <User className={`w-5 h-5 transition-colors ${focusedField === 'npk' ? 'text-navy-600' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  required
                  value={npk}
                  onChange={(e) => setNpk(e.target.value)}
                  onFocus={() => setFocusedField('npk')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-3 pr-4 py-3.5 bg-transparent text-ink text-base focus:outline-none placeholder:text-gray-400 font-medium"
                  placeholder="Masukkan NPK Anda"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Password</label>
              <div className={`relative flex items-center rounded-lg border-2 transition-all duration-200 bg-white ${focusedField === 'password' ? 'border-navy-600 shadow-[0_0_0_3px_rgba(24,70,139,0.1)]' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="pl-4 shrink-0">
                  <Lock className={`w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-navy-600' : 'text-gray-400'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-3 pr-3 py-3.5 bg-transparent text-ink text-base focus:outline-none placeholder:text-gray-400 font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-4 shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-4 h-4 rounded border-2 border-gray-300 group-hover:border-navy-600 flex items-center justify-center transition-colors">
                  <div className="w-2 h-2 rounded-sm bg-transparent group-active:bg-navy-600" />
                </div>
                <span className="text-sm font-medium text-ink">Ingat saya</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Untuk mereset password Anda, silakan hubungi Administrator (Maulana Cipta P).')}
                className="text-sm text-navy-600 font-semibold hover:text-navy-950 transition-colors"
              >
                Lupa PW?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg text-base font-bold text-white transition-all duration-300 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
