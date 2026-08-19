import React, { useState, useContext } from 'react';
import { X, Send, UserPlus, Clock, MessageSquare, Check, UserMinus } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function FieldTaskLogModal({ task, onClose, onRefresh }) {
  const { auth, isAdmin } = useContext(AuthContext);
  const token = localStorage.getItem('token');
  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [activeTab, setActiveTab] = useState('update'); // 'update' | 'team'
  const [loading, setLoading] = useState(false);
  
  // Log Form State
  const [catatan, setCatatan] = useState('');
  const [statusUpdate, setStatusUpdate] = useState(task.status);
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');

  // Team form state
  const [newMemberNpk, setNewMemberNpk] = useState('');

  const submitLog = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { catatan, status_update: statusUpdate };
      if (waktuMulai && waktuSelesai) {
        payload.waktu_mulai = new Date(waktuMulai).toISOString();
        payload.waktu_selesai = new Date(waktuSelesai).toISOString();
      }

      const res = await fetch(`${api}/api/field-tasks/${task.id}/log`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onRefresh();
      } else {
        alert('Gagal menyimpan update');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareWA = () => {
    const totalHours = task.logs?.reduce((acc, log) => acc + (log.man_hours || 0), 0) || 0;
    
    let text = `*Update Pekerjaan Lapangan*\n`;
    text += `📍 Lokasi: ${task.pabrik?.nama_pabrik} ${task.area ? `- ${task.area}` : ''}\n`;
    text += `🔧 Pekerjaan: ${task.judul}\n`;
    text += `👤 PIC: ${task.pic?.name || '-'}\n`;
    text += `📊 Status: ${task.status}\n\n`;

    if (task.logs && task.logs.length > 0) {
      const lastLog = task.logs[0];
      const dateStr = new Date(lastLog.createdAt).toLocaleString('id-ID');
      text += `📝 Update terbaru (${dateStr}):\n"${lastLog.catatan}"\n\n`;
    }

    text += `⏱ Total MH: ${totalHours.toFixed(2)} jam\n`;
    text += `--- \n_Sent from ISTEK 2 App_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-navy-600 bg-navy-50 px-2 py-0.5 rounded-md">{task.wo_notif || 'WO/Notif: -'}</span>
              <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-md">{task.kategori}</span>
            </div>
            <h3 className="font-bold text-xl text-gray-900">{task.judul}</h3>
            <p className="text-sm text-gray-500 mt-1">{task.pabrik?.nama_pabrik} {task.area ? `— ${task.area}` : ''}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-white">
          <button 
            onClick={() => setActiveTab('update')}
            className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'update' ? 'text-navy-600 border-b-2 border-navy-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Update Progress
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'team' ? 'text-navy-600 border-b-2 border-navy-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Anggota Tim ({task.members?.length || 0})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          
          {activeTab === 'update' && (
            <div className="space-y-6">
              {/* Form Input Log */}
              <form onSubmit={submitLog} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-navy-600" /> Tulis Update / Catatan
                </h4>
                
                <div>
                  <textarea 
                    required rows="3" value={catatan} onChange={e => setCatatan(e.target.value)}
                    placeholder="Contoh: Sudah mengganti seal dan pengetesan aman. Lanjut besok untuk finishing..."
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500 bg-gray-50"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Mulai Kerja (Opsional)</label>
                    <input 
                      type="datetime-local" value={waktuMulai} onChange={e => setWaktuMulai(e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Selesai Kerja (Opsional)</label>
                    <input 
                      type="datetime-local" value={waktuSelesai} onChange={e => setWaktuSelesai(e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500" 
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 italic">* Jika jam diisi, otomatis tercatat ke <b>Man Hours</b> harian Anda.</p>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Update Status:</span>
                    <select 
                      value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)}
                      className="text-sm border-gray-300 rounded-lg focus:ring-navy-500 py-1.5"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Hold">Hold</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className="px-5 py-2 bg-navy-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-navy-700 disabled:opacity-50">
                    {loading ? 'Menyimpan...' : 'Kirim Update'}
                  </button>
                </div>
              </form>

              {/* Timeline Update */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 flex justify-between items-center">
                  <span>Timeline Pekerjaan</span>
                  <button onClick={handleShareWA} className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 rounded-full text-xs transition">
                    <Send className="w-3.5 h-3.5" /> Share WA
                  </button>
                </h4>
                
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {task.logs && task.logs.length > 0 ? (
                    task.logs.map((log, idx) => (
                      <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                          <Check className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-800 text-sm">{log.man_power?.name}</span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{log.catatan}</p>
                          {log.man_hours && (
                            <div className="mt-2 inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                              <Clock className="w-3 h-3" /> +{log.man_hours} jam
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-gray-400 py-4 relative z-10 bg-gray-50">Belum ada update progress.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-gray-800">PIC Utama</h4>
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                <div className="w-10 h-10 bg-navy-100 text-navy-700 rounded-full flex items-center justify-center font-bold text-lg">
                  {task.pic?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">{task.pic?.name || 'Belum diassign'}</p>
                  <p className="text-xs text-gray-500">{task.pic?.position}</p>
                </div>
              </div>

              <h4 className="text-sm font-bold text-gray-800 pt-4 border-t border-gray-100">Anggota Tim</h4>
              
              <div className="space-y-2">
                {task.members && task.members.length > 0 ? (
                  task.members.map(m => (
                    <div key={m.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <UserPlus className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{m.man_power?.name}</p>
                          <p className="text-xs text-gray-500">{m.man_power?.position}</p>
                        </div>
                      </div>
                      <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition" title="Hapus Anggota">
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">Belum ada anggota tim tambahan.</p>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
