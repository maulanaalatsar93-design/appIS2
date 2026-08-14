import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  Clock, Users, MapPin, BarChart3, Download, RefreshCw, Filter,
  TrendingUp, Building2, UserCog, ChevronUp, ChevronDown, Search,
  Plus, X, Save, Trash2, Edit2, Check
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { AuthContext } from '../context/AuthContext';

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const SOURCE_LABELS = { DailyTask: 'Daily Task', PdmActivity: 'PdM Rotating', all: 'Semua Sumber' };

function KpiCard({ icon: Icon, label, value, sub, color, unit = 'jam' }) {
  return (
    <div className={`bg-white rounded-2xl border ${color} p-4 flex items-start gap-3 shadow-sm`}>
      <div className={`p-2.5 rounded-xl ${color.replace('border-', 'bg-').replace('-200', '-100')}`}>
        <Icon className={`w-5 h-5 ${color.replace('border-', 'text-').replace('-200', '-600')}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${color.replace('border-', 'text-').replace('-200', '-700')}`}>
          {value} <span className="text-sm font-normal text-gray-400">{unit}</span>
        </p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SortIcon({ field, sortBy, sortDir }) {
  if (sortBy !== field) return <span className="text-gray-200 ml-1">↕</span>;
  return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 ml-1 inline text-blue-500" /> : <ChevronDown className="w-3 h-3 ml-1 inline text-blue-500" />;
}

// Inline edit jam untuk personil
function InlineTimeEditor({ row, onSave, onCancel, isSaving }) {
  const getTimeStr = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toTimeString().slice(0, 5);
  };
  const getDateStr = (iso) => {
    if (!iso) return '';
    return new Date(iso).toISOString().split('T')[0];
  };

  const rowId = typeof row.id === 'string' && row.id.startsWith('dt-')
    ? parseInt(row.id.replace('dt-', ''))
    : null;

  const [mulai, setMulai] = useState(getTimeStr(row.jam_mulai));
  const [selesai, setSelesai] = useState(getTimeStr(row.jam_selesai));
  const tanggal = getDateStr(row.tanggal);

  const hitungMH = () => {
    if (!mulai || !selesai) return null;
    const diff = new Date(`2000-01-01T${selesai}`) - new Date(`2000-01-01T${mulai}`);
    return diff > 0 ? (diff / 3600000).toFixed(2) : null;
  };

  if (!rowId) return null;

  return (
    <tr className="bg-green-50 border-b border-green-100">
      <td colSpan={12} className="px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-gray-600">Edit Jam Kerja:</span>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500">Mulai</label>
            <input type="time" value={mulai} onChange={e => setMulai(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500">Selesai</label>
            <input type="time" value={selesai} onChange={e => setSelesai(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none" />
          </div>
          {mulai && selesai && hitungMH() && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              ⏱ {hitungMH()} jam
            </span>
          )}
          <button
            onClick={() => onSave(rowId, tanggal, mulai, selesai)}
            disabled={isSaving || !mulai || !selesai}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            <Check className="w-3.5 h-3.5" /> {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition">
            <X className="w-3.5 h-3.5" /> Batal
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ManHoursPage() {
  const { user } = useContext(AuthContext);

  // Role & permission
  const userRole = user?.role || '';
  const userManPowerId = user?.man_power_id || null;
  const isAdmin = ['admin', 'superadmin', 'supervisor', 'manager', 'avp', 'vp'].includes(userRole);
  const isAnggota = !isAdmin && !!userManPowerId;
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Filter states
  const [filterSource, setFilterSource] = useState('all');
  const [filterPersonel, setFilterPersonel] = useState('');
  const [filterSubArea, setFilterSubArea] = useState('');
  const [filterPabrik, setFilterPabrik] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('tanggal');
  const [sortDir, setSortDir] = useState('desc');

  const [editingRowId, setEditingRowId] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  // Form tambah DailyTask
  const [showForm, setShowForm] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [manpowerList, setManpowerList] = useState([]);
  const [pabrikList, setPabrikList] = useState([]);
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    man_power_id: '',
    pabrik_id: '',
    area: '',
    kategori_program: 'PdM Rotating',
    deskripsi_pekerjaan: '',
    waktu_mulai: '',
    waktu_selesai: '',
    wo_notif: '',
    equipment: ''
  });

  const api = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const buildParams = () => {
    const p = new URLSearchParams({ month, year });
    if (filterSource !== 'all') p.set('source', filterSource);
    if (filterSubArea) p.set('sub_area', filterSubArea);
    if (filterPabrik) p.set('pabrik', filterPabrik);
    return p.toString();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        fetch(`${api}/api/man-hours?${buildParams()}`, { headers }),
        fetch(`${api}/api/man-hours/summary?${buildParams()}`, { headers })
      ]);
      if (listRes.ok) setRows(await listRes.json());
      if (sumRes.ok) setSummary(await sumRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [month, year, filterSource, filterSubArea, filterPabrik]);

  // Fetch referensi data untuk form
  useEffect(() => {
    if (!isAdmin) return; // Anggota tidak perlu dropdown personel
    const fetchRefs = async () => {
      try {
        const [mpRes, pbRes] = await Promise.all([
          fetch(`${api}/api/dashboard/manpower`, { headers }),
          fetch(`${api}/api/dashboard/pabrik`, { headers })
        ]);
        if (mpRes.ok) {
          const data = await mpRes.json();
          setManpowerList(Array.isArray(data) ? data : (data.data || []));
        }
        if (pbRes.ok) {
          const data = await pbRes.json();
          setPabrikList(Array.isArray(data) ? data : []);
        }
      } catch (e) { console.error('fetchRefs error:', e); }
    };
    fetchRefs();
  }, [isAdmin]);

  // Sync man_power_id ke form ketika anggota buka halaman
  useEffect(() => {
    if (isAnggota && userManPowerId) {
      setForm(f => ({ ...f, man_power_id: String(userManPowerId) }));
    }
  }, [isAnggota, userManPowerId]);;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    setFormError('');
    try {
      const body = { ...form };
      // Untuk anggota, paksa man_power_id ke dirinya sendiri
      if (isAnggota) body.man_power_id = userManPowerId;
      // Convert tanggal + waktu ke ISO
      if (form.waktu_mulai) {
        body.waktu_mulai = new Date(`${form.tanggal}T${form.waktu_mulai}:00`).toISOString();
      }
      if (form.waktu_selesai) {
        body.waktu_selesai = new Date(`${form.tanggal}T${form.waktu_selesai}:00`).toISOString();
      }
      const res = await fetch(`${api}/api/daily-tasks`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan');
      }
      setShowForm(false);
      setForm(f => ({ ...f, deskripsi_pekerjaan: '', waktu_mulai: '', waktu_selesai: '', wo_notif: '', equipment: '' }));
      await fetchData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteRow = async (rowId) => {
    if (!window.confirm('Hapus data ini?')) return;
    try {
      await fetch(`${api}/api/daily-tasks/${rowId}`, { method: 'DELETE', headers });
      await fetchData();
    } catch (e) { console.error(e); }
  };

  // Inline edit: hanya update waktu_mulai & waktu_selesai
  const handleInlineSave = async (taskId, tanggal, mulai, selesai) => {
    setEditSaving(true);
    try {
      const waktu_mulai = mulai ? new Date(`${tanggal}T${mulai}:00`).toISOString() : null;
      const waktu_selesai = selesai ? new Date(`${tanggal}T${selesai}:00`).toISOString() : null;
      const res = await fetch(`${api}/api/man-hours/inline/${taskId}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ waktu_mulai, waktu_selesai })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan');
      }
      setEditingRowId(null);
      await fetchData();
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setEditSaving(false);
    }
  };

  // Cek apakah baris bisa diedit user ini
  const canEditRow = (row) => {
    if (!row.source || (row.source !== 'DailyTask' && row.source !== 'PdmActivity')) return false;
    if (isAdmin) return true;
    if (isAnggota && String(row.man_power_id) === String(userManPowerId)) return true;
    return false;
  };

  // Client-side filter & sort
  const filtered = useMemo(() => {
    let data = [...rows];
    if (filterPersonel) data = data.filter(r => r.nama_personel?.toLowerCase().includes(filterPersonel.toLowerCase()));
    if (filterJenis) data = data.filter(r => r.jenis_pekerjaan?.toLowerCase().includes(filterJenis.toLowerCase()));
    if (search) data = data.filter(r =>
      r.nama_personel?.toLowerCase().includes(search.toLowerCase()) ||
      r.task_code?.toLowerCase().includes(search.toLowerCase()) ||
      r.sub_area?.toLowerCase().includes(search.toLowerCase()) ||
      r.deskripsi?.toLowerCase().includes(search.toLowerCase())
    );
    data.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (sortBy === 'tanggal') { va = new Date(va); vb = new Date(vb); }
      if (sortBy === 'man_hours') { va = va || 0; vb = vb || 0; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [rows, filterPersonel, filterJenis, search, sortBy, sortDir]);

  const totalMhFiltered = useMemo(() =>
    filtered.reduce((acc, r) => acc + (r.man_hours || 0), 0).toFixed(2), [filtered]);

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  // Chart data
  const chartPersonel = useMemo(() => {
    if (!summary?.by_personel?.length) return null;
    const top10 = summary.by_personel.slice(0, 10);
    return {
      series: [{ name: 'Man Hours', data: top10.map(p => p.total) }],
      options: {
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
        colors: ['#3b82f6'],
        xaxis: { categories: top10.map(p => p.nama), labels: { style: { fontSize: '11px' } } },
        dataLabels: { enabled: true, formatter: v => `${v} jam`, style: { fontSize: '10px' } },
        grid: { borderColor: '#f1f5f9' },
        tooltip: { y: { formatter: v => `${v} jam` } }
      }
    };
  }, [summary]);

  const chartArea = useMemo(() => {
    if (!summary?.by_area?.length) return null;
    return {
      series: summary.by_area.map(a => a.total),
      options: {
        chart: { type: 'donut', background: 'transparent' },
        labels: summary.by_area.map(a => a.area),
        colors: ['#3b82f6','#f59e0b','#8b5cf6','#f97316','#10b981','#ef4444','#06b6d4'],
        legend: { position: 'bottom', fontSize: '11px' },
        dataLabels: { formatter: (val, opts) => `${val.toFixed(1)}%` },
        tooltip: { y: { formatter: v => `${v} jam` } }
      }
    };
  }, [summary]);

  // Export CSV
  const exportCsv = () => {
    const header = 'Tanggal,Nama,NPK,Posisi,Divisi,Pabrik,Area,Task,Jenis,Jam Mulai,Jam Selesai,Man Hours (jam),Status,Sumber\n';
    const fmtDate = v => v ? new Date(v).toLocaleDateString('id-ID') : '';
    const fmtTime = v => v ? new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
    const body = filtered.map(r => [
      fmtDate(r.tanggal), r.nama_personel || '', r.npk || '', r.posisi || '', r.divisi || '',
      r.pabrik || '', r.sub_area || '', r.task_code || '', r.jenis_pekerjaan || '',
      fmtTime(r.jam_mulai), fmtTime(r.jam_selesai), r.man_hours || '',
      r.status || '', r.source || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `man-hours-${MONTH_NAMES[month-1]}-${year}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const fmtDate = (v) => v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const fmtTime = (v) => v ? new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" /> Man Hours (Daily Task)
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAnggota
              ? `Rekap jam kerja Anda \u2014 ${MONTH_NAMES[month-1]} ${year}`
              : `Rekap jam kerja personel berdasarkan task \u2014 ${MONTH_NAMES[month-1]} ${year}`}
          </p>
          {isAnggota && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 mt-1">
              <UserCog className="w-3 h-3" /> Tampilan Personil \u2014 hanya data Anda
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200">
            {MONTH_NAMES.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-200 transition">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">
            <Plus className="w-3.5 h-3.5" /> Tambah Aktivitas
          </button>
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Modal Form Tambah DailyTask ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-green-600" /> Tambah Aktivitas Harian
              </h2>
              <button onClick={() => { setShowForm(false); setFormError(''); }}
                className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">{formError}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal <span className="text-red-500">*</span></label>
                  <input type="date" required value={form.tanggal}
                    onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Personel</label>
                  {isAnggota ? (
                    <div className="w-full text-sm border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-gray-700 font-medium">
                      {user?.name || 'Anda'} <span className="text-xs text-gray-400">(otomatis)</span>
                    </div>
                  ) : (
                    <select value={form.man_power_id} onChange={e => setForm(f => ({ ...f, man_power_id: e.target.value }))}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200">
                      <option value="">-- Pilih Personel --</option>
                      {manpowerList.map(mp => (
                        <option key={mp.id} value={mp.id}>{mp.name} ({mp.npk})</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pabrik</label>
                  <select value={form.pabrik_id} onChange={e => setForm(f => ({ ...f, pabrik_id: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200">
                    <option value="">-- Pilih Pabrik --</option>
                    {pabrikList.map(p => (
                      <option key={p.id} value={p.id}>{p.nama_pabrik}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Area</label>
                  <input type="text" placeholder="Contoh: P6 PPHS & OSBL" value={form.area}
                    onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori Program <span className="text-red-500">*</span></label>
                  <select required value={form.kategori_program} onChange={e => setForm(f => ({ ...f, kategori_program: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200">
                    <option>PdM Rotating</option>
                    <option>PM Terjadwal</option>
                    <option>Breakdown</option>
                    <option>Inspeksi</option>
                    <option>Administratif</option>
                    <option>Training</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">WO / Notif SAP</label>
                  <input type="text" placeholder="Nomor WO atau Notifikasi" value={form.wo_notif}
                    onChange={e => setForm(f => ({ ...f, wo_notif: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Equipment / Nama Alat</label>
                <input type="text" placeholder="Contoh: Kompresor K-2401" value={form.equipment}
                  onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi Pekerjaan <span className="text-red-500">*</span></label>
                <textarea required rows={3} placeholder="Jelaskan pekerjaan yang dilakukan..." value={form.deskripsi_pekerjaan}
                  onChange={e => setForm(f => ({ ...f, deskripsi_pekerjaan: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Waktu Mulai</label>
                  <input type="time" value={form.waktu_mulai}
                    onChange={e => setForm(f => ({ ...f, waktu_mulai: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Waktu Selesai</label>
                  <input type="time" value={form.waktu_selesai}
                    onChange={e => setForm(f => ({ ...f, waktu_selesai: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200" />
                </div>
              </div>
              {form.waktu_mulai && form.waktu_selesai && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
                  ⏱ Man Hours: <strong>{((new Date(`2000-01-01T${form.waktu_selesai}`) - new Date(`2000-01-01T${form.waktu_mulai}`)) / 3600000).toFixed(2)} jam</strong>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setFormError(''); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                  Batal
                </button>
                <button type="submit" disabled={formSaving}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {formSaving ? 'Menyimpan...' : 'Simpan Aktivitas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Clock} label="Total MH Hari Ini" value={summary?.totals?.today ?? '—'} sub="Dari semua task aktif" color="border-blue-200" />
        <KpiCard icon={TrendingUp} label={`Total MH ${MONTH_NAMES[month-1]}`} value={summary?.totals?.month ?? '—'} sub={`${filtered.length} aktivitas tercatat`} color="border-indigo-200" />
        <KpiCard icon={Users} label="Personel Aktif" value={summary?.by_personel?.length ?? '—'} unit="orang" sub="Memiliki aktivitas bulan ini" color="border-green-200" />
        <KpiCard icon={MapPin} label="Total MH Filtered" value={totalMhFiltered} sub={`${filtered.length} baris data`} color="border-amber-200" />
      </div>

      {/* ── Charts (hanya admin) ── */}
      {isAdmin && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar: MH per Personel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-500" /> Man Hours per Personel (Top 10)
          </h3>
          {chartPersonel ? (
            <Chart options={chartPersonel.options} series={chartPersonel.series} type="bar" height={280} />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Tidak ada data</div>
          )}
        </div>

        {/* Donut: MH per Area */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-500" /> Man Hours per Area
          </h3>
          {chartArea ? (
            <Chart options={chartArea.options} series={chartArea.series} type="donut" height={280} />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Tidak ada data</div>
          )}
        </div>
      </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Filter className="w-4 h-4 text-gray-400" /> Filter
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Sumber */}
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200">
            <option value="all">Semua Sumber</option>
            <option value="daily_task">Daily Task</option>
            <option value="pdm">PdM Rotating</option>
          </select>

          {/* Sub Area */}
          <input type="text" placeholder="Filter area..." value={filterSubArea}
            onChange={e => setFilterSubArea(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 w-44" />

          {/* Personel */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Cari personel / task..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 w-52" />
          </div>

          {/* Jenis */}
          <input type="text" placeholder="Jenis pekerjaan..." value={filterJenis}
            onChange={e => setFilterJenis(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 w-44" />

          {(filterSubArea || search || filterJenis || filterSource !== 'all') && (
            <button onClick={() => { setFilterSource('all'); setFilterSubArea(''); setSearch(''); setFilterJenis(''); }}
              className="text-xs text-gray-500 hover:text-gray-800 underline self-center">
              Reset
            </button>
          )}
          <span className="text-xs text-gray-400 self-center ml-auto">{filtered.length} aktivitas — {totalMhFiltered} jam</span>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isAnggota && (
          <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" />
            Klik ikon <strong className="mx-0.5">Edit Jam</strong> pada baris task Anda untuk memperbarui waktu kerja aktual.
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  { key: 'tanggal', label: 'Tanggal' },
                  ...(isAdmin ? [{ key: 'nama_personel', label: 'Personel' }] : []),
                  { key: 'sub_area', label: 'Area' },
                  { key: 'pabrik', label: 'Pabrik' },
                  { key: 'task_code', label: 'Task / Deskripsi' },
                  { key: 'jenis_pekerjaan', label: 'Jenis' },
                  { key: 'jam_mulai', label: 'Mulai' },
                  { key: 'jam_selesai', label: 'Selesai' },
                  { key: 'man_hours', label: 'Man Hours' },
                  { key: 'status', label: 'Status' },
                  { key: 'source', label: 'Sumber' },
                  { key: '_action', label: '' },
                ].map(col => (
                  <th key={col.key} onClick={col.key !== '_action' ? () => handleSort(col.key) : undefined}
                    className={`px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap select-none ${col.key !== '_action' ? 'cursor-pointer hover:bg-gray-100' : ''}`}>
                    {col.label}{col.key !== '_action' && <SortIcon field={col.key} sortBy={sortBy} sortDir={sortDir} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={isAdmin ? 12 : 11} className="py-20 text-center text-gray-400">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={isAdmin ? 12 : 11} className="py-16 text-center text-gray-400">
                  <Clock className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  Tidak ada data man hours untuk periode ini.
                </td></tr>
              ) : filtered.map(row => (
                <React.Fragment key={row.id}>
                  <tr className={`hover:bg-blue-50/30 transition-colors ${editingRowId === row.id ? 'bg-green-50/50' : ''}`}>
                    <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{fmtDate(row.tanggal)}</td>
                    {isAdmin && (
                      <td className="px-4 py-2.5">
                        <p className="font-semibold text-gray-800 text-xs">{row.nama_personel || '—'}</p>
                        <p className="text-[10px] text-gray-400">{row.npk} · {row.posisi}</p>
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-gray-600 text-xs whitespace-nowrap">{row.sub_area || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">{row.pabrik || '—'}</td>
                    <td className="px-4 py-2.5">
                      <p className="font-mono text-xs font-medium text-blue-700">{row.task_code || '—'}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[180px]">{row.deskripsi}</p>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{row.jenis_pekerjaan || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{fmtTime(row.jam_mulai)}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{fmtTime(row.jam_selesai)}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {row.man_hours != null ? (
                        <span className="font-bold text-blue-700 text-sm">{row.man_hours}</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                      {row.man_hours != null && <span className="text-gray-400 text-[10px] ml-0.5">jam</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        row.status === 'COMPLETED' || row.status === 'CLOSED' ? 'bg-green-100 text-green-700' :
                        row.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                        row.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{row.status || '—'}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        row.source === 'PdmActivity' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>{row.source === 'PdmActivity' ? 'PdM' : 'Daily'}</span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {canEditRow(row) && editingRowId !== row.id && (
                          <button
                            onClick={() => setEditingRowId(row.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit jam kerja"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && row.source === 'DailyTask' && (
                          <button
                            onClick={() => {
                              const taskId = typeof row.id === 'string' && row.id.startsWith('dt-')
                                ? parseInt(row.id.replace('dt-', ''))
                                : null;
                              if (taskId) handleDeleteRow(taskId);
                            }}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {editingRowId === row.id && (
                    <InlineTimeEditor
                      row={row}
                      onSave={handleInlineSave}
                      onCancel={() => setEditingRowId(null)}
                      isSaving={editSaving}
                    />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Summary Tables (hanya admin) ── */}
      {isAdmin && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Per Personel */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-gray-700">MH per Personel</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {summary.by_personel.map((p, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{p.nama}</p>
                    <p className="text-[10px] text-gray-400">{p.npk}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{p.total} <span className="text-[10px] font-normal text-gray-400">jam</span></span>
                </div>
              ))}
              {!summary.by_personel.length && <p className="px-4 py-3 text-xs text-gray-400 italic">Tidak ada data</p>}
            </div>
          </div>

          {/* Per Area */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-gray-700">MH per Area</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {summary.by_area.map((a, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                  <p className="text-xs font-semibold text-gray-700 truncate">{a.area}</p>
                  <span className="text-sm font-bold text-amber-600 ml-2 shrink-0">{a.total} <span className="text-[10px] font-normal text-gray-400">jam</span></span>
                </div>
              ))}
              {!summary.by_area.length && <p className="px-4 py-3 text-xs text-gray-400 italic">Tidak ada data</p>}
            </div>
          </div>

          {/* Per Pabrik */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-bold text-gray-700">MH per Pabrik</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {summary.by_pabrik.map((p, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                  <p className="text-xs font-semibold text-gray-700 truncate">{p.pabrik}</p>
                  <span className="text-sm font-bold text-green-600 ml-2 shrink-0">{p.total} <span className="text-[10px] font-normal text-gray-400">jam</span></span>
                </div>
              ))}
              {!summary.by_pabrik.length && <p className="px-4 py-3 text-xs text-gray-400 italic">Tidak ada data</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
