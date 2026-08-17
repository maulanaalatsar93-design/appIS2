import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, Calendar, Settings, Zap, UserCog, X, RefreshCw, ChevronDown, ChevronRight, Activity, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

// ── Modal Monthly PIC Override ────────────────────────────────
function MonthlyPicModal({ rule, manpowers, api, headers, onClose, onSaved }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [picId, setPicId] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!picId) return alert('Pilih PIC terlebih dahulu');
    setSaving(true);
    try {
      const res = await fetch(`${api}/api/pdm-schedule/monthly-pic`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId: rule.id, year, month, picId: parseInt(picId) })
      });
      if (res.ok) { onSaved(); onClose(); }
      else { const e = await res.json(); alert(e.error || 'Gagal menyimpan'); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-navy-600 uppercase tracking-wider mb-1">Override PIC Bulanan</p>
            <h2 className="text-base font-bold text-gray-800">{rule.code} — {rule.subArea || rule.taskName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Default PIC: {rule.defaultPic?.name || 'Belum ada'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white/50 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bulan</label>
              <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="w-full p-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all">
                {monthNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun</label>
              <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full p-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all">
                {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">PIC Bulan Ini</label>
            <select value={picId} onChange={e => setPicId(e.target.value)} className="w-full p-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all">
              <option value="">-- Pilih PIC --</option>
              {manpowers.map(m => <option key={m.id} value={m.id}>{m.name} — {m.position}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-500 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            Override ini akan dipakai saat generate jadwal khusus untuk bulan dan tahun yang dipilih.
          </p>
        </div>
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">Batal</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none">
            {saving ? 'Menyimpan...' : 'Simpan Override'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Modal Generate Jadwal ──────────────────────────────────────
function GenerateModal({ rule, api, headers, onClose, onGenerated }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/api/pdm-schedule/generate`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, pabrik_id: rule ? rule.pabrik_id : undefined })
      });
      const data = await res.json();
      setResult(data.message || 'Selesai');
      onGenerated && onGenerated();
    } catch (e) { setResult('Error: ' + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-white/10 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Generate Jadwal</p>
            <h2 className="text-base font-bold text-gray-800">{rule ? `${rule.pabrik?.nama_pabrik} — ${rule.code}` : 'Semua Rule Aktif'}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white/50 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bulan</label>
              <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="w-full p-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all">
                {monthNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun</label>
              <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full p-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all">
                {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          {result && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 font-medium">
              {result}
            </motion.div>
          )}
          {!result && (
            <p className="text-xs text-gray-500 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
              Generate jadwal akan membuat occurrence berdasarkan rules ini. Occurrence yang sudah ada tidak akan ditimpa (aman dari duplikasi).
            </p>
          )}
        </div>
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            {result ? 'Tutup' : 'Batal'}
          </button>
          {!result && (
            <button onClick={handleGenerate} disabled={loading} className="flex items-center justify-center min-w-[140px] gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> Generate</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function PdmScheduleRules() {
  const [rules, setRules] = useState([]);
  const [pabriks, setPabriks] = useState([]);
  const [manpowers, setManpowers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [picOverrideRule, setPicOverrideRule] = useState(null);
  const [generateRule, setGenerateRule] = useState(null);
  const [showGenerateAll, setShowGenerateAll] = useState(false);
  const [expandedPabriks, setExpandedPabriks] = useState({});
  const [formData, setFormData] = useState({
    code: '', pabrik_id: '', subArea: '', equipmentCat: 'ROTATING', criticality: 'CRITICAL',
    taskName: '', recurrence: 'MONTHLY_ONCE', dateFirst: '', dateSecond: '', defaultPicId: '', notes: '', isActive: true
  });
  const [editingId, setEditingId] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchData(); fetchPabriks(); fetchManpowers(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/pdm-schedule/rules`, { headers });
      if (res.ok) {
        const data = await res.json();
        setRules(data);
        // Expand all pabriks by default
        const grouped = data.reduce((acc, rule) => {
          const p = rule.pabrik?.nama_pabrik || 'Lainnya';
          acc[p] = true;
          return acc;
        }, {});
        setExpandedPabriks(grouped);
      }
    } catch (e) { console.error(e); }
  };

  const fetchPabriks = async () => {
    const res = await fetch(`${apiUrl}/api/dashboard/pabrik`, { headers });
    if (res.ok) setPabriks(await res.json());
  };

  const fetchManpowers = async () => {
    const res = await fetch(`${apiUrl}/api/dashboard/manpower`, { headers });
    if (res.ok) setManpowers(await res.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        pabrik_id: parseInt(formData.pabrik_id),
        dateFirst: formData.dateFirst ? parseInt(formData.dateFirst) : null,
        dateSecond: formData.dateSecond ? parseInt(formData.dateSecond) : null,
        defaultPicId: formData.defaultPicId ? parseInt(formData.defaultPicId) : null,
      };
      const url = editingId ? `${apiUrl}/api/pdm-schedule/rules/${editingId}` : `${apiUrl}/api/pdm-schedule/rules`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) { setIsFormOpen(false); setEditingId(null); fetchData(); }
      else alert('Gagal menyimpan rule');
    } catch (e) { console.error(e); }
  };

  const handleEdit = (rule) => {
    setFormData({
      code: rule.code, pabrik_id: rule.pabrik_id, subArea: rule.subArea || '',
      equipmentCat: rule.equipmentCat, criticality: rule.criticality, taskName: rule.taskName,
      recurrence: rule.recurrence, dateFirst: rule.dateFirst || '', dateSecond: rule.dateSecond || '',
      defaultPicId: rule.defaultPicId || '', notes: rule.notes || '', isActive: rule.isActive
    });
    setEditingId(rule.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus rule ini?')) return;
    const res = await fetch(`${apiUrl}/api/pdm-schedule/rules/${id}`, { method: 'DELETE', headers });
    if (res.ok) fetchData();
  };

  const resetForm = () => setFormData({ code:'', pabrik_id:'', subArea:'', equipmentCat:'ROTATING', criticality:'CRITICAL', taskName:'', recurrence:'MONTHLY_ONCE', dateFirst:'', dateSecond:'', defaultPicId:'', notes:'', isActive:true });

  const togglePabrik = (pabrikName) => {
    setExpandedPabriks(prev => ({ ...prev, [pabrikName]: !prev[pabrikName] }));
  };

  // Group rules by Pabrik
  const groupedRules = useMemo(() => {
    const groups = {};
    rules.forEach(r => {
      const pName = r.pabrik?.nama_pabrik || 'Lain-lain';
      if (!groups[pName]) groups[pName] = [];
      groups[pName].push(r);
    });
    // Sort keys logically (P1A, P1B, P2, etc)
    const sortedKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    const sortedGroups = {};
    sortedKeys.forEach(k => sortedGroups[k] = groups[k]);
    return sortedGroups;
  }, [rules]);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto min-h-screen">
      {/* Header Premium */}
      <div className="relative mb-8 bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-3xl p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl -z-10 rounded-full mix-blend-multiply translate-x-1/3 -translate-y-1/3"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-navy-600 to-navy-800 rounded-2xl shadow-lg shadow-navy-900/20">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                Master Schedule
              </h1>
            </div>
            <p className="text-gray-500 font-medium ml-1">
              Konfigurasi autogenerasi jadwal PdM (Rotating & Static) — <span className="text-navy-600 font-bold">{rules.length} Aturan</span> terdaftar.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button onClick={() => setShowGenerateAll(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold shadow-sm hover:shadow group">
              <Zap className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" /> Generate Semua
            </button>
            <button onClick={() => { resetForm(); setEditingId(null); setIsFormOpen(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-semibold">
              <PlusCircle className="w-5 h-5" /> Tambah Aturan
            </button>
          </div>
        </div>
      </div>

      {/* Rules List Grouped */}
      <div className="space-y-6">
        {Object.entries(groupedRules).map(([pabrik, pabrikRules]) => (
          <motion.div key={pabrik} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Group Header */}
            <div 
              className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-colors border-b border-gray-100"
              onClick={() => togglePabrik(pabrik)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition-transform ${expandedPabriks[pabrik] ? 'rotate-90 text-navy-600' : 'text-gray-400'}`}>
                  <ChevronRight className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">{pabrik}</h2>
                <span className="px-2.5 py-1 bg-navy-50 text-navy-600 text-xs font-bold rounded-full">{pabrikRules.length} Aturan</span>
              </div>
            </div>

            {/* Group Content (Table) */}
            <AnimatePresence>
              {expandedPabriks[pabrik] && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto p-2">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                          <th className="px-6 py-4">Pabrik & Area</th>
                          <th className="px-6 py-4">Tugas & Kategori</th>
                          <th className="px-6 py-4">Jadwal</th>
                          <th className="px-6 py-4">Default PIC</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pabrikRules.map(r => (
                          <tr key={r.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                  {r.equipmentCat === 'ROTATING' ? <RefreshCw className="w-5 h-5 text-blue-500" /> : 
                                   r.equipmentCat === 'STATIC' ? <Calendar className="w-5 h-5 text-orange-500" /> :
                                   <Cpu className="w-5 h-5 text-purple-500" />}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{r.code}</div>
                                  <div className="text-xs text-gray-500">{r.pabrik?.nama_pabrik} — {r.subArea}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-800">{r.taskName}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">{r.equipmentCat}</span>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${r.criticality === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                  {r.criticality === 'CRITICAL' ? 'CRITICAL' : 'NON-CRIT'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-700">
                                {r.recurrence === 'MONTHLY_ONCE' ? '1x Sebulan' : r.recurrence === 'MONTHLY_TWICE' ? '2x Sebulan' : 'Tentative'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {r.recurrence === 'MONTHLY_ONCE' && r.dateFirst && `Tgl ${r.dateFirst}`}
                                {r.recurrence === 'MONTHLY_TWICE' && r.dateFirst && r.dateSecond && `Tgl ${r.dateFirst} & ${r.dateSecond}`}
                                {r.recurrence === 'TENTATIVE' && 'Sesuai Kebutuhan'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {r.defaultPic ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center text-xs font-bold">
                                    {r.defaultPic.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-800">{r.defaultPic.name}</div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Belum Set</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${r.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${r.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                {r.isActive ? 'Aktif' : 'Inaktif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setPicOverrideRule(r)} title="Override PIC Bulan Ini"
                                  className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                                  <UserCog className="w-4 h-4" />
                                </button>
                                <button onClick={() => setGenerateRule(r)} title="Generate Jadwal"
                                  className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                                  <Zap className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleEdit(r)} title="Edit Rule"
                                  className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(r.id)} title="Hapus Rule"
                                  className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {rules.length === 0 && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Belum ada aturan jadwal</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">Tambahkan aturan master schedule baru untuk mulai meng-generate jadwal inspeksi secara otomatis ke kalender.</p>
            <button onClick={() => { resetForm(); setEditingId(null); setIsFormOpen(true); }} className="px-6 py-2.5 bg-navy-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-semibold flex items-center gap-2">
              <PlusCircle className="w-5 h-5" /> Tambah Aturan Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modal Form Rule */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-navy-50 rounded-xl text-navy-600"><Settings className="w-5 h-5" /></div>
                  <h2 className="text-xl font-display font-bold text-gray-900">{editingId ? 'Edit Konfigurasi Aturan' : 'Tambah Aturan Baru'}</h2>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="ruleForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kode Rule <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-shadow" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Contoh: ROT-P1A-001" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pabrik <span className="text-red-500">*</span></label>
                      <select required className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-shadow" value={formData.pabrik_id} onChange={e => setFormData({...formData, pabrik_id: e.target.value})}>
                        <option value="">-- Pilih Pabrik --</option>
                        {pabriks.map(p => <option key={p.id} value={p.id}>{p.nama_pabrik}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area / Sub-Area</label>
                      <input type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-shadow" value={formData.subArea} onChange={e => setFormData({...formData, subArea: e.target.value})} placeholder="Contoh: Ammonia 1A" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Tugas <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-shadow" value={formData.taskName} onChange={e => setFormData({...formData, taskName: e.target.value})} placeholder="Contoh: Inspeksi Vibrasi All Item" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori Peralatan</label>
                      <select className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-shadow" value={formData.equipmentCat} onChange={e => setFormData({...formData, equipmentCat: e.target.value})}>
                        <option value="ROTATING">ROTATING</option>
                        <option value="STATIC">STATIC</option>
                        <option value="GTG">GTG</option>
                        <option value="STG">STG</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tingkat Kritikalitas</label>
                      <select className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-shadow" value={formData.criticality} onChange={e => setFormData({...formData, criticality: e.target.value})}>
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="NON_CRITICAL">NON CRITICAL</option>
                        <option value="NA">NA (Not Applicable)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pola Penjadwalan</label>
                      <select className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-shadow" value={formData.recurrence} onChange={e => setFormData({...formData, recurrence: e.target.value})}>
                        <option value="MONTHLY_ONCE">1x Sebulan</option>
                        <option value="MONTHLY_TWICE">2x Sebulan</option>
                        <option value="TENTATIVE">Tentative (Manual)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Default Assignee (PIC)</label>
                      <select className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-shadow" value={formData.defaultPicId} onChange={e => setFormData({...formData, defaultPicId: e.target.value})}>
                        <option value="">-- Tanpa PIC Default --</option>
                        {manpowers.map(m => <option key={m.id} value={m.id}>{m.name} - {m.position}</option>)}
                      </select>
                    </div>
                  </div>
                  {(formData.recurrence === 'MONTHLY_ONCE' || formData.recurrence === 'MONTHLY_TWICE') && (
                    <div className="grid grid-cols-2 gap-5 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div>
                        <label className="block text-sm font-semibold text-navy-800 mb-1.5">Tanggal Pelaksanaan (1-31)</label>
                        <input type="number" min="1" max="31" className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-shadow" value={formData.dateFirst} onChange={e => setFormData({...formData, dateFirst: e.target.value})} placeholder="Contoh: 15" />
                      </div>
                      {formData.recurrence === 'MONTHLY_TWICE' && (
                        <div>
                          <label className="block text-sm font-semibold text-navy-800 mb-1.5">Tanggal Pelaksanaan Ke-2 (1-31)</label>
                          <input type="number" min="1" max="31" className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-shadow" value={formData.dateSecond} onChange={e => setFormData({...formData, dateSecond: e.target.value})} placeholder="Contoh: 30" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors w-fit">
                      <div className="relative flex items-center">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-navy-600 rounded cursor-pointer" />
                      </div>
                      <span className="text-sm text-gray-800 font-bold">Rule Aktif (Otomatis masuk ke antrean generate)</span>
                    </label>
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/80">
                <button onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm">Batal</button>
                <button type="submit" form="ruleForm" className="px-6 py-2.5 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold text-sm">Simpan Konfigurasi</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Monthly PIC Override Modal */}
      <AnimatePresence>
        {picOverrideRule && (
          <MonthlyPicModal rule={picOverrideRule} manpowers={manpowers} api={apiUrl} headers={headers} onClose={() => setPicOverrideRule(null)} onSaved={fetchData} />
        )}
      </AnimatePresence>

      {/* Generate per Rule Modal */}
      <AnimatePresence>
        {generateRule && (
          <GenerateModal rule={generateRule} api={apiUrl} headers={headers} onClose={() => setGenerateRule(null)} onGenerated={fetchData} />
        )}
      </AnimatePresence>

      {/* Generate All Modal */}
      <AnimatePresence>
        {showGenerateAll && (
          <GenerateModal rule={null} api={apiUrl} headers={headers} onClose={() => setShowGenerateAll(false)} onGenerated={fetchData} />
        )}
      </AnimatePresence>
    </div>
  );
}
