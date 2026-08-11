import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function PdmCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOccurrences();
  }, [currentDate]);

  const fetchOccurrences = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(`${apiUrl}/api/pdm-schedule/occurrences?year=${year}&month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOccurrences(data);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlySchedule = async () => {
    if (!window.confirm('Generate jadwal otomatis untuk bulan ini?')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(`${apiUrl}/api/pdm-schedule/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ year, month })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchOccurrences();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error generating:', error);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar Grid generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getStatusColor = (status) => {
    switch(status) {
      case 'SCHEDULED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ON_HOLD': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            Kalender Jadwal PdM
          </h1>
          <p className="text-gray-500 text-sm mt-1">Lihat keseluruhan jadwal inspeksi bulanan</p>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={generateMonthlySchedule} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition font-medium text-sm">
            Generate Jadwal Bulan Ini
          </button>
          
          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-50 text-gray-600 border-r border-gray-200 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-2 font-medium text-gray-800 min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: idLocale })}
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-50 text-gray-600 border-l border-gray-200 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-7 bg-gray-200 gap-[1px]">
          {calendarDays.map((day, i) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const dayTasks = occurrences.filter(occ => isSameDay(parseISO(occ.effectiveDate), day));
            const isToday = isSameDay(day, new Date());

            return (
              <div key={i} className={`min-h-[120px] p-2 bg-white ${!isCurrentMonth ? 'opacity-50' : ''} ${isToday ? 'bg-blue-50/30' : ''}`}>
                <div className={`text-right text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1 overflow-y-auto max-h-[90px] pr-1 custom-scrollbar">
                  {dayTasks.map(task => (
                    <div key={task.id} className={`text-xs p-1.5 rounded border ${getStatusColor(task.status)} truncate flex items-center gap-1 cursor-default group relative`} title={`${task.rule?.code} - ${task.rule?.taskName}`}>
                      {task.wasShifted && <AlertCircle className="w-3 h-3 text-orange-500 shrink-0" />}
                      <span className="truncate">{task.rule?.code}</span>
                      
                      {/* Tooltip */}
                      <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg -top-2 left-full ml-2">
                        <p className="font-bold">{task.rule?.taskName}</p>
                        <p className="opacity-90">{task.rule?.pabrik?.nama_pabrik} - {task.rule?.subArea}</p>
                        <p className="mt-1 opacity-80">PIC: {task.assignedTo?.name || 'Belum ada'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
