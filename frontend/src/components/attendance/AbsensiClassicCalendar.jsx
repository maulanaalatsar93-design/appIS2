import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { INDONESIA_HOLIDAYS, MOCK_STATUSES } from '../../constants/holidays';

export default function AbsensiClassicCalendar({ employees = [], attendanceChanges = [], currentDate }) {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(null);
  const popupRef = useRef(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Monday-based (0=Mon)
  const totalDays = lastDayOfMonth.getDate();

  // Close popup on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setSelectedDay(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build map: dateStr -> list of absent employees
  const absenceMap = {};
  attendanceChanges.forEach((record) => {
    if (!record.start_date || !record.end_date) return;
    // Only count non-present statuses (not status 1 = hadir, not 2 = libur)
    if (record.status_id === 1 || record.status_id === 2) return;

    const start = new Date(record.start_date);
    const end = new Date(record.end_date);
    const emp = employees.find((e) => e.id === record.employee_id);
    if (!emp) return;
    const status = MOCK_STATUSES.find((s) => s.id === record.status_id);

    let cur = new Date(start);
    while (cur <= end) {
      const curYear = cur.getFullYear();
      const curMonth = cur.getMonth();
      // Only process dates in current viewed month
      if (curYear === year && curMonth === month) {
        const dateStr = cur.toISOString().split('T')[0];
        if (!absenceMap[dateStr]) absenceMap[dateStr] = [];
        absenceMap[dateStr].push({ emp, status, record });
      }
      cur.setDate(cur.getDate() + 1);
    }
  });

  const days = [];

  // Empty cells before first day
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[80px] md:min-h-[100px] border border-transparent" />);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = dateObj.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = !!INDONESIA_HOLIDAYS[dateStr];
    const isToday = dateStr === today.toISOString().split('T')[0];
    const absentList = absenceMap[dateStr] || [];
    const absentCount = absentList.length;

    let bgClass = 'bg-white hover:bg-slate-50';
    let textClass = 'text-slate-700';
    let borderClass = 'border-slate-100';

    if (isToday) {
      bgClass = 'bg-blue-50 bg-opacity-60 text-blue-800 shadow-sm ring-1 ring-blue-500 ring-offset-1';
      textClass = 'text-blue-800';
      borderClass = 'border-blue-400';
    } else if (isHoliday) {
      bgClass = 'bg-amber-50 hover:bg-amber-100';
      textClass = 'text-amber-700';
      borderClass = 'border-amber-200';
    } else if (isWeekend) {
      bgClass = 'bg-slate-50 hover:bg-slate-100';
      textClass = 'text-slate-400';
      borderClass = 'border-slate-100';
    }

    days.push(
      <div
        key={d}
        onClick={() => (absentCount > 0 ? setSelectedDay({ date: dateStr, records: absentList }) : undefined)}
        className={`relative min-h-[80px] md:min-h-[100px] rounded-xl border ${borderClass} ${bgClass} p-2 flex flex-col transition-all duration-150 ${absentCount > 0 ? 'cursor-pointer shadow-sm hover:shadow-md' : 'cursor-default'}`}
      >
        <span className={`text-[12px] md:text-[14px] font-bold leading-none mb-1 ${isToday ? 'text-ink' : textClass}`}>
          {d}
        </span>
        {isHoliday && !isToday && (
          <div className="text-[9px] text-amber-600 leading-tight mt-0.5 font-semibold hidden md:block">
            {INDONESIA_HOLIDAYS[dateStr].split(' ').slice(0, 3).join(' ')}
          </div>
        )}
        
        {/* Render up to 2 person badges directly in calendar */}
        <div className="mt-auto space-y-1 w-full overflow-hidden">
          {absentList.slice(0, 2).map((a, idx) => (
            <div key={idx} className={`text-[9px] font-medium px-1.5 py-0.5 rounded truncate ${a.status?.bg || 'bg-slate-100'} ${a.status?.color || 'text-slate-600'}`}>
              {a.emp?.name.split(' ')[0]} - {a.status?.name}
            </div>
          ))}
        </div>

        {absentCount > 2 && (
          <div className="mt-1 text-[9px] font-bold text-gray-500">
            +{absentCount - 2} lainnya
          </div>
        )}
      </div>
    );
  }

  const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-50 border border-blue-400 ring-1 ring-blue-500"></div>
          <span className="text-gray-500">Hari Ini</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-amber-100 border border-amber-200"></div>
          <span className="text-gray-500">Hari Libur Nasional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-slate-50 border border-slate-200"></div>
          <span className="text-gray-500">Weekend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-500">Jumlah Absen</span>
        </div>
      </div>

      {/* Grid header */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className={`text-center text-[11px] font-bold py-1.5 ${
              d === 'Sab' || d === 'Min' ? 'text-gray-500' : 'text-slate-500'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">{days}</div>

      {/* Summary for month */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
        <div className="text-[12px] font-semibold text-slate-600 mb-1.5">Ringkasan Bulan Ini</div>
        <div className="flex flex-wrap gap-3">
          <div className="text-[11px] text-gray-500">
            Total catatan absen bulan ini:{' '}
            <span className="font-bold text-red-500">
              {Object.values(absenceMap).reduce((acc, v) => acc + v.length, 0)}
            </span>
          </div>
          <div className="text-[11px] text-gray-500">
            Hari libur nasional:{' '}
            <span className="font-bold text-amber-600">
              {
                Object.keys(INDONESIA_HOLIDAYS).filter((k) =>
                  k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
                ).length
              }
            </span>
          </div>
        </div>
      </div>

      {/* Popup: Absen detail for selected day */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div ref={popupRef} className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#193B8F] to-[#0F2356] px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-ink font-bold text-[15px]">
                  {new Intl.DateTimeFormat('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(new Date(selectedDay.date + 'T00:00:00'))}
                </div>
                {INDONESIA_HOLIDAYS[selectedDay.date] && (
                  <div className="text-amber-300 text-[11px] mt-0.5 font-medium">
                    🎉 {INDONESIA_HOLIDAYS[selectedDay.date]}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <X size={14} className="text-ink" />
              </button>
            </div>
            <div className="px-5 py-3 border-b border-slate-100 bg-red-50">
              <span className="text-[12px] font-semibold text-red-600">
                {selectedDay.records.length} personil tidak hadir
              </span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto">
              {selectedDay.records.map((rec, idx) => (
                <div key={idx} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#193B8F] to-[#0F2356] flex items-center justify-center text-ink text-[11px] font-bold shrink-0">
                    {rec.emp?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink truncate">
                      {rec.emp?.name || 'Unknown'}
                    </div>
                    <div className="text-[11px] text-gray-500">{rec.emp?.division || '-'}</div>
                  </div>
                  <div className="shrink-0">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: (rec.status?.color || '#9AA3B2') + '22',
                        color: rec.status?.color || '#9AA3B2',
                      }}
                    >
                      {rec.status?.name || '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedDay(null)}
                className="w-full py-2 bg-navy-950 text-white text-[13px] font-semibold rounded-lg hover:bg-industrial-text transition-colors"
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
