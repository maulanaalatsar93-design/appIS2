import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Loader2, ClipboardList, CheckCircle2, Clock, AlertTriangle,
  Play, Pause, ChevronRight, Activity, Eye, RefreshCw
} from 'lucide-react';
import WorkItemDetail from './WorkItemDetail';

const STATUS_CONFIG = {
  'Waiting':          { cls: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: 'Menunggu' },
  'In Progress':      { cls: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500',  label: 'Dikerjakan' },
  'Ready For Review': { cls: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-400', label: 'Siap Review' },
  'Done':             { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Selesai' },
  'Hold':             { cls: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-500',   label: 'Hold' },
};

export default function WorkCube() {
  const { token } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const fetchMyCube = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/wpem/my-cube', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setItems(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchMyCube(); }, []);

  const handleStatusChange = async (itemId, status) => {
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/items/${itemId}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) setItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i));
  };

  if (selectedItemId) return <WorkItemDetail itemId={selectedItemId} onBack={() => { setSelectedItemId(null); fetchMyCube(); }} />;

  const grouped = {
    'Waiting': items.filter(i => i.status === 'Waiting'),
    'In Progress': items.filter(i => i.status === 'In Progress'),
    'Ready For Review': items.filter(i => i.status === 'Ready For Review'),
    'Hold': items.filter(i => i.status === 'Hold'),
  };

  return (
    <div className="p-6 w-full max-w-none space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Work Cube — My Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">Pekerjaan yang menjadi tanggung jawab Anda. Update progress dan checklist di sini.</p>
        </div>
        <button onClick={fetchMyCube} className="flex items-center space-x-2 bg-white border border-gray-200 hover:bg-slate-50 text-ink px-4 py-2 rounded-lg text-sm font-medium shadow-sm-subtle">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-industrial-blue" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white border border-gray-200 rounded-lg">
          <ClipboardList className="w-16 h-16 opacity-15 mb-4" />
          <p className="font-semibold text-gray-500 text-lg font-display">Tidak ada tugas aktif.</p>
          <p className="text-sm mt-1 text-gray-500">Akun Anda belum terhubung ke data ManPower, atau belum ada item yang ditugaskan ke Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Object.entries(grouped).map(([status, statusItems]) => {
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={status} className="space-y-3">
                {/* Column Header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${cfg.cls}`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className="text-xs font-bold">{cfg.label}</span>
                  </div>
                  <span className="text-xs font-bold">{statusItems.length}</span>
                </div>

                {/* Cards */}
                {statusItems.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-lg p-4 text-center">
                    <p className="text-[10px] text-gray-500">Tidak ada tugas</p>
                  </div>
                ) : statusItems.map(item => (
                  <div key={item.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm-subtle ${item.status === 'Ready For Review' ? 'ring-2 ring-amber-300' : 'border-industrial-border'}`}>
                    {/* Card Header */}
                    <div className={`px-3 py-2 flex items-center justify-between ${item.status === 'Ready For Review' ? 'bg-amber-50' : 'bg-slate-50'} border-b border-industrial-border`}>
                      <span className="font-mono text-[10px] font-bold text-gray-500">{item.item_no || `#${item.id}`}</span>
                      <span className="text-[10px] font-semibold text-gray-500">{item.program?.title}</span>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 space-y-3">
                      <p className="font-bold text-sm text-ink leading-tight">{item.title}</p>
                      {item.equipment && <p className="text-[10px] text-gray-500">🔧 {item.equipment}</p>}

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-500">Progress</span>
                          <span className="text-[10px] font-bold text-industrial-blue">{item.progress_pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${item.progress_pct === 100 ? 'bg-emerald-500' : 'bg-industrial-blue'}`}
                            style={{ width: `${item.progress_pct}%` }} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-1.5">
                        <button onClick={() => setSelectedItemId(item.id)}
                          className="w-full flex items-center justify-center space-x-2 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 rounded-lg text-xs font-semibold transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail & Update</span>
                        </button>

                        {item.status === 'Waiting' && (
                          <button onClick={() => handleStatusChange(item.id, 'In Progress')}
                            className="w-full flex items-center justify-center space-x-2 py-1.5 bg-navy-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors">
                            <Play className="w-3.5 h-3.5" />
                            <span>Mulai Kerjakan</span>
                          </button>
                        )}

                        {item.status === 'In Progress' && (
                          <>
                            <button onClick={() => handleStatusChange(item.id, 'Hold')}
                              className="w-full flex items-center justify-center space-x-2 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 rounded-lg text-xs font-semibold transition-colors">
                              <Pause className="w-3.5 h-3.5" />
                              <span>Tahan (Hold)</span>
                            </button>
                            {item.progress_pct === 100 && (
                              <button onClick={() => handleStatusChange(item.id, 'Ready For Review')}
                                className="w-full flex items-center justify-center space-x-2 py-1.5 bg-amber-500 hover:bg-amber-400 text-ink rounded-lg text-xs font-semibold transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Ajukan Review</span>
                              </button>
                            )}
                          </>
                        )}

                        {item.status === 'Hold' && (
                          <button onClick={() => handleStatusChange(item.id, 'In Progress')}
                            className="w-full flex items-center justify-center space-x-2 py-1.5 bg-navy-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors">
                            <Play className="w-3.5 h-3.5" />
                            <span>Lanjutkan</span>
                          </button>
                        )}

                        {item.status === 'Ready For Review' && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-center">
                            <p className="text-[10px] font-semibold text-amber-700">⏳ Menunggu review koordinator</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
