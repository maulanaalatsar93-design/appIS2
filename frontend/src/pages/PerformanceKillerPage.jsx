import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Plus, Edit, Trash2, Search, X, Loader2, Save, FileText 
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function PerformanceKillerPage() {
  const { user, token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [pabrikList, setPabrikList] = useState([]);
  const [formData, setFormData] = useState({
    item: '',
    area_plant: '',
    masalah: '',
    tindak_lanjut: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/performance-killers');
      const result = await res.json();
      if (Array.isArray(result)) {
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPabrikList = async () => {
    try {
      // The endpoint requires authentication. Check if user token is available, if not, skip or handle appropriately.
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/dashboard/pabrik', { headers });
      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result)) {
          setPabrikList(result);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pabrik list:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPabrikList();
  }, [user, token]);

  const openModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrentId(item.id);
      setFormData({
        item: item.item,
        area_plant: item.area_plant,
        masalah: item.masalah,
        tindak_lanjut: item.tindak_lanjut
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ item: '', area_plant: '', masalah: '', tindak_lanjut: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ item: '', area_plant: '', masalah: '', tindak_lanjut: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      alert("Anda harus login untuk menyimpan data.");
      return;
    }

    try {
      const url = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/performance-killers' + (isEditing ? `/${currentId}` : '');
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save data');
      
      closeModal();
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Gagal menyimpan data.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;
    
    if (!user || !token) {
      alert("Anda harus login untuk menghapus data.");
      return;
    }

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + `/api/performance-killers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete data');
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Gagal menghapus data.');
    }
  };

  const filteredData = data.filter(d => 
    d.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.area_plant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.masalah.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 w-full max-w-none min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-navy-600" />
            Performance Killer
          </h1>
          <p className="text-gray-500 mt-1">Kelola data peralatan penyumbang masalah performa / reliability pabrik.</p>
        </div>
        
        {user && ['vp', 'avp', 'manager', 'administrator', 'admin', 'supervisor', 'staff'].includes(user.role?.toLowerCase() || '') && (
            <button 
              onClick={() => openModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-navy-600 hover:bg-navy-950 text-white rounded-lg transition-all shadow-sm shadow-blue-600/20 font-medium"
            >
              <Plus className="h-5 w-5" />
              <span>Tambah Data</span>
            </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Cari item, area, atau masalah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Plant</th>
                <th className="px-6 py-4">Masalah (Problem)</th>
                <th className="px-6 py-4">Tindak Lanjut (Mitigation)</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-navy-600" />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data Performance Killer.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{row.item}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {row.area_plant}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title="Lihat selengkapnya di mode edit">
                      <div dangerouslySetInnerHTML={{ __html: row.masalah }} className="line-clamp-2" />
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title="Lihat selengkapnya di mode edit">
                      <div dangerouslySetInnerHTML={{ __html: row.tindak_lanjut }} className="line-clamp-2" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user && ['vp', 'avp', 'manager', 'administrator', 'admin', 'supervisor', 'staff'].includes(user.role?.toLowerCase() || '') && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openModal(row)}
                            className="p-1.5 text-navy-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div 
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
          >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-display font-bold text-slate-800">
                  {isEditing ? 'Edit Data' : 'Tambah Data'}
                </h2>
                <button onClick={closeModal} className="p-2 text-gray-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item</label>
                  <input 
                    type="text" 
                    required
                    value={formData.item}
                    onChange={(e) => setFormData({...formData, item: e.target.value})}
                    placeholder="Contoh: Three way valve 309-J/JA"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plant</label>
                  <select
                    required
                    value={formData.area_plant}
                    onChange={(e) => setFormData({...formData, area_plant: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  >
                    <option value="" disabled>Pilih Plant</option>
                    {pabrikList.map((pabrik) => (
                      <option key={pabrik.id} value={pabrik.nama_pabrik}>
                        {pabrik.nama_pabrik} {pabrik.kode_pabrik ? `(${pabrik.kode_pabrik})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Masalah (Problem)</label>
                  <div className="bg-white rounded-lg overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <ReactQuill 
                      theme="snow"
                      value={formData.masalah}
                      onChange={(val) => {
                        if (val !== formData.masalah) {
                          setFormData(prev => ({ ...prev, masalah: val }));
                        }
                      }}
                      className="h-32 mb-10"
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline'],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['clean']
                        ]
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tindak Lanjut (Mitigation)</label>
                  <div className="bg-white rounded-lg overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <ReactQuill 
                      theme="snow"
                      value={formData.tindak_lanjut}
                      onChange={(val) => {
                        if (val !== formData.tindak_lanjut) {
                          setFormData(prev => ({ ...prev, tindak_lanjut: val }));
                        }
                      }}
                      className="h-32 mb-10"
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline'],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['clean']
                        ]
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 flex items-center gap-2 text-sm font-medium text-white bg-navy-600 hover:bg-navy-950 rounded-lg shadow-lg shadow-blue-600/20 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    Simpan
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
}
