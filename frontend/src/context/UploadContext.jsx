import React, { createContext, useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

export const UploadContext = createContext(null);

export function UploadProvider({ children }) {
  const [activeTab, setActiveTab] = useState('workorders');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  const xhrRef = useRef(null);

  const startUpload = (fileToUpload, tabType) => {
    if (!fileToUpload) return;

    setFile(fileToUpload);
    setActiveTab(tabType || 'workorders');
    setStatus('uploading');
    setUploadProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append('file', fileToUpload);

    const targetTab = tabType || activeTab || 'workorders';
    const endpoint = targetTab === 'workorders' 
      ? 'http://localhost:5000/api/upload/workorders' 
      : 'http://localhost:5000/api/upload/recommendations';
      
    const token = localStorage.getItem('token');
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setStatus('success');
          setResult(data);

          const label = targetTab === 'workorders' ? 'Work Order' : 'Rekomendasi';
          const inserted = data.inserted || 0;
          const updated = data.updated || 0;
          const failed = data.failed || 0;
          const skipped = data.skipped || 0;

          setToastNotification({
            type: 'success',
            title: `Import Data ${label} Berhasil!`,
            message: `Hasil Sinkronisasi SAP: ${inserted} Data Baru Diterima, ${updated} Data Ter-overwrite (Update)${skipped > 0 ? `, ${skipped} Baris Kosong Di-skip` : ''}${failed > 0 ? `, ${failed} Gagal` : ''}.`,
            timestamp: new Date()
          });
        } catch (e) {
          setStatus('error');
          setResult({ error: 'Gagal memproses respon server.' });
          setToastNotification({
            type: 'error',
            title: 'Import SAP Gagal',
            message: 'Gagal memproses respon server.',
            timestamp: new Date()
          });
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setStatus('error');
          setResult({ error: data.error || 'Terjadi kesalahan saat mengunggah.' });
          setToastNotification({
            type: 'error',
            title: 'Import SAP Gagal',
            message: data.error || 'Terjadi kesalahan saat mengunggah.',
            timestamp: new Date()
          });
        } catch (e) {
          setStatus('error');
          setResult({ error: `Upload gagal (Status ${xhr.status})` });
          setToastNotification({
            type: 'error',
            title: 'Import SAP Gagal',
            message: `Upload gagal (Status ${xhr.status})`,
            timestamp: new Date()
          });
        }
      }
    };

    xhr.onerror = () => {
      setStatus('error');
      setResult({ error: 'Gagal terhubung ke server.' });
      setToastNotification({
        type: 'error',
        title: 'Koneksi Terputus',
        message: 'Gagal terhubung ke server backend.',
        timestamp: new Date()
      });
    };

    xhr.open('POST', endpoint);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  };

  const resetUpload = () => {
    if (xhrRef.current && status === 'uploading') {
      xhrRef.current.abort();
    }
    setFile(null);
    setStatus('idle');
    setResult(null);
    setUploadProgress(0);
  };

  const dismissToast = () => {
    setToastNotification(null);
  };

  return (
    <UploadContext.Provider value={{
      activeTab,
      setActiveTab,
      file,
      setFile,
      status,
      uploadProgress,
      result,
      toastNotification,
      startUpload,
      resetUpload,
      dismissToast
    }}>
      {children}

      {/* GLOBAL TOAST NOTIFICATION BANNER */}
      {toastNotification && (
        <div className="fixed top-5 right-5 z-[9999] animate-in slide-in-from-top-5 duration-300">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 max-w-md ${
            toastNotification.type === 'success' 
              ? 'bg-slate-900 text-white border-emerald-500/50 shadow-emerald-950/20' 
              : 'bg-slate-900 text-white border-red-500/50 shadow-red-950/20'
          }`}>
            {toastNotification.type === 'success' ? (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
            )}
            
            <div className="flex-1 space-y-1 pr-2">
              <div className="font-bold text-sm text-slate-100 flex items-center justify-between">
                <span>{toastNotification.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {toastNotification.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">{toastNotification.message}</div>
            </div>

            <button 
              onClick={dismissToast}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1 rounded-md transition-colors cursor-pointer"
              title="Tutup Notifikasi"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* MINI BACKGROUND FLOATING INDICATOR WHEN NAVIGATED AWAY WHILE UPLOADING */}
      {status === 'uploading' && (
        <div className="fixed bottom-5 left-5 z-[9999] bg-industrial-navy text-white px-4 py-2.5 rounded-xl shadow-xl border border-blue-400/30 flex items-center gap-3 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-blue-100">Memproses Data SAP ({uploadProgress}%)</div>
            <div className="text-[10px] text-slate-300">Sinkronisasi tetap berjalan di background...</div>
          </div>
        </div>
      )}
    </UploadContext.Provider>
  );
}
