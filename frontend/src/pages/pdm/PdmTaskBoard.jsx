import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Play, Square, CheckCircle, UserCheck, Clock, AlertTriangle,
  AlertOctagon, ChevronDown, ChevronUp, History, RefreshCw, Database,
  BarChart2, ChevronRight
} from 'lucide-react';

// ── Stage Configuration ──────────────────────────────────────────────────────
const STAGES = [
  { key: 'DC_COLLECTION', label: 'DC', full: 'Data Collection', color: 'bg-blue-500 text-white' },
  { key: 'ANALYSIS',      label: 'INSP', full: 'Analisis',       color: 'bg-amber-500 text-white' },
  { key: 'AVP_APPROVAL',  label: 'AVP',  full: 'AVP Approval',   color: 'bg-purple-500 text-white' },
  { key: 'SAP_UPLOAD',    label: 'SAP',  full: 'SAP Upload',     color: 'bg-orange-500 text-white' },
  { key: 'CLOSED',        label: '✓',   full: 'Selesai',         color: 'bg-green-500 text-white' },
];

const STAGE_ORDER = { DC_COLLECTION: 1, ANALYSIS: 2, AVP_APPROVAL: 3, SAP_UPLOAD: 4, CLOSED: 5 };

const STATUS_STYLE = {
  SCHEDULED:   { bg: 'bg-gray-50 border-gray-200',    badge: 'bg-gray-100 text-gray-600',    label: 'Scheduled' },
  ASSIGNED:    { bg: 'bg-blue-50 border-blue-200',     badge: 'bg-blue-100 text-blue-700',    label: 'Assigned' },
  IN_PROGRESS: { bg: 'bg-amber-50 border-amber-200',   badge: 'bg-amber-100 text-amber-700',  label: 'In Progress' },
  ON_HOLD:     { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700',label: 'On Hold' },
  COMPLETED:   { bg: 'bg-green-50 border-green-200',   badge: 'bg-green-100 text-green-700',  label: 'Completed' },
  OVERDUE:     { bg: 'bg-red-50 border-red-200',       badge: 'bg-red-100 text-red-700',      label: 'Overdue' },
};

// ── Stage Progress Bar ───────────────────────────────────────────────────────
function WorkflowProgress({ workflowStage }) {
  const currentOrder = STAGE_ORDER[workflowStage] || 1;
  return (
    <div className="flex items-center gap-1">
      {STAGES.map((s, i) => {
        const order = i + 1;
        const done = currentOrder > order;
        const active = currentOrder === order;
        return (
          <React.Fragment key={s.key}>
            <div className={`flex items-center justify-center text-[9px] font-bold rounded-full transition-all
              ${done ? 'w-5 h-5 bg-green-500 text-white' : active ? `w-6 h-6 ${s.color} shadow-md` : 'w-5 h-5 bg-gray-100 text-gray-400'}`}>
              {done ? '✓' : s.label}
            </div>
            {i < STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 ${done ? 'bg-green-400' : 'bg-gray-200'}`} style={{ minWidth: 8 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Hold Modal ───────────────────────────────────────────────────────────────
function HoldModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">Hold Task</h3>
        <p className="text-sm text-gray-500">Masukkan alasan hold. Waktu hold tidak akan dihitung sebagai man-hours.</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Alasan hold (wajib)..."
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-300"
        />
        <div className="flex gap-2">
          <button
            onClick={() => { if (reason.trim()) onConfirm(reason); }}
            disabled={!reason.trim()}
            className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-40">
            Confirm Hold
          </button>
          <button onClick={onCancel} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition">Batal</button>
        </div>
      </div>
    </div>
  );
}

// ── AVP Reject Modal ─────────────────────────────────────────────────────────
function RejectModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold text-red-700 text-lg">Reject / Revisi</h3>
        <p className="text-sm text-gray-500">Berikan catatan revisi untuk Analyst.</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Catatan revisi (wajib)..."
          rows={3}
          className="w-full text-sm border border-red-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-300"
        />
        <div className="flex gap-2">
          <button
            onClick={() => { if (reason.trim()) onConfirm(reason); }}
            disabled={!reason.trim()}
            className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-40">
            Kirim Revisi
          </button>
          <button onClick={onCancel} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition">Batal</button>
        </div>
      </div>
    </div>
  );
}

// ── Task Box ─────────────────────────────────────────────────────────────────
function TaskBox({ occ, onAction, manpowers, userRole, userMpId }) {
  const [expanded, setExpanded] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [newPicId, setNewPicId] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const now = new Date();
  const daysLate = !['COMPLETED', 'CANCELLED'].includes(occ.status) && occ.workflowStage !== 'CLOSED'
    ? Math.max(0, Math.floor((now - new Date(occ.scheduledDate)) / 86400000))
    : 0;
  const statusKey = daysLate > 0 ? 'OVERDUE' : occ.status;
  const style = STATUS_STYLE[statusKey] || STATUS_STYLE.ASSIGNED;

  const stage = occ.workflowStage || 'DC_COLLECTION';
  const stageCfg = STAGES.find(s => s.key === stage) || STAGES[0];

  const fmt = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  // Role-based action visibility
  const isDC = ['staff', 'data_collector', 'technician'].includes(userRole);
  const isAnalyst = userRole === 'analyst';
  const isAVP = userRole?.startsWith('avp');
  const isAdmin = ['admin', 'manager', 'supervisor'].includes(userRole);

  const showDcActions = (isDC || isAdmin) && stage === 'DC_COLLECTION';
  const showAnalysisActions = (isAnalyst || isAdmin) && stage === 'ANALYSIS';
  const showAvpActions = (isAVP || isAdmin) && stage === 'AVP_APPROVAL';
  const showSapActions = (isDC || isAdmin) && stage === 'SAP_UPLOAD';

  return (
    <div className={`rounded-xl border-2 ${style.bg} shadow-sm overflow-hidden`}>
      {/* Criticality strip */}
      <div className={`h-1 w-full ${occ.rule?.criticality === 'CRITICAL' ? 'bg-red-400' : 'bg-blue-300'}`} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-gray-800">{occ.rule?.code}</p>
            <p className="text-xs text-gray-500">{occ.rule?.pabrik?.nama_pabrik} · {occ.rule?.subArea}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${stageCfg.color}`}>{stageCfg.full}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${style.badge}`}>{style.label}</span>
          </div>
        </div>

        {/* Workflow Progress */}
        <WorkflowProgress workflowStage={stage} />

        <hr className="border-gray-200" />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-600">
          <div><span className="text-gray-400">Scheduled:</span> <span className="font-medium">{fmt(occ.scheduledDate)}</span></div>
          <div><span className="text-gray-400">Status:</span> <span className={`font-semibold ${daysLate > 0 ? 'text-red-600' : 'text-gray-700'}`}>{style.label}</span></div>
          {daysLate > 0 && (
            <div className="col-span-2 flex items-center gap-1 text-red-600 font-semibold">
              <AlertOctagon className="w-3 h-3" /> +{daysLate} hari terlambat
            </div>
          )}
        </div>

        {/* Personnel info */}
        <div className="space-y-0.5 text-xs">
          {occ.dataCollector && <p className="text-gray-500">DC: <span className="font-medium text-gray-700">{occ.dataCollector.name}</span></p>}
          {occ.analyst && <p className="text-gray-500">Analyst: <span className="font-medium text-gray-700">{occ.analyst.name}</span></p>}
          {occ.avp && <p className="text-gray-500">AVP: <span className="font-medium text-gray-700">{occ.avp.name}</span></p>}
          {!occ.dataCollector && !occ.analyst && <p className="text-gray-400 italic">PIC: {occ.assignedTo?.name || 'Belum ada'}</p>}
        </div>

        {/* AVP rejection note */}
        {occ.avpRejectedReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
            <span className="font-semibold">Revisi AVP:</span> {occ.avpRejectedReason}
          </div>
        )}

        {/* PIC History toggle */}
        {occ.picHistories?.length > 0 && (
          <button onClick={() => setHistoryOpen(!historyOpen)} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
            <History className="w-3 h-3" /> {occ.picHistories.length} perubahan PIC
          </button>
        )}
        {historyOpen && (
          <div className="bg-white rounded-lg border border-gray-200 p-2 text-xs space-y-1">
            {occ.picHistories.map(h => (
              <div key={h.id} className="flex gap-2 text-gray-600">
                <span className="text-gray-400 shrink-0">{new Date(h.changedAt).toLocaleDateString('id-ID')}</span>
                <span>{h.fromPic?.name || 'awal'} → <strong>{h.toPic?.name}</strong></span>
                <span className="text-orange-500">({h.reason})</span>
              </div>
            ))}
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-wrap gap-2 pt-1">

          {/* DC Stage Actions */}
          {showDcActions && occ.status === 'ASSIGNED' && (
            <button onClick={() => onAction('start', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition">
              <Play className="w-3 h-3" /> Mulai DC
            </button>
          )}
          {showDcActions && occ.status === 'ON_HOLD' && (
            <button onClick={() => onAction('workflow-resume', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition">
              <Play className="w-3 h-3" /> Lanjutkan
            </button>
          )}
          {showDcActions && occ.status === 'IN_PROGRESS' && (
            <>
              <button onClick={() => setShowHoldModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-medium hover:bg-orange-200 transition">
                <Square className="w-3 h-3" /> Hold
              </button>
              <button onClick={() => onAction('finish-dc', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition">
                <CheckCircle className="w-3 h-3" /> Selesai DC
              </button>
            </>
          )}

          {/* Analysis Stage Actions */}
          {showAnalysisActions && occ.status === 'ASSIGNED' && (
            <button onClick={() => onAction('start-analysis', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition">
              <Play className="w-3 h-3" /> Mulai Analisis
            </button>
          )}
          {showAnalysisActions && occ.status === 'ON_HOLD' && (
            <button onClick={() => onAction('workflow-resume', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition">
              <Play className="w-3 h-3" /> Lanjutkan
            </button>
          )}
          {showAnalysisActions && occ.status === 'IN_PROGRESS' && (
            <>
              <button onClick={() => setShowHoldModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-medium hover:bg-orange-200 transition">
                <Square className="w-3 h-3" /> Hold
              </button>
              <button onClick={() => onAction('finish-analysis', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition">
                <CheckCircle className="w-3 h-3" /> Selesai Analisis
              </button>
            </>
          )}

          {/* AVP Stage Actions */}
          {showAvpActions && (
            <>
              <button onClick={() => onAction('avp-approve', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition">
                <CheckCircle className="w-3 h-3" /> Approve
              </button>
              <button onClick={() => setShowRejectModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-200 transition">
                <Square className="w-3 h-3" /> Reject/Revisi
              </button>
            </>
          )}

          {/* SAP Upload Stage */}
          {showSapActions && (
            <button onClick={() => onAction('sap-upload', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition">
              <Database className="w-3 h-3" /> Upload SAP
            </button>
          )}

          {/* Reassign (Admin/Supervisor) */}
          {(isAdmin || true) && (
            <button onClick={() => setReassignOpen(!reassignOpen)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-200 transition ml-auto">
              <UserCheck className="w-3 h-3" /> Ganti PIC
            </button>
          )}
        </div>

        {/* Reassign Form */}
        {reassignOpen && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-600">Ganti PIC</p>
            <select value={newPicId} onChange={e => setNewPicId(e.target.value)} className="w-full text-xs border border-gray-200 rounded p-2">
              <option value="">-- Pilih PIC Baru --</option>
              {manpowers.map(m => <option key={m.id} value={m.id}>{m.name} – {m.position}</option>)}
            </select>
            <input value={reasonInput} onChange={e => setReasonInput(e.target.value)} placeholder="Alasan (wajib)" className="w-full text-xs border border-gray-200 rounded p-2" />
            <div className="flex gap-2">
              <button onClick={() => { onAction('reassign', occ.id, { newPicId, reason: reasonInput }); setReassignOpen(false); }} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">Simpan</button>
              <button onClick={() => setReassignOpen(false)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-xs">Batal</button>
            </div>
          </div>
        )}
      </div>

      {/* Hold Modal */}
      {showHoldModal && (
        <HoldModal
          onConfirm={reason => { onAction('workflow-hold', occ.id, { reason }); setShowHoldModal(false); }}
          onCancel={() => setShowHoldModal(false)}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          onConfirm={reason => { onAction('avp-reject', occ.id, { reason }); setShowRejectModal(false); }}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </div>
  );
}

// ── Main PdmTaskBoard ────────────────────────────────────────────────────────
export default function PdmTaskBoard() {
  const [tab, setTab] = useState('WORKFLOW');
  const [workflowTasks, setWorkflowTasks] = useState([]);
  const [jobBoard, setJobBoard] = useState([]);
  const [manpowers, setManpowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterStage, setFilterStage] = useState('');

  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Get user info from token
  const userPayload = (() => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return {}; }
  })();
  const userRole = userPayload.role || 'staff';
  const userMpId = userPayload.man_power_id;

  useEffect(() => { fetchAll(); }, [filterMonth, filterYear, tab]);
  useEffect(() => { fetchManpowers(); }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = `year=${filterYear}&month=${filterMonth}`;
      const [wfRes, jbRes] = await Promise.all([
        fetch(`${api}/api/pdm-schedule/workflow-tasks?${params}`, { headers }),
        fetch(`${api}/api/pdm-schedule/job-board?${params}`, { headers }),
      ]);
      if (wfRes.ok) setWorkflowTasks(await wfRes.json());
      if (jbRes.ok) setJobBoard(await jbRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterMonth, filterYear]);

  const fetchManpowers = async () => {
    const res = await fetch(`${api}/api/dashboard/manpower`, { headers });
    if (res.ok) setManpowers(await res.json());
  };

  const handleAction = async (action, id, extra = {}) => {
    // Workflow actions use new endpoints; legacy actions use old endpoints
    const legacyMap = { start: 'start', hold: 'hold', complete: 'complete', reassign: 'reassign', claim: 'claim' };
    const endpoint = legacyMap[action] || action;
    try {
      const res = await fetch(`${api}/api/pdm-schedule/occurrences/${id}/${endpoint}`, {
        method: endpoint === 'assign-personnel' ? 'PATCH' : 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(extra)
      });
      if (res.ok) fetchAll();
      else { const err = await res.json(); alert(err.error || 'Gagal melakukan aksi'); }
    } catch (e) { console.error(e); }
  };

  const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

  const filteredWorkflow = filterStage
    ? workflowTasks.filter(t => t.workflowStage === filterStage)
    : workflowTasks;

  const tabCounts = {
    WORKFLOW: workflowTasks.length,
    JOB_BOARD: jobBoard.length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Task Board PdM Rotating
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Workflow 4-stage: DC → Analisis → AVP → SAP</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterMonth} onChange={e => setFilterMonth(parseInt(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            {monthNames.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={fetchAll} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-200 transition">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Stage Filter Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-gray-500">Filter Stage:</span>
        <button
          onClick={() => setFilterStage('')}
          className={`text-xs px-3 py-1 rounded-full border transition ${!filterStage ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
          Semua
        </button>
        {STAGES.filter(s => s.key !== 'CLOSED').map(s => (
          <button key={s.key} onClick={() => setFilterStage(s.key)}
            className={`text-xs px-3 py-1 rounded-full border transition ${filterStage === s.key ? s.color + ' border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
            {s.full}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'WORKFLOW', label: `Tugas Saya (${tabCounts.WORKFLOW})` },
          { key: 'JOB_BOARD', label: `Job Board (${tabCounts.JOB_BOARD})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Memuat task...</div>
      ) : tab === 'WORKFLOW' ? (
        filteredWorkflow.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada task aktif untuk Anda bulan ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflow.map(occ => (
              <TaskBox key={occ.id} occ={occ} onAction={handleAction} manpowers={manpowers} userRole={userRole} userMpId={userMpId} />
            ))}
          </div>
        )
      ) : (
        jobBoard.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
            <p>Tidak ada task yang belum memiliki PIC.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobBoard.map(occ => (
              <div key={occ.id} className="rounded-xl border-2 border-gray-200 bg-gray-50 shadow-sm p-4 space-y-3">
                <div>
                  <p className="font-bold text-gray-800">{occ.rule?.pabrik?.nama_pabrik} – {occ.rule?.subArea}</p>
                  <p className="text-sm text-gray-500">{occ.rule?.taskName}</p>
                  <p className="text-xs text-gray-400 mt-1">Scheduled: {occ.scheduledDate ? new Date(occ.scheduledDate).toLocaleDateString('id-ID') : '-'}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${occ.rule?.criticality === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {occ.rule?.criticality === 'CRITICAL' ? 'Critical' : 'Non Critical'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">{occ.rule?.equipmentCat}</span>
                </div>
                <button onClick={() => handleAction('claim', occ.id)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                  Ambil Task
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
