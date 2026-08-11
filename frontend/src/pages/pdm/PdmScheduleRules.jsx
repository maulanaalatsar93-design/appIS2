import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Calendar, Settings, Zap, UserCog, X, RefreshCw } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Override PIC Bulanan</p>
            <h2 className="text-base font-bold text-gray-800">{rule.code} — {rule.subArea || rule.taskName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Default PIC: {rule.defaultPic?.name || 'Belum ada'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none">
                {monthNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none">
                {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIC Bulan Ini</label>
            <select value={picId} onChange={e => setPicId(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none">
              <option value="">-- Pilih PIC --</option>
              {manpowers.map(m => <option key={m.id} value={m.id}>{m.name} — {m.position}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-400">Override ini akan dipakai saat generate jadwal untuk bulan yang dipilih.</p>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Batal</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Override'}
          </button>
        </div>
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Generate Jadwal</p>
            <h2 className="text-base font-bold text-gray-800">{rule ? `${rule.pabrik?.nama_pabrik} — ${rule.code}` : 'Semua Rule Aktif'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-200">
                {monthNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-200">
                {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          {result && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">{result}</div>
          )}
          <p className="text-xs text-gray-400">Occurrence yang sudah ada tidak akan ditimpa (upsert safe).</p>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            {result ? 'Tutup' : 'Batal'}
          </button>
          {!result && (
            <button onClick={handleGenerate} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50">
              <Zap className="w-3.5 h-3.5" /> {loading ? 'Generating...' : 'Generate Sekarang'}
            </button>
          )}
        </div>
      </div>
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
      if (res.ok) setRules(await res.json());
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            PdM Schedule Rules
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola aturan auto-generate jadwal PdM Rotating — {rules.length} rule terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowGenerateAll(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium">
            <Zap className="w-4 h-4" /> Generate Semua
          </button>
          <button onClick={() => { resetForm(); setEditingId(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            <PlusCircle className="w-4 h-4" /> Tambah Rule
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                <th className="p-4 font-semibold">Kode</th>
                <th className="p-4 font-semibold">Pabrik & Area</th>
                <th className="p-4 font-semibold">Tugas</th>
                <th className="p-4 font-semibold">Recurrence</th>
                <th className="p-4 font-semibold">Tgl Default</th>
                <th className="p-4 font-semibold">Default PIC</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {rules.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                  <td className="p-4 font-medium text-gray-900">{r.code}</td>
                  <td className="p-4">
                    <div className="text-gray-900 font-medium">{r.pabrik?.nama_pabrik}</div>
                    <div className="text-gray-500 text-xs">{r.subArea}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{r.taskName}</div>
                    <div className="text-xs text-gray-500 flex gap-1 mt-1">
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{r.equipmentCat}</span>
                      <span className={`px-1.5 py-0.5 rounded ${r.criticality === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{r.criticality}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 text-xs font-medium">
                    {r.recurrence === 'MONTHLY_ONCE' ? '1x/bulan' : r.recurrence === 'MONTHLY_TWICE' ? '2x/bulan' : 'Tentative'}
                  </td>
                  <td className="p-4 text-gray-600">
                    {r.recurrence === 'MONTHLY_ONCE' && r.dateFirst && `Tgl ${r.dateFirst}`}
                    {r.recurrence === 'MONTHLY_TWICE' && r.dateFirst && r.dateSecond && `Tgl ${r.dateFirst} & ${r.dateSecond}`}
                  </td>
                  <td className="p-4 text-gray-600">{r.defaultPic?.name || <span className="text-gray-400 italic text-xs">Belum ada</span>}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setPicOverrideRule(r)} title="Override PIC Bulan Ini"
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition">
                        <UserCog className="w-4 h-4" />
                      </button>
                      <button onClick={() => setGenerateRule(r)} title="Generate Jadwal"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                        <Zap className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(r)} title="Edit Rule"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} title="Hapus Rule"
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr><td colSpan="8" className="p-10 text-center text-gray-400">Belum ada rule yang dibuat. Klik "Tambah Rule" untuk memulai.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Rule */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Rule' : 'Tambah Rule Baru'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="ruleForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Rule *</label>
                    <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Contoh: ROT-P1A-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pabrik *</label>
                    <select required className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none" value={formData.pabrik_id} onChange={e => setFormData({...formData, pabrik_id: e.target.value})}>
                      <option value="">-- Pilih Pabrik --</option>
                      {pabriks.map(p => <option key={p.id} value={p.id}>{p.nama_pabrik}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Area</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none" value={formData.subArea} onChange={e => setFormData({...formData, subArea: e.target.value})} placeholder="Contoh: Ammonia 1A" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tugas *</label>
                    <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none" value={formData.taskName} onChange={e => setFormData({...formData, taskName: e.target.value})} placeholder="Contoh: Inspeksi Vibrasi" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Equipment</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200" value={formData.equipmentCat} onChange={e => setFormData({...formData, equipmentCat: e.target.value})}>
                      <option value="ROTATING">ROTATING</option>
                      <option value="STATIC">STATIC</option>
                      <option value="GTG">GTG</option>
                      <option value="STG">STG</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kritikalitas</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200" value={formData.criticality} onChange={e => setFormData({...formData, criticality: e.target.value})}>
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="NON_CRITICAL">NON CRITICAL</option>
                      <option value="NA">NA</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pola Penjadwalan</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200" value={formData.recurrence} onChange={e => setFormData({...formData, recurrence: e.target.value})}>
                      <option value="MONTHLY_ONCE">1x Sebulan</option>
                      <option value="MONTHLY_TWICE">2x Sebulan</option>
                      <option value="TENTATIVE">Tentative (Manual)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default PIC</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200" value={formData.defaultPicId} onChange={e => setFormData({...formData, defaultPicId: e.target.value})}>
                      <option value="">-- Kosongkan jika belum ada --</option>
                      {manpowers.map(m => <option key={m.id} value={m.id}>{m.name} - {m.position}</option>)}
                    </select>
                  </div>
                </div>
                {(formData.recurrence === 'MONTHLY_ONCE' || formData.recurrence === 'MONTHLY_TWICE') && (
                  <div className="grid grid-cols-2 gap-4 border-b pb-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Ke-1 (1-31)</label>
                      <input type="number" min="1" max="31" className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200" value={formData.dateFirst} onChange={e => setFormData({...formData, dateFirst: e.target.value})} />
                    </div>
                    {formData.recurrence === 'MONTHLY_TWICE' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Ke-2 (1-31)</label>
                        <input type="number" min="1" max="31" className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200" value={formData.dateSecond} onChange={e => setFormData({...formData, dateSecond: e.target.value})} />
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700 font-medium">Aktif (otomatis digenerate tiap bulan)</span>
                  </label>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">Batal</button>
              <button type="submit" form="ruleForm" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly PIC Override Modal */}
      {picOverrideRule && (
        <MonthlyPicModal rule={picOverrideRule} manpowers={manpowers} api={apiUrl} headers={headers} onClose={() => setPicOverrideRule(null)} onSaved={fetchData} />
      )}

      {/* Generate per Rule Modal */}
      {generateRule && (
        <GenerateModal rule={generateRule} api={apiUrl} headers={headers} onClose={() => setGenerateRule(null)} onGenerated={fetchData} />
      )}

      {/* Generate All Modal */}
      {showGenerateAll && (
        <GenerateModal rule={null} api={apiUrl} headers={headers} onClose={() => setShowGenerateAll(false)} onGenerated={fetchData} />
      )}
    </div>
  );
}
