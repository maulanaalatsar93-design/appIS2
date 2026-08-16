import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Loader2, BarChart3, Users, Briefcase, ClipboardList,
  CheckCircle2, Clock, AlertTriangle, Activity, TrendingUp,
  RefreshCw
} from 'lucide-react';
import ReactApexChart from 'react-apexcharts';

export default function WPEMMonitor() {
  const { token } = useContext(AuthContext);
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchKPI = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/wpem/kpi', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { setKpi(await res.json()); setLastUpdated(new Date()); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchKPI(); }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchKPI, 60000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading && !kpi) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-industrial-blue mb-3" />
      <p className="text-sm text-gray-500">Memuat data KPI...</p>
    </div>
  );

  const s = kpi?.summary || {};

  const widgetCards = [
    { label: 'Total Program', value: s.totalPrograms, sub: `${s.activePrograms || 0} aktif`, icon: Briefcase, iconColor: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Menunggu Approval', value: s.waitingApproval, sub: 'AVP + VP', icon: Clock, iconColor: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Total Items', value: s.totalItems, sub: `${s.doneItems || 0} selesai`, icon: ClipboardList, iconColor: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Item Overdue', value: s.overdueItems, sub: 'melewati deadline', icon: AlertTriangle, iconColor: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Personel Aktif', value: s.totalManpower, sub: `${s.busyManpower || 0} bertugas`, icon: Users, iconColor: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Utilisasi Manpower', value: `${s.utilization_pct || 0}%`, sub: `${s.availableManpower || 0} tersedia`, icon: TrendingUp, iconColor: 'text-teal-500', bg: 'bg-teal-50' },
  ];

  // Chart: Programs Progress
  const progressChart = {
    options: {
      chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans' },
      plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 6 } },
      dataLabels: { enabled: true, formatter: (v) => `${v}%`, style: { fontSize: '11px' } },
      colors: ['#18468B'],
      xaxis: {
        categories: kpi?.programsProgress?.map(p => p.title.length > 25 ? p.title.slice(0, 25) + '…' : p.title) || [],
        min: 0, max: 100,
        labels: { style: { fontSize: '11px', fontFamily: 'Plus Jakarta Sans' } }
      },
      grid: { borderColor: '#E2E8F0', strokeDashArray: 3 },
      tooltip: {
        y: { formatter: (v, { dataPointIndex }) => `${v}% (${kpi?.programsProgress[dataPointIndex]?.done_items}/${kpi?.programsProgress[dataPointIndex]?.total_items} item)` }
      }
    },
    series: [{ name: 'Progress', data: kpi?.programsProgress?.map(p => p.progress_pct) || [] }]
  };

  // Chart: Items by Status
  const itemStatusChart = {
    options: {
      chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans' },
      labels: ['Waiting', 'In Progress', 'Done', 'Overdue'],
      colors: ['#9AA3B2', '#18468B', '#1E7F53', '#D6402C'],
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: { style: { fontSize: '12px' } },
      plotOptions: { pie: { donut: { size: '65%' } } }
    },
    series: [
      (s.totalItems || 0) - (s.inProgressItems || 0) - (s.doneItems || 0) - (s.overdueItems || 0),
      s.inProgressItems || 0,
      s.doneItems || 0,
      s.overdueItems || 0
    ]
  };

  // Chart: Utilization gauge
  const utilizationGauge = {
    options: {
      chart: { type: 'radialBar', fontFamily: 'Plus Jakarta Sans' },
      plotOptions: {
        radialBar: {
          startAngle: -135, endAngle: 135,
          hollow: { size: '65%' },
          dataLabels: {
            name: { fontSize: '14px', color: '#64748B', offsetY: 24 },
            value: { fontSize: '28px', fontWeight: '700', color: '#0E2A52', offsetY: -14, formatter: v => `${v}%` }
          },
          track: { background: '#F1F5F9', strokeWidth: '97%' }
        }
      },
      colors: [s.utilization_pct > 80 ? '#D6402C' : s.utilization_pct > 60 ? '#EA853C' : '#1E7F53'],
      labels: ['Utilisasi']
    },
    series: [s.utilization_pct || 0]
  };

  return (
    <div className="p-6 w-full max-w-none space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">KPI Monitor — WPEM</h1>
          <p className="text-gray-500 text-sm mt-1">Dashboard monitoring real-time untuk Supervisor, AVP, dan VP. Auto-refresh setiap 60 detik.</p>
        </div>
        <div className="flex items-center space-x-3">
          {lastUpdated && <p className="text-xs text-gray-500">Update: {lastUpdated.toLocaleTimeString('id-ID')}</p>}
          <button onClick={fetchKPI} disabled={loading}
            className="flex items-center space-x-2 bg-white border border-gray-200 hover:bg-slate-50 text-ink px-4 py-2 rounded-lg text-sm font-medium shadow-sm-subtle">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Widget Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {widgetCards.map(w => (
          <div key={w.label} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm-subtle hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 ${w.bg} rounded-xl flex items-center justify-center mb-3`}>
              <w.icon className={`w-5 h-5 ${w.iconColor}`} />
            </div>
            <p className="text-2xl font-display font-bold text-ink">{w.value}</p>
            <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{w.label}</p>
            <p className="text-[9px] text-gray-500 mt-0.5">{w.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Programs Progress (wide) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5 shadow-md">
          <h3 className="font-semibold text-ink mb-4">Progress Program Aktif</h3>
          {kpi?.programsProgress?.length > 0 ? (
            <ReactApexChart
              options={progressChart.options}
              series={progressChart.series}
              type="bar"
              height={Math.max(200, kpi.programsProgress.length * 44)}
            />
          ) : <p className="text-sm text-gray-500 text-center py-8">Belum ada program aktif.</p>}
        </div>

        {/* Utilization Gauge + Item Status Donut */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-md">
            <h3 className="font-semibold text-ink mb-2">Utilisasi Manpower</h3>
            <ReactApexChart options={utilizationGauge.options} series={utilizationGauge.series} type="radialBar" height={220} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200">
                <p className="text-lg font-display font-bold text-emerald-600">{s.availableManpower || 0}</p>
                <p className="text-[10px] text-gray-500 font-medium">Tersedia</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200">
                <p className="text-lg font-display font-bold text-navy-600">{s.busyManpower || 0}</p>
                <p className="text-[10px] text-gray-500 font-medium">Bertugas</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-md">
            <h3 className="font-semibold text-ink mb-2">Distribusi Status Item</h3>
            {s.totalItems > 0 ? (
              <ReactApexChart options={itemStatusChart.options} series={itemStatusChart.series} type="donut" height={200} />
            ) : <p className="text-sm text-gray-500 text-center py-6">Belum ada item.</p>}
          </div>
        </div>
      </div>

      {/* Recent Activities Feed */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
        <div className="p-4 border-b border-gray-200 bg-slate-50 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-industrial-blue" />
          <h3 className="font-semibold text-ink">Aktivitas Terbaru (10 Terakhir)</h3>
        </div>
        <div className="divide-y divide-industrial-border">
          {kpi?.recentActivities?.length === 0 ? (
            <p className="text-sm text-center text-gray-500 py-8">Belum ada aktivitas.</p>
          ) : kpi?.recentActivities?.map(a => (
            <div key={a.id} className="px-5 py-3 flex items-start space-x-3 hover:bg-slate-50">
              <div className="w-7 h-7 rounded-full bg-industrial-blue/10 border border-industrial-blue/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-industrial-blue">{a.actor?.name?.charAt(0) || '?'}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-ink">{a.description}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {a.actor?.name || '—'} • {a.item?.program?.title} / {a.item?.title}
                </p>
              </div>
              <span className="text-[10px] text-gray-500 shrink-0 pt-0.5">
                {new Date(a.logged_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
