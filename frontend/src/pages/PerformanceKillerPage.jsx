import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Plus, Edit, Trash2, Search, X, Loader2, Save, FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PerformanceKillerPage() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
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

  useEffect(() => {
    fetchData();
  }, []);

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
    if (!user || !user.token) {
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
          'Authorization': `Bearer ${user.token}`
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
    
    if (!user || !user.token) {
      alert("Anda harus login untuk menghapus data.");
      return;
    }

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + `/api/performance-killers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
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
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Performance Killer
          </h1>
          <p className="text-slate-500 mt-1">Kelola data peralatan penyumbang masalah performa / reliability pabrik.</p>
        </div>
        
        {user && ['VP', 'AVP', 'Manager', 'Administrator', 'Admin', 'Supervisor', 'staff'].includes(user.role) && (
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 font-medium transition-all"
          >
            <Plus className="h-5 w-5" />
            Tambah Data
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari item, area, atau masalah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Area/Plant</th>
                <th className="px-6 py-4">Masalah</th>
                <th className="px-6 py-4">Tindak Lanjut</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data Performance Killer.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{row.item}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {row.area_plant}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={row.masalah}>
                      {row.masalah}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={row.tindak_lanjut}>
                      {row.tindak_lanjut}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user && ['VP', 'AVP', 'Manager', 'Administrator', 'Admin', 'Supervisor', 'staff'].includes(user.role) && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openModal(row)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">
                  {isEditing ? 'Edit Data' : 'Tambah Data'}
                </h2>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
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
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Area / Plant</label>
                  <input 
                    type="text" 
                    required
                    value={formData.area_plant}
                    onChange={(e) => setFormData({...formData, area_plant: e.target.value})}
                    placeholder="Contoh: Urea P2"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Masalah</label>
                  <textarea 
                    required
                    rows="3"
                    value={formData.masalah}
                    onChange={(e) => setFormData({...formData, masalah: e.target.value})}
                    placeholder="Jelaskan masalahnya..."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tindak Lanjut</label>
                  <textarea 
                    required
                    rows="3"
                    value={formData.tindak_lanjut}
                    onChange={(e) => setFormData({...formData, tindak_lanjut: e.target.value})}
                    placeholder="Jelaskan tindak lanjutnya..."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
