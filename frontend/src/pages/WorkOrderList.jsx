import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';

export default function WorkOrderList({ isEmbedded = false }) {
  const [workOrders, setWorkOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedWO, setSelectedWO] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch Work Orders
  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search
      }).toString();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workorders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setWorkOrders(data.data);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [page]); // Re-fetch on page change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchWorkOrders();
  };

  const handleViewDetail = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workorders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedWO(data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-navy/10 text-navy border-navy/20';
      case 'released':
      case 'rel':
        return 'bg-success/10 text-success border-success/20';
      case 'closed':
      case 'teco':
        return 'bg-platinum-dark/10 text-platinum-dark border-platinum-dark/20';
      default:
        return 'bg-accent/10 text-accent border-accent/20';
    }
  };

  return (
    <div className={isEmbedded ? "space-y-4" : "p-6 space-y-6"}>
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-ink tracking-tight">
              Work Orders
            </h2>
            <p className="text-platinum-dark text-xs md:text-sm mt-1">
              Daftar Work Order SAP yang telah diimport ke dalam sistem.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-platinum-dark rounded-card shadow-sm-subtle overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-platinum-dark flex flex-col sm:flex-row justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-platinum-dark" />
            <input
              type="text"
              placeholder="Cari Nomor WO atau Deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-platinum border border-platinum-dark rounded-lg text-sm text-ink focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </form>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-platinum-dark text-ink text-sm font-medium rounded-lg hover:bg-platinum transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-navy" />
            </div>
          ) : workOrders.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px] text-platinum-dark text-sm">
              Tidak ada data ditemukan.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-platinum border-b border-platinum-dark text-xs font-bold text-platinum-dark uppercase tracking-wider">
                  <th className="px-4 py-3">Nomor WO</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Tipe PM</th>
                  <th className="px-4 py-3">Pabrik</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum-dark text-sm">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-platinum/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{wo.nomor_wo}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={wo.description}>{wo.description}</td>
                    <td className="px-4 py-3">{wo.operation_activity}</td>
                    <td className="px-4 py-3 font-mono text-xs">{wo.tipe_pm}</td>
                    <td className="px-4 py-3">{wo.pabrik?.kode_pabrik}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(wo.status)}`}>
                        {wo.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetail(wo.id)}
                        className="p-1.5 text-navy hover:bg-navy/10 rounded-md transition-colors"
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
          <div className="p-4 border-t border-platinum-dark flex items-center justify-between text-sm bg-platinum/30">
            <div className="text-platinum-dark">
              Halaman <span className="font-bold text-ink">{meta.page}</span> dari <span className="font-bold text-ink">{meta.totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-platinum-dark rounded-lg text-ink hover:bg-platinum disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-2 border border-platinum-dark rounded-lg text-ink hover:bg-platinum disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedWO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-card shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-platinum-dark flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">Detail Work Order</h3>
                <p className="text-xs text-platinum-dark">{selectedWO.nomor_wo}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-platinum-dark hover:bg-platinum rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-platinum-dark font-bold uppercase tracking-wider mb-1">Nomor WO</p>
                    <p className="text-sm font-medium text-ink">{selectedWO.nomor_wo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-platinum-dark font-bold uppercase tracking-wider mb-1">Operation / Activity</p>
                    <p className="text-sm font-medium text-ink">{selectedWO.operation_activity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-platinum-dark font-bold uppercase tracking-wider mb-1">Tipe PM</p>
                    <p className="text-sm font-medium text-ink">{selectedWO.tipe_pm}</p>
                  </div>
                  <div>
                    <p className="text-xs text-platinum-dark font-bold uppercase tracking-wider mb-1">Status</p>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border inline-block ${getStatusColor(selectedWO.status)}`}>
                      {selectedWO.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-platinum-dark font-bold uppercase tracking-wider mb-1">Pabrik</p>
                    <p className="text-sm font-medium text-ink">{selectedWO.pabrik?.nama_pabrik} ({selectedWO.pabrik?.kode_pabrik})</p>
                  </div>
                  <div>
                    <p className="text-xs text-platinum-dark font-bold uppercase tracking-wider mb-1">Work Center</p>
                    <p className="text-sm font-medium text-ink">{selectedWO.work_center || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-platinum-dark font-bold uppercase tracking-wider mb-1">Equipment</p>
                    <p className="text-sm font-medium text-ink">{selectedWO.equipment || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-platinum-dark font-bold uppercase tracking-wider mb-1">Tanggal Dibuat (SAP)</p>
                    <p className="text-sm font-medium text-ink">
                      {selectedWO.tanggal_dibuat ? new Date(selectedWO.tanggal_dibuat).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs text-platinum-dark font-bold uppercase tracking-wider mb-1">Deskripsi / Judul Pekerjaan</p>
                  <p className="text-sm text-ink p-3 bg-platinum rounded-lg border border-platinum-dark">
                    {selectedWO.description || '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-platinum-dark flex justify-end bg-platinum/30 rounded-b-[15px]">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-white border border-platinum-dark text-ink text-xs font-bold rounded-lg hover:bg-platinum transition-colors"
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
