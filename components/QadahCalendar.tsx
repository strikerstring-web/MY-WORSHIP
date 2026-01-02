
import React, { useState, useMemo } from 'react';
import { UserData, PrayerStatus, QadaReminder, PrayerTimings, HealthPeriod } from '../types';
import { PRAYERS } from '../constants';

interface QadahCalendarProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  updatePrayerStatus: (date: string, prayer: any, status: PrayerStatus) => void;
  updateReminders: (reminders: QadaReminder[]) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const QadahCalendar: React.FC<QadahCalendarProps> = ({ state, updatePrayerStatus, updateReminders, setCurrentView, t }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

  const month = viewDate.getMonth(), year = viewDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const isDateInHayd = (dateStr: string): boolean => {
    const targetDate = new Date(dateStr).getTime();
    return state.healthPeriods.some(p => {
      const start = new Date(p.start).getTime();
      const end = p.end ? new Date(p.end).getTime() : new Date().getTime() + (100 * 365 * 24 * 60 * 60 * 1000);
      return targetDate >= start && targetDate <= end;
    });
  };

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDayOfMonth; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
    }
    return arr;
  }, [month, year]);

  const selectedDayLogs = selectedDate ? (state.prayerLogs[selectedDate] || { fajr: PrayerStatus.PENDING, dhuhr: PrayerStatus.PENDING, asr: PrayerStatus.PENDING, maghrib: PrayerStatus.PENDING, isha: PrayerStatus.PENDING }) : null;

  const handleStatus = (prayer: string, status: PrayerStatus) => {
    if (selectedDate) updatePrayerStatus(selectedDate, prayer as any, status);
  };

  const monthName = viewDate.toLocaleString('default', { month: 'short' });

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] animate-fade-up overflow-hidden">
      <div className="p-4 pt-10 pb-4 bg-[#064e3b] text-white flex items-center justify-between shrink-0 shadow-lg rounded-b-[32px]">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentView('dashboard')} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg"><i className="fas fa-chevron-left text-xs"></i></button>
          <h1 className="text-lg font-black tracking-tight">{t('qadah')}</h1>
        </div>
        <div className="text-[9px] font-black uppercase text-emerald-300 bg-white/5 px-2 py-1 rounded-lg border border-white/10">{monthName} {year}</div>
      </div>

      <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden justify-between">
        <div className="bg-white p-2.5 rounded-2xl border border-emerald-50 shadow-sm shrink-0">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-7 h-7 flex items-center justify-center text-emerald-900"><i className="fas fa-chevron-left text-[9px]"></i></button>
            <h2 className="text-xs font-black text-[#064e3b] uppercase tracking-widest">{monthName} {year}</h2>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-7 h-7 flex items-center justify-center text-emerald-900"><i className="fas fa-chevron-right text-[9px]"></i></button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[7px] text-center font-black text-slate-300">{d}</span>)}
            {days.map((dateStr, idx) => {
              if (!dateStr) return <div key={`empty-${idx}`} className="h-6" />;
              const isSelected = selectedDate === dateStr, isToday = dateStr === new Date().toISOString().split('T')[0], dayNum = dateStr.split('-')[2];
              const h = isDateInHayd(dateStr);
              return (
                <button key={dateStr} onClick={() => setSelectedDate(dateStr)} className={`h-6 rounded-md flex items-center justify-center text-[9px] font-black transition-all ${isSelected ? 'bg-emerald-600 text-white' : isToday ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : h ? 'bg-pink-50 text-pink-400' : 'bg-slate-50 text-slate-400'}`}>{parseInt(dayNum)}</button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="bg-white rounded-2xl p-3 shadow-md border border-emerald-50 flex-1 overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-[#064e3b] uppercase tracking-widest">{new Date(selectedDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} LOG</span>
              {isDateInHayd(selectedDate) && <span className="text-[7px] font-black text-pink-600 uppercase">EXCUSED</span>}
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1">
              {PRAYERS.map(prayer => {
                const s = isDateInHayd(selectedDate) ? PrayerStatus.EXCUSED : (selectedDayLogs?.[prayer] || PrayerStatus.PENDING);
                return (
                  <div key={prayer} className={`flex flex-col p-2 rounded-xl border ${s === PrayerStatus.COMPLETED ? 'bg-emerald-50 border-emerald-100' : s === PrayerStatus.MISSED ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="text-[8px] font-black text-[#064e3b] uppercase mb-1">{t(prayer)}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleStatus(prayer, s === PrayerStatus.COMPLETED ? PrayerStatus.PENDING : PrayerStatus.COMPLETED)} className={`flex-1 h-6 rounded flex items-center justify-center ${s === PrayerStatus.COMPLETED ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-300'}`} disabled={isDateInHayd(selectedDate)}><i className="fas fa-check text-[8px]"></i></button>
                      <button onClick={() => handleStatus(prayer, s === PrayerStatus.MISSED ? PrayerStatus.PENDING : PrayerStatus.MISSED)} className={`flex-1 h-6 rounded flex items-center justify-center ${s === PrayerStatus.MISSED ? 'bg-rose-500 text-white' : 'bg-white border text-slate-300'}`} disabled={isDateInHayd(selectedDate)}><i className="fas fa-times text-[8px]"></i></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QadahCalendar;
