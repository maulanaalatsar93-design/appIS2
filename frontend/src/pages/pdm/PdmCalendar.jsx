import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle, Zap, RefreshCw, Play, CheckCircle2, Users } from 'lucide-react';


const STATUS_STYLE = {
  SCHEDULED:   { bg: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' },
  ASSIGNED:    { bg: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  IN_PROGRESS: { bg: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  ON_HOLD:     { bg: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  COMPLETED:   { bg: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  OVERDUE:     { bg: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  CANCELLED:   { bg: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
};

export default function PdmCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [pabriks, setPabriks] = useState([]);
  const [filterPabrik, setFilterPabrik] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCriticality, setFilterCriticality] = useState('');

  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchOccurrences(); }, [currentDate, filterPabrik, filterStatus, filterCriticality]);
  useEffect(() => { fetchPabriks(); }, []);

  const fetchOccurrences = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ year: currentDate.getFullYear(), month: currentDate.getMonth() + 1 });
      if (filterPabrik) params.append('pabrik_id', filterPabrik);
      if (filterStatus) params.append('status', filterStatus);
      if (filterCriticality) params.append('criticality', filterCriticality);

      const res = await fetch(`${api}/api/pdm-schedule/occurrences?${params}`, { headers });
      if (res.ok) setOccurrences(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAction = async (action, id) => {
    const eps = { start: 'start', hold: 'hold', complete: 'complete', claim: 'claim' };
    try {
      const res = await fetch(`${api}/api/pdm-schedule/occurrences/${id}/${eps[action]}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) fetchOccurrences();
      else { const err = await res.json(); alert(err.error || 'Gagal'); }
    } catch (e) { console.error(e); }
  };

  const fetchPabriks = async () => {
    const res = await fetch(`${api}/api/dashboard/pabrik`, { headers });
    if (res.ok) setPabriks(await res.json());
  };

  const handleGenerate = async () => {
    if (!confirm('Generate jadwal otomatis untuk bulan ini?')) return;
    const res = await fetch(`${api}/api/pdm-schedule/generate`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: currentDate.getFullYear(), month: currentDate.getMonth() + 1 })
    });
    const data = await res.json();
    alert(data.message);
    fetchOccurrences();
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDay = (day) => {
    return occurrences.filter(occ => {
      const d = occ.scheduledDate ? new Date(occ.scheduledDate) : null;
      return d && isSameDay(d, day);
    });
  };

  const selectedDayTasks = selected ? getTasksForDay(selected) : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            Kalender PdM Rotating
          </h1>
          <p className="text-gray-500 text-sm mt-1">Jadwal inspeksi bulanan berdasarkan master schedule</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filters */}
          <select value={filterPabrik} onChange={e => setFilterPabrik(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">Semua Pabrik</option>
            {pabriks.map(p => <option key={p.id} value={p.id}>{p.nama_pabrik}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">Semua Status</option>
            {['SCHEDULED','ASSIGNED','IN_PROGRESS','ON_HOLD','COMPLETED','OVERDUE','CANCELLED'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filterCriticality} onChange={e => setFilterCriticality(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">Semua Kritikalitas</option>
            <option value="CRITICAL">Critical</option>
            <option value="NON_CRITICAL">Non Critical</option>
          </select>

          <button onClick={handleGenerate} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm hover:bg-blue-100 transition">
            <Zap className="w-4 h-4" /> Generate
          </button>

          {/* Month nav */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-gray-50 border-r border-gray-200">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="px-4 py-2 text-sm font-semibold text-gray-800 min-w-[130px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: idLocale })}
            </span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-gray-50 border-l border-gray-200">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar + Detail */}
      <div className="flex gap-4">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase border-r last:border-0 border-gray-100">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 bg-gray-100 gap-px">
            {calDays.map((day, i) => {
              const dayTasks = getTasksForDay(day);
              const inMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isSelected = selected && isSameDay(day, selected);
              return (
                <div
                  key={i}
                  onClick={() => setSelected(day)}
                  className={`min-h-[100px] p-2 bg-white cursor-pointer transition ${!inMonth ? 'opacity-40' : ''} ${isSelected ? 'ring-2 ring-blue-400 ring-inset' : 'hover:bg-blue-50/30'}`}
                >
                  <div className={`text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map(t => {
                      const now = new Date();
                      const late = !['COMPLETED','CANCELLED'].includes(t.status) && new Date(t.scheduledDate) < now;
                      const st = late ? 'OVERDUE' : t.status;
                      const style = STATUS_STYLE[st] || STATUS_STYLE.SCHEDULED;
                      return (
                        <div key={t.id} className={`text-xs px-1.5 py-0.5 rounded border truncate ${style.bg} flex items-center gap-1`}>
                          {t.wasShifted && <AlertTriangle className="w-2.5 h-2.5 shrink-0" />}
                          <span className="truncate">{t.rule?.code}</span>
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && <div className="text-xs text-blue-500 font-medium">+{dayTasks.length - 3} lagi</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail */}
        <div className="w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-700">
                {selected ? format(selected, 'EEEE, d MMMM', { locale: idLocale }) : 'Pilih tanggal'}
              </h3>
              <p className="text-xs text-gray-400">{selectedDayTasks.length} task</p>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto max-h-[500px]">
              {selectedDayTasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Tidak ada task</p>
              ) : selectedDayTasks.map(occ => {
                const now = new Date();
                const late = !['COMPLETED','CANCELLED'].includes(occ.status) && new Date(occ.scheduledDate) < now;
                const daysLate = late ? Math.floor((now - new Date(occ.scheduledDate)) / 86400000) : 0;
                const st = late && occ.status !== 'COMPLETED' ? 'OVERDUE' : occ.status;
                const style = STATUS_STYLE[st] || STATUS_STYLE.SCHEDULED;
                return (
                  <div key={occ.id} className="border border-gray-100 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{occ.rule?.code}</p>
                        <p className="text-xs text-gray-500">{occ.rule?.pabrik?.nama_pabrik} – {occ.rule?.subArea}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${style.bg}`}>{st}</span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p>Task: <span className="text-gray-700 font-medium">{occ.rule?.taskName}</span></p>
                      <p>PIC: <span className="text-gray-700 font-medium">{occ.assignedTo?.name || 'Belum ada'}</span></p>
                      {occ.wasShifted && <p className="text-orange-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Tanggal digeser (hari libur)</p>}
                      {daysLate > 0 && <p className="text-red-500 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Terlambat {daysLate} hari</p>}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className={`px-1.5 py-0.5 rounded ${occ.rule?.criticality === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        {occ.rule?.criticality === 'CRITICAL' ? 'Critical' : 'Non Critical'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{occ.rule?.equipmentCat}</span>
                    </div>
                    {/* Action Buttons */}
                    {occ.status === 'ASSIGNED' && (
                      <button onClick={() => handleAction('start', occ.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition">
                        <Play className="w-3 h-3" /> Mulai Kerjakan
                      </button>
                    )}
                    {occ.status === 'ON_HOLD' && (
                      <button onClick={() => handleAction('start', occ.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition">
                        <Play className="w-3 h-3" /> Lanjutkan
                      </button>
                    )}
                    {['IN_PROGRESS','ASSIGNED','ON_HOLD'].includes(occ.status) && (
                      <button onClick={() => handleAction('complete', occ.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition">
                        <CheckCircle2 className="w-3 h-3" /> Selesaikan
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
