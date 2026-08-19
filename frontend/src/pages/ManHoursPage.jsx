import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  Clock, Users, MapPin, Download, RefreshCw, Filter,
  Building2, UserCog, ChevronUp, ChevronDown, Search,
  Plus, X, Save, Trash2, Edit2, Check
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const SOURCE_LABELS = { DailyTask: 'Daily Task', PdmActivity: 'PdM Rotating', all: 'Semua Sumber' };

import equipmentData from '../data/equipmentData.json';

function SortIcon({ field, sortBy, sortDir }) {
  if (sortBy !== field) return <span className="text-gray-200 ml-1">↕</span>;
  return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 ml-1 inline text-navy-600" /> : <ChevronDown className="w-3 h-3 ml-1 inline text-navy-600" />;
}

// Edit jam pop-out modal
function EditTimeModal({ row, onSave, onCancel, isSaving }) {
  const getTimeStr = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toTimeString().slice(0, 5);
  };
  const getDateStr = (iso) => {
    if (!iso) return '';
    return new Date(iso).toISOString().split('T')[0];
  };

  const rowId = row?.id || null;

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Edit Jam Kerja
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4 bg-gray-50/50">
          <div>
            <p className="text-sm font-semibold text-gray-700">{row.task_code}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{row.deskripsi}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Jam Mulai</label>
              <input type="time" value={mulai} onChange={e => setMulai(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Jam Selesai</label>
              <input type="time" value={selesai} onChange={e => setSelesai(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm" />
            </div>
          </div>
          
          {mulai && selesai && hitungMH() && (
            <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between mt-2 shadow-sm">
              <span className="font-medium">Total Man Hours:</span>
              <span className="font-bold text-lg">{hitungMH()} <span className="text-sm font-normal">jam</span></span>
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 bg-white">
          <button onClick={onCancel}
            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
            Batal
          </button>
          <button
            onClick={() => onSave(rowId, tanggal, mulai, selesai)}
            disabled={isSaving || !mulai || !selesai}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {isSaving ? (
              <>Menyimpan...</>
            ) : (
              <><Check className="w-4 h-4" /> Simpan</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Tambah log waktu modal
function LogTimeModal({ task, onSave, onCancel, isSaving }) {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [mulai, setMulai] = useState('');
  const [selesai, setSelesai] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  const hitungMH = () => {
    if (!mulai || !selesai) return null;
    const diff = new Date(`2000-01-01T${selesai}`) - new Date(`2000-01-01T${mulai}`);
    return diff > 0 ? (diff / 3600000).toFixed(2) : null;
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" /> Log Jam Kerja
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4 bg-gray-50/50">
          <div>
            <p className="text-sm font-semibold text-gray-700">{task.wo_notif || task.code_referensi || 'Task Tanpa Ref'}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.deskripsi_pekerjaan}</p>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Pekerjaan</label>
            <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Jam Mulai</label>
              <input type="time" value={mulai} onChange={e => setMulai(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Jam Selesai</label>
              <input type="time" value={selesai} onChange={e => setSelesai(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Aktivitas Spesifik / Keterangan Tambahan</label>
            <input type="text" placeholder="Cth: Mengukur dimensi poros..." value={deskripsi} onChange={e => setDeskripsi(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          
          {mulai && selesai && hitungMH() && (
            <div className="bg-green-50 border border-green-100 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between mt-2 shadow-sm">
              <span className="font-medium">Total Man Hours:</span>
              <span className="font-bold text-lg">{hitungMH()} <span className="text-sm font-normal">jam</span></span>
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 bg-white">
          <button onClick={onCancel}
            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
            Batal
          </button>
          <button
            onClick={() => onSave(task.id, tanggal, mulai, selesai, deskripsi)}
            disabled={isSaving || !tanggal || !mulai || !selesai}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isSaving ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Log</>}
          </button>
        </div>
      </div>
    </div>
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
  const [activeTasks, setActiveTasks] = useState([]);
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

  // Active task logging modal
  const [logTaskItem, setLogTaskItem] = useState(null);
  const [logSaving, setLogSaving] = useState(false);

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
    equipment: '',
    isiPersonilLain: false,
    equipment_custom: false
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
      const listRes = await fetch(`${api}/api/man-hours?${buildParams()}`, { headers });
      if (listRes.ok) setRows(await listRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchActiveTasks = async () => {
    try {
      const res = await fetch(`${api}/api/daily-tasks/active`, { headers });
      if (res.ok) setActiveTasks(await res.json());
    } catch (e) { console.error('fetchActiveTasks error:', e); }
  };

  useEffect(() => { fetchData(); fetchActiveTasks(); }, [month, year, filterSource, filterSubArea, filterPabrik]);

  // Fetch referensi data untuk form
  useEffect(() => {
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
  }, []);

  // Sync man_power_id ke form ketika anggota buka halaman
  useEffect(() => {
    if (userManPowerId) {
      setForm(f => ({ ...f, man_power_id: String(userManPowerId) }));
    }
  }, [userManPowerId]);

  // Helper hooks for dynamic form dropdowns
  const selectedPabrikName = useMemo(() => {
    if (!form.pabrik_id) return '';
    const pb = pabrikList.find(p => String(p.id) === String(form.pabrik_id));
    if (!pb) return '';
    if (pb.nama_pabrik === 'P1A') return 'Pabrik 1A';
    if (/^P[1-7]$/.test(pb.nama_pabrik)) return pb.nama_pabrik.replace('P', 'Pabrik ');
    return pb.nama_pabrik;
  }, [form.pabrik_id, pabrikList]);

  const availableAreas = useMemo(() => {
    if (!selectedPabrikName) return [];
    const areas = equipmentData.filter(d => d.pabrik === selectedPabrikName).map(d => d.area);
    return [...new Set(areas)].sort();
  }, [selectedPabrikName]);

  const availableEquipments = useMemo(() => {
    if (!selectedPabrikName || !form.area) return [];
    const eq = equipmentData.filter(d => d.pabrik === selectedPabrikName && d.area === form.area).map(d => d.equipment);
    return [...new Set(eq)].sort();
  }, [selectedPabrikName, form.area]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    setFormError('');
    try {
      const body = { ...form };
      // Paksa man_power_id ke dirinya sendiri jika tidak isi personil lain
      if (userManPowerId && !form.isiPersonilLain) {
        body.man_power_id = userManPowerId;
      }
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
      setForm(f => ({ ...f, deskripsi_pekerjaan: '', waktu_mulai: '', waktu_selesai: '', wo_notif: '', equipment: '', area: '', isiPersonilLain: false, equipment_custom: false }));
      await fetchData();
      await fetchActiveTasks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSaving(false);
    }
  };

  const handleLogSubmit = async (taskId, tanggal, mulai, selesai, deskripsi) => {
    setLogSaving(true);
    try {
      const body = {
        tanggal,
        waktu_mulai: `${tanggal}T${mulai}:00`,
        waktu_selesai: `${tanggal}T${selesai}:00`,
        deskripsi_aktivitas: deskripsi
      };
      const res = await fetch(`${api}/api/daily-tasks/${taskId}/log`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan log');
      }
      setLogTaskItem(null);
      await fetchData();
      await fetchActiveTasks();
    } catch (err) {
      alert('Gagal menyimpan log: ' + err.message);
    } finally {
      setLogSaving(false);
    }
  };

  const handleTaskDone = async (taskId) => {
    if (!window.confirm('Tandai pekerjaan ini sebagai selesai?')) return;
    try {
      const res = await fetch(`${api}/api/daily-tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Done' })
      });
      if (!res.ok) throw new Error('Gagal update status');
      await fetchData();
      await fetchActiveTasks();
    } catch (e) { alert(e.message); }
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
    <div className="p-6 w-full max-w-none space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-navy-600" /> Aktivitas & Log Harian
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAnggota
              ? `Log aktivitas Anda \u2014 ${MONTH_NAMES[month-1]} ${year}`
              : `Log aktivitas personel \u2014 ${MONTH_NAMES[month-1]} ${year}`}
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
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-ink rounded-lg text-sm hover:bg-green-700 transition">
            <Plus className="w-3.5 h-3.5" /> Tambah Aktivitas
          </button>
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-navy-600 text-white rounded-lg text-sm hover:bg-navy-950 transition">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Modal Form Tambah DailyTask ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  {userManPowerId && !form.isiPersonilLain ? (
                    <div className="flex flex-col gap-2">
                      <div className="w-full text-sm border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-gray-700 font-medium">
                        {user?.name || 'Anda'} <span className="text-xs text-gray-400">(otomatis)</span>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer w-max">
                        <input type="checkbox" checked={form.isiPersonilLain} onChange={e => setForm(f => ({ ...f, isiPersonilLain: e.target.checked, man_power_id: '' }))} />
                        Isi untuk personil lain
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <select value={form.man_power_id} onChange={e => setForm(f => ({ ...f, man_power_id: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200">
                        <option value="">-- Pilih Personel --</option>
                        {manpowerList.map(mp => (
                          <option key={mp.id} value={mp.id}>{mp.name} ({mp.npk})</option>
                        ))}
                      </select>
                      {userManPowerId && (
                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer w-max">
                          <input type="checkbox" checked={form.isiPersonilLain} onChange={e => setForm(f => ({ ...f, isiPersonilLain: e.target.checked, man_power_id: String(userManPowerId) }))} />
                          Isi untuk personil lain
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pabrik</label>
                  <select value={form.pabrik_id} onChange={e => setForm(f => ({ ...f, pabrik_id: e.target.value, area: '', equipment: '' }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200">
                    <option value="">-- Pilih Pabrik --</option>
                    {pabrikList.map(p => (
                      <option key={p.id} value={p.id}>{p.nama_pabrik}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Area</label>
                  <select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value, equipment: '' }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200" disabled={!selectedPabrikName}>
                    <option value="">{selectedPabrikName ? '-- Pilih Area --' : '-- Pilih Pabrik Dulu --'}</option>
                    {availableAreas.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-600">Equipment / Nama Alat</label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input type="checkbox" checked={form.equipment_custom} onChange={e => setForm(f => ({ ...f, equipment_custom: e.target.checked, equipment: '' }))} />
                    Item tidak terlist
                  </label>
                </div>
                {form.equipment_custom ? (
                  <input type="text" placeholder="Masukkan nama alat / equipment manual..." value={form.equipment}
                    onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200" />
                ) : (
                  <select value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200" disabled={!form.area}>
                    <option value="">{form.area ? '-- Pilih Equipment --' : '-- Pilih Area Dulu --'}</option>
                    {availableEquipments.map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                )}
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
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                  Batal
                </button>
                <button type="submit" disabled={formSaving}
                  className="flex-1 py-2.5 bg-green-600 text-ink rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {formSaving ? 'Menyimpan...' : 'Simpan Aktivitas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PEKERJAAN AKTIF (ACTIVE TASKS) ── */}
      {activeTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Pekerjaan Aktif Saya
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeTasks.map(task => {
              const totalLogHours = task.task_logs?.reduce((acc, log) => acc + (log.man_hours || 0), 0) || 0;
              const parentHours = task.man_hours || 0;
              const totalHours = parseFloat((parentHours + totalLogHours).toFixed(2));

              return (
                <div key={task.id} className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
                  <div className="px-4 py-3 border-b border-blue-50 bg-blue-50/30 flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-blue-600 mb-0.5 tracking-wider uppercase">{task.kategori_program}</div>
                      <div className="font-mono text-sm font-semibold text-gray-800">{task.wo_notif || task.code_referensi || 'Task Tanpa Ref'}</div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                      {task.status}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2.5">
                    <p className="text-sm text-gray-600 line-clamp-3">{task.deskripsi_pekerjaan}</p>
                    <div className="mt-auto pt-3 flex flex-col gap-1.5 text-xs text-gray-500">
                      {(task.pabrik || task.area) && (
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {task.pabrik?.nama_pabrik} {task.area ? ` - ${task.area}` : ''}</div>
                      )}
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> Total Logged: <strong className="text-blue-700">{totalHours} jam</strong></div>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-50 bg-gray-50 flex gap-2">
                    <button onClick={() => setLogTaskItem(task)}
                      className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm">
                      + Log Waktu
                    </button>
                    <button onClick={() => handleTaskDone(task.id)}
                      className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition shadow-sm">
                      Selesai
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      {/* ── Edit Time Modal ── */}
      {editingRowId && (
        <EditTimeModal
          row={filtered.find(r => r.id === editingRowId) || rows.find(r => r.id === editingRowId)}
          onSave={handleInlineSave}
          onCancel={() => setEditingRowId(null)}
          isSaving={editSaving}
        />
      )}

      {/* ── Log Time Modal ── */}
      {logTaskItem && (
        <LogTimeModal
          task={logTaskItem}
          onSave={handleLogSubmit}
          onCancel={() => setLogTaskItem(null)}
          isSaving={logSaving}
        />
      )}
    </div>
  );
}
