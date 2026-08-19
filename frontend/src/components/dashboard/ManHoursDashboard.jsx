import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Users, MapPin, BarChart3, TrendingUp, Building2, RefreshCw } from 'lucide-react';
import Chart from 'react-apexcharts';
import Sparkline from '../ui/Sparkline';

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function MhKpiCard({ icon: Icon, label, value, sub, bgGradient, sparklineColor, unit = 'jam' }) {
  const sparkData = [20, 25, 22, 30, 28, 35, 40, 38, 45, 50, 48];
  return (
    <div className={`p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-md ${bgGradient} hover:-translate-y-1 hover:shadow-xl text-white min-h-[140px]`}>
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
      <div className="absolute right-0 -bottom-4 w-32 h-16 bg-white/5 blur-2xl" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-inner backdrop-blur-md border border-white/20">
            <Icon className="w-5 h-5 text-white drop-shadow-sm" />
          </div>
          <span className="text-sm font-medium text-white/90 drop-shadow-sm leading-tight">{label}</span>
        </div>
        <div className="mt-auto mb-6 flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight drop-shadow-md leading-none">{value}</span>
            <span className="text-xs font-semibold text-white/80">{unit}</span>
          </div>
          {sub && <span className="text-[10px] font-medium text-white/60 mt-1">{sub}</span>}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 opacity-80 z-0 pointer-events-none">
        <Sparkline data={sparkData} color={sparklineColor} strokeWidth={2.5} fillOpacity={0.15} />
      </div>
    </div>
  );
}

export default function ManHoursDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const api = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ month, year });
      const res = await fetch(`${api}/api/man-hours/summary?${p}`, { headers });
      if (res.ok) setSummary(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSummary(); }, [month, year]);

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
        dataLabels: { formatter: (val) => `${val.toFixed(1)}%` },
        tooltip: { y: { formatter: v => `${v} jam` } }
      }
    };
  }, [summary]);

  const totalActivities = summary?.by_personel?.reduce((acc, p) => acc + (p.count || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200">
              {MONTH_NAMES.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
            </select>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={fetchSummary}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-200 transition">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MhKpiCard icon={Clock} label="Total MH Hari Ini" value={summary?.totals?.today ?? '—'}
          sub="Dari semua task aktif" bgGradient="bg-gradient-to-br from-blue-700 to-blue-900" sparklineColor="#60a5fa" />
        <MhKpiCard icon={TrendingUp} label={`Total MH ${MONTH_NAMES[month-1]}`} value={summary?.totals?.month ?? '—'}
          sub={`${totalActivities} aktivitas tercatat`} bgGradient="bg-gradient-to-br from-orange-500 to-orange-600" sparklineColor="#fdba74" />
        <MhKpiCard icon={Users} label="Personel Aktif" value={summary?.by_personel?.length ?? '—'} unit="orang"
          sub="Memiliki aktivitas bulan ini" bgGradient="bg-gradient-to-br from-slate-800 to-slate-900" sparklineColor="#94a3b8" />
        <MhKpiCard icon={Building2} label="Total Lokasi/Pabrik" value={summary?.by_pabrik?.length ?? '—'} unit="lokasi"
          sub="Tersebar di pabrik & area" bgGradient="bg-gradient-to-br from-emerald-600 to-emerald-800" sparklineColor="#6ee7b7" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-navy-600" /> Man Hours per Personel (Top 10)
          </h3>
          {chartPersonel ? (
            <Chart options={chartPersonel.options} series={chartPersonel.series} type="bar" height={280} />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Tidak ada data</div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
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

      {/* Summary Tables */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Per Personel */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-navy-600" />
              <h3 className="text-sm font-bold text-gray-700">MH per Personel</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {summary.by_personel?.map((p, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{p.nama}</p>
                    <p className="text-[10px] text-gray-400">{p.npk}</p>
                  </div>
                  <span className="text-sm font-bold text-navy-600">{p.total} <span className="text-[10px] font-normal text-gray-400">jam</span></span>
                </div>
              ))}
              {!summary.by_personel?.length && <p className="px-4 py-3 text-xs text-gray-400 italic">Tidak ada data</p>}
            </div>
          </div>

          {/* Per Area */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-gray-700">MH per Area</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {summary.by_area?.map((a, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                  <p className="text-xs font-semibold text-gray-700 truncate">{a.area}</p>
                  <span className="text-sm font-bold text-amber-600 ml-2 shrink-0">{a.total} <span className="text-[10px] font-normal text-gray-400">jam</span></span>
                </div>
              ))}
              {!summary.by_area?.length && <p className="px-4 py-3 text-xs text-gray-400 italic">Tidak ada data</p>}
            </div>
          </div>

          {/* Per Pabrik */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-bold text-gray-700">MH per Lokasi</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {summary.by_pabrik?.map((p, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                  <p className="text-xs font-semibold text-gray-700 truncate">{p.pabrik}</p>
                  <span className="text-sm font-bold text-green-600 ml-2 shrink-0">{p.total} <span className="text-[10px] font-normal text-gray-400">jam</span></span>
                </div>
              ))}
              {!summary.by_pabrik?.length && <p className="px-4 py-3 text-xs text-gray-400 italic">Tidak ada data</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
