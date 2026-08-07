import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  ArrowLeft, Loader2, Send, Image, Paperclip, CheckSquare,
  Square, Clock, CheckCircle2, AlertCircle, MessageSquare,
  Activity, Camera
} from 'lucide-react';

const CHECKLIST_STATUS_CYCLE = ['Belum', 'Proses', 'Selesai', 'Tidak Berlaku'];
const CHECKLIST_STYLE = {
  'Belum': 'bg-slate-50 border-slate-200 text-slate-500',
  'Proses': 'bg-blue-50 border-blue-200 text-blue-700',
  'Selesai': 'bg-emerald-50 border-emerald-200 text-emerald-700',
  'Tidak Berlaku': 'bg-gray-100 border-gray-200 text-gray-400 line-through',
};

export default function WorkItemDetail({ itemId, onBack }) {
  const { token } = useContext(AuthContext);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityText, setActivityText] = useState('');
  const [addingActivity, setAddingActivity] = useState(false);
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [newChecklist, setNewChecklist] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState('');

  const fetchItem = async () => {
    setLoading(true);
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/items/${itemId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setItem(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchItem(); }, [itemId]);

  const addActivity = async () => {
    if (!activityText.trim()) return;
    setAddingActivity(true);
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/items/${itemId}/activity`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: activityText })
    });
    if (res.ok) { setActivityText(''); await fetchItem(); }
    setAddingActivity(false);
  };

  const addChecklist = async () => {
    if (!newChecklist.trim()) return;
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/items/${itemId}/checklists`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newChecklist })
    });
    if (res.ok) { setNewChecklist(''); setShowChecklistForm(false); await fetchItem(); }
  };

  const cycleChecklist = async (cl) => {
    const nextIdx = (CHECKLIST_STATUS_CYCLE.indexOf(cl.status) + 1) % CHECKLIST_STATUS_CYCLE.length;
    const nextStatus = CHECKLIST_STATUS_CYCLE[nextIdx];
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/checklists/${cl.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    if (res.ok) await fetchItem();
  };

  const submitReview = async (decision) => {
    if (decision !== 'Approved' && !reviewNotes) return setError('Catatan wajib untuk Revision.');
    setReviewing(true);
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/items/${itemId}/review`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, notes: reviewNotes })
    });
    if (res.ok) await fetchItem();
    else { const d = await res.json(); setError(d.error || 'Gagal review.'); }
    setReviewing(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-industrial-blue" /></div>;
  if (!item) return <div className="p-6 text-center text-red-500">Item tidak ditemukan.</div>;

  const checklistDone = item.checklists.filter(c => c.status === 'Selesai' || c.status === 'Tidak Berlaku').length;
  const checklistTotal = item.checklists.length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 bg-white border border-industrial-border rounded-lg shadow-sm-subtle hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-industrial-text">{item.title}</h1>
            <span className="text-xs font-mono text-industrial-muted bg-slate-100 px-2 py-0.5 rounded border">#{item.item_no || item.id}</span>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${item.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : item.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : item.status === 'Ready For Review' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {item.status}
            </span>
          </div>
          <p className="text-industrial-muted text-xs mt-1">Program: <span className="font-semibold">{item.program?.title}</span> {item.equipment && `• ${item.equipment}`}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" /><p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Timeline + Activity Input */}
        <div className="lg:col-span-2 space-y-5">
          {/* Add Progress Update */}
          {item.status === 'In Progress' && (
            <div className="bg-white border border-industrial-border rounded-card p-4 shadow-sm-subtle">
              <h3 className="font-semibold text-industrial-text text-sm mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-industrial-blue" /> Update Progress
              </h3>
              <div className="flex space-x-3">
                <textarea value={activityText} onChange={e => setActivityText(e.target.value)} rows={2}
                  placeholder="Tulis update pekerjaan... (contoh: Rotor berhasil dilepas, Run Out Measurement selesai)"
                  className="flex-1 bg-slate-50 border border-industrial-border rounded-xl p-3 text-sm focus:outline-none focus:border-industrial-blue resize-none" />
                <button onClick={addActivity} disabled={addingActivity || !activityText.trim()}
                  className="px-4 bg-industrial-blue hover:bg-blue-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center">
                  {addingActivity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Coordinator Review Panel */}
          {item.status === 'Ready For Review' && (
            <div className="bg-amber-50 border border-amber-300 rounded-card p-5 shadow-sm-subtle">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Review Koordinator
              </h3>
              <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} rows={2}
                placeholder="Catatan review (wajib jika meminta revisi)..."
                className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm focus:outline-none mb-3" />
              <div className="flex space-x-3">
                <button onClick={() => submitReview('Approved')} disabled={reviewing}
                  className="flex-1 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Setujui → Done
                </button>
                <button onClick={() => submitReview('Revision')} disabled={reviewing}
                  className="flex-1 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-400">
                  Minta Revisi
                </button>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-white border border-industrial-border rounded-card p-5 shadow-soft-card">
            <h3 className="font-semibold text-industrial-text mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-slate-400" /> Timeline Aktivitas
            </h3>
            {item.activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 italic">Belum ada aktivitas tercatat.</p>
            ) : (
              <div className="space-y-4">
                {item.activities.map(a => (
                  <div key={a.id} className="relative pl-5 border-l-2 border-slate-200">
                    <div className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-industrial-blue" />
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-semibold text-industrial-text">{a.description}</p>
                    </div>
                    <p className="text-[10px] text-industrial-muted mt-0.5">
                      {new Date(a.logged_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {a.actor && ` • ${a.actor.name}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review History */}
          {item.reviews.length > 0 && (
            <div className="bg-white border border-industrial-border rounded-card p-4 shadow-sm-subtle">
              <h3 className="font-semibold text-industrial-text mb-3 text-sm">Riwayat Review</h3>
              {item.reviews.map(r => (
                <div key={r.id} className={`p-3 rounded-xl border text-xs ${r.decision === 'Approved' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-industrial-text">{r.reviewer?.name}</span>
                    <span className={`font-bold ${r.decision === 'Approved' ? 'text-emerald-700' : 'text-amber-700'}`}>{r.decision}</span>
                  </div>
                  {r.notes && <p className="text-industrial-muted italic">{r.notes}</p>}
                  <p className="text-industrial-muted mt-0.5">{new Date(r.reviewed_at).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Checklist */}
        <div className="space-y-5">
          <div className="bg-white border border-industrial-border rounded-card overflow-hidden shadow-soft-card">
            <div className="p-4 border-b border-industrial-border bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-industrial-text text-sm">Checklist Inspeksi</h3>
                <p className="text-[10px] text-industrial-muted mt-0.5">{checklistDone}/{checklistTotal} selesai</p>
              </div>
              {checklistTotal > 0 && (
                <span className="text-sm font-bold text-industrial-blue">{item.progress_pct}%</span>
              )}
            </div>

            {checklistTotal > 0 && (
              <div className="h-1.5 bg-slate-100">
                <div className="h-full bg-industrial-blue rounded-r-full transition-all" style={{ width: `${item.progress_pct}%` }} />
              </div>
            )}

            <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
              {item.checklists.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-4">Belum ada checklist.</p>
              ) : item.checklists.map(cl => (
                <div key={cl.id} onClick={() => cycleChecklist(cl)}
                  className={`flex items-start space-x-2 p-2.5 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${CHECKLIST_STYLE[cl.status]}`}>
                  <div className="shrink-0 mt-0.5">
                    {cl.status === 'Selesai' ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold">{cl.title}</p>
                    <p className="text-[9px] mt-0.5 font-bold uppercase tracking-wide opacity-70">{cl.status}</p>
                    {cl.completed_at && <p className="text-[9px] opacity-60">{new Date(cl.completed_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-industrial-border">
              {showChecklistForm ? (
                <div className="space-y-2">
                  <input type="text" value={newChecklist} onChange={e => setNewChecklist(e.target.value)}
                    placeholder="Nama item checklist..." autoFocus
                    onKeyDown={e => e.key === 'Enter' && addChecklist()}
                    className="w-full bg-white border border-industrial-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-industrial-blue" />
                  <div className="flex space-x-2">
                    <button onClick={addChecklist} className="flex-1 py-1.5 bg-industrial-blue text-white text-xs rounded-lg font-semibold">Tambah</button>
                    <button onClick={() => setShowChecklistForm(false)} className="flex-1 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg">Batal</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowChecklistForm(true)}
                  className="w-full py-2 text-xs font-semibold text-industrial-blue hover:bg-blue-50 border border-dashed border-blue-200 rounded-xl transition-colors">
                  + Tambah Item Checklist
                </button>
              )}
            </div>
          </div>

          {/* Item Info */}
          <div className="bg-white border border-industrial-border rounded-card p-4 shadow-sm-subtle space-y-3">
            <h3 className="font-semibold text-industrial-text text-sm">Info Item</h3>
            {[
              { label: 'PIC', value: item.pic?.name || '—' },
              { label: 'Jabatan PIC', value: item.pic?.position || '—' },
              { label: 'Equipment', value: item.equipment || '—' },
              { label: 'Mulai', value: item.started_at ? new Date(item.started_at).toLocaleString('id-ID') : '—' },
              { label: 'Selesai', value: item.completed_at ? new Date(item.completed_at).toLocaleString('id-ID') : '—' },
            ].map(f => (
              <div key={f.label} className="flex justify-between">
                <span className="text-[10px] font-bold text-industrial-muted uppercase">{f.label}</span>
                <span className="text-xs text-industrial-text font-medium">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
