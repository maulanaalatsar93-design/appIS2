import React, { useState, useEffect } from 'react';
import { Calendar, Play, Pause, CheckCircle, UserPlus, FileText, AlertCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function PdmTaskBoard() {
  const [activeTab, setActiveTab] = useState('TASK_SAYA'); // 'TASK_SAYA' | 'JOB_BOARD'
  const [myTasks, setMyTasks] = useState([]);
  const [jobBoardTasks, setJobBoardTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reassign Modal
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [selectedTaskForReassign, setSelectedTaskForReassign] = useState(null);
  const [reassignData, setReassignData] = useState({ newPicId: '', reason: '' });
  const [manpowers, setManpowers] = useState([]);

  useEffect(() => {
    fetchTasks();
    fetchManpowers();
  }, [activeTab]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (activeTab === 'TASK_SAYA') {
        const response = await fetch(`${apiUrl}/api/pdm-schedule/my-tasks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMyTasks(data);
        }
      } else {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // 1-12
        const response = await fetch(`${apiUrl}/api/pdm-schedule/occurrences?year=${year}&month=${month}&status=SCHEDULED`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setJobBoardTasks(data);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManpowers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/dashboard/manpower`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setManpowers(data);
      }
    } catch (error) {
      console.error('Error fetching manpowers:', error);
    }
  };

  const handleAction = async (taskId, action, body = {}) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/pdm-schedule/occurrences/${taskId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
      });
      
      if (response.ok) {
        fetchTasks();
      } else {
        const data = await response.json();
        alert(data.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error handling action:', error);
    }
  };

  const submitReassign = async (e) => {
    e.preventDefault();
    await handleAction(selectedTaskForReassign.id, 'reassign', reassignData);
    setIsReassignOpen(false);
    setSelectedTaskForReassign(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED': return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">Tersedia</span>;
      case 'ASSIGNED': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">Assigned</span>;
      case 'IN_PROGRESS': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">In Progress</span>;
      case 'ON_HOLD': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold">On Hold</span>;
      case 'COMPLETED': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">Selesai</span>;
      default: return null;
    }
  };

  const renderTaskCard = (task, isMyTask) => (
    <div key={task.id} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-lg leading-tight">{task.rule?.taskName}</h3>
          <p className="text-gray-500 text-sm mt-1">{task.rule?.pabrik?.nama_pabrik} - {task.rule?.subArea}</p>
        </div>
        {getStatusBadge(task.status)}
      </div>

      <div className="flex-1 space-y-2 mt-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>Jadwal: {format(parseISO(task.effectiveDate), 'dd MMM yyyy', { locale: idLocale })}</span>
        </div>
        {task.wasShifted && (
          <div className="flex items-center gap-2 text-orange-600 text-xs mt-1 bg-orange-50 p-1.5 rounded">
            <AlertCircle className="w-3.5 h-3.5" />
            Tanggal digeser karena hari libur
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
        {!isMyTask ? (
          <button onClick={() => handleAction(task.id, 'claim')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition">
            <UserPlus className="w-4 h-4" />
            Ambil Job
          </button>
        ) : (
          <>
            {(task.status === 'ASSIGNED' || task.status === 'ON_HOLD') && (
              <button onClick={() => handleAction(task.id, 'start')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition">
                <Play className="w-4 h-4" /> Mulai
              </button>
            )}
            {task.status === 'IN_PROGRESS' && (
              <>
                <button onClick={() => {
                  const note = prompt('Keterangan On Hold:');
                  if (note !== null) handleAction(task.id, 'hold', { note });
                }} className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 text-sm transition">
                  <Pause className="w-4 h-4" /> Hold
                </button>
                <button onClick={() => {
                  const note = prompt('Keterangan Penyelesaian:');
                  if (note !== null) handleAction(task.id, 'complete', { note });
                }} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition">
                  <CheckCircle className="w-4 h-4" /> Selesai
                </button>
              </>
            )}
            {/* Optional: Only admin/AVP can reassign, but let's show it for demo */}
            <button onClick={() => {
              setSelectedTaskForReassign(task);
              setIsReassignOpen(true);
            }} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm transition">
              <UserPlus className="w-4 h-4" /> Reassign
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            PdM Task Board
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola pekerjaan dan jadwal harian inspeksi</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'TASK_SAYA' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('TASK_SAYA')}
          >
            Tugas Saya
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'JOB_BOARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('JOB_BOARD')}
          >
            Job Board (Tersedia)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'TASK_SAYA' && myTasks.map(task => renderTaskCard(task, true))}
          {activeTab === 'JOB_BOARD' && jobBoardTasks.map(task => renderTaskCard(task, false))}
          
          {((activeTab === 'TASK_SAYA' && myTasks.length === 0) || (activeTab === 'JOB_BOARD' && jobBoardTasks.length === 0)) && (
            <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Tidak ada tugas</h3>
              <p className="text-gray-500 mt-1">Semua tugas sudah selesai atau belum ada jadwal baru.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Reassign */}
      {isReassignOpen && selectedTaskForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Reassign Task</h2>
              <button onClick={() => setIsReassignOpen(false)} className="text-gray-400 hover:text-gray-600">X</button>
            </div>
            <div className="p-6">
              <form id="reassignForm" onSubmit={submitReassign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih PIC Baru *</label>
                  <select required className="w-full p-2 border border-gray-300 rounded-lg" value={reassignData.newPicId} onChange={e => setReassignData({...reassignData, newPicId: e.target.value})}>
                    <option value="">-- Pilih --</option>
                    {manpowers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.position})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Reassign</label>
                  <textarea className="w-full p-2 border border-gray-300 rounded-lg" rows="3" value={reassignData.reason} onChange={e => setReassignData({...reassignData, reason: e.target.value})} placeholder="Misal: PIC sebelumnya sakit..."></textarea>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button type="button" onClick={() => setIsReassignOpen(false)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">Batal</button>
              <button type="submit" form="reassignForm" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Reassign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
