import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import AbsensiClassicCalendar from './AbsensiClassicCalendar';
import AbsensiGridCalendar from './AbsensiGridCalendar';
import { MOCK_STATUSES } from '../../constants/holidays';

export default function AbsensiCalendar({ employees = [], attendanceChanges = [] }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [calendarMode, setCalendarMode] = useState('grid'); // 'classic' or 'grid'

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentDate);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <div className="space-y-4">
      {/* Unified Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm-subtle">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-sm"
          >
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          <h3 className="text-[15px] font-bold text-ink capitalize min-w-[160px] text-center">
            {monthName}
          </h3>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-sm"
          >
            <ChevronRight size={16} className="text-slate-600" />
          </button>
          
          <button
            onClick={goToToday}
            className="ml-2 text-[12px] font-semibold text-industrial-blue hover:text-industrial-navy bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200"
          >
            Hari Ini
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setCalendarMode('classic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              calendarMode === 'classic' ? 'bg-white text-industrial-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarIcon size={14} /> Mode Kalender
          </button>
          <button
            onClick={() => setCalendarMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              calendarMode === 'grid' ? 'bg-white text-industrial-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutGrid size={14} /> Mode Grid
          </button>
        </div>
      </div>

      {/* Grid Legend (Only shown in Grid Mode) */}
      {calendarMode === 'grid' && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-[11px] font-medium bg-white p-3 rounded-xl border border-slate-200 shadow-sm-subtle">
          <span className="font-bold text-slate-700 mr-2 border-r border-slate-300 pr-4">Legenda Status:</span>
          {MOCK_STATUSES.filter(s => s.code).map((status) => (
            <div key={status.id} className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold shadow-sm ${status.matrixBg} ${status.matrixText}`}>
                {status.code}
              </div>
              <span className="text-gray-600">{status.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Render Active View */}
      <div className="animate-in fade-in duration-300">
        {calendarMode === 'classic' ? (
          <AbsensiClassicCalendar 
            employees={employees} 
            attendanceChanges={attendanceChanges} 
            currentDate={currentDate} 
          />
        ) : (
          <AbsensiGridCalendar 
            employees={employees} 
            attendanceChanges={attendanceChanges} 
            currentDate={currentDate} 
          />
        )}
      </div>
    </div>
  );
}
