import React, { useState, useMemo, useContext } from 'react';
import {
  Activity, Download, FileText, Printer, PlusCircle, Search, Trash2, Calendar, UserPlus,
  X, Users, Filter, Edit, MapPin
} from 'lucide-react';
import AbsensiCalendar from '../components/attendance/AbsensiCalendar';
import RekapIzinView from '../components/attendance/RekapIzinView';
import ManpowerAvailabilityBoard from './ManpowerAvailabilityBoard';
import { MOCK_STATUSES, INDONESIA_HOLIDAYS } from '../constants/holidays';
import { AuthContext } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import pktLogoImg from '../assets/pkt-logo.png';
import brandIconImg from '../assets/brand-icon.png';

// 41 Seed Personnel
const INITIAL_EMPLOYEES = [
  { id: 1, npk: '4033496', name: 'Febryan Bagus P', employee_type: 'Organik', division: 'Rotating 1', position: 'Vice President', is_active: 1 },
  { id: 2, npk: '4114064', name: 'Heri Kurniawan', employee_type: 'Organik', division: 'Rotating 1', position: 'AVP Rotating 1', is_active: 1 },
  { id: 3, npk: '4093894', name: 'Rostam', employee_type: 'Organik', division: 'PPHS & OSBL', position: 'AVP PPHS & OSBL', is_active: 1 },
  { id: 4, npk: '4254883', name: 'Amir Salim', employee_type: 'Organik', division: 'Rotating 1', position: 'Rotating 1', is_active: 1 },
  { id: 5, npk: '4244822', name: 'Teguh Pambudi', employee_type: 'Organik', division: 'Rotating 1', position: 'Rotating 1', is_active: 1 },
  { id: 6, npk: '4244786', name: 'Farhan Alrosad Munir', employee_type: 'Organik', division: 'Rotating 1', position: 'Rotating 1', is_active: 1 },
  { id: 7, npk: '4093895', name: 'Supriadi', employee_type: 'Organik', division: 'Rotating 2', position: 'AVP Rotating 2', is_active: 1 },
  { id: 8, npk: '4124201', name: 'Grymen Paembonan', employee_type: 'Organik', division: 'Rotating 2', position: 'Rotating 2', is_active: 1 },
  { id: 9, npk: '4164506', name: 'Aang Wisnugraha', employee_type: 'Organik', division: 'Rotating 2', position: 'Rotating 2', is_active: 1 },
  { id: 10, npk: '4184698', name: 'Muhammad Syaiful', employee_type: 'Organik', division: 'PPHS & OSBL', position: 'PPHS & OSBL', is_active: 1 },
  { id: 11, npk: '4244837', name: 'Rahmat Subagyo', employee_type: 'Organik', division: 'PPHS & OSBL', position: 'PPHS & OSBL', is_active: 1 },
  { id: 12, npk: '4053641', name: 'Budi Raharjo', employee_type: 'Organik', division: 'Bengkel', position: 'AVP Bengkel', is_active: 1 },
  { id: 13, npk: '4104002', name: 'Agus Setiawan', employee_type: 'Organik', division: 'Bengkel', position: 'Bengkel', is_active: 1 },
  { id: 14, npk: '4083750', name: 'Bambang Tri', employee_type: 'Organik', division: 'Metalurgi', position: 'AVP Metalurgi', is_active: 1 },
  { id: 15, npk: '4154402', name: 'Dedi Kurnia', employee_type: 'Organik', division: 'QC', position: 'AVP QC', is_active: 1 },
  { id: 16, npk: 'K225716', name: 'Siti Rahmawati', employee_type: 'Non Organik', division: 'Sekretaris', position: 'Sekretaris', is_active: 1 },
];

export default function ManPowerPage({ initialView = 'availability' }) {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [attendanceChanges, setAttendanceChanges] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [isEditEmpOpen, setIsEditEmpOpen] = useState(false);
  const [editEmpData, setEditEmpData] = useState(null);

  const defaultFilterMonth = new Date().getMonth().toString();
  const defaultFilterYear = new Date().getFullYear().toString();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(defaultFilterMonth);
  const [filterYear, setFilterYear] = useState(defaultFilterYear);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [viewMode, setViewMode] = useState(initialView === 'attendance' ? 'calendar' : initialView);

  React.useEffect(() => {
    setViewMode(initialView === 'attendance' ? 'calendar' : initialView);
  }, [initialView]);

  React.useEffect(() => {
    // Fetch Employees
    fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/dashboard/manpower')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item) => ({
            id: item.id,
            npk: item.npk,
            name: item.name,
            employee_type: item.employee_type || 'Organik',
            division: item.position || 'Inspeksi Teknik',
            position: item.position || 'Staff',
            is_active: item.is_active ? 1 : 0,
          }));
          setEmployees(formatted);
        }
      })
      .catch(console.error);

    // Fetch Kehadiran (Attendance)
    fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/kehadiran')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((record) => {
            const recJenis = (record.jenis || '').toLowerCase().trim();
            const statusMatch = MOCK_STATUSES.find(s => {
              const sName = s.name.toLowerCase().trim();
              return sName === recJenis || recJenis.includes(sName) || sName.includes(recJenis);
            });
            return {
              id: record.id,
              employee_id: record.man_power_id,
              start_date: record.tanggal_mulai.split('T')[0],
              end_date: record.tanggal_selesai.split('T')[0],
              status_id: statusMatch ? statusMatch.id : 1, // Fallback to 1
              note: record.keterangan || '',
              duration: calculateWorkingDays(record.tanggal_mulai, record.tanggal_selesai, statusMatch ? statusMatch.id : 1)
            };
          });
          setAttendanceChanges(formatted);
        }
      })
      .catch(console.error);
  }, []);

  const [formData, setFormData] = useState({
    employee_id: '',
    status_id: MOCK_STATUSES[0].id,
    start_date: '',
    end_date: '',
    note: '',
  });

  const [newEmpData, setNewEmpData] = useState({
    npk: '',
    name: '',
    employee_type: 'Organik',
    division: 'Rotating 1',
    position: 'Staff Rotating 1',
  });

  const calculateWorkingDays = (start, end, statusId) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    let count = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const day = cur.getDay();
      const dateStr = cur.toISOString().split('T')[0];
      const isWeekend = (day === 0 || day === 6);
      const isHoliday = !!INDONESIA_HOLIDAYS[dateStr];
      const isOffday = isWeekend || isHoliday;
      
      // Jika status adalah Cuti (id = 3), maka tidak terakumulasi di weekend/libur nasional
      if (statusId === 3) {
        if (!isOffday) count++;
      } else {
        // Status lain terhitung semua (termasuk weekend/libur nasional)
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count || 1;
  };

  const getEmployee = (id) => employees.find((e) => e.id === id);
  const todayStr = new Date().toISOString().split('T')[0];
  const activeOrUpcomingCount = attendanceChanges.filter((a) => a.end_date >= todayStr).length;

  const filteredChanges = useMemo(() => {
    return [...attendanceChanges]
      .sort((a, b) => (a.start_date < b.start_date ? 1 : -1))
      .filter((a) => {
        const emp = getEmployee(a.employee_id);
        return emp && emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .filter((a) => {
        if (filterMonth === 'all') return true;
        const date = new Date(a.start_date);
        return date.getMonth().toString() === filterMonth && date.getFullYear().toString() === filterYear;
      });
  }, [attendanceChanges, employees, searchTerm, filterMonth, filterYear]);

  const availableYears = useMemo(() => {
    if (!attendanceChanges || attendanceChanges.length === 0) return ['2026', '2025'];
    const years = new Set(attendanceChanges.map((a) => new Date(a.start_date).getFullYear().toString()));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [attendanceChanges]);

  const handleExport = (type) => {
    setShowExportMenu(false);
    if (type === 'pdf') {
      window.print();
    } else if (type === 'csv') {
      let csv = 'Nama,NPK,Divisi,Jabatan,Status,Mulai,Selesai,Durasi (Hari),Catatan\n';
      filteredChanges.forEach((row) => {
        const emp = getEmployee(row.employee_id);
        const status = MOCK_STATUSES.find((s) => s.id === row.status_id)?.name || 'Unknown';
        csv += `"${emp?.name}","${emp?.npk}","${emp?.division}","${emp?.position}","${status}","${row.start_date}","${row.end_date}","${row.duration}","${row.note}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Kehadiran_${Date.now()}.csv`;
      a.click();
    }
  };

  const handleAddEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!newEmpData.npk || !newEmpData.name) {
      alert('NPK dan Nama Karyawan wajib diisi!');
      return;
    }
    const newEmp = { id: Date.now(), is_active: 1, ...newEmpData };
    setEmployees([newEmp, ...employees]);
    alert(`Karyawan ${newEmp.name} (NPK: ${newEmp.npk}) berhasil ditambahkan!`);
    setIsAddEmpOpen(false);
    setNewEmpData({ npk: '', name: '', employee_type: 'Organik', division: 'Rotating 1', position: 'Staff Rotating 1' });
  };

  const handleEditEmployeeClick = (emp) => {
    setEditEmpData({ ...emp });
    setIsEditEmpOpen(true);
  };

  const handleEditEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!editEmpData || !editEmpData.npk || !editEmpData.name) return;
    setEmployees(employees.map((e) => (e.id === editEmpData.id ? editEmpData : e)));
    alert(`Data karyawan ${editEmpData.name} berhasil diperbarui!`);
    setIsEditEmpOpen(false);
    setEditEmpData(null);
  };

  const handleDeleteEmployee = (empId, empName) => {
    if (window.confirm(`Apakah Anda yakin ingin menonaktifkan karyawan "${empName}"?`)) {
      setEmployees(employees.filter((e) => e.id !== empId));
    }
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.start_date || !formData.end_date) {
      alert('Lengkapi Karyawan, Tanggal Mulai, dan Tanggal Selesai terlebih dahulu.');
      return;
    }

    const selectedStatus = MOCK_STATUSES.find(s => s.id === parseInt(formData.status_id));
    const jenis = selectedStatus ? selectedStatus.name : 'Unknown';

    const payload = {
      employee_id: parseInt(formData.employee_id),
      start_date: formData.start_date,
      end_date: formData.end_date,
      jenis,
      note: formData.note
    };

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/kehadiran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        const newRecord = {
          id: data.id,
          employee_id: data.man_power_id,
          start_date: data.tanggal_mulai.split('T')[0],
          end_date: data.tanggal_selesai.split('T')[0],
          status_id: parseInt(formData.status_id),
          note: data.keterangan || '',
          duration: calculateWorkingDays(data.tanggal_mulai, data.tanggal_selesai),
        };
        setAttendanceChanges([newRecord, ...attendanceChanges]);
        setIsFormOpen(false);
        setFormData({ employee_id: '', status_id: MOCK_STATUSES[0].id, start_date: '', end_date: '', note: '' });
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Gagal menyimpan presensi');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi saat menyimpan.');
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (window.confirm('Hapus histori kehadiran ini?')) {
      try {
        const res = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/kehadiran/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setAttendanceChanges(attendanceChanges.filter((a) => a.id !== id));
        } else {
          alert('Gagal menghapus data.');
        }
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan koneksi saat menghapus.');
      }
    }
  };

  const dinasData = filteredChanges.filter(r => ['Dinas Dalam Negeri', 'Dinas Luar Negeri', 'Training'].includes(r.jenis || MOCK_STATUSES.find(s => s.id === r.status_id)?.name));
  const cutiData = filteredChanges.filter(r => (r.jenis || MOCK_STATUSES.find(s => s.id === r.status_id)?.name) === 'Cuti');
  const ijinData = filteredChanges.filter(r => (r.jenis || MOCK_STATUSES.find(s => s.id === r.status_id)?.name) === 'Izin' || (r.jenis || MOCK_STATUSES.find(s => s.id === r.status_id)?.name) === 'Alpha');
  const sakitData = filteredChanges.filter(r => (r.jenis || MOCK_STATUSES.find(s => s.id === r.status_id)?.name) === 'Sakit');

  return (
    <div className="p-6 space-y-6 bg-industrial-background min-h-screen relative print:bg-white print:p-0 print:space-y-4">
      <div className="print:hidden space-y-6">
      {/* FLOATING FILTER */}
      <div
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-1 bg-white/90 backdrop-blur-md border border-industrial-border shadow-lg rounded-full p-1 transition-all duration-300 ${isFilterCollapsed ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
          }`}
      >
        <button
          onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
          className="relative flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          title={isFilterCollapsed ? 'Buka Filter' : 'Tutup Filter'}
        >
          {isFilterCollapsed ? <Filter size={14} /> : <X size={14} />}
        </button>

        {!isFilterCollapsed && (
          <>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1">
              <Calendar size={12} className="text-slate-400" />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent text-[11px] outline-none cursor-pointer"
              >
                <option value="all">Semua Waktu</option>
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i.toString()}>
                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1 w-[140px]">
              <Search size={12} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama..."
                className="bg-transparent text-[11px] outline-none w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-industrial-blue/10 text-industrial-blue flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-industrial-text tracking-tight">Man Power Control</h1>
            <p className="text-xs text-industrial-muted">Kelola personil dan status presensi.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddEmpOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <UserPlus size={16} /> Tambah Karyawan
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1.5 bg-industrial-navy text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-industrial-text transition-colors shadow-sm"
          >
            <PlusCircle size={16} /> Catat Status Presensi
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-card p-4 border border-industrial-border shadow-sm-subtle">
          <div className="text-xs text-industrial-muted font-medium mb-1">Total Personel</div>
          <div className="text-2xl font-bold text-industrial-text">{employees.length} Personil</div>
        </div>
        <div className="bg-white rounded-card p-4 border border-industrial-border shadow-sm-subtle">
          <div className="text-xs text-industrial-muted font-medium mb-1">Catatan Aktif / Akan Datang</div>
          <div className="text-2xl font-bold text-industrial-blue">{activeOrUpcomingCount} Catatan</div>
        </div>
        <div className="bg-white rounded-card p-4 border border-industrial-border shadow-sm-subtle">
          <div className="text-xs text-industrial-muted font-medium mb-1">Total Riwayat Presensi</div>
          <div className="text-2xl font-bold text-industrial-text">{attendanceChanges.length} Riwayat</div>
        </div>
      </div>

      {/* Main Table / Calendar Container */}
      <div className="bg-white rounded-card border border-industrial-border shadow-sm-subtle overflow-hidden">
        <div className="p-4 border-b border-industrial-border flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h3 className="font-semibold text-sm md:text-base text-industrial-text">
            {viewMode === 'calendar' ? 'Kalender Presensi' : viewMode === 'recap' ? 'Rekap Izin & Anggota' : 'Riwayat Perubahan Status'}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('availability')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'availability' ? 'bg-industrial-navy text-white shadow-sm' : 'text-slate-500'
                  }`}
              >
                <MapPin size={13} /> Availability Board
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'table' ? 'bg-white text-industrial-navy shadow-sm' : 'text-slate-500'
                  }`}
              >
                <Activity size={13} /> Tabel Riwayat
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'calendar' ? 'bg-industrial-navy text-white shadow-sm' : 'text-slate-500'
                  }`}
              >
                <Calendar size={13} /> Kalender
              </button>
              <button
                onClick={() => setViewMode('recap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'recap' ? 'bg-white text-industrial-navy shadow-sm' : 'text-slate-500'
                  }`}
              >
                <Users size={13} /> Rekap Izin
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1 bg-white border border-industrial-border px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50"
              >
                <Download size={13} /> Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-industrial-border py-1 z-10">
                  <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Printer size={13} /> Print / Export PDF
                  </button>
                  <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <FileText size={13} /> Export CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          {viewMode === 'table' ? (
            <div className="space-y-3">
              {filteredChanges.map((row) => {
                const status = MOCK_STATUSES.find((s) => s.id === row.status_id);
                const emp = getEmployee(row.employee_id);
                return (
                  <div key={row.id} className="bg-white p-3.5 rounded-xl border border-industrial-border hover:border-industrial-blue/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-industrial-blue/10 text-industrial-blue font-bold text-xs flex items-center justify-center">
                        {emp?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-industrial-text">{emp?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-industrial-muted">NPK: {emp?.npk} &bull; {emp?.division}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${status?.bg || ''} ${status?.color || ''}`}>
                        {status?.name || 'Unknown'}
                      </span>
                      <p className="text-xs font-medium text-slate-600">{row.start_date} s/d {row.end_date}</p>
                      <button
                        onClick={() => handleDeleteAttendance(row.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'calendar' ? (
            <AbsensiCalendar employees={employees} attendanceChanges={attendanceChanges} />
          ) : viewMode === 'availability' ? (
            <div className="-m-4">
              <ManpowerAvailabilityBoard />
            </div>
          ) : (
            <RekapIzinView
              employees={employees}
              attendanceChanges={attendanceChanges}
              onDeleteEmployee={handleDeleteEmployee}
              onEditEmployee={handleEditEmployeeClick}
            />
          )}
        </div>
      </div>

      {/* Modal Catat Status Presensi */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 border border-industrial-border max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-industrial-border">
              <h3 className="font-bold text-base text-industrial-text">Catat Perubahan Status Presensi</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitAttendance} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Pilih Karyawan</label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full border border-industrial-border rounded-lg p-2 bg-industrial-background"
                >
                  <option value="">Pilih Karyawan</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} (NPK: {emp.npk})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Status Kehadiran</label>
                <select
                  required
                  value={formData.status_id}
                  onChange={(e) => setFormData({ ...formData, status_id: e.target.value })}
                  className="w-full border border-industrial-border rounded-lg p-2 bg-industrial-background"
                >
                  {MOCK_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Tanggal Mulai</label>
                  <input
                    required
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border border-industrial-border rounded-lg p-2 bg-industrial-background"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Tanggal Selesai</label>
                  <input
                    required
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border border-industrial-border rounded-lg p-2 bg-industrial-background"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Catatan</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={2}
                  className="w-full border border-industrial-border rounded-lg p-2 bg-industrial-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-industrial-navy text-white font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Karyawan */}
      {isAddEmpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 border border-industrial-border max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-industrial-border">
              <h3 className="font-bold text-base text-industrial-text">Tambah Data Karyawan Baru</h3>
              <button onClick={() => setIsAddEmpOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddEmployeeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">NPK Karyawan</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: 4254883 / K225716"
                  value={newEmpData.npk}
                  onChange={(e) => setNewEmpData({ ...newEmpData, npk: e.target.value })}
                  className="w-full border border-industrial-border rounded-lg p-2 bg-industrial-background"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Nama Lengkap</label>
                <input
                  required
                  type="text"
                  placeholder="Nama Karyawan"
                  value={newEmpData.name}
                  onChange={(e) => setNewEmpData({ ...newEmpData, name: e.target.value })}
                  className="w-full border border-industrial-border rounded-lg p-2 bg-industrial-background"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Divisi</label>
                <select
                  value={newEmpData.division}
                  onChange={(e) => setNewEmpData({ ...newEmpData, division: e.target.value })}
                  className="w-full border border-industrial-border rounded-lg p-2 bg-industrial-background"
                >
                  <option value="Rotating 1">Rotating 1</option>
                  <option value="Rotating 2">Rotating 2</option>
                  <option value="PPHS & OSBL">PPHS & OSBL</option>
                  <option value="Bengkel">Bengkel</option>
                  <option value="Metalurgi">Metalurgi</option>
                  <option value="QC">QC</option>
                  <option value="Sekretaris">Sekretaris</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddEmpOpen(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Simpan Karyawan</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      </div> {/* End of print:hidden div */}

      {/* FORMAL PRINT REPORT LAYOUT: REKAP IZIN */}
      {viewMode === 'recap' && (
        <div className="hidden print:block w-full mt-6 px-10">
          {/* Report Header with Real Logos */}
          <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-8">
            <div className="w-1/3 flex items-center">
              <img src={pktLogoImg} alt="Pupuk Kaltim" className="h-16 object-contain" />
            </div>
            <div className="w-1/3 text-center">
              <h1 className="text-base font-black text-slate-800 tracking-wider">DEPARTEMEN INSPEKSI TEKNIK 2</h1>
              <p className="text-xs font-semibold text-slate-600">PT Pupuk Kalimantan Timur</p>
            </div>
            <div className="w-1/3 flex justify-end items-center">
              <img src={brandIconImg} alt="App Icon" className="h-14 object-contain" />
            </div>
          </div>

          <div className="text-left mb-6">
            <h2 className="text-sm font-bold text-slate-800 tracking-wide mb-1">
              REKAPITULASI KEHADIRAN (PERJALANAN DINAS, TRAINING, CUTI, IJIN, SAKIT)
            </h2>
            <p className="text-xs font-semibold text-slate-600">
              Periode: {filterMonth !== 'all' ? new Date(2026, parseInt(filterMonth)).toLocaleString('id-ID', { month: 'long' }) : 'Semua Bulan'} {filterYear}
            </p>
          </div>

          {/* 1.2.1 Perjalanan Dinas / Training */}
          <div className="mb-6 print-break-avoid">
            <h3 className="text-xs font-bold text-slate-800 mb-1">1.2.1 Perjalanan Dinas / Training</h3>
            <p className="text-[10px] text-slate-600 mb-2">Realisasi perjalanan dinas & training untuk periode ini ditunjukkan pada tabel berikut.</p>
            <table className="w-full text-[10px] text-left border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 p-1.5 text-center w-8">No</th>
                  <th className="border border-slate-400 p-1.5">Nama</th>
                  <th className="border border-slate-400 p-1.5">Jabatan</th>
                  <th className="border border-slate-400 p-1.5">Keterangan Dinas / Training</th>
                  <th className="border border-slate-400 p-1.5 text-center w-20">Jumlah Hari</th>
                </tr>
              </thead>
              <tbody>
                {dinasData.length === 0 ? (
                  <tr><td colSpan="5" className="border border-slate-400 p-1.5 text-center text-slate-400">Nihil</td></tr>
                ) : dinasData.map((row, idx) => {
                  const emp = getEmployee(row.employee_id);
                  return (
                    <tr key={idx}>
                      <td className="border border-slate-400 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-400 p-1.5">{emp?.name}</td>
                      <td className="border border-slate-400 p-1.5">{emp?.position}</td>
                      <td className="border border-slate-400 p-1.5">{row.jenis} {row.note ? `- ${row.note}` : ''}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{row.duration}</td>
                    </tr>
                  )
                })}
                {dinasData.length > 0 && (
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan="3" className="border border-slate-400 p-1.5 text-center">Jumlah Karyawan Dinas/Training</td>
                    <td className="border border-slate-400 p-1.5 text-center">{dinasData.length}</td>
                    <td className="border border-slate-400 p-1.5 text-center">{dinasData.reduce((acc, curr) => acc + curr.duration, 0)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 1.2.2 Cuti */}
          <div className="mb-6 print-break-avoid">
            <h3 className="text-xs font-bold text-slate-800 mb-1">1.2.2 Cuti</h3>
            <p className="text-[10px] text-slate-600 mb-2">Realisasi cuti untuk periode ini ditunjukkan pada tabel berikut.</p>
            <table className="w-full text-[10px] text-left border-collapse border border-slate-400">
              <thead>
                <tr className="bg-emerald-100/50">
                  <th className="border border-slate-400 p-1.5 text-center w-8">No</th>
                  <th className="border border-slate-400 p-1.5">Nama</th>
                  <th className="border border-slate-400 p-1.5">Jabatan</th>
                  <th className="border border-slate-400 p-1.5 text-center">Periode Cuti</th>
                  <th className="border border-slate-400 p-1.5 text-center w-20">Jumlah Hari</th>
                </tr>
              </thead>
              <tbody>
                {cutiData.length === 0 ? (
                  <tr><td colSpan="5" className="border border-slate-400 p-1.5 text-center text-slate-400">Nihil</td></tr>
                ) : cutiData.map((row, idx) => {
                  const emp = getEmployee(row.employee_id);
                  return (
                    <tr key={idx}>
                      <td className="border border-slate-400 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-400 p-1.5">{emp?.name}</td>
                      <td className="border border-slate-400 p-1.5">{emp?.position}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{new Date(row.start_date).toLocaleDateString('id-ID')} s/d {new Date(row.end_date).toLocaleDateString('id-ID')}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{row.duration}</td>
                    </tr>
                  )
                })}
                {cutiData.length > 0 && (
                  <tr className="bg-emerald-50 font-bold">
                    <td colSpan="3" className="border border-slate-400 p-1.5 text-center">Jumlah Karyawan Cuti</td>
                    <td className="border border-slate-400 p-1.5 text-center">{cutiData.length}</td>
                    <td className="border border-slate-400 p-1.5 text-center">{cutiData.reduce((acc, curr) => acc + curr.duration, 0)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 1.2.3 Ijin */}
          <div className="mb-6 print-break-avoid">
            <h3 className="text-xs font-bold text-slate-800 mb-1">1.2.3 Ijin</h3>
            <p className="text-[10px] text-slate-600 mb-2">Daftar karyawan yang mengajukan permohonan izin meninggalkan pekerjaan.</p>
            <table className="w-full text-[10px] text-left border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 p-1.5 text-center w-8">No</th>
                  <th className="border border-slate-400 p-1.5">Nama</th>
                  <th className="border border-slate-400 p-1.5">Jabatan</th>
                  <th className="border border-slate-400 p-1.5">Keterangan Izin</th>
                  <th className="border border-slate-400 p-1.5 text-center w-20">Jumlah Hari</th>
                </tr>
              </thead>
              <tbody>
                {ijinData.length === 0 ? (
                  <tr><td colSpan="5" className="border border-slate-400 p-1.5 text-center text-slate-400">Nihil</td></tr>
                ) : ijinData.map((row, idx) => {
                  const emp = getEmployee(row.employee_id);
                  return (
                    <tr key={idx}>
                      <td className="border border-slate-400 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-400 p-1.5">{emp?.name}</td>
                      <td className="border border-slate-400 p-1.5">{emp?.position}</td>
                      <td className="border border-slate-400 p-1.5">{row.note || row.jenis}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{row.duration}</td>
                    </tr>
                  )
                })}
                {ijinData.length > 0 && (
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan="3" className="border border-slate-400 p-1.5 text-center">Jumlah Karyawan Izin</td>
                    <td className="border border-slate-400 p-1.5 text-center">{ijinData.length}</td>
                    <td className="border border-slate-400 p-1.5 text-center">{ijinData.reduce((acc, curr) => acc + curr.duration, 0)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 1.2.4 Sakit */}
          <div className="mb-6 print-break-avoid">
            <h3 className="text-xs font-bold text-slate-800 mb-1">1.2.4 Sakit</h3>
            <p className="text-[10px] text-slate-600 mb-2">Daftar karyawan yang sakit.</p>
            <table className="w-full text-[10px] text-left border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 p-1.5 text-center w-8">No</th>
                  <th className="border border-slate-400 p-1.5">Nama</th>
                  <th className="border border-slate-400 p-1.5">Jabatan</th>
                  <th className="border border-slate-400 p-1.5">Keterangan</th>
                  <th className="border border-slate-400 p-1.5 text-center w-20">Jumlah Hari</th>
                </tr>
              </thead>
              <tbody>
                {sakitData.length === 0 ? (
                  <tr><td colSpan="5" className="border border-slate-400 p-1.5 text-center text-slate-400">Nihil</td></tr>
                ) : sakitData.map((row, idx) => {
                  const emp = getEmployee(row.employee_id);
                  return (
                    <tr key={idx}>
                      <td className="border border-slate-400 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-400 p-1.5">{emp?.name}</td>
                      <td className="border border-slate-400 p-1.5">{emp?.position}</td>
                      <td className="border border-slate-400 p-1.5">{row.note || 'Sakit'}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{row.duration}</td>
                    </tr>
                  )
                })}
                {sakitData.length > 0 && (
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan="3" className="border border-slate-400 p-1.5 text-center">Jumlah Karyawan Sakit</td>
                    <td className="border border-slate-400 p-1.5 text-center">{sakitData.length}</td>
                    <td className="border border-slate-400 p-1.5 text-center">{sakitData.reduce((acc, curr) => acc + curr.duration, 0)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 1.2.5 Resume Personalia */}
          <div className="mb-6 print-break-avoid">
            <h3 className="text-xs font-bold text-slate-800 mb-1">1.2.5 Resume Personalia</h3>
            <table className="w-1/2 text-[10px] text-left border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 p-1.5 text-center w-8">No</th>
                  <th className="border border-slate-400 p-1.5">Keterangan</th>
                  <th className="border border-slate-400 p-1.5 text-center">Jumlah Karyawan</th>
                  <th className="border border-slate-400 p-1.5 text-center">Jumlah Hari</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center">1</td>
                  <td className="border border-slate-400 p-1.5">Dinas / Training</td>
                  <td className="border border-slate-400 p-1.5 text-center">{dinasData.length}</td>
                  <td className="border border-slate-400 p-1.5 text-center">{dinasData.reduce((acc, curr) => acc + curr.duration, 0)}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center">2</td>
                  <td className="border border-slate-400 p-1.5">Cuti</td>
                  <td className="border border-slate-400 p-1.5 text-center">{cutiData.length}</td>
                  <td className="border border-slate-400 p-1.5 text-center">{cutiData.reduce((acc, curr) => acc + curr.duration, 0)}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center">3</td>
                  <td className="border border-slate-400 p-1.5">Ijin</td>
                  <td className="border border-slate-400 p-1.5 text-center">{ijinData.length}</td>
                  <td className="border border-slate-400 p-1.5 text-center">{ijinData.reduce((acc, curr) => acc + curr.duration, 0)}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center">4</td>
                  <td className="border border-slate-400 p-1.5">Sakit</td>
                  <td className="border border-slate-400 p-1.5 text-center">{sakitData.length}</td>
                  <td className="border border-slate-400 p-1.5 text-center">{sakitData.reduce((acc, curr) => acc + curr.duration, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}
