import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Loader2, ArrowLeft, Save, AlertCircle, Users, Search,
  Plus, Trash2, FastForward, Check, Calendar, Info, AlertTriangle
} from 'lucide-react';

export default function WorkProgramForm({ onBack, onSaved }) {
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    title: '', plant: '', area: '', work_package: '',
    department: 'Inspeksi Teknik 2', start_date: '', end_date: '',
    estimated_duration: '', notes: '',
    is_urgent_bypass: false, bypass_reason: ''
  });

  const [availableManpower, setAvailableManpower] = useState([]);
  const [approversList, setApproversList] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [coordinatorId, setCoordinatorId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisions, setSelectedDivisions] = useState([]); // [] means All
  const [isDivDropdownOpen, setIsDivDropdownOpen] = useState(false);
  const [loadingMp, setLoadingMp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch Approvers (AVP + VP from ManPower)
  useEffect(() => {
    const fetchApprovers = async () => {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/wpem/approvers', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setApproversList(await res.json());
    };
    fetchApprovers();
  }, [token]);

  // Fetch Manpower Availability when dates change
  useEffect(() => {
    if (!form.start_date || !form.end_date) return;

    // Hitung otomatis estimasi durasi (hari)
    const sDate = new Date(form.start_date);
    const eDate = new Date(form.end_date);
    if (eDate >= sDate) {
      const diffTime = Math.abs(eDate - sDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 karena dihitung inklusif
      setForm(prev => ({ ...prev, estimated_duration: diffDays }));
    }
    const fetchMp = async () => {
      setLoadingMp(true);
      const params = new URLSearchParams({ startDate: form.start_date, endDate: form.end_date });
      const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wpem/availability?${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setAvailableManpower(await res.json());
      setLoadingMp(false);
    };
    fetchMp();
  }, [form.start_date, form.end_date, token]);

  const divisions = [...new Set(availableManpower.map(mp => mp.divisi?.nama_divisi).filter(Boolean))];

  const toggleDivision = (divName) => {
    setSelectedDivisions(prev => {
      if (prev.includes(divName)) return prev.filter(d => d !== divName);
      return [...prev, divName];
    });
  };

  const filteredMp = availableManpower.filter(mp => {
    const matchSearch = mp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDiv = selectedDivisions.length === 0 || selectedDivisions.includes(mp.divisi?.nama_divisi);
    return matchSearch && matchDiv;
  });

  const addMember = (mp) => {
    if (selectedMembers.find(m => m.man_power_id === mp.id)) return;
    setSelectedMembers(prev => [...prev, {
      man_power_id: mp.id, name: mp.name, position: mp.position,
      role: mp.position, hasConflict: mp.availability_status !== 'Tersedia'
    }]);
  };

  const addAllMembers = () => {
    setSelectedMembers(prev => {
      const existingIds = new Set(prev.map(m => m.man_power_id));
      const toAdd = filteredMp
        .filter(mp => !existingIds.has(mp.id))
        .map(mp => ({
          man_power_id: mp.id,
          name: mp.name,
          position: mp.position,
          role: mp.position,
          hasConflict: mp.availability_status !== 'Tersedia'
        }));
      return [...prev, ...toAdd];
    });
  };

  const removeAllMembers = () => setSelectedMembers([]);

  const removeMember = (id) => setSelectedMembers(prev => prev.filter(m => m.man_power_id !== id));
  const updateMemberRole = (id, role) => setSelectedMembers(prev => prev.map(m => m.man_power_id === id ? { ...m, role } : m));

  const toggleApprover = (approver) => {
    setSelectedApprovers(prev => {
      const exists = prev.find(a => a.man_power_id === approver.id);
      if (exists) return prev.filter(a => a.man_power_id !== approver.id);
      return [...prev, { man_power_id: approver.id, level: approver.level, name: approver.name, position: approver.position }];
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title || !form.start_date || !form.end_date) return setError('Nama Program, Tanggal Mulai, dan Tanggal Selesai wajib diisi.');
    if (form.is_urgent_bypass && !form.bypass_reason) return setError('Alasan Bypass wajib diisi untuk Urgent Bypass.');
    if (!form.is_urgent_bypass && selectedApprovers.filter(a => a.level === 'AVP').length === 0) return setError('Pilih minimal 1 AVP untuk approval, atau aktifkan Urgent Bypass.');

    setSaving(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/wpem/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          coordinator_id: coordinatorId || null,
          members: selectedMembers,
          approvers: selectedApprovers
        })
      });
      if (res.ok) onSaved();
      else { const d = await res.json(); setError(d.error || 'Gagal menyimpan.'); }
    } catch { setError('Koneksi ke server gagal.'); }
    finally { setSaving(false); }
  };

  const avpList = approversList.filter(a => a.level === 'AVP');
  const vpList = approversList.filter(a => a.level === 'VP');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 bg-white border border-platinum-dark rounded-lg shadow-sm-subtle hover:bg-platinum">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-ink">Buat Work Program</h1>
            <p className="text-sm text-platinum-dark">Rencanakan program, pilih tim & approver dari database personel</p>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center space-x-2 bg-success hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Simpan Program</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form Info */}
        <div className="lg:col-span-1 space-y-5">
          {/* Program Info */}
          <div className="bg-white border border-platinum-dark rounded-card p-5 space-y-4 shadow-sm-subtle">
            <h3 className="font-semibold text-ink border-b border-platinum-dark pb-2">Informasi Program</h3>
            {[
              { label: 'Nama Program / Turn Around', name: 'title', placeholder: 'Contoh: TA Compressor TS-441' },
              { label: 'Plant', name: 'plant', placeholder: 'Contoh: Pabrik 1 / P1' },
              { label: 'Area / Lokasi', name: 'area', placeholder: 'Contoh: Amonia P-1B' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-ink mb-1.5">{f.label}</label>
                <input type="text" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                  className="w-full bg-white border border-platinum-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Tgl Mulai</label>
                <input type="date" name="start_date" value={form.start_date} onChange={handleChange}
                  className="w-full bg-white border border-platinum-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Tgl Selesai</label>
                <input type="date" name="end_date" value={form.end_date} onChange={handleChange}
                  className="w-full bg-white border border-platinum-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Estimasi Durasi (hari)</label>
              <input type="number" name="estimated_duration" value={form.estimated_duration} onChange={handleChange} placeholder="Opsional"
                className="w-full bg-white border border-platinum-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Keterangan</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Catatan tambahan..."
                className="w-full bg-white border border-platinum-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy resize-none" />
            </div>
          </div>

          {/* Approval Section */}
          <div className="bg-white border border-platinum-dark rounded-card p-5 space-y-4 shadow-sm-subtle">
            <div className="flex items-center justify-between border-b border-platinum-dark pb-2">
              <h3 className="font-semibold text-ink">Alur Persetujuan</h3>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="is_urgent_bypass" checked={form.is_urgent_bypass} onChange={handleChange}
                  className="w-4 h-4 rounded text-red-500" />
                <span className="text-xs font-semibold text-red-500 flex items-center">
                  <FastForward className="w-3 h-3 mr-1" /> Urgent Bypass
                </span>
              </label>
            </div>

            {form.is_urgent_bypass && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs font-semibold text-red-700 mb-2">Alasan Bypass (Wajib)</p>
                <textarea name="bypass_reason" value={form.bypass_reason} onChange={handleChange} rows={2} placeholder="Jelaskan alasan urgensi..."
                  className="w-full bg-white border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none" />
              </div>
            )}

            {!form.is_urgent_bypass && (
              <>
                <div>
                  <p className="text-xs font-semibold text-ink mb-2">Pilih AVP Approver</p>
                  <div className="space-y-2">
                    {avpList.map(avp => {
                      const selected = selectedApprovers.find(a => a.man_power_id === avp.id);
                      return (
                        <label key={avp.id} className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${selected ? 'bg-blue-50 border-blue-300' : 'border-platinum-dark hover:bg-platinum'}`}>
                          <div>
                            <p className="text-xs font-semibold text-ink">{avp.name}</p>
                            <p className="text-[10px] text-platinum-dark">{avp.position} — {avp.divisi?.nama_divisi}</p>
                          </div>
                          <input type="checkbox" checked={!!selected} onChange={() => toggleApprover(avp)} className="w-4 h-4 rounded text-navy" />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Member Selection */}
        <div className="lg:col-span-2 space-y-5">
          {/* Selected Members */}
          <div className="bg-white border border-platinum-dark rounded-card overflow-hidden shadow-soft-card h-[320px] flex flex-col">
            <div className="p-4 border-b border-platinum-dark bg-platinum flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-ink text-sm">Personel yang Ditugaskan ({selectedMembers.length})</h3>
                {selectedMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={removeAllMembers}
                    className="text-[11px] text-red-500 hover:text-red-700 font-semibold px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>
              {selectedMembers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-ink">Koordinator:</label>
                  <select value={coordinatorId} onChange={e => setCoordinatorId(e.target.value)}
                    className="bg-white border border-platinum-dark rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-navy">
                    <option value="">— Pilih Koordinator —</option>
                    {selectedMembers.map(m => <option key={m.man_power_id} value={m.man_power_id}>{m.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-2 bg-platinum/20">
              {selectedMembers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Users className="w-10 h-10 opacity-20 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Belum ada personel dipilih.</p>
                  <p className="text-xs mt-1">Pilih dari daftar di bawah.</p>
                </div>
              ) : selectedMembers.map(m => (
                <div key={m.man_power_id} className="flex items-center justify-between bg-white border border-platinum-dark rounded-xl p-3 shadow-sm-subtle">
                  <div className="flex items-center space-x-2 flex-1">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-sm text-ink">{m.name}</p>
                        {coordinatorId == m.man_power_id && (
                          <span className="px-1.5 py-0.5 bg-navy text-white text-[9px] font-bold rounded">KOORDINATOR</span>
                        )}
                        {m.hasConflict && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded border border-amber-200">⚠ Konflik</span>
                        )}
                      </div>
                      <p className="text-[10px] text-platinum-dark">{m.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="text" value={m.role} onChange={e => updateMemberRole(m.man_power_id, e.target.value)} placeholder="Peran"
                      className="w-32 bg-platinum border border-platinum-dark rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-navy" />
                    <button onClick={() => removeMember(m.man_power_id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-platinum-dark rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Pool */}
          <div className="bg-white border border-platinum-dark rounded-card overflow-hidden shadow-soft-card">
            <div className="p-4 border-b border-platinum-dark bg-platinum flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-ink text-sm flex items-center">
                  <Users className="w-4 h-4 mr-1.5 text-navy" /> Database Ketersediaan Personel
                </h3>
                <p className="text-[10px] text-platinum-dark mt-0.5">Data ditarik dari database ManPower. Status cuti/sakit otomatis terdeteksi.</p>
              </div>
              <div className="flex items-center space-x-2">
                {form.start_date && form.end_date && filteredMp.length > 0 && (
                  <button
                    type="button"
                    onClick={addAllMembers}
                    className="px-3 py-1.5 bg-navy hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm transition-all"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span>Pilih Semua Personel ({filteredMp.length})</span>
                  </button>
                )}
                {(!form.start_date || !form.end_date) && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded border border-amber-200 flex items-center font-medium">
                    <Info className="w-3.5 h-3.5 mr-1" /> Isi tanggal terlebih dahulu
                  </span>
                )}
              </div>
            </div>

            {availableManpower.length > 0 && (
              <div className="p-3 bg-white border-b border-platinum-dark flex gap-3 items-center">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Cari nama atau jabatan..." value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-platinum border border-platinum-dark rounded-lg text-xs focus:outline-none focus:border-navy" />
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDivDropdownOpen(!isDivDropdownOpen)}
                    className="bg-platinum border border-platinum-dark rounded-lg px-3 py-2 text-xs text-ink font-medium flex items-center justify-between min-w-[130px]"
                  >
                    <span className="truncate">
                      {selectedDivisions.length === 0
                        ? 'Semua Bagian'
                        : `${selectedDivisions.length} Bagian`}
                    </span>
                  </button>
                  {isDivDropdownOpen && (
                    <div className="absolute right-0 mt-1 bg-white border border-platinum-dark rounded-xl shadow-xl z-30 p-2 space-y-1 w-56">
                      <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 mb-1">
                        <span className="text-[10px] font-bold text-platinum-dark">Bagian / Divisi:</span>
                        <button
                          type="button"
                          onClick={() => setSelectedDivisions([])}
                          className="text-[10px] text-navy font-semibold hover:underline"
                        >
                          Reset
                        </button>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-0.5">
                        {divisions.map(d => (
                          <label key={d} className="flex items-center space-x-2 px-2 py-1 hover:bg-platinum rounded cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={selectedDivisions.includes(d)}
                              onChange={() => toggleDivision(d)}
                              className="w-3.5 h-3.5 rounded text-navy"
                            />
                            <span className="truncate">{d}</span>
                          </label>
                        ))}
                      </div>
                      <div className="pt-1 border-t border-slate-100 text-right">
                        <button
                          type="button"
                          onClick={() => setIsDivDropdownOpen(false)}
                          className="px-2.5 py-0.5 bg-navy text-white text-[11px] font-semibold rounded"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 max-h-[600px] min-h-[400px] overflow-y-auto bg-platinum/80 inner-shadow-sm">
              {loadingMp ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>
              ) : availableManpower.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Calendar className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">Pilih rentang tanggal untuk melihat ketersediaan personel.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                  {filteredMp.map(mp => {
                    const isSelected = selectedMembers.some(m => m.man_power_id === mp.id);
                    const hasConflict = mp.availability_status !== 'Tersedia';
                    
                    let bgConfig = 'bg-white border-platinum-dark hover:border-navy';
                    let alertColor = 'text-amber-700';
                    let alertBg = 'bg-amber-50';

                    if (mp.availability_status === 'Tersedia') {
                      bgConfig = 'bg-white border-emerald-200 hover:border-emerald-400 shadow-sm';
                    } else if (mp.availability_status === 'Bertugas') {
                      bgConfig = 'bg-blue-50/60 border-navy-soft hover:bg-blue-100/60 shadow-sm';
                      alertColor = 'text-blue-700';
                      alertBg = 'bg-blue-100';
                    } else if (['Cuti', 'Sakit', 'Izin'].includes(mp.availability_status)) {
                      bgConfig = 'bg-rose-50/60 border-rose-200 hover:bg-rose-100/60';
                      alertColor = 'text-rose-700';
                      alertBg = 'bg-rose-100';
                    } else if (['Training', 'DinasDalamNegeri', 'DinasLuarNegeri'].includes(mp.availability_status)) {
                      bgConfig = 'bg-purple-50/60 border-purple-200 hover:bg-purple-100/60';
                      alertColor = 'text-purple-700';
                      alertBg = 'bg-purple-100';
                    }

                    const cardColor = isSelected ? 'bg-platinum-dark border-slate-300 opacity-60 cursor-not-allowed' : bgConfig;

                    return (
                      <div key={mp.id} onClick={() => !isSelected && addMember(mp)}
                        className={`p-3 border rounded-xl flex items-start justify-between cursor-pointer transition-all duration-200 ${cardColor}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-1">
                            <p className={`font-bold text-[13px] ${isSelected ? 'text-slate-600' : 'text-ink'}`}>{mp.name}</p>
                            {!hasConflict && !isSelected && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded border border-emerald-200 uppercase tracking-wide">Tersedia</span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-slate-500 mt-0.5">{mp.position} <span className="mx-1">•</span> <span className="font-semibold">{mp.divisi?.nama_divisi}</span></p>
                          {hasConflict && !isSelected && (
                            <div className={`mt-2 inline-flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-bold border border-white/20 ${alertBg} ${alertColor}`}>
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[200px]">
                                {mp.availability_status}
                                {mp.active_programs?.[0] ? ` — ${mp.active_programs[0].title}` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border transition-colors ml-2 shadow-sm ${isSelected ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-white border-platinum-dark hover:bg-navy hover:border-navy hover:text-white text-slate-400'}`}>
                          {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                      </div>
                    );
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


