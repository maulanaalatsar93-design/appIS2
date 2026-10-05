import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Loader2, Users } from 'lucide-react';

export default function MemberParticipationTable() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/wpem/member-participation', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Gagal mengambil data');
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-32">
      <Loader2 className="w-6 h-6 animate-spin text-industrial-blue mb-2" />
      <p className="text-xs text-gray-500">Memuat data partisipasi anggota...</p>
    </div>
  );

  if (error) return (
    <div className="p-4 text-center text-red-500 text-sm bg-red-50 rounded-lg border border-red-100">
      Error: {error}
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md mt-6">
      <div className="p-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-industrial-blue" />
          <h3 className="font-semibold text-ink">Monitoring Partisipasi Anggota</h3>
        </div>
        <p className="text-xs text-gray-500">Menampilkan frekuensi keterlibatan anggota pada program</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200 text-xs font-semibold text-slate-500">
              <th className="p-3 pl-4">Nama Anggota</th>
              <th className="p-3">Divisi</th>
              <th className="p-3 text-center">TA Internal</th>
              <th className="p-3 text-center">TA JVC</th>
              <th className="p-3 text-center">SDI</th>
              <th className="p-3 text-center">CP</th>
              <th className="p-3 text-center">Total Program</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">Belum ada data anggota</td>
              </tr>
            ) : (
              data.map(mp => {
                const total = Object.values(mp.stats).reduce((acc, val) => acc + val, 0);
                return (
                  <tr key={mp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 pl-4 font-medium text-ink">{mp.name} <br/><span className="text-[10px] font-normal text-gray-500">{mp.position}</span></td>
                    <td className="p-3 text-gray-600">{mp.divisi}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${mp.stats['TA Internal'] > 0 ? 'bg-blue-100 text-blue-700' : 'text-gray-300'}`}>
                        {mp.stats['TA Internal']}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${mp.stats['TA JVC'] > 0 ? 'bg-teal-100 text-teal-700' : 'text-gray-300'}`}>
                        {mp.stats['TA JVC']}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${mp.stats['SDI'] > 0 ? 'bg-purple-100 text-purple-700' : 'text-gray-300'}`}>
                        {mp.stats['SDI']}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${mp.stats['CP'] > 0 ? 'bg-amber-100 text-amber-700' : 'text-gray-300'}`}>
                        {mp.stats['CP']}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-ink">{total}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
