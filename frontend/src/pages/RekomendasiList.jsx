import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';

export default function RekomendasiList({ isEmbedded = false }) {
  const [rekomendasi, setRekomendasi] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRek, setSelectedRek] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch Rekomendasi
  const fetchRekomendasi = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search
      }).toString();

      const response = await fetch(`import.meta.env.VITE_API_URL/api/recommendations?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setRekomendasi(data.data);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error('Error fetching rekomendasi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRekomendasi();
  }, [page]); // Re-fetch on page change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchRekomendasi();
  };

  const handleViewDetail = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`import.meta.env.VITE_API_URL/api/recommendations/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedRek(data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'diajukan':
        return 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20';
      case 'disetujui':
        return 'bg-industrial-green/10 text-industrial-green border-industrial-green/20';
      case 'ditolak':
        return 'bg-industrial-red/10 text-industrial-red border-industrial-red/20';
      default:
        return 'bg-industrial-muted/10 text-industrial-muted border-industrial-muted/20';
    }
  };

  return (
    <div className={isEmbedded ? "space-y-4" : "p-6 space-y-6"}>
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-industrial-text tracking-tight">
              Rekomendasi (Notifikasi SAP)
            </h2>
            <p className="text-industrial-muted text-xs md:text-sm mt-1">
              Daftar Rekomendasi (M4/M7) dari SAP yang telah diimport ke dalam sistem.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-industrial-border rounded-card shadow-sm-subtle overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-industrial-border flex flex-col sm:flex-row justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-muted" />
            <input
              type="text"
              placeholder="Cari Nomor Notifikasi atau Deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-industrial-background border border-industrial-border rounded-lg text-sm text-industrial-text focus:outline-none focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue"
            />
          </form>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-industrial-border text-industrial-text text-sm font-medium rounded-lg hover:bg-industrial-background transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-industrial-blue" />
            </div>
          ) : rekomendasi.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px] text-industrial-muted text-sm">
              Tidak ada data ditemukan.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-industrial-background border-b border-industrial-border text-xs font-bold text-industrial-muted uppercase tracking-wider">
                  <th className="px-4 py-3">Notification</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="px-4 py-3">Pabrik</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-border text-sm">
                {rekomendasi.map((rek) => (
                  <tr key={rek.id} className="hover:bg-industrial-background/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-industrial-text">{rek.notification}</td>
                    <td className="px-4 py-3 font-mono text-xs">{rek.notification_type}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={rek.description}>{rek.description}</td>
                    <td className="px-4 py-3">{rek.pabrik?.kode_pabrik}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(rek.status)}`}>
                        {rek.status || 'Diajukan'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetail(rek.id)}
                        className="p-1.5 text-industrial-blue hover:bg-industrial-blue/10 rounded-md transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-industrial-border flex items-center justify-between text-sm bg-industrial-background/30">
            <div className="text-industrial-muted">
              Halaman <span className="font-bold text-industrial-text">{meta.page}</span> dari <span className="font-bold text-industrial-text">{meta.totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-industrial-border rounded-lg text-industrial-text hover:bg-industrial-background disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-2 border border-industrial-border rounded-lg text-industrial-text hover:bg-industrial-background disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRek && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-card shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-industrial-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-industrial-text">Detail Rekomendasi</h3>
                <p className="text-xs text-industrial-muted">{selectedRek.notification}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-industrial-muted hover:bg-industrial-background rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-industrial-muted font-bold uppercase tracking-wider mb-1">Notification</p>
                    <p className="text-sm font-medium text-industrial-text">{selectedRek.notification}</p>
                  </div>
                  <div>
                    <p className="text-xs text-industrial-muted font-bold uppercase tracking-wider mb-1">Tipe Notification</p>
                    <p className="text-sm font-medium text-industrial-text">{selectedRek.notification_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-industrial-muted font-bold uppercase tracking-wider mb-1">Dilaporkan Oleh (Reported By)</p>
                    <p className="text-sm font-medium text-industrial-text">{selectedRek.reported_by || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-industrial-muted font-bold uppercase tracking-wider mb-1">Status Internal</p>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border inline-block ${getStatusColor(selectedRek.status || 'Diajukan')}`}>
                      {selectedRek.status || 'Diajukan'}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-industrial-muted font-bold uppercase tracking-wider mb-1">Pabrik</p>
                    <p className="text-sm font-medium text-industrial-text">{selectedRek.pabrik?.nama_pabrik} ({selectedRek.pabrik?.kode_pabrik})</p>
                  </div>
                  <div>
                    <p className="text-xs text-industrial-muted font-bold uppercase tracking-wider mb-1">Functional Location</p>
                    <p className="text-sm font-medium text-industrial-text">{selectedRek.functional_loc || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-industrial-muted font-bold uppercase tracking-wider mb-1">Equipment</p>
                    <p className="text-sm font-medium text-industrial-text">{selectedRek.equipment || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-industrial-muted font-bold uppercase tracking-wider mb-1">Tanggal Dibuat (SAP)</p>
                    <p className="text-sm font-medium text-industrial-text">
                      {selectedRek.created_on ? new Date(selectedRek.created_on).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                </div>

                {selectedRek.order && (
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-xs text-industrial-muted font-bold uppercase tracking-wider mb-1">Work Order Terkait</p>
                    <p className="text-sm font-medium text-industrial-text bg-industrial-blue/10 text-industrial-blue inline-block px-3 py-1 rounded-lg border border-industrial-blue/20">
                      {selectedRek.order}
                    </p>
                  </div>
                )}

                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs text-industrial-muted font-bold uppercase tracking-wider mb-1">Deskripsi Masalah</p>
                  <p className="text-sm text-industrial-text p-3 bg-industrial-background rounded-lg border border-industrial-border">
                    {selectedRek.description || '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-industrial-border flex justify-end bg-industrial-background/30 rounded-b-[15px]">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-white border border-industrial-border text-industrial-text text-xs font-bold rounded-lg hover:bg-industrial-background transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
