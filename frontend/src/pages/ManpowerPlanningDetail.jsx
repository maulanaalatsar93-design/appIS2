import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Loader2, ArrowLeft, Calendar, Users, CheckCircle, XCircle, AlertTriangle, FileText, Check, MessageSquare } from 'lucide-react';

export default function ManpowerPlanningDetail({ planId, onBack, onUpdated }) {
  const { token, user } = useContext(AuthContext);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Approval states
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/manpower-plans/${planId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPlan(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [planId, token]);

  const handleAction = async (status) => {
    if (status !== 'Approved' && !actionNotes) {
      setError(`Catatan wajib diisi untuk aksi ${status}.`);
      return;
    }
    
    setProcessing(true);
    setError('');
    
    try {
      const res = await fetch(`/api/manpower-plans/${planId}/approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes: actionNotes })
      });
      
      if (res.ok) {
        onUpdated();
      } else {
        const data = await res.json();
        setError(data.error || 'Terjadi kesalahan sistem.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal menghubungi server.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-industrial-muted">
        <Loader2 className="w-8 h-8 animate-spin text-industrial-blue mb-4" />
        <p className="text-sm">Memuat detail rencana...</p>
      </div>
    );
  }

  if (!plan) return <div className="p-6 text-center text-red-500 font-medium">Rencana tidak ditemukan.</div>;

  // Check if current user is an approver and it's their turn
  const pendingApproval = plan.approvals.find(a => a.approverId === user?.id && a.status === 'Pending');
  const canApprove = pendingApproval && (
    (pendingApproval.role === 'AVP' && plan.status === 'Waiting AVP Approval') || 
    (pendingApproval.role === 'VP' && plan.status === 'Waiting VP Approval')
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition-colors border border-industrial-border shadow-sm-subtle"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-industrial-text flex items-center gap-3">
            {plan.title}
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
              plan.status.includes('Approved') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              plan.status.includes('Rejected') ? 'bg-red-50 text-red-700 border-red-200' :
              plan.status.includes('Revision') ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {plan.status}
            </span>
          </h1>
          <p className="text-industrial-muted text-xs mt-1">Dibuat oleh <span className="font-medium text-slate-700">{plan.createdBy.name}</span> pada {new Date(plan.createdAt).toLocaleString('id-ID')}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-600 shadow-sm-subtle">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Approval Actions Panel (if applicable) */}
      {canApprove && (
        <div className="bg-blue-50 border border-blue-200 rounded-card p-5 shadow-sm-subtle">
          <h3 className="text-blue-800 font-semibold mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
            Menunggu Persetujuan Anda (Sebagai {pendingApproval.role})
          </h3>
          <textarea 
            value={actionNotes} onChange={e => setActionNotes(e.target.value)}
            placeholder="Tambahkan catatan jika merevisi atau menolak (opsional untuk menyetujui)"
            className="w-full bg-white border border-blue-200 rounded-xl p-3 text-sm text-industrial-text focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 mb-4 h-20 shadow-inner"
          />
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleAction('Approved')} disabled={processing}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center"
            >
              {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} Setujui
            </button>
            <button 
              onClick={() => handleAction('Revision')} disabled={processing}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center"
            >
               Request Revisi
            </button>
            <button 
              onClick={() => handleAction('Rejected')} disabled={processing}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center"
            >
               Tolak
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Personil */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-industrial-border rounded-card overflow-hidden shadow-soft-card">
             <div className="p-4 border-b border-industrial-border bg-slate-50">
              <h3 className="font-semibold text-industrial-text">Detail Pekerjaan</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-industrial-muted mb-1.5 uppercase tracking-wider">Tanggal Mulai</p>
                <p className="text-sm font-semibold text-industrial-text flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400"/> {new Date(plan.startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-industrial-muted mb-1.5 uppercase tracking-wider">Tanggal Selesai</p>
                <p className="text-sm font-semibold text-industrial-text flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400"/> {new Date(plan.endDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-industrial-muted mb-1.5 uppercase tracking-wider">Departemen</p>
                <p className="text-sm font-semibold text-industrial-text">{plan.department}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-industrial-muted mb-1.5 uppercase tracking-wider">Area / Plant</p>
                <p className="text-sm font-semibold text-industrial-text">{plan.area}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-industrial-border rounded-card overflow-hidden shadow-soft-card">
             <div className="p-4 border-b border-industrial-border bg-slate-50">
              <h3 className="font-semibold text-industrial-text">Daftar Personil ({plan.members.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-industrial-muted bg-slate-50/50 border-b border-industrial-border text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-semibold">Nama Personil</th>
                    <th className="px-5 py-3 font-semibold">Jabatan</th>
                    <th className="px-5 py-3 font-semibold">Peran Tugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-industrial-border">
                  {plan.members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-semibold text-industrial-text">{m.manPower.name}</td>
                      <td className="px-5 py-3.5 text-industrial-muted text-xs">{m.manPower.position}</td>
                      <td className="px-5 py-3.5 font-medium text-industrial-blue">{m.role || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Approvals & Audits */}
        <div className="space-y-6">
          <div className="bg-white border border-industrial-border rounded-card p-5 shadow-soft-card">
            <h3 className="font-semibold text-industrial-text mb-4">Status Persetujuan</h3>
            <div className="space-y-3">
              {plan.approvals.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 italic flex items-center justify-center">Tidak ada antrean (Bypass)</p>
                </div>
              ) : plan.approvals.map((appr, idx) => (
                <div key={idx} className="flex flex-col bg-slate-50 p-3.5 rounded-xl border border-slate-200 relative">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-industrial-text">{appr.role}</p>
                      <p className="text-[10px] text-industrial-muted font-medium mt-0.5">{appr.approver?.name || `ID: ${appr.approverId}`}</p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] rounded border font-semibold ${
                      appr.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      appr.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                      appr.status === 'Revision' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {appr.status}
                    </span>
                  </div>
                  {appr.notes && (
                    <div className="bg-white p-2.5 rounded-lg text-xs text-slate-600 border border-slate-100 shadow-sm-subtle mt-1 flex items-start">
                      <MessageSquare className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0 mt-0.5" />
                      <span className="italic">{appr.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-industrial-border rounded-card p-5 h-80 flex flex-col shadow-soft-card">
            <h3 className="font-semibold text-industrial-text mb-4">Jejak Aktivitas (Audit)</h3>
            <div className="flex-1 overflow-y-auto space-y-5 pr-2">
              {plan.audits.map((audit) => (
                <div key={audit.id} className="relative pl-5 border-l-2 border-slate-200">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                    audit.action === 'Created' || audit.action === 'Submitted' ? 'bg-blue-400' :
                    audit.action === 'Approved' ? 'bg-emerald-400' :
                    audit.action === 'Rejected' ? 'bg-red-400' :
                    audit.action === 'Revision' ? 'bg-amber-400' :
                    'bg-slate-400'
                  }`}></div>
                  <p className="text-xs font-bold text-industrial-text">{audit.action}</p>
                  <p className="text-[10px] font-medium text-industrial-muted mb-1">{new Date(audit.createdAt).toLocaleString('id-ID')} oleh {audit.user.name}</p>
                  {audit.details && <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">{audit.details}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
