import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Loader2, ArrowLeft, Calendar, Save, AlertCircle, Check, Users, Search, Plus, Trash2, FastForward, Info } from 'lucide-react';

export default function ManpowerPlanningForm({ onBack, onSaved }) {
  const { token, user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    department: '',
    area: '',
    isUrgentBypass: false
  });
  
  const [availableManpower, setAvailableManpower] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [approvers, setApprovers] = useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All');
  
  // Approver states
  const [availableApprovers, setAvailableApprovers] = useState([]);
  
  // Loading states
  const [loadingManpower, setLoadingManpower] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch Manpower when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const fetchAvailability = async () => {
        setLoadingManpower(true);
        try {
          const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/manpower-plans/availability?startDate=${formData.startDate}&endDate=${formData.endDate}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setAvailableManpower(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingManpower(false);
        }
      };
      fetchAvailability();
    }
  }, [formData.startDate, formData.endDate, token]);

  // Fetch Approvers on mount
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/manpower-plans/approvers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setAvailableApprovers(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch approvers', err);
      }
    };
    fetchApprovers();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addMember = (mp) => {
    if (selectedMembers.find(m => m.manPowerId === mp.id)) return;
    
    // Default role can be their position
    setSelectedMembers(prev => [...prev, {
      manPowerId: mp.id,
      name: mp.name,
      position: mp.position,
      role: mp.position, // Editable later
      notes: '',
      hasConflicts: mp.absensi?.length > 0 || mp.plan_members?.length > 0
    }]);
  };

  const removeMember = (id) => {
    setSelectedMembers(prev => prev.filter(m => m.manPowerId !== id));
  };

  const updateMemberRole = (id, role) => {
    setSelectedMembers(prev => prev.map(m => m.manPowerId === id ? { ...m, role } : m));
  };

  const addApprover = (role) => {
    setApprovers(prev => [...prev, { userId: '', role }]);
  };

  const removeApprover = (index) => {
    setApprovers(prev => prev.filter((_, i) => i !== index));
  };

  const updateApprover = (index, userId) => {
    setApprovers(prev => prev.map((a, i) => i === index ? { ...a, userId: parseInt(userId) } : a));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.department || !formData.area) {
      return setError('Mohon lengkapi semua field utama (Nama Program, Tanggal, Departemen, Area).');
    }

    if (selectedMembers.length === 0) {
      return setError('Pilih setidaknya satu personil untuk ditugaskan.');
    }

    if (!formData.isUrgentBypass && approvers.filter(a => a.role === 'AVP' && a.userId).length === 0) {
      return setError('Mohon pilih setidaknya satu AVP untuk Approval, atau gunakan opsi Urgent Bypass.');
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        members: selectedMembers,
        approvers: approvers.filter(a => a.userId !== '')
      };

      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/manpower-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setError(data.error || 'Terjadi kesalahan saat menyimpan data.');
      }
    } catch (err) {
      console.error(err);
      setError('Koneksi ke server gagal.');
    } finally {
      setSaving(false);
    }
  };

  // Compute unique divisions for filter
  const divisions = ['All', ...new Set(availableManpower.map(mp => mp.divisi.nama_divisi))];

  const filteredManpower = availableManpower.filter(mp => {
    const matchSearch = mp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        mp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDivision = selectedDivision === 'All' || mp.divisi.nama_divisi === selectedDivision;
    return matchSearch && matchDivision;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition-colors border border-industrial-border shadow-sm-subtle"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-industrial-text">Buat Rencana Manpower</h1>
            <p className="text-industrial-muted text-sm">Susun form penempatan dan alur persetujuan</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center space-x-2 bg-industrial-green hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Simpan Rencana</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details & Approvals */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-industrial-border rounded-card p-5 space-y-4 shadow-sm-subtle">
            <h3 className="font-semibold text-industrial-text border-b border-industrial-border pb-2">Informasi Program</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-industrial-text mb-1.5">Nama Program / Pekerjaan</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleInputChange}
                  className="w-full bg-white border border-industrial-border rounded-lg px-3 py-2 text-sm text-industrial-text focus:outline-none focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue"
                  placeholder="Contoh: Overhaul Pabrik 1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-industrial-text mb-1.5">Tgl Mulai</label>
                  <input 
                    type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                    className="w-full bg-white border border-industrial-border rounded-lg px-3 py-2 text-sm text-industrial-text focus:outline-none focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-industrial-text mb-1.5">Tgl Selesai</label>
                  <input 
                    type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                    className="w-full bg-white border border-industrial-border rounded-lg px-3 py-2 text-sm text-industrial-text focus:outline-none focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-industrial-text mb-1.5">Departemen</label>
                <input 
                  type="text" name="department" value={formData.department} onChange={handleInputChange}
                  className="w-full bg-white border border-industrial-border rounded-lg px-3 py-2 text-sm text-industrial-text focus:outline-none focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue"
                  placeholder="Contoh: Pemeliharaan Mekanik"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-industrial-text mb-1.5">Area / Plant</label>
                <input 
                  type="text" name="area" value={formData.area} onChange={handleInputChange}
                  className="w-full bg-white border border-industrial-border rounded-lg px-3 py-2 text-sm text-industrial-text focus:outline-none focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue"
                  placeholder="Contoh: Amonia P-1B"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-industrial-border rounded-card p-5 space-y-4 shadow-sm-subtle">
            <div className="flex items-center justify-between border-b border-industrial-border pb-2">
              <h3 className="font-semibold text-industrial-text">Alur Persetujuan</h3>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" name="isUrgentBypass" checked={formData.isUrgentBypass} onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                />
                <span className="text-xs font-medium text-red-500 group-hover:text-red-600 transition-colors flex items-center">
                  <FastForward className="w-3 h-3 mr-1" /> Urgent Bypass
                </span>
              </label>
            </div>
            
            <div className="space-y-3">
              {!formData.isUrgentBypass && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-industrial-text">AVP Approvers</label>
                    <button type="button" onClick={() => addApprover('AVP')} className="text-xs text-industrial-blue hover:text-blue-700 font-medium">+ Tambah AVP</button>
                  </div>
                  {approvers.filter(a => a.role === 'AVP').length === 0 && (
                    <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">Wajib menambahkan minimal 1 AVP jika bukan Urgent Bypass.</p>
                  )}
                  {approvers.map((appr, idx) => appr.role === 'AVP' && (
                    <div key={idx} className="flex items-center space-x-2">
                      <select 
                        value={appr.userId} 
                        onChange={(e) => updateApprover(idx, e.target.value)}
                        className="w-full bg-white border border-industrial-border rounded-lg px-3 py-1.5 text-sm text-industrial-text focus:outline-none focus:border-industrial-blue"
                      >
                        <option value="">-- Pilih AVP --</option>
                        {availableApprovers.map(user => (
                          <option key={user.id} value={user.id}>{user.name} ({user.position})</option>
                        ))}
                      </select>
                      <button onClick={() => removeApprover(idx)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg border border-slate-200"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Manpower Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-industrial-border rounded-card overflow-hidden shadow-soft-card flex flex-col h-[400px]">
            <div className="p-4 border-b border-industrial-border flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-industrial-text">Personil yang Ditugaskan ({selectedMembers.length})</h3>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-2 bg-industrial-background/30">
              {selectedMembers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Users className="w-10 h-10 mb-3 opacity-20 text-slate-500" />
                  <p className="text-sm font-medium text-slate-600">Belum ada personil yang dipilih.</p>
                  <p className="text-xs mt-1 text-center">Pilih personil dari daftar ketersediaan di bawah berdasarkan tanggal yang telah ditentukan.</p>
                </div>
              ) : (
                selectedMembers.map(member => (
                  <div key={member.manPowerId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-industrial-border rounded-xl shadow-sm-subtle gap-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-industrial-text text-sm">{member.name}</p>
                        {member.hasConflicts && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded border border-amber-200">Ada Jadwal/Cuti</span>
                        )}
                      </div>
                      <p className="text-xs text-industrial-muted">{member.position}</p>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <input 
                        type="text" 
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.manPowerId, e.target.value)}
                        placeholder="Peran (Opsional)"
                        className="w-full sm:w-40 bg-slate-50 border border-industrial-border rounded-lg px-2 py-1.5 text-xs text-industrial-text focus:outline-none focus:border-industrial-blue"
                      />
                      <button onClick={() => removeMember(member.manPowerId)} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Availability Pool */}
          <div className="bg-white border border-industrial-border rounded-card overflow-hidden shadow-soft-card">
            <div className="p-4 border-b border-industrial-border flex items-center justify-between bg-slate-50">
              <div className="flex flex-col">
                 <h3 className="font-semibold text-industrial-text text-sm flex items-center">
                   <Users className="w-4 h-4 mr-1.5 text-industrial-blue" />
                   Database Ketersediaan Personil
                 </h3>
                 <p className="text-[10px] text-industrial-muted mt-0.5">Daftar anggota ditarik langsung dari database Man Power, mendeteksi status cuti/sakit secara otomatis.</p>
              </div>
              {(!formData.startDate || !formData.endDate) && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 font-medium rounded border border-amber-200 flex items-center">
                  <Info className="w-3.5 h-3.5 mr-1" />Isi tanggal program terlebih dahulu
                </span>
              )}
            </div>

            {/* Filters */}
            {availableManpower.length > 0 && (
              <div className="p-3 bg-white border-b border-industrial-border flex gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari nama atau jabatan..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-industrial-text focus:outline-none focus:border-industrial-blue"
                  />
                </div>
                <select 
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-industrial-text focus:outline-none focus:border-industrial-blue min-w-[120px]"
                >
                  {divisions.map(div => (
                    <option key={div} value={div}>{div === 'All' ? 'Semua Bagian' : div}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="p-4 max-h-[350px] overflow-y-auto bg-industrial-background/20">
              {loadingManpower ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-industrial-blue" /></div>
              ) : availableManpower.length === 0 ? (
                <p className="text-xs text-center text-slate-500 py-4">Pilih rentang tanggal di kolom kiri untuk melihat daftar ketersediaan seluruh anggota.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredManpower.map(mp => {
                    const isSelected = selectedMembers.some(m => m.manPowerId === mp.id);
                    const hasAbsensi = mp.absensi && mp.absensi.length > 0;
                    const hasPlanConflicts = mp.plan_members && mp.plan_members.length > 0;
                    const hasConflicts = hasAbsensi || hasPlanConflicts;
                    
                    return (
                      <div key={mp.id} onClick={() => !isSelected && addMember(mp)} className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50 border-blue-200 opacity-50 cursor-not-allowed' : hasConflicts ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-100' : 'bg-white border-industrial-border hover:border-industrial-blue shadow-sm-subtle'}`}>
                        <div>
                          <p className={`font-semibold text-sm flex items-center ${isSelected ? 'text-blue-700' : 'text-industrial-text'}`}>
                            {mp.name}
                            {!hasConflicts && !isSelected && (
                               <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-full">TERSEDIA</span>
                            )}
                          </p>
                          <p className="text-[10px] text-industrial-muted">{mp.position} • <span className="font-medium text-slate-600">{mp.divisi.nama_divisi}</span></p>
                          
                          {hasConflicts && !isSelected && (
                            <div className="mt-1.5 space-y-1">
                              {hasAbsensi && <p className="text-[10px] font-medium text-red-600 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Tercatat Cuti/Sakit</p>}
                              {hasPlanConflicts && <p className="text-[10px] font-medium text-amber-600 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Terjadwal di {mp.plan_members.length} program</p>}
                            </div>
                          )}
                        </div>
                        {isSelected ? (
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
                            <Check className="w-4 h-4 text-industrial-blue" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 hover:bg-industrial-blue hover:border-industrial-blue hover:text-white text-slate-400 transition-colors shrink-0">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
