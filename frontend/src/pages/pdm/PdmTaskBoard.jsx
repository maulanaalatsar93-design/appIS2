import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Play, Square, CheckCircle, UserCheck, Clock, AlertTriangle,
  AlertOctagon, ChevronDown, ChevronUp, History, RefreshCw, Database,
  BarChart2, ChevronRight, Filter, Users, X
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
  SCHEDULED:   { badge: 'bg-gray-100 text-gray-600 border border-gray-200', label: 'Scheduled' },
  ASSIGNED:    { badge: 'bg-blue-50 text-blue-700 border border-blue-200', label: 'Assigned' },
  IN_PROGRESS: { badge: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'In Progress' },
  ON_HOLD:     { badge: 'bg-slate-100 text-slate-600 border border-slate-300', label: 'On Hold' },
  COMPLETED:   { badge: 'bg-green-50 text-green-700 border border-green-200', label: 'Completed' },
  OVERDUE:     { badge: 'bg-red-50 text-red-700 border border-red-200', label: 'Overdue' },
};

// ── Stage Progress Bar ───────────────────────────────────────────────────────
function WorkflowProgress({ workflowStage }) {
  const currentOrder = STAGE_ORDER[workflowStage] || 1;
  return (
    <div className="flex items-center w-full mt-2">
      {STAGES.map((s, i) => {
        const order = i + 1;
        const done = currentOrder > order;
        const active = currentOrder === order;
        
        let circleClass = 'w-5 h-5 bg-gray-100 text-gray-400 border border-gray-200';
        if (done) circleClass = 'w-5 h-5 bg-green-500 text-white shadow-sm';
        else if (active) {
           const colorBase = s.color.split('-')[1] || 'blue';
           circleClass = `w-6 h-6 ${s.color} ring-2 ring-offset-1 ring-${colorBase}-300 shadow-sm`;
        }

        return (
          <React.Fragment key={s.key}>
            <div className={`flex items-center justify-center rounded-full text-[9px] font-bold transition-all z-10 shrink-0 ${circleClass}`} title={s.full}>
              {done ? <CheckCircle className="w-3 h-3" /> : s.label}
            </div>
            {i < STAGES.length - 1 && (
              <div className={`flex-1 h-1 -mx-1 z-0 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4 border border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg font-display">Hold Task</h3>
        <p className="text-sm text-gray-500">Masukkan alasan hold. Waktu hold tidak akan dihitung sebagai man-hours.</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Alasan hold (wajib)..."
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-amber-300"
        />
        <div className="flex gap-2">
          <button
            onClick={() => { if (reason.trim()) onConfirm(reason); }}
            disabled={!reason.trim()}
            className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition shadow-sm disabled:opacity-40">
            Confirm Hold
          </button>
          <button onClick={onCancel} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Batal</button>
        </div>
      </div>
    </div>
  );
}

// ── AVP Reject Modal ─────────────────────────────────────────────────────────
function RejectModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4 border border-red-100">
        <h3 className="font-bold text-red-700 text-lg font-display">Reject / Revisi</h3>
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
            className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition shadow-sm disabled:opacity-40">
            Kirim Revisi
          </button>
          <button onClick={onCancel} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Batal</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Helper Modal ─────────────────────────────────────────────────────────
function AddHelperModal({ onConfirm, onCancel, manpowers, occ }) {
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [showOutsideArea, setShowOutsideArea] = useState(false);

  const mps = (Array.isArray(manpowers) ? manpowers : []).filter(m => {
    if (!m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (m.id === occ.assignedToId || m.id === occ.dataCollectorId || m.id === occ.analystId) return false;

    const occArea = `${occ?.rule?.pabrik?.nama_pabrik || ''} ${occ?.rule?.subArea || ''}`.trim().toLowerCase();
    const mArea = (m.sub_area || '').toLowerCase();
    
    const isOccPphs = ['pphs', 'osbl', 'conveyor ubs', 'conveyor bsl', 'batubara boiler', 'batu bara boiler'].some(kw => occArea.includes(kw));
    const isMPPphs = ['pphs', 'osbl'].some(kw => mArea.includes(kw));
    
    let isSameArea = false;
    if (isOccPphs && isMPPphs && occArea.includes('6') && mArea.includes('6')) {
      isSameArea = true;
    } else {
      isSameArea = mArea === occArea;
    }

    if (!showOutsideArea && !isSameArea) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh] border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 font-display"><Users className="w-5 h-5 text-navy-600" /> Tambah Rekan Kerja</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <input 
            type="text" placeholder="Cari nama rekan..." 
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-300 transition-all"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="px-4 py-2 border-b border-gray-100 bg-white flex items-center gap-2">
          <input 
            type="checkbox" 
            id="crossArea" 
            checked={showOutsideArea} 
            onChange={e => setShowOutsideArea(e.target.checked)}
            className="rounded border-gray-300 text-navy-600 focus:ring-navy-500 w-4 h-4"
          />
          <label htmlFor="crossArea" className="text-[11px] font-medium text-gray-700 cursor-pointer">
            Tampilkan rekan lintas area <span className="text-orange-500 font-bold">(Butuh Izin Admin)</span>
          </label>
        </div>
        <div className="p-0 overflow-y-auto flex-1 bg-white">
          {mps.length === 0 ? (
             <p className="p-6 text-center text-sm text-gray-400 italic">Tidak ada personel ditemukan</p>
          ) : (
             <div className="divide-y divide-gray-50">
               {mps.map(m => (
                 <div key={m.id} 
                      onClick={() => setSelectedId(m.id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${selectedId === m.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                    <div>
                      <p className={`text-sm font-semibold ${selectedId === m.id ? 'text-blue-800' : 'text-gray-700'}`}>{m.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{m.position || '-'} | {m.sub_area || 'Area belum diset'}</p>
                    </div>
                    {selectedId === m.id ? <CheckCircle className="w-4 h-4 text-blue-600" /> : <div className="w-4 h-4 rounded-full border border-gray-300"></div>}
                 </div>
               ))}
             </div>
          )}
        </div>
        <div className="p-4 flex gap-2 border-t border-gray-100 bg-gray-50">
          <button onClick={() => { if (selectedId) onConfirm(selectedId); }} disabled={!selectedId} className="flex-1 py-2 text-sm font-semibold bg-navy-600 text-white rounded-lg hover:bg-navy-700 disabled:opacity-50 transition shadow-sm">Tambah Rekan</button>
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">Batal</button>
        </div>
      </div>
    </div>
  );
}

// ── Task Box ─────────────────────────────────────────────────────────────────
function TaskBox({ occ, onAction, manpowers, userRole, userMpId, isAdmin: globalIsAdmin }) {
  const [reassignOpen, setReassignOpen] = useState(false);
  const [newPicId, setNewPicId] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAddHelper, setShowAddHelper] = useState(false);

  const isAdmin = globalIsAdmin || ['admin', 'manager', 'supervisor'].includes(userRole);

  const filteredManpowers = (Array.isArray(manpowers) ? manpowers : []).filter(m => {
    if (!m) return false;
    if (isAdmin || ['admin', 'manager', 'supervisor', 'avp'].includes((userRole || '').toLowerCase())) return true;
    if ((userRole || '').toLowerCase() === 'analyst') {
      const occArea = `${occ?.rule?.pabrik?.nama_pabrik || ''} ${occ?.rule?.subArea || ''}`.trim().toLowerCase();
      const mArea = (m.sub_area || '').toLowerCase();
      
      const isOccPphs = ['pphs', 'osbl', 'conveyor ubs', 'conveyor bsl', 'batubara boiler', 'batu bara boiler'].some(kw => occArea.includes(kw));
      const isMPPphs = ['pphs', 'osbl'].some(kw => mArea.includes(kw));
      
      if (isOccPphs && isMPPphs && occArea.includes('6') && mArea.includes('6')) {
        return true;
      }
      return mArea === occArea;
    }
    return true;
  });

  const now = new Date();
  const daysLate = !['COMPLETED', 'CANCELLED'].includes(occ.status) && occ.workflowStage !== 'CLOSED'
    ? Math.max(0, Math.floor((now - new Date(occ.scheduledDate)) / 86400000))
    : 0;
  
  const statusKey = daysLate > 0 ? 'OVERDUE' : occ.status;
  const style = STATUS_STYLE[statusKey] || STATUS_STYLE.ASSIGNED;
  const stage = occ.workflowStage || 'DC_COLLECTION';

  const fmt = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const isDC = ['staff', 'data_collector', 'technician'].includes(userRole);
  const isAnalyst = userRole === 'analyst';
  const isAVP = userRole?.startsWith('avp');
  
  const isAssigned = occ.assignedToId === userMpId;

  const showDcActions = (isDC || isAdmin || isAssigned) && stage === 'DC_COLLECTION';
  const showAnalysisActions = (isAnalyst || isAdmin || isAssigned) && stage === 'ANALYSIS';
  const showAvpActions = (isAVP || isAdmin || isAssigned) && stage === 'AVP_APPROVAL';
  const showSapActions = (isDC || isAdmin || isAssigned) && stage === 'SAP_UPLOAD';

  return (
    <div className={`relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${daysLate > 0 ? 'ring-1 ring-red-300' : ''}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${occ.rule?.criticality === 'CRITICAL' ? 'bg-red-500' : 'bg-blue-500'}`} />

      <div className="p-4 pl-5 space-y-4 flex-1">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-gray-900 text-[15px] leading-tight group-hover:text-navy-700 transition-colors">
              {occ.rule?.code}
            </h3>
            <p className="text-xs font-semibold text-navy-600 mt-1">
              {occ.rule?.pabrik?.nama_pabrik} <span className="text-gray-400 mx-1">→</span> {occ.rule?.subArea}
            </p>
            {occ.rule?.taskName && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{occ.rule?.taskName}</p>}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
             <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wide uppercase ${style.badge}`}>
               {style.label}
             </span>
             {occ.rule?.equipmentCat && <span className="text-[10px] px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded font-bold uppercase">{occ.rule.equipmentCat}</span>}
          </div>
        </div>

        <WorkflowProgress workflowStage={stage} />

        <hr className="border-gray-100" />

        {/* Dates and Assignment */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="block text-gray-400 mb-0.5">Jadwal Target</span> 
            <span className="font-medium text-gray-800 flex items-center gap-1">
               <Clock className="w-3.5 h-3.5 text-gray-400" /> {fmt(occ.scheduledDate)}
            </span>
          </div>
          <div>
            <span className="block text-gray-400 mb-0.5">Assigned To</span>
            <span className="font-medium text-gray-800 flex items-center gap-1 line-clamp-1">
               <UserCheck className="w-3.5 h-3.5 text-gray-400" /> {occ.assignedTo?.name || 'Belum Ada'}
            </span>
          </div>
          
          {daysLate > 0 && (
            <div className="col-span-2 flex items-center gap-1.5 text-red-700 font-semibold bg-red-50 p-2 rounded-lg border border-red-100 shadow-sm mt-1">
              <AlertOctagon className="w-4 h-4" /> Terlambat {daysLate} hari
            </div>
          )}
        </div>

        {/* Personnel info details */}
        <div className="space-y-1 text-[11px] bg-gray-50 p-2 rounded-lg border border-gray-100">
          {occ.dataCollector && <p className="text-gray-500 flex justify-between"><span>Data Collector:</span> <span className="font-medium text-gray-700">{occ.dataCollector.name}</span></p>}
          {occ.analyst && <p className="text-gray-500 flex justify-between"><span>Analyst:</span> <span className="font-medium text-gray-700">{occ.analyst.name}</span></p>}
          {occ.avp && <p className="text-gray-500 flex justify-between"><span>AVP:</span> <span className="font-medium text-gray-700">{occ.avp.name}</span></p>}
          {!occ.dataCollector && !occ.analyst && <p className="text-gray-400 italic text-center">Menunggu aksi PIC</p>}
        </div>

        {occ.avpRejectedReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 shadow-sm">
            <span className="font-bold block mb-0.5">Catatan Revisi AVP:</span> {occ.avpRejectedReason}
          </div>
        )}

        {occ.picHistories?.length > 0 && (
          <div>
            <button onClick={() => setHistoryOpen(!historyOpen)} className="text-[11px] text-navy-600 hover:text-navy-800 font-medium flex items-center gap-1">
              <History className="w-3 h-3" /> Riwayat Perubahan PIC ({occ.picHistories.length})
            </button>
            {historyOpen && (
              <div className="bg-white rounded-lg border border-gray-200 p-2 text-[10px] space-y-1.5 mt-2 shadow-sm">
                {occ.picHistories.map(h => (
                  <div key={h.id} className="flex gap-2 text-gray-600 border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-gray-400 shrink-0">{new Date(h.changedAt).toLocaleDateString('id-ID')}</span>
                    <span className="truncate">{h.fromPic?.name || 'awal'} → <strong className="text-gray-800">{h.toPic?.name}</strong></span>
                    <span className="text-orange-500 shrink-0">({h.reason})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {occ.helpers?.filter(h => h.stage === stage).length > 0 && (
          <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-2 text-[11px]">
            <span className="font-bold text-blue-800 block mb-1">Rekan Kerja ({stage}):</span>
            <div className="space-y-1">
              {occ.helpers.filter(h => h.stage === stage).map(h => (
                <div key={h.id} className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-500" /> {h.manPower?.name}
                  </span>
                  {h.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                       <span className="text-orange-500 font-bold bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">Pending Izin</span>
                       {isAdmin && (
                         <div className="flex items-center gap-1">
                           <button onClick={() => onAction('approve-helper', h.id)} className="w-5 h-5 rounded bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 flex justify-center items-center" title="Setujui">
                             <CheckCircle className="w-3.5 h-3.5" />
                           </button>
                           <button onClick={() => onAction('reject-helper', h.id)} className="w-5 h-5 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex justify-center items-center" title="Tolak">
                             <X className="w-3.5 h-3.5" />
                           </button>
                         </div>
                       )}
                    </div>
                  ) : h.status === 'APPROVED' ? (
                    <span className="text-green-600 font-bold">Disetujui</span>
                  ) : (
                    <span className="text-red-500 font-bold">Ditolak</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {showDcActions && occ.status === 'ASSIGNED' && (
            <button onClick={() => onAction('start', occ.id)} className="flex-1 flex justify-center items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition">
              <Play className="w-3.5 h-3.5" /> Mulai DC
            </button>
          )}
          {showDcActions && occ.status === 'ON_HOLD' && (
            <button onClick={() => onAction('workflow-resume', occ.id)} className="flex-1 flex justify-center items-center gap-1 px-3 py-2 bg-navy-700 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 shadow-sm transition">
              <Play className="w-3.5 h-3.5" /> Lanjutkan
            </button>
          )}
          {showDcActions && occ.status === 'IN_PROGRESS' && (
            <>
              <button onClick={() => setShowAddHelper(true)} className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 shadow-sm transition">
                <Users className="w-3.5 h-3.5" /> Rekan
              </button>
              <button onClick={() => setShowHoldModal(true)} className="flex items-center justify-center gap-1 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 shadow-sm transition">
                <Square className="w-3.5 h-3.5" /> Hold
              </button>
              <button onClick={() => onAction('finish-dc', occ.id)} className="flex-1 flex justify-center items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 shadow-sm transition">
                <CheckCircle className="w-3.5 h-3.5" /> Selesai DC
              </button>
            </>
          )}

          {showAnalysisActions && occ.status === 'ASSIGNED' && (
            <button onClick={() => onAction('start-analysis', occ.id)} className="flex-1 flex justify-center items-center gap-1 px-3 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 shadow-sm transition">
              <Play className="w-3.5 h-3.5" /> Mulai Analisis
            </button>
          )}
          {showAnalysisActions && occ.status === 'ON_HOLD' && (
            <button onClick={() => onAction('workflow-resume', occ.id)} className="flex-1 flex justify-center items-center gap-1 px-3 py-2 bg-navy-700 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 shadow-sm transition">
              <Play className="w-3.5 h-3.5" /> Lanjutkan
            </button>
          )}
          {showAnalysisActions && occ.status === 'IN_PROGRESS' && (
            <>
              <button onClick={() => setShowAddHelper(true)} className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 shadow-sm transition">
                <Users className="w-3.5 h-3.5" /> Rekan
              </button>
              <button onClick={() => setShowHoldModal(true)} className="flex items-center justify-center gap-1 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 shadow-sm transition">
                <Square className="w-3.5 h-3.5" /> Hold
              </button>
              <button onClick={() => onAction('finish-analysis', occ.id)} className="flex-1 flex justify-center items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 shadow-sm transition">
                <CheckCircle className="w-3.5 h-3.5" /> Selesai Analisis
              </button>
            </>
          )}

          {showAvpActions && (
            <>
              <button onClick={() => setShowRejectModal(true)} className="flex items-center justify-center gap-1 px-3 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-50 shadow-sm transition">
                <Square className="w-3.5 h-3.5" /> Revisi
              </button>
              <button onClick={() => onAction('avp-approve', occ.id)} className="flex-1 flex justify-center items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 shadow-sm transition">
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
            </>
          )}

          {showSapActions && (
            <button onClick={() => onAction('sap-upload', occ.id)} className="flex-1 flex justify-center items-center gap-1 px-3 py-2 bg-[#FF7410] text-white rounded-lg text-xs font-semibold hover:bg-orange-600 shadow-sm transition">
              <Database className="w-3.5 h-3.5" /> Selesai Upload SAP
            </button>
          )}

          {(isAdmin || ['analyst', 'avp'].includes((userRole || '').toLowerCase())) && (
            <button onClick={() => setReassignOpen(!reassignOpen)} className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-100 transition w-full mt-1">
              <UserCheck className="w-3.5 h-3.5" /> Delegasi / Ganti PIC
            </button>
          )}
        </div>

        {reassignOpen && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 mt-2 shadow-sm">
            <p className="text-xs font-bold text-gray-700">Pilih PIC Pengganti</p>
            <select value={newPicId} onChange={e => setNewPicId(e.target.value)} className="w-full text-xs border border-gray-300 rounded-md p-2 bg-white">
              <option value="">-- Pilih Personel --</option>
              {filteredManpowers.map(m => <option key={m.id} value={m.id}>{m.name} – {m.position} ({m.sub_area || 'No Area'})</option>)}
            </select>
            <input value={reasonInput} onChange={e => setReasonInput(e.target.value)} placeholder="Alasan perpindahan (wajib)" className="w-full text-xs border border-gray-300 rounded-md p-2 bg-white" />
            <div className="flex gap-2">
              <button onClick={() => { onAction('reassign', occ.id, { newPicId, reason: reasonInput }); setReassignOpen(false); }} className="flex-1 py-1.5 bg-navy-600 text-white rounded-md text-xs font-bold hover:bg-navy-800 shadow-sm">Simpan</button>
              <button onClick={() => setReassignOpen(false)} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-50">Batal</button>
            </div>
          </div>
        )}
      </div>

      {showHoldModal && (
        <HoldModal onConfirm={reason => { onAction('workflow-hold', occ.id, { reason }); setShowHoldModal(false); }} onCancel={() => setShowHoldModal(false)} />
      )}
      {showRejectModal && (
        <RejectModal onConfirm={reason => { onAction('avp-reject', occ.id, { reason }); setShowRejectModal(false); }} onCancel={() => setShowRejectModal(false)} />
      )}
      {showAddHelper && (
        <AddHelperModal 
          occ={occ} manpowers={manpowers} 
          onConfirm={helperId => { onAction('add-helper', occ.id, { helperId }); setShowAddHelper(false); }} 
          onCancel={() => setShowAddHelper(false)} 
        />
      )}
    </div>
  );
}

// ── Job Board Box ────────────────────────────────────────────────────────────
function JobBoardBox({ occ, onAction, manpowers, userRole, isAdmin, claimLabel = 'Ambil Task', claimAction = 'claim', badgeColor = 'bg-blue-100 text-blue-700 border-blue-200', badgeLabel = 'DC Collection' }) {
  const [reassignOpen, setReassignOpen] = useState(false);
  const [newPicId, setNewPicId] = useState('');
  const [reasonInput, setReasonInput] = useState('');

  const filteredManpowers = (Array.isArray(manpowers) ? manpowers : []).filter(m => {
    if (!m) return false;
    if (isAdmin || ['admin', 'manager', 'supervisor', 'avp'].includes((userRole || '').toLowerCase())) return true;
    if ((userRole || '').toLowerCase() === 'analyst') {
      const occArea = `${occ?.rule?.pabrik?.nama_pabrik || ''} ${occ?.rule?.subArea || ''}`.trim().toLowerCase();
      const mArea = (m.sub_area || '').toLowerCase();
      const isOccPphs = ['pphs', 'osbl', 'conveyor ubs', 'conveyor bsl', 'batubara boiler', 'batu bara boiler'].some(kw => occArea.includes(kw));
      const isMPPphs = ['pphs', 'osbl'].some(kw => mArea.includes(kw));
      if (isOccPphs && isMPPphs && occArea.includes('6') && mArea.includes('6')) return true;
      return mArea === occArea;
    }
    return true;
  });
  
  const isSpecialRole = isAdmin || ['analyst', 'avp'].includes((userRole || '').toLowerCase());
  const fmt = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-';

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 p-4 flex flex-col justify-between overflow-hidden group">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${occ.rule?.criticality === 'CRITICAL' ? 'bg-red-500' : 'bg-blue-400'}`} />
      
      <div className="space-y-3 flex-1 pl-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-gray-800 text-[15px] leading-tight group-hover:text-navy-700 transition-colors">
              {occ.rule?.pabrik?.nama_pabrik}
            </h4>
            <p className="text-[13px] font-semibold text-navy-600 mt-0.5">{occ.rule?.subArea}</p>
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{occ.rule?.taskName}</p>
          </div>
          <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${badgeColor}`}>
            {badgeLabel}
          </span>
        </div>

        <div className="flex gap-2 text-[10px] flex-wrap">
          <span className={`px-2 py-0.5 rounded uppercase font-bold border ${occ.rule?.criticality === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
            {occ.rule?.criticality === 'CRITICAL' ? '⚠ Critical' : 'Non Critical'}
          </span>
          <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-600 font-bold uppercase">{occ.rule?.equipmentCat}</span>
        </div>

        {occ.dataCollector && (
          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
            DC: <span className="font-medium text-gray-700">{occ.dataCollector.name}</span>
          </p>
        )}

        {occ.helpers?.length > 0 && (
          <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-2 text-[11px]">
            <span className="font-bold text-blue-800 block mb-1">Rekan Kerja:</span>
            <div className="space-y-1">
              {occ.helpers.map(h => (
                <div key={h.id} className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium flex items-center gap-1 line-clamp-1">
                    <Users className="w-3 h-3 text-blue-500 shrink-0" /> {h.manPower?.name}
                  </span>
                  {h.status === 'PENDING' ? (
                    <span className="text-orange-500 font-bold bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">Pending</span>
                  ) : h.status === 'APPROVED' ? (
                    <span className="text-green-600 font-bold">Disetujui</span>
                  ) : (
                    <span className="text-red-500 font-bold">Ditolak</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <Clock className="w-3.5 h-3.5 text-gray-400" /> Target: {fmt(occ.scheduledDate)}
        </div>
      </div>
      
      <div className="mt-4 space-y-2 pl-2">
        <button onClick={() => onAction(claimAction, occ.id)}
          className={`w-full py-2 text-white rounded-lg text-xs font-bold transition shadow-sm ${
            badgeColor.includes('amber') ? 'bg-[#FF7410] hover:bg-orange-600' : 'bg-[#193B8F] hover:bg-navy-800'
          }`}>
          {claimLabel}
        </button>

        {isSpecialRole && (
          <button onClick={() => setReassignOpen(!reassignOpen)} className="w-full py-2 bg-white text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition border border-gray-300 shadow-sm flex justify-center items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Assign Langsung
          </button>
        )}

        {reassignOpen && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 mt-2 shadow-sm">
            <p className="text-xs font-bold text-gray-700">Assign ke Personel</p>
            <select value={newPicId} onChange={e => setNewPicId(e.target.value)} className="w-full text-xs border border-gray-300 rounded-md p-2 bg-white">
              <option value="">-- Pilih Personel --</option>
              {filteredManpowers.map(m => <option key={m.id} value={m.id}>{m.name} – {m.position} ({m.sub_area || 'No Area'})</option>)}
            </select>
            <input value={reasonInput} onChange={e => setReasonInput(e.target.value)} placeholder="Alasan (wajib)" className="w-full text-xs border border-gray-300 rounded-md p-2 bg-white" />
            <div className="flex gap-2">
              <button 
                onClick={() => { 
                  if(newPicId && reasonInput) { onAction('reassign', occ.id, { newPicId, reason: reasonInput }); setReassignOpen(false); } 
                  else { alert('Pilih personel dan masukkan alasan.'); }
                }} 
                className="flex-1 py-1.5 bg-[#193B8F] text-white rounded-md text-xs font-bold hover:bg-navy-800 shadow-sm">
                Simpan
              </button>
              <button onClick={() => setReassignOpen(false)} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-50">Batal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main PdmTaskBoard ────────────────────────────────────────────────────────
export default function PdmTaskBoard() {
  const [tab, setTab] = useState('WORKFLOW');
  const [workflowTasks, setWorkflowTasks] = useState([]);
  const [dcTasks, setDcTasks] = useState([]);        
  const [analysisTasks, setAnalysisTasks] = useState([]); 
  const [manpowers, setManpowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterStage, setFilterStage] = useState('');

  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const userPayload = (() => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return {}; }
  })();
  const userRole = userPayload.role || 'staff';
  const userMpId = userPayload.man_power_id;
  const isAdminUser = ['admin', 'manager', 'supervisor'].includes(userRole);

  useEffect(() => { fetchAll(); }, [filterMonth, filterYear, tab]);
  useEffect(() => { fetchManpowers(); }, []);

  const safeArray = (data) => Array.isArray(data) ? data : [];

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = `year=${filterYear}&month=${filterMonth}`;
      const [wfRes, jbRes] = await Promise.all([
        fetch(`${api}/api/pdm-schedule/workflow-tasks?${params}`, { headers }),
        fetch(`${api}/api/pdm-schedule/job-board?${params}`, { headers }),
      ]);
      
      if (wfRes.ok) {
        const wfData = await wfRes.json();
        setWorkflowTasks(safeArray(wfData));
      }
      if (jbRes.ok) {
        const jbData = await jbRes.json();
        if (jbData && typeof jbData === 'object' && 'dcTasks' in jbData) {
          setDcTasks(jbData.dcTasks || []);
          setAnalysisTasks(jbData.analysisTasks || []);
        } else {
          setDcTasks(Array.isArray(jbData) ? jbData : []);
          setAnalysisTasks([]);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterMonth, filterYear]);

  const fetchManpowers = async () => {
    try {
      const res = await fetch(`${api}/api/dashboard/manpower`, { headers });
      if (res.ok) {
        const data = await res.json();
        setManpowers(safeArray(data));
      }
    } catch (e) {
      setManpowers([]);
    }
  };

  const handleAction = async (action, id, extra = {}) => {
    const legacyMap = { start: 'start', hold: 'hold', complete: 'complete', reassign: 'reassign', claim: 'claim', 'add-helper': 'helpers' };
    let endpoint = legacyMap[action] || action;
    let url = `${api}/api/pdm-schedule/occurrences/${id}/${endpoint}`;

    // Handle helper approve/reject specifically since they use a different base path
    if (action === 'approve-helper') {
      url = `${api}/api/pdm-schedule/helpers/${id}/approve`;
    } else if (action === 'reject-helper') {
      url = `${api}/api/pdm-schedule/helpers/${id}/reject`;
    }

    try {
      const res = await fetch(url, {
        method: action === 'assign-personnel' || action.includes('helper') && action !== 'add-helper' ? 'PATCH' : 'POST',
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

  const totalJobBoard = dcTasks.length + analysisTasks.length;

  const tabCounts = {
    WORKFLOW: workflowTasks.length,
    JOB_BOARD: totalJobBoard,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Global Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-[#193B8F]" />
            Task Board
          </h1>
          <p className="text-gray-500 text-[13px] mt-1 font-medium">Monitoring progress pekerjaan Data Collection hingga Upload SAP.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
            <select value={filterMonth} onChange={e => setFilterMonth(parseInt(e.target.value))} className="text-sm font-semibold text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer pr-8 py-1.5 outline-none">
              {monthNames.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
            </select>
            <div className="w-px bg-gray-300 my-1 mx-1"></div>
            <select value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))} className="text-sm font-semibold text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer pr-8 py-1.5 outline-none">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={fetchAll} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-[#193B8F] transition shadow-sm group" title="Refresh">
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Panel: Tabs & Stage Filters (Sticky on desktop) */}
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 flex flex-row md:flex-col gap-1">
            <button 
              onClick={() => setTab('WORKFLOW')}
              className={`flex-1 flex justify-between items-center px-4 py-3 rounded-lg text-sm font-bold transition-all ${tab === 'WORKFLOW' ? 'bg-[#193B8F] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
              Tugas Saya
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${tab === 'WORKFLOW' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {tabCounts.WORKFLOW}
              </span>
            </button>
            <button 
              onClick={() => setTab('JOB_BOARD')}
              className={`flex-1 flex justify-between items-center px-4 py-3 rounded-lg text-sm font-bold transition-all ${tab === 'JOB_BOARD' ? 'bg-[#193B8F] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
              Job Board
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${tab === 'JOB_BOARD' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {tabCounts.JOB_BOARD}
              </span>
            </button>
          </div>

          {tab === 'WORKFLOW' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hidden md:block">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Filter className="w-3.5 h-3.5"/> Filter Stage</h3>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setFilterStage('')}
                  className={`text-left text-[13px] px-3 py-2 rounded-lg font-medium transition-all ${!filterStage ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
                  Tampilkan Semua
                </button>
                {STAGES.filter(s => s.key !== 'CLOSED').map(s => (
                  <button key={s.key} onClick={() => setFilterStage(s.key)}
                    className={`text-left text-[13px] px-3 py-2 rounded-lg font-medium transition-all flex justify-between items-center ${filterStage === s.key ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
                    {s.full}
                    {filterStage === s.key && <div className={`w-2 h-2 rounded-full ${s.color.split(' ')[0]}`} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Content Grid */}
        <div className="flex-1 min-w-0">
          {/* Mobile Filter Stage (Horizontal Scroll) */}
          {tab === 'WORKFLOW' && (
            <div className="md:hidden flex overflow-x-auto pb-2 mb-4 gap-2 no-scrollbar">
              <button
                onClick={() => setFilterStage('')}
                className={`shrink-0 text-xs px-4 py-2 rounded-full font-bold border transition ${!filterStage ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>
                Semua
              </button>
              {STAGES.filter(s => s.key !== 'CLOSED').map(s => (
                <button key={s.key} onClick={() => setFilterStage(s.key)}
                  className={`shrink-0 text-xs px-4 py-2 rounded-full font-bold border transition flex items-center gap-2 ${filterStage === s.key ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>
                  <div className={`w-2 h-2 rounded-full ${s.color.split(' ')[0]}`} /> {s.full}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#193B8F]"></div>
            </div>
          ) : (
            <>
              {tab === 'WORKFLOW' && (
                <div className="space-y-4">
                  {filteredWorkflow.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm">
                      <p className="text-gray-500 font-medium">Tidak ada tugas pada tahap ini.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredWorkflow.map(occ => (
                        <TaskBox key={occ.id} occ={occ} onAction={handleAction} manpowers={manpowers} userRole={userRole} userMpId={userMpId} isAdmin={isAdminUser} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'JOB_BOARD' && (
                <div className="space-y-8">
                  {dcTasks.length === 0 && analysisTasks.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm">
                      <p className="text-gray-500 font-medium">Hore! Tidak ada task yang perlu diambil saat ini.</p>
                    </div>
                  ) : (
                    <>
                      {dcTasks.length > 0 && (
                        <div className="space-y-3">
                          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                            Tugas Data Collection ({dcTasks.length})
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {dcTasks.map(occ => (
                              <JobBoardBox key={occ.id} occ={occ} onAction={handleAction} manpowers={manpowers} userRole={userRole} isAdmin={isAdminUser} badgeColor="bg-blue-50 text-blue-700 border-blue-200" badgeLabel="DC Collection" claimLabel="Ambil Task DC" claimAction="claim" />
                            ))}
                          </div>
                        </div>
                      )}

                      {analysisTasks.length > 0 && (
                        <div className="space-y-3">
                          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                            Tugas Analisis ({analysisTasks.length})
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {analysisTasks.map(occ => (
                              <JobBoardBox key={occ.id} occ={occ} onAction={handleAction} manpowers={manpowers} userRole={userRole} isAdmin={isAdminUser} badgeColor="bg-amber-50 text-amber-700 border-amber-200" badgeLabel="Analisis Data" claimLabel="Ambil Task Analisis" claimAction="claim-analysis" />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
