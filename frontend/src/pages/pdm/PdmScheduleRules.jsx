import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, Calendar, Settings, Zap, UserCog, X, RefreshCw, ChevronRight, Cpu } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[20px] shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-[12px] leading-[16px] font-medium text-navy-600 uppercase tracking-wider mb-1">Override PIC Bulanan</p>
            <h2 className="text-[18px] font-display font-semibold text-ink">{rule.code} — {rule.subArea || rule.taskName}</h2>
            <p className="text-[12px] leading-[16px] text-gray-500 mt-1">Default PIC: {rule.defaultPic?.name || 'Belum ada'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-[12px] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-ink mb-1.5">Bulan</label>
              <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-all">
                {monthNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-ink mb-1.5">Tahun</label>
              <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-all">
                {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-ink mb-1.5">PIC Bulan Ini</label>
            <select value={picId} onChange={e => setPicId(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-all">
              <option value="">-- Pilih PIC --</option>
              {manpowers.map(m => <option key={m.id} value={m.id}>{m.name} — {m.position}</option>)}
            </select>
          </div>
          <p className="text-[12px] text-gray-500 bg-gray-50 p-3 rounded-[8px] border border-gray-100">
            Override ini akan dipakai saat generate jadwal khusus untuk bulan dan tahun yang dipilih.
          </p>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2.5 text-[14px] font-medium text-gray-600 bg-white border border-gray-200 rounded-[12px] hover:bg-gray-50 transition-colors">Batal</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 text-[14px] font-medium bg-navy-600 text-white rounded-[12px] shadow-sm hover:bg-navy-950 transition-colors disabled:opacity-50">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[20px] shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-[12px] leading-[16px] font-medium text-emerald-600 uppercase tracking-wider mb-1">Generate Jadwal</p>
            <h2 className="text-[18px] font-display font-semibold text-ink">{rule ? `${rule.pabrik?.nama_pabrik} — ${rule.code}` : 'Semua Aturan Aktif'}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-[12px] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-ink mb-1.5">Bulan</label>
              <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-all">
                {monthNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-ink mb-1.5">Tahun</label>
              <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-all">
                {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          {result ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-[8px] p-4 text-[14px] text-emerald-800 font-medium">
              {result}
            </div>
          ) : (
            <p className="text-[12px] text-gray-500 bg-gray-50 p-3 rounded-[8px] border border-gray-100">
              Generate jadwal akan membuat occurrence berdasarkan rules ini. Occurrence yang sudah ada tidak akan ditimpa (aman dari duplikasi).
            </p>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2.5 text-[14px] font-medium text-gray-600 bg-white border border-gray-200 rounded-[12px] hover:bg-gray-50 transition-colors">
            {result ? 'Tutup' : 'Batal'}
          </button>
          {!result && (
            <button onClick={handleGenerate} disabled={loading} className="flex items-center justify-center min-w-[140px] gap-2 px-5 py-2.5 text-[14px] font-medium bg-emerald-600 text-white rounded-[12px] shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
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
  const [selectedPabrikFilter, setSelectedPabrikFilter] = useState('');
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

  const filteredRules = useMemo(() => {
    if (!selectedPabrikFilter) return rules;
    return rules.filter(r => r.pabrik_id.toString() === selectedPabrikFilter.toString());
  }, [rules, selectedPabrikFilter]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Topbar / Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-2">
            <span>PdM Schedule</span>
            <span className="text-gray-400">/</span>
            <span className="text-navy-600 font-medium">Master Schedule</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-ink">
            Aturan Master Schedule
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowGenerateAll(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-[12px] hover:bg-gray-50 transition-colors text-[14px] font-medium shadow-sm">
            <Zap className="w-4 h-4 text-emerald-600" /> Generate Semua
          </button>
          <button onClick={() => { resetForm(); setEditingId(null); setIsFormOpen(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-[12px] shadow-sm hover:bg-navy-950 transition-colors text-[14px] font-medium">
            <PlusCircle className="w-4 h-4" /> Tambah Aturan
          </button>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex gap-4">
          <select 
            value={selectedPabrikFilter} 
            onChange={(e) => setSelectedPabrikFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-[12px] text-[14px] focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-all shadow-sm min-w-[240px]"
          >
            <option value="">Semua Pabrik</option>
            {pabriks.map(p => (
              <option key={p.id} value={p.id}>{p.nama_pabrik}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[12px] font-medium uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Pabrik</th>
                  <th className="px-6 py-3 font-medium">Kode & Area</th>
                  <th className="px-6 py-3 font-medium">Tugas</th>
                  <th className="px-6 py-3 font-medium">Jadwal</th>
                  <th className="px-6 py-3 font-medium">Default PIC</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[14px]">
                {filteredRules.length > 0 ? (
                  filteredRules.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-ink">{r.pabrik?.nama_pabrik || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-mono font-medium text-[13px] text-ink">{r.code}</div>
                            <div className="text-[12px] text-gray-500 mt-0.5">{r.subArea || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-ink">{r.taskName}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-[8px] uppercase tracking-wide">{r.equipmentCat}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-[8px] uppercase tracking-wide ${r.criticality === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                            {r.criticality === 'CRITICAL' ? 'CRITICAL' : 'NON-CRIT'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-ink">
                          {r.recurrence === 'MONTHLY_ONCE' ? '1x Sebulan' : r.recurrence === 'MONTHLY_TWICE' ? '2x Sebulan' : 'Tentative'}
                        </div>
                        <div className="text-[12px] text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {r.recurrence === 'MONTHLY_ONCE' && r.dateFirst && `Tgl ${r.dateFirst}`}
                          {r.recurrence === 'MONTHLY_TWICE' && r.dateFirst && r.dateSecond && `Tgl ${r.dateFirst} & ${r.dateSecond}`}
                          {r.recurrence === 'TENTATIVE' && 'Sesuai Kebutuhan'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {r.defaultPic ? (
                          <div className="text-ink font-medium text-[13px]">{r.defaultPic.name}</div>
                        ) : (
                          <span className="text-[12px] text-gray-400 italic">Belum Set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[12px] font-medium ${r.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          {r.isActive ? 'Aktif' : 'Inaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setPicOverrideRule(r)} title="Override PIC Bulan Ini"
                            className="p-1.5 text-gray-400 hover:text-navy-600 hover:bg-gray-100 rounded-[8px] transition-colors">
                            <UserCog className="w-4 h-4" />
                          </button>
                          <button onClick={() => setGenerateRule(r)} title="Generate Jadwal"
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-[8px] transition-colors">
                            <Zap className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(r)} title="Edit Rule"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-[8px] transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(r.id)} title="Hapus Rule"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-[8px] transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-[12px] flex items-center justify-center mb-4">
                          <Settings className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-[16px] font-semibold text-ink mb-1">Belum ada aturan jadwal</h3>
                        <p className="text-gray-500 text-[14px] max-w-md mx-auto">
                          Tambahkan aturan master schedule baru atau ubah filter pabrik.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form Rule */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[20px] shadow-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-[18px] font-display font-semibold text-ink">{editingId ? 'Edit Konfigurasi Aturan' : 'Tambah Aturan Baru'}</h2>
                <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-[12px] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <form id="ruleForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[14px] font-medium text-ink mb-1.5">Kode Rule <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] font-mono focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-all" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Contoh: ROT-P1A-001" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-ink mb-1.5">Pabrik <span className="text-red-500">*</span></label>
                      <select required className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-all" value={formData.pabrik_id} onChange={e => setFormData({...formData, pabrik_id: e.target.value})}>
                        <option value="">-- Pilih Pabrik --</option>
                        {pabriks.map(p => <option key={p.id} value={p.id}>{p.nama_pabrik}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[14px] font-medium text-ink mb-1.5">Area / Sub-Area</label>
                      <input type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-all" value={formData.subArea} onChange={e => setFormData({...formData, subArea: e.target.value})} placeholder="Contoh: Ammonia 1A" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-ink mb-1.5">Nama Tugas <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-all" value={formData.taskName} onChange={e => setFormData({...formData, taskName: e.target.value})} placeholder="Contoh: Inspeksi Vibrasi All Item" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5 p-4 bg-gray-50 rounded-[12px] border border-gray-100">
                    <div>
                      <label className="block text-[14px] font-medium text-ink mb-1.5">Kategori Peralatan</label>
                      <select className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 transition-all" value={formData.equipmentCat} onChange={e => setFormData({...formData, equipmentCat: e.target.value})}>
                        <option value="ROTATING">ROTATING</option>
                        <option value="STATIC">STATIC</option>
                        <option value="GTG">GTG</option>
                        <option value="STG">STG</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-ink mb-1.5">Tingkat Kritikalitas</label>
                      <select className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 transition-all" value={formData.criticality} onChange={e => setFormData({...formData, criticality: e.target.value})}>
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="NON_CRITICAL">NON CRITICAL</option>
                        <option value="NA">NA (Not Applicable)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[14px] font-medium text-ink mb-1.5">Pola Penjadwalan</label>
                      <select className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 transition-all" value={formData.recurrence} onChange={e => setFormData({...formData, recurrence: e.target.value})}>
                        <option value="MONTHLY_ONCE">1x Sebulan</option>
                        <option value="MONTHLY_TWICE">2x Sebulan</option>
                        <option value="TENTATIVE">Tentative (Manual)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-ink mb-1.5">Default Assignee (PIC)</label>
                      <select className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 transition-all" value={formData.defaultPicId} onChange={e => setFormData({...formData, defaultPicId: e.target.value})}>
                        <option value="">-- Tanpa PIC Default --</option>
                        {manpowers.map(m => <option key={m.id} value={m.id}>{m.name} - {m.position}</option>)}
                      </select>
                    </div>
                  </div>
                  {(formData.recurrence === 'MONTHLY_ONCE' || formData.recurrence === 'MONTHLY_TWICE') && (
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[14px] font-medium text-ink mb-1.5">Tanggal Pelaksanaan (1-31)</label>
                        <input type="number" min="1" max="31" className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 transition-all" value={formData.dateFirst} onChange={e => setFormData({...formData, dateFirst: e.target.value})} placeholder="Contoh: 15" />
                      </div>
                      {formData.recurrence === 'MONTHLY_TWICE' && (
                        <div>
                          <label className="block text-[14px] font-medium text-ink mb-1.5">Tanggal Pelaksanaan Ke-2 (1-31)</label>
                          <input type="number" min="1" max="31" className="w-full p-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 transition-all" value={formData.dateSecond} onChange={e => setFormData({...formData, dateSecond: e.target.value})} placeholder="Contoh: 30" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-[8px] border border-gray-200 hover:bg-gray-100 transition-colors w-fit">
                      <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-navy-600 rounded border-gray-300 focus:ring-navy-600 cursor-pointer" />
                      <span className="text-[14px] text-ink font-medium">Rule Aktif (Otomatis masuk ke antrean generate)</span>
                    </label>
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-[14px] text-gray-600 bg-white border border-gray-300 rounded-[12px] hover:bg-gray-50 transition-colors font-medium shadow-sm">Batal</button>
                <button type="submit" form="ruleForm" className="px-5 py-2.5 bg-navy-600 text-white rounded-[12px] shadow-sm hover:bg-navy-950 transition-colors font-medium text-[14px]">Simpan Konfigurasi</button>
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
