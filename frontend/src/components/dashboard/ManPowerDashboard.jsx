import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { differenceInDays, format, parseISO } from 'date-fns';
import { getManpowerList } from '../../services/dashboardService';
import { CheckCircle2, UserX, Calendar, Info, PlaneTakeoff, Globe, GraduationCap, Stethoscope, Loader2 } from 'lucide-react';

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

  const filteredData = manpowerData.filter(p => p.name.toLowerCase().includes(nameFilter.toLowerCase()));

  // Segmentation
  const organikData = filteredData.filter(p => p.employee_type?.toLowerCase().includes('organik') && !p.employee_type?.toLowerCase().includes('non'));
  const nonOrganikData = filteredData.filter(p => p.employee_type?.toLowerCase().includes('non organik'));
  const notHadirData = filteredData.filter(p => p.statusToday !== 'Hadir');

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
    'Dinas Dalam Negeri': filteredData.filter(p => p.statusToday === 'Dinas Dalam Negeri').length,
    'Dinas Luar Negeri': filteredData.filter(p => p.statusToday === 'Dinas Luar Negeri').length,
    Training: filteredData.filter(p => p.statusToday === 'Training').length,
    Off: filteredData.filter(p => p.statusToday === 'Libur Akhir Pekan' || p.statusToday === 'Libur Nasional').length,
    Cuti: filteredData.filter(p => p.statusToday === 'Cuti').length,
    Izin: filteredData.filter(p => p.statusToday === 'Izin').length,
    Sakit: filteredData.filter(p => p.statusToday === 'Sakit').length,
  };

  // Chart configuration generator
  const createDonutOptions = (title) => ({
    chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans, sans-serif' },
    title: { 
      text: title, 
      align: 'left',
      style: { color: '#ffffff', fontSize: '13px', fontWeight: 'bold' },
      background: '#3B82F6',
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* TOP ROW: Filters, Charts, Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Filters */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4" /> Filter
            </h3>
            <div className="space-y-3">
              <div>
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <input 
                  type="text"
                  placeholder="Cari Nama..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="col-span-1 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden pt-4 pb-2 relative flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10 shadow-sm">Overall</div>
            <Chart options={createDonutOptions('')} series={[overallStats.hadir, overallStats.total - overallStats.hadir]} type="donut" height="220" />
            <div className="absolute bottom-2 right-4 text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded-lg">
              {overallStats.percentage}%
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden pt-4 pb-2 relative flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10 shadow-sm">TKO</div>
            <Chart options={createDonutOptions('')} series={[tkoStats.hadir, tkoStats.total - tkoStats.hadir]} type="donut" height="220" />
            <div className="absolute bottom-2 right-4 text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded-lg">
              {tkoStats.percentage}%
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden pt-4 pb-2 relative flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10 shadow-sm">TKNO</div>
            <Chart options={createDonutOptions('')} series={[tknoStats.hadir, tknoStats.total - tknoStats.hadir]} type="donut" height="220" />
            <div className="absolute bottom-2 right-4 text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded-lg">
              {tknoStats.percentage}%
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="col-span-1 lg:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative">
          <div className="absolute top-0 left-0 bg-orange-400 text-white text-xs font-bold px-4 py-1.5 rounded-br-lg z-10 shadow-sm">
            Keterangan
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-8 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#254BA0]"></div> Hadir</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Training</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Sakit</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Dinas D. Negri</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#EAB308]"></div> Cuti</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600"></div> Off</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-black"></div> Dinas L. Negri</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-800"></div> Izin</div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Tables & Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Table Organik */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative pb-4">
          <div className="absolute top-0 left-0 bg-orange-400 text-white text-sm font-bold px-5 py-1.5 rounded-br-lg z-10 shadow-sm">
            Tenaga Organic
          </div>
          <div className="overflow-auto mt-10 max-h-[400px]">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-2 px-3 font-semibold w-10 text-center">No.</th>
                  <th className="py-2 px-3 font-semibold">Nama</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">Bagian</th>
                  <th className="py-2 px-3 font-semibold text-center">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="5" className="text-center py-4 text-slate-400">Loading...</td></tr> : 
                  organikData.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="py-2 px-3 text-center text-slate-500">{i + 1}.</td>
                    <td className="py-2 px-3 font-medium text-slate-800 truncate max-w-[100px]">{p.name}</td>
                    <td className="py-2 px-3 text-slate-600">TKO</td>
                    <td className="py-2 px-3 text-slate-600 truncate max-w-[80px]">{p.sub_area || p.nama_divisi}</td>
                    <td className="py-2 px-3">
                      <div className={`w-full text-center py-1 text-white font-bold text-[10px] uppercase rounded-sm tracking-wider ${p.statusToday === 'Hadir' ? 'bg-[#254BA0]' : 'bg-slate-400'}`}>
                        {p.statusToday}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Non Organik */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative pb-4">
          <div className="absolute top-0 left-0 bg-orange-400 text-white text-sm font-bold px-5 py-1.5 rounded-br-lg z-10 shadow-sm">
            Tenaga Non Organic
          </div>
          <div className="overflow-auto mt-10 max-h-[400px]">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-2 px-3 font-semibold w-10 text-center">No.</th>
                  <th className="py-2 px-3 font-semibold">Nama</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">Bagian</th>
                  <th className="py-2 px-3 font-semibold text-center">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="5" className="text-center py-4 text-slate-400">Loading...</td></tr> : 
                  nonOrganikData.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="py-2 px-3 text-center text-slate-500">{i + 1}.</td>
                    <td className="py-2 px-3 font-medium text-slate-800 truncate max-w-[100px]">{p.name}</td>
                    <td className="py-2 px-3 text-slate-600">TKNO</td>
                    <td className="py-2 px-3 text-slate-600 truncate max-w-[80px]">{p.sub_area || p.nama_divisi}</td>
                    <td className="py-2 px-3">
                      <div className={`w-full text-center py-1 text-white font-bold text-[10px] uppercase rounded-sm tracking-wider ${p.statusToday === 'Hadir' ? 'bg-[#254BA0]' : 'bg-slate-400'}`}>
                        {p.statusToday}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
          {/* Table Izin / Cuti */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative pb-4 flex-1 min-h-[220px]">
            <div className="absolute top-0 left-0 bg-orange-400 text-white text-sm font-bold px-5 py-1.5 rounded-br-lg z-10 shadow-sm">
              Izin / Cuti / Dinas
            </div>
            <div className="overflow-auto mt-10 max-h-[170px]">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2 px-2 font-semibold w-8 text-center">No.</th>
                    <th className="py-2 px-2 font-semibold">Nama</th>
                    <th className="py-2 px-2 font-semibold">Status</th>
                    <th className="py-2 px-2 font-semibold text-center w-28">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan="4" className="text-center py-4 text-slate-400">Loading...</td></tr> : 
                    notHadirData.map((p, i) => {
                    let durasiText = p.statusToday;
                    if (p.absensi && p.absensi.tanggal_mulai && p.absensi.tanggal_selesai) {
                      const tMulai = parseISO(p.absensi.tanggal_mulai);
                      const tSelesai = parseISO(p.absensi.tanggal_selesai);
                      const diffDays = differenceInDays(tSelesai, tMulai) + 1;
                      
                      const tMulaiStr = format(tMulai, 'dd MMM');
                      const tSelesaiStr = format(tSelesai, 'dd MMM');
                      const dateRange = tMulaiStr === tSelesaiStr ? tMulaiStr : `${tMulaiStr} - ${tSelesaiStr}`;
                      
                      durasiText = (
                        <div className="flex flex-col text-center">
                          <span className="font-bold">{p.statusToday}</span>
                          <span className="text-[9px] font-medium mt-0.5">{diffDays} Hari</span>
                          <span className="text-[8px] mt-0.5 opacity-90">{dateRange}</span>
                        </div>
                      );
                    }

                    // Background color based on status
                    let bgClass = 'bg-slate-400';
                    if (p.statusToday === 'Cuti') bgClass = 'bg-[#EAB308]'; // Yellow 500
                    if (p.statusToday === 'Izin') bgClass = 'bg-amber-800';
                    if (p.statusToday === 'Sakit') bgClass = 'bg-slate-400';
                    if (p.statusToday === 'Training') bgClass = 'bg-green-500';
                    if (p.statusToday === 'Dinas Dalam Negeri') bgClass = 'bg-orange-500';
                    if (p.statusToday === 'Dinas Luar Negeri') bgClass = 'bg-black';

                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 last:border-0">
                        <td className="py-2 px-2 text-center text-slate-500">{i + 1}.</td>
                        <td className="py-2 px-2 font-medium text-slate-800 truncate max-w-[90px]">{p.name}</td>
                        <td className="py-2 px-2 text-slate-600">{p.employee_type?.toLowerCase().includes('non') ? 'TKNO' : 'TKO'}</td>
                        <td className="py-2 px-2 text-white px-1">
                          <div className={`w-full py-1 text-white text-[10px] rounded-sm leading-tight shadow-sm ${bgClass}`}>
                            {durasiText}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scorecard */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 relative shrink-0">
            <div className="absolute top-0 left-0 bg-orange-400 text-white text-sm font-bold px-5 py-1.5 rounded-br-lg z-10 shadow-sm">
              Scorecard
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 shadow-sm border border-green-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium">Hadir</span>
                  <span className="text-lg font-extrabold text-slate-800 leading-none">{scoreCounts.Hadir}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 shadow-sm border border-red-200">
                  <UserX className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium">Off</span>
                  <span className="text-lg font-extrabold text-slate-800 leading-none">{scoreCounts.Off}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 shadow-sm border border-orange-200">
                  <PlaneTakeoff className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Dinas Dalam</span>
                  <span className="text-lg font-extrabold text-slate-800 leading-none">{scoreCounts['Dinas Dalam Negeri']}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 shadow-sm border border-yellow-200">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium">Cuti</span>
                  <span className="text-lg font-extrabold text-slate-800 leading-none">{scoreCounts.Cuti}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
