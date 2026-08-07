import React, { useState, useEffect } from 'react';
import { Shield, Plus, Search, Filter, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function SertifikasiPersonel() {
  const [sertifikasi, setSertifikasi] = useState([]);
  const [manpowerList, setManpowerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('sertifikasi'); // 'sertifikasi' | 'rencana'
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    man_power_id: '',
    nama_sertifikat: '',
    no_sertifikat: '',
    tanggal_sertifikasi: '',
    tanggal_berakhir: '',
    remarks: '',
    is_rencana: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [sertRes, mpRes] = await Promise.all([
        fetch('http://localhost:5000/api/sertifikasi', { headers }),
        fetch('http://localhost:5000/api/dashboard/manpower', { headers })
      ]);

      if (!sertRes.ok) throw new Error('Failed to fetch sertifikasi data');
      
      const sertData = await sertRes.json();
      setSertifikasi(sertData);

      if (mpRes.ok) {
        const mpData = await mpRes.json();
        setManpowerList(mpData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (sert = null) => {
    if (sert) {
      setEditingId(sert.id);
      setFormData({
        man_power_id: sert.man_power_id,
        nama_sertifikat: sert.nama_sertifikat || '',
        no_sertifikat: sert.no_sertifikat || '',
        tanggal_sertifikasi: sert.tanggal_sertifikasi ? new Date(sert.tanggal_sertifikasi).toISOString().split('T')[0] : '',
        tanggal_berakhir: sert.tanggal_berakhir ? new Date(sert.tanggal_berakhir).toISOString().split('T')[0] : '',
        remarks: sert.remarks || '',
        is_rencana: sert.is_rencana || false
      });
    } else {
      setEditingId(null);
      setFormData({
        man_power_id: '',
        nama_sertifikat: '',
        no_sertifikat: '',
        tanggal_sertifikasi: '',
        tanggal_berakhir: '',
        remarks: '',
        is_rencana: activeTab === 'rencana'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:5000/api/sertifikasi/${editingId}`
        : 'http://localhost:5000/api/sertifikasi';
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save data');
      }

      await fetchData();
      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/sertifikasi/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete data');
      
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusInfo = (endDate, isRencana) => {
    if (isRencana) return { label: 'Rencana Pelatihan', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
    if (!endDate) return { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    
    const today = new Date();
    // Reset time part for accurate date comparison
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(endDate);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
      return { label: 'Expired', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
    }
    
    return { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredData = sertifikasi.filter(item => {
    const matchSearch = item.man_power?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.man_power?.npk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.nama_sertifikat?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchTab = false;
    if (activeTab === 'sertifikasi') {
      matchTab = item.is_rencana !== true && item.tanggal_berakhir !== null;
    } else if (activeTab === 'tanpa_kedaluwarsa') {
      matchTab = item.is_rencana !== true && item.tanggal_berakhir === null;
    } else if (activeTab === 'rencana') {
      matchTab = item.is_rencana === true;
    }

    return matchSearch && matchTab;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-industrial-blue" />
            Monitoring Sertifikasi Personel
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola dan pantau masa berlaku sertifikasi kompetensi personel
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-industrial-blue hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Tambah Data</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 px-4 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('sertifikasi')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sertifikasi' ? 'border-industrial-blue text-industrial-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Daftar Sertifikasi
            </button>
            <button
              onClick={() => setActiveTab('tanpa_kedaluwarsa')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tanpa_kedaluwarsa' ? 'border-industrial-blue text-industrial-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Tanpa Kedaluwarsa
            </button>
            <button
              onClick={() => setActiveTab('rencana')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rencana' ? 'border-industrial-blue text-industrial-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Rencana Pelatihan
            </button>
          </div>
          <div className="pb-3 w-full sm:w-auto flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama, NPK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-industrial-blue/20 focus:border-industrial-blue text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">NPK</th>
                <th className="px-4 py-3">Bagian</th>
                <th className="px-4 py-3">Certificate</th>
                <th className="px-4 py-3">Certification No</th>
                <th className="px-4 py-3">Date of Cert</th>
                <th className="px-4 py-3">Cert Expires</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data sertifikasi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const statusInfo = getStatusInfo(item.tanggal_berakhir, item.is_rencana);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{item.man_power?.name || '-'}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.man_power?.npk || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{item.man_power?.divisi?.nama_divisi || '-'}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium">{item.nama_sertifikat}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.no_sertifikat || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(item.tanggal_sertifikasi)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(item.tanggal_berakhir)}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate" title={item.remarks}>{item.remarks || '-'}</td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openModal(item)}
                            className="p-1.5 text-slate-400 hover:text-industrial-blue hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Data Sertifikasi' : 'Tambah Data Sertifikasi'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-6 py-4 overflow-y-auto space-y-4">
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Personel <span className="text-red-500">*</span></label>
                  <select
                    name="man_power_id"
                    value={formData.man_power_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-blue/20 focus:border-industrial-blue text-sm"
                  >
                    <option value="">-- Pilih Personel --</option>
                    {manpowerList.map(mp => (
                      <option key={mp.id} value={mp.id}>{mp.name} ({mp.npk})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Nama Sertifikat (Certificate) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="nama_sertifikat"
                    value={formData.nama_sertifikat}
                    onChange={handleInputChange}
                    required
                    placeholder="Contoh: SIO Forklift"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-blue/20 focus:border-industrial-blue text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="is_rencana"
                    name="is_rencana"
                    checked={formData.is_rencana}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-industrial-blue rounded border-slate-300 focus:ring-industrial-blue"
                  />
                  <label htmlFor="is_rencana" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Tandai sebagai Rencana Pelatihan
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Nomor Sertifikat (Certification No)</label>
                  <input
                    type="text"
                    name="no_sertifikat"
                    value={formData.no_sertifikat}
                    onChange={handleInputChange}
                    placeholder="Contoh: 12345/SIO/2023"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-blue/20 focus:border-industrial-blue text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Tanggal Sertifikasi</label>
                    <input
                      type="date"
                      name="tanggal_sertifikasi"
                      value={formData.tanggal_sertifikasi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-blue/20 focus:border-industrial-blue text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Berakhir (Expires)</label>
                    <input
                      type="date"
                      name="tanggal_berakhir"
                      value={formData.tanggal_berakhir}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-blue/20 focus:border-industrial-blue text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Keterangan (Remarks)</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Catatan tambahan..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-blue/20 focus:border-industrial-blue text-sm resize-none"
                  ></textarea>
                </div>

              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-industrial-blue hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
