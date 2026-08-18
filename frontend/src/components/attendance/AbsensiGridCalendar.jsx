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

  return (
    <div className="space-y-4">
      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm custom-scrollbar bg-white">
        <table className="w-full text-left border-collapse min-w-max text-[11px]">
          <thead>
            <tr>
              {/* Sticky Left Columns */}
              <th className="sticky left-0 z-20 bg-blue-600 text-white p-2 border border-blue-700 min-w-[150px]">Nama</th>
              <th className="sticky left-[150px] z-20 bg-blue-600 text-white p-2 border border-blue-700 min-w-[120px]">Bagian</th>
              <th className="sticky left-[270px] z-20 bg-blue-600 text-white p-2 border border-blue-700 min-w-[100px]">Status</th>
              <th className="sticky left-[370px] z-20 bg-blue-600 text-white p-2 border border-blue-700 min-w-[100px] border-r-4">NIK</th>

              {/* Date Columns */}
              {daysInMonth.map((d) => (
                <th
                  key={d.day}
                  className={`p-1.5 text-center border border-gray-300 min-w-[36px]
                    ${d.isOff ? 'bg-red-500 text-white' : 'bg-blue-200 text-blue-900'}
                  `}
                >
                  {d.day}/{month + 1}/{year.toString().slice(-2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, index) => {
              const empAbsences = absenceMap[emp.id] || {};
              const isEvenRow = index % 2 === 0;
              const rowBg = isEvenRow ? 'bg-white' : 'bg-slate-50';

              return (
                <tr key={emp.id} className="hover:bg-slate-100 transition-colors">
                  {/* Sticky Left Columns */}
                  <td className={`sticky left-0 z-10 p-2 border border-gray-300 font-semibold text-slate-800 ${rowBg}`}>
                    {emp.name}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
