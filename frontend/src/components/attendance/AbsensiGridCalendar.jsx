import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { INDONESIA_HOLIDAYS, MOCK_STATUSES } from '../../constants/holidays';

export default function AbsensiGridCalendar({ employees = [], attendanceChanges = [], currentDate }) {
  const today = new Date();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // Create an array of days for the header
  const daysInMonth = Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1;
    const dateObj = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = !!INDONESIA_HOLIDAYS[dateStr];
    const isOff = isWeekend || isHoliday;

    return { day, dateStr, isOff, isToday: dateStr === today.toISOString().split('T')[0] };
  });

  // Build an optimized map for attendance
  // absenceMap[empId][dateStr] = status
  const absenceMap = useMemo(() => {
    const map = {};
    attendanceChanges.forEach((record) => {
      if (!record.start_date || !record.end_date) return;
      if (record.status_id === 1 || record.status_id === 2) return; // Skip hadir/libur explicit

      const start = new Date(record.start_date);
      const end = new Date(record.end_date);
      const status = MOCK_STATUSES.find((s) => s.id === record.status_id);

      if (!map[record.employee_id]) {
        map[record.employee_id] = {};
      }

      let cur = new Date(start);
      while (cur <= end) {
        if (cur.getFullYear() === year && cur.getMonth() === month) {
          const dateStr = cur.toISOString().split('T')[0];
          map[record.employee_id][dateStr] = status;
        }
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [attendanceChanges, year, month]);

  const getRank = (div, type, name) => {
    const str = `${div} ${type} ${name}`.toLowerCase();
    if (str.includes('vice president') || str.includes('vp')) return 1;
    if (str.includes('avp rot1') || (str.includes('avp') && str.includes('rotating 1'))) return 2;
    if (str.includes('avp rot2') || (str.includes('avp') && str.includes('rotating 2'))) return 3;
    if (str.includes('avp bengkel')) return 4;
    if (str.includes('avp metal')) return 5;
    if (str.includes('sekretaris')) return 6;
    if (str.includes('staff rotating 1') || str.includes('rotating 1')) return 7;
    if (str.includes('rotating 2') || str.includes('rotating2')) return 8;
    if (str.includes('bengkel')) return 9;
    if (str.includes('metal')) return 10;
    if (str.includes('qc')) return 11;
    return 99;
  };

  const isOrganic = (type) => {
    const str = (type || '').toLowerCase();
    if (str.includes('non') && (str.includes('organic') || str.includes('organik'))) return false;
    return true;
  };

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const rankA = getRank(a.division, a.employee_type, a.name);
      const rankB = getRank(b.division, b.employee_type, b.name);
      
      if (rankA !== rankB) return rankA - rankB;
      
      const divA = a.division || '';
      const divB = b.division || '';
      if (divA !== divB) return divA.localeCompare(divB);
      
      const orgA = isOrganic(a.employee_type);
      const orgB = isOrganic(b.employee_type);
      if (orgA !== orgB) return orgA ? -1 : 1;
      
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [employees]);

  let currentDivision = null;

  return (
    <div className="space-y-4">
      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm custom-scrollbar bg-white">
        <table className="w-full text-left border-collapse min-w-max text-[11px]">
          <thead>
            <tr>
              {/* Sticky Left Columns */}
              <th className="sticky left-0 z-30 bg-slate-800 text-white p-2 border border-slate-700 min-w-[150px]">Nama</th>
              <th className="sticky left-[150px] z-30 bg-slate-800 text-white p-2 border border-slate-700 min-w-[120px]">Bagian</th>
              <th className="sticky left-[270px] z-30 bg-slate-800 text-white p-2 border border-slate-700 min-w-[100px]">Status</th>
              <th className="sticky left-[370px] z-30 bg-slate-800 text-white p-2 border border-slate-700 min-w-[100px] border-r-4">NIK</th>

              {/* Date Columns */}
              {daysInMonth.map((d) => (
                <th
                  key={d.day}
                  className={`p-1.5 text-center border border-gray-300 min-w-[36px]
                    ${d.isOff ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-slate-100 text-slate-700'}
                  `}
                >
                  {d.day}/{month + 1}/{year.toString().slice(-2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((emp, index) => {
              const empAbsences = absenceMap[emp.id] || {};
              const org = isOrganic(emp.employee_type);
              const isEvenRow = index % 2 === 0;
              let rowBg = isEvenRow ? 'bg-white' : 'bg-slate-50';
              if (!org) {
                rowBg = isEvenRow ? 'bg-orange-50' : 'bg-orange-100/60';
              }

              const isNewDivision = currentDivision !== emp.division;
              if (isNewDivision) {
                currentDivision = emp.division;
              }

              return (
                <React.Fragment key={emp.id}>
                  {/* Division Header Row */}
                  {isNewDivision && (
                    <tr className="bg-slate-200/90 border-y border-slate-300">
                      <td 
                        colSpan={4 + totalDays} 
                        className="sticky left-0 z-20 py-0.5 px-3 font-extrabold text-slate-700 text-[10px] tracking-wider uppercase shadow-[1px_0_0_0_rgba(203,213,225,1)]"
                      >
                        {emp.division || 'Tanpa Bagian'}
                      </td>
                    </tr>
                  )}
                  
                  {/* Employee Data Row */}
                  <tr className="hover:bg-slate-100 transition-colors">
                  {/* Sticky Left Columns */}
                  <td className={`sticky left-0 z-10 p-2 border border-gray-300 font-semibold text-slate-800 ${rowBg}`}>
                    {emp.name} {!org && <span className="ml-1 text-[9px] px-1 py-0.5 bg-orange-200 text-orange-800 rounded">Non-Org</span>}
                  </td>
                  <td className={`sticky left-[150px] z-10 p-2 border border-gray-300 text-slate-700 ${rowBg}`}>
                    {emp.division}
                  </td>
                  <td className={`sticky left-[270px] z-10 p-2 border border-gray-300 text-slate-700 ${rowBg}`}>
                    {emp.employee_type}
                  </td>
                  <td className={`sticky left-[370px] z-10 p-2 border border-gray-300 border-r-4 text-slate-700 ${rowBg}`}>
                    {emp.npk}
                  </td>

                  {/* Date Cells */}
                  {daysInMonth.map((d) => {
                    let cellStatus = empAbsences[d.dateStr];
                    let cellCode = 'H'; // Default Hadir
                    let cellBgClass = 'bg-white text-slate-800';

                    if (cellStatus) {
                      cellCode = cellStatus.code;
                      cellBgClass = `${cellStatus.matrixBg} ${cellStatus.matrixText}`;
                    } else if (d.isOff) {
                      // Libur / Weekend -> code 'O'
                      cellCode = 'O';
                      const offStatus = MOCK_STATUSES.find(s => s.code === 'O');
                      if (offStatus) {
                        cellBgClass = `${offStatus.matrixBg} ${offStatus.matrixText}`;
                      } else {
                        cellBgClass = 'bg-red-600 text-white';
                      }
                    }

                    // Highlight today if empty/hadir
                    if (d.isToday && cellCode === 'H') {
                      cellBgClass = 'bg-blue-50 text-blue-800 font-bold border-blue-400';
                    }

                    return (
                      <td
                        key={d.day}
                        className={`p-1.5 text-center border border-gray-300 font-bold ${cellBgClass}`}
                      >
                        {cellCode}
                      </td>
                    );
                  })}
                </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
