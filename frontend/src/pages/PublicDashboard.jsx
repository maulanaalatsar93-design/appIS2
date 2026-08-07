import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import ScorecardGroup from '../components/ui/ScorecardGroup';
import FloatingFilterPill from '../components/ui/FloatingFilterPill';
import { Filter, X, Loader2, Download, FileText, FileSpreadsheet, Info, CheckCircle2, AlertCircle, HardHat } from 'lucide-react';
import { getDashboardSummary } from '../services/dashboardService';
import {
  exportDashboardPDF, exportDashboardExcel,
  exportProgramPDF, exportProgramExcel,
  exportSAPPDF, exportSAPExcel,
  exportAttendancePDF, exportAttendanceExcel
} from '../services/reportService';

const PM_TYPES_LIST = [
  { code: 'PM01', name: 'Breakdown Maintenance', color: '#EF4444' },
  { code: 'PM02', name: 'Corrective Maintenance', color: '#F97316' },
  { code: 'PM03', name: 'Preventive Maintenance', color: '#10B981' },
  { code: 'PM04', name: 'Predictive Maintenance', color: '#2563EB' },
  { code: 'PM05', name: 'Improvement / Modification', color: '#8B5CF6' },
  { code: 'PM06', name: 'Refurbishment Order', color: '#EC4899' },
  { code: 'PM07', name: 'Calibration Order', color: '#14B8A6' },
  { code: 'PM08', name: 'Standing Order', color: '#64748B' },
  { code: 'PM09', name: 'Turn Around Order', color: '#D97706' },
  { code: 'PM10', name: 'General Maintenance', color: '#6366F1' },
];

const WORK_CENTER_LABELS = {
  'D0179': 'D0179 - Inspeksi Rotating 1',
  'D0180': 'D0180 - Inspeksi Rotating 2',
  'D0225': 'D0225 - Inspeksi PPHS & OSBL',
  'D0171': 'D0171 - Inspeksi Metalurgi',
  'D0169': 'D0169 - Inspeksi Bengkel',
  'D0170': 'D0170 - Inspeksi QC',
  'P&O': 'P&O - PPHS & OSBL',
};

const MONTH_NAMES = {
  1: '01 - Januari', 2: '02 - Februari', 3: '03 - Maret', 4: '04 - April',
  5: '05 - Mei', 6: '06 - Juni', 7: '07 - Juli', 8: '08 - Agustus',
  9: '09 - September', 10: '10 - Oktober', 11: '11 - November', 12: '12 - Desember'
};

export default function PublicDashboard() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPMModal, setShowPMModal] = useState(false);
  const [pmModalMode, setPmModalMode] = useState('all'); // 'all' | 'pm02plus'
  const [isExporting, setIsExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const currentMonth = (new Date().getMonth() + 1).toString();
  const currentYear = new Date().getFullYear().toString();

  // Filter States
  const [workCenter, setWorkCenter] = useState('Semua Bagian');
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  // Summary Data State
  const [summary, setSummary] = useState({
    kpi: {
      totalWO: 0,
      pm04Count: 0,
      pm02PlusCount: 0,
      totalRek: 0,
      m04Count: 0,
      m07Count: 0,
    },
    factoryComparison: {
      categories: ['P1A', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
      woData: [0, 0, 0, 0, 0, 0, 0],
      rekData: [0, 0, 0, 0, 0, 0, 0],
    },
    jobLoadTrend: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
      woSeries: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      rekSeries: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardSummary({ year, month, workCenter });
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month, workCenter]);

  const noDataConfig = {
    text: 'Belum ada data untuk filter ini',
    align: 'center',
    verticalAlign: 'middle',
    style: { color: '#64748B', fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif' }
  };

  // Chart 1: Distribusi Tipe Order (PM04 vs PM02+)
  const chart1Options = {
    chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    labels: ['PM 04', 'PM 02+'],
    colors: ['#1A4BC4', '#D9650F'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    noData: noDataConfig
  };
  const chart1Series = [summary.kpi.pm04Count, summary.kpi.pm02PlusCount];

  // Chart 2: Order per Pabrik (Bar)
  const chart2Options = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans, sans-serif' },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    colors: ['#193B8F'],
    xaxis: { categories: summary.factoryComparison.categories },
    dataLabels: { enabled: false },
    noData: noDataConfig
  };
  const chart2Series = [{ name: 'Work Orders', data: summary.factoryComparison.woData }];

  // Chart 3: Job Load & Output (Smooth Spline Area Chart 12 Bulanan presisi seperti gambar)
  const chart3Categories = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const chart3Options = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    },
    stroke: { curve: 'smooth', width: 2.5 },
    colors: ['#4285F4', '#FF7A45'], // Exact Blue and Orange from image
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.22,
        opacityTo: 0.0,
        stops: [0, 100]
      }
    },
    markers: {
      size: 3.5,
      colors: ['#4285F4', '#FF7A45'],
      strokeColors: '#ffffff',
      strokeWidth: 1.5,
      hover: { size: 5 }
    },
    dataLabels: {
      enabled: true,
      offsetY: -10,
      background: { enabled: false },
      style: {
        fontSize: '11px',
        fontWeight: '700',
        colors: ['#4285F4', '#FF7A45']
      },
      formatter: (val) => (val && val > 0 ? val.toLocaleString('en-US') : '')
    },
    xaxis: {
      categories: chart3Categories,
      axisBorder: { show: true, color: '#D1D5DB', height: 1 },
      axisTicks: { show: false },
      labels: { style: { colors: '#374151', fontSize: '11px', fontWeight: 700 } }
    },
    yaxis: {
      show: false
    },
    grid: {
      show: false
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      markers: { radius: 12 }
    },
    noData: noDataConfig
  };

  const chart3Series = [
    { name: 'Total Work Order', data: summary.jobLoadTrend?.woSeries || [] },
    { name: 'Total Rekomendasi', data: summary.jobLoadTrend?.rekSeries || [] }
  ];

  // Chart 4: Rekomendasi M4 & M7 (Donut)
  const chart4Options = {
    chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    labels: ['M4', 'M7'],
    colors: ['#059669', '#D97706'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    noData: noDataConfig
  };
  const chart4Series = [summary.kpi.m04Count, summary.kpi.m07Count];

  // Chart 5: Rilis per Pabrik (Bar)
  const chart5Options = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans, sans-serif' },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    colors: ['#168477'],
    xaxis: { categories: summary.factoryComparison.categories },
    dataLabels: { enabled: false },
    noData: noDataConfig
  };
  const chart5Series = [{ name: 'Rekomendasi', data: summary.factoryComparison.rekData }];

  return (
    <div className="p-6 space-y-6 bg-[#F0F3F8] min-h-screen text-[#0F172A] relative">
      {/* STANDARD FLOATING COLLAPSIBLE PILL FILTER */}
      <FloatingFilterPill
        isCollapsed={!isFilterOpen}
        setIsCollapsed={(val) => setIsFilterOpen(!val)}
        activeCount={(workCenter !== 'Semua Bagian' ? 1 : 0) + (month !== 'Semua Bulan' ? 1 : 0) + (year !== 'Semua' ? 1 : 0)}
        position="bottom-6 right-6"
      >
        {/* WorkCenter Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1 text-[11px] shadow-xs">
          <span className="text-slate-400 font-medium">Bagian:</span>
          <select
            value={workCenter}
            onChange={(e) => setWorkCenter(e.target.value)}
            className="bg-transparent font-bold text-[#0F172A] outline-none cursor-pointer text-[11px]"
          >
            <option value="Semua Bagian">Semua Bagian</option>
            {(summary.availableFilters?.workCenters || []).map((wc) => (
              <option key={wc} value={wc}>
                {WORK_CENTER_LABELS[wc] || wc}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1 text-[11px] shadow-xs">
          <span className="text-slate-400 font-medium">Bulan:</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent font-bold text-[#0F172A] outline-none cursor-pointer text-[11px]"
          >
            <option value="Semua Bulan">Semua Bulan</option>
            {(summary.availableFilters?.months || []).map((m) => (
              <option key={m} value={m}>
                {MONTH_NAMES[m] || String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1 text-[11px] shadow-xs">
          <span className="text-slate-400 font-medium">Tahun:</span>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-transparent font-bold text-[#0F172A] outline-none cursor-pointer text-[11px]"
          >
            <option value="Semua">Semua Tahun</option>
            {(summary.availableFilters?.years || []).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button if active */}
        {(workCenter !== 'Semua Bagian' || month !== currentMonth || year !== currentYear) && (
          <button
            onClick={() => {
              setWorkCenter('Semua Bagian');
              setMonth(currentMonth);
              setYear(currentYear);
            }}
            className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full transition-colors border border-red-200 flex items-center gap-0.5"
            title="Reset Filter"
          >
            <X size={12} /> Reset
          </button>
        )}
      </FloatingFilterPill>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#172033] tracking-tight flex items-center gap-3">
            <span>Public Executive Dashboard</span>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-[#1A4BC4]" />}
          </h2>
          <p className="text-[#64748B] text-xs md:text-sm mt-1 font-medium">
            Ringkasan eksekutif keandalan operasional industri — Data Real Database
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Executive Report Toolbar */}
          <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-[#E2E8F0] flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3 shrink-0">
              <Download size={15} className="text-[#1A4BC4]" />
              <span className="text-[11px] font-bold text-[#172033] uppercase tracking-wide">Report Export</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-[10px]">
                <span className="font-bold text-slate-600 px-1.5">Dashboard</span>
                <button onClick={() => { setIsExporting(true); setToastMsg({ type: 'info', text: 'Generating Dashboard PDF...' }); exportDashboardPDF().finally(() => { setIsExporting(false); setToastMsg({ type: 'success', text: 'Laporan berhasil diunduh' }); setTimeout(() => setToastMsg(null), 3000); }); }} className="p-1 hover:bg-white hover:text-red-600 rounded" title="Export PDF"><FileText size={13} /></button>
                <button onClick={() => { setIsExporting(true); setToastMsg({ type: 'info', text: 'Generating Dashboard Excel...' }); exportDashboardExcel().finally(() => { setIsExporting(false); setToastMsg({ type: 'success', text: 'Laporan Excel berhasil dibuat' }); setTimeout(() => setToastMsg(null), 3000); }); }} className="p-1 hover:bg-white hover:text-emerald-600 rounded" title="Export Excel"><FileSpreadsheet size={13} /></button>
              </div>
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-[10px]">
                <span className="font-bold text-slate-600 px-1.5">SAP</span>
                <button onClick={() => { exportSAPPDF(); }} className="p-1 hover:bg-white hover:text-red-600 rounded" title="Export SAP PDF"><FileText size={13} /></button>
                <button onClick={() => { exportSAPExcel(); }} className="p-1 hover:bg-white hover:text-emerald-600 rounded" title="Export SAP Excel"><FileSpreadsheet size={13} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Row: Symmetrical Scorecards Side-by-Side with Rich Varied Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScorecardGroup
          title="Work Order"
          items={[
            {
              label: 'SEMUA PM',
              subLabel: 'Total Work Order Semua PM',
              icon: FileText,
              value: summary.kpi?.totalWO || 0,
              sparklineData: summary.sparklines?.totalWo || summary.jobLoadTrend?.woSeries || [],
              isDark: true,
              bgGradient: 'bg-[#13254F]',
              borderColor: 'border-[#13254F]',
              onInfoClick: () => { setPmModalMode('all'); setShowPMModal(true); }
            },
            {
              label: 'PM04',
              subLabel: 'Total Work Order PM 04',
              icon: HardHat,
              value: summary.kpi?.pm04Count || 0,
              sparklineData: summary.sparklines?.pm04 || [],
              isDark: true,
              bgGradient: 'bg-[#1A4BC4]',
              borderColor: 'border-[#1A4BC4]'
            },
            {
              label: 'PM02+',
              subLabel: 'Total Work Order PM02+',
              icon: Info,
              value: summary.kpi?.pm02PlusCount || 0,
              sparklineData: summary.sparklines?.pm02Plus || [],
              isDark: true,
              bgGradient: 'bg-[#D9650F]',
              borderColor: 'border-[#D9650F]',
              onInfoClick: () => { setPmModalMode('pm02plus'); setShowPMModal(true); }
            },
          ]}
        />

        <ScorecardGroup
          title="Rekomendasi"
          items={[
            {
              label: 'Total Rekomendasi',
              subLabel: 'Total Rekomendasi SAP',
              icon: CheckCircle2,
              value: summary.kpi?.totalRek || 0,
              sparklineData: summary.sparklines?.totalRek || summary.jobLoadTrend?.rekSeries || [],
              isDark: true,
              bgGradient: 'bg-[#168477]',
              borderColor: 'border-[#168477]',
            },
            {
              label: 'M04',
              subLabel: 'Rekomendasi M04',
              icon: FileText,
              value: summary.kpi?.m04Count || 0,
              sparklineData: summary.sparklines?.m04 || [],
              isDark: true,
              bgGradient: 'bg-[#059669]',
              borderColor: 'border-[#059669]',
            },
            {
              label: 'M07',
              subLabel: 'Rekomendasi M07',
              icon: Info,
              value: summary.kpi?.m07Count || 0,
              sparklineData: summary.sparklines?.m07 || [],
              isDark: true,
              bgGradient: 'bg-[#D97706]',
              borderColor: 'border-[#D97706]',
            },
          ]}
        />
      </div>
      {/* Main Symmetrical Charts Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Symmetrical Bar Chart 1: Work Order per Pabrik */}
        <div className="bg-white border border-industrial-border rounded-card shadow-sm-subtle overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-[#13254F] text-white">
            <h4 className="text-sm font-bold text-white tracking-tight">Work Order per Pabrik</h4>
            <p className="text-[11px] text-slate-200 mt-0.5">Total perbandingan WO berdasarkan area pabrik.</p>
          </div>
          <div className="p-5 flex-1 min-h-[250px]">
            <Chart options={chart2Options} series={chart2Series} type="bar" width="100%" height="250" />
          </div>
        </div>

        {/* Symmetrical Bar Chart 2: Rilis Rekomendasi per Pabrik */}
        <div className="bg-white border border-industrial-border rounded-card shadow-sm-subtle overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-[#168477] text-white">
            <h4 className="text-sm font-bold text-white tracking-tight">Rilis Rekomendasi per Pabrik</h4>
            <p className="text-[11px] text-teal-100 mt-0.5">Perbandingan rilis rekomendasi berdasarkan area pabrik.</p>
          </div>
          <div className="p-5 flex-1 min-h-[250px]">
            <Chart options={chart5Options} series={chart5Series} type="bar" width="100%" height="250" />
          </div>
        </div>

        {/* Symmetrical Donut Chart 1: Distribusi Tipe Order */}
        <div className="bg-white border border-industrial-border rounded-card shadow-sm-subtle overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-[#13254F] text-white">
            <h4 className="text-sm font-bold text-white tracking-tight">Distribusi Tipe Order</h4>
            <p className="text-[11px] text-slate-200 mt-0.5">Proporsi Work Order berdasarkan tipe (PM04 vs PM02+).</p>
          </div>
          <div className="p-5 flex-1 flex items-center justify-center min-h-[250px]">
            {chart1Series.reduce((a, b) => a + b, 0) === 0 ? (
              <p className="text-xs text-industrial-muted">Tidak ada data tipe order</p>
            ) : (
              <Chart options={chart1Options} series={chart1Series} type="donut" width="100%" height="250" />
            )}
          </div>
        </div>

        {/* Symmetrical Donut Chart 2: Rekomendasi (M4 & M7) */}
        <div className="bg-white border border-industrial-border rounded-card shadow-sm-subtle overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-[#168477] text-white">
            <h4 className="text-sm font-bold text-white tracking-tight">Rekomendasi (M4 & M7)</h4>
            <p className="text-[11px] text-teal-100 mt-0.5">Proporsi rekomendasi berdasarkan status rilis.</p>
          </div>
          <div className="p-5 flex-1 flex items-center justify-center min-h-[250px]">
            {chart4Series.reduce((a, b) => a + b, 0) === 0 ? (
              <p className="text-xs text-industrial-muted">Tidak ada data rekomendasi</p>
            ) : (
              <Chart options={chart4Options} series={chart4Series} type="donut" width="100%" height="250" />
            )}
          </div>
        </div>

      {/* Full Width Bottom Chart: Job Load & Output */}
      <div className="mt-6 bg-white p-6 border border-slate-200 rounded-3xl shadow-sm lg:col-span-2 flex flex-col">
        <h3 className="text-center text-lg font-bold text-slate-800 tracking-tight mb-6">Job Load & Output (12 Bulan Terakhir)</h3>
        <div className="flex-1 min-h-[320px]">
          {chart3Series[0]?.data?.length > 0 ? (
            <Chart options={chart3Options} series={chart3Series} type="area" width="100%" height="320" />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-industrial-muted text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Tidak ada data Job Load
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* MODAL POPUP: DETAIL PM BREAKDOWN */}
      {showPMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="p-4 bg-industrial-text text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                  <Info size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide">
                    {pmModalMode === 'pm02plus' ? 'Detail Work Order PM02+ (Selain PM04)' : 'Detail Work Order per Tipe PM'}
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    {pmModalMode === 'pm02plus' ? 'Rincian tipe maintenance SAP selain PM04' : `Distribusi jumlah Work Order (${month} ${year})`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPMModal(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 text-blue-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Total PM04</div>
                  <div className="text-lg font-bold font-poppins mt-0.5">{summary.kpi.pm04Count.toLocaleString('id-ID')}</div>
                </div>
                <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100 text-orange-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Total PM02+ (Non-PM04)</div>
                  <div className="text-lg font-bold font-poppins mt-0.5">{summary.kpi.pm02PlusCount.toLocaleString('id-ID')}</div>
                </div>
              </div>

              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">
                {pmModalMode === 'pm02plus' ? 'Rincian Tipe Maintenance PM02+ (9 Tipe)' : 'Rincian Tipe Maintenance SAP (PM01 - PM10)'}
              </div>

              <div className="space-y-2">
                {(pmModalMode === 'pm02plus' ? PM_TYPES_LIST.filter(pm => pm.code !== 'PM04') : PM_TYPES_LIST).map((pm) => {
                  const count = summary.kpi?.pmBreakdown?.[pm.code] ?? (pm.code === 'PM04' ? summary.kpi.pm04Count : Math.round(summary.kpi.pm02PlusCount / 9));
                  const baseTotal = pmModalMode === 'pm02plus' ? (summary.kpi.pm02PlusCount || 1) : (summary.kpi.totalWO || 1);
                  const pct = ((count / baseTotal) * 100).toFixed(1);
                  return (
                    <div key={pm.code} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold text-white rounded-md" style={{ backgroundColor: pm.color }}>
                            {pm.code}
                          </span>
                          <span className="font-semibold text-slate-700 text-[11px]">{pm.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">{count.toLocaleString('id-ID')}</span>
                          <span className="text-[10px] text-slate-400 ml-1 font-medium">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full" style={{ width: `${Math.min(100, parseFloat(pct))}%`, backgroundColor: pm.color }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                {pmModalMode === 'pm02plus' ? 'Total PM02+: ' : 'Total Akumulasi: '}
                <strong className="text-slate-800">
                  {pmModalMode === 'pm02plus' ? summary.kpi.pm02PlusCount.toLocaleString('id-ID') : summary.kpi.totalWO.toLocaleString('id-ID')} WO
                </strong>
              </span>
              <button
                onClick={() => setShowPMModal(false)}
                className="px-4 py-1.5 bg-industrial-text hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-semibold animate-in slide-in-from-top-2 fade-in ${toastMsg.type === 'success' ? 'bg-emerald-600' : toastMsg.type === 'error' ? 'bg-red-600' : 'bg-industrial-blue'
          }`}>
          {toastMsg.type === 'success' && <CheckCircle2 size={18} />}
          {toastMsg.type === 'error' && <AlertCircle size={18} />}
          {toastMsg.type === 'info' && <Loader2 size={18} className="animate-spin" />}
          {toastMsg.text}
        </div>
      )}
    </div>
  );
}
