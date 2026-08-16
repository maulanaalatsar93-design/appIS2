import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Loader2, Search, Filter, RefreshCw, Users,
  CheckCircle2, Clock, AlertCircle, Plane, BookOpen,
  Activity, XCircle, MapPin, Calendar, Stethoscope,
  PlaneTakeoff, Globe, Info, UserCheck, ChevronDown, ChevronUp, Edit
} from 'lucide-react';

const STATUS_CONFIG = {
  'Tersedia': { label: 'Tersedia', category: 'Utama', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2, gradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50' },
  'Bertugas': { label: 'Sedang Bertugas', category: 'Utama', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: Activity, gradient: 'bg-gradient-to-br from-blue-50 to-blue-100/50' },
  'Training': { label: 'Training', category: 'Penugasan', color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500', icon: BookOpen, gradient: 'bg-gradient-to-br from-purple-50 to-purple-100/50' },
  'DinasDalamNegeri': { label: 'Dinas Dalam Negeri', category: 'Penugasan', color: 'bg-sky-100 text-sky-700 border-sky-200', dot: 'bg-sky-500', icon: PlaneTakeoff, gradient: 'bg-gradient-to-br from-sky-50 to-sky-100/50' },
  'DinasLuarNegeri': { label: 'Dinas Luar Negeri', category: 'Penugasan', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', icon: Globe, gradient: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50' },
  'Cuti': { label: 'Cuti', category: 'Absen', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: Calendar, gradient: 'bg-gradient-to-br from-amber-50 to-amber-100/50' },
  'Izin': { label: 'Izin', category: 'Absen', color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', icon: Info, gradient: 'bg-gradient-to-br from-orange-50 to-orange-100/50' },
  'Sakit': { label: 'Sakit', category: 'Absen', color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500', icon: Stethoscope, gradient: 'bg-gradient-to-br from-rose-50 to-rose-100/50' },
  'Referral': { label: 'Referral', category: 'Absen', color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200', dot: 'bg-fuchsia-500', icon: UserCheck, gradient: 'bg-gradient-to-br from-fuchsia-50 to-fuchsia-100/50' },
  'Alpha': { label: 'Alpha/Tanpa Keterangan', category: 'Hide', color: 'bg-slate-200 text-slate-700 border-slate-300', dot: 'bg-slate-600', icon: XCircle, gradient: 'bg-gradient-to-br from-slate-100 to-slate-200/50' },
  'Libur': { label: 'Libur / Off', category: 'Hide', color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', icon: Clock, gradient: 'bg-gradient-to-br from-slate-50 to-slate-100/50' },
  'Inactive': { label: 'Tidak Aktif', category: 'Hide', color: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400', icon: AlertCircle, gradient: 'bg-gradient-to-br from-gray-50 to-gray-100/50' },
};

const DIVISI_LIST = [
  { id: 'All', nama: 'Semua Divisi' },
  { id: '1', nama: 'Rotating 1' },
  { id: '2', nama: 'Rotating 2' },
  { id: '3', nama: 'PPHS & OSBL' },
  { id: '4', nama: 'Bengkel' },
  { id: '5', nama: 'Metalurgi' },
  { id: '6', nama: 'QC' },
  { id: '7', nama: 'Sekretaris' },
];

export default function ManpowerAvailabilityBoard() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isDivDropdownOpen, setIsDivDropdownOpen] = useState(false);
  const [showInfoBox, setShowInfoBox] = useState(false);
  
  const { user } = useContext(AuthContext);
  const [editingSubArea, setEditingSubArea] = useState(null);
  const [newSubArea, setNewSubArea] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    selectedDivisions: [], // [] means All
    status: 'All',
    startDate: '',
    endDate: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.selectedDivisions.length > 0) {
        params.append('division_ids', filters.selectedDivisions.join(','));
      }
      if (filters.status !== 'All') params.append('status', filters.status);

      const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/availability?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setData(await res.json());
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIgnoreCert = async (certId) => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/sertifikasi/${certId}/ignore-expired`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData(); // Refresh list to remove warning
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubArea = async (e) => {
    e.preventDefault();
    if (!editingSubArea) return;
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/dashboard/manpower/${editingSubArea.id}/subarea`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sub_area: newSubArea })
      });
      if (res.ok) {
        setEditingSubArea(null);
        fetchData();
      } else {
        alert('Gagal update area');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal update area');
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.selectedDivisions, filters.status, filters.startDate, filters.endDate]);

  const getRoleRank = (emp) => {
    const pos = (emp?.position || emp?.role || '').toUpperCase();
    const type = (emp?.employee_type || '').toUpperCase();

    // VP, SIE, Manager grouped into Manager Level (Rank 1)
    if (
      pos.includes('VP') || pos.includes('VICE PRESIDENT') ||
      pos.includes('SIE') || pos.includes('STAFF INSPECTION ENGINEER') ||
      pos.includes('MANAGER') || pos.includes('SUPERINTENDENT')
    ) return 1;

    if (pos.includes('AVP') || pos.includes('ASSISTANT VICE PRESIDENT') || pos.includes('SUPERVISOR')) return 2;
    if (type.includes('ORGANIK') && !type.includes('NON')) return 3;
    if (type.includes('NON ORGANIK') || type.includes('NON-ORGANIK')) return 4;

    return 5;
  };

  const getDivRank = (emp) => {
    const div = (emp?.divisi?.nama_divisi || emp?.nama_divisi || '').toUpperCase();
    if (div.includes('ROTATING 1')) return 1;
    if (div.includes('ROTATING 2')) return 2;
    if (div.includes('BENGKEL')) return 3;
    if (div.includes('METALURGI')) return 4;
    return 5;
  };

  const filtered = data.filter(mp =>
    !filters.search || mp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    mp.npk.toLowerCase().includes(filters.search.toLowerCase()) ||
    mp.position.toLowerCase().includes(filters.search.toLowerCase())
  ).sort((a, b) => {
    const rankA = getRoleRank(a);
    const rankB = getRoleRank(b);
    if (rankA !== rankB) return rankA - rankB;

    const divA = getDivRank(a);
    const divB = getDivRank(b);
    if (divA !== divB) return divA - divB;

    return (a.name || '').localeCompare(b.name || '');
  });

  // Summary stats
  const stats = Object.keys(STATUS_CONFIG)
    .filter(key => key !== 'Inactive' && key !== 'Libur')
    .map(key => ({
      key,
      ...STATUS_CONFIG[key],
      count: data.filter(mp => mp.availability_status === key).length
    }));

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleDivision = (divId) => {
    setFilters(prev => {
      const current = prev.selectedDivisions;
      if (current.includes(divId)) {
        return { ...prev, selectedDivisions: current.filter(id => id !== divId) };
      } else {
        return { ...prev, selectedDivisions: [...current, divId] };
      }
    });
  };

  const selectAllDivisions = () => {
    setFilters(prev => ({ ...prev, selectedDivisions: [] }));
  };

  const realDivisions = DIVISI_LIST.filter(d => d.id !== 'All');

  const renderScorecard = (s) => {
    const StatusIcon = STATUS_CONFIG[s.key]?.icon || AlertCircle;
    const isActive = filters.status === s.key;
    const baseColor = STATUS_CONFIG[s.key]?.dot || 'bg-gray-500'; 
    const bgColor = baseColor; // Use the 500 shade as background
    const isUtama = STATUS_CONFIG[s.key]?.category === 'Utama';

    return (
      <div key={s.key}
        onClick={() => handleFilterChange('status', isActive ? 'All' : s.key)}
        className={`relative ${bgColor} border ${isActive ? `border-white shadow-lg ring-2 ring-offset-2 ring-${baseColor.replace('bg-', '')}` : 'border-white/20 shadow-md'} rounded-xl p-4 cursor-pointer transition-all duration-300 overflow-hidden group flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 text-white`}
      >
        {/* Subtle Background Glow/Shape behind icon */}
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
        <div className="absolute right-4 -bottom-4 w-16 h-16 rounded-full bg-black/5 transition-transform duration-500 group-hover:scale-125" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
             <div className="flex flex-col gap-1.5">
               <div className="w-8 h-8 flex items-center justify-center rounded-md bg-white/20 border border-white/30 shadow-sm mb-1 backdrop-blur-sm">
                 <StatusIcon className="w-4 h-4 text-white" />
               </div>
               <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest drop-shadow-sm">{s.label}</span>
             </div>
             {isActive && (
               <div className="w-2 h-2 rounded-full bg-white shadow-sm animate-pulse mt-1" />
             )}
          </div>
          
          {/* Number */}
          <div className="flex items-baseline gap-1.5 mt-auto">
             <span className={`text-3xl ${isUtama ? 'md:text-4xl' : 'md:text-3xl'} font-display font-black text-white tracking-tight drop-shadow-sm`}>
               {s.count}
             </span>
             <span className="text-xs font-bold text-white/80">Org</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 w-full max-w-none space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Availability Board</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau status ketersediaan seluruh personel secara real-time sebelum menyusun rencana manpower.</p>
        </div>
        <button onClick={fetchData} className="flex items-center space-x-2 bg-white border border-gray-200 hover:bg-slate-50 text-ink px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm-subtle">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden shadow-sm">
        <button
          onClick={() => setShowInfoBox(!showInfoBox)}
          className="w-full flex items-center justify-between px-4 py-3 bg-blue-100/50 hover:bg-blue-100 transition-colors text-blue-900 focus:outline-none"
        >
          <div className="flex items-center space-x-2 font-semibold text-sm">
            <Info className="w-4 h-4 text-navy-600" />
            <span>Info: Perbedaan Status Kehadiran dan Ketersediaan</span>
          </div>
          {showInfoBox ? <ChevronUp className="w-4 h-4 text-navy-600" /> : <ChevronDown className="w-4 h-4 text-navy-600" />}
        </button>

        {showInfoBox && (
          <div className="p-4 text-sm text-blue-900/80 space-y-3">
            <p>
              <strong>Status Kehadiran</strong> menunjukkan kondisi aktual personel pada hari tersebut. Jika <strong>Sabtu/Minggu</strong> dan personel tidak memiliki absensi atau program kerja, maka status otomatis menjadi <strong>Tidak Hadir</strong>. Namun, jika pada hari libur personel mendapat tugas/program kerja, status kehadirannya berubah menjadi <strong>Hadir</strong>.
            </p>
            <p>
              <strong>Status Ketersediaan</strong> menunjukkan apakah personel <strong>masih dapat diberikan tugas</strong>. Jadi, <strong>hari libur tidak otomatis berarti Tidak Tersedia</strong>. Personel yang sedang libur tetap dapat berstatus <strong>Tersedia</strong> dan sewaktu-waktu dapat diberikan penugasan.
            </p>

            <p className="mt-3 italic font-medium text-blue-800">
              Ringkasan: Libur/Akhir Pekan mengubah status kehadiran menjadi Tidak Hadir, tetapi tidak otomatis mengubah status ketersediaan.
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="space-y-6">
        {/* Utama */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
          {stats.filter(s => STATUS_CONFIG[s.key]?.category === 'Utama').map(renderScorecard)}
        </div>

        {/* Absen */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-red-400 rounded-full"></div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Ketidakhadiran & Izin</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.filter(s => STATUS_CONFIG[s.key]?.category === 'Absen').map(renderScorecard)}
          </div>
        </div>

        {/* Penugasan */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Penugasan & Pengembangan</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {stats.filter(s => STATUS_CONFIG[s.key]?.category === 'Penugasan').map(renderScorecard)}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm-subtle">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Cari nama, NIK, atau jabatan..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-ink focus:outline-none focus:border-industrial-blue"
            />
          </div>

          {/* Multi-Select Division Filter */}
          <div className="relative min-w-[200px]">
            <label className="text-xs font-semibold text-ink mb-1 block">Bagian / Divisi (Bisa Multi-Select)</label>
            <button
              type="button"
              onClick={() => setIsDivDropdownOpen(!isDivDropdownOpen)}
              className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-industrial-blue shadow-sm"
            >
              <span className="truncate font-medium text-xs">
                {filters.selectedDivisions.length === 0
                  ? 'Semua Divisi'
                  : `${filters.selectedDivisions.length} Divisi Dipilih`}
              </span>
              <Filter className="w-3.5 h-3.5 text-gray-500 ml-2 shrink-0" />
            </button>

            {/* Popover Dropdown */}
            {isDivDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 p-2 space-y-1 w-64">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 mb-1">
                  <span className="text-[11px] font-bold text-gray-500">Pilih Bagian:</span>
                  <button
                    type="button"
                    onClick={selectAllDivisions}
                    className="text-[11px] text-industrial-blue font-semibold hover:underline"
                  >
                    Reset (Semua)
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {realDivisions.map(d => {
                    const isChecked = filters.selectedDivisions.includes(d.id);
                    return (
                      <label
                        key={d.id}
                        className="flex items-center space-x-2.5 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-medium text-ink"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDivision(d.id)}
                          className="w-4 h-4 rounded text-industrial-blue focus:ring-industrial-blue border-slate-300"
                        />
                        <span>{d.nama}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="pt-1.5 border-t border-slate-100 text-right">
                  <button
                    type="button"
                    onClick={() => setIsDivDropdownOpen(false)}
                    className="px-3 py-1 bg-navy-600 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-navy-950"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs font-semibold text-ink mb-1 block">Periode (Cek Ketersediaan)</label>
            <div className="flex items-center space-x-2">
              <input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-industrial-blue" />
              <span className="text-gray-500 text-sm">–</span>
              <input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-industrial-blue" />
            </div>
          </div>

          {/* Reset */}
          {(filters.search || filters.selectedDivisions.length > 0 || filters.status !== 'All') && (
            <button onClick={() => setFilters({ search: '', selectedDivisions: [], status: 'All', startDate: '', endDate: '' })}
              className="text-xs text-industrial-blue hover:underline font-medium self-end pb-2">
              Reset Filter
            </button>
          )}
        </div>

        {/* Selected Badges */}
        {filters.selectedDivisions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-gray-500 mr-1">Filter Divisi:</span>
            {filters.selectedDivisions.map(id => {
              const d = DIVISI_LIST.find(item => item.id === id);
              return (
                <span key={id} className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold rounded-md">
                  <span>{d?.nama}</span>
                  <button type="button" onClick={() => toggleDivision(id)} className="hover:text-red-500 font-bold ml-1">×</button>
                </span>
              );
            })}
          </div>
        )}

        {lastUpdated && (
          <p className="text-[10px] text-gray-500 mt-2">Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}</p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
        <div className="p-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink flex items-center">
            <Users className="w-4 h-4 mr-2 text-industrial-blue" />
            Daftar Personel ({filtered.length} dari {data.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-industrial-blue mb-3" />
            <p className="text-sm text-gray-500">Memuat data personel...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Users className="w-12 h-12 opacity-20 mb-3" />
            <p className="text-sm font-medium text-gray-500">Tidak ada personel yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50/50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Personel</th>
                  <th className="px-4 py-3 font-semibold">NPK</th>
                  <th className="px-4 py-3 font-semibold">Jabatan</th>
                  <th className="px-4 py-3 font-semibold">Area</th>
                  <th className="px-4 py-3 font-semibold">Tipe</th>
                  <th className="px-4 py-3 font-semibold">
                    <div className="flex items-center space-x-1.5 cursor-help" title="Status Ketersediaan: Menunjukkan ketersediaan fisik personel untuk ditugaskan, terlepas dari apakah hari ini libur atau tidak. Jika tidak ada tugas atau absen, statusnya Tersedia.">
                      <span>Status Ketersediaan</span>
                      <Info className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    <div className="flex items-center space-x-1.5 cursor-help" title="Status Kehadiran: Menunjukkan kewajiban hadir kerja hari ini berdasarkan kalender. Pada akhir pekan/libur, meskipun tersedia, status ini menjadi Tidak Hadir.">
                      <span>Status Kehadiran</span>
                      <Info className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold">Program / Keterangan</th>
                  <th className="px-4 py-3 font-semibold">Tersedia Kembali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-border">
                {filtered.map(mp => {
                  const statusCfg = STATUS_CONFIG[mp.availability_status] || STATUS_CONFIG['Tersedia'];
                  const StatusIcon = statusCfg.icon;
                  const rank = getRoleRank(mp);

                  let rowBg = 'hover:bg-slate-50';
                  if (rank === 1) rowBg = 'bg-amber-200/40 hover:bg-amber-300/40'; // Manager Level
                  else if (rank === 2) rowBg = 'bg-yellow-100/80 hover:bg-yellow-200/60'; // AVP Level
                  else if (rank === 3) rowBg = 'bg-slate-100/70 hover:bg-slate-200/70'; // Organik
                  else if (rank === 4) rowBg = 'bg-blue-50/70 hover:bg-blue-100/70'; // Non Organik

                  return (
                    <tr key={mp.id} className={`transition-colors border-b border-industrial-border/50 ${rowBg}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-industrial-blue/10 border border-industrial-blue/20 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-industrial-blue">{mp.name.charAt(0)}</span>
                          </div>
                          <span className="font-semibold text-ink text-sm">{mp.name}</span>
                          {mp.sertifikasi && mp.sertifikasi.length > 0 && (
                            <div className="relative group flex items-center">
                              <AlertCircle className="w-4 h-4 text-red-500 cursor-pointer animate-pulse" />
                              <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 w-64 bg-white border border-red-200 rounded shadow-xl p-2">
                                <p className="text-[10px] font-bold text-red-600 mb-1">Sertifikat Kedaluwarsa:</p>
                                <ul className="space-y-1">
                                  {mp.sertifikasi.map(cert => (
                                    <li key={cert.id} className="text-[10px] flex flex-col gap-1 bg-red-50 p-1.5 rounded border border-red-100">
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold truncate max-w-[150px]" title={cert.nama_sertifikat}>{cert.nama_sertifikat}</span>
                                        <button 
                                          onClick={() => handleIgnoreCert(cert.id)}
                                          className="text-[9px] font-bold bg-white text-gray-500 px-1.5 py-0.5 rounded shadow-sm hover:bg-slate-100 transition-colors"
                                        >
                                          Abaikan
                                        </button>
                                      </div>
                                      <span className="text-red-500 text-[9px]">Exp: {new Date(cert.tanggal_berakhir).toLocaleDateString('id-ID')}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{mp.npk}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink text-xs">{mp.position}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-ink text-xs">{mp.sub_area || '-'}</p>
                          {(user?.role === 'Admin' || user?.role === 'Manager') && (
                            <button onClick={() => { setEditingSubArea(mp); setNewSubArea(mp.sub_area || ''); }} className="text-industrial-blue hover:text-blue-700 p-1 bg-blue-50 rounded hover:bg-blue-100">
                              <Edit className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${mp.employee_type === 'Organik' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                          {mp.employee_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${['Tersedia', 'Bertugas', 'Inactive'].includes(mp.availability_status) ? statusCfg.color : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${['Tersedia', 'Bertugas', 'Inactive'].includes(mp.availability_status) ? statusCfg.dot : 'bg-rose-500'}`} />
                          <span>{['Tersedia', 'Bertugas', 'Inactive'].includes(mp.availability_status) ? statusCfg.label : 'Tidak Tersedia'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${mp.attendance_status === 'Hadir' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : mp.attendance_status === 'Tidak Hadir' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${mp.attendance_status === 'Hadir' ? 'bg-emerald-500' : mp.attendance_status === 'Tidak Hadir' ? 'bg-slate-400' : 'bg-amber-500'}`} />
                          <span>{mp.attendance_status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {mp.active_programs.length > 0 && (
                          <div className="space-y-1">
                            {mp.active_programs.slice(0, 2).map(p => (
                              <div key={p.id} className="flex items-center text-[10px] text-navy-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                <MapPin className="w-3 h-3 mr-1 shrink-0" />
                                <span className="truncate max-w-[120px]">{p.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {mp.absensi.length > 0 && (
                          <div className="space-y-1 mt-1">
                            {mp.absensi.slice(0, 1).map(a => (
                              <div key={a.id} className="flex items-center text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                <Calendar className="w-3 h-3 mr-1 shrink-0" />
                                <span>{a.jenis}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {mp.active_programs.length === 0 && mp.absensi.length === 0 && (
                          <span className="text-[10px] text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {mp.next_available ? (
                          <span className="text-xs font-medium text-ink">
                            {new Date(mp.next_available).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Sub Area Modal */}
      {editingSubArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="font-bold text-base text-ink">Edit Area Karyawan</h3>
              <button onClick={() => setEditingSubArea(null)} className="text-gray-500 hover:text-slate-600"><XCircle size={18} /></button>
            </div>
            <p className="text-xs text-gray-500">Edit area kerja untuk {editingSubArea.name} (NPK: {editingSubArea.npk})</p>
            <form onSubmit={handleUpdateSubArea} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Sub Area</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: PPHS & OSBL"
                  value={newSubArea}
                  onChange={(e) => setNewSubArea(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-gray-50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingSubArea(null)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-navy-950 text-white font-semibold hover:bg-gray-50">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
