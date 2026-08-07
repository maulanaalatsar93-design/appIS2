import React, { useState, useMemo } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';

const getRoleRank = (emp) => {
  const pos = (emp?.position || emp?.role || '').toUpperCase();
  const div = (emp?.division || '').toUpperCase();
  const type = (emp?.employee_type || '').toUpperCase();

  if ((pos.includes('VP') || pos.includes('VICE PRESIDENT')) && !pos.includes('AVP') && !pos.includes('ASSISTANT')) return 1;
  if (pos.includes('SIE') || pos.includes('STAFF INSPECTION ENGINEER') || pos.includes('MANAGER')) return 2;
  if (pos.includes('AVP') || pos.includes('ASSISTANT VICE PRESIDENT') || pos.includes('SUPERVISOR')) return 3;
  if (pos.includes('SEKRETARIS') || div.includes('SEKRETARIS')) return 4;
  if (type.includes('ORGANIK') && !type.includes('NON')) return 5;
  if (type.includes('NON ORGANIK') || type.includes('NON-ORGANIK')) return 6;
  if (type.includes('TKNO')) return 7;

  return 8;
};

const sortEmployeesByRole = (a, b) => {
  const rankA = getRoleRank(a);
  const rankB = getRoleRank(b);
  if (rankA !== rankB) return rankA - rankB;
  return (a.name || '').localeCompare(b.name || '');
};

export default function RekapIzinView({
  employees = [],
  attendanceChanges = [],
  onDeleteEmployee,
  onEditEmployee,
  isAdminOrVP = true,
  isAdmin = true,
}) {
  const [searchEmp, setSearchEmp] = useState('');

  const calculateWorkingDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    let count = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count || 1;
  };

  const recapData = useMemo(() => {
    return (employees || []).map((emp) => {
      const empChanges = (attendanceChanges || []).filter((a) => a.employee_id === emp.id);

      let totalCuti = 0;
      let totalSakit = 0;
      let totalIzin = 0;
      let totalDinasDalamNegeri = 0;
      let totalDinasLuarNegeri = 0;
      let totalTraining = 0;
      let totalOther = 0;

      empChanges.forEach((rec) => {
        const days = rec.duration || calculateWorkingDays(rec.start_date, rec.end_date) || 1;
        if (rec.status_id === 3) totalCuti += days;
        else if (rec.status_id === 7) totalSakit += days;
        else if (rec.status_id === 8) totalIzin += days;
        else if (rec.status_id === 5) totalDinasDalamNegeri += days;
        else if (rec.status_id === 4) totalDinasLuarNegeri += days;
        else if (rec.status_id === 6) totalTraining += days;
        else if (rec.status_id !== 1 && rec.status_id !== 2) totalOther += days;
      });

      const totalIzinAll =
        totalCuti + totalSakit + totalIzin + totalDinasDalamNegeri + totalDinasLuarNegeri + totalTraining + totalOther;

      return {
        emp,
        totalCuti,
        totalSakit,
        totalIzin,
        totalDinasDalamNegeri,
        totalDinasLuarNegeri,
        totalTraining,
        totalIzinAll,
      };
    });
  }, [employees, attendanceChanges]);

  const filteredRecap = useMemo(() => {
    return recapData
      .filter(
        (r) =>
          r.emp.name.toLowerCase().includes(searchEmp.toLowerCase()) ||
          (r.emp.npk || '').toLowerCase().includes(searchEmp.toLowerCase()) ||
          (r.emp.division || '').toLowerCase().includes(searchEmp.toLowerCase()) ||
          (r.emp.position || '').toLowerCase().includes(searchEmp.toLowerCase())
      )
      .sort((a, b) => sortEmployeesByRole(a.emp, b.emp));
  }, [recapData, searchEmp]);

  return (
    <div className="space-y-4">
      {/* Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchEmp}
            onChange={(e) => setSearchEmp(e.target.value)}
            placeholder="Cari NPK, nama, divisi..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-industrial-blue"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Personel: <span className="font-bold text-slate-800">{employees.length} Personel</span>
        </div>
      </div>

      {/* Recap Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase bg-slate-50">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3">Personel (NPK)</th>
                <th className="py-3 px-3">Divisi & Jabatan</th>
                <th className="py-3 px-3 text-center">Cuti</th>
                <th className="py-3 px-3 text-center">Sakit</th>
                <th className="py-3 px-3 text-center">Izin</th>
                <th className="py-3 px-3 text-center">Dinas Dalam Negeri</th>
                <th className="py-3 px-3 text-center">Dinas Luar Negeri</th>
                <th className="py-3 px-3 text-center">Training</th>
                <th className="py-3 px-3 text-center font-bold text-rose-600">Total Izin/Absen</th>
                <th className="py-3 px-3 text-right w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecap.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-400 font-medium">
                    Tidak ada data karyawan yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRecap.map((row, idx) => (
                  <tr key={row.emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{row.emp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NPK: {row.emp.npk}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-700 font-medium">{row.emp.division}</div>
                      <div className="text-[10px] text-slate-400">{row.emp.position}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-600">{row.totalCuti} Hari</td>
                    <td className="py-3 px-3 text-center font-bold text-rose-600">{row.totalSakit} Hari</td>
                    <td className="py-3 px-3 text-center font-bold text-orange-600">{row.totalIzin} Hari</td>
                    <td className="py-3 px-3 text-center font-bold text-blue-600">{row.totalDinasDalamNegeri} Hari</td>
                    <td className="py-3 px-3 text-center font-bold text-blue-600">{row.totalDinasLuarNegeri} Hari</td>
                    <td className="py-3 px-3 text-center font-bold text-indigo-600">{row.totalTraining} Hari</td>
                    <td className="py-3 px-3 text-center font-bold text-rose-700 bg-rose-50/60">
                      {row.totalIzinAll} Hari
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isAdmin && (
                        <button
                          onClick={() => onEditEmployee && onEditEmployee(row.emp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1"
                          title="Edit Data Personel"
                        >
                          <Edit size={15} />
                        </button>
                      )}
                      {isAdminOrVP && (
                        <button
                          onClick={() => onDeleteEmployee && onDeleteEmployee(row.emp.id, row.emp.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus / Menonaktifkan Anggota"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
