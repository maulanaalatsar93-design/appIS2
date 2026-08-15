import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import logoImg from '../assets/logo.png';
import brandIconImg from '../assets/brand-icon.png';
import { playSubmitSound, playSuccessSound, playErrorSound, playSiuuuSound } from '../utils/soundUtils';

export default function Login() {
  const [npk, setNpk] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* Top right view toggle */}
      <div className="fixed top-4 right-4 z-50 flex bg-navy rounded-full p-1 gap-1 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <button className="bg-accent text-ink font-sans text-[12px] font-semibold px-4 py-2 rounded-full cursor-default tracking-[0.02em] transition-all">Login Page</button>
        <button onClick={() => navigate('/')} className="bg-transparent text-platinum-dark hover:text-white font-sans text-[12px] font-semibold px-4 py-2 rounded-full transition-colors tracking-[0.02em]">Dashboard</button>
      </div>

      {/* === LEFT: Animated Branding Panel === */}
      <div className="hidden lg:flex flex-[0_0_44%] bg-navy relative flex-col justify-between p-14 text-white overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-16 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 700">
          <polyline points="-20,420 60,420 90,300 120,520 150,380 180,420 500,420" fill="none" stroke="#FCA311" strokeWidth="2" opacity="0.8" />
          <polyline points="-20,440 70,440 100,280 130,550 160,390 190,440 500,440" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.3" />
        </svg>
        
        <div className="relative z-10 flex items-center gap-3.5">
          <img src={logoImg} alt="ISTEK" className="w-[46px] h-[46px] rounded-[10px] bg-white p-1" onError={(e) => { e.target.onerror = null; e.target.src = brandIconImg; }} />
          <div>
            <div className="text-[20px] font-extrabold tracking-[0.02em]">ISTEK</div>
            <div className="text-[11px] text-platinum-dark tracking-[0.08em] uppercase mt-0.5">Inspeksi Teknik</div>
          </div>
        </div>

        <div className="relative z-10 max-w-[420px]">
          <h1 className="text-[34px] leading-[1.22] font-extrabold">
            Satu sistem untuk <span className="text-accent">Work Order</span>, Rekomendasi &amp; Kehadiran.
          </h1>
          <p className="mt-3.5 text-platinum-dark text-[14.5px] leading-[1.6]">
            Pantau seluruh aktivitas inspeksi teknik di 7 pabrik secara real-time — dari pengajuan Work Order hingga tindak lanjut rekomendasi lapangan.
          </p>
        </div>

        <div className="relative z-10 text-[11.5px] text-platinum-dark flex justify-between border-t border-white/10 pt-4">
          <span>PT Pupuk Kalimantan Timur</span>
          <span>Divisi Inspeksi Teknik</span>
        </div>
      </div>

      {/* === RIGHT: Login Form Panel === */}
      <div className="flex-1 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-[380px]">
          
          {/* Mobile branding fallback (only shown on small screens) */}
          <div className="flex lg:hidden items-center gap-3.5 mb-10">
            <img src={logoImg} alt="ISTEK" className="w-[46px] h-[46px] rounded-[10px] bg-white p-1 border border-platinum-dark shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src = brandIconImg; }} />
            <div>
              <div className="text-[20px] font-extrabold tracking-[0.02em] text-navy">ISTEK</div>
              <div className="text-[11px] text-slate-500 tracking-[0.08em] uppercase mt-0.5">Inspeksi Teknik</div>
            </div>
          </div>

          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-accent">Selamat datang kembali</div>
          <h2 className="text-[26px] font-extrabold mt-2 text-ink">Masuk ke akun Anda</h2>
          <div className="text-slate-500 text-[13.5px] mt-2 mb-8">
            Gunakan NPK dan kata sandi yang terdaftar untuk mengakses dashboard.
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              <span className="font-medium leading-tight">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-[18px]">
              <label className="block text-[12px] font-semibold text-navy mb-1.5">NPK / Username</label>
              <input
                type="text"
                required
                value={npk}
                onChange={(e) => setNpk(e.target.value)}
                placeholder="Contoh: 8812345"
                className="w-full px-[14px] py-3 border-[1.5px] border-platinum-dark rounded-[10px] text-ink text-[14px] bg-white transition-all duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_rgba(20,19,29,0.08)]"
              />
            </div>
            
            <div className="mb-[18px]">
              <label className="block text-[12px] font-semibold text-navy mb-1.5">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-[14px] pr-10 py-3 border-[1.5px] border-platinum-dark rounded-[10px] text-ink text-[14px] bg-white transition-all duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_rgba(20,19,29,0.08)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 text-[12.5px]">
              <label className="flex items-center gap-[7px] text-slate-500 cursor-pointer">
                <input type="checkbox" className="rounded-[4px] border-platinum-dark text-navy focus:ring-navy" />
                Ingat saya
              </label>
              <button 
                type="button" 
                onClick={() => alert('Untuk mereset password Anda, silakan hubungi Administrator (Maulana Cipta P).')}
                className="text-navy font-semibold hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-[13px] bg-navy text-white rounded-[10px] font-bold text-[14px] transition-colors duration-150 hover:bg-navy-soft tracking-[0.01em] disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
            
            <div className="mt-7 text-[12px] text-slate-500 text-center">
              Kendala akses? Hubungi admin sistem di ext. 2140
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


