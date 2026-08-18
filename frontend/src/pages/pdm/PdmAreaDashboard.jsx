import React, { useState, useEffect, useMemo } from 'react';
import {
  Database, CheckCircle2, Clock, AlertTriangle, BarChart2,
  ChevronDown, ChevronUp, RefreshCw, AlertOctagon, MapPin, Search
} from 'lucide-react';

const STAGE_CONFIG = {
  DC_COLLECTION: { label: 'DC', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', order: 1 },
  ANALYSIS:      { label: 'INSP', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', order: 2 },
  AVP_APPROVAL:  { label: 'AVP', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', order: 3 },
  SAP_UPLOAD:    { label: 'SAP', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', order: 4 },
  CLOSED:        { label: 'Done', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', order: 5 },
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function StageCheck({ done, inProgress, label }) {
  if (done) return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm">
      <CheckCircle2 className="w-3.5 h-3.5" /> {label}
    </span>
  );
  if (inProgress) return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm border border-amber-200">
      <Clock className="w-3.5 h-3.5 animate-pulse" /> {label}
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full text-xs whitespace-nowrap border border-gray-200">
      <span className="w-3.5 h-3.5 flex items-center justify-center text-gray-300">○</span> {label}
    </span>
  );
}

function StageProgress({ summary }) {
  const pct = summary.total > 0 ? Math.round((summary.sap_closed / summary.total) * 100) : 0;
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
        <span>{summary.sap_closed} dari {summary.total} task selesai</span>
        <span className="font-bold text-gray-700">{pct}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-green-500 rounded-full transition-all duration-700 relative"
          style={{ width: `${pct}%` }}
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    </div>
  );
}

function AreaRow({ area, isUserArea }) {
  const [expanded, setExpanded] = useState(isUserArea);
  const { summary, tasks } = area;
  const overdueTasks = tasks.filter(t => t.isOverdue);

  return (
    <div className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-all ${isUserArea ? 'ring-2 ring-blue-400 border-blue-400' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}`}>
      {/* Header Area */}
      <div
        className={`px-5 py-3.5 flex items-center gap-4 cursor-pointer transition ${isUserArea ? 'bg-blue-50/30' : 'hover:bg-blue-50/20'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <p className="font-bold text-gray-800 text-[15px]">{area.sub_area}</p>
            {isUserArea && (
              <span className="text-[10px] bg-[#193B8F] text-white font-bold px-2 py-0.5 rounded-full shadow-sm">Area Anda</span>
            )}
            {overdueTasks.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">
                <AlertOctagon className="w-3 h-3" /> {overdueTasks.length} overdue
              </span>
            )}
          </div>
          
          <div className="w-full mt-1 flex items-center gap-3">
             <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
               <div
                 className="h-full bg-blue-500 rounded-full"
                 style={{ width: `${summary.total > 0 ? (summary.sap_closed / summary.total) * 100 : 0}%` }}
               />
             </div>
             <span className="text-[10px] font-semibold text-gray-500 w-8">{summary.total > 0 ? Math.round((summary.sap_closed / summary.total) * 100) : 0}%</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 shrink-0 scale-90 origin-right">
          <StageCheck done={summary.dc_done === summary.total && summary.total > 0} inProgress={summary.dc_done > 0 && summary.dc_done < summary.total} label="DC" />
          <StageCheck done={summary.analysis_done === summary.total && summary.total > 0} inProgress={summary.analysis_done > 0 && summary.analysis_done < summary.total} label="INSP" />
          <StageCheck done={summary.avp_approved === summary.total && summary.total > 0} inProgress={summary.avp_approved > 0 && summary.avp_approved < summary.total} label="AVP" />
          <StageCheck done={summary.sap_closed === summary.total && summary.total > 0} inProgress={summary.sap_closed > 0 && summary.sap_closed < summary.total} label="SAP" />
        </div>

        <div className="text-blue-500 bg-blue-50 p-1.5 rounded-full shrink-0 ml-2">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Task list */}
      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50 bg-gray-50/50">
          {tasks.length === 0 ? (
            <div className="px-5 py-4 text-sm text-gray-400 italic text-center">Tidak ada task untuk area ini.</div>
          ) : tasks.map(task => {
            const stg = STAGE_CONFIG[task.workflowStage] || STAGE_CONFIG.DC_COLLECTION;
            return (
              <div key={task.id} className={`px-5 py-3.5 flex items-center gap-3 text-sm transition ${task.isOverdue ? 'bg-red-50/40 hover:bg-red-50/60' : 'bg-white hover:bg-blue-50/30'}`}>
                <span className={`shrink-0 w-2.5 h-2.5 rounded-full shadow-sm ${task.criticality === 'CRITICAL' ? 'bg-red-500 ring-2 ring-red-200' : 'bg-blue-400 ring-2 ring-blue-100'}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-800 truncate">{task.code}</span>
                  </div>
                  {/* Personnel */}
                  <div className="flex flex-wrap gap-1.5">
                    {task.dataCollector && (
                      <span className="text-[10px] bg-blue-100/50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">DC: {task.dataCollector.name}</span>
                    )}
                    {task.analyst && (
                      <span className="text-[10px] bg-amber-100/50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium">INSP: {task.analyst.name}</span>
                    )}
                    {task.avp && (
                      <span className="text-[10px] bg-purple-100/50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-medium">AVP: {task.avp.name}</span>
                    )}
                    {!task.dataCollector && !task.analyst && (
                      <span className="text-[10px] text-gray-400 italic bg-gray-100 px-1.5 py-0.5 rounded">Belum ada PIC</span>
                    )}
                  </div>
                </div>

                {/* Stage progress badges */}
                <div className="hidden lg:flex items-center gap-1 shrink-0 bg-gray-50 p-1 rounded-lg border border-gray-100">
                  {['DC_COLLECTION','ANALYSIS','AVP_APPROVAL','SAP_UPLOAD','CLOSED'].map((s, i) => {
                    const cfg = STAGE_CONFIG[s];
                    const isDone = STAGE_CONFIG[task.workflowStage]?.order > i + 1;
                    const isCurrent = task.workflowStage === s;
                    return (
                      <span key={s} className={`text-[10px] px-2 py-1 rounded font-bold ${isDone || isCurrent ? (isDone ? 'bg-green-100 text-green-700 shadow-sm' : `${cfg.color} shadow-sm ring-1 ring-black/5`) : 'text-gray-400'}`}>
                        {cfg.label}
                      </span>
                    );
                  })}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold shadow-sm border border-white/50 ${stg.color}`}>{stg.label}</span>
                  {task.isOverdue && <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Overdue</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PabrikRow({ pabrik, expanded, onToggle, userSubArea }) {
  const { summary, areas, tasks } = pabrik;
  const overdueTasks = tasks.filter(t => t.isOverdue);
  const isUserPabrik = userSubArea && areas.some(a => a.sub_area.toLowerCase() === userSubArea.toLowerCase());

  return (
    <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all duration-300 ${isUserPabrik ? 'ring-2 ring-[#193B8F] border-[#193B8F]' : 'border-gray-200 hover:shadow-md'}`}>
      {/* Header Pabrik */}
      <div
        className={`px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer transition ${isUserPabrik ? 'bg-blue-50/10' : 'hover:bg-gray-50'}`}
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h2 className="text-xl font-display font-extrabold text-gray-900 tracking-tight">{pabrik.nama_pabrik}</h2>
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">{areas.length} Area</span>
            {isUserPabrik && (
              <span className="text-[11px] bg-[#193B8F] text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Pabrik Anda</span>
            )}
            {overdueTasks.length > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[11px] font-bold shadow-sm">
                <AlertOctagon className="w-3.5 h-3.5" /> {overdueTasks.length} task overdue
              </span>
            )}
          </div>
          <StageProgress summary={summary} />
        </div>

        {/* Stage checklist (aggregate) */}
        <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0 justify-between w-full md:w-auto">
          <div className="flex items-center gap-2">
            <StageCheck done={summary.dc_done === summary.total && summary.total > 0} inProgress={summary.dc_done > 0 && summary.dc_done < summary.total} label="DC ✓" />
            <StageCheck done={summary.analysis_done === summary.total && summary.total > 0} inProgress={summary.analysis_done > 0 && summary.analysis_done < summary.total} label="INSP ✓" />
            <StageCheck done={summary.avp_approved === summary.total && summary.total > 0} inProgress={summary.avp_approved > 0 && summary.avp_approved < summary.total} label="AVP ✓" />
            <StageCheck done={summary.sap_closed === summary.total && summary.total > 0} inProgress={summary.sap_closed > 0 && summary.sap_closed < summary.total} label="Done ✓" />
          </div>

          <div className={`text-gray-400 bg-gray-100/80 p-2 rounded-full transition-transform duration-300 ${expanded ? 'rotate-180 bg-blue-100 text-blue-600' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Areas List */}
      <div className={`transition-all duration-500 ease-in-out ${expanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="bg-[#f8f9fc] border-t border-gray-100 p-5 space-y-4">
          {areas.map(area => (
            <AreaRow 
              key={area.area_key} 
              area={area} 
              isUserArea={userSubArea && area.sub_area.toLowerCase() === userSubArea.toLowerCase()} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PdmAreaDashboard() {
  const [data, setData] = useState([]);
  const [userSubArea, setUserSubArea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [expandedKeys, setExpandedKeys] = useState({});
  const [search, setSearch] = useState('');
  const [filterPabrik, setFilterPabrik] = useState('');

  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchData(); }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/api/pdm-schedule/area-dashboard?year=${year}&month=${month}`, { headers });
      if (res.ok) {
        const payload = await res.json();
        setData(payload.areas || payload); // Fallback for old/new format
        setUserSubArea(payload.userSubArea);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleExpand = (key) => setExpandedKeys(p => ({ ...p, [key]: !p[key] }));

  // Unique pabrik list for filter
  const pabrikOptions = useMemo(() => {
    const seen = new Set();
    const opts = [];
    for (const a of data) {
      if (!seen.has(a.nama_pabrik)) { seen.add(a.nama_pabrik); opts.push(a.nama_pabrik); }
    }
    return opts.sort();
  }, [data]);

  // Group data by pabrik
  const groupedByPabrik = useMemo(() => {
    const map = {};
    for (const a of data) {
      if (!map[a.nama_pabrik]) {
        map[a.nama_pabrik] = {
          nama_pabrik: a.nama_pabrik,
          areas: [],
          summary: { total: 0, dc_done: 0, analysis_done: 0, avp_approved: 0, sap_closed: 0 },
          tasks: [],
        };
      }
      map[a.nama_pabrik].areas.push(a);
      map[a.nama_pabrik].tasks.push(...a.tasks);
      map[a.nama_pabrik].summary.total += a.summary.total;
      map[a.nama_pabrik].summary.dc_done += a.summary.dc_done;
      map[a.nama_pabrik].summary.analysis_done += a.summary.analysis_done;
      map[a.nama_pabrik].summary.avp_approved += a.summary.avp_approved;
      map[a.nama_pabrik].summary.sap_closed += a.summary.sap_closed;
    }
    return Object.values(map).sort((a, b) => a.nama_pabrik.localeCompare(b.nama_pabrik));
  }, [data]);

  // Filter grouped data
  const filtered = useMemo(() =>
    groupedByPabrik.filter(p => {
      const matchSearch = !search ||
        p.nama_pabrik.toLowerCase().includes(search.toLowerCase()) ||
        p.areas.some(a => a.sub_area.toLowerCase().includes(search.toLowerCase()));
      const matchPabrik = !filterPabrik || p.nama_pabrik === filterPabrik;
      return matchSearch && matchPabrik;
    }),
    [groupedByPabrik, search, filterPabrik]
  );

  // Overall summary
  const totals = useMemo(() => groupedByPabrik.reduce((acc, p) => ({
    total: acc.total + p.summary.total,
    dc_done: acc.dc_done + p.summary.dc_done,
    analysis_done: acc.analysis_done + p.summary.analysis_done,
    avp_approved: acc.avp_approved + p.summary.avp_approved,
    sap_closed: acc.sap_closed + p.summary.sap_closed,
  }), { total: 0, dc_done: 0, analysis_done: 0, avp_approved: 0, sap_closed: 0 }), [groupedByPabrik]);

  const overallPct = totals.total > 0 ? Math.round((totals.sap_closed / totals.total) * 100) : 0;

  return (
    <div className="p-6 w-full max-w-none space-y-6 bg-gray-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-blue-50 rounded-xl text-[#193B8F]">
              <BarChart2 className="w-7 h-7" />
            </div>
            Area Dashboard PdM
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Pantau progress 4-stage workflow per pabrik — <span className="text-[#FF7410] font-bold">{MONTH_NAMES[month - 1]} {year}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-gray-100/80 p-1 rounded-xl flex items-center shadow-inner">
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
              className="text-sm font-semibold border-none bg-transparent py-2 pl-3 pr-8 outline-none text-gray-700 cursor-pointer focus:ring-0">
              {MONTH_NAMES.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
            </select>
            <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))}
              className="text-sm font-semibold border-none bg-transparent py-2 pl-3 pr-8 outline-none text-gray-700 cursor-pointer focus:ring-0">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all active:scale-95">
            <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Task', value: totals.total, bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-800', icon: Database },
          { label: 'DC Selesai', value: totals.dc_done, bg: 'bg-blue-50/50', border: 'border-blue-200', text: 'text-blue-700', icon: CheckCircle2 },
          { label: 'Analisis Selesai', value: totals.analysis_done, bg: 'bg-amber-50/50', border: 'border-amber-200', text: 'text-amber-700', icon: CheckCircle2 },
          { label: 'AVP Approved', value: totals.avp_approved, bg: 'bg-purple-50/50', border: 'border-purple-200', text: 'text-purple-700', icon: CheckCircle2 },
          { label: 'SAP Closed', value: totals.sap_closed, bg: 'bg-green-50/50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle2 },
        ].map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`rounded-2xl border ${c.border} ${c.bg} p-5 text-center shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow`}>
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                <Icon className="w-24 h-24" />
              </div>
              <p className={`text-4xl font-display font-black ${c.text} mb-1 drop-shadow-sm`}>{c.value}</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Overall Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-green-50/50 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Overall Completion</h3>
            <p className="text-sm text-gray-500">{groupedByPabrik.length} Pabrik • {data.length} Area</p>
          </div>
          <p className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#193B8F] to-[#FF7410]">
            {overallPct}%
          </p>
        </div>
        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner relative z-10">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-green-500 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${overallPct}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-400 mt-2 relative z-10 uppercase tracking-wider">
          <span>DC</span><span>Analisis</span><span>AVP</span><span>SAP Closed</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pabrik / area..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm font-medium border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#193B8F]/20 focus:border-[#193B8F] w-full md:w-64 transition-all"
            />
          </div>
          <select value={filterPabrik} onChange={e => setFilterPabrik(e.target.value)}
            className="text-sm font-medium border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-[#193B8F]/20 focus:border-[#193B8F] cursor-pointer">
            <option value="">Semua Pabrik</option>
            {pabrikOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {(search || filterPabrik) && (
            <button onClick={() => { setSearch(''); setFilterPabrik(''); }}
              className="text-xs font-bold text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition">
              Reset
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
            {filtered.length} Pabrik ditampilkan
          </span>
        </div>
      </div>

      {/* Stage Legend */}
      <div className="flex flex-wrap gap-2.5 items-center text-xs text-gray-500 bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm">
        <span className="font-bold text-gray-700 uppercase tracking-wider mr-2">Legend:</span>
        {Object.entries(STAGE_CONFIG).map(([key, c]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${c.dot} shadow-sm`}></span>
            <span className="font-semibold text-gray-600">{c.label}</span>
          </div>
        ))}
      </div>

      {/* Pabrik rows */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-10 h-10 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-500 font-medium">Memuat data pabrik...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-bold text-lg">Tidak ada data area</p>
          <p className="text-gray-400 text-sm mt-1">Coba ubah periode atau hapus filter pencarian.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-10">
          {filtered.map(pabrik => {
            const isUserPabrik = userSubArea && pabrik.areas.some(a => a.sub_area.toLowerCase() === userSubArea.toLowerCase());
            return (
              <PabrikRow
                key={pabrik.nama_pabrik}
                pabrik={pabrik}
                expanded={!!expandedKeys[pabrik.nama_pabrik] || isUserPabrik}
                onToggle={() => toggleExpand(pabrik.nama_pabrik)}
                userSubArea={userSubArea}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
