import React, { useState, useContext } from 'react';
import { X, Send, UserPlus, Clock, MessageSquare, Check, UserMinus, Camera, Trash } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function FieldTaskLogModal({ task, manpowerList, onClose, onRefresh }) {
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
  const [fotoBase64, setFotoBase64] = useState('');

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // compress directly to jpeg 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFotoBase64(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const [newMemberId, setNewMemberId] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [isEditingPic, setIsEditingPic] = useState(false);
  const [newPicId, setNewPicId] = useState(task.pic_id || '');

  // Advice form state
  const [editingAdviceId, setEditingAdviceId] = useState(null);
  const [adviceInputs, setAdviceInputs] = useState({});

  const { user, api } = useContext(AuthContext);
  const canAdvice = user?.role && ['avp', 'vp'].includes(user.role.toLowerCase());

  const handleUpdatePic = async () => {
    if (!newPicId) return;
    try {
      const res = await fetch(`${api}/api/field-tasks/${task.id}/pic`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ pic_id: parseInt(newPicId) })
      });
      if (res.ok) {
        setIsEditingPic(false);
        onRefresh();
      } else {
        const data = await res.json();
        alert(`Gagal update PIC: ${data.message || 'Error'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAdvice = async (logId) => {
    const advice = adviceInputs[logId] || '';
    try {
      const res = await fetch(`${api}/api/field-tasks/logs/${logId}/advice`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ advice })
      });
      if (res.ok) {
        setEditingAdviceId(null);
        onRefresh();
      } else {
        alert('Gagal menyimpan advice');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberId) return;
    setAddingMember(true);
    try {
      const res = await fetch(`${api}/api/field-tasks/${task.id}/members`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ man_power_id: parseInt(newMemberId) })
      });
      if (res.ok) {
        setNewMemberId('');
        onRefresh();
      } else {
        const data = await res.json();
        alert(`Gagal menambah anggota: ${data.message || 'Error'}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (mpId) => {
    if (!window.confirm('Yakin ingin menghapus anggota ini?')) return;
    try {
      const res = await fetch(`${api}/api/field-tasks/${task.id}/members/${mpId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitLog = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { catatan, status_update: statusUpdate, foto: fotoBase64 };
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

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Foto Bukti (Opsional)</label>
                  {!fotoBase64 ? (
                    <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex flex-col items-center">
                        <Camera className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 font-medium">Upload Foto</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                    </label>
                  ) : (
                    <div className="relative inline-block">
                      <img src={fotoBase64} alt="Preview" className="h-32 rounded-lg border border-gray-200 shadow-sm object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setFotoBase64('')}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

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
                          {log.foto && (
                            <div className="mt-3">
                              <img src={log.foto} alt="Bukti Update" className="w-full max-w-sm rounded-lg border border-gray-200" />
                            </div>
                          )}
                          {log.man_hours && (
                            <div className="mt-2 inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                              <Clock className="w-3 h-3" /> +{log.man_hours} jam
                            </div>
                          )}
                          
                          {/* Advice Section */}
                          {(log.advice || canAdvice) && (
                            <div className="mt-3 bg-orange-50 border border-orange-100 p-3 rounded-lg">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-orange-800">Advice Pimpinan</span>
                                {canAdvice && editingAdviceId !== log.id && (
                                  <button 
                                    onClick={() => { setEditingAdviceId(log.id); setAdviceInputs({ ...adviceInputs, [log.id]: log.advice || '' }); }}
                                    className="text-[10px] text-orange-600 font-bold hover:underline"
                                  >
                                    {log.advice ? 'Edit' : '+ Tambah'}
                                  </button>
                                )}
                              </div>
                              {editingAdviceId === log.id ? (
                                <div className="mt-2 space-y-2">
                                  <textarea
                                    className="w-full text-xs border-orange-200 rounded focus:ring-orange-500 focus:border-orange-500 bg-white"
                                    rows="2"
                                    value={adviceInputs[log.id] || ''}
                                    onChange={(e) => setAdviceInputs({ ...adviceInputs, [log.id]: e.target.value })}
                                    placeholder="Tulis advice / arahan..."
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingAdviceId(null)} className="px-2 py-1 text-[10px] font-bold text-gray-500 hover:bg-gray-100 rounded">Batal</button>
                                    <button onClick={() => handleSaveAdvice(log.id)} className="px-2 py-1 text-[10px] font-bold bg-orange-500 text-white hover:bg-orange-600 rounded">Simpan</button>
                                  </div>
                                </div>
                              ) : (
                                log.advice ? (
                                  <p className="text-xs text-orange-700">{log.advice}</p>
                                ) : (
                                  <p className="text-[10px] text-orange-400 italic">Belum ada advice</p>
                                )
                              )}
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
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-gray-800">PIC Utama</h4>
                {!isEditingPic && (
                  <button onClick={() => setIsEditingPic(true)} className="text-xs text-navy-600 font-semibold hover:underline">
                    Ubah PIC
                  </button>
                )}
              </div>
              
              {isEditingPic ? (
                <div className="flex gap-2">
                  <select 
                    value={newPicId} onChange={e => setNewPicId(e.target.value)}
                    className="flex-1 text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500"
                  >
                    <option value="">-- Pilih Man Power --</option>
                    {manpowerList && manpowerList.map(mp => (
                      <option key={mp.id} value={mp.id}>{mp.name} - {mp.position}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleUpdatePic}
                    className="px-4 py-2 bg-navy-600 text-white rounded-lg text-sm font-bold hover:bg-navy-700"
                  >
                    Simpan
                  </button>
                  <button 
                    onClick={() => { setIsEditingPic(false); setNewPicId(task.pic_id || ''); }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-bold hover:bg-gray-200"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <div className="w-10 h-10 bg-navy-100 text-navy-700 rounded-full flex items-center justify-center font-bold text-lg">
                    {task.pic?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{task.pic?.name || 'Belum diassign'}</p>
                    <p className="text-xs text-gray-500">{task.pic?.position}</p>
                  </div>
                </div>
              )}

              <h4 className="text-sm font-bold text-gray-800 pt-4 border-t border-gray-100">Anggota Tim</h4>
              
              <div className="flex gap-2 pb-2">
                <select 
                  value={newMemberId} onChange={e => setNewMemberId(e.target.value)}
                  className="flex-1 text-sm border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500"
                >
                  <option value="">-- Pilih Man Power --</option>
                  {manpowerList && manpowerList.map(mp => (
                    <option key={mp.id} value={mp.id}>{mp.name} - {mp.position}</option>
                  ))}
                </select>
                <button 
                  onClick={handleAddMember}
                  disabled={!newMemberId || addingMember}
                  className="px-4 py-2 bg-navy-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-navy-700 disabled:opacity-50"
                >
                  Tambah
                </button>
              </div>

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
                      <button onClick={() => handleRemoveMember(m.man_power_id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition" title="Hapus Anggota">
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
