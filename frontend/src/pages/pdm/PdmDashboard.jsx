import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2, Clock, AlertTriangle, AlertOctagon, Calendar, Users,
  LayoutGrid, TrendingUp, Search, X, Download,
  Activity, MapPin
} from 'lucide-react';
import Chart from 'react-apexcharts';

const STATUS_COLOR = {
  SCHEDULED:   { bg: 'bg-gray-100',   text: 'text-gray-700',   dot: '#94a3b8', label: 'Scheduled' },
  ASSIGNED:    { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: '#3b82f6', label: 'Assigned' },
  IN_PROGRESS: { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: '#f59e0b', label: 'In Progress' },
  ON_HOLD:     { bg: 'bg-orange-100', text: 'text-orange-700', dot: '#f97316', label: 'On Hold' },
  COMPLETED:   { bg: 'bg-green-100',  text: 'text-green-700',  dot: '#22c55e', label: 'Completed' },
  OVERDUE:     { bg: 'bg-red-100',    text: 'text-red-700',    dot: '#ef4444', label: 'Overdue' },
  CANCELLED:   { bg: 'bg-slate-100',  text: 'text-slate-500',  dot: '#94a3b8', label: 'Cancelled' },
};

function OccurrenceModal({ occ, onClose, onAction, api, headers }) {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    if (!occ) return;
    setLoadingHistory(true);
    fetch(`${api}/api/pdm-schedule/occurrences/${occ.id}/history`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(hist => setHistory(hist))
      .finally(() => setLoadingHistory(false));
  }, [occ?.id]);

  if (!occ) return null;
  const sc = STATUS_COLOR[occ.status] || STATUS_COLOR.SCHEDULED;
  const daysLate = occ.daysLate || 0;
  const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const fmtTime = (d) => d ? new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className={`p-5 flex justify-between items-start gap-3 ${daysLate > 4 ? 'bg-red-50 border-b border-red-100' : daysLate > 0 ? 'bg-orange-50 border-b border-orange-100' : 'bg-gray-50 border-b border-gray-100'}`}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Occurrence Detail</p>
            <h2 className="text-lg font-bold text-gray-800 truncate">{occ.rule?.code} -- {occ.rule?.subArea}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{occ.rule?.pabrik?.nama_pabrik} . {occ.rule?.equipmentCat} . {occ.rule?.criticality}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-100 bg-white">
          {[{ key: 'info', label: 'Info' }, { key: 'history', label: `Riwayat PIC (${history.length})` }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-sm font-medium transition border-b-2 ${tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Nama Tugas', value: occ.rule?.taskName },
                  { label: 'PIC', value: occ.assignedTo?.name || 'Belum ada' },
                  { label: 'Target Tanggal', value: fmt(occ.targetDate) },
                  { label: 'Scheduled', value: fmt(occ.scheduledDate) + (occ.wasShifted ? ' (geser hari libur)' : '') },
                  { label: 'Mulai Dikerjakan', value: occ.startedAt ? fmtTime(occ.startedAt) : '-' },
                  { label: 'Selesai', value: occ.completedAt ? fmtTime(occ.completedAt) : '-' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
              {daysLate > 0 && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${daysLate > 4 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">Terlambat <strong>{daysLate} hari</strong> dari jadwal</span>
                </div>
              )}
              {occ.cancelReason && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium mb-1">Alasan Pembatalan</p>
                  <p className="text-sm text-slate-700">{occ.cancelReason}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {occ.status === 'ASSIGNED' && (
                  <button onClick={() => { onAction('start', occ.id); onClose(); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition">
                    <Activity className="w-3.5 h-3.5" /> Mulai Kerjakan
                  </button>
                )}
                {occ.status === 'IN_PROGRESS' && (
                  <>
                    <button onClick={() => { onAction('hold', occ.id); onClose(); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-sm font-medium hover:bg-orange-200 transition">
                      Hold
                    </button>
                    <button onClick={() => { onAction('complete', occ.id); onClose(); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selesaikan
                    </button>
                  </>
                )}
                {['ASSIGNED','IN_PROGRESS','ON_HOLD'].includes(occ.status) && (
                  <button onClick={() => { onAction('complete', occ.id); onClose(); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition ml-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Selesai
                  </button>
                )}
              </div>
            </div>
          )}
          {tab === 'history' && (
            <div className="space-y-2">
              {loadingHistory ? (
                <p className="text-sm text-gray-400 text-center py-8">Memuat...</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Belum ada perubahan PIC</p>
              ) : history.map(h => (
                <div key={h.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                  <div className="w-1 rounded-full bg-blue-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700">{h.fromPic?.name || 'awal'} to {h.toPic?.name}</p>
                    <p className="text-xs text-orange-600 mt-0.5">{h.reason}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtTime(h.changedAt)} oleh {h.changedBy?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PdmDashboard() {
  const [stats, setStats] = useState(null);
  const [occurrences, setOccurrences] = useState([]);
  const [completionByPabrik, setCompletionByPabrik] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterPabrik, setFilterPabrik] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCriticality, setFilterCriticality] = useState('');
  const [search, setSearch] = useState('');
  const [pabriks, setPabriks] = useState([]);
  const [selectedOcc, setSelectedOcc] = useState(null);

  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, [filterMonth, filterYear, filterPabrik]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ year: filterYear, month: filterMonth });
      if (filterPabrik) params.append('pabrik_id', filterPabrik);
      const [statsRes, occRes, pabrikRes, completionRes] = await Promise.all([
        fetch(`${api}/api/pdm-schedule/dashboard-stats?${params}`, { headers }),
        fetch(`${api}/api/pdm-schedule/occurrences?${params}`, { headers }),
        fetch(`${api}/api/dashboard/pabrik`, { headers }),
        fetch(`${api}/api/pdm-schedule/completion-by-pabrik?${params}`, { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (occRes.ok) setOccurrences(await occRes.json());
      if (pabrikRes.ok) setPabriks(await pabrikRes.json());
      if (completionRes.ok) setCompletionByPabrik(await completionRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAction = async (action, id) => {
    const eps = { start: 'start', hold: 'hold', complete: 'complete', claim: 'claim' };
    try {
      const res = await fetch(`${api}/api/pdm-schedule/occurrences/${id}/${eps[action]}`, {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({})
      });
      if (res.ok) fetchAll();
      else { const err = await res.json(); alert(err.error || 'Gagal'); }
    } catch (e) { console.error(e); }
  };

  const filteredOccurrences = useMemo(() => {
    return occurrences.filter(o => {
      if (filterStatus) {
        const effStatus = o.daysLate > 0 && !['COMPLETED','CANCELLED'].includes(o.status) ? 'OVERDUE' : o.status;
        if (filterStatus === 'OVERDUE' ? effStatus !== 'OVERDUE' : o.status !== filterStatus) return false;
      }
      if (filterCriticality && o.rule?.criticality !== filterCriticality) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.rule?.code?.toLowerCase().includes(q) && !o.rule?.subArea?.toLowerCase().includes(q) && !o.assignedTo?.name?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [occurrences, filterStatus, filterCriticality, search]);

  const overdueList = occurrences.filter(o => !['COMPLETED','CANCELLED'].includes(o.status) && o.daysLate > 0);
  const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

  const donutOpts = {
    chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans', toolbar: { show: false } },
    labels: ['Selesai', 'In Progress', 'On Hold', 'Assigned', 'Belum PIC', 'Overdue'],
    colors: ['#22c55e', '#f59e0b', '#f97316', '#3b82f6', '#94a3b8', '#ef4444'],
    legend: { position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', color: '#374151', fontSize: '14px', fontWeight: 700 } } } } },
    stroke: { width: 0 },
  };
  const donutSeries = stats ? [stats.completed, stats.inProgress, stats.onHold, stats.assigned, stats.scheduled, stats.overdue] : [];

  const barOpts = {
    chart: { type: 'bar', fontFamily: 'Plus Jakarta Sans', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 5 } },
    colors: ['#22c55e', '#ef4444'],
    xaxis: { categories: completionByPabrik.map(p => p.nama_pabrik), labels: { style: { fontSize: '12px' } } },
    dataLabels: { enabled: false },
    tooltip: { shared: true, intersect: false },
    legend: { position: 'top', fontSize: '12px' },
    grid: { borderColor: '#f1f5f9' },
  };
  const barSeries = [
    { name: 'Selesai', data: completionByPabrik.map(p => p.completed) },
    { name: 'Terlambat', data: completionByPabrik.map(p => p.overdue) },
  ];

  const exportCSV = () => {
    const hd = ['Kode','Sub Area','Pabrik','Target','Scheduled','PIC','Status','Hari Terlambat'];
    const rows = filteredOccurrences.map(o => [
      o.rule?.code || '', o.rule?.subArea || '', o.rule?.pabrik?.nama_pabrik || '',
      o.targetDate ? new Date(o.targetDate).toLocaleDateString('id-ID') : '',
      o.scheduledDate ? new Date(o.scheduledDate).toLocaleDateString('id-ID') : '',
      o.assignedTo?.name || '', o.status || '', o.daysLate || 0,
    ]);
    const csv = [hd, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `PdM_${monthNames[filterMonth-1]}_${filterYear}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Dashboard PdM Rotating
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitoring keterlambatan dan progres task inspeksi</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select value={filterPabrik} onChange={e => setFilterPabrik(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">Semua Pabrik</option>
            {pabriks.map(p => <option key={p.id} value={p.id}>{p.nama_pabrik}</option>)}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(parseInt(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-200">
            {monthNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-200">
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: LayoutGrid, color: 'border-gray-200 bg-white' },
            { label: 'Selesai', value: stats.completed, icon: CheckCircle2, color: 'border-green-200 bg-green-50', textColor: 'text-green-700' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'border-amber-200 bg-amber-50', textColor: 'text-amber-700' },
            { label: 'On Hold', value: stats.onHold, icon: Clock, color: 'border-orange-200 bg-orange-50', textColor: 'text-orange-700' },
            { label: 'Assigned', value: stats.assigned, icon: Users, color: 'border-blue-200 bg-blue-50', textColor: 'text-blue-700' },
            { label: 'Belum PIC', value: stats.scheduled, icon: Calendar, color: 'border-slate-200 bg-slate-50', textColor: 'text-slate-600' },
            { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'border-red-200 bg-red-50', textColor: 'text-red-600' },
            { label: 'Overdue +4', value: stats.overdue4, icon: AlertOctagon, color: 'border-red-300 bg-red-100', textColor: 'text-red-700' },
          ].map(({ label, value, icon: Icon, color, textColor = 'text-gray-700' }) => (
            <div key={label} className={`rounded-xl border p-4 ${color} flex flex-col gap-1 hover:shadow-md transition`}>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">{label}</span>
                <Icon className={`w-4 h-4 ${textColor}`} />
              </div>
              <p className={`text-2xl font-bold ${textColor}`}>{value ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Distribusi Status</h3>
          {stats && donutSeries.some(v => v > 0)
            ? <Chart type="donut" options={donutOpts} series={donutSeries} height={260} />
            : <div className="flex items-center justify-center h-56 text-gray-300 text-sm">Belum ada data</div>}
        </div>
        <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            Selesai vs Terlambat per Pabrik
          </h3>
          {completionByPabrik.length > 0
            ? <Chart type="bar" options={barOpts} series={barSeries} height={240} />
            : <div className="flex items-center justify-center h-56 text-gray-300 text-sm">Belum ada data per pabrik</div>}
        </div>
      </div>

      {/* Overdue List */}
      {overdueList.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Task Terlambat ({overdueList.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-52 overflow-y-auto">
            {overdueList.map(occ => (
              <button key={occ.id} onClick={() => setSelectedOcc(occ)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left w-full hover:shadow-sm transition ${occ.daysLate > 4 ? 'border-red-200 bg-red-50 hover:bg-red-100' : 'border-orange-200 bg-orange-50 hover:bg-orange-100'}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${occ.daysLate > 4 ? 'bg-red-500' : 'bg-orange-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{occ.rule?.code} - {occ.rule?.subArea}</p>
                  <p className="text-xs text-gray-500">{occ.rule?.pabrik?.nama_pabrik} - PIC: {occ.assignedTo?.name || 'Belum ada'}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${occ.daysLate > 4 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  +{occ.daysLate}h
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <h3 className="font-semibold text-gray-700 shrink-0">
            Semua Task - {monthNames[filterMonth-1]} {filterYear}
            {filteredOccurrences.length !== occurrences.length && (
              <span className="ml-2 text-sm font-normal text-blue-600">({filteredOccurrences.length} dari {occurrences.length})</span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari kode / area / PIC..."
                className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white w-52 outline-none focus:ring-2 focus:ring-blue-200" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200">
              <option value="">Semua Status</option>
              {['SCHEDULED','ASSIGNED','IN_PROGRESS','ON_HOLD','COMPLETED','OVERDUE','CANCELLED'].map(s => (
                <option key={s} value={s}>{STATUS_COLOR[s]?.label || s}</option>
              ))}
            </select>
            <select value={filterCriticality} onChange={e => setFilterCriticality(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200">
              <option value="">Semua Kritikalitas</option>
              <option value="CRITICAL">Critical</option>
              <option value="NON_CRITICAL">Non Critical</option>
            </select>
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition border border-gray-200">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Kode / Area</th>
                <th className="px-4 py-3 text-left">Pabrik</th>
                <th className="px-4 py-3 text-left">Kritikalitas</th>
                <th className="px-4 py-3 text-left">Target</th>
                <th className="px-4 py-3 text-left">Scheduled</th>
                <th className="px-4 py-3 text-left">PIC</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Terlambat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredOccurrences.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                  {occurrences.length === 0 ? 'Belum ada task. Generate jadwal terlebih dahulu.' : 'Tidak ada hasil untuk filter ini.'}
                </td></tr>
              ) : filteredOccurrences.map(occ => {
                const sc = STATUS_COLOR[occ.status] || STATUS_COLOR.SCHEDULED;
                return (
                  <tr key={occ.id} onClick={() => setSelectedOcc(occ)} className="hover:bg-blue-50/40 cursor-pointer transition group">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 group-hover:text-blue-700 transition">{occ.rule?.code}</p>
                      <p className="text-xs text-gray-500">{occ.rule?.subArea}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{occ.rule?.pabrik?.nama_pabrik}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${occ.rule?.criticality === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {occ.rule?.criticality === 'CRITICAL' ? 'Critical' : 'Non Critical'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {occ.targetDate ? new Date(occ.targetDate).toLocaleDateString('id-ID', { day:'2-digit', month:'short' }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {occ.scheduledDate ? new Date(occ.scheduledDate).toLocaleDateString('id-ID', { day:'2-digit', month:'short' }) : '-'}
                      {occ.wasShifted && <span className="ml-1 text-xs text-orange-500">(geser)</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{occ.assignedTo?.name || <span className="text-gray-400 italic">Belum ada</span>}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!['COMPLETED','CANCELLED'].includes(occ.status) && occ.daysLate > 0
                        ? <span className={`font-bold text-xs ${occ.daysLate > 4 ? 'text-red-600' : 'text-orange-500'}`}>+{occ.daysLate}h</span>
                        : <span className="text-gray-300">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOcc && (
        <OccurrenceModal occ={selectedOcc} onClose={() => setSelectedOcc(null)} onAction={handleAction} api={api} headers={headers} />
      )}
    </div>
  );
}
