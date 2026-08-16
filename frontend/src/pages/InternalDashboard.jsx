import React, { useState, useEffect } from 'react';
import KPICard from '../components/ui/KPICard';
import Sparkline from '../components/ui/Sparkline';
import FloatingFilterPill from '../components/ui/FloatingFilterPill';
import { Users, Factory, FileText, CheckCircle2, X, Info, HardHat, Search, UserCheck, UserX, Loader2, PlaneTakeoff, Globe, GraduationCap, Stethoscope, Calendar, AlertTriangle, TrendingUp, Edit, Sparkles, Bot, BrainCircuit, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import PublicDashboard from './PublicDashboard';
import { getDashboardSummary, getManpowerList } from '../services/dashboardService';
import ManPowerDashboard from '../components/dashboard/ManPowerDashboard';

const WORK_CENTER_LABELS = {
  'D0179': 'D0179 - Inspeksi Rotating 1',
  'D0169': 'D0169 - Inspeksi Bengkel',
  'D0180': 'D0180 - Inspeksi Rotating 2',
  'D0171': 'D0171 - Inspeksi Metalurgi',
  'D0225': 'D0225 - Inspeksi PPHS&OSBL',
  'D0170': 'D0170 - Inspeksi QC',
  'PPHS&OSBL': 'PPHS&OSBL - Inspeksi PPHS&OSBL',
};

const MONTH_NAMES = {
  1: '01 - Januari', 2: '02 - Februari', 3: '03 - Maret', 4: '04 - April',
  5: '05 - Mei', 6: '06 - Juni', 7: '07 - Juli', 8: '08 - Agustus',
  9: '09 - September', 10: '10 - Oktober', 11: '11 - November', 12: '12 - Desember'
};

const getWoStatusColor = (status) => {
  const s = String(status || '').toUpperCase();
  if (s.includes('CNF') || s.includes('TECO')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (s.includes('REL')) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s.includes('CRTD')) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (s.includes('CAN')) return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

const generateWAMessage = (wc) => {
  let text = `*Data Work Order PM 02+*\nBagian: *${wc.name}*\nTotal: *${wc.totalWO} WO*\n\n`;
  if (wc.list && wc.list.length > 0) {
    wc.list.forEach((wo, i) => {
      text += `${i + 1}. ${wo.nomor_wo} - ${wo.status}\n`;
      text += `   Desc: ${wo.description || '-'}\n`;
      text += `   Equip: ${wo.equipment || '-'}\n\n`;
    });
  } else {
    text += `Tidak ada WO pada bulan berjalan.\n`;
  }
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};


export default function InternalDashboard() {
  const [view, setView] = useState('internal');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'jobload'
  const [summary, setSummary] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);

  const [showAiInsights, setShowAiInsights] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleGenerateAi = () => {
    setIsAiLoading(true);
    setShowAiInsights(true);
    setTimeout(() => {
      setIsAiLoading(false);
    }, 1500);
  };

  const currentMonth = (new Date().getMonth() + 1).toString();
  const currentYear = new Date().getFullYear().toString();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [workCenter, setWorkCenter] = useState('Semua Bagian');
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const [performanceKillers, setPerformanceKillers] = useState([]);
  const [pkViewMode, setPkViewMode] = useState('kualitatif'); // 'kualitatif' | 'kuantitatif'

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/performance-killers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPerformanceKillers(data);
      })
      .catch(console.error);
  }, []);

  // Manpower Modal States
  const [selectedManpowerType, setSelectedManpowerType] = useState(null); // null | 'Organik' | 'Non Organik' | 'ALL'
  const [manpowerData, setManpowerData] = useState([]);
  const [loadingManpower, setLoadingManpower] = useState(false);
  const [mpSearch, setMpSearch] = useState('');
  const [mpStatusFilter, setMpStatusFilter] = useState('ALL'); // 'ALL' | 'Hadir' | 'Absen'
  const [showPm02PlusModal, setShowPm02PlusModal] = useState(false);
  const [hideCnfPm02, setHideCnfPm02] = useState(false);
  const [hideCnfPm02Overview, setHideCnfPm02Overview] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showExpiredCertsModal, setShowExpiredCertsModal] = useState(false);

  const handleOpenManpowerModal = async (type) => {
    setSelectedManpowerType(type);
    setMpSearch('');
    setMpStatusFilter('ALL');
    setLoadingManpower(true);
    try {
      const data = await getManpowerList();
      setManpowerData(data);
    } catch (err) {
      console.error('Failed to load manpower list:', err);
    } finally {
      setLoadingManpower(false);
    }
  };

  const typeFilteredManpower = manpowerData.filter(p => {
    if (!selectedManpowerType || selectedManpowerType === 'ALL') return true;
    const empType = (p.employee_type || '').toLowerCase();
    if (selectedManpowerType === 'Organik') {
      return empType.includes('organik') && !empType.includes('non');
    }
    if (selectedManpowerType === 'Non Organik') {
      return empType.includes('non');
    }
    return true;
  });

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

  const filteredManpower = typeFilteredManpower.filter(p => {
    if (mpStatusFilter === 'Hadir' && p.statusToday !== 'Hadir') return false;
    if (mpStatusFilter === 'Absen' && p.statusToday === 'Hadir') return false;

    if (!mpSearch.trim()) return true;
    const term = mpSearch.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(term) ||
      (p.npk || '').toLowerCase().includes(term) ||
      (p.position || '').toLowerCase().includes(term) ||
      (p.nama_divisi || '').toLowerCase().includes(term) ||
      (p.employee_type || '').toLowerCase().includes(term)
    );
  }).sort((a, b) => {
    const rankA = getRoleRank(a);
    const rankB = getRoleRank(b);
    if (rankA !== rankB) return rankA - rankB;

    const divA = getDivRank(a);
    const divB = getDivRank(b);
    if (divA !== divB) return divA - divB;

    return (a.name || '').localeCompare(b.name || '');
  });

  useEffect(() => {
    getDashboardSummary({ month, year, workCenter })
      .then((data) => setSummary(data))
      .catch((err) => console.error('Failed to load internal summary:', err));
  }, [month, year, workCenter]);

  if (view === 'public') {
    return (
      <PublicDashboard onBack={() => setView('internal')} />
    );
  }

  // 12-Month Trend Line Chart options
  const trendChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const seriesIdx = config.seriesIndex;
          const dataIdx = config.dataPointIndex;
          if (seriesIdx === undefined || dataIdx === undefined || seriesIdx < 0 || dataIdx < 0) return;

          const categories = summary?.jobLoadTrend?.categories || ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
          const woData = summary?.jobLoadTrend?.woSeries || [];
          const rekData = summary?.jobLoadTrend?.rekSeries || [];

          const month = categories[dataIdx] || 'Bulan';
          const seriesName = seriesIdx === 0 ? 'Work Orders' : 'Rekomendasi';
          const valWO = woData[dataIdx] || 0;
          const valRek = rekData[dataIdx] || 0;
          const val = seriesIdx === 0 ? valWO : valRek;
          const totalCategory = valWO + valRek;

          setSelectedSegment({
            chartType: 'trend',
            title: `Tren 12 Bulan - ${month}`,
            category: month,
            seriesName: seriesName,
            value: val,
            totalCategory: totalCategory,
            categoryPercentage: totalCategory > 0 ? ((val / totalCategory) * 100).toFixed(1) : '0.0',
            breakdown: [
              { label: 'Work Orders', count: valWO, percentage: totalCategory > 0 ? Number(((valWO / totalCategory) * 100).toFixed(1)) : 0 },
              { label: 'Rekomendasi', count: valRek, percentage: totalCategory > 0 ? Number(((valRek / totalCategory) * 100).toFixed(1)) : 0 },
            ]
          });
        }
      }
    },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#193B8F', '#168477'],
    xaxis: { categories: summary?.jobLoadTrend?.categories || ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'] },
    markers: { size: 4, hover: { size: 6 } },
    legend: { position: 'top', horizontalAlign: 'right' },
    tooltip: { shared: true, intersect: false },
  };

  const trendChartSeries = [
    { name: 'Work Orders', data: summary?.jobLoadTrend?.woSeries || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'Rekomendasi', data: summary?.jobLoadTrend?.rekSeries || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  ];

  // Helper for Semi-Circle Radial Gauge Chart (for dark cards)
  const getRadialGaugeOptions = (label, color) => ({
    chart: {
      type: 'radialBar',
      sparkline: { enabled: true },
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      background: 'transparent',
    },
    plotOptions: {
      radialBar: {
        startAngle: -110,
        endAngle: 110,
        offsetY: 5,
        hollow: {
          size: '55%',
          background: 'transparent',
        },
        track: {
          background: 'rgba(255,255,255,0.15)',
          strokeWidth: '100%',
          margin: 3,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '10px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
            offsetY: 20,
          },
          value: {
            offsetY: -5,
            fontSize: '22px',
            fontWeight: 800,
            color: '#FFFFFF',
            formatter: (val) => `${Number(val || 0).toFixed(1)}%`
          }
        }
      }
    },
    colors: [color || '#4B91F7'],
    labels: [label || 'Progress CNF'],
    stroke: { lineCap: 'round' },
  });

  // Status Distribution Chart Options
  const statusDistChartOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const seriesIdx = config.seriesIndex;
          const dataIdx = config.dataPointIndex;
          if (seriesIdx === undefined || dataIdx === undefined || seriesIdx < 0 || dataIdx < 0) return;

          const series = summary?.jobLoadDetails?.statusDistribution?.series || [];
          const categories = summary?.jobLoadDetails?.statusDistribution?.categories || [];

          const categoryName = categories[dataIdx] || 'Bagian';
          const currentSeries = series[seriesIdx];
          const seriesName = currentSeries?.name || '';
          const value = currentSeries?.data[dataIdx] || 0;

          let totalCategory = 0;
          const breakdown = series.map(s => {
            const cnt = s.data[dataIdx] || 0;
            totalCategory += cnt;
            return { label: s.name, count: cnt };
          });

          const formattedBreakdown = breakdown.map(b => ({
            ...b,
            percentage: totalCategory > 0 ? Number(((b.count / totalCategory) * 100).toFixed(1)) : 0
          }));

          setSelectedSegment({
            chartType: 'status',
            title: `Distribusi Status WO - ${categoryName}`,
            category: categoryName,
            seriesName: seriesName,
            value: value,
            totalCategory: totalCategory,
            categoryPercentage: totalCategory > 0 ? ((value / totalCategory) * 100).toFixed(1) : '0.0',
            breakdown: formattedBreakdown
          });
        }
      }
    },
    plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 2 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ['#ffffff'] },
    colors: ['#13254F', '#1A4BC4', '#059669', '#9AA3B2', '#D9650F'],
    xaxis: { categories: summary?.jobLoadDetails?.statusDistribution?.categories || ['Rotating 1', 'Rotating 2', 'Bengkel', 'Metalurgi', 'PPHS&OSBL', 'QC'] },
    fill: { opacity: 1 },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val, { series, dataPointIndex }) => {
          let total = 0;
          if (series) {
            for (let i = 0; i < series.length; i++) {
              total += (series[i][dataPointIndex] || 0);
            }
          }
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
          return `${val} WO (${pct}%)`;
        }
      }
    }
  };

  // PM Type Distribution Chart Options
  const pmTypeDistChartOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const seriesIdx = config.seriesIndex;
          const dataIdx = config.dataPointIndex;
          if (seriesIdx === undefined || dataIdx === undefined || seriesIdx < 0 || dataIdx < 0) return;

          const series = summary?.jobLoadDetails?.pmTypeDistribution?.series || [];
          const categories = summary?.jobLoadDetails?.pmTypeDistribution?.categories || [];

          const categoryName = categories[dataIdx] || 'Bagian';
          const currentSeries = series[seriesIdx];
          const seriesName = currentSeries?.name || '';
          const value = currentSeries?.data[dataIdx] || 0;

          let totalCategory = 0;
          const breakdown = series.map(s => {
            const cnt = s.data[dataIdx] || 0;
            totalCategory += cnt;
            return { label: s.name, count: cnt };
          });

          const formattedBreakdown = breakdown.map(b => ({
            ...b,
            percentage: totalCategory > 0 ? Number(((b.count / totalCategory) * 100).toFixed(1)) : 0
          }));

          setSelectedSegment({
            chartType: 'pmType',
            title: `Distribusi Tipe WO - ${categoryName}`,
            category: categoryName,
            seriesName: seriesName,
            value: value,
            totalCategory: totalCategory,
            categoryPercentage: totalCategory > 0 ? ((value / totalCategory) * 100).toFixed(1) : '0.0',
            breakdown: formattedBreakdown
          });
        }
      }
    },
    plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 2 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ['#ffffff'] },
    colors: ['#1A4BC4', '#D9650F', '#F97316', '#B45309', '#EA853C', '#EA580C'],
    xaxis: { categories: summary?.jobLoadDetails?.pmTypeDistribution?.categories || ['Rotating 1', 'Rotating 2', 'Bengkel', 'Metalurgi', 'PPHS&OSBL', 'QC'] },
    fill: { opacity: 1 },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val, { series, dataPointIndex }) => {
          let total = 0;
          if (series) {
            for (let i = 0; i < series.length; i++) {
              total += (series[i][dataPointIndex] || 0);
            }
          }
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
          return `${val} WO (${pct}%)`;
        }
      }
    }
  };

  const CNF_TARGET = 90; // Target capaian 90%

  const getCapaianBadge = (percent) => {
    const meetsTarget = percent >= CNF_TARGET;
    if (percent >= 95) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3" />{percent}%
        </span>
      );
    } else if (percent >= CNF_TARGET) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700 border border-sky-300">
          <CheckCircle2 className="w-3 h-3" />{percent}%
        </span>
      );
    } else if (percent >= 75) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-300">
          <AlertTriangle className="w-3 h-3" />{percent}%
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-300">
          <X className="w-3 h-3" />{percent}%
        </span>
      );
    }
  };

  // Progress bar dengan marker target 90%
  const ProgressBarWithTarget = ({ value, color = 'bg-industrial-blue', target = CNF_TARGET }) => {
    const capped = Math.min(value || 0, 100);
    const meetsTarget = capped >= target;
    return (
      <div className="relative w-full">
        {/* Bar track */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
          {/* Fill */}
          <div
            className={`h-full rounded-full transition-all duration-700 ${meetsTarget ? color : (capped >= 75 ? 'bg-amber-500' : 'bg-red-500')}`}
            style={{ width: `${capped}%` }}
          />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full pointer-events-none" />
        </div>
        {/* Target marker line at 90% */}
        <div
          className="absolute top-0 h-4 w-0.5 bg-yellow-400 shadow-[0_0_4px_#FDE047] z-10"
          style={{ left: `${target}%`, transform: 'translateX(-50%)' }}
          title={`Target ${target}%`}
        />
        {/* Target label */}
        <div
          className="absolute -top-5 text-[9px] font-bold text-yellow-600 whitespace-nowrap"
          style={{ left: `${target}%`, transform: 'translateX(-50%)' }}
        >
          Target {target}%
        </div>
        {/* Pointer triangle */}
        <div
          className="absolute -top-2 text-yellow-400"
          style={{ left: `${target}%`, transform: 'translateX(-50%)', fontSize: '8px' }}
        >
          ▼
        </div>
      </div>
    );
  };

  return (
    <div className="md:px-2 md:py-2 space-y-5 relative">
      {/* STANDARD FLOATING COLLAPSIBLE PILL FILTER */}
      <FloatingFilterPill
        isCollapsed={!isFilterOpen}
        setIsCollapsed={(val) => setIsFilterOpen(!val)}
        activeCount={(workCenter !== 'Semua Bagian' ? 1 : 0) + (month !== 'Semua Bulan' ? 1 : 0) + (year !== 'Semua' ? 1 : 0)}
        position="bottom-14 right-3"
      >
        {/* WorkCenter Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1 text-[11px] shadow-xs">
          <span className="text-gray-500 font-medium">Bagian:</span>
          <select
            value={workCenter}
            onChange={(e) => setWorkCenter(e.target.value)}
            className="bg-transparent font-bold text-[#0F172A] outline-none cursor-pointer text-[11px]"
          >
            <option value="Semua Bagian">Semua Bagian</option>
            {(summary?.availableFilters?.workCenters || []).map((wc) => (
              <option key={wc} value={wc}>
                {WORK_CENTER_LABELS[wc] || wc}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1 text-[11px] shadow-xs">
          <span className="text-gray-500 font-medium">Bulan:</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent font-bold text-[#0F172A] outline-none cursor-pointer text-[11px]"
          >
            <option value="Semua Bulan">Semua Bulan</option>
            {(summary?.availableFilters?.months || []).map((m) => (
              <option key={m} value={m}>
                {MONTH_NAMES[m] || String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1 text-[11px] shadow-xs">
          <span className="text-gray-500 font-medium">Tahun:</span>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-transparent font-bold text-[#0F172A] outline-none cursor-pointer text-[11px]"
          >
            <option value="Semua">Semua Tahun</option>
            {(summary?.availableFilters?.years || []).map((y) => (
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

      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display md:text-[28px] font-extrabold text-[#0A1B3F] tracking-tight">
            Internal Department Dashboard
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1.5 font-medium">
            Status operasional keandalan departemen ISTEK 2 (Data Real Database).
          </p>
        </div>

        {/* View & Tab Switcher Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/80 backdrop-blur-md p-1.5 rounded-full ring-1 ring-gray-100/50 shadow-sm border border-white">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${activeTab === 'overview'
                ? 'bg-gradient-to-br from-[#193B8F] to-[#0A1B3F] text-white shadow-md'
                : 'text-gray-500 hover:text-[#193B8F] hover:bg-gray-50'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('jobload')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${activeTab === 'jobload'
                ? 'bg-gradient-to-br from-[#193B8F] to-[#0A1B3F] text-white shadow-md'
                : 'text-gray-500 hover:text-[#193B8F] hover:bg-gray-50'
                }`}
            >
              Job Load &amp; Progress
            </button>
            <button
              onClick={() => setActiveTab('performance_killer')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${activeTab === 'performance_killer'
                ? 'bg-gradient-to-br from-[#193B8F] to-[#0A1B3F] text-white shadow-md'
                : 'text-gray-500 hover:text-[#193B8F] hover:bg-gray-50'
                }`}
            >
              Performance Killer
            </button>
            <button
              onClick={() => setActiveTab('man_power')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${activeTab === 'man_power'
                ? 'bg-gradient-to-br from-[#193B8F] to-[#0A1B3F] text-white shadow-md'
                : 'text-gray-500 hover:text-[#193B8F] hover:bg-gray-50'
                }`}
            >
              Man Power
            </button>
          </div>

          <button
            onClick={() => setView('public')}
            className="px-4 py-2 bg-white text-[#193B8F] border border-gray-200 text-xs font-bold rounded-full shadow-sm hover:border-[#193B8F]/30 hover:bg-blue-50/50 transition-all duration-300"
          >
            Public View
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB CONTENT */}
      {activeTab === 'man_power' && (
        <ManPowerDashboard />
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Pemisah Monitor Availability & Sertification */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px bg-slate-300 flex-1"></div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 bg-gray-50">Monitor Availability & Sertification</span>
            <div className="h-px bg-slate-300 flex-1"></div>
          </div>

          {/* Main KPI Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div onClick={() => handleOpenManpowerModal('ALL')} className="cursor-pointer transition-transform hover:scale-[1.02]">
              <KPICard
                icon={Users}
                label="Kehadiran Personil"
                value={summary?.manPower?.hadir || '0'}
                unit="Hadir"
                trendValue={`Org: ${summary?.manPower?.organik?.hadir || 0}/${summary?.manPower?.organik?.total || 0} • Non: ${summary?.manPower?.nonOrganik?.hadir || 0}/${summary?.manPower?.nonOrganik?.total || 0}`}
                trendDir="up"
                trendLabel="Hari Ini (Klik rincian)"
                variant="navy"
              />
            </div>
            <div onClick={() => setShowExpiredCertsModal(true)} className="cursor-pointer transition-transform hover:scale-[1.02]">
              <KPICard
                icon={AlertTriangle}
                label="Sertifikasi Expired"
                value={summary?.expiredCertifications?.length || '0'}
                unit="Sertifikat"
                trendValue="Lihat Rincian"
                trendDir="down"
                trendLabel="Butuh Perpanjangan"
                variant="orange"
              />
            </div>
          </div>

          {/* ManPower Detailed Scorecards — Premium Redesign */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {/* === Header Banner === */}
            <div className="relative bg-white border-b border-gray-100 px-6 py-5">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='2'/%3E%3Ccircle cx='13' cy='3' r='2'/%3E%3C/g%3E%3C/svg%3E\")" }}></div>
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status Kehadiran Personil</span>
                  </div>
                  <h3 className="text-base font-extrabold text-ink">Monitoring Man Power Hari Ini</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Organik & Non-Organik — Data Real Time</p>
                </div>
                {/* Attendance Rate Ring */}
                <div className="shrink-0 text-right">
                  <div className="inline-flex flex-col items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tingkat Hadir</div>
                    <div className={`text-3xl font-extrabold ${summary?.manPower?.total > 0 && (summary.manPower.hadir / summary.manPower.total) >= 0.85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {summary?.manPower?.total > 0 ? Math.round(summary.manPower.hadir / summary.manPower.total * 100) : 0}%
                    </div>
                    <div className="text-[10px] text-blue-600 font-bold mt-1">{summary?.manPower?.hadir || 0} / {summary?.manPower?.total || 0} org</div>
                  </div>
                </div>
              </div>
              {/* Progress bar in header */}
              <div className="relative mt-4">
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${summary?.manPower?.total > 0 ? Math.round(summary.manPower.hadir / summary.manPower.total * 100) : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>Hadir {summary?.manPower?.hadir || 0} orang</span>
                  <span>Total {summary?.manPower?.total || 0} personil</span>
                </div>
              </div>
            </div>

            {/* === Body: Two Sections === */}
            <div className="p-5 space-y-5">

              {/* --- Section 1: Ketidakhadiran & Izin --- */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-red-400 rounded-full"></div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Ketidakhadiran & Izin</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {[
                    { key: 'cuti', label: 'Cuti', icon: Calendar, color: 'amber', val: summary?.manPower?.detailed?.cuti || 0 },
                    { key: 'izin', label: 'Izin', icon: Info, color: 'orange', val: summary?.manPower?.detailed?.izin || 0 },
                    { key: 'sakit', label: 'Sakit', icon: Stethoscope, color: 'rose', val: summary?.manPower?.detailed?.sakit || 0 },
                    { key: 'referal', label: 'Referal', icon: UserCheck, color: 'purple', val: summary?.manPower?.detailed?.referal || 0 },
                    { key: 'absen', label: 'Alpha/Tanpa Keterangan', icon: UserX, color: 'slate', val: summary?.manPower?.detailed?.absen || 0 },
                  ].map(({ key, label, icon: Icon, color, val }) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedCategory(key); setShowCategoryModal(true); }}
                      className={`group relative bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-4 h-4 text-${color}-600`} />
                      </div>
                      <div className={`text-2xl font-extrabold text-slate-800 leading-tight`}>{val}</div>
                      <div className={`text-[9px] font-bold text-slate-500 uppercase tracking-wider`}>{label}</div>
                      {val > 0 && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* --- Divider --- */}
              <div className="border-t border-dashed border-slate-200" />

              {/* --- Section 2: Penugasan & Pengembangan --- */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Penugasan & Pengembangan</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: 'dinasDalamNegeri', label: 'Dinas Dalam Negeri', icon: PlaneTakeoff, color: 'sky', val: summary?.manPower?.detailed?.dinasDalamNegeri || 0 },
                    { key: 'dinasLuarNegeri', label: 'Dinas Luar Negeri', icon: Globe, color: 'indigo', val: summary?.manPower?.detailed?.dinasLuarNegeri || 0 },
                    { key: 'training', label: 'Training / Pelatihan', icon: GraduationCap, color: 'teal', val: summary?.manPower?.detailed?.training || 0 },
                  ].map(({ key, label, icon: Icon, color, val }) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedCategory(key); setShowCategoryModal(true); }}
                      className={`group relative bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left`}
                    >
                      <div className={`w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 text-${color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate`}>{label}</div>
                        <div className={`text-3xl font-extrabold text-slate-800 leading-tight`}>{val}</div>
                        <div className="text-[9px] text-gray-500">orang</div>
                      </div>
                      {val > 0 && (
                        <div className="shrink-0">
                          <div className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse`}></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Pemisah Monitoring Data SAP */}
          <div className="flex items-center justify-center gap-4 mt-8 mb-4">
            <div className="h-px bg-slate-300 flex-1"></div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 bg-gray-50">Monitoring Data SAP</span>
            <div className="h-px bg-slate-300 flex-1"></div>
          </div>

          {/* Work Order & Rekomendasi Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <KPICard
              icon={FileText}
              label="Work Order"
              value={summary?.kpi?.totalWO ? summary.kpi.totalWO.toLocaleString('id-ID') : '0'}
              unit="WO"
              trendValue="Real Time"
              trendDir="neutral"
              trendLabel="SAP Database"
              variant="blue"
            />
            <KPICard
              icon={CheckCircle2}
              label="Rekomendasi"
              value={summary?.kpi?.totalRek ? summary.kpi.totalRek.toLocaleString('id-ID') : '0'}
              unit="Notif"
              trendValue="Real Time"
              trendDir="neutral"
              trendLabel="SAP Database"
              variant="teal"
            />
          </div>

          {/* Visualisasi Tren WO vs Rekomendasi (12 Bulan) */}
          <div className="bg-white/90 backdrop-blur-md border border-white shadow-xl ring-1 ring-gray-100/50 rounded-2xl shadow-sm-subtle overflow-hidden">
            <div className="px-5 py-4 bg-white border-b border-gray-100 rounded-t-2xl">
              <h3 className="text-base font-bold text-slate-800">
                Tren Work Order vs Rekomendasi (12 Bulan)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Analisis tren historis beban pekerjaan dan notifikasi rekomendasi inspeksi selama satu tahun terakhir.
              </p>
            </div>

            <div className="p-6 min-h-[320px]">
              <Chart options={trendChartOptions} series={trendChartSeries} type="line" width="100%" height="320" />
            </div>
          </div>

          {/* Rekomendasi Table di Overview */}
          <div className="bg-white/90 backdrop-blur-md border border-white shadow-xl ring-1 ring-gray-100/50 rounded-2xl shadow-sm-subtle overflow-hidden mt-6">
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-700">
              <h4 className="text-sm font-bold text-white/90 flex items-center gap-2">
                <FileText size={16} />
                <span>Realisasi & Tindak Lanjut Rekomendasi (M04 & M07)</span>
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold text-center border-b border-slate-300">
                  <tr>
                    <th rowSpan="2" className="py-2 px-3 border border-slate-300 bg-slate-200 w-12">No</th>
                    <th rowSpan="2" className="py-2 px-3 border border-slate-300 bg-slate-200 text-left">Bagian</th>
                    <th className="py-2 px-3 border border-slate-300">Realisasi Rekomendasi (M04 & M07)</th>
                    <th colSpan="3" className="py-2 px-3 border border-slate-300">Tindak Lanjut Rekomendasi (System Status)</th>
                  </tr>
                  <tr className="text-[10px]">
                    <th className="py-2 px-3 border border-slate-300 whitespace-nowrap">
                      User Status<br /><span className="font-normal text-gray-500">MGR/NOPR/ORAS</span>
                    </th>
                    <th className="py-2 px-3 border border-slate-300 whitespace-nowrap">
                      Pending<br /><span className="font-normal text-gray-500">OSNO/NOPR</span>
                    </th>
                    <th className="py-2 px-3 border border-slate-300 whitespace-nowrap">
                      I/P<br /><span className="font-normal text-gray-500">NOPR ORAS</span>
                    </th>
                    <th className="py-2 px-3 border border-slate-300 whitespace-nowrap">
                      Selesai<br /><span className="font-normal text-gray-500">NOCO ORAS</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-center text-[11px] font-medium text-slate-700">
                  {(summary?.kpi?.rekomendasiTindakLanjut || []).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 border border-slate-200 bg-slate-50/50">{idx + 1}</td>
                      <td className="py-2 px-3 border border-slate-200 text-left font-bold whitespace-nowrap">{row.name}</td>
                      <td className="py-2 px-3 border border-slate-200">{row.userStatusCount ?? row.total}</td>
                      <td className="py-2 px-3 border border-slate-200">{row.pending}</td>
                      <td className="py-2 px-3 border border-slate-200">{row.ip}</td>
                      <td className="py-2 px-3 border border-slate-200">{row.selesai}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold text-slate-800">
                    <td colSpan="2" className="py-2.5 px-3 border border-slate-300 text-center">Jumlah Rekomendasi</td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center text-sm">
                      {(summary?.kpi?.rekomendasiTindakLanjut || []).reduce((acc, row) => acc + (row.userStatusCount ?? row.total), 0)}
                    </td>
                    <td colSpan="3" className="py-2.5 px-3 border border-slate-300 bg-white"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-slate-50 text-[10px] text-slate-600 border-t border-slate-200 leading-relaxed">
              Rekomendasi status Pending (OSNO/NOPR) telah ditindaklanjuti dengan submit surat dof ke Departemen Rendalhar 1 dan 2 serta ke Dept. Keandalan untuk ditindaklanjuti secara system ke eksekutor.
            </div>
          </div>



          {/* Work Order PM 02+ List (Overview) */}
          <div className="bg-white/90 backdrop-blur-md border border-white shadow-xl ring-1 ring-gray-100/50 rounded-2xl shadow-sm-subtle overflow-hidden mt-6">
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 rounded-t-2xl">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Work Order PM 02+</span>
                <span className="text-[10px] bg-white/20 text-white/90 font-semibold px-2.5 py-0.5 rounded-full">Corrective &amp; Other</span>
              </h4>
              <label className="flex items-center gap-2 text-ink text-xs font-semibold cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={hideCnfPm02Overview}
                  onChange={(e) => setHideCnfPm02Overview(e.target.checked)}
                  className="rounded border-white/30 text-ink focus:ring-0 cursor-pointer"
                />
                Sembunyikan Status 'CNF'
              </label>
            </div>

            <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
              {(summary?.jobLoadDetails?.pm02PlusProgress || []).map((wc, idx) => (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <h5 className="font-bold text-slate-800 text-xs uppercase">{wc.name}</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold">{wc.totalWO} WO</span>
                      <a
                        href={generateWAMessage(wc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-ink px-2 py-0.5 rounded text-[10px] font-bold transition-colors shadow-sm"
                        title="Bagikan data via WhatsApp"
                      >
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Share
                      </a>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-gray-500 font-bold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 whitespace-nowrap">Order</th>
                          <th className="py-2.5 px-4 min-w-[200px]">Description</th>
                          <th className="py-2.5 px-4 min-w-[150px]">Operation short text</th>
                          <th className="py-2.5 px-4 whitespace-nowrap">Notification Date</th>
                          <th className="py-2.5 px-4 whitespace-nowrap">Oper. System Status</th>
                          <th className="py-2.5 px-4 whitespace-nowrap">Equipment</th>
                          <th className="py-2.5 px-4 whitespace-nowrap">Maintenance Plant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(() => {
                          const listToRender = hideCnfPm02Overview
                            ? (wc.list || []).filter(wo => !(wo.status || '').toUpperCase().includes('CNF'))
                            : (wc.list || []);

                          if (listToRender.length === 0) {
                            return (
                              <tr>
                                <td colSpan="7" className="py-3 px-4 text-center text-gray-500 italic text-[11px]">
                                  {wc.list?.length > 0
                                    ? 'Semua Work Order di bagian ini sudah berstatus CNF.'
                                    : 'Tidak ada data Work Order PM 02+ di bagian ini pada bulan berjalan.'}
                                </td>
                              </tr>
                            );
                          }

                          return listToRender.map((wo, woIdx) => (
                            <tr key={woIdx} className={`transition-colors text-[11px] text-slate-700 ${(wo.status || '').toUpperCase().includes('CNF') ? 'bg-green-100 hover:bg-green-200' : 'hover:bg-orange-50/40'}`}>
                              <td className="py-2 px-4 font-mono font-bold text-industrial-navy">{wo.nomor_wo}</td>
                              <td className="py-2 px-4 leading-relaxed">{wo.description || '-'}</td>
                              <td className="py-2 px-4 leading-relaxed">{wo.operation_activity || '-'}</td>
                              <td className="py-2 px-4 whitespace-nowrap">
                                {wo.tanggal_dibuat ? new Date(wo.tanggal_dibuat).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                              </td>
                              <td className="py-2 px-4">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getWoStatusColor(wo.status)}`}>
                                  {wo.status || '-'}
                                </span>
                              </td>
                              <td className="py-2 px-4 font-mono text-slate-600">{wo.equipment || '-'}</td>
                              <td className="py-2 px-4 font-bold text-slate-700">{wo.pabrik_name || '-'}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {(!summary?.jobLoadDetails?.pm02PlusProgress || summary.jobLoadDetails.pm02PlusProgress.length === 0) && (
                <div className="text-center text-gray-500 py-6 italic text-sm border-2 border-dashed border-slate-200 rounded-2xl">Belum ada data PM 02+ untuk bulan berjalan.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* JOB LOAD TAB CONTENT */}
      {activeTab === 'jobload' && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-4 rounded-t-2xl shadow-sm text-slate-800 border border-slate-200">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
                <span>Job Load & Progress Inspeksi Work Order</span>
                <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Real Time Data
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Monitoring beban kerja (WO), capaian konfirmasi (CNF %), serta distribusi berdasarkan status dan tipe PM di tiap Unit Bagian (Work Center).
              </p>
            </div>

            {/* Interactive Formula & Status Legend Popover Button */}
            <div className="relative group shrink-0 z-[100]">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Info size={14} className="text-indigo-600" />
                <span>Petunjuk Rumus & Status CNF</span>
              </button>

              {/* Hover & Click Popover Tooltip */}
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 bg-white text-slate-800 rounded-2xl shadow-xl border border-gray-200 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none transition-all duration-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                    <Info size={14} className="text-indigo-600" /> Petunjuk Capaian CNF %
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200">SQL / SAP</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 text-[11px] leading-relaxed">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Formulasi Capaian CNF:</div>
                  <div className="font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm leading-relaxed">
                    CNF % = <span className="text-emerald-600 font-bold">SUM('CNF'/'TECO' TANPA 'PCNF')</span> ÷ <span className="text-amber-600 font-bold">SUM(BUKAN 'CRTD')</span> × 100%
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Keterangan Kode Status SAP:</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="truncate text-slate-700 font-medium">CNF TECO</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                      <span className="truncate text-slate-700 font-medium">CNF REL</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
                      <span className="truncate text-slate-700 font-medium">TECO</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                      <span className="truncate text-slate-700 font-medium">CRTD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Row: 3 Integrated Columns (Scorecard + Progress Bar) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Column 1: Total Work Order (Semua WO) */}
            <div className="flex flex-col gap-3">
              <div className="bg-[#0A337A] text-white rounded-2xl shadow-lg border border-blue-800 px-5 pt-5 pb-0 relative overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <FileText className="w-5 h-5 text-white/80" />
                    </div>
                    <div className="text-sm font-semibold text-white/80">Total Work Order</div>
                  </div>
                </div>
                <div className="flex items-end gap-2 mt-6">
                  <div className="text-[40px] font-display font-bold text-white tracking-tight leading-none">{summary?.kpi?.totalWO ? summary.kpi.totalWO.toLocaleString('id-ID') : '0'}</div>
                  <div className="text-sm text-white/60 font-semibold mb-1">WO</div>
                </div>
                <div className="mt-4 h-16 w-full">
                  <Sparkline data={summary?.sparklines?.totalWo} color="rgba(255,255,255,0.4)" height={64} strokeWidth={2} />
                </div>
              </div>
              <div className="px-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800">Progress CNF semua WO</h4>
                  <span className="text-xs font-extrabold text-blue-700">{summary?.jobLoadDetails?.gauges?.allWOCnfRate || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-700 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(summary?.jobLoadDetails?.gauges?.allWOCnfRate || 0, 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-500 text-center mt-1.5">% Persentase CNF real</p>
              </div>
            </div>

            {/* Column 2: Total Work Order PM 04 */}
            <div className="flex flex-col gap-3">
              <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white rounded-2xl shadow-lg border border-orange-600 px-5 pt-5 pb-0 relative overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <HardHat className="w-5 h-5 text-white/80" />
                    </div>
                    <div className="text-sm font-semibold text-white/80">Total Work Order PM 04</div>
                  </div>
                </div>
                <div className="flex items-end gap-2 mt-6">
                  <div className="text-[40px] font-display font-bold text-white tracking-tight leading-none">{summary?.kpi?.pm04Count ? summary.kpi.pm04Count.toLocaleString('id-ID') : '0'}</div>
                  <div className="text-sm text-white/60 font-semibold mb-1">WO</div>
                </div>
                <div className="mt-4 h-16 w-full">
                  <Sparkline data={summary?.sparklines?.pm04} color="rgba(255,255,255,0.4)" height={64} strokeWidth={2} />
                </div>
              </div>
              <div className="px-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800">Progress PM04</h4>
                  <span className="text-xs font-extrabold text-orange-600">{summary?.jobLoadDetails?.gauges?.pm04CnfRate || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(summary?.jobLoadDetails?.gauges?.pm04CnfRate || 0, 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-500 text-center mt-1.5">% Persentase CNF real</p>
              </div>
            </div>

            {/* Column 3: Total Work Order PM02+ */}
            <div className="flex flex-col gap-3">
              <div className="bg-[#1A1C1E] text-white rounded-2xl shadow-lg border border-[#333333] px-5 pt-5 pb-0 relative overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <button
                        onClick={() => setShowPm02PlusModal(true)}
                        className="flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                        title="Klik detail rincian PM01-PM10 (Selain PM 04)"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-sm font-semibold text-white/80">Total Work Order PM02+</div>
                  </div>
                </div>
                <div className="flex items-end gap-2 mt-6">
                  <div className="text-[40px] font-display font-bold text-white tracking-tight leading-none">{summary?.kpi?.pm02PlusCount ? summary.kpi.pm02PlusCount.toLocaleString('id-ID') : '0'}</div>
                  <div className="text-sm text-white/60 font-semibold mb-1">WO</div>
                </div>
                <div className="mt-4 h-16 w-full">
                  <Sparkline data={summary?.sparklines?.pm02Plus} color="rgba(255,255,255,0.2)" height={64} strokeWidth={2} />
                </div>
              </div>
              <div className="px-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    Progress PM02+ <Info className="w-3 h-3 text-gray-400" />
                  </h4>
                  <span className="text-xs font-extrabold text-[#1A1C1E]">{summary?.jobLoadDetails?.gauges?.pm02PlusCnfRate || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1A1C1E] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(summary?.jobLoadDetails?.gauges?.pm02PlusCnfRate || 0, 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-500 text-center mt-1.5">% Persentase CNF real</p>
              </div>
            </div>

          </div>
          {/* Middle Row: Side-by-Side Breakdown Tables — Enterprise Blue Progress Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Progress PM04 Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <h4 className="text-[15px] font-bold text-[#0F172A]">Progress PM04</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="border-b border-gray-100">
                    <tr className="text-gray-500 font-semibold text-[11px] bg-white">
                      <th className="py-3 px-5">Bagian</th>
                      <th className="py-3 px-5">Tipe</th>
                      <th className="py-3 px-5">Total WO</th>
                      <th className="py-3 px-5 w-40"></th>
                      <th className="py-3 px-5 text-right">Capaian CNF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(summary?.jobLoadDetails?.pm04Progress || []).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-700">{row.name}</td>
                        <td className="py-3.5 px-5 text-gray-500">{row.tipe}</td>
                        <td className="py-3.5 px-5 text-slate-700 font-medium">{row.totalWO.toLocaleString('id-ID')}</td>
                        <td className="py-3.5 px-5">
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1A4BC4] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(row.capaianCNF || 0, 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                            row.capaianCNF >= 90 ? 'bg-green-50 text-green-700' :
                            row.capaianCNF >= 85 ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {row.capaianCNF ? `${row.capaianCNF.toFixed(2)}%` : '0%'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Progress PM02+ Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <h4 className="text-[15px] font-bold text-[#0F172A]">Progress PM02+</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="border-b border-gray-100">
                    <tr className="text-gray-500 font-semibold text-[11px] bg-white">
                      <th className="py-3 px-5">Bagian</th>
                      <th className="py-3 px-5">Tipe</th>
                      <th className="py-3 px-5">Total WO</th>
                      <th className="py-3 px-5 w-40"></th>
                      <th className="py-3 px-5 text-right">Capaian CNF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(summary?.jobLoadDetails?.pm02PlusProgress || []).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-700">{row.name}</td>
                        <td className="py-3.5 px-5 text-gray-500">{row.tipe}</td>
                        <td className="py-3.5 px-5 text-slate-700 font-medium">{row.totalWO.toLocaleString('id-ID')}</td>
                        <td className="py-3.5 px-5">
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1A4BC4] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(row.capaianCNF || 0, 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                            row.capaianCNF >= 90 ? 'bg-green-50 text-green-700' :
                            row.capaianCNF >= 85 ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {row.capaianCNF ? `${row.capaianCNF.toFixed(2)}%` : '0%'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side-by-Side Distribution Bar Charts with Background Color Headers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
            {/* Distribusi Status WO per Bagian */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-5 bg-white border-b border-gray-100 flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Factory className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#0F172A]">Distribusi Work Order</h4>
                  <p className="text-xs text-gray-500 mt-1">(Berdasarkan status WO)</p>
                </div>
              </div>
              <div className="p-5 flex-1 min-h-[280px]">
                <Chart
                  options={statusDistChartOptions}
                  series={summary?.jobLoadDetails?.statusDistribution?.series || []}
                  type="bar"
                  width="100%"
                  height="280"
                />
              </div>
            </div>

            {/* Distribusi Tipe PM per Bagian */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-5 bg-white border-b border-gray-100 flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Factory className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#0F172A]">Distribusi Work Order</h4>
                  <p className="text-xs text-gray-500 mt-1">(Berdasarkan Tipe WO)</p>
                </div>
              </div>
              <div className="p-5 flex-1 min-h-[280px]">
                <Chart
                  options={pmTypeDistChartOptions}
                  series={summary?.jobLoadDetails?.pmTypeDistribution?.series || []}
                  type="bar"
                  width="100%"
                  height="280"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CHART SEGMENT CLICK SUMMARY MODAL */}
      {selectedSegment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedSegment(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-navy-950 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Detail Ringkasan Segment Bar Chart</div>
                <h3 className="text-lg font-display font-bold flex items-center gap-2 mt-0.5">
                  <span>{selectedSegment.category}</span>
                  <span className="text-xs bg-white/20 text-ink font-semibold px-2.5 py-0.5 rounded-full">
                    {selectedSegment.seriesName}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedSegment(null)}
                className="text-gray-500 hover:text-ink bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 text-center">
                  <div className="text-[11px] font-semibold text-gray-500">Jumlah {selectedSegment.seriesName}</div>
                  <div className="text-2xl font-display font-extrabold text-industrial-blue mt-1">{selectedSegment.value.toLocaleString('id-ID')}</div>
                  <div className="text-[10px] text-navy-600 font-medium mt-0.5">Bar Segment Terpilih</div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 text-center">
                  <div className="text-[11px] font-semibold text-gray-500">Porsi di {selectedSegment.category}</div>
                  <div className="text-2xl font-display font-extrabold text-emerald-700 mt-1">{selectedSegment.categoryPercentage}%</div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">dari {selectedSegment.totalCategory.toLocaleString('id-ID')} Total Item</div>
                </div>

                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3.5 text-center col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold text-gray-500">Total Kategori {selectedSegment.category}</div>
                  <div className="text-2xl font-display font-extrabold text-purple-700 mt-1">{selectedSegment.totalCategory.toLocaleString('id-ID')}</div>
                  <div className="text-[10px] text-purple-600 font-medium mt-0.5">Keseluruhan Item</div>
                </div>
              </div>

              {/* Full Breakdown Table for the Selected Category */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Komposisi Lengkap pada "{selectedSegment.category}"
                  </h4>
                  <span className="text-[11px] text-gray-500 font-medium">Total: {selectedSegment.totalCategory} Item</span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3 text-right">Jumlah (Count)</th>
                        <th className="py-2.5 px-3 text-right">Persentase (%)</th>
                        <th className="py-2.5 px-3 text-center">Visual Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSegment.breakdown.map((item, idx) => {
                        const isSelected = item.label === selectedSegment.seriesName;
                        return (
                          <tr key={idx} className={isSelected ? "bg-blue-50/70 font-bold text-industrial-blue" : "hover:bg-slate-50 text-slate-700"}>
                            <td className="py-2.5 px-3 flex items-center gap-2">
                              {isSelected && <span className="w-2 h-2 rounded-full bg-navy-600"></span>}
                              <span>{item.label}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold">{item.count.toLocaleString('id-ID')}</td>
                            <td className="py-2.5 px-3 text-right font-bold">{item.percentage}%</td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isSelected ? 'bg-industrial-blue' : 'bg-slate-400'}`}
                                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">Klik di luar modal untuk menutup.</span>
              <button
                onClick={() => setSelectedSegment(null)}
                className="px-4 py-2 bg-navy-600 text-white text-xs font-bold rounded-2xl shadow hover:bg-industrial-navy transition-colors cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MANPOWER PERSONNEL DETAILS MODAL */}
      {selectedManpowerType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedManpowerType(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 text-ink flex items-center justify-between shrink-0 ${selectedManpowerType === 'Organik' ? 'bg-navy-950' : selectedManpowerType === 'Non Organik' ? 'bg-emerald-800' : 'bg-industrial-navy'
              }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl text-ink ${selectedManpowerType === 'Organik' ? 'bg-white/90 backdrop-blur-md border border-white shadow-xl ring-1 ring-gray-100/50' : selectedManpowerType === 'Non Organik' ? 'bg-emerald-700 border border-emerald-600' : 'bg-navy-600'
                  }`}>
                  <HardHat size={22} className={selectedManpowerType === 'Non Organik' ? 'text-emerald-300' : 'text-white'} />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Informasi Personil &amp; Status Kehadiran Real-Time
                  </div>
                  <h3 className="text-lg font-display font-bold flex items-center gap-2 mt-0.5">
                    <span>
                      {selectedManpowerType === 'ALL' ? 'Seluruh Personil (Organik & Non-Organik)' : `Daftar Personil ${selectedManpowerType}`}
                    </span>
                    <span className="text-xs bg-white/20 text-ink font-bold px-2.5 py-0.5 rounded-full">
                      {filteredManpower.length} Personil
                    </span>
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedManpowerType(null)}
                className="text-gray-500 hover:text-ink bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari Nama, NPK, Jabatan, Divisi..."
                  value={mpSearch}
                  onChange={(e) => setMpSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-2xl text-xs focus:outline-none focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <div className="flex items-center bg-slate-200 p-0.5 rounded-2xl text-xs font-bold">
                  <button
                    onClick={() => setMpStatusFilter('ALL')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${mpStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Semua ({typeFilteredManpower.length})
                  </button>
                  <button
                    onClick={() => setMpStatusFilter('Hadir')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${mpStatusFilter === 'Hadir' ? 'bg-emerald-600 text-ink shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Hadir ({typeFilteredManpower.filter(p => p.statusToday === 'Hadir').length})
                  </button>
                  <button
                    onClick={() => setMpStatusFilter('Absen')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${mpStatusFilter === 'Absen' ? 'bg-amber-600 text-ink shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Absen/Cuti ({typeFilteredManpower.filter(p => p.statusToday !== 'Hadir').length})
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body / Table */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {loadingManpower ? (
                <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-2">
                  <Loader2 size={24} className="animate-spin text-industrial-blue" />
                  <span className="text-xs font-semibold">Memuat data personil...</span>
                </div>
              ) : filteredManpower.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs font-semibold">
                  Tidak ada personil yang sesuai dengan kriteria pencarian/filter.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">NPK</th>
                        <th className="py-3 px-4">Nama Personil</th>
                        <th className="py-3 px-4">Status SDM</th>
                        <th className="py-3 px-4">Jabatan</th>
                        <th className="py-3 px-4 text-center">Status Kehadiran Hari Ini</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredManpower.map((p) => {
                        const isOrganik = (p.employee_type || '').toLowerCase().includes('organik') && !(p.employee_type || '').toLowerCase().includes('non');
                        const isHadir = p.statusToday === 'Hadir';
                        const rank = getRoleRank(p);

                        let rowBg = 'hover:bg-slate-50';
                        if (rank === 1) rowBg = 'bg-amber-200/40 hover:bg-amber-300/40'; // Manager Level
                        else if (rank === 2) rowBg = 'bg-yellow-100/80 hover:bg-yellow-200/60'; // AVP Level
                        else if (rank === 3) rowBg = 'bg-slate-100/70 hover:bg-slate-200/70'; // Organik
                        else if (rank === 4) rowBg = 'bg-blue-50/70 hover:bg-blue-100/70'; // Non Organik

                        return (
                          <tr key={p.id} className={`transition-colors border-b border-slate-100 ${rowBg}`}>
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-600">{p.npk}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-900">{p.name}</td>
                            <td className="py-2.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isOrganik ? 'bg-[#0F2052] text-white/90 shadow-sm' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                <HardHat size={12} className={isOrganik ? 'text-white' : 'text-emerald-700'} />
                                {p.employee_type}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 font-medium">{p.position || '-'}</td>
                            <td className="py-2.5 px-4 text-center">
                              {isHadir ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <UserCheck size={12} /> Hadir
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300" title={p.keterangan}>
                                  <UserX size={12} /> {p.statusToday} {p.keterangan ? `(${p.keterangan})` : ''}
                                </span>
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

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-4 text-slate-600 font-medium text-[11px]">
                <span>Total: <strong className="text-slate-900">{typeFilteredManpower.length}</strong> Personil</span>
                <span>Hadir: <strong className="text-emerald-700">{typeFilteredManpower.filter(p => p.statusToday === 'Hadir').length}</strong></span>
                <span>Absen/Cuti: <strong className="text-amber-700">{typeFilteredManpower.filter(p => p.statusToday !== 'Hadir').length}</strong></span>
              </div>
              <button
                onClick={() => setSelectedManpowerType(null)}
                className="px-4 py-2 bg-navy-950 hover:bg-slate-900 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PM02+ BREAKDOWN DETAIL MODAL */}
      {showPm02PlusModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowPm02PlusModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-emerald-600 text-ink px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-100 font-bold">Rincian Detail Tipe Work Order</div>
                <h3 className="text-lg font-display font-bold flex items-center gap-2 mt-0.5">
                  <FileText className="w-5 h-5" />
                  <span>Breakdown PM 02+ (Selain PM04)</span>
                </h3>
              </div>
              <button
                onClick={() => setShowPm02PlusModal(false)}
                className="text-emerald-100 hover:text-ink bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Subheader KPI */}
            <div className="bg-emerald-50/70 p-4 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-3">
              <div>
                <div className="text-[11px] font-bold text-emerald-900">Total Work Order PM 02+</div>
                <p className="text-[10px] text-emerald-700">Akumulasi seluruh tipe pemeliharaan selain PM04 (Predictive)</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer bg-white/60 px-3 py-1.5 rounded-2xl border border-emerald-200 shadow-sm transition-all hover:bg-white">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    checked={hideCnfPm02}
                    onChange={(e) => setHideCnfPm02(e.target.checked)}
                  />
                  <span className={hideCnfPm02 ? 'text-emerald-700 font-bold' : 'text-slate-600'}>Sembunyikan Status 'CNF/TECO'</span>
                </label>
                <div className="text-2xl font-display font-extrabold text-emerald-800">
                  {hideCnfPm02
                    ? (summary?.kpi?.pm02PlusCountNonCNF ? summary.kpi.pm02PlusCountNonCNF.toLocaleString('id-ID') : '0')
                    : (summary?.kpi?.pm02PlusCount ? summary.kpi.pm02PlusCount.toLocaleString('id-ID') : '0')
                  } <span className="text-xs font-medium text-emerald-600">WO</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="text-xs text-gray-500 font-medium">
                Berikut rincian jumlah Work Order berdasarkan klasifikasi tipe PM di database:
              </div>

              <div className="grid grid-cols-1 gap-3">
                {Object.entries(hideCnfPm02 ? (summary?.kpi?.pmBreakdownNonCNF || {}) : (summary?.kpi?.pmBreakdown || {}))
                  .filter(([pmType]) => pmType !== 'PM04')
                  .map(([pmType, count]) => {
                    const totalPm02Plus = hideCnfPm02 ? (summary?.kpi?.pm02PlusCountNonCNF || 1) : (summary?.kpi?.pm02PlusCount || 1);
                    const percent = totalPm02Plus > 0 ? ((count / totalPm02Plus) * 100).toFixed(1) : '0';
                    const pmDescriptions = {
                      'PM01': 'Routine & Operational Maintenance (Pemeliharaan Rutin)',
                      'PM02': 'Corrective Maintenance & Overhaul (Perbaikan Kerusakan)',
                      'PM03': 'Preventive Maintenance (Pemeriksaan Berkala)',
                      'PM05': 'Project & Inspection Maintenance (Inspeksi Khusus/Proyek)',
                      'PM06': 'Safety & Environmental Maintenance (K3 & Lingkungan)',
                      'PM07': 'Calibration & Quality Assurance (Kalibrasi & Mutu)',
                      'PM08': 'Third-Party & External Services (Jasa Pihak Ketiga)',
                      'PM09': 'Modification & Engineering Improvement (Modifikasi/Penyempurnaan)',
                      'PM10': 'General & Uncategorized Orders (Pekerjaan Umum/Lainnya)'
                    };
                    const desc = pmDescriptions[pmType] || 'Pekerjaan Pemeliharaan';
                    const hasData = count > 0;

                    return (
                      <div
                        key={pmType}
                        className={`p-3.5 rounded-xl border transition-all ${hasData ? 'bg-white border-slate-200 shadow-xs hover:border-emerald-300' : 'bg-slate-50/60 border-slate-100 opacity-60'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2.5 py-1 rounded-2xl font-mono font-bold text-xs ${hasData ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                              }`}>
                              {pmType}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{desc}</div>
                              <div className="text-[10px] text-gray-500 font-mono">Tipe PM SAP: {pmType}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-extrabold text-slate-900">{count.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-gray-500">WO</span></div>
                            <div className="text-[10px] font-bold text-emerald-600">{percent}%</div>
                          </div>
                        </div>

                        {/* Progress Bar Mini */}
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${hasData ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            style={{ width: `${Math.min(parseFloat(percent), 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-[11px] text-gray-500">
                Total Kategori Terdata: <strong className="text-slate-900">9 Tipe PM (PM01-PM10 eksklusif PM04)</strong>
              </span>
              <button
                onClick={() => setShowPm02PlusModal(false)}
                className="px-4 py-2 bg-white hover:bg-[#0A1B3F] hover:text-white/90 text-[#0A1B3F] border border-gray-200 shadow-sm text-xs font-bold rounded-2xl transition-colors cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERFORMANCE KILLER TAB CONTENT */}
      {activeTab === 'performance_killer' && (() => {
        // Prepare chart data
        const pkGrouped = performanceKillers.reduce((acc, curr) => {
          acc[curr.area_plant] = (acc[curr.area_plant] || 0) + 1;
          return acc;
        }, {});
        
        const pkCategories = Object.keys(pkGrouped);
        const pkData = Object.values(pkGrouped);
        
        const topArea = pkCategories.length > 0 ? pkCategories[pkData.indexOf(Math.max(...pkData))] : '-';
        const maxIssues = pkData.length > 0 ? Math.max(...pkData) : 0;

        const pkBarChart = {
          series: [{ name: 'Jumlah Item (Masalah)', data: pkData }],
          options: {
            chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans, sans-serif' },
            plotOptions: { 
              bar: { borderRadius: 4, horizontal: false, columnWidth: '45%', distributed: true } 
            },
            dataLabels: { enabled: true, style: { fontSize: '14px', fontWeight: 'bold' }, offsetY: -20 },
            xaxis: { categories: pkCategories, labels: { style: { fontWeight: 600 } } },
            colors: ['#8B0000', '#B91C1C', '#C2410C', '#B45309', '#1D4ED8', '#0F766E', '#4338CA', '#A21CAF'],
            title: { text: 'Distribusi per Area/Plant', style: { color: '#1E293B', fontSize: '13px', fontWeight: 'bold' } },
            legend: { show: false },
            grid: { strokeDashArray: 4 }
          }
        };

        const pkDonutChart = {
          series: pkData,
          options: {
            chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans, sans-serif' },
            labels: pkCategories,
            colors: ['#8B0000', '#B91C1C', '#C2410C', '#B45309', '#1D4ED8', '#0F766E', '#4338CA', '#A21CAF'],
            plotOptions: {
              pie: {
                donut: {
                  size: '70%',
                  labels: {
                    show: true,
                    name: { show: true, fontSize: '12px', color: '#64748B' },
                    value: { show: true, fontSize: '20px', fontWeight: 'bold', color: '#1E293B' },
                    total: {
                      show: true,
                      label: 'Total Masalah',
                      formatter: function (w) {
                        return w.globals.seriesTotals.reduce((a, b) => { return a + b }, 0)
                      }
                    }
                  }
                }
              }
            },
            title: { text: 'Proporsi Masalah per Area/Plant', style: { color: '#1E293B', fontSize: '13px', fontWeight: 'bold' } },
            legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '11px', markers: { radius: 12 } },
            stroke: { width: 1, colors: ['#ffffff'] },
            dataLabels: { enabled: false }
          }
        };

        return (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KPICard
                icon={AlertTriangle}
                label="Total Performance Killer"
                value={performanceKillers.length.toString()}
                unit="Item"
                trendValue="Real Time"
                trendDir="neutral"
                trendLabel="Database"
                variant="orange"
              />
              <KPICard
                icon={Factory}
                label="Area/Plant Terdampak"
                value={pkCategories.length.toString()}
                unit="Area"
                trendValue="Distribusi"
                trendDir="neutral"
                trendLabel="Lokasi Pabrik"
                variant="blue"
              />
              <KPICard
                icon={FileText}
                label="Tindak Lanjut Berjalan"
                value={performanceKillers.filter(pk => pk.tindak_lanjut).length.toString()}
                unit="Tindakan"
                trendValue="On Progress"
                trendDir="up"
                trendLabel="Mitigasi Masalah"
                variant="teal"
              />
              <KPICard
                icon={TrendingUp}
                label="Area Terbanyak"
                value={topArea}
                unit={`${maxIssues} Item`}
                trendValue="Highest"
                trendDir="down"
                trendLabel="Perhatian Khusus"
                variant="rose"
              />
            </div>

            {/* Data Table Section */}
            <div className="bg-white/90 backdrop-blur-md border border-white shadow-xl ring-1 ring-gray-100/50 rounded-2xl shadow-sm-subtle overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  <span>Daftar Detail Performance Killer</span>
                </h4>
                <div className="flex items-center gap-3">
                  {!showAiInsights && (
                    <button onClick={handleGenerateAi} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm text-sm group cursor-pointer">
                      <BrainCircuit size={16} className="group-hover:animate-pulse" />
                      <span>AI Insights</span>
                    </button>
                  )}
                  <Link to="/performance-killer" className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-2xl transition-colors shadow-sm text-sm">
                    <Edit size={16} />
                    <span>Akses Edit (CRUD)</span>
                  </Link>
                </div>
              </div>

              {/* AI Insights Panel */}
              {showAiInsights && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 px-6 py-5 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Brain size={120} />
                  </div>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-md">
                      {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-orange-900 flex items-center gap-2">
                          Analisis AI (Antigravity Assistant)
                        </h5>
                        <button onClick={() => setShowAiInsights(false)} className="text-orange-400 hover:text-orange-700 cursor-pointer p-1">
                          <X size={16} />
                        </button>
                      </div>
                      
                      {isAiLoading ? (
                        <div className="space-y-2.5 animate-pulse mt-3">
                          <div className="h-4 bg-orange-200/50 rounded-md w-3/4"></div>
                          <div className="h-4 bg-orange-200/50 rounded-md w-full"></div>
                          <div className="h-4 bg-orange-200/50 rounded-md w-5/6"></div>
                        </div>
                      ) : (
                        <div className="text-[13px] text-orange-950/90 leading-relaxed space-y-3">
                          <p>
                            Berdasarkan data <strong>{performanceKillers.length} Performance Killers</strong> saat ini, mayoritas masalah terpusat pada <strong>{topArea || 'area operasional'}</strong> dengan indikasi tren anomali <span className="font-bold text-red-600">temperatur dan vibrasi tinggi</span> pada mesin <em>rotating equipment</em>.
                          </p>
                          <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong>Rekomendasi Mitigasi:</strong> Jadwalkan segera <em>Overhaul (OH)</em> atau perbaikan <em>rotor/gearbox</em> pada periode <em>Shut Down/Turn Around (SDI/TA)</em> terdekat untuk equipment dengan vibrasi &gt; 40 micron.</li>
                            <li><strong>Perhatian Khusus:</strong> Evaluasi struktural pada fasilitas berisiko korosi tinggi dengan sisa perkiraan umur pakai terbatas (&lt;5 tahun) berdasarkan <em>assessment</em> institusi terkait.</li>
                          </ul>
                          <p className="text-[11px] text-orange-700/70 italic mt-3 flex items-center gap-1.5 font-medium border-t border-orange-200/50 pt-3">
                            <Info size={12} />
                            Insight ini dibuat secara dinamis menggunakan analisis pola deskripsi masalah dan status tindak lanjut.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-4 px-5 border-b border-slate-200 bg-slate-50 w-12 text-center text-xs">No</th>
                      <th className="py-4 px-5 border-b border-slate-200 bg-slate-50 text-xs">Item</th>
                      <th className="py-4 px-5 border-b border-slate-200 bg-slate-50 text-xs">Plant</th>
                      <th className="py-4 px-5 border-b border-slate-200 bg-slate-50 text-xs w-[35%]">Masalah (Problem)</th>
                      <th className="py-4 px-5 border-b border-slate-200 bg-slate-50 text-xs w-[35%]">Tindak Lanjut (Mitigation)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px] font-medium text-slate-700">
                    {performanceKillers.length > 0 ? (
                      performanceKillers.map((pk, idx) => (
                        <tr key={pk.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-4 px-5 text-center font-bold text-slate-500 bg-slate-50/30">{idx + 1}</td>
                          <td className="py-4 px-5 font-bold text-[#193B8F] text-sm align-top">{pk.item}</td>
                          <td className="py-4 px-5 align-top">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
                              {pk.area_plant}
                            </span>
                          </td>
                          <td className="py-4 px-5 align-top leading-relaxed text-slate-700">
                            <div className="flex items-start gap-2.5">
                              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                              <div dangerouslySetInnerHTML={{ __html: pk.masalah }} className="prose prose-sm prose-slate max-w-none text-[13px]" />
                            </div>
                          </td>
                          <td className="py-4 px-5 align-top leading-relaxed text-slate-700">
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div dangerouslySetInnerHTML={{ __html: pk.tindak_lanjut }} className="prose prose-sm prose-slate max-w-none text-[13px]" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-gray-500 italic text-sm bg-slate-50">Tidak ada data Performance Killer.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/90 backdrop-blur-md border border-white shadow-xl ring-1 ring-gray-100/50 rounded-2xl shadow-sm-subtle p-5">
                {performanceKillers.length > 0 ? (
                  <div className="h-[350px]">
                    <Chart options={pkBarChart.options} series={pkBarChart.series} type="bar" height="100%" />
                  </div>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-gray-500 italic text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Belum ada data untuk ditampilkan.
                  </div>
                )}
              </div>
              
              <div className="bg-white/90 backdrop-blur-md border border-white shadow-xl ring-1 ring-gray-100/50 rounded-2xl shadow-sm-subtle p-5 flex flex-col items-center justify-center">
                {performanceKillers.length > 0 ? (
                  <div className="w-full h-[350px]">
                    <Chart options={pkDonutChart.options} series={pkDonutChart.series} type="donut" height="100%" />
                  </div>
                ) : (
                  <div className="h-[350px] w-full flex items-center justify-center text-gray-500 italic text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Belum ada data untuk ditampilkan.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== CATEGORY DETAIL MODAL (Manpower per Kategori) ===== */}
      {showCategoryModal && selectedCategory && (() => {
        const categoryLabels = {
          cuti: { label: 'Cuti', color: 'amber' },
          izin: { label: 'Izin', color: 'orange' },
          sakit: { label: 'Sakit / Referal', color: 'rose' },
          referal: { label: 'Referal', color: 'purple' },
          absen: { label: 'Alpha / Tanpa Keterangan', color: 'slate' },
          dinasDalamNegeri: { label: 'Dinas Dalam Negeri', color: 'sky' },
          dinasLuarNegeri: { label: 'Dinas Luar Negeri', color: 'indigo' },
          training: { label: 'Training / Pelatihan', color: 'teal' },
        };
        const catInfo = categoryLabels[selectedCategory] || { label: selectedCategory, color: 'slate' };
        const lists = summary?.manPower?.detailed?.lists || {};
        const personilList = lists[selectedCategory] || [];
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCategoryModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`px-5 py-4 bg-${catInfo.color}-600 flex items-center justify-between`}>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Detail Personil</div>
                  <h3 className="text-base font-extrabold text-ink">{catInfo.label}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{personilList.length} orang tercatat hari ini</p>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={14} className="text-ink" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 p-4">
                {personilList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Tidak ada data personil</p>
                    <p className="text-xs mt-1">Kategori ini kosong untuk hari ini</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {personilList.map((p, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl bg-${catInfo.color}-50 border border-${catInfo.color}-100`}>
                        <div className={`w-9 h-9 rounded-full bg-${catInfo.color}-200 flex items-center justify-center font-extrabold text-${catInfo.color}-700 text-sm shrink-0`}>
                          {(p.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate">{p.name || 'N/A'}</div>
                          <div className="text-[10px] text-gray-500">{p.npk || ''} {p.position ? `• ${p.position}` : ''}</div>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${(p.employee_type || '').toLowerCase().includes('non') ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {(p.employee_type || '').toLowerCase().includes('non') ? 'Non-Org' : 'Organik'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 bg-white hover:bg-[#0A1B3F] hover:text-white/90 text-[#0A1B3F] border border-gray-200 shadow-sm text-xs font-bold rounded-2xl transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Expired Certifications Modal */}
      {showExpiredCertsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Sertifikasi Personil Expired</h3>
                  <p className="text-[11px] text-gray-500">Daftar sertifikat yang masa berlakunya telah habis</p>
                </div>
              </div>
              <button
                onClick={() => setShowExpiredCertsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-0 max-h-[60vh] overflow-y-auto">
              {summary?.expiredCertifications && summary.expiredCertifications.length > 0 ? (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Nama Personil</th>
                      <th className="px-4 py-3 font-semibold">NPK</th>
                      <th className="px-4 py-3 font-semibold">Sertifikat</th>
                      <th className="px-4 py-3 font-semibold">Tgl Expired</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.expiredCertifications.map(cert => (
                      <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">{cert.man_power_name}</td>
                        <td className="px-4 py-3 text-gray-500">{cert.man_power_npk}</td>
                        <td className="px-4 py-3 text-slate-700">{cert.nama_sertifikat}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 font-medium">
                            {new Date(cert.tanggal_berakhir).toLocaleDateString('id-ID', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                  <p className="font-semibold text-sm">Semua Aman!</p>
                  <p className="text-xs">Tidak ada sertifikat personil yang expired.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowExpiredCertsModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}






