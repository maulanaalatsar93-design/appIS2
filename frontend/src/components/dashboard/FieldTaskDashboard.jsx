import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { PlayCircle, Loader2 } from 'lucide-react';
import FieldTaskLogModal from '../field-tasks/FieldTaskLogModal';
import { getManpowerList } from '../../services/dashboardService';

export default function FieldTaskDashboard({ workCenter, month, year }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [manpowerList, setManpowerList] = useState([]);
  
  const { api } = useContext(AuthContext);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/api/field-tasks`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      
      let filtered = data;
      if (year && year !== 'Semua') {
        filtered = filtered.filter(t => new Date(t.createdAt).getFullYear().toString() === year);
      }
      if (month && month !== 'Semua Bulan') {
        filtered = filtered.filter(t => (new Date(t.createdAt).getMonth() + 1).toString() === month);
      }
      // Simple work center filtering
      if (workCenter && workCenter !== 'Semua Bagian') {
        filtered = filtered.filter(t => {
           const wc = t.pic?.divisi?.work_center_sap || t.pic?.divisi?.nama_divisi || '';
           return wc.toLowerCase().includes(workCenter.toLowerCase());
        });
      }
      
      setTasks(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManpower = async () => {
    try {
      const data = await getManpowerList();
      setManpowerList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchManpower();
  }, [workCenter, month, year]);

  const stats = {
    total: tasks.length,
    open: tasks.filter(t => t.status === 'Open').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    hold: tasks.filter(t => t.status === 'Hold').length,
    done: tasks.filter(t => t.status === 'Done').length,
  };

  const activeTasks = tasks.filter(t => t.status !== 'Done' && t.status !== 'Cancelled');

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-navy-600" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center flex flex-col justify-center">
          <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Total Pekerjaan</p>
          <p className="text-3xl font-black text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center flex flex-col justify-center">
          <p className="text-[10px] text-blue-500 font-bold mb-1 uppercase tracking-wider">Open (Pending)</p>
          <p className="text-3xl font-black text-blue-600">{stats.open}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center flex flex-col justify-center">
          <p className="text-[10px] text-orange-500 font-bold mb-1 uppercase tracking-wider">In Progress</p>
          <p className="text-3xl font-black text-orange-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center flex flex-col justify-center">
          <p className="text-[10px] text-red-500 font-bold mb-1 uppercase tracking-wider">Hold</p>
          <p className="text-3xl font-black text-red-600">{stats.hold}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center flex flex-col justify-center">
          <p className="text-[10px] text-green-500 font-bold mb-1 uppercase tracking-wider">Done</p>
          <p className="text-3xl font-black text-green-600">{stats.done}</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <PlayCircle className="w-4 h-4 text-orange-500" /> Daftar Pekerjaan Sedang Berjalan (Active Jobs)
          </h3>
          <span className="text-xs font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 shadow-sm">{activeTasks.length} Active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-[10px] text-slate-500">
                <th className="py-3 px-4 font-bold uppercase tracking-wider">No. WO/Notif</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Judul Pekerjaan</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Lokasi</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">PIC & Tim</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Status</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Aksi (Control)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTasks.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-400 text-sm font-medium">Tidak ada pekerjaan yang sedang berjalan</td></tr>
              ) : (
                activeTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded shadow-sm-subtle whitespace-nowrap">{task.wo_notif || '-'}</span>
                    </td>
                    <td className="py-3 px-4 max-w-[250px]">
                      <p className="text-xs font-bold text-slate-800 truncate" title={task.judul}>{task.judul}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{task.kategori}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-semibold text-slate-700">{task.pabrik?.nama_pabrik}</p>
                      <p className="text-[10px] text-gray-500 truncate" title={task.area}>{task.area || '-'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-bold text-slate-800">{task.pic?.name || 'Belum diassign'}</p>
                      <p className="text-[10px] text-gray-500">{task.members?.length || 0} anggota tim</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm-subtle whitespace-nowrap ${
                        task.status === 'In Progress' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        task.status === 'Open' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        task.status === 'Hold' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        {task.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="text-[11px] font-bold bg-[#193B8F]/10 text-[#193B8F] border border-[#193B8F]/20 hover:bg-[#193B8F] hover:text-white px-3 py-1.5 rounded-lg transition-all shadow-sm whitespace-nowrap"
                      >
                        Buka Timeline
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTask && (
        <FieldTaskLogModal 
          task={selectedTask} 
          manpowerList={manpowerList} 
          onClose={() => setSelectedTask(null)}
          onRefresh={() => {
            fetchData();
            fetch(`${api}/api/field-tasks/${selectedTask.id}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => res.json())
            .then(data => setSelectedTask(data));
          }}
        />
      )}
    </div>
  );
}
