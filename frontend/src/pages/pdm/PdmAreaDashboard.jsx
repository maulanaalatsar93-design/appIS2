import React, { useState, useEffect, useMemo } from 'react';
import {
  Database, CheckCircle2, Clock, AlertTriangle, BarChart2,
  ChevronDown, ChevronUp, RefreshCw, AlertOctagon, Users
} from 'lucide-react';

const STAGE_CONFIG = {
  DC_COLLECTION: { label: 'DC', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', order: 1 },
  ANALYSIS:      { label: 'INSP', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', order: 2 },
  AVP_APPROVAL:  { label: 'AVP', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', order: 3 },
  SAP_UPLOAD:    { label: 'SAP', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', order: 4 },
  CLOSED:        { label: 'Done', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', order: 5 },
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

// Checklist pill komponen
function StageCheck({ done, inProgress, label }) {
  if (done) return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold whitespace-nowrap">
      <CheckCircle2 className="w-3 h-3" /> {label}
    </span>
  );
  if (inProgress) return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold whitespace-nowrap">
      <Clock className="w-3 h-3 animate-pulse" /> {label}
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs whitespace-nowrap border border-gray-200">
      <span className="w-3 h-3 flex items-center justify-center text-gray-300">○</span> {label}
    </span>
  );
}

// Progress bar komponen
function StageProgress({ summary }) {
  const pct = summary.total > 0 ? Math.round((summary.sap_closed / summary.total) * 100) : 0;
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
        <span>{summary.sap_closed}/{summary.total} selesai</span>
        <span className="font-semibold text-gray-600">{pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Row detail per pabrik
function PabrikRow({ pabrik, expanded, onToggle }) {
  const { summary, tasks } = pabrik;
  const overdueTasks = tasks.filter(t => t.isOverdue);

  return (
    <div className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-all`}>
      {/* Header baris */}
      <div
        className="px-5 py-3.5 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-800">{pabrik.nama_pabrik}</p>
            {overdueTasks.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">
                <AlertOctagon className="w-3 h-3" /> {overdueTasks.length} overdue
              </span>
            )}
          </div>
          <StageProgress summary={summary} />
        </div>

        {/* Checklist columns */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <StageCheck done={summary.dc_done === summary.total && summary.total > 0} inProgress={summary.dc_done > 0 && summary.dc_done < summary.total} label="DC ✓" />
          <StageCheck done={summary.analysis_done === summary.total && summary.total > 0} inProgress={summary.analysis_done > 0 && summary.analysis_done < summary.total} label="INSP ✓" />
          <StageCheck done={summary.avp_approved === summary.total && summary.total > 0} inProgress={summary.avp_approved > 0 && summary.avp_approved < summary.total} label="AVP ✓" />
          <StageCheck done={summary.sap_closed === summary.total && summary.total > 0} inProgress={summary.sap_closed > 0 && summary.sap_closed < summary.total} label="SAP ✓" />
        </div>

        <div className="text-gray-400 shrink-0 ml-2">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded tasks list */}
      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {tasks.map(task => {
            const stg = STAGE_CONFIG[task.workflowStage] || STAGE_CONFIG.DC_COLLECTION;
            return (
              <div key={task.id} className={`px-5 py-3 flex items-center gap-3 text-sm ${task.isOverdue ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                <span className={`shrink-0 w-2 h-2 rounded-full ${task.criticality === 'CRITICAL' ? 'bg-red-400' : 'bg-blue-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 truncate">{task.code}</span>
                    <span className="text-gray-400 text-xs truncate">— {task.subArea}</span>
                  </div>
                  {/* Personnel info */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {task.dataCollector && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                        DC: {task.dataCollector.name}
                      </span>
                    )}
                    {task.analyst && (
                      <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                        Analyst: {task.analyst.name}
                      </span>
                    )}
                    {task.avp && (
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                        AVP: {task.avp.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage badges per task */}
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  {['DC_COLLECTION','ANALYSIS','AVP_APPROVAL','SAP_UPLOAD','CLOSED'].map((s, i) => {
                    const cfg = STAGE_CONFIG[s];
                    const isDone = STAGE_CONFIG[task.workflowStage]?.order > i + 1;
                    const isCurrent = task.workflowStage === s;
                    return (
                      <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isDone || isCurrent ? (isDone ? 'bg-green-100 text-green-700' : cfg.color) : 'bg-gray-50 text-gray-300'}`}>
                        {cfg.label}
                      </span>
                    );
                  })}
                </div>

                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${stg.color}`}>
                  {stg.label}
                </span>
                {task.isOverdue && <AlertTriangle className="shrink-0 w-3.5 h-3.5 text-red-500" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PdmAreaDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [expandedIds, setExpandedIds] = useState({});
  const [search, setSearch] = useState('');

  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchData(); }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/api/pdm-schedule/area-dashboard?year=${year}&month=${month}`, { headers });
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleExpand = (id) => setExpandedIds(p => ({ ...p, [id]: !p[id] }));

  const filtered = useMemo(() =>
    data.filter(p => !search || p.nama_pabrik.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );

  // Overall summary stats
  const totals = useMemo(() => data.reduce((acc, p) => ({
    total: acc.total + p.summary.total,
    dc_done: acc.dc_done + p.summary.dc_done,
    analysis_done: acc.analysis_done + p.summary.analysis_done,
    avp_approved: acc.avp_approved + p.summary.avp_approved,
    sap_closed: acc.sap_closed + p.summary.sap_closed,
  }), { total: 0, dc_done: 0, analysis_done: 0, avp_approved: 0, sap_closed: 0 }), [data]);

  const overallPct = totals.total > 0 ? Math.round((totals.sap_closed / totals.total) * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-blue-600" />
            Area Dashboard PdM
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Status progress 4-stage workflow per area — {MONTH_NAMES[month - 1]} {year}
          </p>
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
        </div>
      </div>

      {/* Overall summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Task', value: totals.total, color: 'border-gray-200 bg-gray-50', text: 'text-gray-700' },
          { label: 'DC Selesai', value: totals.dc_done, color: 'border-blue-200 bg-blue-50', text: 'text-blue-700' },
          { label: 'Analisis Selesai', value: totals.analysis_done, color: 'border-amber-200 bg-amber-50', text: 'text-amber-700' },
          { label: 'AVP Approved', value: totals.avp_approved, color: 'border-purple-200 bg-purple-50', text: 'text-purple-700' },
          { label: 'SAP Closed', value: totals.sap_closed, color: 'border-green-200 bg-green-50', text: 'text-green-700' },
        ].map(c => (
          <div key={c.label} className={`rounded-xl border ${c.color} p-3 text-center`}>
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Overall Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Overall Completion</p>
          <p className="text-sm font-bold text-gray-800">{overallPct}%</p>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-green-500 rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>DC</span><span>Analisis</span><span>AVP</span><span>SAP Closed</span>
        </div>
      </div>

      {/* Stage Legend */}
      <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
        <span className="font-semibold text-gray-600">Stage:</span>
        {Object.entries(STAGE_CONFIG).map(([key, c]) => (
          <span key={key} className={`px-2 py-0.5 rounded-full font-medium ${c.color}`}>{c.label}</span>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Cari pabrik/area..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full md:w-72 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
      />

      {/* Pabrik rows */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Tidak ada data untuk periode ini.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <PabrikRow
              key={p.pabrik_id}
              pabrik={p}
              expanded={!!expandedIds[p.pabrik_id]}
              onToggle={() => toggleExpand(p.pabrik_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
