import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { 
  Sparkles, AlertTriangle, ShieldCheck, Activity, 
  Calendar, ChevronLeft, ChevronRight, FileText, CheckCircle2,
  HelpCircle, X, Info, Layers, Wrench, Factory
} from 'lucide-react';
import { 
  getAISummary, getRepeatedFailures, getEquipmentRanking, 
  getWorkCenterRanking, getRootCauseDistribution,
  getHealthScore, getExecutiveDashboard 
} from '../../services/aiInsightService';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Official 7 Unit Plants
const PLANT_OPTIONS = [
  { code: 'ALL', name: 'Semua Pabrik (P1A - P7)' },
  { code: 'P1A', name: 'Pabrik 1A' },
  { code: 'P2', name: 'Pabrik 2' },
  { code: 'P3', name: 'Pabrik 3' },
  { code: 'P4', name: 'Pabrik 4' },
  { code: 'P5', name: 'Pabrik 5' },
  { code: 'P6', name: 'Pabrik 6' },
  { code: 'P7', name: 'Pabrik 7' },
];

export default function AIInsightView() {
  const currentMonthIdx = new Date().getMonth();
  const currentYearNum = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthIdx);
  const [selectedYear, setSelectedYear] = useState(currentYearNum);
  const [selectedPlant, setSelectedPlant] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [summaryData, setSummaryData] = useState(null);
  const [repeatedData, setRepeatedData] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [workCenterData, setWorkCenterData] = useState([]);
  const [rootCauseData, setRootCauseData] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [execDashboard, setExecDashboard] = useState(null);

  // State for Explainability Modal ("Why?")
  const [selectedExplainable, setSelectedExplainable] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      const mParam = selectedMonth + 1;

      try {
        const [sumRes, repRes, rankRes, wcRes, rcRes, healthRes, execRes] = await Promise.all([
          getAISummary(selectedYear, mParam, selectedPlant),
          getRepeatedFailures(selectedYear, mParam, selectedPlant),
          getEquipmentRanking(10, selectedYear, mParam, selectedPlant),
          getWorkCenterRanking(selectedYear, mParam, selectedPlant),
          getRootCauseDistribution(selectedYear, mParam, selectedPlant),
          getHealthScore(selectedYear, mParam, selectedPlant),
          getExecutiveDashboard(selectedYear, mParam, selectedPlant)
        ]);

        if (isMounted) {
          setSummaryData(sumRes);
          setRepeatedData(repRes || []);
          setRankingData(rankRes || []);
          setWorkCenterData(wcRes || []);
          setRootCauseData(rcRes || []);
          setHealthData(healthRes);
          setExecDashboard(execRes);
        }
      } catch (err) {
        console.error('Error loading AI insights:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [selectedYear, selectedMonth, selectedPlant]);

  // Chart options for Equipment Ranking (Top Problematic Equipment)
  const rankingChartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans, sans-serif' },
    colors: ['#193B8F', '#D6402C'],
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
    dataLabels: { enabled: true, style: { fontSize: '10px', colors: ['#fff'] } },
    xaxis: { categories: rankingData.map((r) => r.equipmentNo), labels: { style: { fontSize: '11px', colors: '#64748B' } } },
    yaxis: { labels: { style: { fontSize: '11px', colors: '#1E293B', fontWeight: 600 } } },
    grid: { borderColor: '#F1F5F9' },
    legend: { position: 'top', horizontalAlign: 'right' }
  };

  const rankingChartSeries = [
    { name: 'Total Rekomendasi', data: rankingData.map((r) => r.totalRec || r.totalWO) },
    { name: 'Notifikasi M7 (Kerusakan)', data: rankingData.map((r) => r.m7Count || r.breakdownCount) }
  ];

  // Chart options for Root Cause Category Distribution
  const rootCauseChartOptions = {
    chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    labels: rootCauseData.map((rc) => rc.category),
    colors: ['#193B8F', '#FF7410', '#168477', '#D6402C', '#8B5CF6'],
    legend: { position: 'bottom', fontSize: '11px' },
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
    plotOptions: { pie: { donut: { size: '65%' } } }
  };

  const rootCauseChartSeries = rootCauseData.map((rc) => rc.count);

  return (
    <div className="space-y-6 relative pb-12">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 border-4 border-industrial-blue border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-gray-500">Mengagregasi Analytics Keandalan Inspeksi...</span>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-lg shadow-sm-subtle border border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-navy-950 text-white rounded-lg shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-ink tracking-tight flex items-center gap-2">
                Reliability Intelligence & Inspection Analytics Engine
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-industrial-blue/10 text-industrial-blue rounded-full border border-industrial-blue/20 uppercase">
                  Rule Engine
                </span>
              </h1>
              <p className="text-xs text-gray-500">
                Analisis Histori Rekomendasi & Notifikasi Inspeksi Berbasis Bukti Lapangan
              </p>
            </div>
          </div>
        </div>

        {/* FILTERS: PLANT + MONTH + YEAR */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PLANT FILTER */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs">
            <Factory size={14} className="text-industrial-navy" />
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="bg-transparent font-bold text-ink outline-none cursor-pointer"
            >
              {PLANT_OPTIONS.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* MONTH / YEAR FILTER */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1.5 rounded-lg text-xs">
            <Calendar size={14} className="text-industrial-navy ml-1" />
            <button 
              onClick={() => setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1))}
              className="p-1 hover:bg-white text-gray-500 hover:text-industrial-navy rounded transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent font-bold text-ink outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>{name}</option>
              ))}
            </select>

            <button 
              onClick={() => setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1))}
              className="p-1 hover:bg-white text-gray-500 hover:text-industrial-navy rounded transition-colors"
            >
              <ChevronRight size={14} />
            </button>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent font-bold text-ink outline-none cursor-pointer border-l border-gray-200 pl-2"
            >
              {[2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI SCORECARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fleet Health Score */}
        <div className="bg-white p-4 rounded-lg shadow-sm-subtle border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Fleet Health Score</div>
            <div className="text-2xl font-display font-bold text-ink mt-1">
              {healthData?.fleetAverageScore || 100} <span className="text-xs font-normal text-gray-500">/ 100</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Analisis {healthData?.totalAssetsAnalyzed || 0} Unit Aset</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <ShieldCheck size={22} />
          </div>
        </div>

        {/* Top Problematic Equipment */}
        <div className="bg-white p-4 rounded-lg shadow-sm-subtle border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Top Bad Actor Equipment</div>
            <div className="text-lg font-display font-bold text-ink mt-1 truncate max-w-[150px]">
              {execDashboard?.summaryMetrics?.topBadActor || 'N/A'}
            </div>
            <div className="text-[10px] text-red-600 font-semibold mt-0.5">
              Rekomendasi Terbanyak
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Dominant Root Cause */}
        <div className="bg-white p-4 rounded-lg shadow-sm-subtle border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Akar Masalah Dominan</div>
            <div className="text-sm font-bold text-amber-600 mt-1 truncate max-w-[160px]">
              {execDashboard?.summaryMetrics?.topRootCause || 'General Maintenance'}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Rule Keyword Frequency</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Activity size={22} />
          </div>
        </div>

        {/* Highest Work Center Load */}
        <div className="bg-white p-4 rounded-lg shadow-sm-subtle border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Work Center Beban Tertinggi</div>
            <div className="text-sm font-bold text-industrial-blue mt-1 truncate max-w-[150px]">
              {execDashboard?.summaryMetrics?.topWorkCenter || 'N/A'}
            </div>
            <div className="text-[10px] text-industrial-blue font-semibold mt-0.5">
              Beban Rekomendasi Terbanyak
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-industrial-blue/10 text-industrial-blue flex items-center justify-center border border-industrial-blue/20">
            <Wrench size={22} />
          </div>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY NARRATIVE CARD */}
      {execDashboard && (
        <div className="bg-navy-950 text-white p-5 rounded-lg shadow-sm-subtle space-y-3">
          <div className="flex items-center gap-2 border-b border-white/15 pb-2">
            <FileText size={18} className="text-industrial-orange" />
            <h2 className="text-sm font-bold tracking-wide uppercase">Executive Reliability Narrative ({execDashboard.period})</h2>
          </div>

          <div className="space-y-2 text-xs text-ink leading-relaxed">
            {execDashboard.narrative.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-2 border-t border-white/15">
            <div className="text-[11px] font-bold uppercase text-industrial-orange tracking-wider mb-1">Rekomendasi Tindakan Prioritas Manajemen:</div>
            <ul className="space-y-1">
              {execDashboard.recommendations.map((act, idx) => (
                <li key={idx} className="text-xs text-ink flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* MAIN GRID 1: TOP PROBLEMATIC EQUIPMENT CHART & ROOT CAUSE DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TOP PROBLEMATIC EQUIPMENT CHART */}
        <div className="col-span-1 lg:col-span-7 bg-white p-5 border border-gray-200 rounded-lg shadow-sm-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" /> Ranking Equipment Paling Bermasalah (Top Bad Actors)
            </h3>
            <span className="text-[10px] text-gray-500 font-medium">Histori Rekomendasi Inspeksi</span>
          </div>

          {rankingData.length > 0 ? (
            <div className="w-full">
              <Chart options={rankingChartOptions} series={rankingChartSeries} type="bar" height={300} />
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-gray-500">Tidak ada data peralatan.</div>
          )}
        </div>

        {/* ROOT CAUSE CATEGORY DISTRIBUTION */}
        <div className="col-span-1 lg:col-span-5 bg-white p-5 border border-gray-200 rounded-lg shadow-sm-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Layers size={16} className="text-industrial-blue" /> Distribusi Kategori Akar Masalah (Root Cause)
            </h3>
            <span className="text-[10px] text-industrial-blue bg-industrial-blue/10 px-2 py-0.5 rounded border border-industrial-blue/20 font-bold">
              Rule Mapping
            </span>
          </div>

          {rootCauseData.length > 0 ? (
            <div className="w-full flex items-center justify-center">
              <Chart options={rootCauseChartOptions} series={rootCauseChartSeries} type="donut" height={280} />
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-gray-500">Tidak ada distribusi data.</div>
          )}
        </div>
      </div>

      {/* REPEATED FAILURE DETECTION & EXPLAINABLE INSIGHT ("WHY?") TABLE */}
      <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Activity size={16} className="text-industrial-orange" /> Analisis Rekomendasi Berulang (Repeated Failure) & Confidence Score
          </h3>
          <span className="text-[10px] text-industrial-orange bg-industrial-orange/10 px-2.5 py-1 rounded border border-industrial-orange/20 font-bold">
            {repeatedData.length} Aset Terdeteksi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repeatedData.length === 0 ? (
            <div className="col-span-2 py-10 text-center text-xs text-gray-500">Tidak ada rekomendasi berulang yang terdeteksi.</div>
          ) : (
            repeatedData.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2.5 relative hover:border-industrial-blue transition-colors">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <div>
                    <div className="font-bold text-ink text-sm flex items-center gap-1.5">
                      <span>{item.equipmentNo}</span>
                      <span className="text-[11px] font-medium text-gray-500">({item.equipmentDescription || item.equipmentNo})</span>
                    </div>
                    <div className="text-xs text-industrial-blue font-medium flex items-center gap-2 mt-0.5">
                      <span>Pabrik: <strong>{item.plantName} ({item.plantCode})</strong></span>
                      <span>&bull;</span>
                      <span>Workcenter: <strong>{item.workCenter}</strong></span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                      {item.confidenceScore}% Confidence
                    </span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-bold text-[10px]">
                      {item.recCount || item.woCount}x Rekomendasi
                    </span>
                  </div>
                </div>

                <div className="text-xs text-ink">
                  <span className="font-semibold text-gray-500">Estimasi Akar Masalah Dominan: </span>
                  <span className="font-bold text-industrial-orange">{item.dominantRootCause}</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs text-gray-500 space-y-1">
                  <div className="font-bold text-ink uppercase tracking-wider text-[10px]">Tindakan Rekomendasi Terarah:</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {item.recommendedActions.map((act, aIdx) => (
                      <li key={aIdx}>{act}</li>
                    ))}
                  </ul>
                </div>

                {/* EXPLAINABILITY BUTTON ("Why?") */}
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => setSelectedExplainable(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-950 hover:bg-industrial-text text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                  >
                    <HelpCircle size={14} className="text-industrial-orange" />
                    <span>Why? (Bukti Insight)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ASSET HEALTH SCORE MATRIX */}
      {healthData && healthData.assets && (
        <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" /> Matriks Skor Kesehatan Aset (Asset Health Score)
            </h3>
            <span className="text-[10px] text-gray-500">Healthy (&gt;85) | Attention (70-84) | Warning (50-69) | Critical (&lt;50)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-ink font-bold border-b border-gray-200">
                  <th className="py-2.5 px-3">Equipment No</th>
                  <th className="py-2.5 px-3">Pabrik</th>
                  <th className="py-2.5 px-3">Work Center</th>
                  <th className="py-2.5 px-3 text-center">Health Score</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Total Rekomendasi</th>
                  <th className="py-2.5 px-3 text-center">Notifikasi M7</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-border">
                {healthData.assets.map((asset, idx) => (
                  <tr key={idx} className="hover:bg-industrial-background/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-ink">{asset.equipmentNo}</td>
                    <td className="py-2.5 px-3 text-gray-500 font-medium">{asset.plantName} ({asset.plantCode})</td>
                    <td className="py-2.5 px-3 text-gray-500">{asset.workCenter}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-ink">{asset.healthScore}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-ink" style={{ backgroundColor: asset.color }}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium">{asset.totalRec || asset.totalWO}</td>
                    <td className="py-2.5 px-3 text-center font-medium text-red-600">{asset.m7Count || asset.breakdownCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXPLAINABILITY MODAL ("WHY?") */}
      {selectedExplainable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="p-4 bg-industrial-text text-ink flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/20 text-navy-600 rounded-lg">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide">Explainable Reliability Insight</h3>
                  <p className="text-[10px] text-gray-500">Bukti Histori Penyimpulan Aset: {selectedExplainable.equipmentNo}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedExplainable(null)}
                className="p-1.5 text-gray-500 hover:text-ink rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg space-y-1">
                <div className="text-xs text-ink">
                  <span className="font-semibold text-gray-500">Pabrik: </span>
                  <span className="font-bold text-ink">{selectedExplainable.plantName} ({selectedExplainable.plantCode})</span>
                </div>
                <div className="text-xs text-ink">
                  <span className="font-semibold text-gray-500">Maintenance Workcenter: </span>
                  <span className="font-bold text-industrial-blue">{selectedExplainable.workCenter}</span>
                </div>
                <div className="text-xs text-ink">
                  <span className="font-semibold text-gray-500">Equipment: </span>
                  <span className="font-bold text-ink">{selectedExplainable.equipmentNo} - {selectedExplainable.equipmentDescription || selectedExplainable.equipmentNo}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-navy-600 uppercase tracking-wider">Kesimpulan Dominan</div>
                  <div className="text-sm font-bold text-ink mt-0.5">{selectedExplainable.dominantRootCause}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-navy-600 uppercase tracking-wider">Confidence Score</div>
                  <div className="text-lg font-display font-bold text-industrial-blue font-poppins">{selectedExplainable.confidenceScore}%</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-ink uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Info size={14} className="text-industrial-blue" /> Mengapa Engine Menyimpulkan Hal Ini?
                </div>
                <ul className="space-y-2">
                  {selectedExplainable.explainability.reasons.map((reason, rIdx) => (
                    <li key={rIdx} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-ink flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-navy-600 mt-1.5 shrink-0"></span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
                <div className="font-bold text-ink mb-1">Rincian Bukti (Evidence Summary):</div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Total Rekomendasi</div>
                    <div className="text-base font-bold text-ink">{selectedExplainable.explainability.evidence.recommendationCount || selectedExplainable.explainability.evidence.workOrderCount}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Notifikasi M7</div>
                    <div className="text-base font-bold text-red-600">{selectedExplainable.explainability.evidence.m7Count || selectedExplainable.explainability.evidence.breakdownCount}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Keyword Match</div>
                    <div className="text-base font-bold text-industrial-blue">{selectedExplainable.explainability.evidence.matchedKeywordsCount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setSelectedExplainable(null)}
                className="px-4 py-1.5 bg-navy-950 hover:bg-industrial-text text-white text-xs font-semibold rounded-lg transition-colors"
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
