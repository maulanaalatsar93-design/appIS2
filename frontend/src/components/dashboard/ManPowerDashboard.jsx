import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { differenceInDays, format, parseISO, addDays } from 'date-fns';
import { getManpowerList } from '../../services/dashboardService';
import { CheckCircle2, UserX, Calendar, Info, PlaneTakeoff, Globe, GraduationCap, Stethoscope, Loader2, Hospital, HardHat } from 'lucide-react';

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
    if ((pos.includes('VP') && !pos.includes('AVP')) || pos.includes('VICE PRESIDENT')) return 1;
    if (pos.includes('AVP')) return 2;
    return 3; // Staff and others
  };

  const getBagian = (p) => {
    const pos = (p.position || '').toUpperCase();
    if ((pos.includes('VP') && !pos.includes('AVP')) || pos.includes('VICE PRESIDENT')) return 'VP';
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
  const penugasanStatuses = ['Dinas Dalam Negeri', 'Dinas Luar Negeri', 'Training'];

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

  const CustomDonutChart = ({ title, series, labels, colors }) => {
    const total = series.reduce((a, b) => a + b, 0);
    const options = {
      chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans, sans-serif' },
      labels: labels,
      colors: colors,
      plotOptions: { 
        pie: { 
          donut: { 
            size: '60%',
            labels: {
              show: true,
              name: { show: false },
              value: {
                show: true,
                fontSize: '28px',
                fontWeight: 800,
                color: '#1e293b',
                offsetY: 8,
                formatter: function (val) { return val; }
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Total',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                }
              }
            }
          } 
        } 
      },
      dataLabels: { 
        enabled: true, 
        style: { fontSize: '12px', fontWeight: 'bold', colors: ['#ffffff', '#ffffff'] },
        dropShadow: { enabled: true, top: 1, left: 1, blur: 1, color: '#000', opacity: 0.45 }
      },
      legend: { show: false },
      stroke: { show: true, width: 3, colors: ['#ffffff'] },
      tooltip: {
        y: { formatter: (val) => `${val} Personil` },
        theme: 'light'
      }
    };

    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col h-full hover:shadow-md transition-shadow">
        <h3 className="text-[13px] font-bold text-slate-800 mb-4">{title}</h3>
        <div className="flex flex-col sm:flex-row items-center flex-1 gap-6">
          <div className="w-[220px] shrink-0">
            {total > 0 ? (
              <Chart options={options} series={series} type="donut" width="100%" height="230" />
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">N/A</div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 flex-1 w-full">
            {labels.map((label, idx) => {
              const val = series[idx];
              const pct = total > 0 ? ((val / total) * 100).toFixed(1).replace('.', ',') : 0;
              return (
                <div key={label} className="flex items-center justify-between py-2 px-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-md shrink-0 shadow-sm transition-transform group-hover:scale-110" style={{ backgroundColor: colors[idx] }}></div>
                    <span className="text-[11px] font-bold text-slate-700">{label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-800 leading-none">{val}</div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderStatusBadge = (p) => {
    let styleClass = 'bg-slate-100 text-slate-600 border border-slate-200';
    if (p.statusToday === 'Cuti') styleClass = 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    else if (p.statusToday === 'Izin') styleClass = 'bg-amber-50 text-amber-700 border border-amber-200';
    else if (p.statusToday === 'Sakit') styleClass = 'bg-rose-50 text-rose-600 border border-rose-200';
    else if (p.statusToday === 'Referral') styleClass = 'bg-purple-50 text-purple-600 border border-purple-200';
    else if (p.statusToday === 'Training') styleClass = 'bg-teal-50 text-teal-700 border border-teal-200';
    else if (p.statusToday === 'Dinas Dalam Negeri') styleClass = 'bg-orange-50 text-orange-700 border border-orange-200';
    else if (p.statusToday === 'Dinas Luar Negeri') styleClass = 'bg-[#193B8F]/10 text-[#193B8F] border border-[#193B8F]/20';
    else if (p.statusToday === 'Hadir') styleClass = 'bg-emerald-50 text-emerald-600 border border-emerald-200';

    return (
      <div className={`w-full text-center py-1.5 font-bold text-[11px] rounded-md shadow-sm-subtle ${styleClass}`}>
        {p.statusToday}
      </div>
    );
  };

  const renderDurasiCell = (p) => {
    if (p.absensi && p.absensi.tanggal_mulai && p.absensi.tanggal_selesai) {
      const tMulai = parseISO(p.absensi.tanggal_mulai);
      const tSelesai = parseISO(p.absensi.tanggal_selesai);
      const tKembali = addDays(tSelesai, 1);
      
      const tMulaiStr = format(tMulai, 'dd MMM');
      const tSelesaiStr = format(tSelesai, 'dd MMM');
      const tKembaliStr = format(tKembali, 'dd MMM yyyy');
      
      const dateRange = tMulaiStr === tSelesaiStr ? tMulaiStr : `${tMulaiStr} - ${tSelesaiStr}`;
      const diffDays = p.absensi.durasi_kerja !== undefined ? p.absensi.durasi_kerja : differenceInDays(tSelesai, tMulai) + 1;

      return (
        <div className="flex flex-col text-center mt-1">
          <span className="text-xs font-bold text-slate-800">{diffDays} Hari</span>
          <span className="text-[10px] text-gray-500">{dateRange}</span>
          <div className="mt-1.5 pt-1.5 border-t border-slate-100">
            <span className="text-[10px] font-bold text-navy-600">Masuk: {tKembaliStr}</span>
          </div>
        </div>
      );
    }
    return <span className="text-xs text-gray-500">-</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* TOP ROW: Filters, Charts, Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Filters */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-full">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-[#1A4BC4]" /> Filter
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Pilih Tanggal</label>
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-sm font-medium border border-slate-200 rounded-2xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A4BC4]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Cari Personil</label>
                <input 
                  type="text"
                  placeholder="Ketik Nama..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="w-full text-sm font-medium border border-slate-200 rounded-2xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A4BC4]/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Premium Charts */}
        <div className="col-span-1 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomDonutChart 
            title="Tingkat Kehadiran Hari Ini" 
            series={[overallStats.hadir, overallStats.total - overallStats.hadir]} 
            labels={['Hadir', 'Tidak Hadir']} 
            colors={['#168477', '#FF7410']} // Green for hadir, Orange for absen
          />
          <CustomDonutChart 
            title="Berdasarkan Tipe Karyawan" 
            series={[organikData.length, nonOrganikData.length]} 
            labels={['Organik', 'Non Organik']} 
            colors={['#193B8F', '#FF7410']} // Navy for organik, Orange for non-organik
          />
        </div>

        {/* Scorecard full grid */}
        <div className="col-span-1 lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
            <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#193B8F]" /> Rekapitulasi Kehadiran
            </h3>
            <span className="bg-white border border-slate-200 shadow-sm px-2.5 py-0.5 rounded-md text-[10px] font-bold text-slate-600">Total: {filteredData.length}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3 p-4 flex-1">
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-navy-600 mb-1" />
              <span className="text-xl font-display font-black text-slate-800 leading-none">{scoreCounts.Hadir}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Hadir</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <UserX className="w-5 h-5 text-red-500 mb-1" />
              <span className="text-xl font-display font-black text-slate-800 leading-none">{scoreCounts.Off}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Off</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <GraduationCap className="w-5 h-5 text-green-500 mb-1" />
              <span className="text-xl font-display font-black text-slate-800 leading-none">{scoreCounts.Training}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Training</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <Calendar className="w-5 h-5 text-yellow-500 mb-1" />
              <span className="text-xl font-display font-black text-slate-800 leading-none">{scoreCounts.Cuti}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Cuti</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <Info className="w-5 h-5 text-amber-700 mb-1" />
              <span className="text-xl font-display font-black text-slate-800 leading-none">{scoreCounts.Izin}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Izin</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <Stethoscope className="w-5 h-5 text-gray-500 mb-1" />
              <span className="text-xl font-display font-black text-slate-800 leading-none">{scoreCounts.Sakit}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Sakit</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <Hospital className="w-5 h-5 text-purple-500 mb-1" />
              <span className="text-xl font-display font-black text-slate-800 leading-none">{scoreCounts.Referral}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Referral</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <PlaneTakeoff className="w-5 h-5 text-orange-500 mb-1" />
              <span className="text-xl font-display font-black text-slate-800 leading-none">{scoreCounts['Dinas Dalam Negeri']}</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase mt-1 leading-tight">Dinas<br/>Dalam</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <Globe className="w-5 h-5 text-black mb-1" />
              <span className="text-xl font-display font-black text-slate-800 leading-none">{scoreCounts['Dinas Luar Negeri']}</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase mt-1 leading-tight">Dinas<br/>Luar</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Table Organik */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-300 flex items-center justify-center shadow-sm">
              <HardHat className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-[13px] font-bold text-slate-800">Tenaga Kerja Organik (TKO)</h3>
          </div>
          <div className="overflow-auto max-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-bold w-12 text-center">No.</th>
                  <th className="py-3 px-4 font-bold">Nama</th>
                  <th className="py-3 px-4 font-bold">NPK</th>
                  <th className="py-3 px-4 font-bold">Bagian</th>
                  <th className="py-3 px-4 font-bold text-center w-28">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan="5" className="text-center py-8 text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Memuat Data...</td></tr> : 
                  organikData.map((p, i) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">{i + 1}.</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs font-mono">{p.npk || '-'}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-semibold">{getBagian(p)}</td>
                    <td className="py-2 px-4">
                      {renderStatusBadge(p)}
                    </td>
                  </tr>
                ))}
                {organikData.length === 0 && !loading && (
                  <tr><td colSpan="4" className="text-center py-6 text-gray-500 text-sm">Tidak ada data TKO</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Non Organik */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center shadow-sm">
              <HardHat className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="text-[13px] font-bold text-slate-800">Tenaga Kerja Non Organik (TKNO)</h3>
          </div>
          <div className="overflow-auto max-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-bold w-12 text-center">No.</th>
                  <th className="py-3 px-4 font-bold">Nama</th>
                  <th className="py-3 px-4 font-bold">NPK</th>
                  <th className="py-3 px-4 font-bold">Bagian</th>
                  <th className="py-3 px-4 font-bold text-center w-28">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan="5" className="text-center py-8 text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Memuat Data...</td></tr> : 
                  nonOrganikData.map((p, i) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">{i + 1}.</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs font-mono">{p.npk || '-'}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-semibold">{getBagian(p)}</td>
                    <td className="py-2 px-4">
                      {renderStatusBadge(p)}
                    </td>
                  </tr>
                ))}
                {nonOrganikData.length === 0 && !loading && (
                  <tr><td colSpan="4" className="text-center py-6 text-gray-500 text-sm">Tidak ada data TKNO</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Ketidakhadiran */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#193B8F]" /> 
              <h3 className="text-[13px] font-bold text-slate-800">Ketidakhadiran</h3>
            </div>
            <p className="text-[10px] font-medium text-slate-500 mt-0.5 ml-6">
              (Cuti, Izin, Sakit, Referral)
            </p>
          </div>
          <div className="overflow-auto max-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-bold w-12 text-center">No.</th>
                  <th className="py-3 px-4 font-bold">Nama</th>
                  <th className="py-3 px-4 font-bold">NPK</th>
                  <th className="py-3 px-4 font-bold">Bagian</th>
                  <th className="py-3 px-4 font-bold text-center w-28">Status</th>
                  <th className="py-3 px-4 font-bold text-center w-36">Durasi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="6" className="text-center py-8 text-gray-500">Memuat Data...</td></tr> : 
                  ketidakhadiranData.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 last:border-0 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">{i + 1}.</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs font-mono">{p.npk || '-'}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-semibold">{getBagian(p)}</td>
                    <td className="py-2 px-4">
                      {renderStatusBadge(p)}
                    </td>
                    <td className="py-2 px-4">
                      {renderDurasiCell(p)}
                    </td>
                  </tr>
                ))}
                {ketidakhadiranData.length === 0 && !loading && (
                  <tr><td colSpan="5" className="text-center py-6 text-gray-500 text-sm">Semua personil hadir</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Penugasan */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <PlaneTakeoff className="w-4 h-4 text-[#FF7410]" /> 
              <h3 className="text-[13px] font-bold text-slate-800">Penugasan Kerja</h3>
            </div>
            <p className="text-[10px] font-medium text-slate-500 mt-0.5 ml-6">
              (Menampilkan karyawan yang sedang Dinas Dalam/Luar Negeri/Training)
            </p>
          </div>
          <div className="overflow-auto max-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-bold w-12 text-center">No.</th>
                  <th className="py-3 px-4 font-bold">Nama</th>
                  <th className="py-3 px-4 font-bold">NPK</th>
                  <th className="py-3 px-4 font-bold">Bagian</th>
                  <th className="py-3 px-4 font-bold text-center w-36">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan="5" className="text-center py-8 text-gray-500">Memuat Data...</td></tr> : 
                  penugasanData.map((p, i) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">{i + 1}.</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs font-mono">{p.npk || '-'}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-semibold">{getBagian(p)}</td>
                    <td className="py-2 px-4">
                      {renderDurasiCell(p)}
                    </td>
                  </tr>
                ))}
                {penugasanData.length === 0 && !loading && (
                  <tr><td colSpan="4" className="text-center py-6 text-gray-500 text-sm">Tidak ada personil dinas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}


