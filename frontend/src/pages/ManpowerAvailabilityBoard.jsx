import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Loader2, Search, Filter, RefreshCw, Users,
  CheckCircle2, Clock, AlertCircle, Plane, BookOpen,
  Activity, XCircle, MapPin, Calendar, Stethoscope,
  PlaneTakeoff, Globe, Info, UserCheck
} from 'lucide-react';

const STATUS_CONFIG = {
  'Tersedia':            { label: 'Tersedia',               category: 'Utama',     color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2, gradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50' },
  'Bertugas':            { label: 'Sedang Bertugas',        category: 'Utama',     color: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-500',    icon: Activity,     gradient: 'bg-gradient-to-br from-blue-50 to-blue-100/50' },
  'Training':            { label: 'Training',               category: 'Penugasan', color: 'bg-purple-100 text-purple-700 border-purple-200',    dot: 'bg-purple-500',  icon: BookOpen,     gradient: 'bg-gradient-to-br from-purple-50 to-purple-100/50' },
  'DinasDalamNegeri':    { label: 'Dinas Dalam Negeri',     category: 'Penugasan', color: 'bg-sky-100 text-sky-700 border-sky-200',             dot: 'bg-sky-500',     icon: PlaneTakeoff, gradient: 'bg-gradient-to-br from-sky-50 to-sky-100/50' },
  'DinasLuarNegeri':     { label: 'Dinas Luar Negeri',      category: 'Penugasan', color: 'bg-indigo-100 text-indigo-700 border-indigo-200',    dot: 'bg-indigo-500',  icon: Globe,        gradient: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50' },
  'Cuti':                { label: 'Cuti',                   category: 'Absen',     color: 'bg-amber-100 text-amber-700 border-amber-200',       dot: 'bg-amber-500',   icon: Calendar,     gradient: 'bg-gradient-to-br from-amber-50 to-amber-100/50' },
  'Izin':                { label: 'Izin',                   category: 'Absen',     color: 'bg-orange-100 text-orange-700 border-orange-200',    dot: 'bg-orange-500',  icon: Info,         gradient: 'bg-gradient-to-br from-orange-50 to-orange-100/50' },
  'Sakit':               { label: 'Sakit',                  category: 'Absen',     color: 'bg-rose-100 text-rose-700 border-rose-200',          dot: 'bg-rose-500',    icon: Stethoscope,  gradient: 'bg-gradient-to-br from-rose-50 to-rose-100/50' },
  'Referral':            { label: 'Referral',               category: 'Absen',     color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200', dot: 'bg-fuchsia-500', icon: UserCheck,    gradient: 'bg-gradient-to-br from-fuchsia-50 to-fuchsia-100/50' },
  'Alpha':               { label: 'Alpha/Tanpa Keterangan', category: 'Absen',     color: 'bg-slate-200 text-slate-700 border-slate-300',       dot: 'bg-slate-600',   icon: XCircle,      gradient: 'bg-gradient-to-br from-slate-100 to-slate-200/50' },
  'Libur':               { label: 'Libur / Off',            category: 'Hide',      color: 'bg-slate-100 text-slate-600 border-slate-200',       dot: 'bg-slate-400',   icon: Clock,        gradient: 'bg-gradient-to-br from-slate-50 to-slate-100/50' },
  'Inactive':            { label: 'Tidak Aktif',            category: 'Hide',      color: 'bg-gray-100 text-gray-500 border-gray-200',          dot: 'bg-gray-400',    icon: AlertCircle,  gradient: 'bg-gradient-to-br from-gray-50 to-gray-100/50' },
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
    const gradient = STATUS_CONFIG[s.key]?.gradient || 'bg-white';
    return (
      <div key={s.key}
        onClick={() => handleFilterChange('status', filters.status === s.key ? 'All' : s.key)}
        className={`${gradient} border rounded-xl p-3.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${filters.status === s.key ? 'ring-2 ring-industrial-blue shadow-md border-transparent' : 'border-industrial-border/60 shadow-sm-subtle'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`p-1.5 rounded-lg ${STATUS_CONFIG[s.key]?.color.split(' ')[0] || 'bg-slate-100'}`}>
            <StatusIcon className={`w-4 h-4 ${STATUS_CONFIG[s.key]?.color.split(' ')[1] || 'text-slate-500'}`} />
          </div>
          <span className="text-2xl font-black text-industrial-text tracking-tight">{s.count}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className={`w-2 h-2 rounded-full ${s.dot} shadow-sm`} />
          <p className="text-[11px] font-bold text-industrial-muted uppercase tracking-wider">{s.label}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-text">Availability Board</h1>
          <p className="text-industrial-muted text-sm mt-1">Pantau status ketersediaan seluruh personel secara real-time sebelum menyusun rencana manpower.</p>
        </div>
        <button onClick={fetchData} className="flex items-center space-x-2 bg-white border border-industrial-border hover:bg-slate-50 text-industrial-text px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm-subtle">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
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
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Ketidakhadiran & Izin</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.filter(s => STATUS_CONFIG[s.key]?.category === 'Absen').map(renderScorecard)}
          </div>
        </div>

        {/* Penugasan */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Penugasan & Pengembangan</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {stats.filter(s => STATUS_CONFIG[s.key]?.category === 'Penugasan').map(renderScorecard)}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white border border-industrial-border rounded-card p-4 shadow-sm-subtle">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIK, atau jabatan..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-industrial-text focus:outline-none focus:border-industrial-blue"
            />
          </div>

          {/* Multi-Select Division Filter */}
          <div className="relative min-w-[200px]">
            <label className="text-xs font-semibold text-industrial-text mb-1 block">Bagian / Divisi (Bisa Multi-Select)</label>
            <button
              type="button"
              onClick={() => setIsDivDropdownOpen(!isDivDropdownOpen)}
              className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-industrial-text focus:outline-none focus:border-industrial-blue shadow-sm"
            >
              <span className="truncate font-medium text-xs">
                {filters.selectedDivisions.length === 0
                  ? 'Semua Divisi'
                  : `${filters.selectedDivisions.length} Divisi Dipilih`}
              </span>
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 shrink-0" />
            </button>

            {/* Popover Dropdown */}
            {isDivDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-industrial-border rounded-xl shadow-xl z-30 p-2 space-y-1 w-64">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 mb-1">
                  <span className="text-[11px] font-bold text-industrial-muted">Pilih Bagian:</span>
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
                        className="flex items-center space-x-2.5 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-medium text-industrial-text"
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
                    className="px-3 py-1 bg-industrial-blue text-white text-xs font-semibold rounded-md shadow-sm hover:bg-blue-700"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs font-semibold text-industrial-text mb-1 block">Periode (Cek Ketersediaan)</label>
            <div className="flex items-center space-x-2">
              <input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-industrial-text focus:outline-none focus:border-industrial-blue" />
              <span className="text-slate-400 text-sm">–</span>
              <input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-industrial-text focus:outline-none focus:border-industrial-blue" />
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
            <span className="text-[11px] font-semibold text-industrial-muted mr-1">Filter Divisi:</span>
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
          <p className="text-[10px] text-industrial-muted mt-2">Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}</p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-industrial-border rounded-card overflow-hidden shadow-soft-card">
        <div className="p-4 border-b border-industrial-border bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-industrial-text flex items-center">
            <Users className="w-4 h-4 mr-2 text-industrial-blue" />
            Daftar Personel ({filtered.length} dari {data.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-industrial-blue mb-3" />
            <p className="text-sm text-industrial-muted">Memuat data personel...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Users className="w-12 h-12 opacity-20 mb-3" />
            <p className="text-sm font-medium text-slate-500">Tidak ada personel yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-industrial-border bg-slate-50/50 text-industrial-muted text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Personel</th>
                  <th className="px-4 py-3 font-semibold">NPK</th>
                  <th className="px-4 py-3 font-semibold">Jabatan</th>
                  <th className="px-4 py-3 font-semibold">Tipe</th>
                  <th className="px-4 py-3 font-semibold">Status Ketersediaan</th>
                  <th className="px-4 py-3 font-semibold">Status Kehadiran</th>
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
                          <span className="font-semibold text-industrial-text text-sm">{mp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-industrial-muted">{mp.npk}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-industrial-text text-xs">{mp.position}</p>
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
                              <div key={p.id} className="flex items-center text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
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
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {mp.next_available ? (
                          <span className="text-xs font-medium text-industrial-text">
                            {new Date(mp.next_available).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">Sekarang</span>
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
    </div>
  );
}
