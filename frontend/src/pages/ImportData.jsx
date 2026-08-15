import React, { useRef, useContext, useState, useEffect } from 'react';
import {
  UploadCloud, CheckCircle2, XCircle, Loader2, FileText, Trash2,
  FileSpreadsheet, Database, TrendingUp,
  AlertTriangle, Zap, BarChart3, Eye, Shield, Clock, HardDrive,
  Plus, RotateCcw, ChevronRight
} from 'lucide-react';
import { UploadContext } from '../context/UploadContext';
import WorkOrderList from './WorkOrderList';
import RekomendasiList from './RekomendasiList';

// Animated number counter
function AnimatedCounter({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

// Mini SVG donut chart
function DonutMini({ inserted = 0, updated = 0, failed = 0 }) {
  const total = inserted + updated + failed;
  if (total === 0) return null;
  const size = 72;
  const r = 28;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const iPct = inserted / total;
  const uPct = updated / total;
  const fPct = failed / total;
  const iDash = C * iPct;
  const uDash = C * uPct;
  const fDash = C * fPct;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
      {inserted > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10b981" strokeWidth="10"
          strokeDasharray={`${iDash} ${C}`} strokeDashoffset={0} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
      )}
      {updated > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth="10"
          strokeDasharray={`${uDash} ${C}`} strokeDashoffset={-(C * iPct)} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
      )}
      {failed > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="10"
          strokeDasharray={`${fDash} ${C}`} strokeDashoffset={-(C * (iPct + uPct))} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
      )}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="#1e293b">
        {total.toLocaleString()}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#64748b">TOTAL</text>
    </svg>
  );
}

function SuccessReview({ result, activeTab, resetUpload, setViewMode }) {
  const inserted = result?.inserted || 0;
  const updated = result?.updated || 0;
  const skipped = result?.skipped || 0;
  const failed = result?.failed || 0;
  const total = inserted + updated + skipped + failed;
  const successRate = total > 0 ? Math.round(((inserted + updated) / total) * 100) : 0;
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const cards = [
    { label: 'Data Baru', value: inserted, icon: <Plus className="w-5 h-5" />, bg: 'from-emerald-500 to-teal-600', badge: 'INSERTED', badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', delay: 0 },
    { label: 'Diperbarui', value: updated, icon: <RotateCcw className="w-5 h-5" />, bg: 'from-blue-500 to-indigo-600', badge: 'UPDATED', badgeClass: 'text-blue-700 bg-blue-50 border-navy-soft', delay: 80 },
    { label: 'Baris Kosong', value: skipped, icon: <Eye className="w-5 h-5" />, bg: 'from-slate-400 to-slate-500', badge: 'SKIPPED', badgeClass: 'text-slate-500 bg-platinum border-platinum-dark', delay: 160 },
    { label: 'Format Gagal', value: failed, icon: <AlertTriangle className="w-5 h-5" />, bg: 'from-amber-500 to-orange-500', badge: 'FAILED', badgeClass: 'text-amber-700 bg-amber-50 border-amber-200', delay: 240 },
  ];

  return (
    <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

      {/* ─── SUCCESS BANNER ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-6 md:p-8 mb-6 shadow-lg">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-4 right-32 w-8 h-8 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="w-16 h-16 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                <Zap className="w-3 h-3" /> Import Selesai
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {activeTab === 'workorders' ? 'Work Order' : 'Rekomendasi'} Berhasil Diperbarui
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Database berhasil disinkronkan dengan data SAP terbaru. Semua perubahan tersimpan permanen.
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <DonutMini inserted={inserted} updated={updated} failed={failed} />
            <div className="text-center">
              <div className="text-2xl font-extrabold text-white">{successRate}%</div>
              <div className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Success Rate</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-5">
          <div className="flex justify-between text-[10px] text-white/60 font-semibold mb-1 uppercase tracking-wider">
            <span>Tingkat Keberhasilan Import</span>
            <span>{successRate}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: visible ? `${successRate}%` : '0%' }} />
          </div>
        </div>
      </div>

      {/* ─── 4 STAT CARDS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.badge}
            className={`relative overflow-hidden rounded-xl border border-platinum-dark bg-white shadow-sm transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${150 + card.delay}ms` }}
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.bg}`} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.bg} flex items-center justify-center text-white shadow-sm`}>
                  {card.icon}
                </div>
                <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full border ${card.badgeClass}`}>
                  {card.badge}
                </span>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-none mb-1">
                <AnimatedCounter value={card.value} duration={900 + card.delay} />
              </div>
              <div className="text-xs text-slate-500 font-medium">{card.label}</div>
              <div className="mt-3 h-1.5 bg-platinum-dark rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${card.bg} transition-all duration-1000 ease-out`}
                  style={{ width: visible && total > 0 ? `${(card.value / total) * 100}%` : '0%', transitionDelay: `${300 + card.delay}ms` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                {total > 0 ? ((card.value / total) * 100).toFixed(1) : 0}% dari total
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── DETAIL PANELS ─── */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-platinum-dark rounded-card p-5 shadow-sm-subtle">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-ink">Rincian Proses Import</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Data Baru Ditambahkan', value: inserted, color: 'bg-emerald-500' },
              { label: 'Data Diperbarui (Upsert)', value: updated, color: 'bg-blue-500' },
              { label: 'Baris Kosong Dilewati', value: skipped, color: 'bg-slate-300' },
              { label: 'Format Invalid (Gagal)', value: failed, color: 'bg-amber-400' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{item.label}</span>
                  <span className="font-bold text-ink tabular-nums">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-platinum-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: visible && total > 0 ? `${(item.value / total) * 100}%` : '0%', transitionDelay: '400ms' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-50 border border-navy-soft rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center flex-shrink-0">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-900 mb-0.5">Database Tersinkronisasi</div>
              <div className="text-xs text-blue-700">
                Semua data SAP telah berhasil direkonsiliasi menggunakan metode <span className="font-mono font-bold">UPSERT</span> berdasarkan Composite Key (Order + Activity).
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 mb-0.5">Integritas Data Terjaga</div>
              <div className="text-xs text-emerald-700">
                Tidak ada data duplikat. Sistem memvalidasi setiap baris berdasarkan kunci komposit unik.
              </div>
            </div>
          </div>
          <div className="bg-platinum border border-platinum-dark rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 mb-0.5">Siap Digunakan</div>
              <div className="text-xs text-slate-600">
                Dashboard akan otomatis menampilkan data terbaru saat Anda navigasi ke halaman utama.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CTA BUTTONS ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => setViewMode(activeTab === 'workorders' ? 'workorders' : 'recommendations')}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-sm font-bold rounded-xl hover:from-blue-800 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          Lihat Data Terupload
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={resetUpload}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-platinum transition-all shadow-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Upload File Lain
        </button>
      </div>
    </div>
  );
}

function ErrorReview({ result, resetUpload }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {/* Error banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 p-6 md:p-8 mb-6 shadow-lg">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="w-16 h-16 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <XCircle className="w-9 h-9 text-white" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest mb-2 block">
              <AlertTriangle className="w-3 h-3 inline mr-1" />Import Gagal
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Proses Import Tidak Berhasil</h2>
            <p className="text-white/70 text-sm mt-1">Sistem mendeteksi error. Tidak ada perubahan yang disimpan ke database.</p>
          </div>
        </div>
      </div>

      {/* Error detail */}
      <div className="bg-white border border-red-200 rounded-xl p-5 mb-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <HardDrive className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-red-900 mb-1">Detail Error</div>
            <div className="text-sm text-red-700 font-mono bg-red-50 border border-red-200 rounded-lg p-3 leading-relaxed break-all">
              {result?.error || 'Terjadi kesalahan sistem yang tidak diketahui saat memproses file.'}
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> Kemungkinan Penyebab
        </div>
        <ul className="space-y-1 text-xs text-amber-800">
          {['Format file tidak sesuai (pastikan .csv / .xlsx dari ekstrak SAP)', 'Kolom wajib tidak ditemukan (Order, Operation/Activity, Status)', 'File kosong atau rusak', 'Koneksi terputus saat proses upload'].map(tip => (
            <li key={tip} className="flex items-start gap-1.5">
              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" /> {tip}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={resetUpload}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-sm font-bold rounded-xl hover:from-blue-800 hover:to-indigo-800 transition-all shadow-md cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        Coba Upload Lagi
      </button>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ImportData() {
  const {
    activeTab, setActiveTab,
    file, setFile,
    status, uploadProgress,
    result, startUpload, resetUpload
  } = useContext(UploadContext);

  const [viewMode, setViewMode] = useState('upload');
  const fileInputRef = useRef(null);
  const [clearDate, setClearDate] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState(null);
  const [uploadDates, setUploadDates] = useState([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  useEffect(() => {
    if (viewMode !== 'upload') return;
    const fetchDates = async () => {
      setIsLoadingDates(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/history?type=${activeTab}`, {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          const data = await res.json();
          setUploadDates(data);
          setClearDate(data.length > 0 ? data[0] : '');
        }
      } catch (err) { console.error(err); }
      finally { setIsLoadingDates(false); }
    };
    fetchDates();
    setClearMessage(null);
  }, [activeTab, viewMode]);

  const handleClearData = async () => {
    if (!clearDate) { alert('Pilih tanggal upload terlebih dahulu'); return; }
    if (!confirm(`Apakah Anda yakin ingin menghapus data ${activeTab === 'workorders' ? 'Work Order' : 'Rekomendasi'} yang diupload pada tanggal ${clearDate}?`)) return;
    setIsClearing(true);
    setClearMessage(null);
    try {
      const endpoint = activeTab === 'workorders' ? import.meta.env.VITE_API_URL + '/api/upload/workorders' : import.meta.env.VITE_API_URL + '/api/upload/recommendations';
      const token = localStorage.getItem('token');
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ date: clearDate })
      });
      const data = await res.json();
      if (res.ok) {
        setClearMessage({ type: 'success', text: data.message });
        const remaining = uploadDates.filter(d => d !== clearDate);
        setUploadDates(remaining);
        setClearDate(remaining.length > 0 ? remaining[0] : '');
      } else {
        setClearMessage({ type: 'error', text: data.error || 'Gagal menghapus data' });
      }
    } catch { setClearMessage({ type: 'error', text: 'Terjadi kesalahan jaringan' }); }
    finally { setIsClearing(false); }
  };

  const isReviewing = status === 'success' || status === 'error';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-ink tracking-tight">Kelola &amp; Import Data SAP</h2>
        <p className="text-platinum-dark text-xs md:text-sm mt-1">
          Unggah file SAP (CSV/Excel), kelola pembersihan data, dan tampilkan data terupload secara real-time.
        </p>
      </div>

      {/* View Mode Tabs */}
      <div className="flex border-b border-platinum-dark bg-white rounded-t-card overflow-hidden shadow-xs">
        {[
          { key: 'upload', icon: <UploadCloud className="w-4 h-4" />, label: 'Form Unggah & Kosongkan Data' },
          { key: 'workorders', icon: <FileText className="w-4 h-4" />, label: 'Display Data Work Order' },
          { key: 'recommendations', icon: <FileSpreadsheet className="w-4 h-4" />, label: 'Display Data Rekomendasi (M4/M7)' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setViewMode(tab.key)}
            className={`flex-1 py-3.5 px-4 text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${viewMode === tab.key ? 'text-navy border-navy bg-platinum/40' : 'text-platinum-dark border-transparent hover:bg-platinum/20'
              }`}>
            {tab.icon}<span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === 'upload' ? (
        <div className="space-y-6">
          <div className="bg-white border border-platinum-dark rounded-b-card shadow-sm-subtle overflow-hidden">
            {/* Pilihan Jenis Data - Form Option */}
            {!isReviewing && (
              <div className="p-6 md:px-10 md:pt-8 md:pb-0">
                <div className="mb-2 text-sm font-bold text-ink">1. Pilih Jenis Data SAP:</div>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${activeTab === 'workorders' ? 'border-navy bg-navy/5 shadow-sm' : 'border-platinum-dark hover:border-navy/50'}`}>
                    <input type="radio" name="uploadType" className="w-4 h-4 text-navy accent-navy" checked={activeTab === 'workorders'} onChange={() => { setActiveTab('workorders'); resetUpload(); }} />
                    <div>
                      <div className="text-sm font-bold text-ink">Data Work Order</div>
                      <div className="text-xs text-slate-500">Upload list Work Order (PM01-PM10)</div>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${activeTab === 'recommendations' ? 'border-navy bg-navy/5 shadow-sm' : 'border-platinum-dark hover:border-navy/50'}`}>
                    <input type="radio" name="uploadType" className="w-4 h-4 text-navy accent-navy" checked={activeTab === 'recommendations'} onChange={() => { setActiveTab('recommendations'); resetUpload(); }} />
                    <div>
                      <div className="text-sm font-bold text-ink">Data Rekomendasi</div>
                      <div className="text-xs text-slate-500">Upload list Notification (M4/M7)</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="p-6 md:p-10">
              {status === 'idle' || status === 'uploading' ? (
                <div className="max-w-xl mx-auto border-2 border-dashed border-platinum-dark rounded-xl p-8 text-center bg-platinum/30 hover:bg-platinum/80 transition-colors">
                  <input type="file" accept=".csv, .xlsx, .xls" className="hidden" ref={fileInputRef} onChange={e => { if (e.target.files?.length) setFile(e.target.files[0]); }} />

                  {!file ? (
                    <>
                      <div className="w-16 h-16 bg-white border border-platinum-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm-subtle">
                        <UploadCloud className="w-8 h-8 text-navy" />
                      </div>
                      <h3 className="text-sm font-bold text-ink mb-1">2. Pilih File CSV / Excel SAP</h3>
                      <p className="text-xs text-platinum-dark mb-6">
                        Pilih file ekstrak SAP berformat .csv atau .xlsx untuk memperbarui database ({activeTab === 'workorders' ? 'Work Order' : 'Rekomendasi'}).
                      </p>
                      <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy transition-colors cursor-pointer">
                        Browse File
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-navy/10 border border-navy/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-navy" />
                      </div>
                      <h3 className="text-sm font-bold text-ink mb-1 truncate px-4">{file.name}</h3>
                      <p className="text-[10px] text-platinum-dark mb-4 font-mono">{(file.size / 1024).toFixed(2)} KB</p>

                      {status === 'uploading' ? (
                        <div className="w-full max-w-md mx-auto my-4 p-4 bg-white border border-platinum-dark rounded-xl shadow-sm space-y-2">
                          <div className="flex justify-between items-center text-xs font-semibold text-ink">
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-navy" />
                              {uploadProgress < 100 ? 'Mengunggah file ke server...' : 'Memproses & Membaca Data SAP...'}
                            </span>
                            <span className="font-mono text-navy font-bold text-sm">{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-3 bg-platinum-dark rounded-full overflow-hidden border border-platinum-dark">
                            <div className="h-full bg-navy transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <p className="text-[10px] text-platinum-dark text-center italic">
                            {uploadProgress < 100 ? 'Mohon tunggu, file sedang dikirim...' : 'Sistem sedang mencocokkan data ke database...'}
                          </p>
                        </div>
                      ) : (
                        <div className="flex space-x-3 justify-center">
                          <button onClick={resetUpload} className="px-4 py-2 border border-platinum-dark text-ink text-xs font-bold rounded-lg hover:bg-platinum transition-colors cursor-pointer">Batal</button>
                          <button onClick={() => startUpload(file, activeTab)} className="px-5 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy transition-colors flex items-center space-x-2 shadow-sm cursor-pointer">
                            <span>Mulai Import</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : status === 'success' ? (
                <SuccessReview result={result} activeTab={activeTab} resetUpload={resetUpload} setViewMode={setViewMode} />
              ) : (
                <ErrorReview result={result} resetUpload={resetUpload} />
              )}
            </div>
          </div>

          {/* CLEAR DATA — hide when reviewing */}
          {!isReviewing && (
            <div className="bg-white border border-platinum-dark rounded-card shadow-sm-subtle overflow-hidden p-6">
              <h3 className="text-lg font-bold text-ink mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-danger" /> Kosongkan Data
              </h3>
              <p className="text-sm text-platinum-dark mb-4">
                Hapus data {activeTab === 'workorders' ? 'Work Order' : 'Rekomendasi'} berdasarkan tanggal saat data tersebut diunggah ke sistem.
              </p>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-ink mb-1">Pilih Tanggal Upload</label>
                  {isLoadingDates ? (
                    <div className="text-sm text-platinum-dark flex items-center gap-2 py-2"><Loader2 className="w-4 h-4 animate-spin" /> Memuat daftar tanggal...</div>
                  ) : uploadDates.length === 0 ? (
                    <div className="text-sm text-platinum-dark py-2">Belum ada data upload.</div>
                  ) : (
                    <select className="w-full md:max-w-xs px-3 py-2 border border-platinum-dark rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                      value={clearDate} onChange={e => setClearDate(e.target.value)}>
                      {uploadDates.map(date => <option key={date} value={date}>{date}</option>)}
                    </select>
                  )}
                </div>
                <button onClick={handleClearData} disabled={isClearing || !clearDate}
                  className="px-4 py-2 bg-white border border-danger text-danger text-sm font-bold rounded-lg hover:bg-danger hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer mt-5 md:mt-0">
                  {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Hapus Data
                </button>
              </div>
              {clearMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${clearMessage.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                  {clearMessage.text}
                </div>
              )}
            </div>
          )}
        </div>
      ) : viewMode === 'workorders' ? (
        <WorkOrderList isEmbedded={true} />
      ) : (
        <RekomendasiList isEmbedded={true} />
      )}
    </div>
  );
}


