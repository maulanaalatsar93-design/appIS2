import React from 'react';
import Chart from 'react-apexcharts';
import { Users, CalendarDays, History, PieChart } from 'lucide-react';

const MetricCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  totalValue, 
  unit = "Orang",
  stat1Label,
  stat1Value,
  stat2Label,
  stat2Value,
  percentage, 
  gaugeLabel,
  bgGradient, 
  footerBg, 
  footerTextColor
}) => {
  const chartOptions = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: '60%' },
        track: { background: 'rgba(255,255,255,0.2)', strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: { offsetY: -5, color: '#fff', fontSize: '22px', fontWeight: 800, formatter: (val) => val + "%" }
        }
      }
    },
    fill: { colors: ['#ffffff'] },
    stroke: { lineCap: 'round' }
  };

  return (
    <div className={`rounded-2xl ${bgGradient} text-white flex flex-col justify-between overflow-hidden shadow-xl border border-white/10`}>
      <div className="p-5 pb-0">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 shadow-inner">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide uppercase">{title}</h3>
            <p className="text-[10px] text-white/70">{subtitle}</p>
          </div>
        </div>

        {/* Number */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-4xl font-display font-extrabold tracking-tight">{totalValue}</span>
          <span className="text-xs font-bold text-white/70">{unit}</span>
        </div>

        {/* Breakdown & Gauge */}
        <div className="flex justify-between items-end mt-1 relative">
          <div className="space-y-3 mb-4 z-10">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm" />
                <span className="text-[10px] font-medium text-white/80">{stat1Label}</span>
              </div>
              <div className="font-bold text-sm leading-none pl-3">{stat1Value} {unit}</div>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-sm" />
                <span className="text-[10px] font-medium text-white/80">{stat2Label}</span>
              </div>
              <div className="font-bold text-sm leading-none pl-3">{stat2Value} {unit}</div>
            </div>
          </div>
          
          <div className="w-32 relative -mr-3 -mb-1">
            <Chart options={chartOptions} series={[percentage]} type="radialBar" height={150} />
            <div className="absolute bottom-4 inset-x-0 text-center text-[9px] font-medium text-white/90 leading-tight">
              {gaugeLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`px-5 py-3 ${footerBg} flex justify-between items-center text-[10px] font-bold border-t border-white/5`}>
        <div className="flex items-center gap-1.5 opacity-80">
          <PieChart className="w-3.5 h-3.5" />
          <span>{stat1Label} / {stat2Label}</span>
        </div>
        <span className={footerTextColor}>{stat1Value} / {stat2Value} {unit}</span>
      </div>
    </div>
  );
};

export default function ManpowerScorecardGroup({ employees = [], attendanceChanges = [] }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const activeOrUpcomingCount = attendanceChanges.filter((a) => a.end_date >= todayStr).length;
  
  // Card 1 Calculations
  const totalEmployees = employees.length || 0;
  const organikCount = employees.filter(e => e.employee_type === 'Organik').length || 0;
  const nonOrganikCount = totalEmployees - organikCount;
  const organikPct = totalEmployees > 0 ? Math.round((organikCount / totalEmployees) * 100) : 0;

  // Card 2 Calculations
  const cutiActive = attendanceChanges.filter(a => a.status_id === 3 && a.end_date >= todayStr).length || 0;
  const nonCutiActive = activeOrUpcomingCount - cutiActive;
  const cutiActivePct = activeOrUpcomingCount > 0 ? Math.round((cutiActive / activeOrUpcomingCount) * 100) : 0;

  // Card 3 Calculations
  const totalRiwayat = attendanceChanges.length || 0;
  const hadirRiwayat = attendanceChanges.filter(a => a.status_id === 1).length || 0;
  const nonHadirRiwayat = totalRiwayat - hadirRiwayat;
  const hadirPct = totalRiwayat > 0 ? Math.round((hadirRiwayat / totalRiwayat) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <MetricCard
        icon={Users}
        title="SEMUA PERSONEL"
        subtitle="Total Personel Terdaftar"
        totalValue={totalEmployees}
        stat1Label="Organik"
        stat1Value={organikCount}
        stat2Label="Non Organik"
        stat2Value={nonOrganikCount}
        percentage={organikPct}
        gaugeLabel="Progress Organik Semua Personel"
        bgGradient="bg-gradient-to-br from-[#102257] to-[#0A1B3F]"
        footerBg="bg-[#07132B]"
        footerTextColor="text-[#60A5FA]" // blue-400
      />
      <MetricCard
        icon={CalendarDays}
        title="AKTIF / MENDATANG"
        subtitle="Total Catatan Absensi Aktif"
        totalValue={activeOrUpcomingCount}
        stat1Label="Cuti"
        stat1Value={cutiActive}
        stat2Label="Izin/Sakit"
        stat2Value={nonCutiActive}
        percentage={cutiActivePct}
        gaugeLabel="Progress Cuti Aktif/Mendatang"
        bgGradient="bg-gradient-to-br from-[#1A56DB] to-[#1E3A8A]"
        footerBg="bg-[#1E3A8A]"
        footerTextColor="text-[#93C5FD]" // blue-300
      />
      <MetricCard
        icon={History}
        title="TOTAL RIWAYAT"
        subtitle="Total Seluruh Riwayat Presensi"
        totalValue={totalRiwayat}
        stat1Label="Kehadiran"
        stat1Value={hadirRiwayat}
        stat2Label="Lainnya"
        stat2Value={nonHadirRiwayat}
        percentage={hadirPct}
        gaugeLabel="Progress Kehadiran Riwayat"
        bgGradient="bg-gradient-to-br from-[#EA580C] to-[#C2410C]"
        footerBg="bg-[#9A3412]"
        footerTextColor="text-[#FDBA74]" // orange-300
      />
    </div>
  );
}
