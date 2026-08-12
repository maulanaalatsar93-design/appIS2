import React, { useState, useEffect, useMemo } from 'react';
import { Users, Edit3, X, Save, ChevronRight, AlertCircle, CheckCircle2, Calendar, RefreshCw } from 'lucide-react';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
const MONTH_FULL  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

// ── Modal Edit PIC per Pabrik per Tipe ─────────────────────────────────────
function EditRosterModal({ pabrikEntry, criticality, manpowers, api, headers, periodStart, periodEnd, onClose, onSaved }) {
  const label   = criticality === 'CRITICAL' ? 'Critical (Analyst)' : 'Non Critical (Inspector)';
  const entries = criticality === 'CRITICAL' ? pabrikEntry.critical : pabrikEntry.nonCritical;

  // Untuk setiap rule, simpan picId yang dipilih
  const [picMap, setPicMap] = useState(() => {
    const m = {};
    entries.forEach(e => { m[e.rule_id] = e.pic?.id?.toString() || ''; });
    return m;
  });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  // Buat array months dari range
  const monthsInRange = useMemo(() => {
    const months = [];
    let y = periodStart.year;
    let m = periodStart.month;
    while (y < periodEnd.year || (y === periodEnd.year && m <= periodEnd.month)) {
      months.push({ year: y, month: m });
      m++;
      if (m > 12) { m = 1; y++; }
    }
    return months;
  }, [periodStart, periodEnd]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Bangun bulk entries: setiap rule × setiap bulan dalam range
      const bulkEntries = [];
      for (const [ruleId, picId] of Object.entries(picMap)) {
        if (!picId) continue;
        for (const { year, month } of monthsInRange) {
          bulkEntries.push({ ruleId: parseInt(ruleId), year, month, picId: parseInt(picId) });
        }
      }

      if (bulkEntries.length === 0) {
        setResult({ type: 'warn', msg: 'Tidak ada PIC yang dipilih.' });
        setSaving(false);
        return;
      }

      const res = await fetch(`${api}/api/pdm-schedule/monthly-pic/bulk`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: bulkEntries })
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: 'ok', msg: data.message });
        setTimeout(() => { onSaved(); onClose(); }, 1200);
      } else {
        setResult({ type: 'err', msg: data.error || 'Gagal menyimpan' });
      }
    } catch (e) {
      setResult({ type: 'err', msg: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-start rounded-t-2xl">
          <div>
            <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Edit Roster PIC</p>
            <h2 className="text-base font-bold">{pabrikEntry.nama_pabrik}</h2>
            <p className="text-sm text-blue-100 mt-0.5">{label}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Period range selector */}
        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-medium text-blue-800">
            Berlaku: {MONTH_FULL[periodStart.month - 1]} {periodStart.year}
            {(periodStart.month !== periodEnd.month || periodStart.year !== periodEnd.year) &&
              ` s/d ${MONTH_FULL[periodEnd.month - 1]} ${periodEnd.year}`}
          </span>
          <span className="text-xs text-blue-500 ml-auto">({monthsInRange.length} bulan)</span>
        </div>

        {/* Rules list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {entries.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">Tidak ada rule untuk kategori ini di pabrik ini.</p>
          )}
          {entries.map(entry => (
            <div key={entry.rule_id} className="bg-gray-50 rounded-xl border border-gray-200 p-3.5">
              <div className="mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{entry.code}</p>
                <p className="text-sm font-semibold text-gray-800">{entry.subArea}</p>
                {entry.hasOverride && (
                  <span className="inline-flex items-center gap-1 text-xs text-purple-600 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Override aktif bulan ini
                  </span>
                )}
              </div>
              <select
                value={picMap[entry.rule_id] || ''}
                onChange={e => setPicMap(prev => ({ ...prev, [entry.rule_id]: e.target.value }))}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">-- Pilih PIC --</option>
                {manpowers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.position}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Result alert */}
        {result && (
          <div className={`mx-5 mb-3 p-3 rounded-lg text-sm flex items-center gap-2 ${result.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : result.type === 'warn' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {result.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {result.msg}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Batal</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Menyimpan...' : 'Simpan Roster'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Komponen Cell PIC ────────────────────────────────────────────────────────
function PicCell({ pics, onEdit }) {
  if (!pics || pics.length === 0) {
    return (
      <div className="flex items-center justify-between gap-2 group">
        <span className="text-gray-300 italic text-xs">Belum diset</span>
        <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 p-1 rounded text-blue-400 hover:bg-blue-50 transition">
          <Edit3 className="w-3 h-3" />
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-2 group">
      <div className="flex flex-col gap-0.5">
        {pics.map((p, i) => (
          <span key={p.id} className={`text-sm font-semibold text-gray-800 ${i > 0 ? 'border-t border-gray-100 pt-0.5 mt-0.5' : ''}`}>
            {p.name.split(' ').slice(0, 2).join(' ')}
          </span>
        ))}
      </div>
      <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 p-1 rounded text-blue-400 hover:bg-blue-50 transition shrink-0">
        <Edit3 className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Halaman Utama ──────────────────────────────────────────────────────────
export default function PdmRoster() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [roster, setRoster] = useState([]);
  const [manpowers, setManpowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null); // { pabrikEntry, criticality }
  // Range bulan untuk bulk override
  const [rangeStart, setRangeStart] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [rangeEnd, setRangeEnd] = useState({ year: now.getFullYear(), month: 12 });

  const api     = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchRoster(); }, [year, month]);
  useEffect(() => { fetchManpowers(); }, []);

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/api/pdm-schedule/roster?year=${year}&month=${month}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setRoster(data.data || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchManpowers = async () => {
    const res = await fetch(`${api}/api/dashboard/manpower`, { headers });
    if (res.ok) setManpowers(await res.json());
  };

  const periodLabel = `${MONTH_FULL[month - 1]} ${year}`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Roster PIC PdM Rotating
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Penugasan Inspector per Pabrik — {periodLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-200">
            {MONTH_NAMES.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-200">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={fetchRoster}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-200 transition">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Range override info ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-blue-700">
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="font-medium">Range berlaku saat edit:</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={rangeStart.month} onChange={e => setRangeStart(p => ({ ...p, month: parseInt(e.target.value) }))}
            className="border border-blue-200 rounded-lg px-2 py-1 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-300">
            {MONTH_NAMES.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
          </select>
          <select value={rangeStart.year} onChange={e => setRangeStart(p => ({ ...p, year: parseInt(e.target.value) }))}
            className="border border-blue-200 rounded-lg px-2 py-1 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-300">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronRight className="w-4 h-4 text-blue-400" />
          <select value={rangeEnd.month} onChange={e => setRangeEnd(p => ({ ...p, month: parseInt(e.target.value) }))}
            className="border border-blue-200 rounded-lg px-2 py-1 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-300">
            {MONTH_NAMES.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
          </select>
          <select value={rangeEnd.year} onChange={e => setRangeEnd(p => ({ ...p, year: parseInt(e.target.value) }))}
            className="border border-blue-200 rounded-lg px-2 py-1 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-300">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <span className="text-blue-500 text-xs">Klik ikon edit (✎) pada baris untuk mengubah PIC berlaku selama range ini.</span>
      </div>

      {/* ── Dua Tabel: Critical | Non Critical ── */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Memuat roster...</div>
      ) : roster.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>Belum ada master schedule rules yang aktif.</p>
          <p className="text-sm mt-1">Tambahkan rules di menu <strong>Master Schedule</strong> terlebih dahulu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ─── Tabel CRITICAL ─── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-5 py-4 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-red-100 mb-0.5">CRITICAL ITEM</p>
              <h2 className="text-base font-bold">Analyst Inspector</h2>
              <p className="text-xs text-red-100 mt-0.5">Periode: {periodLabel}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-red-50 text-xs text-red-600 uppercase tracking-wider border-b border-red-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">Pabrik</th>
                    <th className="px-4 py-3 text-left font-bold">Analyst</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {roster.map(p => (
                    <tr key={p.pabrik_id} className="hover:bg-red-50/30 transition group">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-gray-800">{p.nama_pabrik}</p>
                        <p className="text-xs text-gray-400">{p.critical.length} task</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <PicCell
                          pics={p.criticalPicsSummary}
                          onEdit={() => setEditTarget({ pabrikEntry: p, criticality: 'CRITICAL' })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── Tabel NON CRITICAL ─── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-100 mb-0.5">NON CRITICAL ITEM</p>
              <h2 className="text-base font-bold">Inspector</h2>
              <p className="text-xs text-blue-100 mt-0.5">Periode: {periodLabel}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 text-xs text-blue-600 uppercase tracking-wider border-b border-blue-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">Pabrik</th>
                    <th className="px-4 py-3 text-left font-bold">Inspector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {roster.map(p => (
                    <tr key={p.pabrik_id} className="hover:bg-blue-50/30 transition group">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-gray-800">{p.nama_pabrik}</p>
                        <p className="text-xs text-gray-400">{p.nonCritical.length} task</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <PicCell
                          pics={p.nonCriticalPicsSummary}
                          onEdit={() => setEditTarget({ pabrikEntry: p, criticality: 'NON_CRITICAL' })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Cards per Pabrik (breakdown per rule) ── */}
      {!loading && roster.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            Detail per Pabrik
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {roster.map(p => (
              <div key={p.pabrik_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <p className="font-bold text-gray-800">{p.nama_pabrik}</p>
                  <span className="text-xs text-gray-400">{p.critical.length + p.nonCritical.length} rules</span>
                </div>
                <div className="p-4 space-y-2">
                  {/* Critical rules */}
                  {p.critical.map(r => (
                    <div key={r.rule_id} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 shrink-0 w-2 h-2 rounded-full bg-red-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">{r.code} — {r.subArea}</p>
                      </div>
                      <span className={`shrink-0 font-semibold ${r.pic ? 'text-gray-600' : 'text-gray-300 italic'}`}>
                        {r.pic ? r.pic.name.split(' ').slice(0, 2).join(' ') : 'Belum diset'}
                      </span>
                    </div>
                  ))}
                  {/* Non-Critical rules */}
                  {p.nonCritical.map(r => (
                    <div key={r.rule_id} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 shrink-0 w-2 h-2 rounded-full bg-blue-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">{r.code} — {r.subArea}</p>
                      </div>
                      <span className={`shrink-0 font-semibold ${r.pic ? 'text-gray-600' : 'text-gray-300 italic'}`}>
                        {r.pic ? r.pic.name.split(' ').slice(0, 2).join(' ') : 'Belum diset'}
                      </span>
                    </div>
                  ))}
                  {p.critical.length === 0 && p.nonCritical.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-2">Tidak ada rule aktif</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal Edit ── */}
      {editTarget && (
        <EditRosterModal
          pabrikEntry={editTarget.pabrikEntry}
          criticality={editTarget.criticality}
          manpowers={manpowers}
          api={api}
          headers={headers}
          periodStart={rangeStart}
          periodEnd={rangeEnd}
          onClose={() => setEditTarget(null)}
          onSaved={() => { fetchRoster(); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
