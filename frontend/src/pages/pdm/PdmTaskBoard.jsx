import React, { useState, useEffect } from 'react';
import { ClipboardList, Play, Square, CheckCircle, UserCheck, Clock, AlertTriangle, AlertOctagon, ChevronDown, ChevronUp, History } from 'lucide-react';

const STATUS_STYLE = {
  SCHEDULED:   { bg: 'bg-gray-50 border-gray-200',   badge: 'bg-gray-100 text-gray-600',    label: 'Scheduled' },
  ASSIGNED:    { bg: 'bg-blue-50 border-blue-200',    badge: 'bg-blue-100 text-blue-700',    label: 'Assigned' },
  IN_PROGRESS: { bg: 'bg-amber-50 border-amber-200',  badge: 'bg-amber-100 text-amber-700',  label: 'In Progress' },
  ON_HOLD:     { bg: 'bg-orange-50 border-orange-200',badge: 'bg-orange-100 text-orange-700',label: 'On Hold' },
  COMPLETED:   { bg: 'bg-green-50 border-green-200',  badge: 'bg-green-100 text-green-700',  label: 'Completed' },
  OVERDUE:     { bg: 'bg-red-50 border-red-200',      badge: 'bg-red-100 text-red-700',      label: 'Overdue' },
};

function TaskBox({ occ, onAction, manpowers }) {
  const [expanded, setExpanded] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [newPicId, setNewPicId] = useState('');
  const [reason, setReason] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  const now = new Date();
  const daysLate = !['COMPLETED','CANCELLED'].includes(occ.status)
    ? Math.max(0, Math.floor((now - new Date(occ.scheduledDate)) / 86400000))
    : 0;
  const statusKey = daysLate > 0 && !['COMPLETED','CANCELLED'].includes(occ.status) ? 'OVERDUE' : occ.status;
  const style = STATUS_STYLE[statusKey] || STATUS_STYLE.ASSIGNED;

  const targetDateStr = occ.targetDate ? new Date(occ.targetDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const scheduledDateStr = occ.scheduledDate ? new Date(occ.scheduledDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className={`rounded-xl border-2 ${style.bg} shadow-sm overflow-hidden`}>
      {/* Header strip berdasarkan kritikalitas */}
      <div className={`h-1 w-full ${occ.rule?.criticality === 'CRITICAL' ? 'bg-red-400' : 'bg-blue-300'}`} />

      <div className="p-4 space-y-3">
        {/* ── TASK PROGRAM ──────────────────────────── */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Task Program</p>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-gray-800">{occ.rule?.pabrik?.nama_pabrik} – <span className="text-blue-600">{occ.rule?.equipmentCat}</span></p>
              <p className="text-sm text-gray-600">{occ.rule?.criticality === 'CRITICAL' ? 'PdM Critical' : 'PdM Non Critical'} – {occ.rule?.subArea}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${style.badge}`}>{style.label}</span>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* ── TASK PdM ──────────────────────────────── */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Task PdM</p>
          <p className="text-sm font-medium text-gray-700">{occ.rule?.taskName}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <UserCheck className="w-3.5 h-3.5" />
            <span>PIC: <span className="font-medium text-gray-700">{occ.assignedTo?.name || <em>Belum ada</em>}</span></span>
          </div>
          {occ.picHistories?.length > 0 && (
            <button onClick={() => setHistoryOpen(!historyOpen)} className="mt-1 text-xs text-blue-500 hover:underline flex items-center gap-1">
              <History className="w-3 h-3" /> {occ.picHistories.length} perubahan PIC
            </button>
          )}
          {historyOpen && (
            <div className="mt-2 space-y-1 bg-white rounded-lg border border-gray-200 p-2 text-xs">
              {occ.picHistories.map(h => (
                <div key={h.id} className="flex gap-2 text-gray-600">
                  <span className="text-gray-400 shrink-0">{new Date(h.changedAt).toLocaleDateString('id-ID')}</span>
                  <span>{h.fromPic?.name || 'awal'} → <strong>{h.toPic?.name}</strong></span>
                  <span className="text-orange-500">({h.reason})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* ── TASK ORDER ────────────────────────────── */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Task Order</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
            <div><span className="text-gray-400">Target:</span> <span className="font-medium">{targetDateStr}</span></div>
            <div>
              <span className="text-gray-400">Scheduled:</span> <span className="font-medium">{scheduledDateStr}</span>
              {occ.wasShifted && <span className="ml-1 text-orange-500 text-[10px]">(geser)</span>}
            </div>
            <div><span className="text-gray-400">Status:</span> <span className={`font-semibold ${daysLate > 4 ? 'text-red-600' : daysLate > 0 ? 'text-orange-500' : 'text-gray-700'}`}>{style.label}</span></div>
            {daysLate > 0 && (
              <div className="flex items-center gap-1">
                {daysLate > 4 ? <AlertOctagon className="w-3 h-3 text-red-500" /> : <AlertTriangle className="w-3 h-3 text-orange-400" />}
                <span className={`font-bold ${daysLate > 4 ? 'text-red-600' : 'text-orange-500'}`}>+{daysLate} hari terlambat</span>
              </div>
            )}
          </div>
        </div>

        {/* ── ACTION BUTTONS ─────────────────────────── */}
        <div className="flex flex-wrap gap-2 pt-1">
          {occ.status === 'ASSIGNED' && (
            <button onClick={() => onAction('start', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition">
              <Play className="w-3 h-3" /> Mulai
            </button>
          )}
          {occ.status === 'ON_HOLD' && (
            <button onClick={() => onAction('start', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition">
              <Play className="w-3 h-3" /> Lanjutkan
            </button>
          )}
          {occ.status === 'IN_PROGRESS' && (
            <>
              <button onClick={() => onAction('hold', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-medium hover:bg-orange-200 transition">
                <Square className="w-3 h-3" /> Hold
              </button>
              <button onClick={() => onAction('complete', occ.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition">
                <CheckCircle className="w-3 h-3" /> Selesai
              </button>
            </>
          )}

          <button onClick={() => setReassignOpen(!reassignOpen)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-200 transition ml-auto">
            <UserCheck className="w-3 h-3" /> Ganti PIC
          </button>
        </div>

        {/* Reassign Form */}
        {reassignOpen && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-600">Ganti PIC</p>
            <select value={newPicId} onChange={e => setNewPicId(e.target.value)} className="w-full text-xs border border-gray-200 rounded p-2">
              <option value="">-- Pilih PIC Baru --</option>
              {manpowers.map(m => <option key={m.id} value={m.id}>{m.name} – {m.position}</option>)}
            </select>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Alasan (wajib)" className="w-full text-xs border border-gray-200 rounded p-2" />
            <div className="flex gap-2">
              <button onClick={() => { onAction('reassign', occ.id, { newPicId, reason }); setReassignOpen(false); }} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">Simpan</button>
              <button onClick={() => setReassignOpen(false)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-xs">Batal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PdmTaskBoard() {
  const [tab, setTab] = useState('MY_TASKS');
  const [myTasks, setMyTasks] = useState([]);
  const [jobBoard, setJobBoard] = useState([]);
  const [manpowers, setManpowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, [filterMonth, filterYear, tab]);
  useEffect(() => { fetchManpowers(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = `year=${filterYear}&month=${filterMonth}`;
      const [myRes, jobRes] = await Promise.all([
        fetch(`${api}/api/pdm-schedule/my-tasks?${params}`, { headers }),
        fetch(`${api}/api/pdm-schedule/job-board?${params}`, { headers }),
      ]);
      if (myRes.ok) setMyTasks(await myRes.json());
      if (jobRes.ok) setJobBoard(await jobRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchManpowers = async () => {
    const res = await fetch(`${api}/api/dashboard/manpower`, { headers });
    if (res.ok) setManpowers(await res.json());
  };

  const handleAction = async (action, id, extra = {}) => {
    const endpoints = {
      start: 'start', hold: 'hold', complete: 'complete', reassign: 'reassign', claim: 'claim'
    };
    try {
      const res = await fetch(`${api}/api/pdm-schedule/occurrences/${id}/${endpoints[action]}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(extra)
      });
      if (res.ok) { fetchAll(); }
      else {
        const err = await res.json();
        alert(err.error || 'Gagal melakukan aksi');
      }
    } catch (e) { console.error(e); }
  };

  const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Task Board PdM Rotating
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola dan pantau task inspeksi Anda</p>
        </div>

        <div className="flex items-center gap-2">
          <select value={filterMonth} onChange={e => setFilterMonth(parseInt(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            {monthNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'MY_TASKS', label: `Tugas Saya (${myTasks.length})` },
          { key: 'JOB_BOARD', label: `Job Board (${jobBoard.length})` }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Task Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Memuat task...</div>
      ) : tab === 'MY_TASKS' ? (
        myTasks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada task yang di-assign untuk Anda bulan ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTasks.map(occ => <TaskBox key={occ.id} occ={occ} onAction={handleAction} manpowers={manpowers} />)}
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
                <div className="h-1 w-full rounded bg-gray-300 -mt-4 mx-0 mb-0" />
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
                <button
                  onClick={() => handleAction('claim', occ.id)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
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
