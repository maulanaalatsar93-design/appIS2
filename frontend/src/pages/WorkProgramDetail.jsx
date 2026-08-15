import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Loader2, ArrowLeft, Calendar, Users, Check, CheckCircle2,
  XCircle, AlertTriangle, MessageSquare, Send, ChevronRight,
  ClipboardList, Activity
} from 'lucide-react';
import AssignmentDesk from './AssignmentDesk';

const STATUS_PIPELINE = ['Draft', 'Waiting AVP Approval', 'Waiting VP Approval', 'Approved', 'Team Ready', 'Active', 'Completed'];
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

export default function WorkProgramDetail({ programId, onBack, onUpdated }) {
  const { token, user } = useContext(AuthContext);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subView, setSubView] = useState('detail'); // detail | assignment
  const [approvalNotes, setApprovalNotes] = useState('');
  const [selectedApproverId, setSelectedApproverId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const fetchProgram = async () => {
    setLoading(true);
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/programs/${programId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setProgram(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchProgram(); }, [programId]);

  const handleSubmit = async () => {
    setProcessing(true);
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/programs/${programId}/submit`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (res.ok) { await fetchProgram(); }
    setProcessing(false);
  };

  const handleApproval = async (decision) => {
    if (!selectedApproverId) return setError('Pilih approver terlebih dahulu.');
    if (decision !== 'Approved' && !approvalNotes) return setError('Catatan wajib diisi untuk Revision/Reject.');
    setProcessing(true);
    setError('');
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/programs/${programId}/approval`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ approver_mp_id: selectedApproverId, decision, notes: approvalNotes })
    });
    if (res.ok) { await fetchProgram(); setApprovalNotes(''); }
    else { const d = await res.json(); setError(d.error || 'Gagal.'); }
    setProcessing(false);
  };

  const handleOverrideApproval = async (decision) => {
    if (decision !== 'Approved' && !approvalNotes) return setError('Catatan wajib diisi untuk Revision/Reject.');
    setProcessing(true);
    setError('');
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/programs/${programId}/vp-approval`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, notes: approvalNotes })
    });
    if (res.ok) { await fetchProgram(); setApprovalNotes(''); }
    if (res.ok) { await fetchProgram(); setApprovalNotes(''); }
    else { const d = await res.json(); setError(d.error || 'Gagal.'); }
    setProcessing(false);
  };

  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [handlingFeedback, setHandlingFeedback] = useState(false);
  
  const handleAddFeedback = async () => {
    if (!feedbackNotes.trim()) return;
    setHandlingFeedback(true);
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/programs/${programId}/feedback`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: feedbackNotes })
    });
    if (res.ok) { await fetchProgram(); setFeedbackNotes(''); }
    else { const d = await res.json(); setError(d.error || 'Gagal mengirim masukan.'); }
    setHandlingFeedback(false);
  };

  const handlePriorityChange = async (priority) => {
    const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/programs/${programId}/priority`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority })
    });
    if (res.ok) await fetchProgram();
    else { const d = await res.json(); setError(d.error || 'Gagal mengubah prioritas.'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>;
  if (!program) return <div className="p-6 text-center text-red-500">Program tidak ditemukan.</div>;

  if (subView === 'assignment') return <AssignmentDesk program={program} onBack={() => setSubView('detail')} />;

  const pendingApprovals = program.approvals.filter(a => a.status === 'Pending');
  const canAssign = program.status === 'Team Ready' || program.status === 'Active';
  const canSubmit = program.status === 'Draft' || program.status === 'Revision Requested';

  const userRoleStr = user?.role?.toLowerCase() || '';
  const isVpOrAdmin = ['vp', 'superadmin', 'super_admin'].includes(userRoleStr);
  const canOverrideApprove = isVpOrAdmin && (program.status === 'Waiting VP Approval' || program.status === 'Waiting AVP Approval');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 bg-white border border-platinum-dark rounded-lg shadow-sm-subtle hover:bg-platinum">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <h1 className="text-xl font-bold text-ink">{program.title}</h1>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_BADGE[program.status] || STATUS_BADGE['Draft']}`}>{program.status}</span>
              {program.priority && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  program.priority === 'Urgent' ? 'bg-red-100 text-red-700 border-red-200' :
                  program.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                  program.priority === 'Normal' ? 'bg-blue-50 text-navy border-navy-soft' :
                  'bg-platinum-dark text-slate-600 border-platinum-dark'
                }`}>
                  {program.priority.toUpperCase()}
                </span>
              )}
              {program.is_urgent_bypass && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded border border-red-200">URGENT BYPASS</span>}
            </div>
            <p className="text-platinum-dark text-xs mt-1">Dibuat oleh <span className="font-medium">{program.created_by?.name}</span> • {new Date(program.createdAt).toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {canSubmit && (
            <button onClick={handleSubmit} disabled={processing}
              className="flex items-center space-x-2 bg-navy hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold">
              <Send className="w-4 h-4" />
              <span>{program.is_urgent_bypass ? 'Submit (Bypass ke VP)' : 'Submit untuk Approval'}</span>
            </button>
          )}
          {canAssign && (
            <button onClick={() => setSubView('assignment')}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
              <ClipboardList className="w-4 h-4" />
              <span>Bagi Pekerjaan (Assignment)</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Status Pipeline */}
      <div className="bg-white border border-platinum-dark rounded-card p-4 shadow-sm-subtle overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {STATUS_PIPELINE.map((s, i) => {
            const isActive = program.status === s;
            const isPast = STATUS_PIPELINE.indexOf(program.status) > i;
            return (
              <React.Fragment key={s}>
                <div className={`flex flex-col items-center px-3 py-2 rounded-xl text-center ${isActive ? 'bg-navy text-white' : isPast ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-platinum text-slate-400 border border-platinum-dark'}`}>
                  {isPast && <CheckCircle2 className="w-4 h-4 mb-0.5" />}
                  <span className="text-[10px] font-bold whitespace-nowrap">{s}</span>
                </div>
                {i < STATUS_PIPELINE.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Program Details */}
          <div className="bg-white border border-platinum-dark rounded-card overflow-hidden shadow-soft-card">
            <div className="p-4 border-b border-platinum-dark bg-platinum">
              <h3 className="font-semibold text-ink">Detail Program</h3>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-5">
              {[
                { label: 'Plant', value: program.plant },
                { label: 'Area', value: program.area },
                { label: 'Departemen', value: program.department || 'Inspeksi Teknik 2' },
                { label: 'Tgl Mulai', value: new Date(program.start_date).toLocaleDateString('id-ID', { dateStyle: 'long' }) },
                { label: 'Tgl Selesai', value: new Date(program.end_date).toLocaleDateString('id-ID', { dateStyle: 'long' }) },
                { label: 'Koordinator', value: program.coordinator ? `${program.coordinator.name} (${program.coordinator.position})` : '—' },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-[10px] font-bold text-platinum-dark uppercase tracking-wider mb-1">{f.label}</p>
                  <p className="text-sm font-semibold text-ink">{f.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white border border-platinum-dark rounded-card overflow-hidden shadow-soft-card">
            <div className="p-4 border-b border-platinum-dark bg-platinum">
              <h3 className="font-semibold text-ink">Tim Program ({program.members.length} orang)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-platinum-dark text-xs uppercase tracking-wide bg-platinum/50 border-b border-platinum-dark">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nama</th>
                    <th className="px-4 py-3 font-semibold">Jabatan</th>
                    <th className="px-4 py-3 font-semibold">Divisi</th>
                    <th className="px-4 py-3 font-semibold">Peran Tugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-platinum-dark">
                  {program.members.map(m => (
                    <tr key={m.id} className="hover:bg-platinum">
                      <td className="px-4 py-3 font-semibold text-ink">{m.man_power?.name}</td>
                      <td className="px-4 py-3 text-platinum-dark text-xs">{m.man_power?.position}</td>
                      <td className="px-4 py-3 text-platinum-dark text-xs">{m.man_power?.divisi?.nama_divisi}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-navy">{m.role || 'Member'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Work Items Summary */}
          {program.items && program.items.length > 0 && (
            <div className="bg-white border border-platinum-dark rounded-card overflow-hidden shadow-soft-card">
              <div className="p-4 border-b border-platinum-dark bg-platinum">
                <h3 className="font-semibold text-ink">Work Items ({program.items.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-platinum-dark text-xs uppercase bg-platinum/50 border-b border-platinum-dark">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Pekerjaan</th>
                      <th className="px-4 py-3">Equipment</th>
                      <th className="px-4 py-3">PIC</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-platinum-dark">
                    {program.items.map(item => (
                      <tr key={item.id} className="hover:bg-platinum">
                        <td className="px-4 py-3 font-mono text-xs text-platinum-dark">{item.item_no || '—'}</td>
                        <td className="px-4 py-3 font-semibold text-ink">{item.title}</td>
                        <td className="px-4 py-3 text-xs text-platinum-dark">{item.equipment || '—'}</td>
                        <td className="px-4 py-3 text-xs text-ink">{item.pic?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${item.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : item.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-navy-soft' : item.status === 'Ready For Review' ? 'bg-amber-50 text-amber-700 border-amber-200' : item.status === 'Hold' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-platinum-dark text-slate-500 border-platinum-dark'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-platinum-dark rounded-full h-1.5 w-20">
                              <div className="bg-navy h-1.5 rounded-full" style={{ width: `${item.progress_pct}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-platinum-dark">{item.progress_pct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Approvals & Audit */}
        <div className="space-y-5">
          {/* Superior Monitoring Panel */}
          {isVpOrAdmin && (
            <div className="bg-white border border-navy/30 rounded-card p-4 shadow-soft-card">
              <h3 className="font-semibold text-ink mb-3 text-sm flex items-center">
                <Activity className="w-4 h-4 mr-1.5 text-navy" />
                Panel Atasan (Monitoring & Feedback)
              </h3>
              
              <div className="mb-4">
                <label className="block text-xs font-semibold text-platinum-dark mb-1">Set Prioritas Program:</label>
                <select 
                  value={program.priority || 'Normal'} 
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full bg-platinum border border-platinum-dark rounded-lg p-2 text-sm font-semibold text-ink focus:outline-none focus:border-navy"
                >
                  <option value="Low">Low (Rendah)</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High (Tinggi)</option>
                  <option value="Urgent">Urgent (Mendesak)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-platinum-dark mb-1">Beri Masukan / Komentar:</label>
                <textarea 
                  value={feedbackNotes} 
                  onChange={e => setFeedbackNotes(e.target.value)} 
                  rows={2}
                  placeholder="Ketik masukan untuk tim disini..."
                  className="w-full bg-platinum border border-platinum-dark rounded-lg p-2.5 text-xs text-ink focus:outline-none focus:border-navy mb-2" 
                />
                <button 
                  onClick={handleAddFeedback} 
                  disabled={handlingFeedback || !feedbackNotes.trim()}
                  className="w-full py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
                >
                  {handlingFeedback ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5 mr-1" />}
                  Kirim Masukan
                </button>
              </div>
            </div>
          )}

          {/* VP / SuperAdmin Override Approval Panel */}
          {canOverrideApprove && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-card p-4 shadow-sm-subtle">
              <h3 className="font-semibold text-indigo-800 mb-3 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                VP / Admin Override Approval
              </h3>
              <p className="text-xs text-navy mb-3 font-medium">
                Anda memiliki hak akses untuk memberikan persetujuan (bypass) pada program ini.
              </p>
              <textarea value={approvalNotes} onChange={e => setApprovalNotes(e.target.value)} rows={2}
                placeholder="Catatan (wajib untuk Revision/Reject)..."
                className="w-full bg-white border border-indigo-200 rounded-xl p-2.5 text-xs text-ink focus:outline-none mb-3" />
              <div className="flex space-x-2">
                <button onClick={() => handleOverrideApproval('Approved')} disabled={processing}
                  className="flex-1 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-500 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 mr-1" /> Setuju
                </button>
                <button onClick={() => handleOverrideApproval('Revision')} disabled={processing}
                  className="flex-1 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-400">
                  Revisi
                </button>
                <button onClick={() => handleOverrideApproval('Rejected')} disabled={processing}
                  className="flex-1 py-2 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-400">
                  Tolak
                </button>
              </div>
            </div>
          )}

          {/* Approval Panel */}
          {pendingApprovals.length > 0 && (
            <div className="bg-blue-50 border border-navy-soft rounded-card p-4 shadow-sm-subtle">
              <h3 className="font-semibold text-blue-800 mb-3 text-sm">Proses Approval</h3>
              <div className="space-y-2 mb-3">
                <label className="block text-xs font-semibold text-blue-700">Sebagai Approver:</label>
                {pendingApprovals.map(a => (
                  <label key={a.id} className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer ${selectedApproverId === a.approver_mp_id ? 'bg-blue-100 border-blue-400' : 'bg-white border-navy-soft'}`}>
                    <div>
                      <p className="text-xs font-semibold text-ink">{a.approver?.name}</p>
                      <p className="text-[10px] text-platinum-dark">{a.approver?.position} ({a.level})</p>
                    </div>
                    <input type="radio" name="approver_select" value={a.approver_mp_id}
                      checked={selectedApproverId === a.approver_mp_id}
                      onChange={() => setSelectedApproverId(a.approver_mp_id)} />
                  </label>
                ))}
              </div>
              <textarea value={approvalNotes} onChange={e => setApprovalNotes(e.target.value)} rows={2}
                placeholder="Catatan (wajib untuk Revision/Reject)..."
                className="w-full bg-white border border-navy-soft rounded-xl p-2.5 text-xs text-ink focus:outline-none mb-3" />
              <div className="flex space-x-2">
                <button onClick={() => handleApproval('Approved')} disabled={processing}
                  className="flex-1 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-500 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 mr-1" /> Setuju
                </button>
                <button onClick={() => handleApproval('Revision')} disabled={processing}
                  className="flex-1 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-400">
                  Revisi
                </button>
                <button onClick={() => handleApproval('Rejected')} disabled={processing}
                  className="flex-1 py-2 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-400">
                  Tolak
                </button>
              </div>
            </div>
          )}

          {/* Approval Status */}
          <div className="bg-white border border-platinum-dark rounded-card p-4 shadow-soft-card">
            <h3 className="font-semibold text-ink mb-3">Status Persetujuan</h3>
            <div className="space-y-3">
              {program.approvals.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Tidak ada approver (Bypass VP otomatis).</p>
              ) : program.approvals.map(a => (
                <div key={a.id} className="bg-platinum border border-platinum-dark rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink">{a.approver?.name}</p>
                      <p className="text-[10px] text-platinum-dark">{a.approver?.position} • {a.level}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${a.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : a.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' : a.status === 'Revision' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-platinum-dark text-slate-500 border-platinum-dark'}`}>
                      {a.status}
                    </span>
                  </div>
                  {a.notes && <p className="text-[10px] text-slate-500 mt-1.5 bg-white p-2 rounded border border-slate-100 italic flex items-start"><MessageSquare className="w-3 h-3 mr-1 shrink-0 mt-0.5" />{a.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-white border border-platinum-dark rounded-card p-4 shadow-soft-card max-h-72 flex flex-col">
            <h3 className="font-semibold text-ink mb-3">Jejak Aktivitas</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {program.audits.map(a => (
                <div key={a.id} className="relative pl-5 border-l-2 border-platinum-dark">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${a.action === 'Created' ? 'bg-slate-400' : a.action === 'Submitted' || a.action === 'Bypassed' ? 'bg-blue-400' : a.action === 'Approved' || a.action === 'TeamFormed' ? 'bg-emerald-400' : a.action === 'Rejected' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  <p className="text-xs font-bold text-ink">{a.action}</p>
                  <p className="text-[10px] text-platinum-dark">{new Date(a.createdAt).toLocaleString('id-ID')} • {a.actor?.name}</p>
                  {a.details && <p className="text-[10px] text-slate-500 mt-0.5 bg-platinum p-1.5 rounded">{a.details}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


