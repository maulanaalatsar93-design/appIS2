import React, { useState, useEffect, useContext } from 'react';
import { 
  Wrench, Plus, Search, Filter, Clock, MapPin, Users, 
  ChevronRight, X, User, Phone, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import equipmentData from '../data/equipmentData.json';
import FieldTaskLogModal from '../components/field-tasks/FieldTaskLogModal';

export default function FieldTaskPage() {
  const { auth, isAdmin } = useContext(AuthContext);
  const token = localStorage.getItem('token');
  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [activeTab, setActiveTab] = useState(isAdmin ? 'all' : 'my'); // 'all' or 'my'
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Refs
  const [pabrikList, setPabrikList] = useState([]);
  const [manpowerList, setManpowerList] = useState([]);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // For detail/log modal
  
  // Create form state
  const [formData, setFormData] = useState({
    judul: '', deskripsi: '', pabrik_id: '', area: '', equipment: '', 
    kategori: 'Corrective', prioritas: 'Normal', pic_id: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'all' ? '/api/field-tasks' : '/api/field-tasks/my';
      const res = await fetch(`${api}${endpoint}`, { headers });
      if (res.ok) {
        setTasks(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefs = async () => {
    try {
      const [resPabrik, resMp] = await Promise.all([
        fetch(`${api}/api/dashboard/pabrik`, { headers }),
        fetch(`${api}/api/dashboard/manpower`, { headers })
      ]);
      if (resPabrik.ok) {
        const data = await resPabrik.json();
        setPabrikList(Array.isArray(data) ? data : []);
      }
      if (resMp.ok) {
        const data = await resMp.json();
        setManpowerList(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (e) {
      console.error('fetchRefs error:', e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  useEffect(() => {
    fetchRefs();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${api}/api/field-tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setFormData({ judul: '', deskripsi: '', pabrik_id: '', area: '', equipment: '', kategori: 'Corrective', prioritas: 'Normal', pic_id: '' });
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter(t => statusFilter === 'All' || t.status === statusFilter);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-100 border-orange-200';
      default: return 'text-emerald-600 bg-emerald-100 border-emerald-200';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'bg-gray-100 text-gray-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Hold': return 'bg-amber-100 text-amber-700';
      case 'Done': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-navy-600" /> Program Pekerjaan (Field Task)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan pantau pekerjaan lapangan secara terstruktur. Update progres akan otomatis masuk ke Man Hours.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-navy-600 text-white rounded-xl text-sm font-semibold hover:bg-navy-700 transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Buat Pekerjaan
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition ${activeTab === 'all' ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Semua Tugas
            </button>
          )}
          <button 
            onClick={() => setActiveTab('my')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition ${activeTab === 'my' ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Tugas Saya
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-sm border-gray-200 rounded-lg focus:ring-navy-500 focus:border-navy-500 bg-gray-50 py-1.5"
          >
            <option value="All">Semua Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Hold">Hold</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      {/* Task List (Grid View) */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
              Tidak ada pekerjaan lapangan yang ditemukan.
            </div>
          ) : (
            filteredTasks.map(task => {
              const totalHours = task.logs?.reduce((acc, log) => acc + (log.man_hours || 0), 0) || 0;
              const anggotaCount = (task.members?.length || 0);
              
              return (
                <div 
                  key={task.id} 
                  onClick={() => setSelectedTask(task)}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-navy-200 transition-all cursor-pointer flex flex-col overflow-hidden group"
                >
                  <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(task.prioritas)}`}>
                      {task.prioritas}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-gray-800 text-base leading-snug group-hover:text-navy-600 transition-colors mb-2">
                      {task.judul}
                    </h3>
                    
                    <div className="space-y-1.5 mt-3">
                      {(task.pabrik || task.area || task.equipment) && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" /> 
                          <span className="truncate">
                            {task.pabrik?.nama_pabrik} 
                            {task.area ? ` - ${task.area}` : ''}
                            {task.equipment ? ` - ${task.equipment}` : ''}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">PIC: <span className="font-medium">{task.pic?.name || 'Belum diassign'}</span></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {totalHours.toFixed(1)} <span className="font-normal text-gray-400">jam</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        {anggotaCount + 1} <span className="font-normal text-gray-400">orang</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-navy-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800">Buat Program Pekerjaan Baru</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-200 rounded-lg text-gray-500 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Judul Pekerjaan <span className="text-red-500">*</span></label>
                <input 
                  type="text" required value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})}
                  placeholder="Contoh: Perbaikan Pompa P1A-P-101"
                  className="w-full text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Prioritas</label>
                  <select 
                    value={formData.prioritas} onChange={e => setFormData({...formData, prioritas: e.target.value})}
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
                  <select 
                    value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})}
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500"
                  >
                    <option value="Corrective">Corrective (CM)</option>
                    <option value="PM">Preventive (PM)</option>
                    <option value="Inspeksi">Inspeksi</option>
                    <option value="Proyek">Proyek / Modifikasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pabrik</label>
                  <select 
                    value={formData.pabrik_id} 
                    onChange={e => setFormData({...formData, pabrik_id: e.target.value, area: '', equipment: ''})}
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500"
                  >
                    <option value="">-- Pilih Pabrik --</option>
                    {pabrikList
                      .filter(p => equipmentData.some(d => d.Tempat === p.nama_pabrik))
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.nama_pabrik}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Area</label>
                  <select 
                    value={formData.area} 
                    onChange={e => setFormData({...formData, area: e.target.value, equipment: ''})}
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500"
                    disabled={!formData.pabrik_id}
                  >
                    <option value="">-- Pilih Area --</option>
                    {(() => {
                      const selectedPabrik = pabrikList.find(p => String(p.id) === String(formData.pabrik_id));
                      if (!selectedPabrik) return null;
                      return equipmentData
                        .filter(d => d.Tempat === selectedPabrik.nama_pabrik)
                        .map(a => a.Area)
                        .filter((v,i,a) => v && a.indexOf(v)===i)
                        .map(area => <option key={area} value={area}>{area}</option>);
                    })()}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Equipment</label>
                <select 
                  value={formData.equipment} 
                  onChange={e => setFormData({...formData, equipment: e.target.value})}
                  className="w-full text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500"
                  disabled={!formData.area}
                >
                  <option value="">-- Pilih Equipment (Opsional) --</option>
                  {(() => {
                    const selectedPabrik = pabrikList.find(p => String(p.id) === String(formData.pabrik_id));
                    if (!selectedPabrik) return null;
                    return equipmentData
                      .filter(d => d.Tempat === selectedPabrik.nama_pabrik && d.Area === formData.area && d.Equipment)
                      .map(e => <option key={e.Equipment} value={e.Equipment}>{e.Equipment} {e.Description ? `(${e.Description})` : ''}</option>);
                  })()}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Tambahan</label>
                <textarea 
                  rows="3" value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                  className="w-full text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500"
                  placeholder="Keterangan lebih lanjut mengenai pekerjaan..."
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition">
                  Batal
                </button>
                <button type="submit" className="px-6 py-2 bg-navy-600 text-white text-sm font-bold rounded-xl hover:bg-navy-700 shadow-sm transition">
                  Buat Pekerjaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {selectedTask && (
        <FieldTaskLogModal 
          task={selectedTask} 
          manpowerList={manpowerList}
          onClose={() => setSelectedTask(null)} 
          onRefresh={() => { fetchTasks(); setSelectedTask(null); }} 
        />
      )}

    </div>
  );
}
