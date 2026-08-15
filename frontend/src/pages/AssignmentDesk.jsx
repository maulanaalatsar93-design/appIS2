import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  ArrowLeft, Plus, Save, Trash2, Loader2, Edit3,
  CheckCircle2, Clock, Activity, XCircle, AlertCircle
} from 'lucide-react';
import { playSubmitSound, playSuccessSound, playErrorSound } from '../utils/soundUtils';

const ITEM_STATUS_STYLES = {
  'Waiting':           { cls: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  'In Progress':       { cls: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500' },
  'Ready For Review':  { cls: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-400' },
  'Done':              { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Hold':              { cls: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-500' },
};

export default function AssignmentDesk({ program, onBack }) {
  const { token } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [newItem, setNewItem] = useState({
    item_no: '', title: '', equipment: '', description: '', pic_id: '', estimated_duration: '', priority: 'Normal'
  });
  
  const [editingItemId, setEditingItemId] = useState(null);
  const [editEstimasi, setEditEstimasi] = useState('');
  const [editPriority, setEditPriority] = useState('Normal');

  const handleEditEstimasi = async (item) => {
    if (editingItemId === item.id) {
      playSubmitSound();
      const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, estimated_duration: editEstimasi ? parseInt(editEstimasi) : null, priority: editPriority })
      });
      if (res.ok) {
        playSuccessSound();
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, estimated_duration: editEstimasi ? parseInt(editEstimasi) : null, priority: editPriority } : i));
        setEditingItemId(null);
      } else {
        playErrorSound();
      }
    } else {
      setEditingItemId(item.id);
      setEditEstimasi(item.estimated_duration || '');
      setEditPriority(item.priority || 'Normal');
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/programs/${program.id}/items`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [program.id]);

  const handleCreateItem = async () => {
    if (!newItem.title) {
      playErrorSound();
      return setError('Nama pekerjaan wajib diisi.');
    }
    setSaving(true);
    setError('');
    playSubmitSound();
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/programs/${program.id}/items`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, pic_id: newItem.pic_id || null })
    });
    if (res.ok) {
      playSuccessSound();
      setNewItem({ item_no: '', title: '', equipment: '', description: '', pic_id: '', estimated_duration: '', priority: 'Normal' });
      setShowForm(false);
      await fetchItems();
    } else {
      playErrorSound();
      setError('Gagal menyimpan item.');
    }
    setSaving(false);
  };

  const handleStatusChange = async (itemId, status) => {
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/items/${itemId}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) setItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i));
  };

  const members = program.members || [];

  const progressSummary = {
    total: items.length,
    done: items.filter(i => i.status === 'Done').length,
    inProgress: items.filter(i => i.status === 'In Progress').length,
    waiting: items.filter(i => i.status === 'Waiting').length,
    review: items.filter(i => i.status === 'Ready For Review').length,
  };
  const overallProgress = progressSummary.total > 0
    ? Math.round((progressSummary.done / progressSummary.total) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm-subtle hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold text-ink">Assignment Desk</h1>
            <p className="text-sm text-gray-500">Program: <span className="font-semibold text-ink">{program.title}</span></p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-navy-600 hover:bg-navy-950 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" />
          <span>Tambah Item Pekerjaan</span>
        </button>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Item', value: progressSummary.total, color: 'text-industrial-text' },
          { label: 'Waiting', value: progressSummary.waiting, color: 'text-slate-500' },
          { label: 'In Progress', value: progressSummary.inProgress, color: 'text-blue-600' },
          { label: 'Review', value: progressSummary.review, color: 'text-amber-600' },
          { label: 'Done', value: progressSummary.done, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm-subtle">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Overall Progress Bar */}
      {progressSummary.total > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm-subtle">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-ink">Progress Keseluruhan</p>
            <p className="text-sm font-bold text-industrial-blue">{overallProgress}%</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-industrial-blue to-emerald-500 h-3 rounded-full transition-all"
              style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
        </div>
      )}

      {/* New Item Form */}
      {showForm && (
        <div className="bg-white border border-industrial-blue/30 rounded-lg p-5 shadow-md">
          <h3 className="font-semibold text-ink mb-4">Tambah Item Pekerjaan Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">No. Item</label>
              <input type="text" value={newItem.item_no} onChange={e => setNewItem(p => ({ ...p, item_no: e.target.value }))}
                placeholder="Misal: 701" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-industrial-blue" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-ink mb-1 block">Nama Pekerjaan *</label>
              <input type="text" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                placeholder="Misal: Rotor Inspection" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-industrial-blue" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">Equipment</label>
              <input type="text" value={newItem.equipment} onChange={e => setNewItem(p => ({ ...p, equipment: e.target.value }))}
                placeholder="Misal: TS-441 Compressor" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-industrial-blue" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">PIC (Penanggung Jawab)</label>
              <select value={newItem.pic_id} onChange={e => setNewItem(p => ({ ...p, pic_id: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-industrial-blue">
                <option value="">— Pilih PIC —</option>
                {members.map(m => (
                  <option key={m.man_power_id || m.id} value={m.man_power?.id || m.man_power_id}>
                    {m.man_power?.name || m.name} ({m.role || 'Member'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">Estimasi Kerja (Hari)</label>
              <input type="number" min="1" value={newItem.estimated_duration} onChange={e => setNewItem(p => ({ ...p, estimated_duration: e.target.value }))}
                placeholder="Misal: 3" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-industrial-blue" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">Prioritas</label>
              <select value={newItem.priority} onChange={e => setNewItem(p => ({ ...p, priority: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-industrial-blue">
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-ink mb-1 block">Deskripsi</label>
              <input type="text" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                placeholder="Opsional..." className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-industrial-blue" />
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4">
            <button onClick={handleCreateItem} disabled={saving}
              className="flex items-center space-x-2 bg-industrial-green text-ink px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Simpan Item</span>
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
        <div className="p-4 border-b border-gray-200 bg-slate-50">
          <h2 className="text-sm font-semibold text-ink">Daftar Work Items ({items.length})</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-10"><Loader2 className="w-7 h-7 animate-spin text-industrial-blue" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <CheckCircle2 className="w-12 h-12 opacity-20 mb-3" />
            <p className="text-sm font-medium text-gray-500">Belum ada work item.</p>
            <p className="text-xs mt-1">Klik "Tambah Item Pekerjaan" untuk memulai pembagian tugas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-slate-50/50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Pekerjaan</th>
                  <th className="px-4 py-3">Prioritas</th>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">PIC</th>
                  <th className="px-4 py-3">Estimasi (Hari)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Checklist</th>
                  <th className="px-4 py-3">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-border">
                {items.map(item => {
                  const statusStyle = ITEM_STATUS_STYLES[item.status] || ITEM_STATUS_STYLES['Waiting'];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 font-semibold">{item.item_no || '—'}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{item.title}</p>
                        {item.description && <p className="text-[10px] text-gray-500">{item.description}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {editingItemId === item.id ? (
                          <select 
                            value={editPriority} 
                            onChange={e => setEditPriority(e.target.value)}
                            className="bg-white border border-industrial-blue rounded px-2 py-1 text-xs focus:outline-none"
                          >
                            <option value="Low">Low</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                            item.priority === 'Urgent' ? 'bg-red-100 text-red-700 border-red-200' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            item.priority === 'Low' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            'bg-blue-50 text-blue-600 border-blue-200'
                          }`}>
                            {(item.priority || 'NORMAL').toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{item.equipment || '—'}</td>
                      <td className="px-4 py-3">
                        {item.pic ? (
                          <div>
                            <p className="font-semibold text-xs text-ink">{item.pic.name}</p>
                            <p className="text-[10px] text-gray-500">{item.pic.position}</p>
                          </div>
                        ) : <span className="text-xs text-gray-500">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {editingItemId === item.id ? (
                            <input 
                              type="number" 
                              value={editEstimasi} 
                              onChange={e => setEditEstimasi(e.target.value)}
                              className="w-16 bg-white border border-industrial-blue rounded px-2 py-1 text-xs focus:outline-none"
                              autoFocus
                            />
                          ) : (
                            <span className="text-xs font-semibold text-ink">{item.estimated_duration || '—'}</span>
                          )}
                          <button 
                            onClick={() => handleEditEstimasi(item)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            {editingItemId === item.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Edit3 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusStyle.cls}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-navy-600 h-1.5 rounded-full" style={{ width: `${item.progress_pct}%` }} />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500">{item.progress_pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{item._count?.checklists || 0} item</span>
                      </td>
                      <td className="px-4 py-3">
                        <select value={item.status} onChange={e => handleStatusChange(item.id, e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-industrial-blue">
                          <option>Waiting</option>
                          <option>In Progress</option>
                          <option>Ready For Review</option>
                          <option>Done</option>
                          <option>Hold</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
