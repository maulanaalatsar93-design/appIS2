import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Loader2, Plus, Calendar, Users, ClipboardList, ChevronRight, CheckCircle2, Clock, XCircle, AlertTriangle, Eye, Briefcase } from 'lucide-react';
import WorkProgramForm from './WorkProgramForm';
import WorkProgramDetail from './WorkProgramDetail';

const STATUS_BADGE = {
  'Draft': 'bg-platinum-dark text-slate-600 border-platinum-dark',
  'Waiting AVP Approval': 'bg-blue-50 text-navy border-navy-soft',
  'Waiting VP Approval': 'bg-indigo-50 text-navy border-indigo-200',
  'Approved': 'bg-teal-50 text-teal-600 border-teal-200',
  'Team Ready': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Active': 'bg-green-50 text-green-700 border-green-200',
  'Completed': 'bg-platinum-dark text-slate-500 border-platinum-dark',
  'Rejected': 'bg-red-50 text-red-600 border-red-200',
  'Revision Requested': 'bg-amber-50 text-amber-600 border-amber-200',
};

export default function WorkProgramList() {
  const { token } = useContext(AuthContext);
  const [view, setView] = useState('list'); // list | form | detail
  const [selectedId, setSelectedId] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/wpem/programs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPrograms(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (view === 'list') fetchPrograms();
  }, [view]);

  const filtered = statusFilter === 'All' ? programs : programs.filter(p => p.status === statusFilter);

  const stats = [
    { label: 'Total Program', value: programs.length, icon: Briefcase, color: 'text-navy', bg: 'bg-blue-50' },
    { label: 'Menunggu Approval', value: programs.filter(p => p.status.includes('Waiting')).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Tim Aktif', value: programs.filter(p => p.status === 'Team Ready' || p.status === 'Active').length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Perlu Perhatian', value: programs.filter(p => p.status === 'Rejected' || p.status === 'Revision Requested').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  if (view === 'form') return <WorkProgramForm onBack={() => setView('list')} onSaved={() => setView('list')} />;
  if (view === 'detail') return <WorkProgramDetail programId={selectedId} onBack={() => setView('list')} onUpdated={() => setView('list')} />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Work Programs</h1>
          <p className="text-platinum-dark text-sm mt-1">Kelola perencanaan manpower, alur approval, dan eksekusi program pabrik.</p>
        </div>
        <button onClick={() => setView('form')}
          className="flex items-center space-x-2 bg-navy hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Buat Program</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-platinum-dark rounded-card p-4 flex items-center space-x-4 shadow-sm-subtle">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-platinum-dark">{s.label}</p>
              <p className="text-2xl font-bold text-ink">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Draft', 'Waiting AVP Approval', 'Waiting VP Approval', 'Approved', 'Team Ready', 'Active', 'Completed', 'Rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${statusFilter === s ? 'bg-navy text-white border-blue-600' : 'bg-white text-platinum-dark border-platinum-dark hover:border-navy hover:text-navy'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-platinum-dark rounded-card overflow-hidden shadow-soft-card">
        <div className="p-4 border-b border-platinum-dark bg-platinum">
          <h2 className="text-sm font-semibold text-ink">Daftar Program ({filtered.length})</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-navy" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <ClipboardList className="w-12 h-12 opacity-20 mb-3" />
            <p className="text-sm font-medium text-slate-500">Belum ada program.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-platinum-dark bg-platinum/50 text-platinum-dark text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Nama Program</th>
                  <th className="px-4 py-3 font-semibold">Plant & Area</th>
                  <th className="px-4 py-3 font-semibold">Jadwal</th>
                  <th className="px-4 py-3 font-semibold">Koordinator</th>
                  <th className="px-4 py-3 font-semibold">Tim</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum-dark">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-platinum transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{p.title}</p>
                      <p className="text-[10px] text-platinum-dark">Oleh: {p.created_by?.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-ink font-medium">{p.plant || '—'}</p>
                      <p className="text-[10px] text-platinum-dark">{p.area || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-xs text-ink space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(p.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                          {' – '}
                          {new Date(p.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.coordinator ? (
                        <div>
                          <p className="text-xs font-semibold text-ink">{p.coordinator.name}</p>
                          <p className="text-[10px] text-platinum-dark">{p.coordinator.position}</p>
                        </div>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1.5 bg-platinum-dark px-2 py-1 rounded-md border border-platinum-dark w-fit">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-semibold text-ink">{p.members?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border ${STATUS_BADGE[p.status] || STATUS_BADGE['Draft']}`}>
                          {p.status}
                        </span>
                        {p.priority && (
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                            p.priority === 'Urgent' ? 'bg-red-100 text-red-700 border-red-200' :
                            p.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            p.priority === 'Normal' ? 'bg-blue-50 text-navy border-navy-soft' :
                            'bg-platinum-dark text-slate-600 border-platinum-dark'
                          }`}>
                            {p.priority.toUpperCase()}
                          </span>
                        )}
                        {p.is_urgent_bypass && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded border border-red-200">BYPASS</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setSelectedId(p.id); setView('detail'); }}
                        className="p-1.5 bg-blue-50 text-navy hover:bg-blue-100 rounded-lg border border-navy-soft transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


