import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { differenceInDays, format, parseISO, addDays } from 'date-fns';
import { getManpowerList } from '../../services/dashboardService';
import { CheckCircle2, UserX, Calendar, Info, PlaneTakeoff, Globe, GraduationCap, Stethoscope, Loader2, Hospital } from 'lucide-react';

export default function ManPowerDashboard() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [nameFilter, setNameFilter] = useState('');
  const [manpowerData, setManpowerData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchManpower();
  }, [selectedDate]);

  const fetchManpower = async () => {
    setLoading(true);
    try {
      const data = await getManpowerList(selectedDate);
      setManpowerData(data);
    } catch (error) {
      console.error('Error fetching manpower:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriority = (position = '') => {
    const pos = position.toUpperCase();
    if (pos.includes('VP') && !pos.includes('AVP')) return 1;
    if (pos.includes('AVP')) return 2;
    return 3; // Staff and others
  };

  const getBagian = (p) => {
    const pos = (p.position || '').toUpperCase();
    if (pos.includes('VP') && !pos.includes('AVP')) return 'VP';
    if (pos.includes('AVP')) return 'AVP';
    return `Staff ${p.nama_divisi && p.nama_divisi !== 'N/A' ? p.nama_divisi : p.sub_area || ''}`.trim();
  };

  // Custom sort: VP > AVP > Staff, then alphabetically
  const sortHierarchy = (a, b) => {
    const pA = getPriority(a.position);
    const pB = getPriority(b.position);
    if (pA !== pB) return pA - pB;
    return a.name.localeCompare(b.name);
  };

  const filteredData = manpowerData
    .filter(p => p.name.toLowerCase().includes(nameFilter.toLowerCase()))
    .sort(sortHierarchy);

  // Segmentation
  const organikData = filteredData.filter(p => p.employee_type?.toLowerCase().includes('organik') && !p.employee_type?.toLowerCase().includes('non'));
  const nonOrganikData = filteredData.filter(p => p.employee_type?.toLowerCase().includes('non organik'));
  
  const ketidakhadiranStatuses = ['Cuti', 'Izin', 'Sakit', 'Referral'];
  const penugasanStatuses = ['Dinas Dalam Negeri', 'Dinas Luar Negeri'];

  const ketidakhadiranData = filteredData.filter(p => ketidakhadiranStatuses.includes(p.statusToday));
  const penugasanData = filteredData.filter(p => penugasanStatuses.includes(p.statusToday));

  // Stats
  const calculateStats = (data) => {
    const hadir = data.filter(p => p.statusToday === 'Hadir').length;
    const total = data.length;
    const percentage = total > 0 ? Number(((hadir / total) * 100).toFixed(1)) : 0;
    return { hadir, total, percentage };
  };

  const overallStats = calculateStats(filteredData);
  const tkoStats = calculateStats(organikData);
  const tknoStats = calculateStats(nonOrganikData);

  // Scorecard counts
  const scoreCounts = {
    Hadir: overallStats.hadir,
    Off: filteredData.filter(p => p.statusToday === 'Libur Akhir Pekan' || p.statusToday === 'Libur Nasional' || p.statusToday === 'Offday').length,
    Training: filteredData.filter(p => p.statusToday === 'Training').length,
    Cuti: filteredData.filter(p => p.statusToday === 'Cuti').length,
    Izin: filteredData.filter(p => p.statusToday === 'Izin').length,
    Sakit: filteredData.filter(p => p.statusToday === 'Sakit').length,
    Referral: filteredData.filter(p => p.statusToday === 'Referral').length,
    'Dinas Dalam Negeri': filteredData.filter(p => p.statusToday === 'Dinas Dalam Negeri').length,
    'Dinas Luar Negeri': filteredData.filter(p => p.statusToday === 'Dinas Luar Negeri').length,
  };

  // Chart configuration generator
  const createDonutOptions = (title) => ({
    chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    title: { 
      text: title, 
      align: 'left',
      style: { color: '#ffffff', fontSize: '13px', fontWeight: 'bold' },
      background: '#0f172a', // Dark blue header matching Job Load
      offsetX: 10,
      padding: 5
    },
    labels: ['Hadir', 'Tidak Hadir'],
    colors: ['#2563EB', '#FBBF24'], // Blue for present, yellow for absent as per mockup
    plotOptions: {
      pie: {
        donut: { size: '60%' },
        dataLabels: { offset: -10 }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + "%"
      }
    },
    legend: { show: false },
    stroke: { width: 1, colors: ['#ffffff'] }
  });

  const renderDurasiCell = (p) => {
    let durasiText = p.statusToday;
    let bgClass = 'bg-slate-400';
    if (p.statusToday === 'Cuti') bgClass = 'bg-[#EAB308]'; // Yellow 500
    if (p.statusToday === 'Izin') bgClass = 'bg-amber-800';
    if (p.statusToday === 'Sakit') bgClass = 'bg-slate-400';
    if (p.statusToday === 'Referral') bgClass = 'bg-purple-500';
    if (p.statusToday === 'Training') bgClass = 'bg-green-500';
    if (p.statusToday === 'Dinas Dalam Negeri') bgClass = 'bg-orange-500';
    if (p.statusToday === 'Dinas Luar Negeri') bgClass = 'bg-black';

    if (p.absensi && p.absensi.tanggal_mulai && p.absensi.tanggal_selesai) {
      const tMulai = parseISO(p.absensi.tanggal_mulai);
      const tSelesai = parseISO(p.absensi.tanggal_selesai);
      const tKembali = addDays(tSelesai, 1);
      
      const tMulaiStr = format(tMulai, 'dd MMM');
      const tSelesaiStr = format(tSelesai, 'dd MMM');
      const tKembaliStr = format(tKembali, 'dd MMM yyyy');
      
      const dateRange = tMulaiStr === tSelesaiStr ? tMulaiStr : `${tMulaiStr} - ${tSelesaiStr}`;
      
      // Use the newly calculated backend duration if available, else fallback
      const diffDays = p.absensi.durasi_kerja !== undefined ? p.absensi.durasi_kerja : differenceInDays(tSelesai, tMulai) + 1;

      return (
        <div className="flex flex-col text-center">
          <span className={`w-full py-1 text-white text-[11px] font-bold rounded-sm leading-tight shadow-sm ${bgClass}`}>
            {p.statusToday}
          </span>
          <div className="flex flex-col gap-0.5 mt-1">
            <span className="text-[11px] font-bold text-slate-800">{diffDays} Hari</span>
            <span className="text-[10px] text-slate-500">{dateRange}</span>
            <span className="text-[10px] font-semibold text-[#1A4BC4] mt-0.5 border-t border-slate-200 pt-0.5">
              Masuk: {tKembaliStr}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className={`w-full py-1.5 px-2 text-center text-white text-xs font-bold rounded-sm leading-tight shadow-sm ${bgClass}`}>
        {durasiText}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* TOP ROW: Filters, Charts, Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Filters */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 h-full">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-[#1A4BC4]" /> Filter
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Pilih Tanggal</label>
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-sm font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A4BC4]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Cari Personil</label>
                <input 
                  type="text"
                  placeholder="Ketik Nama..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="w-full text-sm font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A4BC4]/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="col-span-1 lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden pt-4 pb-2 relative flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 right-0 bg-[#0f172a] text-white text-xs font-bold px-4 py-2 z-10 shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Overall
            </div>
            <div className="mt-8">
              <Chart options={createDonutOptions('')} series={[overallStats.hadir, overallStats.total - overallStats.hadir]} type="donut" height="200" />
            </div>
            <div className="absolute bottom-3 right-4 text-sm font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-xl shadow-sm border border-blue-200">
              {overallStats.percentage}%
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden pt-4 pb-2 relative flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 right-0 bg-[#0f172a] text-white text-xs font-bold px-4 py-2 z-10 shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> TKO
            </div>
            <div className="mt-8">
              <Chart options={createDonutOptions('')} series={[tkoStats.hadir, tkoStats.total - tkoStats.hadir]} type="donut" height="200" />
            </div>
            <div className="absolute bottom-3 right-4 text-sm font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-xl shadow-sm border border-blue-200">
              {tkoStats.percentage}%
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden pt-4 pb-2 relative flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 right-0 bg-[#0f172a] text-white text-xs font-bold px-4 py-2 z-10 shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span> TKNO
            </div>
            <div className="mt-8">
              <Chart options={createDonutOptions('')} series={[tknoStats.hadir, tknoStats.total - tknoStats.hadir]} type="donut" height="200" />
            </div>
            <div className="absolute bottom-3 right-4 text-sm font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-xl shadow-sm border border-blue-200">
              {tknoStats.percentage}%
            </div>
          </div>
        </div>

        {/* Scorecard full grid */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 bg-[#0f172a] text-white text-xs font-bold px-4 py-2 z-10 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-300" /> Rekapitulasi Kehadiran
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Total: {filteredData.length}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3 p-4 mt-8">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xl font-black text-slate-800 leading-none">{scoreCounts.Hadir}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Hadir</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100">
              <UserX className="w-5 h-5 text-red-500 mb-1" />
              <span className="text-xl font-black text-slate-800 leading-none">{scoreCounts.Off}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Off</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100">
              <GraduationCap className="w-5 h-5 text-green-500 mb-1" />
              <span className="text-xl font-black text-slate-800 leading-none">{scoreCounts.Training}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Training</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Calendar className="w-5 h-5 text-yellow-500 mb-1" />
              <span className="text-xl font-black text-slate-800 leading-none">{scoreCounts.Cuti}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Cuti</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Info className="w-5 h-5 text-amber-700 mb-1" />
              <span className="text-xl font-black text-slate-800 leading-none">{scoreCounts.Izin}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Izin</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Stethoscope className="w-5 h-5 text-slate-500 mb-1" />
              <span className="text-xl font-black text-slate-800 leading-none">{scoreCounts.Sakit}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Sakit</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Hospital className="w-5 h-5 text-purple-500 mb-1" />
              <span className="text-xl font-black text-slate-800 leading-none">{scoreCounts.Referral}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Referral</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <PlaneTakeoff className="w-5 h-5 text-orange-500 mb-1" />
              <span className="text-xl font-black text-slate-800 leading-none">{scoreCounts['Dinas Dalam Negeri']}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 leading-tight">Dinas<br/>Dalam</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <Globe className="w-5 h-5 text-black mb-1" />
              <span className="text-xl font-black text-slate-800 leading-none">{scoreCounts['Dinas Luar Negeri']}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 leading-tight">Dinas<br/>Luar</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Table Organik */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-[#0f172a] text-white text-sm font-bold px-5 py-3 shadow-sm">
            Tenaga Kerja Organik (TKO)
          </div>
          <div className="overflow-auto max-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-bold w-12 text-center">No.</th>
                  <th className="py-3 px-4 font-bold">Nama</th>
                  <th className="py-3 px-4 font-bold">Bagian</th>
                  <th className="py-3 px-4 font-bold text-center w-28">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="4" className="text-center py-8 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Memuat Data...</td></tr> : 
                  organikData.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-500 font-medium">{i + 1}.</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-semibold">{getBagian(p)}</td>
                    <td className="py-2 px-4">
                      <div className={`w-full text-center py-1.5 text-white font-bold text-[11px] uppercase rounded-md tracking-wider shadow-sm ${p.statusToday === 'Hadir' ? 'bg-[#2563EB]' : 'bg-slate-400'}`}>
                        {p.statusToday}
                      </div>
                    </td>
                  </tr>
                ))}
                {organikData.length === 0 && !loading && (
                  <tr><td colSpan="4" className="text-center py-6 text-slate-400 text-sm">Tidak ada data TKO</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Non Organik */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-[#1E293B] text-white text-sm font-bold px-5 py-3 shadow-sm">
            Tenaga Kerja Non Organik (TKNO)
          </div>
          <div className="overflow-auto max-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-bold w-12 text-center">No.</th>
                  <th className="py-3 px-4 font-bold">Nama</th>
                  <th className="py-3 px-4 font-bold">Bagian</th>
                  <th className="py-3 px-4 font-bold text-center w-28">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="4" className="text-center py-8 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Memuat Data...</td></tr> : 
                  nonOrganikData.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-500 font-medium">{i + 1}.</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-semibold">{getBagian(p)}</td>
                    <td className="py-2 px-4">
                      <div className={`w-full text-center py-1.5 text-white font-bold text-[11px] uppercase rounded-md tracking-wider shadow-sm ${p.statusToday === 'Hadir' ? 'bg-[#2563EB]' : 'bg-slate-400'}`}>
                        {p.statusToday}
                      </div>
                    </td>
                  </tr>
                ))}
                {nonOrganikData.length === 0 && !loading && (
                  <tr><td colSpan="4" className="text-center py-6 text-slate-400 text-sm">Tidak ada data TKNO</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Ketidakhadiran */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-[#EAB308] text-white text-sm font-bold px-5 py-3 shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Ketidakhadiran (Cuti, Izin, Sakit, Referral)
          </div>
          <div className="overflow-auto max-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-bold w-12 text-center">No.</th>
                  <th className="py-3 px-4 font-bold">Nama</th>
                  <th className="py-3 px-4 font-bold">Bagian</th>
                  <th className="py-3 px-4 font-bold text-center w-36">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="4" className="text-center py-8 text-slate-400">Memuat Data...</td></tr> : 
                  ketidakhadiranData.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 last:border-0 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-500 font-medium">{i + 1}.</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-semibold">{getBagian(p)}</td>
                    <td className="py-2 px-4">
                      {renderDurasiCell(p)}
                    </td>
                  </tr>
                ))}
                {ketidakhadiranData.length === 0 && !loading && (
                  <tr><td colSpan="4" className="text-center py-6 text-slate-400 text-sm">Semua personil hadir</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Penugasan */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-[#EA580C] text-white text-sm font-bold px-5 py-3 shadow-sm flex items-center gap-2">
            <PlaneTakeoff className="w-4 h-4" /> Penugasan Dinas (Dalam/Luar Negeri)
          </div>
          <div className="overflow-auto max-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-bold w-12 text-center">No.</th>
                  <th className="py-3 px-4 font-bold">Nama</th>
                  <th className="py-3 px-4 font-bold">Bagian</th>
                  <th className="py-3 px-4 font-bold text-center w-36">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="4" className="text-center py-8 text-slate-400">Memuat Data...</td></tr> : 
                  penugasanData.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 last:border-0 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-500 font-medium">{i + 1}.</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-semibold">{getBagian(p)}</td>
                    <td className="py-2 px-4">
                      {renderDurasiCell(p)}
                    </td>
                  </tr>
                ))}
                {penugasanData.length === 0 && !loading && (
                  <tr><td colSpan="4" className="text-center py-6 text-slate-400 text-sm">Tidak ada personil dinas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
