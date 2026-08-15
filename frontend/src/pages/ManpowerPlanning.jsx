import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Loader2, Plus, Calendar as CalendarIcon, Users, FileText, ChevronRight, Eye, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import ManpowerPlanningForm from './ManpowerPlanningForm';
import ManpowerPlanningDetail from './ManpowerPlanningDetail';

export default function ManpowerPlanning() {
  const { user, token } = useContext(AuthContext);
  const [view, setView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/manpower-plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchPlans();
    }
  }, [view, token]);

  const handleCreateNew = () => {
    setSelectedPlanId(null);
    setView('form');
  };

  const handleViewDetail = (id) => {
    setSelectedPlanId(id);
    setView('detail');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Draft': 'bg-slate-100 text-slate-600 border-slate-200',
      'Waiting AVP Approval': 'bg-blue-50 text-blue-600 border-blue-200',
      'Waiting VP Approval': 'bg-indigo-50 text-indigo-600 border-indigo-200',
      'Approved': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'Rejected': 'bg-red-50 text-red-600 border-red-200',
      'Revision Requested': 'bg-amber-50 text-amber-600 border-amber-200',
      'Cancelled': 'bg-gray-100 text-gray-500 border-gray-200',
    };
    
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${badges[status] || badges['Draft']}`}>
        {status}
      </span>
    );
  };

  if (view === 'form') {
    return <ManpowerPlanningForm onBack={() => setView('list')} onSaved={() => setView('list')} />;
  }

  if (view === 'detail') {
    return <ManpowerPlanningDetail planId={selectedPlanId} onBack={() => setView('list')} onUpdated={() => setView('list')} />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-2">Perencanaan Manpower</h1>
          <p className="text-platinum-dark text-sm">Kelola rencana penempatan personel untuk program pabrik dan pantau proses persetujuan.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 bg-navy hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Rencana</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-platinum-dark rounded-card p-4 flex items-start space-x-4 shadow-sm-subtle">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-platinum-dark">Total Rencana</p>
            <p className="text-2xl font-bold text-ink mt-1">{plans.length}</p>
          </div>
        </div>
        <div className="bg-white border border-platinum-dark rounded-card p-4 flex items-start space-x-4 shadow-sm-subtle">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-platinum-dark">Menunggu Approval</p>
            <p className="text-2xl font-bold text-ink mt-1">
              {plans.filter(p => p.status.includes('Waiting')).length}
            </p>
          </div>
        </div>
        <div className="bg-white border border-platinum-dark rounded-card p-4 flex items-start space-x-4 shadow-sm-subtle">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-platinum-dark">Disetujui</p>
            <p className="text-2xl font-bold text-ink mt-1">
              {plans.filter(p => p.status === 'Approved').length}
            </p>
          </div>
        </div>
        <div className="bg-white border border-platinum-dark rounded-card p-4 flex items-start space-x-4 shadow-sm-subtle">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-platinum-dark">Perlu Perhatian</p>
            <p className="text-2xl font-bold text-ink mt-1">
              {plans.filter(p => p.status === 'Rejected' || p.status === 'Revision Requested').length}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-platinum-dark rounded-card overflow-hidden shadow-soft-card">
        <div className="p-4 border-b border-platinum-dark bg-gray-50/50">
          <h2 className="text-sm font-semibold text-ink">Daftar Dokumen Perencanaan</h2>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-platinum-dark">
            <Loader2 className="w-8 h-8 animate-spin text-navy mb-4" />
            <p className="text-sm">Memuat data perencanaan...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium text-slate-500">Belum ada dokumen perencanaan.</p>
            <p className="text-xs mt-1">Klik "Buat Rencana" untuk mulai merencanakan penugasan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-platinum-dark border-b border-platinum-dark bg-gray-50/50">
                  <th className="px-4 py-3 font-medium">Program / Pekerjaan</th>
                  <th className="px-4 py-3 font-medium">Jadwal Pelaksanaan</th>
                  <th className="px-4 py-3 font-medium">Departemen & Area</th>
                  <th className="px-4 py-3 font-medium">Personil</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum-dark">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink truncate max-w-[200px]">{plan.title}</p>
                      <p className="text-xs text-platinum-dark mt-0.5">Pembuat: {plan.createdBy.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1.5 text-ink text-xs">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(plan.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} 
                          {' - '}
                          {new Date(plan.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{plan.department}</p>
                      <p className="text-xs text-platinum-dark mt-0.5">{plan.area}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1.5 text-ink text-xs bg-slate-100 px-2 py-1 rounded-md w-fit border border-slate-200">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-medium">{plan.members?.length || 0} orang</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(plan.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleViewDetail(plan.id)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 inline-flex items-center"
                        title="Lihat Detail"
                      >
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
