import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Calendar, Settings } from 'lucide-react';

export default function PdmScheduleRules() {
  const [rules, setRules] = useState([]);
  const [pabriks, setPabriks] = useState([]);
  const [manpowers, setManpowers] = useState([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    pabrik_id: '',
    subArea: '',
    equipmentCat: 'ROTATING',
    criticality: 'CRITICAL',
    taskName: '',
    recurrence: 'MONTHLY_ONCE',
    dateFirst: '',
    dateSecond: '',
    defaultPicId: '',
    notes: '',
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchPabriks();
    fetchManpowers();
  }, []);

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/pdm-schedule/rules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const fetchPabriks = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/dashboard/pabrik`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPabriks(data);
      }
    } catch (error) {
      console.error('Error fetching pabriks:', error);
    }
  };

  const fetchManpowers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/dashboard/manpower`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setManpowers(data);
      }
    } catch (error) {
      console.error('Error fetching manpowers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const payload = {
        ...formData,
        pabrik_id: parseInt(formData.pabrik_id),
        dateFirst: formData.dateFirst ? parseInt(formData.dateFirst) : null,
        dateSecond: formData.dateSecond ? parseInt(formData.dateSecond) : null,
        defaultPicId: formData.defaultPicId ? parseInt(formData.defaultPicId) : null,
      };

      const url = editingId 
        ? `${apiUrl}/api/pdm-schedule/rules/${editingId}`
        : `${apiUrl}/api/pdm-schedule/rules`;
        
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsFormOpen(false);
        setEditingId(null);
        fetchData();
      } else {
        alert('Failed to save rule');
      }
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const handleEdit = (rule) => {
    setFormData({
      code: rule.code,
      pabrik_id: rule.pabrik_id,
      subArea: rule.subArea || '',
      equipmentCat: rule.equipmentCat,
      criticality: rule.criticality,
      taskName: rule.taskName,
      recurrence: rule.recurrence,
      dateFirst: rule.dateFirst || '',
      dateSecond: rule.dateSecond || '',
      defaultPicId: rule.defaultPicId || '',
      notes: rule.notes || '',
      isActive: rule.isActive
    });
    setEditingId(rule.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus rule ini?')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/pdm-schedule/rules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            PdM Schedule Rules
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola aturan auto-generate jadwal PdM Rotating</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              code: '', pabrik_id: '', subArea: '', equipmentCat: 'ROTATING', criticality: 'CRITICAL',
              taskName: '', recurrence: 'MONTHLY_ONCE', dateFirst: '', dateSecond: '', defaultPicId: '', notes: '', isActive: true
            });
            setEditingId(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah Rule
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b">
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
            <tbody className="text-sm">
              {rules.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{r.code}</td>
                  <td className="p-4">
                    <div className="text-gray-900 font-medium">{r.pabrik?.nama_pabrik}</div>
                    <div className="text-gray-500 text-xs">{r.subArea}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{r.taskName}</div>
                    <div className="text-xs text-gray-500 flex gap-1 mt-1">
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{r.equipmentCat}</span>
                      <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded">{r.criticality}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{r.recurrence}</td>
                  <td className="p-4 text-gray-600">
                    {r.recurrence === 'MONTHLY_ONCE' && r.dateFirst && `Tgl ${r.dateFirst}`}
                    {r.recurrence === 'MONTHLY_TWICE' && r.dateFirst && r.dateSecond && `Tgl ${r.dateFirst} & ${r.dateSecond}`}
                  </td>
                  <td className="p-4 text-gray-600">{r.defaultPic?.name || '-'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">Belum ada rule yang dibuat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Rule' : 'Tambah Rule'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Trash2 className="w-5 h-5 hidden" /> {/* Just for spacing or use X icon */}
                X
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="ruleForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Rule *</label>
                    <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="Contoh: ROT-P1A" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pabrik *</label>
                    <select required className="w-full p-2 border border-gray-300 rounded-lg" value={formData.pabrik_id} onChange={(e) => setFormData({...formData, pabrik_id: e.target.value})}>
                      <option value="">-- Pilih Pabrik --</option>
                      {pabriks.map(p => <option key={p.id} value={p.id}>{p.nama_pabrik}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Area</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.subArea} onChange={(e) => setFormData({...formData, subArea: e.target.value})} placeholder="Contoh: Ammonia 1A" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tugas *</label>
                    <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.taskName} onChange={(e) => setFormData({...formData, taskName: e.target.value})} placeholder="Contoh: Inspeksi Vibrasi" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Equipment</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg" value={formData.equipmentCat} onChange={(e) => setFormData({...formData, equipmentCat: e.target.value})}>
                      <option value="ROTATING">ROTATING</option>
                      <option value="STATIC">STATIC</option>
                      <option value="GTG">GTG</option>
                      <option value="STG">STG</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kritikalitas</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg" value={formData.criticality} onChange={(e) => setFormData({...formData, criticality: e.target.value})}>
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="NON_CRITICAL">NON CRITICAL</option>
                      <option value="NA">NA</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pola Penjadwalan</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg" value={formData.recurrence} onChange={(e) => setFormData({...formData, recurrence: e.target.value})}>
                      <option value="MONTHLY_ONCE">1x Sebulan</option>
                      <option value="MONTHLY_TWICE">2x Sebulan</option>
                      <option value="TENTATIVE">Tentative (Manual)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default PIC</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg" value={formData.defaultPicId} onChange={(e) => setFormData({...formData, defaultPicId: e.target.value})}>
                      <option value="">-- Kosongkan jika belum ada --</option>
                      {manpowers.map(m => <option key={m.id} value={m.id}>{m.name} - {m.position}</option>)}
                    </select>
                  </div>
                </div>

                {(formData.recurrence === 'MONTHLY_ONCE' || formData.recurrence === 'MONTHLY_TWICE') && (
                  <div className="grid grid-cols-2 gap-4 border-b pb-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Ke-1 (1-31)</label>
                      <input type="number" min="1" max="31" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.dateFirst} onChange={(e) => setFormData({...formData, dateFirst: e.target.value})} />
                    </div>
                    {formData.recurrence === 'MONTHLY_TWICE' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Ke-2 (1-31)</label>
                        <input type="number" min="1" max="31" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.dateSecond} onChange={(e) => setFormData({...formData, dateSecond: e.target.value})} />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Aktif</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                    <span>Aktif (Otomatis digenerate tiap bulan)</span>
                  </label>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Batal
              </button>
              <button type="submit" form="ruleForm" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
